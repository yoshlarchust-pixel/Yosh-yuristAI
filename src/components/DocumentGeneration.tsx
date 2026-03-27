import React, { useState, useRef } from 'react';
import { FilePlus, FileText, Loader2, ShieldAlert, Download, Copy, Check, Upload, X, Eye, FileSearch } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

interface DocumentGenerationProps {
  onGenerate: (type: string, details: string, file?: { data: string; mimeType: string }) => Promise<string>;
  isLoading: boolean;
}

export function DocumentGeneration({ onGenerate, isLoading }: DocumentGenerationProps) {
  const [type, setType] = useState('Contract');
  const [details, setDetails] = useState('');
  const [templateText, setTemplateText] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    { id: 'Contract', label: 'Shartnoma', description: 'Mehnat, ijara, xizmat ko\'rsatish va h.k.' },
    { id: 'Application', label: 'Ariza', description: 'Davlat organlariga, ish beruvchiga va h.k.' },
    { id: 'Complaint', label: 'Shikoyat', description: 'Iste\'molchi huquqlari, ma\'muriy va h.k.' },
    { id: 'Appeal', label: 'Apellyatsiya', description: 'Sud qarorlari ustidan shikoyat va h.k.' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTemplateName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTemplateText(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (details.trim() && !isLoading) {
      const fileData = templateText ? { data: btoa(templateText), mimeType: 'text/plain' } : undefined;
      const res = await onGenerate(type, details, fileData);
      setResult(res);
      setShowPreview(true); // Automatically show preview after generation
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async () => {
    if (!result) return;

    const cleanText = geminiService.stripMarkdown(result);
    const lines = cleanText.split('\n');

    const doc = new Document({
      sections: [{
        properties: {},
        children: lines.map(line => {
          const isHeader = line.toUpperCase() === line && line.length > 5;
          return new Paragraph({
            children: [
              new TextRun({
                text: line,
                bold: isHeader,
                size: isHeader ? 28 : 24,
                font: "Times New Roman"
              }),
            ],
            alignment: isHeader ? AlignmentType.CENTER : AlignmentType.LEFT,
            spacing: {
              after: 200,
            },
          });
        }),
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${type}_AdolatAI.docx`);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto custom-scrollbar p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <FilePlus className="text-blue-600" size={32} />
            Hujjat Yaratish
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Hujjat turini tanlang yoki o'z shabloningizni yuklang, so'ngra professional yuridik hujjat yaratish uchun tafsilotlarni kiriting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setType(t.id);
                setTemplateText(null);
                setTemplateName(null);
              }}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all space-y-2",
                type === t.id && !templateText
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-blue-500"
              )}
            >
              <FileText size={24} className={type === t.id && !templateText ? "text-white" : "text-blue-600"} />
              <div className="font-bold">{t.label}</div>
              <div className={cn("text-xs opacity-70", type === t.id && !templateText ? "text-white" : "text-zinc-500")}>{t.description}</div>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-zinc-900 dark:text-white">
                {templateText ? 'Shablon tafsilotlari' : 'Hujjat tafsilotlari'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".txt,.doc,.docx"
                />
                {templateName ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-800">
                    <FileText size={14} />
                    <span className="truncate max-w-[150px]">{templateName}</span>
                    <button onClick={() => { setTemplateText(null); setTemplateName(null); }} className="hover:text-red-500">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all border border-zinc-200 dark:border-zinc-800"
                  >
                    <Upload size={14} />
                    Shablon yuklash
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={templateText 
                ? "Shablonni to'ldirish uchun aniq ma'lumotlarni (ismlar, sanalar, miqdorlar va h.k.) kiriting..." 
                : `${type} uchun tafsilotlarni tavsiflang... (masalan, ishtirokchilar, shartlar, maxsus so'rovlar)`}
              className="w-full h-48 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white resize-none custom-scrollbar"
            />
          </div>
          <div className="flex items-center justify-end">
            <button
              onClick={handleGenerate}
              disabled={!details.trim() || isLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <FilePlus size={18} />}
              {isLoading ? 'Yaratilmoqda...' : templateText ? 'Shablonni to\'ldirish' : 'Hujjat yaratish'}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pb-12"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Yaratilgan Hujjat</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                  >
                    <Eye size={16} />
                    Ko'rib chiqish
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    {copied ? 'Nusxalandi' : 'Nusxa olish'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
                  >
                    <Download size={16} />
                    Word Yuklash
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm font-serif text-sm leading-relaxed whitespace-pre-wrap dark:text-zinc-200 min-h-[400px]">
                {geminiService.stripMarkdown(result)}
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300 italic">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>Ushbu hujjat sun’iy intellekt tomonidan yaratilgan bo‘lib, rasmiy yuridik maslahat hisoblanmaydi.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && result && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-4xl h-full max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                    <FileSearch size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Hujjatni ko'rib chiqish</h3>
                    <p className="text-xs text-zinc-500">Professional formatda ko'rinishi</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-full transition-all"
                >
                  <X size={24} className="text-zinc-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-zinc-100 dark:bg-zinc-800 custom-scrollbar">
                <div className="bg-white dark:bg-zinc-900 w-full max-w-[210mm] mx-auto min-h-[297mm] shadow-xl p-[20mm] md:p-[30mm] font-serif text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">
                  {geminiService.stripMarkdown(result)}
                </div>
              </div>

              <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-zinc-500 italic">
                  <ShieldAlert size={14} />
                  Hujjatni yuklashdan oldin barcha ma'lumotlarni tekshiring.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-xl font-medium hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all"
                  >
                    {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                    {copied ? 'Nusxalandi' : 'Nusxa olish'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Download size={18} />
                    Word Yuklash
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
