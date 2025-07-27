import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, MessageSquare, Image, Mic, Settings, LogOut, User, Crown } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userProfile, signOut } = useAuth(); // Get userProfile from AuthContext
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/chat', label: 'AI对话', icon: MessageSquare },
    { path: '/image', label: 'AI绘画', icon: Image },
    { path: '/voice', label: 'AI语音', icon: Mic }
  ];

  const getUserDisplayName = () => {
    if (!userProfile) return ''; // Use userProfile
    return userProfile.username || userProfile.email?.split('@')[0] || '未知用户';
  };

  const isVipUser = () => {
    if (!userProfile) return false; // Use userProfile

    // Admin check
    if (userProfile.role === 'admin') {
      return true;
    }

    // Membership check
    if (userProfile.membership_type === 'lifetime' || userProfile.membership_type === 'agent') {
      return true;
    }
    if (userProfile.membership_type === 'annual' && userProfile.membership_expires_at) {
      const expiryDate = new Date(userProfile.membership_expires_at);
      return expiryDate > new Date();
    }
    
    return false;
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0a0f1c]/95 via-[#1a1f2e]/95 to-[#0f1419]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              NENUX.AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-400/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-cyan-400/30">
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm text-white font-medium">
                      {getUserDisplayName()}
                    </span>
                    <span className="text-xs text-cyan-400 flex items-center">
                      <Crown className="h-3 w-3 mr-1" />
                      {isVipUser() ? '会员' : '免费用户'}
                    </span>
                  </div>
                </div>
                
                <Link to="/settings">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <Settings className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-gray-300 hover:text-white"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    登录
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white">
                    注册
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0f1c]/98 backdrop-blur-xl border-t border-white/10">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-400 border border-cyan-400/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            {user ? (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center space-x-3 px-4 py-2">
                  <Avatar className="h-10 w-10 border-2 border-cyan-400/30">
                    <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
                      {user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-white font-medium">
                      {getUserDisplayName()}
                    </div>
                    <div className="text-cyan-400 text-sm flex items-center">
                      <Crown className="h-3 w-3 mr-1" />
                      {isVipUser() ? '会员' : '免费用户'}
                    </div>
                  </div>
                </div>
                
                <Link
                  to="/settings"
                  className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span>设置</span>
                </Link>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span>退出登录</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/10 space-y-2">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="h-5 w-5 mr-2" />
                  登录
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg transition-all duration-300"
                  onClick={() => setIsOpen(false)}
                >
                  注册账号
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;