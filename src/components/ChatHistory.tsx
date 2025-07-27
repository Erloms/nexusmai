
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, MessageSquare, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: Date;
  messages: ChatMessage[];
  model: string;
}

interface ChatHistoryProps {
  onLoadSession: (session: ChatSession) => void;
  currentSession?: ChatSession;
  onSaveCurrentSession: (title: string) => void;
}

const ChatHistory = ({ onLoadSession, currentSession, onSaveCurrentSession }: ChatHistoryProps) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = () => {
    if (!user) return;
    
    const historyKey = `chat_history_${user.id}`;
    const savedHistory = localStorage.getItem(historyKey);
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        const sessions = parsed.map((session: any) => ({
          ...session,
          timestamp: new Date(session.timestamp),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setSessions(sessions);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
  };

  const saveChatHistory = (newSessions: ChatSession[]) => {
    if (!user) return;
    
    const historyKey = `chat_history_${user.id}`;
    localStorage.setItem(historyKey, JSON.stringify(newSessions));
    setSessions(newSessions);
  };

  const saveCurrentSession = () => {
    if (!currentSession || !user) return;
    
    const title = currentSession.title || 
      (currentSession.messages.length > 0 
        ? currentSession.messages[0].text.slice(0, 30) + '...'
        : '新对话');
    
    const existingSessions = [...sessions];
    const existingIndex = existingSessions.findIndex(s => s.id === currentSession.id);
    
    if (existingIndex >= 0) {
      existingSessions[existingIndex] = { ...currentSession, title };
    } else {
      existingSessions.unshift({ ...currentSession, title });
    }
    
    // 只保留最近50个会话
    const limitedSessions = existingSessions.slice(0, 50);
    saveChatHistory(limitedSessions);
  };

  const deleteSession = (sessionId: string) => {
    const newSessions = sessions.filter(s => s.id !== sessionId);
    saveChatHistory(newSessions);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // 将此函数暴露给父组件
  React.useImperativeHandle(onSaveCurrentSession as any, () => ({
    saveCurrentSession
  }));

  return (
    <div className="w-full max-w-sm bg-gradient-to-br from-nexus-dark/80 to-nexus-purple/30 backdrop-blur-sm rounded-xl border border-nexus-blue/20 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <History className="h-5 w-5 text-nexus-cyan mr-2" />
          <h3 className="font-bold text-white">聊天记录</h3>
        </div>
        <Button
          onClick={saveCurrentSession}
          size="sm"
          variant="outline"
          className="border-nexus-blue/30 text-nexus-cyan hover:bg-nexus-blue/20 text-xs"
        >
          保存当前
        </Button>
      </div>
      
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">暂无聊天记录</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="group p-3 rounded-lg border border-nexus-blue/20 bg-nexus-dark/30 hover:bg-nexus-blue/10 transition-colors cursor-pointer"
                onClick={() => onLoadSession(session)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-sm font-medium truncate">
                      {session.title}
                    </h4>
                    <div className="flex items-center text-xs text-white/60 mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(session.timestamp)}
                    </div>
                    <p className="text-xs text-white/50 mt-1">
                      {session.messages.length} 条消息 • {session.model}
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatHistory;
