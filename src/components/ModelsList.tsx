
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, Sparkles, Star, Volume2, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ModelType {
  name: string;
  items: string[];
}

const ModelsList: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("text");
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, checkPaymentStatus } = useAuth();
  
  const textModels: ModelType[] = [
    {
      name: 'OpenAI',
      items: ['GPT-4o', 'GPT-4o-mini', 'GPT-4.1-nano']
    },
    {
      name: 'Google',
      items: ['Gemini 2.5 Pro', 'Gemini 2.0 Flash', 'Gemini 2.0 Flash Thinking']
    },
    {
      name: 'Anthropic',
      items: ['Claude 3.5 Haiku', 'Claude 3.0 Opus', 'Claude Instant']
    },
    {
      name: 'Meta',
      items: ['Llama 3.3 70B', 'Llama 3.1 8B Instruct', 'Llama 4 Scout 17B']
    },
    {
      name: 'DeepSeek',
      items: ['DeepSeek-V3', 'DeepSeek R1 Full', 'DeepSeek Chat V3', 'DeepSeek Prover V2']
    },
    {
      name: 'Other',
      items: ['Mistral Nemo', 'Qwen 2.5 Coder 32B', 'Phi-4 Multimodal Instruct', 'SearchGPT', 'Kimi VL A3B Thinking']
    }
  ];

  const imageModels: ModelType[] = [
    {
      name: '图像生成',
      items: ['通用创意 | flux', '专业版 | flux-pro', '超真实效果 | flux-realism', '动漫风格 | flux-anime', '三维效果 | flux-3d', '创意艺术 | flux-cablyai', '极速生成 | turbo']
    }
  ];

  const voiceModels: ModelType[] = [
    {
      name: '语音合成',
      items: ['Alloy | 平衡中性', 'Echo | 深沉有力', 'Fable | 温暖讲述', 'Onyx | 威严庄重', 'Nova | 友好专业', 'Shimmer | 轻快明亮', 'Coral | 温柔平静', 'Verse | 生动诗意']
    }
  ];

  const modelCategories = [
    { id: "text", name: "文本生成", icon: <Zap size={18} />, models: textModels },
    { id: "image", name: "图像生成", icon: <Sparkles size={18} />, models: imageModels },
    { id: "voice", name: "语音合成", icon: <Volume2 size={18} />, models: voiceModels }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const handleStartClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!checkPaymentStatus()) {
      navigate('/payment');
    } else {
      // Already a paid member, navigate to the appropriate feature
      switch (activeCategory) {
        case 'text':
          navigate('/chat');
          break;
        case 'image':
          navigate('/image');
          break;
        case 'voice':
          navigate('/voice');
          break;
      }
    }
  };

  return (
    <section className="py-16 container mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Models */}
        <div className="lg:w-7/12 w-full">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-bold">
              <span className="text-white">支持的</span>
              <span className="text-gradient">AI模型</span>
            </h2>
            <div className="flex space-x-2 bg-nexus-dark/50 rounded-lg p-1 border border-nexus-blue/10">
              {modelCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                    activeCategory === category.id 
                      ? "bg-gradient-to-r from-nexus-blue to-nexus-cyan text-white shadow-glow-sm" 
                      : "text-white/70 hover:text-white"
                  )}
                >
                  {category.icon}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-nexus-dark/80 to-nexus-dark/60 rounded-xl border border-nexus-blue/20 p-5 backdrop-blur-sm overflow-hidden">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-nexus-blue/5 rounded-full blur-3xl"></div>
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-nexus-purple/5 rounded-full blur-3xl"></div>

            {modelCategories.map(category => (
              activeCategory === category.id && (
                <motion.div 
                  key={category.id}
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 gap-4"
                >
                  {category.models.map((group, groupIdx) => (
                    <motion.div key={groupIdx} variants={item}>
                      <div className="text-nexus-cyan font-semibold mb-3 pb-1 border-b border-nexus-blue/20">
                        {group.name}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {group.items.map((model, modelIdx) => {
                          const itemKey = `${groupIdx}-${modelIdx}`;
                          const isHovered = hoveredItem === parseInt(`${groupIdx}${modelIdx}`);
                          
                          return (
                            <motion.div
                              key={itemKey}
                              variants={item}
                              className={cn(
                                "bg-nexus-dark/40 rounded-lg p-3 border transition-all cursor-pointer",
                                isHovered 
                                  ? "border-nexus-blue/50 bg-gradient-to-br from-nexus-dark/60 to-nexus-blue/10" 
                                  : "border-nexus-blue/10"
                              )}
                              onMouseEnter={() => setHoveredItem(parseInt(`${groupIdx}${modelIdx}`))}
                              onMouseLeave={() => setHoveredItem(null)}
                            >
                              <div className="flex items-center">
                                <span className="w-2 h-2 bg-nexus-blue rounded-full mr-2"></span>
                                <span className="text-white/90 text-sm">{model}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )
            ))}
          </div>
        </div>

        {/* Right side - Why Choose Us */}
        <div className="lg:w-5/12 w-full">
          <div className="relative h-full bg-gradient-to-br from-nexus-blue/10 to-nexus-purple/10 rounded-xl border border-nexus-blue/20 p-6 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="absolute -right-6 -top-6 w-24 h-24 text-nexus-blue/10">
              <Star size={96} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue/5 via-transparent to-nexus-purple/5 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-gradient-gold mb-5 flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-400" />
                为什么选择 Nexus AI？
              </h3>
              
              <div className="space-y-6 flex-grow">
                <div className="bg-nexus-dark/40 rounded-lg p-4 border border-nexus-blue/10">
                  <div className="text-xl font-bold text-white mb-2">价格优势</div>
                  <p className="text-white/80 text-lg">
                    无需为昂贵的大模型付费，只需
                    <span className="font-bold text-nexus-cyan text-2xl mx-1">299元</span>
                    <span className="font-bold text-white">永久</span>
                    使用顶尖AI模型
                  </p>
                </div>
                
                <div className="bg-nexus-dark/40 rounded-lg p-4 border border-nexus-blue/10">
                  <div className="text-xl font-bold text-white mb-2">功能全面</div>
                  <p className="text-white/80">
                    集成文本生成、图像创作与语音合成于一体，满足您所有AI创作需求
                  </p>
                </div>
                
                <div className="bg-nexus-dark/40 rounded-lg p-4 border border-nexus-blue/10">
                  <div className="text-xl font-bold text-white mb-2">持续更新</div>
                  <p className="text-white/80">
                    我们不断引入最新的AI模型，确保您始终使用最前沿的人工智能技术
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <button 
                  className="w-full px-6 py-3 bg-gradient-to-r from-nexus-blue to-nexus-cyan text-white rounded-md flex items-center justify-center font-medium hover:opacity-90 transition-all group"
                  onClick={handleStartClick}
                >
                  {!isAuthenticated ? "立即注册" : 
                   !checkPaymentStatus() ? "立即升级会员" : 
                   "开始使用AI能力"}
                  <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelsList;
