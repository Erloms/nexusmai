
import React, { useState, useEffect } from 'react';
import { MessageCircle, Bot, User, Sparkles } from 'lucide-react';

const AIDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const demoSteps = [
    {
      role: 'user',
      content: '帮我画一只在宇宙中的可爱猫咪',
      showInput: true
    },
    {
      role: 'assistant', 
      content: '我来为您创作一只在神秘宇宙环境中的可爱猫咪！正在生成中...',
      showInput: false
    },
    {
      role: 'assistant',
      content: '创作完成！这是一只在魔法宇宙中的可爱小猫，周围环绕着神秘的能量和星空元素。',
      showInput: false,
      showGeneratedImage: true,
      imageUrl: '/lovable-uploads/422c49d8-b952-4d1b-a8a8-42a64c3fe9cf.png'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
      setShowImage(false);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    
    const step = demoSteps[currentStep];
    let charIndex = 0;
    
    const typeInterval = setInterval(() => {
      if (charIndex < step.content.length) {
        setDisplayedText(step.content.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        if (step.showGeneratedImage) {
          setTimeout(() => setShowImage(true), 1000);
        }
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentStep]);

  const currentStep_ = demoSteps[currentStep];

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-5 z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <MessageCircle className="h-8 w-8 text-nexus-cyan mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">AI智能助手演示</h2>
          </div>
          <p className="text-white/70 text-lg">体验文本生成图像的强大功能</p>
        </div>

        <div className="bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 p-6 rounded-2xl border border-nexus-blue/30 backdrop-blur-md">
          <div className="space-y-4 min-h-[400px]">
            <div className="flex items-start space-x-3">
              {currentStep_.role === 'user' ? (
                <div className="bg-nexus-blue p-2 rounded-full">
                  <User className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="bg-nexus-cyan p-2 rounded-full">
                  <Bot className="h-4 w-4 text-nexus-dark" />
                </div>
              )}
              <div className="flex-1">
                <div className={`p-4 rounded-lg ${
                  currentStep_.role === 'user' 
                    ? 'bg-nexus-blue/20 border border-nexus-blue/30' 
                    : 'bg-nexus-cyan/10 border border-nexus-cyan/20'
                }`}>
                  <p className="text-white whitespace-pre-line">
                    {displayedText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </p>
                  
                  {currentStep_.showGeneratedImage && showImage && (
                    <div className="mt-4 relative group">
                      <div className="relative overflow-hidden rounded-lg">
                        <img 
                          src={currentStep_.imageUrl} 
                          alt="AI生成的图像"
                          className="w-full max-w-md mx-auto rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Sparkles className="h-5 w-5 text-nexus-cyan" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 flex justify-center space-x-2">
            {demoSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-nexus-cyan' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIDemo;
