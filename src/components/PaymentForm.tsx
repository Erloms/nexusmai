import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast"; // Updated import
import { useAuth } from '@/contexts/AuthContext';

const PaymentForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber || !contactInfo) {
      toast({
        title: "信息不完整",
        description: "请填写所有必填信息",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // 模拟提交支付信息
    setTimeout(() => {
      // 保存支付请求到本地存储，供管理员处理
      const existingRequests = JSON.parse(localStorage.getItem('paymentRequests') || '[]');
      const newRequest = {
        id: `${Date.now()}`,
        contactInfo: contactInfo,
        orderNumber: orderNumber,
        timestamp: new Date().toISOString(),
        status: 'pending',
        userId: user?.id || 'unknown'
      };
      
      const updatedRequests = [newRequest, ...existingRequests];
      localStorage.setItem('paymentRequests', JSON.stringify(updatedRequests));
      
      // 显示成功消息
      toast({
        title: "支付申请已提交",
        description: "管理员将在24小时内处理您的支付请求",
      });
      
      // 重置表单
      setOrderNumber('');
      setContactInfo('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div>
        <label htmlFor="orderNumber" className="block text-sm font-medium text-white mb-2">
          支付订单号
        </label>
        <Input
          id="orderNumber"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50"
          placeholder="请输入您的支付订单号"
          required
        />
      </div>
      
      <div>
        <label htmlFor="contactInfo" className="block text-sm font-medium text-white mb-2">
          联系方式（电话/邮箱）
        </label>
        <Input
          id="contactInfo"
          value={contactInfo}
          onChange={(e) => setContactInfo(e.target.value)}
          className="bg-nexus-dark/50 border-nexus-blue/30 text-white placeholder-white/50"
          placeholder="请输入您的联系方式，以便我们与您联系"
          required
        />
      </div>
      
      <Button 
        type="submit"
        className="w-full bg-nexus-blue hover:bg-nexus-blue/80 text-white py-6"
        disabled={isSubmitting}
      >
        {isSubmitting ? "提交中..." : "提交支付信息"}
      </Button>
      
      <p className="text-xs text-white/60 text-center">
        提交订单号后，我们会在24小时内处理您的支付并开通会员。
      </p>
    </form>
  );
};

export default PaymentForm;