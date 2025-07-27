import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

// Define a type for the user profile from the database
interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  role: Database['public']['Enums']['user_role'];
  membership_type: string | null; // Using string as per DB schema
  membership_expires_at: string | null;
  created_at: string | null; // Add created_at for AdminUserManagement
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null; // Add userProfile to context
  loading: boolean;
  isAuthenticated: boolean;
  checkPaymentStatus: () => boolean;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  hasPermission: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null); // State for user profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error fetching session:', sessionError);
      }
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error fetching user profile:', profileError);
        }
        setUserProfile(profileData || null);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Re-fetch profile on auth state change (e.g., sign in/out, user update)
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profileData, error: profileError }) => {
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching user profile on auth state change:', profileError);
            }
            setUserProfile(profileData || null);
          });
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkPaymentStatus = () => {
    if (!userProfile) return false; // Use userProfile from state

    // Admin check
    if (userProfile.role === 'admin') {
      return true;
    }

    // Check membership type and expiry from userProfile
    if (userProfile.membership_type === 'lifetime' || userProfile.membership_type === 'agent') {
      return true;
    }
    if (userProfile.membership_type === 'annual' && userProfile.membership_expires_at) {
      const expiryDate = new Date(userProfile.membership_expires_at);
      return expiryDate > new Date(); // Check if not expired
    }

    return false;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
    setUserProfile(null); // Clear profile on sign out
  };

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('Login error:', error.message);
      throw error;
    }
    // Profile will be fetched by onAuthStateChange listener
  };

  const register = async (username: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username, // Pass username to raw_user_meta_data
        }
      }
    });
    if (error) {
      console.error('Registration error:', error.message);
      throw error;
    }

    // The handle_new_user function in Supabase should automatically create the profile
    // with username, email, role, and membership_type.
    // Based on the provided schema, handle_new_user sets membership_type to 'free'.
  };

  const hasPermission = (feature: string) => {
    if (!userProfile) return false;

    // Admin always has permission
    if (userProfile.role === 'admin') {
      return true;
    }

    // Check membership for specific features
    if (feature === 'chat' || feature === 'image' || feature === 'voice') {
      return checkPaymentStatus(); // All these features require payment status
    }
    
    return false; // Default to no permission
  };

  const value = {
    user,
    userProfile, // Provide userProfile
    loading,
    isAuthenticated: !!user,
    checkPaymentStatus,
    signOut,
    login,
    register,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};