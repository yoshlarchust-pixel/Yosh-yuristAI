import React, { useState, useRef } from 'react';
import { FileText, Loader2, ShieldAlert, Download, Copy, Check, Landmark, User, MessageSquare, Upload, FileCheck, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

import { geminiService } from '../services/geminiService';

interface PetitionGeneratorProps {
  onGenerate: (type: string, details: string, file?: { data: string, mimeType: string }) => Promise<string>;
  isLoading: boolean;
}

const organizations = [
  "O'zbekiston Respublikasi Oliy sudi",
  "Toshkent shahar sudi",
  "Toshkent viloyat sudi",
  "O'zbekiston Respublikasi Bosh prokuraturasi",
  "O'zbekiston Respublikasi Adliya vazirligi",
  "Toshkent shahar Ichki ishlar bosh boshqarmasi",
  "O'zbekiston Respublikasi Davlat soliq qo'mitasi",
  "O'zbekiston Respublikasi Markaziy banki",
  "Toshkent shahar hokimiyati",
  "O'zbekiston Respublikasi Bandlik va mehnat munosabatlari vazirligi"
];

export function PetitionGenerator({ onGenerate, isLoading }: PetitionGeneratorProps) {
  const [recipient, setRecipient] = useState('');
  const [senderInfo, setSenderInfo] = useState('');
  const [purpose, setPurpose] = useState('');
  const [docType, setDocType] = useState('Ariza');
  const [file, setFile] = useState<{ name: string, data: string, mimeType: string } | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const docTypes = [
    { id: 'Ariza', label: 'Ariza', icon: FileText, color: 'bg-blue-500' },
    { id: 'Raddiya', label: 'Raddiya', icon: ShieldAlert, color: 'bg-red-500' },
    { id: 'Kafolat xati', label: 'Kafolat xati', icon: Check, color: 'bg-green-500' },
    { id: 'Tushuntirish xati', label: 'Tushuntirish xati', icon: MessageSquare, color: 'bg-amber-500' },
  ];

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

  const handleGenerate = async () => {
    if (recipient && senderInfo && (purpose || file) && !isLoading) {
      const details = `
        HUJJAT TURI: ${docType}
        KIMGA: ${recipient}
        KIMDAN: ${senderInfo}
        MAQSAD/MAZMUN: ${purpose}
        ${file ? `ILOVA QILINGAN FAYL: ${file.name}` : ''}
        
        Iltimos, ushbu ma'lumotlar asosida O'zbekiston qonunchiligiga muvofiq professional ${docType} hujjati tayyorlab bering.
      `;
      const res = await onGenerate(docType, details, file ? { data: file.data, mimeType: file.mimeType } : undefined);
      setResult(res);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadWord = async () => {
    if (!result) return;

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: result.split('\n').map(line => 
            new Paragraph({
              children: [new TextRun(line)],
              spacing: { after: 200 },
              alignment: line.includes(':') && line.length < 50 ? AlignmentType.RIGHT : AlignmentType.LEFT
            })
          ),
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, "Adolat_AI_Hujjat.docx");
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto custom-scrollbar p-6">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            <Landmark className="text-blue-600" size={32} />
            Arizalar va Shikoyatlar
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400">
            Prezident portali, hokimiyatlar va boshqa davlat tashkilotlariga professional arizalar va shikoyatlar tayyorlash bo'limi.
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-sm space-y-8">
          {/* Document Type Selection */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
              Hujjat turini tanlang
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {docTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setDocType(type.id)}
                  className={cn(
                    "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 text-center group",
                    docType === type.id 
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/10" 
                      : "border-zinc-100 dark:border-zinc-800 hover:border-blue-200 dark:hover:border-blue-900/30"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110",
                    type.color
                  )}>
                    <type.icon size={20} />
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    docType === type.id ? "text-blue-600 dark:text-blue-400" : "text-zinc-500"
                  )}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Landmark size={16} className="text-blue-600" />
                Qaysi tashkilotga?
              </label>
              <select
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
              >
                <option value="">Tashkilotni tanlang...</option>
                {organizations.map((org, i) => (
                  <option key={i} value={org}>{org}</option>
                ))}
              </select>
              <input 
                type="text"
                placeholder="Yoki boshqa tashkilot nomi..."
                value={recipient && !organizations.includes(recipient) ? recipient : ''}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white mt-2"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <User size={16} className="text-blue-600" />
                Siz haqingizda ma'lumot
              </label>
              <textarea
                value={senderInfo}
                onChange={(e) => setSenderInfo(e.target.value)}
                placeholder="F.I.Sh, manzilingiz, telefon raqamingiz..."
                className="w-full h-[110px] bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white resize-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-600" />
              Murojaat mazmuni (Maqsad)
            </label>
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Murojaatingiz mazmunini qisqacha tushuntiring. Masalan: 'Mahallamizda yo'llar ta'mirtalab', 'Gaz bosimi pastligi haqida'..."
              className="w-full h-40 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all dark:text-white resize-none"
            />
          </div>

          {docType === 'Raddiya' && (
            <div className="space-y-3">
              <label className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Upload size={16} className="text-blue-600" />
                Asoslovchi hujjatni yuklang (Raddiya uchun)
              </label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all group",
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
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                      <FileCheck size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">{file.name}</p>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        O'chirish
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto text-zinc-400 group-hover:text-blue-500 transition-colors mb-2" size={32} />
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">Faylni tanlang</p>
                    <p className="text-xs text-zinc-500 mt-1">PDF, Rasm yoki Word hujjat</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={handleGenerate}
              disabled={!recipient || !senderInfo || (!purpose && !file) || isLoading}
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Zap size={24} />}
              {isLoading ? 'Hujjat tayyorlanmoqda...' : 'Hujjatni yaratish'}
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
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Tayyorlangan Hujjat</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    {copied ? 'Nusxa olindi' : 'Nusxa olish'}
                  </button>
                  <button
                    onClick={downloadWord}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all"
                  >
                    <Download size={16} />
                    Word (DOCX)
                  </button>
                </div>
              </div>
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 shadow-sm font-serif text-sm leading-relaxed whitespace-pre-wrap dark:text-zinc-200 min-h-[500px] border-t-8 border-t-blue-600">
                {geminiService.stripMarkdown(result)}
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-start gap-3 text-xs text-blue-800 dark:text-blue-300 italic">
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <span>Ushbu hujjat sun’iy intellekt tomonidan yaratilgan bo‘lib, professional yuridik maslahat o‘rnini bosmaydi.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
