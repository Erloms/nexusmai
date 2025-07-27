import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Volume2, 
  Download, 
  CheckCircle2,
  BookText, // For strict reading
  Sparkles, // For interpretive reading
  User, Mic, Speaker, Feather, Smile, Music, Heart, Star, Sun, Cloud, Gift, Bell, Camera, Film // Additional icons
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

interface VoiceOption {
  id: string;
  name: string;
  description: string;
  color: string;
  gender?: 'male' | 'female' | 'neutral'; // Added gender for avatar generation
  avatarUrl?: string; // Added avatarUrl
}

interface HistoryItem {
  id: number;
  timestamp: Date;
  voice: string;
  text: string; // Original text
  audioUrl?: string;
  readingMode: 'strict' | 'interpretive';
  rephrasedText?: string; // Store rephrased text if applicable
}

const Voice = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, checkPaymentStatus } = useAuth();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [readingMode, setReadingMode] = useState<'strict' | 'interpretive'>('strict'); // New state for reading mode
  const audioRef = useRef<HTMLAudioElement>(null);

  // Function to generate a consistent color based on string hash
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  };

  // Base voice options without avatarUrl
  const baseVoiceOptions: (Omit<VoiceOption, 'avatarUrl'> & { gender?: 'male' | 'female' | 'neutral' })[] = [
    { id: 'alloy', name: 'Alloy', description: '平衡中性', color: stringToColor('alloy'), gender: 'male' },
    { id: 'echo', name: 'Echo', description: '深沉有力', color: stringToColor('echo'), gender: 'male' },
    { id: 'fable', name: 'Fable', description: '温暖讲述', color: stringToColor('fable'), gender: 'female' },
    { id: 'onyx', name: 'Onyx', description: '威严庄重', color: stringToColor('onyx'), gender: 'male' },
    { id: 'nova', name: 'Nova', description: '友好专业', color: stringToColor('nova'), gender: 'female' },
    { id: 'shimmer', name: 'Shimmer', description: '轻快明亮', color: stringToColor('shimmer'), gender: 'female' },
    { id: 'coral', name: 'Coral', description: '温柔平静', color: stringToColor('coral'), gender: 'female' },
    { id: 'verse', name: 'Verse', description: '生动诗意', color: stringToColor('verse'), gender: 'male' },
    { id: 'ballad', name: 'Ballad', description: '抒情柔和', color: stringToColor('ballad'), gender: 'female' },
    { id: 'ash', name: 'Ash', description: '思考沉稳', color: stringToColor('ash'), gender: 'male' },
    { id: 'sage', name: 'Sage', description: '智慧老练', color: stringToColor('sage'), gender: 'male' },
    { id: 'amuch', name: 'Amuch', description: '清晰有力', color: stringToColor('amuch'), gender: 'male' },
    { id: 'aster', name: 'Aster', description: '柔和自然', color: stringToColor('aster'), gender: 'female' },
    { id: 'brook', name: 'Brook', description: '流畅舒适', color: stringToColor('brook'), gender: 'female' },
    { id: 'clover', name: 'Clover', description: '活泼年轻', color: stringToColor('clover'), gender: 'female' },
    { id: 'dan', name: 'Dan', description: '男声稳重', color: stringToColor('dan'), gender: 'male' },
    { id: 'elan', name: 'Elan', description: '优雅流利', color: stringToColor('elan'), gender: 'female' },
    { id: 'marilyn', name: 'Marilyn', description: '甜美悦耳', color: stringToColor('marilyn'), gender: 'female' },
    { id: 'meadow', name: 'Meadow', description: '清新宁静', color: stringToColor('meadow'), gender: 'female' },
    { id: 'browser-native', name: 'System Voice', description: '系统内置语音', color: stringToColor('browser-native'), gender: 'neutral' }, // Changed name and description
  ];

  const voiceOptions: VoiceOption[] = baseVoiceOptions.map((voice, index) => {
    const seed = voice.name.replace(/\s/g, '');
    const avatarType = 'avataaars';
    const avatarColor = stringToColor(seed).substring(1); // Use seed for consistent color

    // Simplified avatarParams to ensure basic human-like avatars
    const avatarParams = ''; // No extra parameters

    const newVoice: VoiceOption = {
      id: voice.id,
      name: voice.name,
      description: voice.description,
      color: voice.color,
      ...(voice.gender && { gender: voice.gender }), 
      avatarUrl: `https://api.dicebear.com/7.x/${avatarType}/svg?seed=${seed}&backgroundColor=${avatarColor}${avatarParams}`
    };
    return newVoice;
  });

  // A selection of icons to cycle through for voice options (fallback if avatar fails)
  const voiceIcons = [
    User, Mic, Speaker, Feather, Smile, Sparkles, Music, Heart, Star, Sun, Cloud, Gift, Bell, Camera, Film, BookText, Volume2
  ];

  const getVoiceIcon = (index: number) => {
    return voiceIcons[index % voiceIcons.length];
  };

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('nexusAiVoiceHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (e) {
        console.error('Failed to parse voice history', e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nexusAiVoiceHistory', JSON.stringify(history));
  }, [history]);

  const handleGenerateVoice = async () => {
    if (!isAuthenticated) {
      toast({
        title: "需要登录",
        description: "请先登录后再使用语音合成功能",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!checkPaymentStatus()) {
      toast({
        title: "会员功能",
        description: "语音合成是会员专享功能，请先升级为会员",
        variant: "destructive",
      });
      navigate('/payment');
      return;
    }

    if (!text.trim()) {
      toast({
        title: "内容为空",
        description: "请输入需要转换为语音的文本",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setAudioUrl(null); // Clear previous audio

    let generatedAudioUrl: string | null = null; 

    try {
      if (selectedVoice === 'browser-native') {
        // Use Web Speech API
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'zh-CN'; 
          window.speechSynthesis.speak(utterance);
          generatedAudioUrl = null; // Assign null for browser synthesis
          toast({
            title: "语音播放中",
            description: "正在使用浏览器内置语音合成，音质可能因浏览器而异。",
            variant: "default",
          });
        } else {
          throw new Error("您的浏览器不支持Web Speech API");
        }
      } else {
        // Call the new Edge Function
        const { data, error } = await supabase.functions.invoke('synthesize-voice', {
          body: {
            text: text,
            voice: selectedVoice,
            readingMode: readingMode
          },
          // The Edge Function will return the audio stream directly
          // We need to get the blob and create a URL for the audio element
          // Note: invoke() typically returns JSON, so we need to adjust how we handle the response.
          // For streaming binary data, a direct fetch might be better, or the Edge Function
          // needs to return a pre-signed URL to the audio.
          // For simplicity, let's assume the Edge Function returns a direct URL to the audio.
          // If the Edge Function streams, we'd need to handle it differently here.
          // Given the current Edge Function returns a Response with body, we need to convert it to a Blob.
        });

        if (error) {
          throw new Error(error.message || "语音合成Edge Function调用失败");
        }
        
        // The Edge Function is designed to stream the audio directly.
        // To play it in the browser, we need to create a Blob from the response stream.
        // The `supabase.functions.invoke` method is designed for JSON responses.
        // For streaming binary data, a direct `fetch` call to the Edge Function's URL is more appropriate.
        const edgeFunctionUrl = `https://gwueqkusxarhomnabcrg.supabase.co/functions/v1/synthesize-voice`; // Hardcode URL for simplicity

        const audioResponse = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}` // Pass user's auth token
          },
          body: JSON.stringify({
            text: text,
            voice: selectedVoice,
            readingMode: readingMode
          })
        });

        if (!audioResponse.ok) {
          const errorBody = await audioResponse.text();
          throw new Error(`语音合成Edge Function错误: ${audioResponse.status} - ${errorBody}`);
        }

        const audioBlob = await audioResponse.blob();
        generatedAudioUrl = URL.createObjectURL(audioBlob);
      }
      
      setAudioUrl(generatedAudioUrl);
      
      const newHistoryItem: HistoryItem = {
        id: Date.now(),
        timestamp: new Date(),
        voice: selectedVoice,
        text: text, // Always store original text in history
        audioUrl: generatedAudioUrl,
        readingMode: readingMode,
        rephrasedText: undefined // No rephrased content for these modes
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      
      if (selectedVoice !== 'browser-native') {
        toast({
          title: "语音生成成功",
          description: "您的文本已成功转换为语音",
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error generating audio:', error);
      toast({
        title: "生成失败",
        description: error.message || "语音生成过程中发生错误，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('nexusAiVoiceHistory');
    toast({
      title: "历史记录已清空",
      description: "所有生成历史已删除",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#151A25] via-[#181f33] to-[#10141e]">
      <Navigation />
      
      <main className="pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 标题区域 */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              AI 文本转音频
            </h1>
            <p className="text-gray-300 mb-8 text-lg">
              输入文字，选择语音风格，一键转换为自然流畅的语音。<br />
              支持多种音色音调，帮您创建专业水准的音频内容。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 左侧控制面板 */}
            <div className="space-y-8">
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-8 text-white">语音生成</h3>
                  
                  <div className="mb-8">
                    <h4 className="text-cyan-400 font-medium mb-6 text-lg">选择语音风格</h4>
                    <p className="text-gray-400 text-sm mb-6">
                      每种风格都有其独特的音色和表现力，选择最适合您内容的声音
                    </p>
                    
                    <RadioGroup 
                      value={selectedVoice} 
                      onValueChange={setSelectedVoice}
                      className="grid grid-cols-5 gap-3"
                    >
                      {voiceOptions.map((voice, index) => {
                        const VoiceIcon = getVoiceIcon(index);
                        return (
                          <div
                            key={voice.id}
                            className={`relative cursor-pointer p-2 rounded-lg border transition-all ${
                              selectedVoice === voice.id
                                ? 'border-cyan-400 bg-cyan-400/10'
                                : 'border-[#203042]/60 bg-[#0f1419] hover:bg-[#1a2740]'
                            }`}
                          >
                            <RadioGroupItem
                              value={voice.id}
                              id={`voice-${voice.id}`}
                              className="absolute opacity-0"
                            />
                            <label
                              htmlFor={`voice-${voice.id}`}
                              className="flex flex-col items-center cursor-pointer"
                            >
                              {selectedVoice === voice.id && (
                                <div className="absolute -top-2 -right-2 bg-cyan-400 rounded-full">
                                  <CheckCircle2 className="h-4 w-4 text-white" />
                                </div>
                              )}
                              <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center mb-1 relative overflow-hidden"
                                style={{ backgroundColor: voice.color }}
                              >
                                {voice.avatarUrl ? (
                                  <img 
                                    src={voice.avatarUrl} 
                                    alt={voice.name} 
                                    className="w-full h-full object-cover absolute inset-0" 
                                    onError={(e) => { 
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none'; // Hide the broken image
                                      const iconElement = target.nextElementSibling as HTMLElement;
                                      if (iconElement) iconElement.style.display = 'flex'; // Show icon
                                    }}
                                    onLoad={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'block'; // Ensure image is visible
                                      const iconElement = target.nextElementSibling as HTMLElement;
                                      if (iconElement) iconElement.style.display = 'none'; // Hide icon
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-full h-full flex items-center justify-center"
                                  style={{ display: voice.avatarUrl ? 'none' : 'flex' }} // Initially hide if avatarUrl exists
                                >
                                  <VoiceIcon className="h-4 w-4 text-white" />
                                </div>
                              </div>
                              <div className="text-white font-medium text-xs">{voice.name}</div>
                              <div className="text-gray-400 text-xs">{voice.description}</div>
                            </label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-cyan-400 font-medium mb-4 text-lg">朗读模式</h4>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => setReadingMode('strict')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          readingMode === 'strict'
                            ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        size="sm"
                      >
                        <BookText className="h-4 w-4" />
                        原文朗读
                      </Button>
                      <Button
                        onClick={() => setReadingMode('interpretive')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          readingMode === 'interpretive'
                            ? 'bg-purple-600 hover:bg-purple-700 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        size="sm"
                      >
                        <Sparkles className="h-4 w-4" />
                        智能演绎
                      </Button>
                    </div>
                    <p className="text-gray-400 text-xs mt-2 text-center">
                      {readingMode === 'strict' ? '严格按照输入文本朗读' : 'AI将以富有表现力的方式朗读您的文本'}
                    </p>
                  </div>

                  <div className="mb-8">
                    <Label htmlFor="text-input" className="text-cyan-400 font-medium mb-4 block text-lg">输入文本</Label>
                    <Textarea
                      id="text-input"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="在这里输入您的文本..." // Consistent placeholder
                      className="min-h-[180px] bg-[#0f1419] border-[#203042]/60 text-white placeholder-gray-500 focus:border-cyan-400 text-base"
                    />
                    <div className="flex justify-between items-center mt-3">
                      <p className="text-gray-400 text-sm">字符数: {text.length}</p>
                      <p className="text-gray-400 text-sm">色彩节律: 不调整</p>
                    </div>
                  </div>

                  <div className="flex justify-between mb-8">
                    <Button
                      onClick={handleGenerateVoice}
                      disabled={loading || !text.trim()}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-10 py-3 text-base"
                    >
                      {loading ? "生成中..." : "生成语音"}
                    </Button>
                    <Button variant="ghost" className="text-gray-400 hover:text-white">
                      按住对话 (Ctrl + ↵ Enter)
                    </Button>
                  </div>

                  <div className="bg-[#0f1419] rounded-lg p-6 border border-[#203042]/60">
                    <h4 className="text-white font-medium mb-3 text-base">使用小技巧</h4>
                    <ul className="text-gray-400 text-sm space-y-2 list-disc pl-5">
                      <li>输入适当的可明确描述的音频的简话和语调变化</li>
                      <li>不同音频风格适合不同场景，可以尝试多种风格找到最适合的</li>
                      <li>大段文本可以分为多个短段，生成后合并，效果更佳</li>
                      <li>特殊专业术语可能需要注音或微调以获得更准确的发音</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧音频预览和历史区域 */}
            <div className="space-y-8">
              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-6 text-white">音频预览</h3>
                  
                  {audioUrl ? (
                    <div className="space-y-6">
                      <div className="bg-[#0f1419] rounded-lg p-6 border border-[#203042]/60">
                        <div className="flex items-center mb-4">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                            style={{ 
                              backgroundColor: voiceOptions.find(v => v.id === selectedVoice)?.color || '#8B5CF6' 
                            }}
                          >
                            <Volume2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium text-base">
                              {voiceOptions.find(v => v.id === selectedVoice)?.name || 'Voice'}
                            </div>
                            <div className="text-gray-400 text-sm">
                              {voiceOptions.find(v => v.id === selectedVoice)?.description}
                            </div>
                          </div>
                        </div>
                        
                        <audio ref={audioRef} controls className="w-full mb-6" src={audioUrl}></audio>
                        
                        <div className="flex justify-end">
                          <Button 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = audioUrl;
                              link.download = `nexus-ai-voice-${Date.now()}.mp3`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              toast({
                                title: "下载开始",
                                description: "语音文件下载已开始",
                              });
                            }} 
                            className="bg-cyan-500 hover:bg-cyan-600"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (selectedVoice === 'browser-native' && !loading && text.trim()) ? (
                    <div className="h-80 bg-[#0f1419] rounded-lg flex items-center justify-center border border-[#203042]/60">
                      <p className="text-gray-500 text-base">
                        正在使用浏览器内置语音播放，无下载链接
                      </p>
                    </div>
                  ) : (
                    <div className="h-80 bg-[#0f1419] rounded-lg flex items-center justify-center border border-[#203042]/60">
                      <p className="text-gray-500 text-base">
                        {loading ? '正在生成语音，请稍等...' : '尚未生成语音'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-[#1a2740] border-[#203042]/60">
                <CardContent className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-white">历史记录</h3>
                    <Button 
                      variant="ghost" 
                      onClick={clearHistory}
                      className="text-red-400 hover:text-red-300 text-sm bg-red-400/10 hover:bg-red-400/20"
                    >
                      清空记录
                    </Button>
                  </div>
                  
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
                    <p className="text-yellow-300 text-sm">
                      生成记录提醒：后台正在处理，请等待下载。
                    </p>
                  </div>

                  {history.length > 0 ? (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {history.map((item) => (
                        <div 
                          key={item.id}
                          className="bg-[#0f1419] rounded-lg p-4 border border-[#203042]/60"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-cyan-400 rounded-full mr-3"></div>
                              <span className="text-cyan-400 font-medium text-sm">
                                {voiceOptions.find(v => v.id === item.voice)?.name || item.voice}
                              </span>
                              <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                                style={{ 
                                  backgroundColor: item.readingMode === 'strict' ? '#10B98120' : '#8B5CF620',
                                  color: item.readingMode === 'strict' ? '#10B981' : '#8B5CF6'
                                }}
                              >
                                {item.readingMode === 'strict' ? '原文' : '演绎'}
                              </span>
                            </div>
                            <span className="text-gray-400 text-xs">{formatTime(item.timestamp)}</span>
                          </div>
                          
                          <p className="text-white text-sm mb-3 line-clamp-2">{item.text}</p>
                          {item.rephrasedText && item.readingMode === 'interpretive' && (
                            <p className="text-gray-500 text-xs italic mb-3 line-clamp-2">
                              演绎后: {item.rephrasedText}
                            </p>
                          )}
                          
                          <div className="flex justify-end">
                            {item.audioUrl ? (
                              <Button 
                                size="sm"
                                className="bg-cyan-500 hover:bg-cyan-600 text-xs"
                                onClick={() => setAudioUrl(item.audioUrl)} // Set audioUrl to play this history item
                              >
                                下载
                              </Button>
                            ) : (
                              <span className="text-gray-500 text-xs">浏览器内置语音</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">暂无历史记录</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Voice;