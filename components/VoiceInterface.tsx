
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { VoiceTranscription } from '../types';

interface VoiceInterfaceProps {
  hasKey: boolean;
  onKeyRequest: () => void;
  onArchitectCode?: (code: string | null) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ hasKey, onKeyRequest, onArchitectCode }) => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<VoiceTranscription[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
            setIsActive(true);
            setIsConnecting(false);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (msg.serverContent?.inputTranscription) {
              setTranscriptions(prev => [...prev, { text: msg.serverContent.inputTranscription.text, role: 'user' }]);
            }
            if (msg.serverContent?.outputTranscription) {
              setTranscriptions(prev => [...prev, { text: msg.serverContent.outputTranscription.text, role: 'assistant' }]);
            }
            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: () => { setIsActive(false); setIsConnecting(false); },
          onclose: () => { setIsActive(false); setIsConnecting(false); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: `You are VOSUA Sonic. Elite neural assistant. Mode: Emerald.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  const handleExportTranscriptions = () => {
    if (transcriptions.length === 0) return;
    
    const content = transcriptions.map(t => 
      `${t.role === 'user' ? 'USER' : 'VOSUA'}: ${t.text}`
    ).join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vosua-sonic-transcript-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-transparent font-arabic relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full animate-pulse" />
      
      <div className="relative z-10 flex flex-col items-center gap-12 max-w-md w-full">
         <div className="text-center space-y-2">
            <h2 className="text-3xl font-orbitron font-black text-white">SONIC<span className="text-emerald-500"> Ω</span></h2>
            <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-[0.5em]">Neural Voice Bridge</p>
         </div>

         <div className={`w-64 h-64 rounded-full border-2 transition-all duration-1000 flex items-center justify-center relative ${
            isActive ? 'border-emerald-500 shadow-[0_0_100px_rgba(16,185,129,0.2)] scale-110' : 'border-white/5'
          }`}>
            <div className={`w-56 h-56 rounded-full glass-premium flex items-center justify-center overflow-hidden ${isActive ? 'bg-black/80' : 'bg-black/20'}`}>
              <div className="relative w-full h-full flex items-center justify-center">
                 {isActive && (
                   <div className="absolute inset-0 flex items-center justify-center gap-1">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1.5 bg-emerald-500 rounded-full animate-[wave_1s_infinite]" style={{ height: `${Math.random() * 60 + 20}%`, animationDelay: `${i * 0.1}s` }} />
                      ))}
                   </div>
                 )}
                 {!isActive && (
                    <svg className="w-20 h-20 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                 )}
              </div>
            </div>
         </div>

         <div className="h-20 text-center px-6 overflow-y-auto no-scrollbar">
            {transcriptions.length > 0 && (
              <p className="text-emerald-400 font-bold text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2 italic">
                "{transcriptions[transcriptions.length - 1].text}"
              </p>
            )}
         </div>

         <div className="w-full space-y-3">
           {transcriptions.length > 0 && (
             <button
              onClick={handleExportTranscriptions}
              className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-emerald-500 font-black uppercase text-[9px] tracking-[0.3em] flex items-center justify-center gap-2 transition-all hover:bg-white/10 active:scale-95"
             >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                تصدير النص
             </button>
           )}
           
           <button
            onClick={isActive ? () => { sessionRef.current?.close(); setIsActive(false); } : startSession}
            disabled={isConnecting}
            className={`w-full py-5 rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl transition-all ios-active ${
              isActive ? 'bg-red-500/10 border border-red-500/50 text-red-500' : 'bg-emerald-600 text-white'
            }`}
          >
            {isActive ? 'قطع الاتصال العصبوني' : isConnecting ? 'جاري المحاذاة...' : 'بدء الاتصال الحي'}
          </button>
         </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
