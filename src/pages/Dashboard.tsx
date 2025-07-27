
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import UserDashboard from '@/components/UserDashboard';
import AdminUserManagement from '@/components/AdminUserManagement';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  role: string;
  membership_type: string | null;
  membership_expires_at: string | null;
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setUserProfile(data);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-nexus-dark via-nexus-purple/20 to-nexus-dark flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAdmin = userProfile?.role === 'admin';
  const hasMembership = userProfile?.membership_type !== null;
  const isLifetime = userProfile?.membership_type === 'lifetime';
  const membershipExpiry = userProfile?.membership_expires_at ? new Date(userProfile.membership_expires_at) : null;
  const isExpired = membershipExpiry && membershipExpiry < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexus-dark via-nexus-purple/20 to-nexus-dark">
      <Navigation />
      <div className="container mx-auto px-6 py-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            欢迎回来，{userProfile?.email?.split('@')[0] || '未知用户'}！
          </h1>
          <p className="text-gray-400">
            {isAdmin ? '管理员' : '用户'} · {hasMembership ? (isLifetime ? '永久会员' : '年费会员') : '免费用户'}
          </p>
        </div>

        {/* 会员状态卡片 */}
        <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">会员状态</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-nexus-cyan mb-1">
                {isAdmin ? '管理员' : hasMembership ? '会员' : '免费用户'}
              </div>
              <div className="text-gray-400 text-sm">账户类型</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-nexus-cyan mb-1">
                {isLifetime ? '永久' : isExpired ? '已过期' : '有效'}
              </div>
              <div className="text-gray-400 text-sm">会员状态</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-nexus-cyan mb-1">
                {membershipExpiry ? membershipExpiry.toLocaleDateString() : '无'}
              </div>
              <div className="text-gray-400 text-sm">到期时间</div>
            </div>
          </div>
        </div>

        {/* 根据用户角色显示不同内容 */}
        {isAdmin ? <AdminUserManagement users={users} setUsers={setUsers} /> : <UserDashboard />}
      </div>
    </div>
  );
};

export default Dashboard;
