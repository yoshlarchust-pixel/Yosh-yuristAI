import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Shield, Zap, MessageSquare, Mic, FileText, ArrowRight, Landmark, Globe, Sun, Moon, Star, Users, Award, Scale, CheckCircle2, ChevronRight, Gavel, BookOpen, Lock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Language } from '../types';

interface LandingPageProps {
  onStart: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
}

const languages: { code: Language; label: string; flag: string }[] = [
  { code: 'uz', label: 'O\'zbek', flag: '🇺🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'kk', label: 'Қазақша', flag: '🇰🇿' },
  { code: 'ky', label: 'Кыргызcha', flag: '🇰🇬' },
  { code: 'tg', label: 'Тоҷикӣ', flag: '🇹🇯' },
];

const ZigZagDivider = ({ color = "bg-black" }) => (
  <div className={cn("w-full h-8 overflow-hidden flex", color)}>
    {Array(100).fill(0).map((_, i) => (
      <div key={i} className="w-8 h-8 rotate-45 bg-[#FDF6E3] dark:bg-zinc-950 -mt-4 shrink-0" />
    ))}
  </div>
);

export function LandingPage({ onStart, language, setLanguage, isDark, setIsDark }: LandingPageProps) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 360]);

  const translations = {
    uz: {
      hero: "O'zbekistonning birinchi AI huquqiy yordamchisi",
      title: "ADOLAT AI",
      subtitle: "Huquqiy masalalar endi murakkab emas. Arizalar yozish, shartnomalarni tahlil qilish va qonuniy maslahatlar olish — hammasi bir joyda.",
      start: "Boshlash",
      more: "Batafsil",
      features: "Imkoniyatlar",
      howItWorks: "Qanday ishlaydi?",
      stats: { users: "Foydalanuvchilar", docs: "Hujjatlar", accuracy: "Aniq javoblar", support: "Dastak" },
      ticker: "• ADOLAT AI • HUQUQIY YORDAM • 24/7 DASTAK • O'ZBEKISTON QONUNCHILIGI • TEZKOR TAHLIL •"
    },
    en: {
      hero: "Uzbekistan's first AI legal assistant",
      title: "ADOLAT AI",
      subtitle: "Legal issues are no longer complex. Write applications, analyze contracts, and get legal advice — all in one place.",
      start: "Get Started",
      more: "Learn More",
      features: "Features",
      howItWorks: "How it works?",
      stats: { users: "Users", docs: "Documents", accuracy: "Accuracy", support: "Support" },
      ticker: "• ADOLAT AI • LEGAL ASSISTANT • 24/7 SUPPORT • UZBEKISTAN LAW • FAST ANALYSIS •"
    },
    ru: {
      hero: "Первый в Узбекистане юридический ИИ-помощник",
      title: "ADOLAT AI",
      subtitle: "Юридические вопросы больше не сложны. Пишите заявления, анализируйте контракты и получайте юридические консультации — все в одном месте.",
      start: "Начать",
      more: "Подробнее",
      features: "Возможности",
      howItWorks: "Как это работает?",
      stats: { users: "Пользователи", docs: "Документы", accuracy: "Точность", support: "Поддержка" },
      ticker: "• ADOLAT AI • ЮРИДИЧЕСКИЙ ПОМОЩНИК • 24/7 ПОДДЕРЖКА • ЗАКОНЫ УЗБЕКИСТАНА •"
    },
    tr: {
      hero: "Özbekistan'ın ilk yapay zeka hukuk asistanı",
      title: "ADOLAT AI",
      subtitle: "Hukuki meseleler artık karmaşık değil. Dilekçe yazın, sözleşmeleri analiz edin ve hukuki tavsiye alın.",
      start: "Başla",
      more: "Daha Fazla",
      features: "Özellikler",
      howItWorks: "Nasıl Çalışır?",
      stats: { users: "Kullanıcılar", docs: "Belgeler", accuracy: "Doğruluk", support: "Destek" },
      ticker: "• ADOLAT AI • HUKUK ASİSTANI • 24/7 DESTEK • ÖZBEKİSTAN HUKUKU •"
    },
    de: {
      hero: "Usbekistans erster KI-Rechtsassistent",
      title: "ADOLAT AI",
      subtitle: "Rechtliche Probleme sind nicht mehr komplex. Anträge schreiben, Verträge analysieren und Rechtsberatung erhalten.",
      start: "Starten",
      more: "Mehr erfahren",
      features: "Funktionen",
      howItWorks: "Wie es funktioniert?",
      stats: { users: "Benutzer", docs: "Dokumente", accuracy: "Genauigkeit", support: "Support" },
      ticker: "• ADOLAT AI • RECHTSASSISTENT • 24/7 SUPPORT •"
    },
    fr: {
      hero: "Le premier assistant juridique IA d'Ouzbékistan",
      title: "ADOLAT AI",
      subtitle: "Les questions juridiques ne sont plus complexes. Rédigez des demandes, analysez des contrats et obtenez des conseils.",
      start: "Commencer",
      more: "En savoir plus",
      features: "Caractéristiques",
      howItWorks: "Comment ça marche ?",
      stats: { users: "Utilisateurs", docs: "Documents", accuracy: "Précision", support: "Support" },
      ticker: "• ADOLAT AI • ASSISTANT JURIDIQUE • 24/7 SUPPORT •"
    },
    es: {
      hero: "El primer asistente legal de IA de Uzbekistán",
      title: "ADOLAT AI",
      subtitle: "Los problemas legales ya no son complejos. Escriba solicitudes, analice contratos y obtenga asesoramiento legal.",
      start: "Empezar",
      more: "Saber más",
      features: "Características",
      howItWorks: "¿Cómo funciona?",
      stats: { users: "Usuarios", docs: "Documentos", accuracy: "Precisión", support: "Soporte" },
      ticker: "• ADOLAT AI • ASISTENTE LEGAL • 24/7 SOPORTE •"
    },
    it: {
      hero: "Il primo assistente legale IA dell'Uzbekistan",
      title: "ADOLAT AI",
      subtitle: "Le questioni legali non sono più complesse. Scrivi domande, analizza contratti e ottieni consulenza legale.",
      start: "Inizia",
      more: "Scopri di più",
      features: "Caratteristiche",
      howItWorks: "Come funziona?",
      stats: { users: "Utenti", docs: "Documenti", accuracy: "Precisione", support: "Supporto" },
      ticker: "• ADOLAT AI • ASSISTENTE LEGALE • 24/7 SUPPORTO •"
    },
    ar: {
      hero: "أول مساعد قانوني يعمل بالذكاء الاصطناعي في أوزبكستان",
      title: "ADOLAT AI",
      subtitle: "لم تعد القضايا القانونية معقدة. اكتب الطلبات، وحلل العقود، واحصل على المشورة القانونية.",
      start: "ابدأ",
      more: "اعرف المزيد",
      features: "المميزات",
      howItWorks: "كيف يعمل؟",
      stats: { users: "المستخدمين", docs: "الوثائق", accuracy: "الدقة", support: "الدعم" },
      ticker: "• ADOLAT AI • مساعد قانوني • دعم 24/7 •"
    },
    zh: {
      hero: "乌兹别克斯坦首个人工智能法律助手",
      title: "ADOLAT AI",
      subtitle: "法律问题不再复杂。撰写申请、分析合同并获得法律建议——一站式服务。",
      start: "开始使用",
      more: "了解更多",
      features: "功能",
      howItWorks: "如何运作？",
      stats: { users: "用户", docs: "文档", accuracy: "准确率", support: "支持" },
      ticker: "• ADOLAT AI • 法律助手 • 24/7 支持 •"
    },
    ja: {
      hero: "ウズベキスタン初のAI法律アシスタント",
      title: "ADOLAT AI",
      subtitle: "法律問題はもはや複雑ではありません。申請書の作成、契約書の分析、法律相談の取得をすべて一箇所で。",
      start: "開始",
      more: "詳細",
      features: "特徴",
      howItWorks: "仕組み",
      stats: { users: "ユーザー", docs: "ドキュメント", accuracy: "正確性", support: "サポート" },
      ticker: "• ADOLAT AI • 法律アシスタント • 24/7 サポート •"
    },
    ko: {
      hero: "우즈베키스탄 최초의 AI 법률 비서",
      title: "ADOLAT AI",
      subtitle: "법률 문제는 더 이상 복잡하지 않습니다. 신청서 작성, 계약서 분석, 법률 자문 받기를 한 곳에서.",
      start: "시작하기",
      more: "더 보기",
      features: "기능",
      howItWorks: "작동 방식",
      stats: { users: "사용자", docs: "문서", accuracy: "정확도", support: "지원" },
      ticker: "• ADOLAT AI • 법률 비서 • 24/7 지원 •"
    },
    kk: {
      hero: "Өзбекстанның алғашқы жасанды интеллект заңгерлік көмекшісі",
      title: "ADOLAT AI",
      subtitle: "Заңгерлік мәселелер енді күрделі емес. Өтініштер жазыңыз, келісімшарттарды талдаңыз және заңгерлік кеңес алыңыз.",
      start: "Бастау",
      more: "Толығырақ",
      features: "Мүмкіндіктер",
      howItWorks: "Қалай жұмыс істейді?",
      stats: { users: "Пайдаланушылар", docs: "Құжаттар", accuracy: "Дәлдік", support: "Қолдау" },
      ticker: "• ADOLAT AI • ЗАҢГЕРЛІК КӨМЕКШІ • 24/7 ҚОЛДАУ •"
    },
    tg: {
      hero: "Аввалин ёвари ҳуқуқии ИИ дар Ӯзбекистон",
      title: "ADOLAT AI",
      subtitle: "Масъалаҳои ҳуқуқӣ дигар мураккаб нестанд. Аризаҳо нависед, шартномаҳоро таҳлил кунед ва машварат гиред.",
      start: "Оғоз",
      more: "Бештар",
      features: "Имкониятҳо",
      howItWorks: "Чӣ тавp кор мекунад?",
      stats: { users: "Истифодабарандагон", docs: "Ҳуҷҷатҳо", accuracy: "Дақиқӣ", support: "Дастгирӣ" },
      ticker: "• ADOLAT AI • ЁВАРИ ҲУҚУҚӢ • 24/7 ДАСТГИРӢ •"
    },
    ky: {
      hero: "Өзбекстандын биринчи жасалма интеллект юридикалык жардамчысы",
      title: "ADOLAT AI",
      subtitle: "Юридикалык маселелер мындан ары татаал эмес. Арыздарды жазыңыз, келишимдерди талдаңыз жана кеңеш алыңыз.",
      start: "Баштоо",
      more: "Кененирээк",
      features: "Мүмкүнчүлүктөр",
      howItWorks: "Кандай иштейт?",
      stats: { users: "Колдонуучулар", docs: "Документтер", accuracy: "Тактык", support: "Колдоо" },
      ticker: "• ADOLAT AI • ЮРИДИКАЛЫК ЖАРДАМЧЫ • 24/7 КОЛДОО •"
    }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  return (
    <div ref={containerRef} className="min-h-screen bg-[#FDF6E3] dark:bg-zinc-950 text-black dark:text-white font-sans selection:bg-black selection:text-white transition-colors duration-300 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white dark:bg-zinc-900 border-b-4 border-black px-6 py-4 shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 border-2 border-black rounded-lg flex items-center justify-center text-white font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">A</div>
            <span className="font-black text-2xl tracking-tighter uppercase italic">ADOLAT <span className="text-blue-600">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-white dark:bg-zinc-800 p-1 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Globe size={16} className="ml-2 text-black dark:text-white" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-transparent text-xs font-black uppercase tracking-widest focus:outline-none pr-2 py-1 cursor-pointer"
              >
                {languages.map(l => (
                  <option key={l.code} value={l.code} className="dark:bg-zinc-900">{l.flag} {l.label}</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2.5 bg-white dark:bg-zinc-800 border-2 border-black rounded-xl hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Ticker Marquee */}
      <div className="fixed top-[76px] w-full bg-black text-white py-2 z-40 overflow-hidden border-b-2 border-black">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="whitespace-nowrap flex gap-8 font-black text-sm uppercase tracking-widest"
        >
          {Array(10).fill(t.ticker).map((text, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-48 pb-24 md:pt-64 md:pb-32 px-6">
        {/* Parallax Floating 2D Shapes */}
        <motion.div style={{ y: y1, rotate }} className="absolute top-40 left-10 w-24 h-24 bg-blue-600 border-4 border-black rounded-2xl -z-10 hidden lg:block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
        <motion.div style={{ y: y2 }} className="absolute bottom-20 right-20 w-32 h-32 bg-[#FF5733] border-4 border-black rounded-full -z-10 hidden lg:block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]" />
        <motion.div style={{ y: y1, x: y2 }} className="absolute top-60 right-40 w-16 h-16 bg-[#FFC300] border-4 border-black -z-10 hidden lg:block rotate-45 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
        <motion.div style={{ y: y2, x: y1 }} className="absolute top-20 left-1/2 w-12 h-12 bg-green-500 border-4 border-black -z-10 hidden lg:block rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />

        <div className="max-w-7xl mx-auto text-center space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-zinc-800 border-4 border-black rounded-full text-sm font-black uppercase tracking-[0.2em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
          >
            <Shield size={20} className="text-blue-600" />
            {t.hero}
          </motion.div>

          <div className="space-y-8">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="text-7xl md:text-9xl lg:text-[14rem] font-black tracking-tighter leading-[0.75] uppercase italic"
            >
              {t.title.split(' ')[0]} <br />
              <span className="text-blue-600 stroke-black stroke-2 relative">
                {t.title.split(' ')[1]}
                <div className="absolute -bottom-4 left-0 w-full h-8 bg-black -z-10 rotate-1 opacity-20" />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="max-w-4xl mx-auto text-2xl md:text-4xl text-black dark:text-zinc-300 leading-tight font-black uppercase italic bg-white dark:bg-zinc-900 border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform -rotate-1"
            >
              {t.subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-12"
          >
            <button
              onClick={onStart}
              className="group relative px-20 py-10 bg-blue-600 hover:bg-blue-700 text-white border-4 border-black rounded-3xl font-black text-4xl transition-all shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-6px] hover:translate-x-[-6px] hover:shadow-[18px_18px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-6"
            >
              {t.start}
              <ArrowRight size={40} className="group-hover:translate-x-3 transition-transform" />
            </button>
            <button className="px-20 py-10 bg-white dark:bg-zinc-900 border-4 border-black rounded-3xl font-black text-4xl hover:translate-y-[-6px] hover:translate-x-[-6px] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[4px] active:translate-x-[4px] active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              {t.more}
            </button>
          </motion.div>
        </div>
      </div>

      <ZigZagDivider color="bg-blue-600" />

      {/* Bento Grid Features */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-32">
          <h2 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic bg-white dark:bg-zinc-900 border-4 border-black inline-block px-16 py-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            {t.features}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Large Card */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="md:col-span-2 p-12 bg-[#FF5733] border-4 border-black rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="w-24 h-24 bg-white border-4 border-black rounded-3xl flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <MessageSquare size={48} className="text-[#FF5733]" />
              </div>
              <h3 className="text-6xl font-black text-white uppercase italic tracking-tighter">AI Huquqiy Chat</h3>
              <p className="text-white/90 text-2xl font-bold max-w-xl leading-tight">
                Har qanday murakkab huquqiy savollarga O'zbekiston qonunchiligi asosida soniyalar ichida professional javob oling.
              </p>
              <button className="mt-8 px-10 py-5 bg-white border-4 border-black rounded-2xl font-black text-xl flex items-center gap-3 hover:translate-y-[-4px] transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                Sinab ko'rish <ChevronRight />
              </button>
            </div>
            <div className="absolute top-10 right-10 opacity-10 group-hover:scale-110 transition-transform">
              <Scale size={300} />
            </div>
          </motion.div>

          {/* Small Card */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="p-12 bg-[#C70039] border-4 border-black rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between"
          >
            <div className="w-20 h-20 bg-white border-4 border-black rounded-3xl flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Mic size={40} className="text-[#C70039]" />
            </div>
            <div>
              <h3 className="text-4xl font-black text-white uppercase italic mt-8 mb-4">Ovozli AI</h3>
              <p className="text-white/80 text-xl font-bold leading-tight">
                Tabiiy tilda muloqot qiling. AI sizni eshitadi va professional ovozda javob beradi.
              </p>
            </div>
          </motion.div>

          {/* Another Small Card */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="p-12 bg-[#FFC300] border-4 border-black rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="w-20 h-20 bg-white border-4 border-black rounded-3xl flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Zap size={40} className="text-[#FFC300]" />
            </div>
            <h3 className="text-4xl font-black text-black uppercase italic mt-8 mb-4">Tezkor</h3>
            <p className="text-black/80 text-xl font-bold leading-tight">
              Kutishlarsiz, navbatlarsiz. 24/7 huquqiy yordam har doim yoningizda.
            </p>
          </motion.div>

          {/* Large Card 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="md:col-span-2 p-12 bg-blue-600 border-4 border-black rounded-[40px] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="space-y-6 flex-1">
                <div className="w-24 h-24 bg-white border-4 border-black rounded-3xl flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <FileText size={48} className="text-blue-600" />
                </div>
                <h3 className="text-6xl font-black text-white uppercase italic tracking-tighter">Hujjatlar Generatsiyasi</h3>
                <p className="text-white/90 text-2xl font-bold leading-tight">
                  Ariza, shartnoma, raddiya va boshqa yuridik hujjatlarni professional darajada avtomatik yarating.
                </p>
              </div>
              <div className="w-full md:w-64 h-80 bg-white border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 space-y-4 rotate-3">
                <div className="h-4 w-3/4 bg-zinc-200 rounded" />
                <div className="h-4 w-full bg-zinc-100 rounded" />
                <div className="h-4 w-full bg-zinc-100 rounded" />
                <div className="h-4 w-1/2 bg-zinc-100 rounded" />
                <div className="h-20 w-full bg-blue-50 rounded border-2 border-dashed border-blue-200" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <ZigZagDivider color="bg-[#FF5733]" />

      {/* How it Works */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="text-center mb-24">
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic">{t.howItWorks}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { step: "01", title: "Ro'yxatdan o'ting", desc: "Tizimga kiring va o'z profilingizni yarating.", icon: Users },
            { step: "02", title: "Savol bering", desc: "Ovozli yoki yozma ravishda huquqiy muammoingizni bayon qiling.", icon: MessageSquare },
            { step: "03", title: "Yechim oling", desc: "AI tomonidan tayyorlangan professional javob va hujjatlarni qabul qiling.", icon: CheckCircle2 }
          ].map((item, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
              className="relative p-12 bg-white dark:bg-zinc-900 border-4 border-black rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="absolute -top-10 -left-6 text-8xl font-black text-blue-600/20 italic">{item.step}</div>
              <div className="w-16 h-16 bg-blue-600 border-2 border-black rounded-xl flex items-center justify-center text-white mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <item.icon size={32} />
              </div>
              <h3 className="text-3xl font-black mb-4 uppercase italic relative z-10">{item.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-xl font-bold leading-tight">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <ZigZagDivider color="bg-black" />

      {/* Stats Section */}
      <div className="bg-black py-32 border-y-8 border-black overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="grid grid-cols-10 gap-4 p-4">
            {Array(100).fill(0).map((_, i) => (
              <div key={i} className="w-2 h-2 bg-white rounded-full" />
            ))}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center text-white relative z-10">
          {[
            { val: "10k+", label: t.stats.users, icon: Users, color: "text-blue-500" },
            { val: "50k+", label: t.stats.docs, icon: FileText, color: "text-[#FF5733]" },
            { val: "99%", label: t.stats.accuracy, icon: Star, color: "text-[#FFC300]" },
            { val: "24/7", label: t.stats.support, icon: Zap, color: "text-[#C70039]" }
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              whileHover={{ scale: 1.05 }}
              className="space-y-4 p-8 border-2 border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm"
            >
              <div className={cn("w-20 h-20 bg-white border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-3", stat.color)}>
                <stat.icon size={40} />
              </div>
              <div className="text-6xl md:text-8xl font-black tracking-tighter">{stat.val}</div>
              <div className="text-zinc-400 text-sm font-black uppercase tracking-[0.4em] italic">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      <ZigZagDivider color="bg-[#FFC300]" />

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">Mijozlarimiz <br /> <span className="text-blue-600">fikrlari</span></h2>
            <p className="text-2xl font-bold text-zinc-600 dark:text-zinc-400">Minglab foydalanuvchilar Adolat AI orqali o'z huquqiy muammolarini hal qilishdi.</p>
            <div className="flex gap-4">
              <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Award size={48} className="text-blue-600" />
              </div>
              <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Lock size={48} className="text-[#FF5733]" />
              </div>
              <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Gavel size={48} className="text-[#C70039]" />
              </div>
            </div>
          </div>
          <div className="space-y-8">
            {[
              { name: "Azizbek R.", role: "Tadbirkor", text: "Adolat AI shartnomalarni tahlil qilishda juda yordam berdi. Xavflarni soniyalar ichida aniqladi." },
              { name: "Malika S.", role: "Talaba", text: "Ovozli yordamchi orqali huquqiy savollarimga tez va tushunarli javob oldim. Juda qulay!" }
            ].map((t, i) => (
              <motion.div 
                key={i} 
                whileHover={{ x: 10 }}
                className="p-10 bg-white dark:bg-zinc-900 border-4 border-black rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
              >
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-[#FFC300] border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Star size={24} className="fill-black" />
                </div>
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => <Star key={i} size={20} className="fill-[#FFC300] text-[#FFC300]" />)}
                </div>
                <p className="text-xl font-bold mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full border-2 border-black flex items-center justify-center text-white font-black">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-black uppercase italic">{t.name}</div>
                    <div className="text-sm text-zinc-500 font-bold">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-24 bg-white dark:bg-zinc-900 border-t-8 border-black text-center space-y-12">
        <div className="flex items-center justify-center gap-4">
          <div className="w-12 h-12 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">A</div>
          <span className="font-black text-4xl tracking-tighter uppercase italic">Adolat AI</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-12 text-black dark:text-white font-black text-lg uppercase italic">
          <a href="#" className="hover:text-blue-600 transition-colors underline decoration-4 underline-offset-8">Maxfiylik</a>
          <a href="#" className="hover:text-blue-600 transition-colors underline decoration-4 underline-offset-8">Shartlar</a>
          <a href="#" className="hover:text-blue-600 transition-colors underline decoration-4 underline-offset-8">Biz haqimizda</a>
          <a href="#" className="hover:text-blue-600 transition-colors underline decoration-4 underline-offset-8">Bog'lanish</a>
        </div>

        <div className="pt-12 max-w-2xl mx-auto px-6">
          <p className="text-black dark:text-zinc-400 text-sm font-black uppercase italic border-4 border-black p-6 bg-[#FFD700] dark:bg-zinc-800 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
            © 2026 Adolat AI. Barcha huquqlar himoyalangan. O'zbekiston qonunchiligi asosida.
          </p>
        </div>
      </footer>
    </div>
  );
}
