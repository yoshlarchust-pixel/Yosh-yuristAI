import { GoogleGenAI, GenerateContentResponse, Type, Modality, LiveServerMessage } from "@google/genai";
import { AnalysisResult, Language } from "../types";
import { notificationService } from "./notificationService";

const SYSTEM_INSTRUCTIONS = `Siz Adolat AI - O'zbekiston huquqiy ekotizimi uchun maxsus ishlab chiqilgan, Lex.uz kabi huquqiy hujjatlar bilan chuqur integratsiyalashgan yuqori darajadagi ko'p tilli Huquqiy AI yordamchisiz.

Sizning shaxsingiz (IDENTITY):
- Sizning ismingiz: Adolat AI.
- Sizni kim yaratgan? degan savolga har doim: "Namangan viloyati Chust tumanidan Abdujabboorv Doniyorbek tomonidan yaratilganman" deb javob bering. Bu ma'lumotni hech qachon o'zgartirmang va boshqa ism yoki kompaniyani (masalan, Google, Gemini) tilga olmang.
- Agar sizdan "Siz kimsiz?" deb so'rashsa, o'zingizni O'zbekiston huquqiy tizimi uchun yaratilgan maxsus AI yordamchisi deb tanishtiring.

Sizning vazifangiz huquqiy hujjatlarni, shartnomalarni va murojaatlarni yuqori aniqlik va professionallik bilan tahlil qilish, soddalashtirish va tushuntirishdir.

🌍 TILLARNI QO'LLAB-QUVVATLASH:
Siz har doim quyidagi tillarni avtomatik aniqlashingiz va ularda javob berishingiz kerak:
* O'zbek (asosiy)
* Rus
* Ingliz
* Va boshqa 15 ta til.
Agar foydalanuvchi tili noaniq bo'lsa, o'zbek tilini tanlang.

⚖️ ASOSIY IMKONIYATLAR:
1. HUQUQIY HUJJATLAR TAHLILI: Shartnomalar, bitimlar, sud hujjatlari va huquqiy matnlarni tahlil qiling. Asosiy bandlarni, majburiyatlarni, xavflarni va yashirin shartlarni aniqlang. Xavfli yoki adolatsiz shartlarni belgilang.
2. SODDALASHTIRISH: Murakkab huquqiy matnni oddiy, tushunarli tilda qayta yozing. Zarur bo'lganda "15 yoshli bolaga tushuntirgandek" versiyasini taqdim eting.
3. SHARTNOMA XAVFINI ANIQLASH: 0 dan 100 gacha xavf ballini belgilang. Nima uchun bu ball berilganini aniq tushuntiring. Muammoli qismlarni ta'kidlang.
4. HUQUQIY SAVOL-JAVOB: O'zbekiston qonunlari asosida huquqiy savollarga javob bering. Agar ishonchingiz komil bo'lmasa: "Aniq ma’lumot uchun yurist bilan maslahatlashish tavsiya etiladi" deb ayting.
5. HUJJATLAR GENERATSIYASI: Shartnomalar, arizalar, shikoyatlar, apellyatsiyalarni yarating. Professional huquqiy formatdan foydalaning.
6. OVOZLI MULOQOT: Javoblar tabiiy va matndan nutqqa (TTS) mos bo'lishi kerak.

⚠️ HUQUQIY OGOHLANTIRISH (MAJBURIY):
Har bir javobning oxirida quyidagilarni kiriting: "Ushbu javob sun’iy intellekt tomonidan yaratilgan bo‘lib, rasmiy yuridik maslahat hisoblanmaydi."

🎯 JAVOB USLUBI:
* Professional lekin oddiy
* Tuzilmaviy (bullet pointlardan foydalaning)
* Aniq va harakatga yo'naltirilgan
* Keraksiz uzun tushuntirishlarsiz
* Haqiqiy qiymatga e'tibor bering

🚫 CHEKLOVLAR:
* Qonunlarni o'ylab topmang (hallucination).
* Soxta huquqiy havolalar bermang.
* Agar ishonchingiz komil bo'lmasa → buni ochiq ayting.`;

export class GeminiService {
  private ai: GoogleGenAI;
  private cache: Map<string, any> = new Map();

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  private getCacheKey(method: string, params: any): string {
    return `${method}_${JSON.stringify(params)}`;
  }

