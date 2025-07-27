import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, CreditCard, Settings, UserCheck, UserPlus, LayoutDashboard, Menu } from 'lucide-react';
import Navigation from "@/components/Navigation";
import PaymentConfig from '@/components/PaymentConfig';
import AdminUserManagement from '@/components/AdminUserManagement'; // Import AdminUserManagement
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { useNavigate } from 'react-router-dom'; // Import useNavigate

// Define types for data fetched from Supabase
type UserProfile = Database['public']['Tables']['profiles']['Row'];
type Order = Database['public']['Tables']['orders']['Row']; // Use 'Order' type from DB

const Admin = () => {
  const { toast } = useToast();
  const { userProfile, loading: authLoading } = useAuth(); // Get userProfile and authLoading
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]); // State for users from DB
  const [paymentOrders, setPaymentOrders] = useState<Order[]>([]); // State for orders from DB
  const [searchTerm, setSearchTerm] = useState(''); // Keep for user search within AdminUserManagement
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Manual activation form
  const [activationIdentifier, setActivationIdentifier] = useState('');
  const [activationPlan, setActivationPlan] = useState<'annual' | 'lifetime' | 'agent'>('annual'); // Added agent plan
  
  useEffect(() => {
    if (!authLoading) {
      if (!userProfile || userProfile.role !== 'admin') {
        toast({
          title: "权限不足",
          description: "您没有访问管理员页面的权限。",
          variant: "destructive"
        });
        navigate('/dashboard'); // Redirect non-admin users
      }
    }
  }, [userProfile, authLoading, navigate, toast]);

  useEffect(() => {
    if (userProfile?.role === 'admin') { // Only fetch if user is admin
      // Fetch users from Supabase
      const fetchUsers = async () => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        if (error) {
          console.error('Error fetching users for Admin:', error);
          toast({ title: "加载用户失败", description: "无法获取用户列表", variant: "destructive" });
        } else {
          setUsers(data);
        }
      };

      // Fetch payment orders from Supabase
      const fetchPaymentOrders = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false }); // Order by latest
        if (error) {
          console.error('Error fetching payment orders for Admin:', error);
          toast({ title: "加载订单失败", description: "无法获取支付订单列表", variant: "destructive" });
        } else {
          setPaymentOrders(data);
        }
      };

      fetchUsers();
      fetchPaymentOrders();
    }
  }, [userProfile]); // Re-run when userProfile changes (e.g., after login)

  const handleManualActivation = async () => {
    if (!activationIdentifier) {
      toast({
        title: "错误",
        description: "请输入用户邮箱、账号或手机号",
        variant: "destructive"
      });
      return;
    }

    try {
      // First, try to find the user by email or username
      let targetUser: UserProfile | null = null;
      const { data: existingProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.eq.${activationIdentifier},username.eq.${activationIdentifier}`);

      if (fetchError) throw fetchError;

      if (existingProfiles && existingProfiles.length > 0) {
        targetUser = existingProfiles[0];
      } else {
        // If user not found, try to find by ID (if identifier is a UUID)
        if (activationIdentifier.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/)) {
          const { data: userById, error: idError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', activationIdentifier)
            .single();
          if (idError && idError.code !== 'PGRST116') throw idError;
          targetUser = userById;
        }
      }

      if (!targetUser) {
        // If user still not found, create a new user in auth.users and profiles
        // Note: This requires admin privileges for supabase.auth.admin.createUser
        const { data: newUserAuth, error: signUpError } = await supabase.auth.admin.createUser({
          email: activationIdentifier.includes('@') ? activationIdentifier : `${activationIdentifier}@temp.com`, // Use temp email if not email
          password: Math.random().toString(36).substring(2, 15), // Generate a random password
          email_confirm: true,
          user_metadata: { username: activationIdentifier.includes('@') ? activationIdentifier.split('@')[0] : activationIdentifier }
        });
        if (signUpError) throw signUpError;
        
        // Wait a bit for the handle_new_user trigger to run and profile to be created
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: createdProfile, error: createdProfileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newUserAuth.user.id)
          .single();
        if (createdProfileError) throw createdProfileError;
        targetUser = createdProfile;
      }

      if (!targetUser) {
        throw new Error("无法找到或创建用户。");
      }

      // Map activationPlan to actual plan_id from membership_plans table
      let planIdToActivate: string;
      if (activationPlan === 'annual') {
        planIdToActivate = 'a0e1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5';
      } else if (activationPlan === 'lifetime') {
        planIdToActivate = 'e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6';
      } else if (activationPlan === 'agent') {
        planIdToActivate = 'f5a6b7c8-d9e0-f1a2-b3c4-d5e6f7a8b9c0';
      } else {
        throw new Error("无效的会员类型。");
      }

      // Activate membership using the activate_membership function
      const { error: activateError } = await supabase.rpc('activate_membership', {
        p_user_id: targetUser.id,
        p_plan_id: planIdToActivate,
        p_order_id: null // No order ID for manual activation
      });

      if (activateError) throw activateError;

      setActivationIdentifier('');
      
      toast({
        title: "成功",
        description: `已为 ${targetUser.username || targetUser.email} 开通${activationPlan === 'annual' ? '年' : (activationPlan === 'lifetime' ? '永久' : '代理')}会员`,
      });

      // Re-fetch users to update the list
      const { data: updatedUsersData, error: updatedUsersError } = await supabase
        .from('profiles')
        .select('*');
      if (updatedUsersError) console.error('Error re-fetching users:', updatedUsersError);
      else setUsers(updatedUsersData);

    } catch (error: any) {
      console.error('Manual activation error:', error);
      toast({
        title: "操作失败",
        description: error.message || "手动开通会员时发生错误",
        variant: "destructive"
      });
    }
  };

  const approvePayment = async (orderId: string, userId: string, planType: string) => {
    try {
      // Map planType to actual plan_id from membership_plans table
      let planIdToActivate: string;
      if (planType === 'annual') {
        planIdToActivate = 'a0e1b2c3-d4e5-f6a7-b8c9-d0e1f2a3b4c5';
      } else if (planType === 'lifetime') {
        planIdToActivate = 'e1f2a3b4-c5d6-e7f8-a9b0-c1d2e3f4a5b6';
      } else if (planType === 'agent') {
        planIdToActivate = 'f5a6b7c8-d9e0-f1a2-b3c4-d5e6f7a8b9c0';
      } else {
        throw new Error("无效的会员类型。");
      }

      // Activate membership using the activate_membership function
      const { error: activateError } = await supabase.rpc('activate_membership', {
        p_user_id: userId,
        p_plan_id: planIdToActivate,
        p_order_id: orderId
      });
      if (activateError) throw activateError;

      toast({
        title: "支付已确认",
        description: `已为用户 ${userId.slice(0, 8)}... 开通会员权限`,
      });

      // Re-fetch orders and users to update the lists
      const { data: updatedOrdersData, error: updatedOrdersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (updatedOrdersError) console.error('Error re-fetching orders:', updatedOrdersError);
      else setPaymentOrders(updatedOrdersData);

      const { data: updatedUsersData, error: updatedUsersError } = await supabase
        .from('profiles')
        .select('*');
      if (updatedUsersError) console.error('Error re-fetching users:', updatedUsersError);
      else setUsers(updatedUsersData);

    } catch (error: any) {
      console.error('Approve payment error:', error);
      toast({
        title: "操作失败",
        description: error.message || "确认支付时发生错误",
        variant: "destructive"
      });
    }
  };

  const stats = {
    totalUsers: users.length,
    paidUsers: users.filter(u => u.membership_type !== 'free').length,
    pendingPayments: paymentOrders.filter(o => o.status === 'pending').length,
    totalRevenue: paymentOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.amount as any), 0) // Ensure amount is number
  };

  if (authLoading || !userProfile || userProfile.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e] flex items-center justify-center">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      <div className="flex">
        {/* 左侧仪表板导航 */}
        <div className="w-64 bg-[#1a2740] border-r border-[#203042]/60 min-h-screen pt-20">
          <div className="p-4">
            <h2 className="text-white font-bold text-lg mb-4 flex items-center">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              管理面板
            </h2>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'dashboard' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-[#203042]/60'
                }`}
              >
                <LayoutDashboard className="inline mr-2 h-4 w-4" />
                概览
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'users' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-[#203042]/60'
                }`}
              >
                <Users className="inline mr-2 h-4 w-4" />
                用户管理
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'payments' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-[#203042]/60'
                }`}
              >
                <CreditCard className="inline mr-2 h-4 w-4" />
                支付管理
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'manual' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-[#203042]/60'
                }`}
              >
                <UserPlus className="inline mr-2 h-4 w-4" />
                手动开通
              </button>
              <button
                onClick={() => setActiveTab('alipay')}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === 'alipay' 
                    ? 'bg-cyan-600 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-[#203042]/60'
                }`}
              >
                <Settings className="inline mr-2 h-4 w-4" />
                支付宝配置
              </button>
            </nav>
          </div>
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 p-6 pt-20">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">管理员后台</h1>
            <p className="text-gray-400">用户管理、支付处理与系统配置</p>
          </div>

          {/* 仪表板概览 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-[#1a2740] border-[#203042]/60">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">总用户数</CardTitle>
                    <Users className="h-4 w-4 text-cyan-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1a2740] border-[#203042]/60">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">付费用户</CardTitle>
                    <UserCheck className="h-4 w-4 text-green-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.paidUsers}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1a2740] border-[#203042]/60">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">待处理支付</CardTitle>
                    <CreditCard className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{stats.pendingPayments}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-[#1a2740] border-[#203042]/60">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white">总收入</CardTitle>
                    <Settings className="h-4 w-4 text-blue-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">¥{stats.totalRevenue}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* 用户管理 */}
          {activeTab === 'users' && (
            <AdminUserManagement users={users} setUsers={setUsers} />
          )}

          {/* 支付管理 */}
          {activeTab === 'payments' && (
            <Card className="bg-[#1a2740] border-[#203042]/60">
              <CardHeader>
                <CardTitle className="text-white">支付订单管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#203042]/60">
                        <th className="text-left py-3 px-4 text-white font-medium">用户ID</th>
                        <th className="text-left py-3 px-4 text-white font-medium">套餐</th>
                        <th className="text-left py-3 px-4 text-white font-medium">金额</th>
                        <th className="text-left py-3 px-4 text-white font-medium">支付方式</th>
                        <th className="text-left py-3 px-4 text-white font-medium">状态</th>
                        <th className="text-left py-3 px-4 text-white font-medium">时间</th>
                        <th className="text-left py-3 px-4 text-white font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentOrders.map(order => (
                        <tr key={order.id} className="border-b border-[#203042]/30">
                          <td className="py-3 px-4 text-white">{order.user_id?.slice(0, 8)}...</td>
                          <td className="py-3 px-4 text-white">
                            {order.order_type === 'annual' ? '年会员' : (order.order_type === 'lifetime' ? '永久会员' : '代理商')}
                          </td>
                          <td className="py-3 px-4 text-white">¥{order.amount}</td>
                          <td className="py-3 px-4 text-white">{order.payment_method || '未知'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              order.status === 'completed' ? 'bg-green-600 text-white' :
                              order.status === 'pending' ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {order.status === 'completed' ? '已完成' :
                               order.status === 'pending' ? '待处理' : '失败'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">
                            {new Date(order.created_at || '').toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {order.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => approvePayment(order.id, order.user_id || '', order.order_type || '')}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                确认支付
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 手动开通 */}
          {activeTab === 'manual' && (
            <Card className="bg-[#1a2740] border-[#203042]/60">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <UserPlus className="mr-2 h-5 w-5" />
                  手动开通会员
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="activationIdentifier" className="text-white">用户标识</Label>
                      <Input
                        id="activationIdentifier"
                        value={activationIdentifier}
                        onChange={(e) => setActivationIdentifier(e.target.value)}
                        placeholder="输入邮箱、账号或手机号"
                        className="bg-[#14202c] border-[#2e4258] text-white"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        支持邮箱地址、用户账号或手机号码
                      </p>
                    </div>
                    
                    <div>
                      <Label htmlFor="activationPlan" className="text-white">会员类型</Label>
                      <Select value={activationPlan} onValueChange={(value: 'annual' | 'lifetime' | 'agent') => setActivationPlan(value)}>
                        <SelectTrigger className="bg-[#14202c] border-[#2e4258] text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="annual">年会员 (¥99)</SelectItem>
                          <SelectItem value="lifetime">永久会员 (¥399)</SelectItem>
                          <SelectItem value="agent">代理商 (¥1999)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <Button 
                      onClick={handleManualActivation}
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      立即开通
                    </Button>
                  </div>
                </div>
                
                <div className="border-t border-[#203042]/60 pt-4">
                  <p className="text-gray-400 text-sm">
                    提示：支持邮箱、账号或手机号开通。如果用户不存在，系统将自动创建新用户并开通对应会员权限。
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 支付宝配置 */}
          {activeTab === 'alipay' && (
            <PaymentConfig />
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;