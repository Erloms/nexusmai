// 文件路径: src/pages/Payment.tsx
// 这是最终的、修复了参数传递问题的版本

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
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [plans, setPlans] = useState<Record<string, PlanDetail>>({});

  useEffect(() => {
    // ... (这部分逻辑完全不变)
    const fetchMembershipPlans = async () => {
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true);
      if (error) {
        toast({ title: "加载会员计划失败", variant: "destructive" });
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

  // ★★★ 这是我们最终修复的 handlePurchase 函数 ★★★
  const handlePurchase = async (planType: 'annual' | 'lifetime' | 'agent') => {
    if (!isAuthenticated || !user) {
      toast({ title: "请先登录", variant: "destructive" });
      navigate('/login');
      return;
    }
    const selectedPlan = plans[planType];
    if (!selectedPlan) {
      toast({ title: "错误", description: "找不到该套餐", variant: "destructive" });
      return;
    }

    setPaymentLoading(true);
    setSelectedPlanType(planType);

    try {
      // ★★★ 关键修复：我们将请求体直接作为 invoke 的第二个参数传递 ★★★
      // Supabase SDK 会自动处理 body 的序列化，我们不需要再包一层 { body: ... }
      const { data, error: invokeError } = await supabase.functions.invoke('create-mapay-order', 
        {
          // 这就是我们的 requestBody，直接放在这里
          productId: selectedPlan.type 
        }
      );

      if (invokeError) {
        // 尝试从错误上下文中解析更详细的错误信息
        let detailMessage = invokeError.message;
        if ((invokeError as any).context && (invokeError as any).context.error) {
          detailMessage = (invokeError as any).context.error;
        }
        throw new Error(detailMessage);
      }

      if (data && data.paymentUrl) {
        console.log('成功获取支付URL，即将跳转:', data.paymentUrl);
        window.location.href = data.paymentUrl;
      } else {
        throw new Error(data.error || '未能从服务器获取支付链接。');
      }

    } catch (error: any) {
      console.error('支付请求失败:', error);
      toast({
        title: "支付失败",
        description: error.message || "创建订单失败，请稍后再试。",
        variant: "destructive"
      });
      setPaymentLoading(false);
      setSelectedPlanType(null);
    }
  };

  // ... (下面的所有UI和渲染代码，一行都不用改，保持原样)
  if (Object.keys(plans).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a0f19] to-[#0a0f1c] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        <div className="text-white ml-4">加载会员计划中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a0f19] to-[#0a0f1c]">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4 text-center">
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
          {plans.annual && (
            <div className="relative group cursor-pointer transition-all duration-300 hover:scale-102">
              <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl border-2 border-gray-700 hover:border-cyan-400/50 rounded-3xl p-6 transition-all duration-300">
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
                    disabled={paymentLoading && selectedPlanType === 'annual'}
                  >
                    {paymentLoading && selectedPlanType === 'annual' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    立即购买
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                    disabled={paymentLoading && selectedPlanType === 'lifetime'}
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
                    disabled={paymentLoading && selectedPlanType === 'agent'}
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
    </div>
  );
};

export default Payment;