import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { Globe, Mail, Phone, LogIn, X, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [method, setMethod] = useState<'google' | 'email' | 'phone'>('google');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800"
      >
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
              <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-widest">Adolat AI</span>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Ro'yxatdan o'tish</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Ilovadan to'liq foydalanish uchun tizimga kiring.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
            >
              <Globe className="text-blue-600" size={20} />
              Google orqali kirish
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-zinc-900 px-2 text-zinc-500">Yoki</span>
              </div>
            </div>

            <button
              disabled
              className="w-full py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-2xl font-bold flex items-center justify-center gap-3 cursor-not-allowed"
            >
              <Mail size={20} />
              Email orqali (Tez kunda)
            </button>

            <button
              disabled
              className="w-full py-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-500 rounded-2xl font-bold flex items-center justify-center gap-3 cursor-not-allowed"
            >
              <Phone size={20} />
              Telefon orqali (Tez kunda)
            </button>
          </div>

          <div className="pt-4 flex items-center gap-2 text-[10px] text-zinc-400 justify-center">
            <ShieldCheck size={12} />
            Ma'lumotlaringiz xavfsiz va himoyalangan
          </div>
        </div>
      </motion.div>
    </div>
  );
}
