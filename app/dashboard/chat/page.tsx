'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User as UserIcon, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { supabase, ChatMessage } from '@/lib/supabase';
import { getChatResponse, quickPrompts } from '@/lib/chat-engine';
import { CardAnimation } from '@/components/animations';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

type DisplayMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  category?: string;
  created_at: string;
};

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);
      if (data && data.length > 0) {
        setMessages(data as ChatMessage[]);
      } else {
        // Welcome message
        const welcome: DisplayMessage = {
          id: 'welcome',
          role: 'assistant',
          content: getChatResponse('hello').content,
          category: 'General Help',
          created_at: new Date().toISOString(),
        };
        setMessages([welcome]);
      }
      setLoadingHistory(false);
    })();
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading || !user) return;

    setInput('');
    setLoading(true);

    const userMsg: DisplayMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Save user message
    await supabase.from('chat_messages').insert({
      user_id: user.id, role: 'user', content: messageText,
    });

    // Simulate AI thinking
    await new Promise(r => setTimeout(r, 800));

    const response = getChatResponse(messageText);
    const aiMsg: DisplayMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      category: response.category,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, aiMsg]);

    // Save AI message
    await supabase.from('chat_messages').insert({
      user_id: user.id, role: 'assistant', content: response.content,
    });

    setLoading(false);
  };

  const handleClearChat = async () => {
    if (!user) return;
    await supabase.from('chat_messages').delete().eq('user_id', user.id);
    const welcome: DisplayMessage = {
      id: 'welcome', role: 'assistant', content: getChatResponse('hello').content,
      category: 'General Help', created_at: new Date().toISOString(),
    };
    setMessages([welcome]);
    toast.success('Chat history cleared');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-primary" /> Emergency Chat
          </h1>
          <p className="text-sm text-muted-foreground mt-1">AI-powered emergency safety assistant — available 24/7</p>
        </div>
        {messages.length > 1 && (
          <Button variant="ghost" size="sm" onClick={handleClearChat}>
            <Trash2 className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      <CardAnimation>
        <Card className="h-[calc(100vh-220px)] flex flex-col">
          <CardHeader className="border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">DisasterEye Assistant</CardTitle>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                      msg.role === 'user' ? 'bg-muted' : 'bg-gradient-to-br from-primary to-chart-5'
                    )}>
                      {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4 text-white" />}
                    </div>
                    <div className={cn('max-w-[80%] rounded-2xl p-4', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                      {msg.category && msg.role === 'assistant' && (
                        <Badge className="mb-2 bg-primary/20 text-primary border-0">{msg.category}</Badge>
                      )}
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-chart-5 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-muted rounded-2xl p-4 flex items-center gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && !loading && (
            <div className="px-4 pb-2 flex-shrink-0">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted hover:border-primary/50 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-4 flex-shrink-0">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about flood safety, CPR, earthquake procedures..."
                disabled={loading}
              />
              <Button onClick={() => handleSend()} disabled={loading || !input.trim()} className="bg-gradient-to-r from-primary to-chart-5 text-white hover:opacity-90">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">For emergencies, always call 911/112/100 first. This assistant provides guidance only.</p>
          </div>
        </Card>
      </CardAnimation>
    </div>
  );
}
