import React, { useState, useEffect } from 'react';
import { Palette, Sparkles, Download, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ImageShowcase = () => {
  const { toast } = useToast();
  const [api1, setApi1] = useState<CarouselApi>();
  const [api2, setApi2] = useState<CarouselApi>();
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const showcaseImages = [
    {
      url: "/lovable-uploads/3d4bec65-5070-4b7e-a7b8-3793c260ed13.png",
      title: "AI猫咪艺术",
      description: "优雅室内场景中的蓝色猫咪",
      prompt: "A beautiful blue cat in an elegant interior setting, soft lighting, cozy atmosphere"
    },
    {
      url: "/lovable-uploads/0bb49517-db51-4ccc-b82b-6ceecc80c8d8.png",
      title: "现代室内设计",
      description: "温馨舒适的现代居家空间",
      prompt: "Modern cozy living room interior, warm lighting, contemporary furniture"
    },
    {
      url: "/lovable-uploads/f0a497f8-ba29-43f4-adf0-7cbe79e589a7.png",
      title: "赛博朋克工作站",
      description: "未来科技感的办公环境",
      prompt: "Cyberpunk futuristic workstation, neon lights, high-tech office environment"
    },
    {
      url: "/lovable-uploads/422c49d8-b952-4d1b-a8a8-42a64c3fe9cf.png",
      title: "魔法猫咪世界",
      description: "神秘魔法环境中的可爱猫咪",
      prompt: "Magical cat in mystical environment, fantasy atmosphere, enchanted setting"
    },
    {
      url: "/lovable-uploads/1a903df0-2684-445c-970d-451f4dd16486.png",
      title: "霓虹动物城",
      description: "赛博朋克风格的动物世界",
      prompt: "Cyberpunk animal city, neon lights, futuristic animal characters"
    },
    {
      url: "/lovable-uploads/ad6155cf-9c08-4c17-aa70-fcef934a5e15.png",
      title: "绚烂花束",
      description: "色彩缤纷的艺术花卉创作",
      prompt: "Vibrant colorful flower bouquet, artistic style, beautiful floral arrangement"
    },
    {
      url: "/lovable-uploads/06031b32-4a62-4ac5-8e20-c5c0b5e27e48.png",
      title: "霓虹牛头",
      description: "未来主义风格的机械生物",
      prompt: "Futuristic mechanical bull head, neon style, cyberpunk creature"
    },
    {
      url: "/lovable-uploads/d728db1d-febd-46e1-975b-e5783c3eabc4.png",
      title: "欧洲小镇",
      description: "温馨浪漫的雨夜街景",
      prompt: "European town street at night, romantic rainy evening, warm street lights"
    },
    {
      url: "/lovable-uploads/49b1d8d8-c189-444b-b2de-80c73d893b6a.png",
      title: "恐龙自拍",
      description: "博物馆中的创意恐龙艺术",
      prompt: "Creative dinosaur selfie in museum, playful art concept, fun prehistoric scene"
    },
    // 添加上传的新图片
    {
      url: "/lovable-uploads/b22c9e81-7fbd-453e-8010-385a7f2ba0ad.png",
      title: "梦幻独角兽",
      description: "粉色独角兽与纸杯蛋糕的梦幻场景",
      prompt: "Dreamy pink unicorn with cupcakes, magical sparkles, pastel colors, cute fantasy scene"
    },
    {
      url: "/lovable-uploads/db87a591-cc78-4494-a702-572ebce72f10.png",
      title: "月夜茶具",
      description: "月光下的神秘茶具组合",
      prompt: "Mysterious tea set under moonlight, elegant porcelain, atmospheric night scene"
    },
    {
      url: "/lovable-uploads/bad8f970-b81a-4221-a1af-59522bc1c739.png",
      title: "神经网络艺术",
      description: "发光的神经网络连接图案",
      prompt: "Glowing neural network connections, digital art, futuristic data visualization"
    }
  ];

  // 第二行展示图片 - 扩展更多图片
  const showcaseImagesRow2 = [
    {
      url: "/lovable-uploads/67cf3145-f230-4c18-ae01-c7371c39ee85.png",
      title: "神秘占卜",
      description: "星空下的神秘占卜场景",
      prompt: "Mystical divination scene under starry sky, magical circles, candlelight atmosphere"
    },
    {
      url: "/lovable-uploads/36cc3148-af93-4f0e-8038-8540420e496b.png",
      title: "黄金图腾",
      description: "精美的黄金图腾艺术",
      prompt: "Exquisite golden totem art, intricate patterns, ornate metalwork, ancient symbols"
    },
    {
      url: "/lovable-uploads/53e4c463-7e0d-464c-b7a9-10ed60e3d4ed.png",
      title: "温馨居家",
      description: "现代奢华的室内设计",
      prompt: "Modern luxury interior design, warm lighting, elegant home decor"
    },
    {
      url: "/lovable-uploads/e3cd23d2-a08e-458e-a5d5-ae60a4def4e5.png",
      title: "茶艺对比",
      description: "茶杯的前后对比艺术",
      prompt: "Tea cup before and after comparison, artistic lighting, warm bokeh background"
    },
    {
      url: "/lovable-uploads/c8663201-3d7a-4000-b62c-2fa92a4f4447.png",
      title: "象棋与海浪",
      description: "海洋背景下的艺术象棋",
      prompt: "Artistic chess set against ocean waves, dramatic sky, surreal composition"
    },
    {
      url: "/lovable-uploads/5bdc6013-1fdb-4642-bac6-3c60332ace8a.png",
      title: "云中鲸鱼",
      description: "梦幻云朵中的巨鲸",
      prompt: "Majestic whale floating in dreamy clouds, golden hour lighting, fantasy atmosphere"
    },
    {
      url: "/lovable-uploads/2cdaca26-7fcb-4be4-80c6-0eb16fd748fb.png",
      title: "静物橙子",
      description: "艺术风格的橙子静物画",
      prompt: "Artistic still life with oranges, modern painting style, vibrant colors"
    },
    {
      url: "/lovable-uploads/260b8ca9-3f0f-48eb-9be2-d7e4e40a38f7.png",
      title: "月夜森林",
      description: "神秘月光下的魔法森林",
      prompt: "Mystical forest under moonlight, magical atmosphere, ethereal glow"
    },
    {
      url: "/lovable-uploads/759c068d-45f9-4e68-8503-839ad9c2186f.png",
      title: "阳光庭院",
      description: "温馨的阳光庭院景色",
      prompt: "Peaceful sunny garden with picnic tables, warm natural lighting"
    },
    {
      url: "/lovable-uploads/49ddf65d-4ef4-46a1-94b7-2936d866be27.png",
      title: "数字莲花",
      description: "科技感十足的数字莲花",
      prompt: "Digital lotus flower with binary code patterns, glowing neon effects"
    }
  ];

  // 自动轮播功能 - 两行不同方向轮播
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval1 = setInterval(() => {
      api1?.scrollNext();
    }, 3000);

    const interval2 = setInterval(() => {
      api2?.scrollPrev(); // 第二行向左轮播
    }, 3500); // 稍微不同的间隔，避免同步

    return () => {
      clearInterval(interval1);
      clearInterval(interval2);
    };
  }, [api1, api2, isAutoPlaying]);

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast({
      title: "提示词已复制",
      description: "已复制到剪贴板，可直接用于AI绘画",
    });
  };

  const downloadImage = (url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title}.png`;
    link.click();
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern bg-[length:30px_30px] opacity-5 z-0"></div>
      <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] bg-nexus-purple/10 rounded-full blur-[60px] z-0"></div>
      <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-nexus-blue/10 rounded-full blur-[40px] z-0"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Palette className="h-8 w-8 text-nexus-cyan mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold text-gradient">AI绘画作品展示</h2>
          </div>
          <p className="text-white/70 text-lg mb-8">探索AI创作的无限可能</p>
          
          {/* 轮播控制 */}
          <div className="flex justify-center mb-8">
            <Button
              onClick={toggleAutoPlay}
              className="bg-nexus-cyan/20 border border-nexus-cyan/30 text-nexus-cyan hover:bg-nexus-cyan/30"
            >
              {isAutoPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isAutoPlaying ? '暂停轮播' : '开始轮播'}
            </Button>
          </div>
        </div>

        {/* 第一行轮播 - 向右 */}
        <div className="mb-12">
          <Carousel 
            className="w-full max-w-6xl mx-auto" 
            opts={{ align: "start", loop: true }}
            setApi={setApi1}
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {showcaseImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="group relative bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 p-4 rounded-xl border border-nexus-blue/20 backdrop-blur-md hover:scale-105 transition-all duration-300">
                    <div className="relative overflow-hidden rounded-lg mb-4">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                        <Button
                          size="sm"
                          onClick={() => downloadImage(image.url, image.title)}
                          className="bg-nexus-blue/80 text-white p-1 h-auto"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Sparkles className="h-5 w-5 text-nexus-cyan" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{image.title}</h3>
                    <p className="text-white/70 text-sm">{image.description}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 bg-nexus-dark/80 border-nexus-blue/30 text-white hover:bg-nexus-blue/80" />
            <CarouselNext className="right-4 bg-nexus-dark/80 border-nexus-blue/30 text-white hover:bg-nexus-blue/80" />
          </Carousel>
        </div>

        {/* 第二行轮播 - 向左 */}
        <Carousel 
          className="w-full max-w-6xl mx-auto" 
          opts={{ align: "start", loop: true }}
          setApi={setApi2}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {showcaseImagesRow2.map((image, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="group relative bg-gradient-to-br from-nexus-dark/80 to-nexus-cyan/30 p-4 rounded-xl border border-nexus-cyan/20 backdrop-blur-md hover:scale-105 transition-all duration-300">
                  <div className="relative overflow-hidden rounded-lg mb-4">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-nexus-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => downloadImage(image.url, image.title)}
                        className="bg-nexus-blue/80 text-white p-1 h-auto"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Sparkles className="h-5 w-5 text-nexus-cyan" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{image.title}</h3>
                  <p className="text-white/70 text-sm">{image.description}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4 bg-nexus-dark/80 border-nexus-cyan/30 text-white hover:bg-nexus-cyan/80" />
          <CarouselNext className="right-4 bg-nexus-dark/80 border-nexus-cyan/30 text-white hover:bg-nexus-cyan/80" />
        </Carousel>
      </div>
    </section>
  );
};

export default ImageShowcase;