import React from 'react';
import { MessageSquare, FileSearch, FilePlus, CreditCard, Settings, LogOut, Plus, History, ShieldCheck, Mic, Landmark, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

import { Language } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNewChat: () => void;
  history: any[];
  isOpen?: boolean;
  onClose?: () => void;
  language: Language;
}

export function Sidebar({ activeTab, setActiveTab, onNewChat, history, isOpen, onClose, language }: SidebarProps) {
  const translations = {
    uz: {
      chat: 'Legal Chat',
      voice: 'Ovozli Maslahatchi',
      petitions: 'Arizalar va Shikoyatlar',
      analysis: 'Hujjat Tahlili',
      generation: 'Hujjat Yaratish',
      history: 'Faoliyat Tarixi',
      pricing: 'Tariflar',
      newChat: 'Yangi so\'rov',
      main: 'Asosiy',
      historyTitle: 'Tarix',
      noHistory: 'Tarix mavjud emas',
      secure: 'Xavfsiz aloqa',
      secureDesc: 'Barcha ma\'lumotlar AES-256 algoritmi bilan himoyalangan.',
      settings: 'Sozlamalar',
      logout: 'Chiqish'
    },
    en: {
      chat: 'Chat',
      voice: 'Voice',
      petitions: 'Petitions',
      analysis: 'Analysis',
      generation: 'Generate',
      history: 'History',
      pricing: 'Plans',
      newChat: 'New Chat',
      main: 'Main',
      historyTitle: 'History',
      noHistory: 'No history available',
      secure: 'Secure Connection',
      secureDesc: 'All data is protected with AES-256 encryption.',
      settings: 'Settings',
      logout: 'Logout'
    },
    ru: {
      chat: 'Чат',
      voice: 'Голос',
      petitions: 'Заявления',
      analysis: 'Анализ',
      generation: 'Создать',
      history: 'История',
      pricing: 'Тарифы',
      newChat: 'Новый чат',
      main: 'Главная',
      historyTitle: 'История',
      noHistory: 'История пуста',
      secure: 'Безопасное соединение',
      secureDesc: 'Все данные защищены шифрованием AES-256.',
      settings: 'Настройки',
      logout: 'Выйти'
    },
    tr: { chat: 'Sohbet', voice: 'Ses', petitions: 'Dilekçeler', analysis: 'Analiz', generation: 'Oluşturma', history: 'Geçmiş', pricing: 'Planlar', newChat: 'Yeni Sohbet', main: 'Ana', historyTitle: 'Geçmiş', noHistory: 'Geçmiş yok', secure: 'Güvenli Bağlantı', secureDesc: 'Veriler AES-256 ile korunur.', settings: 'Ayarlar', logout: 'Çıkış' },
    de: { chat: 'Chat', voice: 'Sprache', petitions: 'Anträge', analysis: 'Analyse', generation: 'Erstellung', history: 'Verlauf', pricing: 'Pläne', newChat: 'Neuer Chat', main: 'Haupt', historyTitle: 'Verlauf', noHistory: 'Kein Verlauf', secure: 'Sichere Verbindung', secureDesc: 'Daten mit AES-256 geschützt.', settings: 'Einstellungen', logout: 'Abmelden' },
    fr: { chat: 'Chat', voice: 'Vocal', petitions: 'Pétitions', analysis: 'Analyse', generation: 'Génération', history: 'Historique', pricing: 'Tarifs', newChat: 'Nouveau Chat', main: 'Principal', historyTitle: 'Historique', noHistory: 'Aucun historique', secure: 'Connexion Sécurisée', secureDesc: 'Données protégées par AES-256.', settings: 'Paramètres', logout: 'Déconnexion' },
    es: { chat: 'Chat', voice: 'Voz', petitions: 'Peticiones', analysis: 'Análisis', generation: 'Generación', history: 'Historial', pricing: 'Planes', newChat: 'Nuevo Chat', main: 'Principal', historyTitle: 'Historial', noHistory: 'Sin historial', secure: 'Conexión Segura', secureDesc: 'Datos protegidos con AES-256.', settings: 'Ajustes', logout: 'Cerrar sesión' },
    it: { chat: 'Chat', voice: 'Voce', petitions: 'Petizioni', analysis: 'Analisi', generation: 'Generazione', history: 'Cronologia', pricing: 'Piani', newChat: 'Nuova Chat', main: 'Principale', historyTitle: 'Cronologia', noHistory: 'Nessuna cronologia', secure: 'Connessione Sicura', secureDesc: 'Dati protetti con AES-256.', settings: 'Impostazioni', logout: 'Disconnetti' },
    ar: { chat: 'دردشة', voice: 'صوت', petitions: 'عرائض', analysis: 'تحليل', generation: 'إنشاء', history: 'سجل', pricing: 'خطط', newChat: 'دردشة جديدة', main: 'رئيسي', historyTitle: 'سجل', noHistory: 'لا يوجد سجل', secure: 'اتصال آمن', secureDesc: 'البيانات محمية بـ AES-256.', settings: 'إعدادات', logout: 'خروج' },
    zh: { chat: '聊天', voice: '语音', petitions: '请愿', analysis: '分析', generation: '生成', history: '历史', pricing: '方案', newChat: '新聊天', main: '主页', historyTitle: '历史', noHistory: '无历史记录', secure: '安全连接', secureDesc: 'AES-256 加密保护。', settings: '设置', logout: '退出' },
    ja: { chat: 'チャット', voice: '音声', petitions: '請願', analysis: '分析', generation: '作成', history: '履歴', pricing: 'プラン', newChat: '新規チャット', main: 'メイン', historyTitle: '履歴', noHistory: '履歴なし', secure: '安全な接続', secureDesc: 'AES-256で保護。', settings: '設定', logout: 'ログアウト' },
    ko: { chat: '채팅', voice: '음성', petitions: '청원', analysis: '분석', generation: '생성', history: '기록', pricing: '요금제', newChat: '새 채팅', main: '메인', historyTitle: '기록', noHistory: '기록 없음', secure: '보안 연결', secureDesc: 'AES-256으로 보호됨.', settings: '설정', logout: '로그아웃' },
    kk: { chat: 'Чат', voice: 'Дауыс', petitions: 'Өтініштер', analysis: 'Талдау', generation: 'Жасау', history: 'Тарих', pricing: 'Тарифтер', newChat: 'Жаңа чат', main: 'Басты', historyTitle: 'Тарих', noHistory: 'Тарих жоқ', secure: 'Қауіпсіз қосылым', secureDesc: 'AES-256 қорғауы.', settings: 'Баптаулар', logout: 'Шығу' },
    tg: { chat: 'Чат', voice: 'Овоз', petitions: 'Аризаҳо', analysis: 'Таҳлил', generation: 'Эҷод', history: 'Таърих', pricing: 'Тарифҳо', newChat: 'Чати нав', main: 'Асосӣ', historyTitle: 'Таърих', noHistory: 'Таърих нест', secure: 'Пайвасти бехатар', secureDesc: 'AES-256 муҳофизат.', settings: 'Танзимот', logout: 'Баромад' },
    ky: { chat: 'Чат', voice: 'Үн', petitions: 'Арыздар', analysis: 'Талдоо', generation: 'Түзүү', history: 'Тарых', pricing: 'Тарифтер', newChat: 'Жаңы чат', main: 'Башкы', historyTitle: 'Тарых', noHistory: 'Тарых жок', secure: 'Коопсуз туташуу', secureDesc: 'AES-256 коргоосу.', settings: 'Орнотуулар', logout: 'Чыгуу' }
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const menuItems = [
    { id: 'chat', label: t.chat, icon: MessageSquare },
    { id: 'voice', label: t.voice, icon: Mic },
    { id: 'petitions', label: t.petitions, icon: Landmark },
    { id: 'analysis', label: t.analysis, icon: FileSearch },
    { id: 'generation', label: t.generation, icon: FilePlus },
    { id: 'history', label: t.history, icon: History },
    { id: 'pricing', label: t.pricing, icon: CreditCard },
  ];

  const sidebarContent = (
    <div className="w-64 bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 flex flex-col h-full transition-colors">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
            <Landmark size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-none">Adolat AI</h1>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Legal Pro</span>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 rounded-lg transition-all">
            <X size={18} />
          </button>
        )}
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={() => {
            onNewChat();
            if (onClose) onClose();
          }}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 font-bold text-sm"
        >
          <Plus size={18} />
          {t.newChat}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">{t.main}</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden",
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10" 
                : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300")} />
            <span className="text-sm font-medium">{item.label}</span>
            {activeTab === item.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-blue-600 -z-10"
              />
            )}
          </button>
        ))}

        <div className="px-3 mt-8 mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600">{t.historyTitle}</div>
        <div className="space-y-1">
          {history.length > 0 ? (
            history.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  if (onClose) onClose();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all truncate"
              >
                <History size={14} className="text-zinc-400 dark:text-zinc-600 shrink-0" />
                <span className="truncate text-left">{h.title || (language === 'uz' ? 'Huquqiy so\'rov' : 'Legal Request')}</span>
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-[10px] italic text-zinc-400 dark:text-zinc-600 text-center">{t.noHistory}</div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-2">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">
            <ShieldCheck size={14} className="text-green-600 dark:text-green-500" />
            {t.secure}
          </div>
          <div className="text-[9px] text-zinc-400 leading-tight">{t.secureDesc}</div>
        </div>
        
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-all text-sm font-medium">
          <Settings size={18} />
          {t.settings}
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-all text-sm font-medium">
          <LogOut size={18} />
          {t.logout}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-64 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