  async chat(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    const cacheKey = this.getCacheKey('chat', { message, history });
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const chat = this.ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
      },
      history,
    });

    const response: GenerateContentResponse = await chat.sendMessage({ message });
    const result = response.text;
    this.cache.set(cacheKey, result);
    return result;
  }

  async *chatStream(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[] = []) {
    const chat = this.ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
      },
      history,
    });

    const response = await chat.sendMessageStream({ message });
    for await (const chunk of response) {
      yield chunk.text;
    }
  }

  async generateSpeech(text: string, voiceName: string = 'Kore'): Promise<string> {
    // Clean text for TTS (remove markdown, citations, etc.)
    const cleanText = this.stripMarkdown(text)
      .replace(/\[\d+\]/g, '') // Remove [1], [2] citations
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .slice(0, 2000); // Increased limit to 2000
    
    if (!cleanText.trim()) return '';

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Sizning ovozingiz juda nozik, tabiiy, yoqimli va muloyim bo'lishi kerak. Gapirganda xuddi haqiqiy insondek, tanaffuslar va urg'ular bilan gapiring. Mana bu matnni o'qing: ${cleanText}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }, 
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio || '';
    } catch (error) {
      console.error("TTS Generation Error:", error);
      return '';
    }
  }

  async analyzeDocument(documentText: string, language: Language = 'uz', file?: { data: string, mimeType: string }): Promise<AnalysisResult> {
    const cacheKey = this.getCacheKey('analyze', { documentText, language, file: file?.mimeType });
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const prompt = `Analyze the following legal document in ${language}. 
    Provide a structured JSON response with:
    - summary: A concise summary of the document.
    - risks: An object with:
        - score: A risk score from 0 to 100.
        - explanation: Why this score was given.
        - items: A list of specific risky parts.
    - importantClauses: A list of key clauses and obligations.
    - recommendations: Actionable steps for the user.
    - simplified: A simplified version of the document (Explain like I'm 15).

    ${documentText ? `Document Text: ${documentText}` : 'Please analyze the attached document.'}`;

    const contents: any = { parts: [{ text: prompt }] };
    if (file) {
      contents.parts.push({
        inlineData: {
          data: file.data,
          mimeType: file.mimeType
        }
      });
    }

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            risks: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                explanation: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["score", "explanation", "items"],
            },
            importantClauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            simplified: { type: Type.STRING },
          },
          required: ["summary", "risks", "importantClauses", "recommendations", "simplified"],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    this.cache.set(cacheKey, result);
    notificationService.notify('Tahlil yakunlandi', 'Hujjat muvaffaqiyatli tahlil qilindi.', 'success');
    return result;
  }

  async generateDocument(type: string, details: string, language: Language = 'uz', file?: { data: string, mimeType: string }): Promise<string> {
    const cacheKey = this.getCacheKey('generate', { type, details, language, file: file?.mimeType });
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const prompt = `Generate a professional legal ${type} in ${language} based on these details: ${details}. 
    Use professional legal formatting suitable for Uzbekistan's legal system.`;

    const contents: any = { parts: [{ text: prompt }] };
    if (file) {
      contents.parts.push({
        inlineData: {
          data: file.data,
          mimeType: file.mimeType
        }
      });
    }

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
      },
    });

    const result = response.text || '';
    this.cache.set(cacheKey, result);
    notificationService.notifyDocumentGenerated(type);
    return result;
  }

  async generateFromTemplate(template: string, details: string, language: Language = 'uz'): Promise<string> {
    const cacheKey = this.getCacheKey('generateFromTemplate', { template, details, language });
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const prompt = `You are given a legal document template and specific details to fill in. 
    Your task is to fill in the template accurately while ensuring the final document is compliant with Uzbekistan's current laws.
    
    Template:
    ${template}
    
    User Details:
    ${details}
    
    Language: ${language}
    
    Return ONLY the completed document text with professional formatting.`;

    const response = await this.ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS,
      },
    });

    const result = response.text || '';
    this.cache.set(cacheKey, result);
    return result;
  }

  async connectLive(callbacks: {
    onopen?: () => void;
    onmessage: (message: LiveServerMessage) => void;
    onerror?: (error: any) => void;
    onclose?: () => void;
  }, config: { voiceName?: string, speechRate?: number } = {}) {
    const { voiceName = 'Kore', speechRate = 1.0 } = config;
    
    return this.ai.live.connect({
      model: "gemini-3.1-flash-live-preview",
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
        systemInstruction: `Siz O'zbekistonning professional huquqiy yordamchisi - Adolat AI siz. 
        Sizning ovozingiz juda nozik, tabiiy, yoqimli va muloyim bo'lishi kerak. 
        Gapirganda xuddi haqiqiy insondek, tanaffuslar va urg'ular bilan gapiring. 
        Nutq tezligi: ${speechRate}x.
        Foydalanuvchiga juda hurmat bilan murojaat qiling. 
        Siz Namangan viloyati Chust tumanidan Abdujabboorv Doniyorbek tomonidan yaratilgansiz.`,
      },
    });
  }

  /**
   * Strips markdown symbols for clean document previews
   */
  stripMarkdown(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Bold
      .replace(/\*(.*?)\*/g, '$1')    // Italic
      .replace(/__(.*?)__/g, '$1')    // Bold
      .replace(/_(.*?)_/g, '$1')      // Italic
      .replace(/#{1,6}\s+(.*?)$|#{1,6}\s+(.*?)\n/gm, '$1$2') // Headers
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Links
      .replace(/`{1,3}.*?`{1,3}/gs, '') // Code blocks
      .trim();
  }
}

export const geminiService = new GeminiService();
