import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Loader2, ShieldAlert, Mic, MicOff, Volume2, VolumeX, ThumbsUp, ThumbsDown, MessageSquarePlus } from 'lucide-react';
import { Message, Feedback } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService } from '../services/notificationService';

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  onFeedback?: (feedback: Feedback) => void;
}

export function Chat({ messages, onSendMessage, isLoading, isVoiceEnabled, setIsVoiceEnabled, onFeedback }: ChatProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('uz-UZ');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleFeedback = (messageId: string, rating: 'up' | 'down') => {
    if (feedbackGiven[messageId]) return;
    
    setFeedbackGiven(prev => ({ ...prev, [messageId]: rating }));
    if (onFeedback) {
      onFeedback({
        messageId,
        rating,
        timestamp: Date.now()
      });
    }
  };

  const initRecognition = (lang: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
      
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        
        setInput(transcript);
        if (event.results[0].isFinal) {
          setIsListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          notificationService.notifyError('Mikrofonga ruxsat berilmagan. Iltimos, brauzer sozlamalarini tekshiring.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  };

  useEffect(() => {
    initRecognition(selectedLang);
  }, [selectedLang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const playAudio = (base64Data: string) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64Data}`);
    audio.play();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-600">
              <Bot size={32} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome to Adolat AI</h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Your multilingual legal assistant for Uzbekistan. Ask me anything about laws, contracts, or legal procedures.
            </p>
            <div className="grid grid-cols-1 gap-2 w-full">
              {['O\'zbekiston Mehnat kodeksi haqida ma\'lumot bering', 'How to register a business in Uzbekistan?', 'Как составить договор аренды?'].map((q, i) => (
                <button 
                  key={i}
                  onClick={() => onSendMessage(q)}
                  className="px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:border-blue-500 transition-all text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-4 max-w-3xl mx-auto",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-blue-600 text-white" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              )}>
                {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm group relative",
                msg.role === 'user' 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 rounded-tl-none"
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                      code: ({ children }) => <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded text-xs">{children}</code>,
                      pre: ({ children }) => <pre className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg overflow-x-auto mb-2">{children}</pre>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                
                {msg.audioData && (
                  <button 
                    onClick={() => playAudio(msg.audioData!)}
                    className="absolute -right-10 top-0 p-2 text-zinc-400 hover:text-blue-500 transition-colors"
                  >
                    <Volume2 size={16} />
                  </button>
                )}

                {msg.role === 'assistant' && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-4">
                    <div className="flex items-start gap-2 text-xs text-zinc-500 italic">
                      <ShieldAlert size={14} className="shrink-0 mt-0.5" />
                      <span>Ushbu javob sun’iy intellekt tomonidan yaratilgan bo‘lib, rasmiy yuridik maslahat hisoblanmaydi.</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            feedbackGiven[msg.id] === 'up' 
                              ? "bg-green-500/10 text-green-600" 
                              : "text-zinc-400 hover:text-green-600 hover:bg-green-500/10"
                          )}
                          title="Foydali"
                        >
                          <ThumbsUp size={14} />
                        </button>
                        <button
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={cn(
                            "p-1.5 rounded-lg transition-all",
                            feedbackGiven[msg.id] === 'down' 
                              ? "bg-red-500/10 text-red-600" 
                              : "text-zinc-400 hover:text-red-600 hover:bg-red-500/10"
                          )}
                          title="Foydasiz"
                        >
                          <ThumbsDown size={14} />
                        </button>
                      </div>
                      
                      <button className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                        <MessageSquarePlus size={12} />
                        Batafsil fikr
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <div className="flex gap-4 max-w-3xl mx-auto">
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg flex items-center justify-center shrink-0">
              <Bot size={18} />
            </div>
            <div className="px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl rounded-tl-none shadow-sm">
              <Loader2 size={18} className="animate-spin text-blue-600" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-3xl mx-auto flex items-center gap-2 mb-2">
          <button
            onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
              isVoiceEnabled 
                ? "bg-blue-600/10 text-blue-600 border border-blue-600/20" 
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800"
            )}
          >
            {isVoiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            Voice Mode: {isVoiceEnabled ? 'ON' : 'OFF'}
          </button>
          
          <div className="flex items-center gap-1 ml-2">
            {['uz-UZ', 'ru-RU', 'en-US'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => setSelectedLang(lang)}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tighter transition-all",
                  selectedLang === lang 
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900" 
                    : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                )}
              >
                {lang.split('-')[0]}
              </button>
            ))}
          </div>

          {isListening && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 animate-pulse uppercase tracking-wider bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              Eshityapman ({selectedLang.split('-')[0]})...
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Savolingizni ayting..." : "Huquqiy savol bering..."}
              className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-2xl px-4 py-4 pr-12 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white shadow-inner"
            />
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all",
                isListening ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10"
              )}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-600/20 hover:scale-105 active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
        <p className="text-[10px] text-center text-zinc-500 mt-2 uppercase tracking-widest font-medium">
          Adolat AI • O'zbekiston Huquqiy Ekotizimi
        </p>
      </div>
    </div>
  );
}
