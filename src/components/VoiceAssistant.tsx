import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Bot, ShieldAlert, Loader2, Sparkles, Zap, Settings, Play, Pause, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { notificationService } from '../services/notificationService';
import { geminiService } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';

interface VoiceAssistantProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  isStreaming: boolean;
  lastMessage: string | null;
  lastAudio: string | null;
  voiceGender: 'female' | 'male';
  setVoiceGender: (gender: 'female' | 'male') => void;
  speechRate: number;
  setSpeechRate: (rate: number) => void;
}

export function VoiceAssistant({ 
  onSendMessage, 
  isLoading, 
  isStreaming, 
  lastMessage, 
  lastAudio,
  voiceGender,
  setVoiceGender,
  speechRate,
  setSpeechRate
}: VoiceAssistantProps) {
  const [isLive, setIsLive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiTranscript, setAiTranscript] = useState('');
  const [isStreamingAudio, setIsStreamingAudio] = useState(false);
  const [audioData, setAudioData] = useState<number[]>(new Array(16).fill(0));
  const [showSettings, setShowSettings] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [hasPendingAudio, setHasPendingAudio] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef(false);
  const isStreamingAudioRef = useRef(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  const startLiveSession = async () => {
    try {
      setIsConnecting(true);
      setTranscript('');
      setAiTranscript('');
      
      // Initialize Audio Context
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      const voiceName = voiceGender === 'female' ? 'Kore' : 'Puck';

      const session = await geminiService.connectLive({
        onopen: () => {
          setIsLive(true);
          setIsConnecting(false);
          startMicStreaming();
          notificationService.notify('Live Connection', 'Adolat AI bilan jonli muloqot boshlandi.', 'success');
        },
        onmessage: async (message: LiveServerMessage) => {
          // Handle Audio Output
          const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (base64Audio) {
            const binary = atob(base64Audio);
            const pcmData = new Int16Array(binary.length / 2);
            for (let i = 0; i < pcmData.length; i++) {
              pcmData[i] = (binary.charCodeAt(i * 2) | (binary.charCodeAt(i * 2 + 1) << 8));
            }
            const floatData = new Float32Array(pcmData.length);
            for (let i = 0; i < pcmData.length; i++) {
              floatData[i] = pcmData[i] / 32768.0;
            }
            
            if (isAutoPlay) {
              audioQueueRef.current.push(floatData);
              if (!isPlayingRef.current) playNextInQueue();
            } else {
              audioQueueRef.current.push(floatData);
              setHasPendingAudio(true);
            }
          }

          // Handle Transcriptions
          const modelTranscript = message.serverContent?.modelTurn?.parts?.[0]?.text;
          if (modelTranscript) {
            setAiTranscript(prev => prev + modelTranscript);
          }

          const userTranscript = message.serverContent?.inputTranscription?.text;
          if (userTranscript) {
            setTranscript(userTranscript);
          }

          if (message.serverContent?.interrupted) {
            audioQueueRef.current = [];
            isPlayingRef.current = false;
            setIsAiSpeaking(false);
          }
        },
        onerror: (err) => {
          console.error("Live Error:", err);
          stopLiveSession();
          notificationService.notifyError('Jonli ulanishda xatolik yuz berdi.');
        },
        onclose: () => {
          stopLiveSession();
        }
      }, { voiceName, speechRate });

      sessionRef.current = session;
    } catch (error) {
      console.error("Failed to connect live:", error);
      setIsConnecting(false);
      notificationService.notifyError('Ulanish amalga oshmadi.');
    }
  };

  const startMicStreaming = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = audioContextRef.current!;
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;

      source.connect(analyser);
      source.connect(processor);
      processor.connect(ctx.destination);

      sourceRef.current = source;
      processorRef.current = processor;
      analyserRef.current = analyser;

      processor.onaudioprocess = (e) => {
        if (!sessionRef.current) {
          if (isStreamingAudioRef.current) {
            isStreamingAudioRef.current = false;
            setIsStreamingAudio(false);
          }
          return;
        }
        
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Check if there's actual audio signal (not just silence)
        const hasSignal = inputData.some(v => Math.abs(v) > 0.01);
        if (hasSignal !== isStreamingAudioRef.current) {
          isStreamingAudioRef.current = hasSignal;
          setIsStreamingAudio(hasSignal);
        }

        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
        }
        const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
        sessionRef.current.sendRealtimeInput({
          audio: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
        });
      };

      startVisualizer();
    } catch (err: any) {
      console.error("Mic access error:", err);
      let errorMessage = 'Mikrofonga ruxsat berilmadi.';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Mikrofonga ruxsat berilmadi. Iltimos, brauzer sozlamalaridan ruxsat bering.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'Mikrofon topilmadi. Iltimos, qurilmangizni tekshiring.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage = 'Mikrofon band yoki ishlamayapti. Boshqa ilovalar mikrofonni ishlatmayotganiga ishonch hosil qiling.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Mikrofon talablarga javob bermaydi.';
      }
      
      notificationService.notifyError(errorMessage);
      stopLiveSession();
    }
  };

  const playNextInQueue = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setIsAiSpeaking(false);
      setHasPendingAudio(false);
      return;
    }

    isPlayingRef.current = true;
    setIsAiSpeaking(true);
    const ctx = audioContextRef.current!;
    const data = audioQueueRef.current.shift()!;
    const buffer = ctx.createBuffer(1, data.length, 16000);
    buffer.getChannelData(0).set(data);
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = playNextInQueue;
    source.start();
  };

  const startVisualizer = () => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const update = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      const normalizedData = Array.from(dataArray.slice(0, 16)).map(v => v / 255);
      setAudioData(normalizedData);
      animationFrameRef.current = requestAnimationFrame(update);
    };
    update();
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsLive(false);
    setIsConnecting(false);
    setAudioData(new Array(16).fill(0));
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsAiSpeaking(false);
    setHasPendingAudio(false);
  };

  useEffect(() => {
    return () => stopLiveSession();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 overflow-y-auto custom-scrollbar">
      <div className="relative flex flex-col items-center justify-center space-y-8 md:space-y-12 w-full max-w-2xl">
        
        {/* Settings Button */}
        <div className="absolute top-0 right-0 z-20">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-blue-600 transition-all shadow-sm"
          >
            <Settings size={20} className={cn(showSettings && "rotate-90 transition-transform")} />
          </button>
          
          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-12 right-0 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Ovoz jinsi</label>
                  <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                    <button 
                      onClick={() => setVoiceGender('female')}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                        voiceGender === 'female' ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-zinc-500"
                      )}
                    >
                      Ayol
                    </button>
                    <button 
                      onClick={() => setVoiceGender('male')}
                      className={cn(
                        "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                        voiceGender === 'male' ? "bg-white dark:bg-zinc-700 text-blue-600 shadow-sm" : "text-zinc-500"
                      )}
                    >
                      Erkak
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Nutq tezligi</label>
                    <span className="text-[10px] font-bold text-blue-600">{speechRate}x</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2.0" 
                    step="0.1" 
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Avtomatik ijro</label>
                  <button 
                    onClick={() => setIsAutoPlay(!isAutoPlay)}
                    className={cn(
                      "w-10 h-5 rounded-full transition-all relative",
                      isAutoPlay ? "bg-blue-600" : "bg-zinc-300 dark:bg-zinc-700"
                    )}
                  >
                    <motion.div 
                      animate={{ x: isAutoPlay ? 22 : 2 }}
                      className="absolute top-1 w-3 h-3 bg-white rounded-full"
                    />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Visualizer / Wave Animation */}
        <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
          <AnimatePresence>
            {(isLive || isConnecting) && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: isAiSpeaking ? [1.2, 1.3, 1.2] : 1.2, 
                    opacity: isAiSpeaking ? 0.3 : 0.2 
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className={cn(
                    "absolute inset-0 rounded-full blur-xl transition-colors duration-500",
                    isAiSpeaking ? "bg-purple-500" : "bg-blue-500"
                  )}
                />
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: isAiSpeaking ? [1.5, 1.6, 1.5] : 1.5, 
                    opacity: isAiSpeaking ? 0.2 : 0.1 
                  }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className={cn(
                    "absolute inset-0 rounded-full blur-2xl transition-colors duration-500",
                    isAiSpeaking ? "bg-purple-400" : "bg-blue-400"
                  )}
                />
              </>
            )}
          </AnimatePresence>

          <div className="absolute inset-0 flex items-center justify-center gap-1.5 px-4">
            {audioData.map((val, i) => (
              <motion.div
                key={i}
                animate={{ 
                  height: 4 + (val * 140),
                  opacity: 0.3 + (val * 0.7),
                  backgroundColor: isAiSpeaking ? "#A855F7" : "#3B82F6",
                  scaleX: 1 + (val * 0.5)
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={cn(
                  "w-1.5 md:w-2 rounded-full transition-colors duration-300",
                  !isLive && "bg-zinc-300 dark:bg-zinc-700"
                )}
              />
            ))}
          </div>

          <button
            onClick={isLive ? stopLiveSession : startLiveSession}
            disabled={isConnecting}
            className={cn(
              "relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl border-4",
              isLive 
                ? "bg-red-500 text-white scale-110 border-red-400/50" 
                : "bg-white dark:bg-zinc-900 text-blue-600 border-zinc-200 dark:border-zinc-800 hover:scale-105 hover:border-blue-500/50"
            )}
          >
            {isConnecting ? (
              <Loader2 size={40} className="animate-spin" />
            ) : isLive ? (
              <MicOff size={40} />
            ) : (
              <Mic size={40} />
            )}
          </button>
        </div>

        <div className="w-full text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border",
              isLive ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800"
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", isLive ? "bg-green-500 animate-pulse" : "bg-zinc-400")} />
              {isLive ? "Jonli ulanish" : "Ulanmagan"}
            </div>
            <div className="px-3 py-1 bg-blue-600/10 text-blue-600 border border-blue-600/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <Zap size={12} />
              Live API v3.1
            </div>
            {isLive && isStreamingAudio && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                Streaming
              </motion.div>
            )}
          </div>
          
          <AnimatePresence mode="wait">
            {(transcript || aiTranscript) ? (
              <motion.div
                key="transcripts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4 max-w-lg mx-auto"
              >
                {transcript && (
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm text-left">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Siz</div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 italic">"{transcript}"</p>
                  </div>
                )}
                {aiTranscript && (
                  <div className={cn(
                    "p-4 rounded-2xl shadow-xl text-left transition-all duration-500 relative group",
                    isAiSpeaking ? "bg-purple-600 scale-[1.02]" : "bg-blue-600"
                  )}>
                    <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-1 flex justify-between items-center">
                      <span>Adolat AI</span>
                      {isAiSpeaking && <Sparkles size={12} className="animate-pulse" />}
                    </div>
                    <p className="text-sm leading-relaxed text-white">{aiTranscript}</p>
                    
                    {hasPendingAudio && !isAiSpeaking && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={playNextInQueue}
                        className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition-all"
                      >
                        <Play size={14} fill="currentColor" />
                        Eshittirish
                      </motion.button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2">
                <h3 className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  {isConnecting ? "Ulanmoqda..." : isLive ? "Sizni eshityapman" : "Jonli muloqotni boshlang"}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm max-w-xs mx-auto font-medium">
                  {isLive ? "Savolingizni ayting, men real vaqtda javob beraman." : "Mikrofonga bosing va Adolat AI bilan bevosita gaplashing."}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg pt-8">
          {[
            { title: 'Real-vaqt', desc: 'Kutishlarsiz muloqot' },
            { title: 'Tabiiy ovoz', desc: 'Insondek suhbat' }
          ].map((item, i) => (
            <div key={i} className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-600">
                <Sparkles size={20} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">{item.title}</div>
                <div className="text-[10px] text-zinc-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
