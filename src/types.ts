export type Language = 
  | 'uz' | 'ru' | 'en' | 'tr' | 'de' | 'fr' | 'es' | 'it' | 'ar' | 'zh' | 'ja' | 'ko' | 'kk' | 'ky' | 'tg';

export type Plan = 'Free' | 'Basic' | 'Pro' | 'Max';

export interface Feedback {
  messageId: string;
  rating: 'up' | 'down';
  comment?: string;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  email: string;
  plan: Plan;
  usageCount: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type?: 'text' | 'analysis' | 'generation' | 'simplification';
  audioData?: string;
  metadata?: any;
}

export interface AnalysisResult {
  summary: string;
  risks: {
    score: number;
    explanation: string;
    items: string[];
  };
  importantClauses: string[];
  recommendations: string[];
  simplified?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  type: 'chat' | 'analysis' | 'generation';
  timestamp: number;
  content: string; // The input or full chat history
  result?: any; // AnalysisResult or generated text
  metadata?: {
    templateUsed?: boolean;
    templateName?: string;
    docType?: string;
    hasFile?: boolean;
    [key: string]: any;
  };
}

export interface AnalyticsEvent {
  feature: 'chat' | 'analysis' | 'generation' | 'voice';
  action: string;
  timestamp: number;
  metadata?: any;
}
