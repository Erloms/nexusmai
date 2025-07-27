import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { CheckCircle, Crown, Sparkles, Star, Zap, Users, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client
import { Database } from '@/integrations/supabase/types';

// Define a type for membership plans fetched from the database
type MembershipPlan = Database['public']['Tables']['membership_plans']['Row'];

interface PlanDetail extends MembershipPlan {
  period: string; // Add period for display
}

const Payment = () => {
  const { user, isAuthenticated, checkPaymentStatus } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedPlanType, setSelectedPlanType] = useState<'annual' | 'lifetime' | 'agent'>('annual');
  const [showPayment, setShowPayment] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [plans, setPlans] = useState<Record<string, PlanDetail>>({}); // State to store fetched plans

  useEffect(() => {
    console.log('Payment component mounted. Calling fetchMembershipPlans...');
    const fetchMembershipPlans = async () => {
      console.log('Inside fetchMembershipPlans. Attempting to fetch from Supabase...');
      const { data, error } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching membership plans from Supabase:', error);
        toast({
          title: "加载会员计划失败",
          description: "无法获取会员套餐信息",
          variant: "destructive"
        });
      } else {
        console.log('Successfully fetched data from Supabase:', data);
        const fetchedPlans: Record<string, PlanDetail> = {};
        data.forEach(plan => {
          fetchedPlans[plan.type] = {
            ...plan,
            price: plan.price, // Ensure price is numeric
            period: plan.type === 'annual' ? '/年' : (plan.type === 'lifetime' ? '/永久' : '/代理'),
          };
        });
        setPlans(fetchedPlans);
        console.log('Plans state updated:', fetchedPlans);
      }
    };

    fetchMembershipPlans();
  }, []);

  const handlePurchase = async (planType: 'annual' | 'lifetime' | 'agent') => {
    console.log('handlePurchase triggered for planType:', planType); // Log 1
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, navigating to login.'); // Log 2
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
      console.error('Selected plan not found:', planType); // Log 3
      toast({
        title: "错误",
        description: "未找到选定的会员计划",
        variant: "destructive"
      });
      return;
    }

    setSelectedPlanType(planType);
    setPaymentLoading(true);
    setQrCodeUrl(null);

    try {
      const requestBody = {
        subject: selectedPlan.name,
        total_amount: Number(selectedPlan.price), // Ensure total_amount is a number
        product_id: selectedPlan.id,
      };
      console.log('Sending request body to create-mapay-order:', requestBody); // Log 4

      // Call the new Edge Function to create an mapay order
      const { data, error: invokeError } = await supabase.functions.invoke('create-mapay-order', {
        body: requestBody
      });

      if (invokeError) {
        console.error('Error invoking create-mapay-order:', invokeError);
        let userFacingMessage = "创建支付订单时发生未知错误。";

        // Check if it's a FunctionsHttpError and try to extract meaningful message
        if (invokeError.name === 'FunctionsHttpError') {
          let errorContent: string | undefined;
          // Prioritize context as it often contains the raw response body from the Edge Function
          if (invokeError.context && typeof invokeError.context === 'string') {
            errorContent = invokeError.context;
          } else if (invokeError.message && typeof invokeError.message === 'string') {
            // Fallback to message if context is not useful or not a string
            errorContent = invokeError.message;
          }

          if (errorContent && errorContent.startsWith('{')) {
            try {
              const parsed = JSON.parse(errorContent);
              // Look for 'error' or 'message' fields in the parsed JSON
              userFacingMessage = parsed.error || parsed.message || userFacingMessage;
            } catch (parseError) {
              // If parsing fails, use the raw content as message
              userFacingMessage = `Edge Function 错误: ${errorContent}`;
            }
          } else if (errorContent) {
            // If not JSON, use the content directly
            userFacingMessage = `Edge Function 错误: ${errorContent}`;
          } else {
            // Fallback if no useful content in context or message
            userFacingMessage = invokeError.message || userFacingMessage;
          }
        } else {
          // For other types of errors (e.g., network errors before reaching Edge Function)
          userFacingMessage = invokeError.message || userFacingMessage;
        }

        toast({
          title: "支付失败",
          description: userFacingMessage,
          variant: "destructive"
        });
        return; // Stop execution here
      }

      // If no invokeError, then data should be valid
      setQrCodeUrl(data.qr_code_url);
      setShowPayment(true);
      toast({
        title: "支付订单已创建",
        description: "请扫描二维码完成支付",
      });
      console.log('Alipay order created successfully, QR code URL:', data.qr_code_url); // Log 6

    } catch (error: any) {
      console.error('Caught unexpected error in handlePurchase:', error); // Log 7
      toast({
        title: "支付失败",
        description: error.message || "发生未知错误，请稍后再试。",
        variant: "destructive"
      });
    } finally {
      setPaymentLoading(false);
      console.log('handlePurchase finished, paymentLoading set to false.'); // Log 8
    }
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    setQrCodeUrl(null);
  };

  console.log('Rendering Payment component. Current plans state:', plans);

  // Ensure plans are loaded before rendering
  if (Object.keys(plans).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-cyan-400 animate-spin" />
        <div className="text-white ml-4">加载会员计划中...</div>
      </div>
    );
  }

  const currentPlanDetails = plans[selectedPlanType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419]">
      <Navigation />
      
      {/* Hero Section */}
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

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Annual Plan */}
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
                    disabled={paymentLoading}
                  >
                    {paymentLoading && selectedPlanType === 'annual' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    立即购买
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Lifetime Plan */}
          {plans.lifetime && (
            <div className="relative group cursor-pointer transition-all duration-300 hover:scale-102">
              {/* Recommended Badge */}
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

          {/* Agent Plan */}
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

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border border-gray-700 rounded-3xl p-6 max-w-sm w-full relative">
            <button 
              onClick={handleClosePayment}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-white mb-4">扫码支付</h3>
              
              {/* Payment QR Code */}
              <div className="bg-white rounded-xl p-3 mb-4 flex justify-center w-32 h-32 mx-auto">
                {qrCodeUrl ? (
                  <img 
                    src={qrCodeUrl} 
                    alt="支付二维码" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="text-sm font-bold text-white mb-1">
                  ¥{currentPlanDetails.price}
                </div>
                <div className="text-gray-400 text-xs">{currentPlanDetails.name}</div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-xs mb-4">
                请使用支付宝扫描上方二维码完成支付。支付成功后，会员权限将自动开通。
              </p>
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 rounded-xl text-sm transition-all duration-300"
                onClick={handleClosePayment} // Just close for now, actual status update via webhook
              >
                我已支付 (关闭)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;