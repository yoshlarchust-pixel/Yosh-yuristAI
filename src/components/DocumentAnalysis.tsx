import React, { useState, useRef } from 'react';
import { FileSearch, AlertTriangle, CheckCircle, Info, Loader2, ShieldAlert, Zap, Upload, FileText, X, FileCheck } from 'lucide-react';
import { AnalysisResult } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

interface DocumentAnalysisProps {
  onAnalyze: (text: string, file?: { data: string, mimeType: string }) => Promise<AnalysisResult>;
  isLoading: boolean;
}

export function DocumentAnalysis({ onAnalyze, isLoading }: DocumentAnalysisProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('Fayl hajmi 10MB dan oshmasligi kerak');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = (event.target?.result as string).split(',')[1];
        setFile({
          name: selectedFile.name,
          data: base64,
          mimeType: selectedFile.type
        });
        toast.success('Fayl yuklandi');
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if ((text.trim() || file) && !isLoading) {
      try {
        const res = await onAnalyze(text, file ? { data: file.data, mimeType: file.mimeType } : undefined);
        setResult(res);
      } catch (error) {
        // Error handled in App.tsx
      }
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500 bg-green-500/10 border-green-500/20';
    if (score < 70) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto custom-scrollbar p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <FileSearch className="text-blue-600" size={32} />
            Hujjatlar Tahlili
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Shartnoma, sud qarori yoki boshqa yuridik matnni yuklang yoki nusxalab joylang. AI xavflarni va muhim bandlarni aniqlab beradi.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                Matnni joylang
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Hujjat matnini bu yerga joylang..."
                className="w-full h-48 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white resize-none custom-scrollbar"
              />
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                Yoki fayl yuklang
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group",
                  file 
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-900/30 bg-zinc-50 dark:bg-zinc-950"
                )}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                {file ? (
                  <>
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                      <FileCheck size={32} />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{file.name}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-red-500 font-bold mt-2 hover:underline"
                      >
                        O'chirish
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-blue-500 transition-colors">
                      <Upload size={32} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">Faylni tanlang</p>
                      <p className="text-xs text-zinc-500 mt-1">PDF, DOCX, Rasm (Max 10MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Info size={14} />
              <span>AI barcha turdagi yuridik hujjatlarni tahlil qila oladi</span>
            </div>
            <button
              onClick={handleAnalyze}
              disabled={(!text.trim() && !file) || isLoading}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
              {isLoading ? 'Tahlil qilinmoqda...' : 'Tahlil qilish'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 pb-12"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={cn(
                  "p-6 rounded-3xl border flex flex-col items-center justify-center text-center space-y-2",
                  getRiskColor(result.risks.score)
                )}>
                  <span className="text-sm font-semibold uppercase tracking-wider opacity-70">Risk Score</span>
                  <span className="text-5xl font-black">{result.risks.score}</span>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/20">
                    {result.risks.score < 30 ? 'Low Risk' : result.risks.score < 70 ? 'Moderate Risk' : 'High Risk'}
                  </span>
                </div>
                <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-3">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Info className="text-blue-600" size={20} />
                    Summary
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {result.summary}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Risk Details
                  </h3>
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{result.risks.explanation}</p>
                  <ul className="space-y-2">
                    {result.risks.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-green-600 flex items-center gap-2">
                    <CheckCircle size={20} />
                    Recommendations
                  </h3>
                  <ul className="space-y-2">
                    {result.recommendations.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Zap className="text-yellow-500" size={20} />
                  Simplified (Explain like I'm 15)
                </h3>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-sm italic text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {result.simplified}
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300 italic">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>Ushbu tahlil sun’iy intellekt tomonidan yaratilgan bo‘lib, rasmiy yuridik maslahat hisoblanmaydi.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
