import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast"; // Updated import
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { Loader2, Download, RefreshCw, Sparkles, Wand2, Image as ImageIcon, History, Trash2, Video, Shuffle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

// Helper function to construct Pollinations.ai image URL based on detailed prompt rules
const constructPollinationsImageUrl = (
  basePrompt: string,
  options?: {
    sceneDetailed?: string;
    adjective?: string;
    charactersDetailed?: string;
    visualStyle?: string;
    genre?: string;
    artistReference?: string;
    model?: string;
    width?: number;
    height?: number;
    seed?: string; // Allow specific seed
  }
) => {
  let finalPrompt = basePrompt;

  // Enhance basePrompt if it's too short (aim for ~50 words)
  if (finalPrompt.split(' ').length < 10) { 
    finalPrompt += ", highly detailed, cinematic lighting, vibrant colors, professional photography, 8k";
  }

  const parts = [
    options?.sceneDetailed,
    options?.adjective,
    options?.charactersDetailed,
    options?.visualStyle,
    options?.genre,
    options?.artistReference,
  ].filter(Boolean); // Remove undefined/null parts

  if (parts.length > 0) {
    finalPrompt = `${finalPrompt}, ${parts.join(', ')}`;
  }

  const encodedPrompt = encodeURIComponent(finalPrompt);
  const width = options?.width || 1024;
  const height = options?.height || 768;
  const model = options?.model || 'flux'; // Default to 'flux'
  const seed = options?.seed || Math.floor(Math.random() * 1000000).toString(); // Use provided seed or generate random

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
};


const Image = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('pixelated, poor lighting, overexposed, underexposed, chinese text, asian text, chinese characters, cropped, duplicated, ugly, extra fingers, bad hands, missing fingers, mutated hands');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVideoConverting, setIsVideoConverting] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoTaskId, setVideoTaskId] = useState<string | null>(null);
  const [seed, setSeed] = useState('');
  const [selectedModel, setSelectedModel] = useState('flux');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedVideoEffect, setSelectedVideoEffect] = useState('sketch-to-color');
  const [availableModels, setAvailableModels] = useState<Array<{id: string, name: string, description: string}>>([]);
  const [history, setHistory] = useState<Array<{id: string, prompt: string, image: string, timestamp: number}>>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  // 图像生成模型列表
  const imageModels = [
    { id: 'flux', name: '通用创意', description: 'Flux - 通用创意模型' },
    { id: 'flux-pro', name: '专业版', description: 'Flux Pro - 专业级生成' },
    { id: 'flux-realism', name: '超真实效果', description: 'Flux Realism - 照片级真实' },
    { id: 'flux-anime', name: '动漫风格', description: 'Flux Anime - 动漫二次元' },
    { id: 'flux-3d', name: '三维效果', description: 'Flux 3D - 立体三维' },
    { id: 'flux-cablyai', name: '创意艺术', description: 'Flux CablyAI - 创意艺术' },
    { id: 'turbo', name: '极速生成', description: 'Turbo - 快速生成' },
  ];

  // 视频魔法效果选项
  const videoEffects = [
    { id: 'sketch-to-color', name: '素描变彩色', description: '素描稿用刷子刷过变成彩色画' },
    { id: 'static-to-dynamic', name: '静态转动态', description: '让静态画面充满生命力' },
    { id: 'watercolor-flow', name: '水彩流动', description: '水彩颜料在纸上流淌的效果' },
    { id: 'pencil-drawing', name: '铅笔素描', description: '铅笔在纸上绘制的过程' },
    { id: 'oil-painting', name: '油画创作', description: '油画笔刷在画布上创作' },
    { id: 'digital-glitch', name: '数字故障', description: '数字艺术故障美学效果' },
    { id: 'neon-glow', name: '霓虹发光', description: '霓虹灯光效果逐渐点亮' },
    { id: 'particle-explosion', name: '粒子爆炸', description: '画面分解成粒子再重组' }
  ];

  // Master prompts for different styles
  const masterPrompts = [
    { name: "写实人像", prompt: "photorealistic portrait, highly detailed, professional lighting, sharp focus, 8k resolution" },
    { name: "动漫风格", prompt: "anime style, detailed illustration, vibrant colors, manga aesthetic, cel shading" },
    { name: "奇幻艺术", prompt: "fantasy art, magical atmosphere, ethereal lighting, mystical elements, artstation quality" },
    { name: "科幻风格", prompt: "sci-fi concept art, futuristic, cyberpunk aesthetic, neon lighting, high tech" },
    { name: "油画风格", prompt: "oil painting style, classical art, rich textures, painterly brushstrokes, artistic masterpiece" },
    { name: "水彩画", prompt: "watercolor painting, soft brush strokes, flowing colors, artistic, traditional media" },
    { name: "素描风格", prompt: "pencil sketch, hand-drawn, artistic linework, monochrome, detailed shading" },
    { name: "卡通风格", prompt: "cartoon style, cute and colorful, simplified features, playful design" }
  ];

  // Generate random seed function
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed.toString());
    return randomSeed.toString();
  };

  // Generate random video effect
  const generateRandomVideoEffect = () => {
    const randomEffect = videoEffects[Math.floor(Math.random() * videoEffects.length)];
    setSelectedVideoEffect(randomEffect.id);
    toast({
      title: "魔法效果已更换",
      description: `已切换到：${randomEffect.name}`,
    });
  };

  // Initialize with random seed on component mount
  useEffect(() => {
    generateRandomSeed();
    setAvailableModels(imageModels);
    // Load history from localStorage
    const savedHistory = localStorage.getItem('ai_image_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const checkUsageLimit = () => {
    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录账户才能使用AI图像生成功能",
        variant: "destructive"
      });
      return false;
    }

    const usage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
    
    if (usage.remaining <= 0) {
      toast({
        title: "使用次数已用完",
        description: "免费用户每日限制10次图像生成，请升级会员获得无限次数",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const updateUsage = () => {
    if (!user) return;
    
    const usage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
    usage.remaining = Math.max(0, usage.remaining - 1);
    localStorage.setItem(`nexusAi_image_usage_${user.id}`, JSON.stringify(usage));
  };

  // Get dimensions based on aspect ratio
  const getDimensions = () => {
    const ratios: { [key: string]: { width: number, height: number } } = {
      '1:1': { width: 1024, height: 1024 },
      '16:9': { width: 1024, height: 576 },
      '9:16': { width: 576, height: 1024 },
      '4:3': { width: 1024, height: 768 },
      '3:4': { width: 768, height: 1024 },
      '21:9': { width: 1024, height: 439 },
    };
    
    return ratios[aspectRatio] || { width: 1024, height: 1024 };
  };

  const handleGenerate = async (useNewSeed: boolean = true) => { // Added useNewSeed parameter
    if (!prompt.trim()) {
      toast({
        title: "请输入提示词",
        description: "请描述您想要生成的图像内容",
        variant: "destructive"
      });
      return;
    }

    if (!checkUsageLimit()) return;

    setIsLoading(true);
    setGeneratedImage(null); // Clear previous image
    setVideoUrl(null); // Clear previous video

    try {
      const currentSeed = useNewSeed ? generateRandomSeed() : seed; // Use new seed or existing
      const dimensions = getDimensions();
      
      // Construct Pollinations.ai URL using the helper function
      const imageUrl = constructPollinationsImageUrl(prompt, {
        width: dimensions.width,
        height: dimensions.height,
        model: selectedModel,
        seed: currentSeed,
      });
      
      // Simulate loading delay, allowing user to see generation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGeneratedImage(imageUrl);
      updateUsage();

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        prompt: prompt,
        image: imageUrl,
        timestamp: Date.now()
      };
      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)]; // Keep only last 10
      setHistory(updatedHistory);
      localStorage.setItem('ai_image_history', JSON.stringify(updatedHistory));
      
      toast({
        title: "图像生成成功",
        description: `使用种子值: ${currentSeed}，模型: ${imageModels.find(m => m.id === selectedModel)?.name}`,
      });
      
    } catch (error) {
      console.error('生成图像失败:', error);
      toast({
        title: "生成失败",
        description: "图像生成过程中出现错误，请稍后重试",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedraw = () => { // New function for redraw
    handleGenerate(true); // Generate with a new random seed
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `nexus-ai-generated-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleVideoConversion = async () => {
    if (!generatedImage) {
      toast({
        title: "请先生成图像",
        description: "需要先生成图像才能转换为视频",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "请先登录",
        description: "需要登录账户才能使用视频转换功能",
        variant: "destructive"
      });
      return;
    }

    setIsVideoConverting(true);
    setVideoUrl(null);

    try {
      // 根据选择的魔法效果生成对应的提示词
      const effectPrompts = {
        'sketch-to-color': '素描稿用刷子刷过变成彩色画，绘画过程，艺术创作',
        'static-to-dynamic': '让静态画面充满生命力，添加自然的动态效果，生动有趣',
        'watercolor-flow': '水彩颜料在纸上流淌，色彩渐变，艺术流动感',
        'pencil-drawing': '铅笔在纸上绘制的过程，素描艺术，线条流畅',
        'oil-painting': '油画笔刷在画布上创作，厚重笔触，艺术质感',
        'digital-glitch': '数字故障美学效果，像素闪烁，科技感',
        'neon-glow': '霓虹发光',
        'particle-explosion': '画面分解成粒子再重组'
      };

      const selectedEffect = videoEffects.find(effect => effect.id === selectedVideoEffect);
      const effectPrompt = effectPrompts[selectedVideoEffect as keyof typeof effectPrompts] || '让画面动起来，添加魔法效果';

      // Call the video generation function
      const { data, error } = await supabase.functions.invoke('generate-video', {
        body: {
          image_url: generatedImage,
          prompt: effectPrompt
        }
      });

      if (error) {
        console.error('Error calling generate-video:', error);
        throw new Error(error.message || "视频生成Edge Function调用失败");
      }

      const taskId = data.id;
      setVideoTaskId(taskId);

      toast({
        title: "魔法视频转换已开始",
        description: `正在施展「${selectedEffect?.name}」魔法，请稍等...`,
      });

      // Poll for video completion
      const pollInterval = setInterval(async () => {
        try {
          const { data: statusData, error: statusError } = await supabase.functions.invoke('check-video-status', {
            body: { taskId }
          });

          if (statusError) throw statusError;

          if (statusData.task_status === 'SUCCESS') {
            clearInterval(pollInterval);
            setVideoUrl(statusData.video_result[0].url);
            setIsVideoConverting(false);
            toast({
              title: "魔法视频转换完成",
              description: `「${selectedEffect?.name}」魔法已成功施展！`,
            });
          } else if (statusData.task_status === 'FAIL') {
            clearInterval(pollInterval);
            setIsVideoConverting(false);
            throw new Error('视频生成失败');
          }
        } catch (error) {
          clearInterval(pollInterval);
          setIsVideoConverting(false);
          throw error;
        }
      }, 3000);

      // Set timeout to stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval);
        if (isVideoConverting) {
          setIsVideoConverting(false);
          toast({
            title: "魔法视频转换超时",
            description: "请稍后重试",
            variant: "destructive"
          });
        }
      }, 300000);

    } catch (error) {
      console.error('视频转换失败:', error);
      setIsVideoConverting(false);
      toast({
        title: "魔法视频转换失败",
        description: "转换过程中出现错误，请稍后重试",
        variant: "destructive"
      });
    }
  };

  const applyMasterPrompt = (masterPrompt: string) => {
    setPrompt(prev => prev ? `${prev}, ${masterPrompt}` : masterPrompt);
  };

  const optimizePrompt = () => {
    if (!prompt.trim()) {
      toast({
        title: "请先输入提示词",
        description: "需要有基础提示词才能进行优化",
        variant: "destructive"
      });
      return;
    }
    
    // Add optimization keywords
    const optimizedAdditions = "masterpiece, best quality, highly detailed, professional, 8k resolution, perfect composition, trending on artstation";
    setPrompt(prev => `${prev}, ${optimizedAdditions}`);
    
    toast({
      title: "提示词已优化",
      description: "已添加质量优化关键词",
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ai_image_history');
    toast({
      title: "历史记录已清空",
      description: "所有生成历史已删除",
    });
  };

  const getRemainingUsage = () => {
    if (!user) return 0;
    const usage = JSON.parse(localStorage.getItem(`nexusAi_image_usage_${user.id}`) || '{"remaining": 10}');
    return usage.remaining;
  };

  const getCurrentDimensions = () => {
    const dimensions = getDimensions();
    return `${dimensions.width} × ${dimensions.height}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-4">
              AI 绘画生成器
            </h1>
            <p className="text-gray-400 text-lg">
              智能AI驱动的视觉增强创作平台
            </p>
            {user && (
              <p className="text-sm text-gray-500 mt-2">
                剩余生成次数: {getRemainingUsage()}
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-6">
              {/* Prompt Section */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-cyan-400" />
                    提示词 (Prompt)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Master Prompts */}
                  <div>
                    <label className="block text-white font-medium mb-2">大师提示词</label>
                    <div className="flex gap-2 mb-3">
                      <Button
                        onClick={optimizePrompt}
                        variant="outline"
                        size="sm"
                        className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-white"
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        智能优化
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {masterPrompts.map((item, index) => (
                        <Button
                          key={index}
                          onClick={() => applyMasterPrompt(item.prompt)}
                          variant="outline"
                          size="sm"
                          className="text-xs border-[#203042]/60 text-gray-300 hover:bg-[#203042]/80 hover:text-white"
                        >
                          {item.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="描述您想要生成的图像..."
                    className="bg-[#0f1419] border-[#203042]/60 text-white min-h-[120px] resize-none"
                    maxLength={2000}
                  />
                  <p className="text-xs text-gray-500">
                    {prompt.length}/2000 字符
                  </p>
                </CardContent>
              </Card>

              {/* Negative Prompt */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">负面提示词 (Negative Prompt)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="描述不想要的元素..."
                    className="bg-[#0f1419] border-[#203042]/60 text-white min-h-[80px] resize-none text-sm"
                    maxLength={1000}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {negativePrompt.length}/1000 字符
                  </p>
                </CardContent>
              </Card>

              {/* Model Selection */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">模型选择</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="bg-[#0f1419] border-[#203042]/60 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2740] border-[#203042]/60">
                      {imageModels.map((model) => (
                        <SelectItem key={model.id} value={model.id} className="text-white">
                          {model.name} - {model.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Video Magic Effects */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-400" />
                    视频魔法效果
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={selectedVideoEffect} onValueChange={setSelectedVideoEffect}>
                      <SelectTrigger className="bg-[#0f1419] border-[#203042]/60 text-white flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2740] border-[#203042]/60">
                        {videoEffects.map((effect) => (
                          <SelectItem key={effect.id} value={effect.id} className="text-white">
                            {effect.name} - {effect.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={generateRandomVideoEffect}
                      variant="outline"
                      size="icon"
                      className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-white shrink-0"
                      title="随机魔法效果"
                    >
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500">
                    {videoEffects.find(effect => effect.id === selectedVideoEffect)?.description}
                  </p>
                </CardContent>
              </Card>

              {/* Aspect Ratio */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">长宽比设置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-white text-sm mb-2">选择长宽比</label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-[#0f1419] border-[#203042]/60 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a2740] border-[#203042]/60">
                        <SelectItem value="1:1" className="text-white">1:1 (正方形)</SelectItem>
                        <SelectItem value="16:9" className="text-white">16:9 (横屏)</SelectItem>
                        <SelectItem value="9:16" className="text-white">9:16 (竖屏)</SelectItem>
                        <SelectItem value="4:3" className="text-white">4:3 (传统)</SelectItem>
                        <SelectItem value="3:4" className="text-white">3:4 (肖像)</SelectItem>
                        <SelectItem value="21:9" className="text-white">21:9 (超宽)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">
                      当前尺寸: {getCurrentDimensions()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Seed */}
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardHeader>
                  <CardTitle className="text-white text-sm">种子值 (Seed)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="留空则随机生成"
                      className="bg-[#0f1419] border-[#203042]/60 text-white flex-1"
                    />
                    <Button
                      onClick={generateRandomSeed}
                      variant="outline"
                      size="icon"
                      className="border-[#203042]/60 text-gray-400 hover:text-white hover:bg-[#203042]/80 shrink-0"
                      title="生成随机种子"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    相同提示词和种子值会生成相似图像
                  </p>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={() => handleGenerate(true)} // Changed to always generate new seed for main button
                disabled={isLoading || !user}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 h-12"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    生成图像
                  </>
                )}
              </Button>
              {/* New Redraw Button */}
              <Button
                onClick={handleRedraw}
                disabled={isLoading || !user || !generatedImage}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 h-12 mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    重绘中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    重绘图像
                  </>
                )}
              </Button>
            </div>

            {/* Right Panel - Results & History */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="result" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[#1a2740] border-[#203042]/60">
                  <TabsTrigger value="result" className="text-white data-[state=active]:bg-cyan-500">
                    生成结果
                  </TabsTrigger>
                  <TabsTrigger value="history" className="text-white data-[state=active]:bg-cyan-500">
                    <History className="h-4 w-4 mr-1" />
                    历史记录
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="result" className="mt-4">
                  <Card className="bg-[#1a2740] border-[#203042]/60">
                    <CardContent className="p-6">
                      <div className="aspect-square bg-[#0f1419] border-[#203042]/60 border rounded-lg flex items-center justify-center min-h-[500px]">
                        {isLoading ? (
                          <div className="text-center">
                            <Loader2 className="mx-auto h-12 w-12 text-cyan-400 animate-spin mb-4" />
                            <p className="text-gray-400">正在生成您的专属图像...</p>
                          </div>
                        ) : generatedImage ? (
                          <div className="text-center w-full">
                            <img
                              src={generatedImage}
                              alt="Generated"
                              className="max-w-full max-h-[500px] rounded-lg shadow-lg mx-auto mb-4 object-contain"
                              onError={(e) => {
                                console.error('Image failed to load:', e);
                                toast({
                                  title: "图像加载失败",
                                  description: "请稍后重试或检查网络连接",
                                  variant: "destructive"
                                });
                              }}
                            />
                            <div className="flex gap-2 justify-center mb-4">
                              <Button 
                                onClick={handleDownload}
                                className="bg-cyan-500 hover:bg-cyan-600 text-white"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                下载图像
                              </Button>
                              <Button 
                                onClick={handleVideoConversion}
                                disabled={isVideoConverting}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                              >
                                {isVideoConverting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    施展魔法中...
                                  </>
                                ) : (
                                  <>
                                    <Video className="mr-2 h-4 w-4" />
                                    魔法转视频
                                  </>
                                )}
                              </Button>
                            </div>
                            {videoUrl && (
                              <div className="mt-4 p-4 bg-[#0f1419] rounded-lg">
                                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-purple-400" />
                                  魔法视频已生成:
                                </h3>
                                <video 
                                  src={videoUrl} 
                                  controls 
                                  className="w-full max-w-md mx-auto rounded-lg"
                                  poster={generatedImage}
                                >
                                  您的浏览器不支持视频播放
                                </video>
                                <div className="mt-2">
                                  <Button
                                    onClick={() => {
                                      const link = document.createElement('a');
                                      link.href = videoUrl;
                                      link.download = `nexus-ai-magic-video-${Date.now()}.mp4`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    }}
                                    size="sm"
                                    className="bg-purple-500 hover:bg-purple-600 text-white"
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    下载魔法视频
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <div className="w-24 h-24 mx-auto mb-4 bg-[#203042]/30 rounded-lg flex items-center justify-center">
                              <ImageIcon className="w-12 h-12" />
                            </div>
                            <p>生成的图像将在这里显示</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="history" className="mt-4">
                  <Card className="bg-[#1a2740] border-[#203042]/60">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-white">生成历史</CardTitle>
                      {history.length > 0 && (
                        <Button
                          onClick={clearHistory}
                          variant="outline"
                          size="sm"
                          className="border-red-400 text-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          清空
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent>
                      {history.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>暂无生成历史</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {history.map((item) => (
                            <div key={item.id} className="bg-[#0f1419] rounded-lg p-3 border border-[#203042]/60">
                              <img
                                src={item.image}
                                alt="History"
                                className="w-full aspect-square object-cover rounded mb-2"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = '/placeholder.svg';
                                }}
                              />
                              <p className="text-xs text-gray-400 truncate" title={item.prompt}>
                                {item.prompt}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(item.timestamp).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Image;