import React, { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast"; // Updated import

interface PaymentCheckProps {
  children: ReactNode;
  featureType: 'chat' | 'image' | 'voice';
}

const PaymentCheck = ({ children, featureType }: PaymentCheckProps) => {
  const { isAuthenticated, user, checkPaymentStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const getTotalUsage = () => {
    if (!isAuthenticated || !user?.id) return 0;
    const usage = JSON.parse(localStorage.getItem(`nexusAi_usage_${user.id}`) || '{"used": 0}');
    return usage.used;
  };

  const remainingUsage = 10 - getTotalUsage();

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const usage = localStorage.getItem(`nexusAi_usage_${user.id}`);
      if (!usage) {
        localStorage.setItem(`nexusAi_usage_${user.id}`, JSON.stringify({ used: 0 }));
      }
    }
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-20">
        <div className="card-glowing p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gradient mb-4">需要登录</h2>
          <p className="text-white/80 mb-6">您需要登录后才能使用此功能</p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate('/login')}
              className="bg-nexus-blue hover:bg-nexus-blue/80 text-white"
            >
              登录账号
            </Button>
            
            <Button
              onClick={() => navigate('/register')}
              variant="outline"
              className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-dark/50"
            >
              免费注册
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!checkPaymentStatus() && remainingUsage <= 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center py-20">
        <div className="card-glowing p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gradient mb-4">免费额度已用完</h2>
          <p className="text-white/80 mb-6">
            您已用完免费体验额度，升级会员享受无限制使用
          </p>
          <p className="text-lg text-gradient-gold font-bold mb-6">
            ¥199/年 或 ¥799/永久
          </p>
          <Button 
            onClick={() => navigate('/payment')}
            className="bg-gradient-to-r from-nexus-blue to-nexus-cyan hover:opacity-90 text-white"
          >
            立即升级
          </Button>
        </div>
      </div>
    );
  }

  // For non-paying users, render children but wrap them to track usage
  if (!checkPaymentStatus()) {
    return (
      <div className="w-full h-full">
        {children}
      </div>
    );
  }

  // For paying users, just render children
  return <>{children}</>;
};

export default PaymentCheck;