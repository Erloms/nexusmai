import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from '@/contexts/AuthContext';
import { Rocket, Image, MessageSquare, Volume2, ArrowUpRight } from 'lucide-react';

const UserDashboard = () => {
  const { user, userProfile, checkPaymentStatus } = useAuth(); // Get userProfile and checkPaymentStatus
  const navigate = useNavigate();
  const [usageStats, setUsageStats] = useState({
    chat: { used: 0, total: 5 },
    image: { used: 0, total: 10 },
    voice: { used: 0, total: 10 }
  });

  useEffect(() => {
    if (user) {
      // 从本地存储获取使用统计 (these are free tier limits, can remain local for now)
      try {
        const chatUsage = JSON.parse(localStorage.getItem(`nexusAi_chat_usage_${user.id}`) || '{"remaining": 5}');
        const imageUsage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
        const voiceUsage = JSON.parse(localStorage.getItem(`nexusAi_voice_usage_${user.id}`) || '{"remaining": 10}');
        
        setUsageStats({
          chat: { used: 5 - chatUsage.remaining, total: 5 },
          image: { used: 10 - imageUsage.remaining, total: 10 },
          voice: { used: 10 - voiceUsage.remaining, total: 10 }
        });
      } catch (error) {
        console.error("Error loading usage stats:", error);
      }
    }
  }, [user]);

  const calculatePercentage = (used: number, total: number) => {
    return Math.min(Math.round((used / total) * 100), 100);
  };

  const handleUpgrade = () => {
    navigate('/payment');
  };

  if (!user) return null;

  // Determine if the user is a paid member based on userProfile
  const isPaidMember = checkPaymentStatus(); // This now uses the database-driven logic

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-6 text-gradient">个人中心</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-nexus-dark/50 border border-nexus-blue/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-nexus-cyan" />
                AI对话
              </CardTitle>
              <span className="text-xs text-white/70 font-normal">
                免费额度
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress 
                value={calculatePercentage(usageStats.chat.used, usageStats.chat.total)} 
                className="h-2 bg-nexus-blue/20" 
              />
              <div className="text-sm text-white/90 flex justify-between">
                <span>已使用: {usageStats.chat.used}</span>
                <span>总额度: {usageStats.chat.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-nexus-dark/50 border border-nexus-blue/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center">
                <Image className="mr-2 h-5 w-5 text-nexus-cyan" />
                AI图像生成
              </CardTitle>
              <span className="text-xs text-white/70 font-normal">
                免费额度
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress 
                value={calculatePercentage(usageStats.image.used, usageStats.image.total)} 
                className="h-2 bg-nexus-blue/20" 
              />
              <div className="text-sm text-white/90 flex justify-between">
                <span>已使用: {usageStats.image.used}</span>
                <span>总额度: {usageStats.image.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-nexus-dark/50 border border-nexus-blue/30">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center">
                <Volume2 className="mr-2 h-5 w-5 text-nexus-cyan" />
                AI语音合成
              </CardTitle>
              <span className="text-xs text-white/70 font-normal">
                免费额度
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress 
                value={calculatePercentage(usageStats.voice.used, usageStats.voice.total)} 
                className="h-2 bg-nexus-blue/20" 
              />
              <div className="text-sm text-white/90 flex justify-between">
                <span>已使用: {usageStats.voice.used}</span>
                <span>总额度: {usageStats.voice.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {!isPaidMember && ( // Use isPaidMember here
        <Card className="bg-gradient-to-br from-nexus-blue/10 to-nexus-purple/10 border border-nexus-blue/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">成为 VIP 会员</h3>
                <p className="text-white/80">升级会员，解锁无限制使用全部AI功能</p>
              </div>
              <Button 
                onClick={handleUpgrade} 
                className="bg-nexus-blue hover:bg-nexus-blue/80 px-5 flex items-center"
              >
                <Rocket className="mr-2 h-4 w-4" />
                立即升级
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;