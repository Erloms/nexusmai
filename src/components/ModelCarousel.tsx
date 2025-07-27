
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Star, Zap, Sparkles, Volume2 } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";

interface ModelCardProps {
  name: string;
  description: string;
  category: 'text' | 'image' | 'voice';
  highlight?: boolean;
}

const ModelCard: React.FC<ModelCardProps> = ({ name, description, category, highlight = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  let Icon = Zap;
  let gradientColors = "from-blue-500 to-indigo-600";
  
  if (category === 'image') {
    Icon = Sparkles;
    gradientColors = "from-purple-500 to-pink-600";
  } else if (category === 'voice') {
    Icon = Volume2;
    gradientColors = "from-teal-400 to-cyan-500";
  }
  
  return (
    <motion.div
      className={cn(
        "relative rounded-xl p-4 h-full border min-h-[150px] transition-all duration-300",
        highlight 
          ? "bg-gradient-to-br from-nexus-blue/20 to-nexus-purple/10 border-nexus-blue/40 shadow-lg shadow-nexus-blue/10" 
          : "bg-nexus-dark/40 border-nexus-blue/10",
        isHovered && !highlight && "border-nexus-blue/30 bg-gradient-to-br from-nexus-blue/10 to-transparent"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex flex-col h-full">
        <div className={`mb-3 flex items-center ${highlight ? "text-white" : "text-white/90"}`}>
          <div className={`p-2 rounded-full bg-gradient-to-r ${gradientColors} mr-3 shadow-glow-sm`}>
            <Icon size={16} className="text-white" />
          </div>
          <h3 className="font-bold text-lg">{name}</h3>
        </div>
        
        <p className="text-sm text-white/70 mb-2 flex-grow">{description}</p>
        
        {highlight && (
          <div className="mt-2 text-[10px] bg-gradient-to-r from-amber-500 to-amber-300 text-black font-semibold py-0.5 px-2 rounded-full w-fit">
            推荐模型
          </div>
        )}
      </div>
      
      <div className="absolute right-3 bottom-3 opacity-10">
        <Icon size={36} className={isHovered ? "text-nexus-blue" : "text-white"} />
      </div>
    </motion.div>
  );
};

const ModelCarousel: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkPaymentStatus } = useAuth();
  
  const handleStartClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (!checkPaymentStatus()) {
      navigate('/payment');
    } else {
      navigate('/chat');
    }
  };
  
  const featuredModels = [
    { name: "Gemini 2.5 Pro", description: "Google最新一代大语言模型，专业推理能力出色", category: 'text' as const, highlight: true },
    { name: "Claude 3.5 Haiku", description: "Anthropic最新小型模型，速度快且高效精准", category: 'text' as const, highlight: true },
    { name: "DeepSeek R1 Full", description: "DeepSeek最新大语言模型，全面理解能力强大", category: 'text' as const, highlight: true },
    { name: "GPT-4o", description: "OpenAI最强大的多模态大语言模型，支持图像理解", category: 'text' as const, highlight: true },
    { name: "Gemini 2.0 Flash", description: "Google轻量级模型，响应速度快，适合日常使用", category: 'text' as const, highlight: true },
    { name: "DeepSeek Chat V3", description: "DeepSeek最新对话模型，上下文理解能力强", category: 'text' as const, highlight: true },
    { name: "Kimi VL A3B Thinking", description: "Moonshot AI视觉语言模型，思考能力强大", category: 'text' as const, highlight: true },
    { name: "flux-pro", description: "专业版图像生成模型，画面细节丰富，质量超群", category: 'image' as const, highlight: true },
    { name: "flux-realism", description: "超真实效果图像生成，精准捕捉现实世界细节", category: 'image' as const, highlight: true },
    { name: "Nova", description: "友好专业的AI语音，适合商业解说和教育内容", category: 'voice' as const, highlight: true },
    { name: "Shimmer", description: "轻快明亮的语音风格，生动活泼，富有感染力", category: 'voice' as const, highlight: true },
  ];

  return (
    <section className="py-10 container mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-7/12 w-full">
          <div className="mb-6 flex flex-col">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              <span className="text-white">支持的</span>
              <span className="text-gradient">AI模型</span>
            </h2>
            <p className="text-white/70 text-lg mb-4">探索我们精选的顶尖AI模型，满足您的各种需求</p>
          </div>
          
          <Carousel 
            className="w-full" 
            opts={{
              loop: true,
              align: "start"
            }}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredModels.map((model, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <ModelCard 
                      name={model.name} 
                      description={model.description} 
                      category={model.category}
                      highlight={model.highlight}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center mt-4">
              <CarouselPrevious className="static translate-y-0 mx-2 bg-nexus-dark/80 border-nexus-blue/30 hover:bg-nexus-blue/20 text-white" />
              <CarouselNext className="static translate-y-0 mx-2 bg-nexus-dark/80 border-nexus-blue/30 hover:bg-nexus-blue/20 text-white" />
            </div>
          </Carousel>
          
          <div className="mt-6 flex justify-center">
            <button 
              className="text-nexus-cyan hover:text-nexus-cyan/80 flex items-center text-sm font-medium transition-all"
              onClick={() => navigate('/chat')}
            >
              查看全部支持模型
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* 右侧 - 核心优势 */}
        <div className="lg:w-5/12 w-full">
          <div className="relative h-full bg-gradient-to-br from-nexus-blue/10 to-nexus-purple/10 rounded-xl border border-nexus-blue/20 p-6 backdrop-blur-sm overflow-hidden flex flex-col">
            <div className="absolute -right-6 -top-6 w-24 h-24 text-nexus-blue/10">
              <Star size={96} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-nexus-blue/5 via-transparent to-nexus-purple/5 opacity-50"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-gradient-gold mb-5 flex items-center">
                <Star className="mr-2 h-6 w-6 text-yellow-400" />
                AI智能助手，助您高效创作
              </h3>
              
              <div className="space-y-6 flex-grow">
                <div className="bg-nexus-dark/40 rounded-lg p-4 border border-nexus-blue/10">
                  <div className="text-xl font-bold text-white mb-2">一次付费，终身使用</div>
                  <p className="text-white/80 text-lg">
                    只需
                    <span className="font-bold text-nexus-cyan text-2xl mx-1">299元</span>
                    <span className="font-bold text-white">消灭订阅困扰</span>
                  </p>
                </div>
                
                <div className="bg-nexus-dark/40 rounded-lg p-4 border border-nexus-blue/10">
                  <div className="text-xl font-bold text-white mb-2">顶级模型集成体验</div>
                  <p className="text-white/80">
                    集成Gemini 2.5、Claude 3.5、GPT-4o、DeepSeek R1等多款全球顶级AI模型
                  </p>
                </div>
                
                <div className="bg-nexus-dark/40 rounded-lg p-4 border border-nexus-blue/10">
                  <div className="text-xl font-bold text-white mb-2">创意无限可能</div>
                  <p className="text-white/80">
                    文本创作、图像生成、语音合成，释放您的创造力
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 5.293a1 1 0 011.414 0L10 8.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModelCarousel;
