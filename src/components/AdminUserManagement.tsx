import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Search, UserCheck, UserX, Crown, MessageSquare, Image, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Define UserProfile type based on Supabase profiles table
type UserProfile = Database['public']['Tables']['profiles']['Row'];

interface Props {
  users: UserProfile[]; // Now expects UserProfile from DB
  setUsers: React.Dispatch<React.SetStateAction<UserProfile[]>>;
}

const AdminUserManagement = ({ users, setUsers }: Props) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*'); // Fetch all profiles

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "加载用户失败",
          description: "无法从数据库获取用户列表",
          variant: "destructive"
        });
      } else {
        // For now, usage stats are still local, so merge them for display.
        // In a real app, usage would also be in DB or a separate service.
        const usersWithLocalUsage = data.map(user => {
          const chatUsage = parseInt(localStorage.getItem(`chat_usage_${user.id}`) || '0');
          const imageUsage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
          const voiceUsage = JSON.parse(localStorage.getItem(`nexusAi_voice_usage_${user.id}`) || '{"remaining": 10}');
          
          return {
            ...user,
            // Add a temporary 'usage' property for display, not part of DB schema
            usage: {
              chat: chatUsage,
              image: 10 - imageUsage.remaining,
              voice: 10 - voiceUsage.remaining
            }
          };
        });
        setUsers(usersWithLocalUsage as any); // Cast to any because of added 'usage' property
      }
    };

    fetchUsers();
  }, [setUsers]);

  useEffect(() => {
    const filtered = users.filter(user =>
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const deleteUser = async (userId: string) => {
    const confirmDelete = window.confirm("确定要删除该用户吗？此操作不可撤销！");
    if (!confirmDelete) return;

    try {
      // Delete user from auth.users (this will cascade delete from profiles if RLS is set up)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      if (authError) throw authError;

      // Clean up local storage data (if any remains after DB deletion)
      localStorage.removeItem(`chat_usage_${userId}`);
      localStorage.removeItem(`nexusAi_image_usage_${userId}`);
      localStorage.removeItem(`nexusAi_voice_usage_${userId}`);
      localStorage.removeItem(`chat_history_${userId}`);
      // localStorage.removeItem(`nexusAi_users`); // This was for mock data, should be removed eventually

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));

      toast({
        title: "删除成功",
        description: "用户及其相关数据已成功删除",
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "删除失败",
        description: error.message || "删除用户时发生错误",
        variant: "destructive"
      });
    }
  };

  const toggleMembershipStatus = async (userId: string, currentType: string | null) => {
    // Simple toggle: if not free, make free; otherwise, make lifetime.
    const newType = currentType === 'free' ? 'lifetime' : 'free'; 
    const newExpiry = newType === 'lifetime' ? null : new Date().toISOString(); // Lifetime has no expiry

    try {
      // Call the activate_membership function to update membership
      const { error } = await supabase.rpc('activate_membership', {
        p_user_id: userId,
        p_plan_id: newType === 'lifetime' ? 'e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6' : 'a0e1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5', // Use actual plan IDs
        p_order_id: null // No order ID for manual toggle
      });

      if (error) throw error;

      // Update local state to reflect change
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, membership_type: newType, membership_expires_at: newExpiry } : user
      ));

      toast({
        title: "会员状态更新成功",
        description: `用户会员状态已更新为 ${newType === 'lifetime' ? '永久会员' : '免费用户'}`,
      });
    } catch (error: any) {
      console.error('Error updating membership:', error);
      toast({
        title: "更新失败",
        description: error.message || "更新会员状态时发生错误",
        variant: "destructive"
      });
    }
  };

  const resetUserUsage = (userId: string) => {
    const confirmReset = window.confirm("确定要重置该用户的使用额度吗？");
    if (!confirmReset) return;

    // Reset all usage counters in local storage
    localStorage.setItem(`chat_usage_${userId}`, '0');
    localStorage.setItem(`nexusAi_image_usage_${userId}`, JSON.stringify({ remaining: 10 }));
    localStorage.setItem(`nexusAi_voice_usage_${userId}`, JSON.stringify({ remaining: 10 }));

    // Update local state to reflect reset usage (re-fetch or manually update)
    setUsers(prev => prev.map(user => {
      if (user.id === userId) {
        return {
          ...user,
          usage: { chat: 0, image: 0, voice: 0 } // Update the temporary usage property
        };
      }
      return user;
    }));

    toast({
      title: "重置成功",
      description: "用户使用额度已重置",
    });
  };

  const calculateTotalRevenue = () => {
    // This calculation is still based on local mock data.
    // For real revenue, you'd query the 'orders' table in Supabase.
    // Assuming lifetime is 399, annual is 99, agent is 1999
    return users.reduce((sum, user) => {
      if (user.membership_type === 'lifetime') return sum + 399;
      if (user.membership_type === 'annual') return sum + 99;
      if (user.membership_type === 'agent') return sum + 1999;
      return sum;
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-nexus-dark/50 p-4 rounded-xl border border-nexus-blue/20">
          <h3 className="text-lg font-bold text-nexus-cyan mb-2">总用户数</h3>
          <p className="text-2xl font-bold text-white">{users.length}</p>
        </div>
        
        <div className="bg-nexus-dark/50 p-4 rounded-xl border border-nexus-blue/20">
          <h3 className="text-lg font-bold text-nexus-cyan mb-2">付费用户</h3>
          <p className="text-2xl font-bold text-white">{users.filter(u => u.membership_type !== 'free').length}</p>
        </div>
        
        <div className="bg-nexus-dark/50 p-4 rounded-xl border border-nexus-blue/20">
          <h3 className="text-lg font-bold text-nexus-cyan mb-2">免费用户</h3>
          <p className="text-2xl font-bold text-white">{users.filter(u => u.membership_type === 'free').length}</p>
        </div>

        <div className="bg-nexus-dark/50 p-4 rounded-xl border border-nexus-blue/20">
          <h3 className="text-lg font-bold text-nexus-cyan mb-2">预估总收入</h3>
          <p className="text-2xl font-bold text-white">¥{calculateTotalRevenue()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="搜索用户..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
        />
        <Search className="h-5 w-5 text-white/50" />
      </div>

      {/* Users Table */}
      <div className="bg-nexus-dark/50 rounded-xl border border-nexus-blue/20 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-nexus-blue/30 hover:bg-nexus-blue/10">
              <TableHead className="text-white">用户信息</TableHead>
              <TableHead className="text-white">注册日期</TableHead>
              <TableHead className="text-white">会员状态</TableHead>
              <TableHead className="text-white">到期时间</TableHead>
              <TableHead className="text-white">使用统计</TableHead>
              <TableHead className="text-white">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id} className="border-nexus-blue/30 hover:bg-nexus-blue/10">
                <TableCell>
                  <div>
                    <div className="font-medium text-white">{user.username || user.email?.split('@')[0]}</div>
                    <div className="text-sm text-white/60">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell className="text-white">
                  {new Date(user.created_at || '').toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {user.membership_type === 'lifetime' ? (
                    <div className="flex items-center gap-2 text-yellow-500">
                      <Crown className="h-4 w-4" />
                      <span>永久会员</span>
                    </div>
                  ) : user.membership_type === 'annual' ? (
                    <div className="flex items-center gap-2 text-blue-400">
                      <Crown className="h-4 w-4" />
                      <span>年会员</span>
                    </div>
                  ) : user.membership_type === 'agent' ? (
                    <div className="flex items-center gap-2 text-orange-400">
                      <Crown className="h-4 w-4" />
                      <span>代理商</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-500">
                      <UserX className="h-4 w-4" />
                      <span>免费用户</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-white">
                  {user.membership_type === 'lifetime' || user.membership_type === 'agent' ? '永久' : 
                   user.membership_expires_at ? new Date(user.membership_expires_at).toLocaleDateString() : '-'}
                </TableCell>
                <TableCell>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3 text-nexus-cyan" />
                      <span className="text-white">{(user as any).usage?.chat || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Image className="h-3 w-3 text-nexus-cyan" />
                      <span className="text-white">{(user as any).usage?.image || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Volume2 className="h-3 w-3 text-nexus-cyan" />
                      <span className="text-white">{(user as any).usage?.voice || 0}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => toggleMembershipStatus(user.id, user.membership_type)}
                      size="sm"
                      variant={user.membership_type !== 'free' ? "destructive" : "default"}
                      className={user.membership_type !== 'free'
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-yellow-600 hover:bg-yellow-700"
                      }
                    >
                      {user.membership_type !== 'free' ? '取消会员' : '开通会员'}
                    </Button>
                    
                    <Button
                      onClick={() => resetUserUsage(user.id)}
                      size="sm"
                      variant="outline"
                      className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20"
                    >
                      重置额度
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-white/60">没有找到匹配的用户</p>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;