
import React from 'react';
import { MessageSquare, Palette, Volume2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const FeaturesSection = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "AI 智能对话",
      description: "强大的AI聊天助手，可以回答问题、提供创意建议、编写文本，甚至帮你解决复杂问题，无需限制。",
      buttonText: "开始对话",
      link: "/chat",
      gradient: "from-nexus-blue to-nexus-cyan"
    },
    {
      icon: Palette,
      title: "AI 图像生成",
      description: "将想法转化为艺术作品，只需输入文本描述，AI为你创作惊艳图像，支持多风格/高分辨率导出。",
      buttonText: "生成图像",
      link: "/image",
      gradient: "from-nexus-purple to-nexus-pink"
    },
    {
      icon: Volume2,
      title: "AI 语音合成",
      description: "文本一键变语音，多语言多风格，创作、教育或个人用途皆可自如输出音频。",
      buttonText: "转换语音",
      link: "/voice",
      gradient: "from-nexus-cyan to-nexus-blue"
    }
  ];

  return (
    <section className="py-6 px-4 relative">
      {/* Background glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-nexus-blue/5 rounded-full blur-[100px] z-0"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">强大的AI能力</span>
            <span className="text-white">，一站式体验</span>
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            集成20+顶级AI模型，支持对话、绘画、创作一体化体验
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-md rounded-2xl p-8 border border-nexus-blue/30 hover:border-nexus-blue/50 transition-all duration-300 hover:transform hover:scale-[1.02]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                  
                  <p className="text-white/70 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <Button 
                    asChild 
                    className={`bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white border-0 px-8 py-3 rounded-full font-medium transition-all duration-300 group-hover:shadow-lg`}
                  >
                    <Link to={feature.link}>{feature.buttonText}</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
