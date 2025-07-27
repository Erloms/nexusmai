
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection = () => {
  const benefits = [
    "永久使用所有AI功能，无需额外付费",
    "不限次数使用AI对话、图像生成、语音合成",
    "持续更新最新AI模型，体验前沿技术",
    "30%代理分成收益，多一份副业收入"
  ];
  
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-nexus-blue/10 rounded-full blur-[80px] z-0"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="bg-gradient-to-br from-nexus-dark to-nexus-purple/30 p-8 md:p-12 rounded-2xl border border-nexus-blue/30 backdrop-blur-md">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
            <span className="text-gradient">解锁AI超能力</span>
            <span className="text-white">，从这里开始</span>
          </h2>
          
          <p className="text-xl text-center text-white/80 mb-10 max-w-2xl mx-auto">
            <span className="text-gradient-gold font-bold text-2xl">￥99/年</span> 或 <span className="text-gradient-gold font-bold text-2xl">￥399永久</span>，即可永久使用全部功能，无需订阅，没有隐藏费用。
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
              <h3 className="text-2xl font-bold text-nexus-cyan mb-4">会员特权</h3>
              <ul className="space-y-3">
                {benefits.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-nexus-blue mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="flex flex-col justify-center items-center bg-nexus-dark/50 p-6 rounded-xl border border-nexus-blue/20">
              <h3 className="text-2xl font-bold text-nexus-cyan mb-4">立即加入</h3>
              <p className="text-white/80 mb-6 text-center">
                加入成为会员，立即解锁所有AI功能 + 代理分成收益
              </p>
              <div className="flex flex-col gap-3 w-full">
                <Button size="lg" asChild className="bg-nexus-blue hover:bg-nexus-blue/80 text-white w-full text-lg py-6">
                  <Link to="/payment">￥99/年 立即购买</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20 w-full text-lg py-6">
                  <Link to="/payment">￥399 永久会员</Link>
                </Button>
              </div>
              <p className="text-white/60 text-sm mt-4">
                支持微信、支付宝、信用卡等多种支付方式
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
