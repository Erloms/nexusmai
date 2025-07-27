import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast"; // Updated import
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard } from 'lucide-react';
import Navigation from '@/components/Navigation';

const Settings = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    displayName: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    notifications: true,
    darkMode: true,
  });

  const handleSave = () => {
    toast({
      title: "设置已保存",
      description: "您的设置已成功保存",
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.email?.split('@')[0] || '未知用户';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nexus-dark via-nexus-purple/20 to-nexus-dark">
      <Navigation />
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <SettingsIcon className="mr-3 h-8 w-8 text-nexus-cyan" />
            <h1 className="text-3xl font-bold text-gradient">设置</h1>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 bg-nexus-dark/50 border border-nexus-blue/20">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                个人资料
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                通知
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                安全
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                计费
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm border-nexus-blue/20">
                <CardHeader>
                  <CardTitle className="text-white">个人信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName" className="text-white">显示名称</Label>
                      <Input
                        id="displayName"
                        value={getUserDisplayName()}
                        onChange={(e) => setSettings({...settings, displayName: e.target.value})}
                        className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                        disabled
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-white">邮箱</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({...settings, email: e.target.value})}
                        className="bg-nexus-dark/50 border-nexus-blue/30 text-white"
                        disabled
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="bg-nexus-blue hover:bg-nexus-blue/80">
                    保存更改
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm border-nexus-blue/20">
                <CardHeader>
                  <CardTitle className="text-white">通知设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">邮件通知</Label>
                      <p className="text-sm text-gray-400">接收重要更新和通知</p>
                    </div>
                    <Button variant="outline" size="sm">
                      {settings.notifications ? '已启用' : '已禁用'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm border-nexus-blue/20">
                <CardHeader>
                  <CardTitle className="text-white">安全设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleSignOut} variant="destructive" className="w-full">
                    退出登录
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="space-y-6">
              <Card className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm border-nexus-blue/20">
                <CardHeader>
                  <CardTitle className="text-white">计费信息</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-400">暂无计费信息</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Settings;