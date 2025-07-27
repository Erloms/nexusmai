import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { CheckCircle, Crown, Sparkles, Star, Zap, Users, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type MembershipPlan = Database['public']['Tables']['membership_plans']['Row'];

interface PlanDetail extends MembershipPlan {
  period: string;
}

const Payment = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlanType, setSelectedPlanType] = useState<'annual' | 'lifetime' | 'agent' | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [plans, setPlans] = useState<Record<string, PlanDetail>>({});

  useEffect(() => {
    const fetchMembershipPlans = async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching membership plans:', error);
        toast({
          title: "加载会员计划失败",
          variant: "destructive"
        });
      } else {
        const fetchedPlans: Record<string, PlanDetail> = {};
        data.forEach(plan => {
          fetchedPlans[plan.type] = {
            ...plan,
            price: plan.price,
            period: plan.type === 'annual' ? '/年' : (plan.type === 'lifetime' ? '/永久' : '/代理'),
          };
        });
        setPlans(fetchedPlans);
      }
    };

    fetchMembershipPlans();
  }, [toast]);

  // ★★★ 这是我们修改的核心函数 ★★★
  const handlePurchase = async (planType: 'annual' | 'lifetime' | 'agent') => {
    if (!isAuthenticated || !user) {
      toast({
        title: "请先登录",
        description: "购买会员需要登录账户",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    const selectedPlan = plans[planType];
    if (!selectedPlan) {
      toast({
        title: "错误",
        description: "未找到选定的会员计划",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlanType(planType);
    setPaymentLoading(true);

    try {
      // 我们的后端只需要一个 productId
      const requestBody = {
        productId: selectedPlan.name, // 例如 "永久会员"
      };

      // 调用我们改造好的 'create-mapay-order' 函数
      const { data, error: invokeError } = await supabase.functions.invoke('create-mapay-order', {
        body: requestBody
      });

      if (invokeError) {
        // 如果调用云函数本身出错，直接抛出
        throw invokeError;
      }

      // 检查后端返回的数据里有没有 paymentUrl
      if (data && data.paymentUrl) {
        console.log('成功获取到支付URL，即将跳转:', data.paymentUrl);
        // ★★★ 关键：直接跳转到码支付的收银台页面！★★★
        window.location.href = data.paymentUrl;
      } else {
        // 如果后端没有返回 paymentUrl，说明出错了
        throw new Error(data.error || '未能从服务器获取到支付链接。');
      }

    } catch (error: any) {
      console.error('支付请求失败:', error);
      toast({
        title: "支付失败",
        description: error.message || "创建订单失败，请稍后再试。",
        variant: "destructive"
      });
      // 失败后，也要重置按钮状态
      setPaymentLoading(false);
      setSelectedPlanType(null);
    }
    // 注意：成功跳转后，这个 finally 可能不会执行，这是正常的
    // 所以我们在 catch 里也加上了重置状态的逻辑
  };

  if (Object.keys(plans).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        <div className="text-white ml-4">加载会员计划中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419]">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 text-center">
        {/* ... Hero Section (这部分完全不用改) ... */}
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
            选择会员套餐
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            解锁全部AI超能力，开启无限创作之旅
          </p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <Star className="w-5 h-5 text-yellow-400 fill-current" />
            <span className="text-gray-300 ml-2">已有1000+用户选择我们</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Annual Plan */}
          {plans.annual && (
            <div className="relative group cursor-pointer transition-all duration-300 hover:scale-102">
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 border-gray-700 hover:border-cyan-400/50 rounded-3xl p-6 transition-all duration-300">
                {/* ... Card Content (这部分完全不用改) ... */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Crown className="w-5 h-5 text-cyan-400 mr-2" />
                    <h3 className="text-lg font-bold text-white">{plans.annual.name}</h3>
                  </div>
                  <p className="text-gray-400 mb-4 text-sm">{plans.annual.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      ¥{plans.annual.price}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">{plans.annual.period}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    平均每月仅需 ¥8.25
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {Array.isArray(plans.annual.features) && (plans.annual.features as string[]).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={() => handlePurchase('annual')}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 rounded-xl text-sm transition-all duration-300"
                    disabled={paymentLoading}
                  >
                    {paymentLoading && selectedPlanType === 'annual' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    立即购买
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ... (Lifetime Plan and Agent Plan cards are the same, no changes needed) ... */}
          {plans.lifetime && (
            <div className="relative group cursor-pointer transition-all duration-300 hover:scale-102">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                  <Sparkles className="w-3 h-3 mr-1" />
                  推荐
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 border-purple-400 rounded-3xl p-6 transition-all duration-300 shadow-2xl shadow-purple-500/25">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Crown className="w-5 h-5 text-purple-400 mr-2" />
                    <h3 className="text-lg font-bold text-white">{plans.lifetime.name}</h3>
                  </div>
                  <p className="text-gray-400 mb-4 text-sm">{plans.lifetime.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                      ¥{plans.lifetime.price}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">{plans.lifetime.period}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    相当于4年年费，超值划算
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {Array.isArray(plans.lifetime.features) && (plans.lifetime.features as string[]).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-purple-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={() => handlePurchase('lifetime')}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 rounded-xl text-sm transition-all duration-300"
                    disabled={paymentLoading}
                  >
                    {paymentLoading && selectedPlanType === 'lifetime' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    立即购买
                  </Button>
                </div>
              </div>
            </div>
          )}
          {plans.agent && (
            <div className="relative group cursor-pointer transition-all duration-300 hover:scale-102">
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 border-gray-700 hover:border-orange-400/50 rounded-3xl p-6 transition-all duration-300">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Users className="w-5 h-5 text-orange-400 mr-2" />
                    <h3 className="text-lg font-bold text-white">{plans.agent.name}</h3>
                  </div>
                  <p className="text-gray-400 mb-4 text-sm">{plans.agent.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                      ¥{plans.agent.price}
                    </span>
                    <span className="text-gray-400 text-sm ml-2">{plans.agent.period}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    推广3-4单即可回本
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  {Array.isArray(plans.agent.features) && (plans.agent.features as string[]).map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-orange-400 mr-2 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="text-center">
                  <Button 
                    onClick={() => handlePurchase('agent')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 rounded-xl text-sm transition-all duration-300"
                    disabled={paymentLoading}
                  >
                    {paymentLoading && selectedPlanType === 'agent' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    立即购买
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* ★★★ 我们把整个 Payment Modal 都删掉了，因为不再需要了 ★★★ */}
      
    </div>
  );
};

export default Payment;