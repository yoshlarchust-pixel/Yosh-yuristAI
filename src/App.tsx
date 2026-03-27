/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Chat } from './components/Chat';
import { DocumentAnalysis } from './components/DocumentAnalysis';
import { DocumentGeneration } from './components/DocumentGeneration';
import { Pricing } from './components/Pricing';
import { History } from './components/History';
import { VoiceAssistant } from './components/VoiceAssistant';
import { PetitionGenerator } from './components/PetitionGenerator';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { auth, onAuthStateChanged, signOut, User } from './firebase';
import { geminiService } from './services/geminiService';
import { analyticsService } from './services/analyticsService';
import { Message, AnalysisResult, Language, HistoryItem } from './types';
import { Globe, Moon, Sun, BarChart3, HelpCircle, X, Menu, LogOut, ChevronDown } from 'lucide-react';
import { cn } from './lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';

import { notificationService } from './services/notificationService';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [language, setLanguage] = useState<Language>('uz');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [speechRate, setSpeechRate] = useState(1.0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedHistory = localStorage.getItem('adolat_history_v2');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
    const hasSeenOnboarding = localStorage.getItem('adolat_onboarding_seen');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else {
      // Show new feature notification if they've seen onboarding
      notificationService.notifyNewFeature(
        'Ovozli Maslahatchi', 
        'Endi siz ovozli maslahatchi bilan bevosita muloqot qilishingiz mumkin!'
      );
    }
    analyticsService.track('chat', 'session_start');
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const saveToHistory = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    const newHistory = [newItem, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('adolat_history_v2', JSON.stringify(newHistory));
  };

  const deleteHistoryItem = (id: string) => {
    const newHistory = history.filter(item => item.id !== id);
    setHistory(newHistory);
    localStorage.setItem('adolat_history_v2', JSON.stringify(newHistory));
    toast.success('History item deleted');
  };

  const handleSendMessage = async (content: string) => {
    // Check if user needs to register after 2 messages
    if (!user && messages.filter(m => m.role === 'user').length >= 2) {
      setIsAuthModalOpen(true);
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    analyticsService.track('chat', 'message_sent', { length: content.length });

    try {
      const geminiHistory = messages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.content }]
      }));

      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(true);

      let fullResponse = '';
      const stream = geminiService.chatStream(content, geminiHistory);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages((prev) => 
          prev.map(msg => 
            msg.id === assistantMsgId ? { ...msg, content: fullResponse } : msg
          )
        );
      }
      
      setIsStreaming(false);
      let audioData = '';
      if (isVoiceEnabled || activeTab === 'voice') {
        try {
          const voiceName = voiceGender === 'female' ? 'Kore' : 'Puck';
          audioData = await geminiService.generateSpeech(fullResponse.slice(0, 500), voiceName);
          analyticsService.track('voice', 'speech_generated');
          
          setMessages((prev) => 
            prev.map(msg => 
              msg.id === assistantMsgId ? { ...msg, audioData: audioData || undefined } : msg
            )
          );

          if (audioData && (isVoiceEnabled || activeTab === 'voice')) {
            try {
              const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
              audio.oncanplaythrough = () => audio.play();
              audio.onerror = (e) => console.error('Audio playback error:', e);
            } catch (playError) {
              console.error('Audio play error:', playError);
            }
          }
        } catch (e) {
          console.error('TTS error:', e);
        }
      }

      saveToHistory({
        title: content.slice(0, 30) + '...',
        type: 'chat',
        content: content,
      });

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Xatolik yuz berdi. Iltimos, qaytadan urinib ko\'ring.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (text: string, file?: { data: string, mimeType: string }): Promise<AnalysisResult> => {
    setIsLoading(true);
    analyticsService.track('analysis', 'document_analyzed', { length: text.length, hasFile: !!file });
    try {
      const result = await geminiService.analyzeDocument(text, language, file);
      saveToHistory({
        title: 'Document Analysis',
        type: 'analysis',
        content: text || (file ? `File: ${file.mimeType}` : ''),
        result: result,
      });
      return result;
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Hujjatni tahlil qilishda xatolik yuz berdi.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async (type: string, details: string, file?: { data: string, mimeType: string }): Promise<string> => {
    setIsLoading(true);
    analyticsService.track('generation', 'document_generated', { type, hasFile: !!file });
    try {
      let result: string;
      if (file) {
        // If file is provided, we use a special prompt that includes the file content
        const prompt = `Generate a professional legal ${type} in ${language} based on these details: ${details}. 
        Also consider the attached document content for context.`;
        
        const response = await geminiService.generateDocument(type, prompt, language, file);
        result = response;
      } else {
        result = await geminiService.generateDocument(type, details, language);
      }
      
      saveToHistory({
        title: `${type} Generation`,
        type: 'generation',
        content: details,
        result: result,
        metadata: {
          hasFile: !!file,
          docType: type,
        }
      });
      return result;
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Hujjat yaratishda xatolik yuz berdi.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const onNewChat = () => {
    setMessages([]);
    setActiveTab('chat');
  };

  const handleRevisit = (item: HistoryItem) => {
    if (item.type === 'chat') {
      setMessages([{ id: '1', role: 'user', content: item.content, timestamp: item.timestamp }]);
      setActiveTab('chat');
    } else if (item.type === 'analysis') {
      setActiveTab('analysis');
      // In a real app, we'd pass the result to the component
    } else if (item.type === 'generation') {
      setActiveTab('generation');
      // In a real app, we'd pass the result to the component
    }
  };

  const translations = {
    uz: {
      chat: 'Legal Chat',
      voice: 'Ovozli Maslahatchi',
      petitions: 'Arizalar va Shikoyatlar',
      analysis: 'Hujjat Tahlili',
      generation: 'Hujjat Yaratish',
      history: 'Faoliyat Tarixi',
      pricing: 'Tariflar',
      stats: 'Statistika',
      logout: 'Chiqish',
      back: 'Bosh sahifaga qaytish',
      onboarding: [
        { title: 'Huquqiy Chat', description: 'O\'zbek, rus yoki ingliz tillarida har qanday huquqiy savollarni bering. Ovozli rejimdan foydalaning.' },
        { title: 'Hujjat Tahlili', description: 'Shartnoma yoki huquqiy matnlarni xavflarni aniqlash va tushuntirish uchun joylashtiring.' },
        { title: 'Hujjat Yaratish', description: 'Professional yuridik hujjatlarni noldan yarating yoki shablonlardan foydalaning.' }
      ],
      next: 'Keyingi',
      getStarted: 'Boshlash'
    },
    en: {
      chat: 'Legal Chat',
      voice: 'Voice Assistant',
      petitions: 'Petitions & Complaints',
      analysis: 'Document Analysis',
      generation: 'Document Generation',
      history: 'Activity History',
      pricing: 'Pricing Plans',
      stats: 'Stats',
      logout: 'Logout',
      back: 'Back to Home',
      onboarding: [
        { title: 'Legal Chat', description: 'Ask any legal questions in Uzbek, Russian, or English. Use voice mode for hands-free interaction.' },
        { title: 'Document Analysis', description: 'Paste any contract or legal text to identify risks, key clauses, and simplified explanations.' },
        { title: 'Document Generation', description: 'Generate professional legal documents from scratch or upload your own templates to fill in.' }
      ],
      next: 'Next',
      getStarted: 'Get Started'
    },
    ru: {
      chat: 'Юридический чат',
      voice: 'Голосовой помощник',
      petitions: 'Заявления и жалобы',
      analysis: 'Анализ документов',
      generation: 'Создание документов',
      history: 'История активности',
      pricing: 'Тарифные планы',
      stats: 'Статистика',
      logout: 'Выйти',
      back: 'На главную',
      onboarding: [
        { title: 'Юридический чат', description: 'Задавайте любые юридические вопросы на узбекском, русском или английском языках.' },
        { title: 'Анализ документов', description: 'Вставьте любой контракт или юридический текст для выявления рисков и пояснений.' },
        { title: 'Создание документов', description: 'Создавайте профессиональные юридические документы с нуля или по шаблонам.' }
      ],
      next: 'Далее',
      getStarted: 'Начать'
    },
    tr: {
      chat: 'Hukuki Sohbet',
      voice: 'Sesli Asistan',
      petitions: 'Dilekçeler',
      analysis: 'Belge Analizi',
      generation: 'Belge Oluşturma',
      history: 'Geçmiş',
      pricing: 'Fiyatlandırma',
      stats: 'İstatistikler',
      logout: 'Çıkış Yap',
      back: 'Anasayfaya Dön',
      onboarding: [{ title: 'Hukuki Sohbet', description: 'Hukuki sorularınızı sorun.' }, { title: 'Analiz', description: 'Belgeleri analiz edin.' }, { title: 'Oluşturma', description: 'Belge oluşturun.' }],
      next: 'İleri',
      getStarted: 'Başla'
    },
    de: {
      chat: 'Rechts-Chat',
      voice: 'Sprachassistent',
      petitions: 'Anträge',
      analysis: 'Dokumentenanalyse',
      generation: 'Dokumentenerstellung',
      history: 'Verlauf',
      pricing: 'Preise',
      stats: 'Statistiken',
      logout: 'Abmelden',
      back: 'Zurück zur Startseite',
      onboarding: [{ title: 'Rechts-Chat', description: 'Stellen Sie rechtliche Fragen.' }, { title: 'Analyse', description: 'Dokumente analysieren.' }, { title: 'Erstellung', description: 'Dokumente erstellen.' }],
      next: 'Weiter',
      getStarted: 'Starten'
    },
    fr: {
      chat: 'Chat Juridique',
      voice: 'Assistant Vocal',
      petitions: 'Pétitions',
      analysis: 'Analyse de Documents',
      generation: 'Génération de Documents',
      history: 'Historique',
      pricing: 'Tarification',
      stats: 'Statistiques',
      logout: 'Déconnexion',
      back: 'Retour à l\'accueil',
      onboarding: [{ title: 'Chat Juridique', description: 'Posez vos questions juridiques.' }, { title: 'Analyse', description: 'Analysez vos documents.' }, { title: 'Génération', description: 'Générez des documents.' }],
      next: 'Suivant',
      getStarted: 'Commencer'
    },
    es: {
      chat: 'Chat Legal',
      voice: 'Asistente de Voz',
      petitions: 'Peticiones',
      analysis: 'Análisis de Documentos',
      generation: 'Generación de Documentos',
      history: 'Historial',
      pricing: 'Precios',
      stats: 'Estadísticas',
      logout: 'Cerrar Sesión',
      back: 'Volver al Inicio',
      onboarding: [{ title: 'Chat Legal', description: 'Haga preguntas legales.' }, { title: 'Análisis', description: 'Analice documentos.' }, { title: 'Generación', description: 'Genere documentos.' }],
      next: 'Siguiente',
      getStarted: 'Empezar'
    },
    it: {
      chat: 'Chat Legale',
      voice: 'Assistente Vocale',
      petitions: 'Petizioni',
      analysis: 'Analisi Documenti',
      generation: 'Generazione Documenti',
      history: 'Cronologia',
      pricing: 'Prezzi',
      stats: 'Statistiche',
      logout: 'Disconnetti',
      back: 'Torna alla Home',
      onboarding: [{ title: 'Chat Legale', description: 'Fai domande legali.' }, { title: 'Analisi', description: 'Analizza documenti.' }, { title: 'Generazione', description: 'Genera documenti.' }],
      next: 'Avanti',
      getStarted: 'Inizia'
    },
    ar: {
      chat: 'دردشة قانونية',
      voice: 'مساعد صوتي',
      petitions: 'العرائض',
      analysis: 'تحليل الوثائق',
      generation: 'إنشاء الوثائق',
      history: 'السجل',
      pricing: 'الأسعار',
      stats: 'الإحصائيات',
      logout: 'تسجيل الخروج',
      back: 'العودة للرئيسية',
      onboarding: [{ title: 'دردشة قانونية', description: 'اطرح أسئلة قانونية.' }, { title: 'تحليل', description: 'تحليل الوثائق.' }, { title: 'إنشاء', description: 'إنشاء الوثائق.' }],
      next: 'التالي',
      getStarted: 'ابدأ'
    },
    zh: {
      chat: '法律聊天',
      voice: '语音助手',
      petitions: '请愿书',
      analysis: '文档分析',
      generation: '文档生成',
      history: '历史记录',
      pricing: '价格',
      stats: '统计',
      logout: '退出登录',
      back: '返回首页',
      onboarding: [{ title: '法律聊天', description: '咨询法律问题。' }, { title: '分析', description: '分析文档。' }, { title: '生成', description: '生成文档。' }],
      next: '下一步',
      getStarted: '开始'
    },
    ja: {
      chat: '法律チャット',
      voice: '音声アシスタント',
      petitions: '請願書',
      analysis: '文書分析',
      generation: '文書作成',
      history: '履歴',
      pricing: '料金',
      stats: '統計',
      logout: 'ログアウト',
      back: 'ホームに戻る',
      onboarding: [{ title: '法律チャット', description: '法律の質問をする。' }, { title: '分析', description: '文書を分析する。' }, { title: '作成', description: '文書を作成する。' }],
      next: '次へ',
      getStarted: '開始'
    },
    ko: {
      chat: '법률 채팅',
      voice: '음성 비서',
      petitions: '청원서',
      analysis: '문서 분석',
      generation: '문서 생성',
      history: '활동 기록',
      pricing: '요금제',
      stats: '통계',
      logout: '로그아웃',
      back: '홈으로 돌아가기',
      onboarding: [{ title: '법률 채팅', description: '법률 질문을 하세요.' }, { title: '분석', description: '문서를 분석하세요.' }, { title: '생성', description: '문서를 생성하세요.' }],
      next: '다음',
      getStarted: '시작'
    },
    kk: {
      chat: 'Заңгерлік чат',
      voice: 'Дауыстық көмекші',
      petitions: 'Өтініштер',
      analysis: 'Құжаттарды талдау',
      generation: 'Құжаттарды жасау',
      history: 'Тарих',
      pricing: 'Тарифтер',
      stats: 'Статистика',
      logout: 'Шығу',
      back: 'Басты бетке',
      onboarding: [{ title: 'Заңгерлік чат', description: 'Заңгерлік сұрақтар қойыңыз.' }, { title: 'Талдау', description: 'Құжаттарды талдаңыз.' }, { title: 'Жасау', description: 'Құжаттарды жасаңыз.' }],
      next: 'Келесі',
      getStarted: 'Бастау'
    },
    tg: {
      chat: 'Чати ҳуқуқӣ',
      voice: 'Ёвари овозӣ',
      petitions: 'Аризаҳо',
      analysis: 'Таҳлили ҳуҷҷатҳо',
      generation: 'Эҷоди ҳуҷҷатҳо',
      history: 'Таърих',
      pricing: 'Тарифҳо',
      stats: 'Омор',
      logout: 'Баромад',
      back: 'Ба саҳифаи асосӣ',
      onboarding: [{ title: 'Чати ҳуқуқӣ', description: 'Саволҳои ҳуқуқӣ диҳед.' }, { title: 'Таҳлил', description: 'Ҳуҷҷатҳоро таҳлил кунед.' }, { title: 'Эҷод', description: 'Ҳуҷҷатҳоро эҷод кунед.' }],
      next: 'Баъдӣ',
      getStarted: 'Оғоз'
    },
    ky: {
      chat: 'Юридикалык чат',
      voice: 'Үн жардамчысы',
      petitions: 'Арыздар',
      analysis: 'Документтерди талдоо',
      generation: 'Документтерди түзүү',
      history: 'Тарых',
      pricing: 'Тарифтер',
      stats: 'Статистика',
      logout: 'Чыгуу',
      back: 'Башкы бетке',
      onboarding: [{ title: 'Юридикалык чат', description: 'Юридикалык суроолорду бериңиз.' }, { title: 'Талдоо', description: 'Документтерди талдаңыз.' }, { title: 'Түзүү', description: 'Документтерди түзүңүз.' }],
      next: 'Кийинки',
      getStarted: 'Баштоо'
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const onboardingSteps = t.onboarding;

  const nextOnboarding = () => {
    if (onboardingStep < onboardingSteps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
      setActiveTab(['chat', 'analysis', 'generation'][onboardingStep + 1]);
    } else {
      setShowOnboarding(false);
      localStorage.setItem('adolat_onboarding_seen', 'true');
    }
  };

  const stats = analyticsService.getStats();

  const handleFeedback = (feedback: any) => {
    console.log('Feedback received:', feedback);
    toast.success('Fikr-mulohazangiz uchun rahmat!');
    analyticsService.track('chat', 'feedback_received', feedback);
  };

  return (
    <div className={cn("flex w-full font-sans selection:bg-blue-500/30", isDarkMode ? "dark" : "", hasStarted ? "h-screen overflow-hidden" : "min-h-screen overflow-y-auto")}>
      <Toaster position="top-right" richColors closeButton />
      
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <LandingPage 
              onStart={() => setHasStarted(true)} 
              language={language}
              setLanguage={setLanguage}
              isDark={isDarkMode}
              setIsDark={setIsDarkMode}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex w-full h-full overflow-hidden"
          >
            <Sidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              onNewChat={onNewChat}
              history={history}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              language={language}
            />

            <main className="flex-1 flex flex-col relative bg-zinc-50 dark:bg-zinc-950 w-full overflow-hidden">
              {/* Header */}
              <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-zinc-950 z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="lg:hidden p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800"
                  >
                    <Menu size={20} />
                  </button>
                  <span className="text-xs md:text-sm font-semibold text-zinc-500 uppercase tracking-widest truncate max-w-[120px] md:max-w-none">
                    {activeTab === 'chat' ? t.chat : activeTab === 'voice' ? t.voice : activeTab === 'petitions' ? t.petitions : activeTab === 'analysis' ? t.analysis : activeTab === 'generation' ? t.generation : activeTab === 'history' ? t.history : t.pricing}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4">
                  {activeTab === 'voice' && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Live
                    </div>
                  )}
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
                  >
                    <BarChart3 size={18} />
                    <span className="text-xs font-bold hidden xl:inline">{t.stats}</span>
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                      className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
                    >
                      <Globe size={18} />
                      <span className="text-xs font-bold uppercase">{language}</span>
                      <ChevronDown size={14} className={cn("transition-transform", showLanguageMenu ? "rotate-180" : "")} />
                    </button>

                    <AnimatePresence>
                      {showLanguageMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[150] overflow-hidden p-2"
                        >
                          <div className="grid grid-cols-1 gap-1">
                            {[
                              { code: 'uz', name: "O'zbekcha" },
                              { code: 'ru', name: 'Русский' },
                              { code: 'en', name: 'English' },
                              { code: 'tr', name: 'Türkçe' },
                              { code: 'de', name: 'Deutsch' },
                              { code: 'fr', name: 'Français' },
                              { code: 'es', name: 'Español' },
                              { code: 'it', name: 'Italiano' },
                              { code: 'ar', name: 'العربية' },
                              { code: 'zh', name: '中文' },
                              { code: 'ja', name: '日本語' },
                              { code: 'ko', name: '한국어' },
                              { code: 'kk', name: 'Қазақша' },
                              { code: 'tg', name: 'Тоҷикӣ' },
                              { code: 'ky', name: 'Кыргызcha' }
                            ].map((lang) => (
                              <button
                                key={lang.code}
                                onClick={() => {
                                  setLanguage(lang.code as Language);
                                  setShowLanguageMenu(false);
                                }}
                                className={cn(
                                  "w-full px-4 py-2 text-left text-xs font-bold rounded-xl transition-all flex items-center justify-between",
                                  language === lang.code 
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" 
                                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                                )}
                              >
                                {lang.name}
                                {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all border border-zinc-200 dark:border-zinc-800"
                  >
                    {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>

                  <button
                    onClick={async () => {
                      if (user) {
                        await signOut(auth);
                        toast.success('Tizimdan chiqildi');
                      } else {
                        setHasStarted(false);
                      }
                    }}
                    className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-all border border-zinc-200 dark:border-zinc-800"
                    title={user ? t.logout : t.back}
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {activeTab === 'chat' && (
                    <motion.div
                      key="chat"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <Chat 
                        messages={messages} 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading} 
                        isVoiceEnabled={isVoiceEnabled}
                        setIsVoiceEnabled={setIsVoiceEnabled}
                        onFeedback={handleFeedback}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'voice' && (
                    <motion.div
                      key="voice"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      className="h-full"
                    >
                      <VoiceAssistant 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading}
                        isStreaming={isStreaming}
                        lastMessage={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || null}
                        lastAudio={messages.filter(m => m.role === 'assistant').slice(-1)[0]?.audioData || null}
                        voiceGender={voiceGender}
                        setVoiceGender={setVoiceGender}
                        speechRate={speechRate}
                        setSpeechRate={setSpeechRate}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'petitions' && (
                    <motion.div
                      key="petitions"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full"
                    >
                      <PetitionGenerator 
                        onGenerate={handleGenerate}
                        isLoading={isLoading}
                      />
                    </motion.div>
                  )}
                  {activeTab === 'analysis' && (
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full"
                    >
                      <DocumentAnalysis onAnalyze={handleAnalyze} isLoading={isLoading} />
                    </motion.div>
                  )}
                  {activeTab === 'generation' && (
                    <motion.div
                      key="generation"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full"
                    >
                      <DocumentGeneration onGenerate={handleGenerate} isLoading={isLoading} />
                    </motion.div>
                  )}
                  {activeTab === 'history' && (
                    <motion.div
                      key="history"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.02 }}
                      className="h-full"
                    >
                      <History history={history} onRevisit={handleRevisit} onDelete={deleteHistoryItem} />
                    </motion.div>
                  )}
                  {activeTab === 'pricing' && (
                    <motion.div
                      key="pricing"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="h-full"
                    >
                      <Pricing />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAuthModalOpen && (
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
            onSuccess={() => {
              setIsAuthModalOpen(false);
              toast.success('Muvaffaqiyatli kirdingiz!');
            }}
          />
        )}
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                  <HelpCircle size={28} />
                </div>
                <button onClick={() => setShowOnboarding(false)} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{onboardingSteps[onboardingStep].title}</h2>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {onboardingSteps[onboardingStep].description}
                </p>
              </div>
              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-1.5">
                  {onboardingSteps.map((_, i) => (
                    <div key={i} className={cn("w-2 h-2 rounded-full transition-all", onboardingStep === i ? "bg-blue-600 w-6" : "bg-zinc-200 dark:bg-zinc-800")} />
                  ))}
                </div>
                <button
                  onClick={nextOnboarding}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all"
                >
                  {onboardingStep === onboardingSteps.length - 1 ? t.getStarted : t.next}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
