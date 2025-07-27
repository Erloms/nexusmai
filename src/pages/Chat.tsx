import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast"; // Updated import
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import ChatSidebar from '@/components/ChatSidebar';
import { Send, Crown, MessageSquare, Bot, Sparkles, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image'; // Added type for different message content
  imageUrl?: string; // For image messages
}

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
  const seed = Math.floor(Math.random() * 1000000); // Always generate a random seed for new images

  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;
};


const Chat = () => {
  const { toast } = useToast();
  const { hasPermission, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini'); // For general text generation
  const [selectedAgent, setSelectedAgent] = useState('xiaohongshu-strategist'); // For specialized agents
  const [chatMode, setChatMode] = useState<'general' | 'agent'>('general'); // 'general' or 'agent'
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // OpenRouter API Key (In a real application, this should be an environment variable or managed securely)
  const OPENROUTER_API_KEY = "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"; // Updated API Key

  // AI大模型列表 (包含Pollinations.ai和OpenRouter模型)
  const aiTextModels = [
    { id: "gpt-4o-mini", name: "GPT-4o-mini" }, // Pollinations.ai
    { id: "gpt-4o", name: "GPT-4o" }, // Pollinations.ai
    { id: "o1-mini", name: "o1-mini" }, // Pollinations.ai
    { id: "llama", name: "Llama 3.3 70B" }, // Pollinations.ai
    { id: "llamalight", name: "Llama 3.1 8B Instruct" }, // Pollinations.ai
    { id: "mistral", name: "Mistral Nemo" }, // Pollinations.ai
    { id: "deepseek", name: "DeepSeek-V3" }, // Pollinations.ai
    { id: "deepseek-r1", name: "DeepSeek-R1 Distill Qwen 32B" }, // Pollinations.ai
    { id: "deepseek-reasoner", name: "DeepSeek R1 - Full" }, // Pollinations.ai
    { id: "deepseek-r1-llama", name: "DeepSeek R1 - Llama 70B" }, // Pollinations.ai
    { id: "claude", name: "Claude 3.5 Haiku" }, // Pollinations.ai
    { id: "gemini", name: "Gemini 2.0 Flash" }, // Pollinations.ai
    { id: "gemini-thinking", name: "Gemini 2.0 Flash Thinking" }, // Pollinations.ai
    { id: "phi", name: "Phi-4 Multimodal Instruct" }, // Pollinations.ai
    { id: "qwen-coder", name: "Qwen 2.5 Coder 32B" }, // Pollinations.ai
    // OpenRouter models (通过ID格式区分，不显示来源)
    { id: "google/gemma-3n-e4b-it:free", name: "Gemma 3n 4B" },
    { id: "qwen/qwen3-235b-a22b:free", name: "Qwen 3 235B" },
    { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1" },
    { id: "deepseek/deepseek-chat-v3-0324:free", name: "DeepSeek v3" },
    { id: "agentica-org/deepcoder-14b-preview:free", name: "DeepCoder 14B" },
    { id: "meta-llama/llama-4-maverick:free", name: "Llama 4 Maverick" },
    { id: "moonshotai/kimi-dev-72b:free", name: "Kimi Dev 72B" },
  ];

  // AI智能体列表
  const aiAgents = [
    { id: "xiaohongshu-strategist", name: "小红书图文策略师", group: "内容创作", description: "爆款小红书内容一键生成" },
    { id: "seo-optimizer", name: "SEO优化大师", group: "营销推广", description: "提升网站排名和流量" },
    { id: "video-script-writer", name: "短视频脚本专家", group: "内容创作", description: "快速生成吸睛短视频脚本" },
    { id: "business-analyst", name: "商业数据分析师", group: "商业智能", description: "洞察市场趋势，辅助决策" },
    { id: "personal-trainer", name: "智能健身教练", group: "生活助手", description: "定制专属健身计划" },
    { id: "travel-planner", name: "全球旅行规划师", group: "生活助手", description: "个性化行程安排" },
    { id: "code-generator", name: "代码生成器", group: "开发工具", description: "快速生成代码片段或完整程序" },
    { id: "resume-optimizer", name: "简历优化师", group: "职业发展", description: "优化简历，提升面试机会" },
    { id: "mental-wellness-assistant", name: "心理咨询助手", group: "生活助手", description: "提供情绪支持和心理建议" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 通用文本生成API调用
  const callTextAPI = async (prompt: string, modelId: string): Promise<string> => {
    setIsLoading(true);
    const selectedModelConfig = aiTextModels.find(m => m.id === modelId);
    if (!selectedModelConfig) {
      throw new Error("Selected model not found.");
    }

    let aiResponse = '';
    try {
      const isPollinationsModel = !modelId.includes('/'); 
      
      if (isPollinationsModel) {
        const encodedPrompt = encodeURIComponent(prompt);
        const apiUrl = `https://text.pollinations.ai/${encodedPrompt}?model=${modelId}`;
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`Pollinations API error: ${response.status}`);
        }
        
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          
          aiResponse += chunk; 
          
          setMessages(prev => {
            const newMessages = [...prev];
            let lastAssistantMessageIndex = -1;
            for (let i = newMessages.length - 1; i >= 0; i--) {
              if (newMessages[i].role === 'assistant' && newMessages[i].type === 'text') {
                lastAssistantMessageIndex = i;
                break;
              }
            }
            if (lastAssistantMessageIndex !== -1) {
              newMessages[lastAssistantMessageIndex].content = aiResponse;
            } else {
              newMessages.push({ id: Date.now().toString(), role: 'assistant', content: aiResponse, timestamp: new Date(), type: 'text' });
            }
            return newMessages;
          });
        }
      } else { 
        const openRouterApiUrl = "https://openrouter.ai/api/v1/chat/completions";
        const response = await fetch(openRouterApiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelId,
            messages: [{ role: "user", content: prompt }],
            stream: true, 
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`OpenRouter API error: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          
          chunk.split('\n').forEach(line => {
            if (line.startsWith('data: ')) {
              const jsonStr = line.substring(6);
              if (jsonStr === '[DONE]') {
                return;
              }
              try {
                const data = JSON.parse(jsonStr);
                if (data.choices && data.choices.length > 0 && data.choices[0].delta && data.choices[0].delta.content) {
                  aiResponse += data.choices[0].delta.content;
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsg = newMessages[newMessages.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant' && lastMsg.type === 'text') {
                      lastMsg.content = aiResponse;
                    } else {
                      newMessages.push({ id: Date.now().toString(), role: 'assistant', content: aiResponse, timestamp: new Date(), type: 'text' });
                    }
                    return newMessages;
                  });
                }
              } catch (e) {
                console.error("Error parsing OpenRouter stream chunk:", e, jsonStr);
              }
            }
          });
        }
      }
      
      return aiResponse;
    } catch (error: any) {
      console.error("API call error:", error);
      toast({
        title: "模型调用失败",
        description: `请重试或切换其他模型: ${error.message}`,
        variant: "destructive"
      });
      return "抱歉，我在处理您的请求时遇到了问题。请稍后再试。";
    } finally {
      setIsLoading(false);
    }
  };

  // 智能体API调用
  const callAgentAPI = async (userPrompt: string, agentId: string): Promise<Message[]> => {
    setIsLoading(true);
    const generatedMessages: Message[] = [];

    try {
      if (agentId === 'xiaohongshu-strategist') {
        const topic = userPrompt.replace('帮我分析', '').trim() || '小红书爆款笔记';

        // Define the system prompt for the Xiaohongshu strategist
        const systemPrompt = `你现在是小红书爆款笔记的专业策略师。你的任务是根据用户提供的主题，生成三套完整的小红书笔记文案，每套文案都应包含：
1.  **标题：** 吸引眼球，包含表情符号和关键词。
2.  **正文：** 结构清晰，内容丰富，有故事性或实用性，分点阐述，并包含互动引导。
3.  **话题标签：** 至少5个相关热门标签。
4.  **互动引导：** 鼓励用户评论、点赞、收藏或分享。

请严格按照以下三种类型各生成一套文案：
-   **情感共鸣型：** 侧重分享个人经历、感受，引发读者情感共鸣。
-   **实用干货型：** 提供具体方法、教程、清单，解决读者实际问题。
-   **商业变现型：** 引导用户了解产品/服务，促进转化，可包含福利或资源包钩子。

请确保每套文案内容完整、连贯，且符合小红书的平台风格。不要包含任何广告或推广信息，只专注于文案本身。

用户主题：${topic}
`;

        // Call OpenRouter for text generation for the agent
        const openRouterApiUrl = "https://openrouter.ai/api/v1/chat/completions";
        const textResponse = await fetch(openRouterApiUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // Using gpt-4o-mini for agent text generation
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `请为主题 "${topic}" 生成小红书笔记文案。` }
            ],
            stream: false, // Get full response at once for structured content
          }),
        });

        if (!textResponse.ok) {
          const errorData = await textResponse.json();
          throw new Error(`OpenRouter API error for agent: ${textResponse.status} - ${errorData.message || JSON.stringify(errorData)}`);
        }

        const textData = await textResponse.json();
        const generatedTextContent = textData.choices[0]?.message?.content || "未能生成文案。";

        // Add the generated text content as the first message from the assistant
        generatedMessages.push({
          id: Date.now().toString() + '-text-content',
          role: 'assistant',
          content: generatedTextContent,
          timestamp: new Date(),
          type: 'text'
        });

        // Image prompts for each section, following detailed structure
        const imagePrompts = {
          emotional: "A cozy cat sleeping on a book, warm lighting, soft colors, high quality, no watermark, emotional, comforting, soft focus, digital painting, by loish",
          practical: "A person studying analytics, vibrant colors, digital art, high quality, no watermark, practical, insightful, clean lines, vector art, by piet mondrian",
          monetization: "A person counting money, surrounded by digital graphs, vibrant colors, abstract background, high quality, no watermark, monetization, success, dynamic, abstract, by jackson pollock"
        };

        // Generate images concurrently using Pollinations.ai
        const [
          imgUrl1, imgUrl2, imgUrl3, imgUrl4,
          imgUrl5, imgUrl6, imgUrl7, imgUrl8,
          imgUrl9, imgUrl10, imgUrl11, imgUrl12
        ] = await Promise.all([
          constructPollinationsImageUrl(imagePrompts.emotional, { model: 'flux-realism', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.emotional, { model: 'flux-realism', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.emotional, { model: 'flux-realism', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.emotional, { model: 'flux-realism', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.practical, { model: 'flux', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.practical, { model: 'flux', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.practical, { model: 'flux', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.practical, { model: 'flux', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.monetization, { model: 'flux-cablyai', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.monetization, { model: 'flux-cablyai', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.monetization, { model: 'flux-cablyai', width: 1024, height: 768 }),
          constructPollinationsImageUrl(imagePrompts.monetization, { model: 'flux-cablyai', width: 1024, height: 768 }),
        ]);

        // Add image messages after the text content
        generatedMessages.push({ id: Date.now().toString() + '-img-1', role: 'assistant', content: '情感共鸣型配图1', imageUrl: imgUrl1, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-2', role: 'assistant', content: '情感共鸣型配图2', imageUrl: imgUrl2, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-3', role: 'assistant', content: '情感共鸣型配图3', imageUrl: imgUrl3, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-4', role: 'assistant', content: '情感共鸣型配图4', imageUrl: imgUrl4, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-5', role: 'assistant', content: '实用干货型配图1', imageUrl: imgUrl5, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-6', role: 'assistant', content: '实用干货型配图2', imageUrl: imgUrl6, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-7', role: 'assistant', content: '实用干货型配图3', imageUrl: imgUrl7, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-8', role: 'assistant', content: '实用干货型配图4', imageUrl: imgUrl8, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-9', role: 'assistant', content: '商业变现型配图1', imageUrl: imgUrl9, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-10', role: 'assistant', content: '商业变现型配图2', imageUrl: imgUrl10, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-11', role: 'assistant', content: '商业变现型配图3', imageUrl: imgUrl11, timestamp: new Date(), type: 'image' });
        generatedMessages.push({ id: Date.now().toString() + '-img-12', role: 'assistant', content: '商业变现型配图4', imageUrl: imgUrl12, timestamp: new Date(), type: 'image' });

      } else if (agentId === 'code-generator') {
        generatedMessages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: `您选择了代码生成器。请告诉我您需要生成什么语言的代码，以及具体的功能需求，例如：“用Python写一个计算斐波那契数列的函数。”`,
          timestamp: new Date(),
          type: 'text'
        });
      } else if (agentId === 'resume-optimizer') {
        generatedMessages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: `您选择了简历优化师。请粘贴您的简历内容，或者告诉我您的目标职位和主要经历，我将为您提供优化建议。`,
          timestamp: new Date(),
          type: 'text'
        });
      } else if (agentId === 'mental-wellness-assistant') {
        generatedMessages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: `您选择了心理咨询助手。请告诉我您现在的心情或遇到的困扰，我将尽力为您提供支持和一些建议。请注意，我无法替代专业的心理医生。`,
          timestamp: new Date(),
          type: 'text'
        });
      } else if (agentId === 'business-analyst') {
        generatedMessages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: `您选择了商业数据分析师。目前我只能基于您提供的文本信息进行模拟分析。请描述您想分析的数据类型和问题，例如：“分析一下过去一年销售额的增长趋势。”`,
          timestamp: new Date(),
          type: 'text'
        });
      } else {
        // Fallback for other agents - use a general text model
        const responseContent = await callTextAPI(userPrompt, "gpt-4o-mini"); // Use a default text model for other agents
        generatedMessages.push({
          id: Date.now().toString(),
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
          type: 'text'
        });
      }
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced delay for faster feedback
      
      return generatedMessages;
    } catch (error) {
      console.error("API调用错误:", error);
      toast({
        title: "智能体调用失败",
        description: "请重试或切换其他智能体",
        variant: "destructive"
      });
      return [{ id: Date.now().toString(), role: 'assistant', content: "抱歉，我在处理您的请求时遇到了问题。请稍后再试。", timestamp: new Date(), type: 'text' }];
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!hasPermission('chat')) {
      toast({ 
        title: "需要会员权限", 
        description: "请升级会员以使用AI对话功能", 
        variant: "destructive" 
      });
      return;
    }

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      type: 'text'
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');

    // Add a temporary "thinking" message for the assistant
    const thinkingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'AI正在思考...',
      timestamp: new Date(),
      type: 'text'
    };
    setMessages(prev => [...prev, thinkingMessage]);


    try {
      let newAssistantMessages: Message[] = [];

      if (chatMode === 'general') {
        const responseContent = await callTextAPI(currentInput, selectedModel); 
        newAssistantMessages.push({
            id: (Date.now() + 2).toString(), // Ensure unique ID
            role: 'assistant',
            content: responseContent,
            timestamp: new Date(),
            type: 'text'
        });
      } else { 
        newAssistantMessages = await callAgentAPI(currentInput, selectedAgent);
      }

      // Replace the thinking message with the actual response(s)
      setMessages(prev => {
        const updatedPrev = prev.filter(msg => msg.id !== thinkingMessage.id); // Remove thinking message
        return [...updatedPrev, ...newAssistantMessages];
      });

      // Save chat history
      if (user?.id) {
        const chatHistory = {
          id: Date.now().toString(),
          title: currentInput.slice(0, 50) + (currentInput.length > 50 ? '...' : ''),
          timestamp: new Date().toISOString(),
          preview: currentInput.slice(0, 100),
          messages: [...messages, userMessage, ...newAssistantMessages], // Include all messages
          model: selectedModel, 
          agent: selectedAgent, 
          mode: chatMode 
        };

        const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
        const updatedHistory = [chatHistory, ...existingHistory].slice(0, 10);
        localStorage.setItem(`chat_history_${user.id}`, JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "发送失败",
        description: "消息发送失败，请重试",
        variant: "destructive"
      });
      // Remove thinking message if an error occurs
      setMessages(prev => prev.filter(msg => msg.id !== thinkingMessage.id));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setChatMode('general'); 
    setSelectedModel('gpt-4o-mini'); 
    setSelectedAgent('xiaohongshu-strategist'); 
  };

  const handleLoadHistory = (historyId: string) => {
    if (user?.id) {
      const existingHistory = JSON.parse(localStorage.getItem(`chat_history_${user.id}`) || '[]');
      const historyItem = existingHistory.find((item: any) => item.id === historyId);
      if (historyItem && historyItem.messages) {
        const loadedMessages = historyItem.messages.map((msg: Message) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(loadedMessages);
        setSelectedModel(historyItem.model || 'gpt-4o-mini');
        setSelectedAgent(historyItem.agent || 'xiaohongshu-strategist');
        setChatMode(historyItem.mode || 'general');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f2e] to-[#0f1419] flex">
      <Navigation />
      
      <div className="flex w-full pt-16">
        {/* 左侧边栏 */}
        <div className="w-80 flex-shrink-0">
          <ChatSidebar 
            onModelChange={setSelectedModel} 
            selectedModel={selectedModel}
            onLoadHistory={handleLoadHistory}
            onNewChat={handleNewChat}
            aiModels={aiTextModels} 
          />
        </div>

        {/* 主聊天区域 */}
        <div className="flex-1 flex flex-col">
          {/* 会员提示横幅 */}
          {!hasPermission('chat') && (
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-b border-yellow-500/30 p-4">
              <div className="flex items-center justify-between max-w-4xl mx-auto">
                <div className="flex items-center">
                  <Crown className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-yellow-100">开通会员即可享受15+顶尖AI智能体无限对话</span>
                </div>
                <Link to="/payment">
                  <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-2 rounded-full font-medium">
                    立即开通
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 模式/智能体/模型选择提示 */}
          {hasPermission('chat') && (
            <div className="bg-[#1a2740]/50 border-b border-[#203042]/30 p-3">
              <div className="max-w-4xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">当前模式:</span>
                  <span className="text-sm text-cyan-400 font-medium">
                    {chatMode === 'general' ? `通用对话 (${aiTextModels.find(m => m.id === selectedModel)?.name})` : `智能体 (${aiAgents.find(a => a.id === selectedAgent)?.name})`}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {chatMode === 'general' ? `支持 ${aiTextModels.length} 个AI大模型` : `支持 ${aiAgents.length} 个AI智能体`}
                </div>
              </div>
            </div>
          )}

          {/* 聊天消息区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4">开始对话</h2>
                  <p className="text-gray-400 text-lg">选择一个模式，开始您的智能对话之旅</p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <Button
                      className={`py-4 text-lg font-medium ${chatMode === 'general' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                      onClick={() => setChatMode('general')}
                    >
                      <MessageSquare className="mr-2 h-5 w-5" />
                      通用对话
                    </Button>
                    <Button
                      className={`py-4 text-lg font-medium ${chatMode === 'agent' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'}`}
                      onClick={() => setChatMode('agent')}
                    >
                      <Wand2 className="mr-2 h-5 w-5" />
                      智能体模式
                    </Button>
                  </div>

                  {chatMode === 'agent' && (
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                      {aiAgents.map((agent) => (
                        <div 
                          key={agent.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            selectedAgent === agent.id 
                              ? 'border-cyan-400 bg-cyan-400/10' 
                              : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                          }`}
                          onClick={() => setSelectedAgent(agent.id)}
                        >
                          <div className="text-sm font-medium text-white">{agent.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{agent.group}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-3xl rounded-2xl px-6 py-4 ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white ml-12' 
                          : 'bg-gray-800/80 text-gray-100 mr-12 border border-gray-700'
                      }`}>
                        {message.type === 'image' && message.imageUrl ? (
                          <img 
                            src={message.imageUrl} 
                            alt={message.content || "Generated image"} 
                            className="w-full max-w-md rounded-lg mb-3"
                          />
                        ) : (
                          <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                        )}
                        <div className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* 输入区域 */}
          <div className="border-t border-gray-700 p-6">
            <div className="max-w-4xl mx-auto">
              {!hasPermission('chat') ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">请先升级会员使用AI对话功能</p>
                  <Link to="/payment">
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-8 py-3 rounded-full font-medium">
                      立即升级会员
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="输入您的问题..."
                      className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 resize-none focus:border-cyan-400 focus:ring-cyan-400/20"
                      rows={1}
                      style={{ minHeight: '48px' }}
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-medium h-12 min-w-12"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;