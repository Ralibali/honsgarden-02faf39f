import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const STARTER_SUGGESTIONS = [
  'Varför har mina hönor slutat värpa?',
  'Vad ska jag göra om en höna tappar fjädrar?',
  'Hur ofta ska jag byta strö?',
  'Vilka hönor värper bäst just nu?',
];

export default function Agda() {
  const { user } = useAuth();
  const isPremium = user?.subscription_status === 'premium';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('agda-chat', {
        body: { message: text.trim(), history: newMessages.slice(-10) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      toast({ title: 'Fel', description: err.message || 'Kunde inte nå Agda', variant: 'destructive' });
      setMessages(newMessages); // keep user message
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!isPremium) {
    return (
      <motion.div
        className="max-w-2xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Agda 🐔</h1>
          <p className="text-sm text-muted-foreground mt-1">Din AI-hönskonsult</p>
        </div>
        <Card className="border-primary/20 bg-primary/3 shadow-sm">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-lg font-serif text-foreground">Agda är en Plus-funktion</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Med Plus kan du ställa frågor till Agda – din AI-hönskonsult som svarar baserat på din egna logghistorik.
            </p>
            <Button className="rounded-xl gap-1.5" onClick={() => window.location.href = '/app/premium'}>
              <Sparkles className="h-4 w-4" /> Uppgradera till Plus
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto flex flex-col"
      style={{ height: 'calc(100vh - 8rem)' }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-serif text-foreground">Agda 🐔</h1>
        <p className="text-sm text-muted-foreground mt-1">Fråga Agda om dina höns – hon känner din flock</p>
      </div>

      {/* Messages */}
      <Card className="flex-1 border-border shadow-sm overflow-hidden flex flex-col min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-3xl">🐔</span>
              </div>
              <h3 className="font-serif text-lg text-foreground mb-1">Hej! Jag är Agda.</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Jag kan svara på frågor om dina höns baserat på din logghistorik. Vad undrar du?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {STARTER_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left text-xs p-3 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/30 hover:bg-primary/5 transition-all text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-sm">🐔</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted/60 text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-2' : ''}>{line}</p>
                  ))}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-3.5 w-3.5 text-accent" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm">🐔</span>
              </div>
              <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-muted-foreground/40"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border bg-background">
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              placeholder="Skriv till Agda..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border-border/60"
              disabled={loading}
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="h-10 w-10 rounded-xl p-0"
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </motion.div>
  );
}
