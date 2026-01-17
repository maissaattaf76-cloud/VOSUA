
import React, { useState, useEffect } from 'react';

interface LoginScreenProps {
  onAccessGranted: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onAccessGranted }) => {
  const [accessCode, setAccessCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'syncing' | 'authorized'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (status === 'syncing') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStatus('authorized'), 300);
            setTimeout(onAccessGranted, 800);
            return 100;
          }
          return prev + Math.random() * 5;
        });
      }, 25);
      return () => clearInterval(interval);
    }
  }, [status, onAccessGranted]);

  return (
    <div className="fixed inset-0 z-[200] bg-[#050705] flex flex-col items-center justify-center p-8 font-arabic overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.04),transparent_70%)]" />
      
      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Brand Presence */}
        <div className="mb-20 text-center animate-in fade-in slide-in-from-top-6 duration-1000">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/10 bg-emerald-500/5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse emerald-glow" />
              <span className="text-[7px] font-orbitron font-black text-emerald-400 uppercase tracking-[0.8em]">OBSIDIAN CORE v40.0</span>
           </div>
           <h1 className="text-7xl font-orbitron font-black text-white tracking-tighter mb-2">VOSUA<span className="text-emerald-500">Ω</span></h1>
           <p className="text-[8px] text-emerald-900 uppercase font-black tracking-[1.2em]">Matrix Evolution</p>
        </div>

        {/* Sync Interface */}
        <div className="w-full glass-obsidian rounded-[3rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,1)] relative overflow-hidden group">
           <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
           
           {status === 'idle' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center gap-8">
                   <div className="w-20 h-20 rounded-[2rem] border border-emerald-500/10 bg-emerald-500/[0.01] flex items-center justify-center relative group-hover:border-emerald-500/30 transition-all duration-700">
                      <div className="absolute inset-2 rounded-[1.5rem] border border-emerald-500/5 animate-pulse" />
                      <svg className="w-8 h-8 text-emerald-900 group-hover:text-emerald-500 transition-colors duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-4.514A9.01 9.01 0 0012 15a9.01 9.01 0 005.193-1.636m2.753-9.571A10.011 10.011 0 0012 2c-1.883 0-3.658.518-5.193 1.429" />
                      </svg>
                   </div>
                   <input 
                    type="password" 
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="SYCHRONIZE_KEY"
                    className="w-full bg-transparent border-b border-white/5 py-3 text-center text-white font-mono tracking-[0.5em] focus:border-emerald-500 outline-none transition-all placeholder:text-emerald-950 text-[11px]"
                   />
                </div>
                <button 
                  onClick={() => setStatus('syncing')}
                  className="w-full py-5 bg-emerald-600 text-white font-black uppercase text-[9px] tracking-[0.5em] rounded-2xl hover:bg-emerald-500 transition-all ios-button emerald-glow-strong"
                >
                  Initiate_Sync
                </button>
             </div>
           )}

           {status === 'syncing' && (
             <div className="flex flex-col items-center py-8 space-y-10 animate-in zoom-in-95 duration-500">
                <div className="relative w-28 h-28">
                   <div className="absolute inset-0 rounded-full border-[0.5px] border-emerald-500/10" />
                   <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="301.6" strokeDashoffset={301.6 - (301.6 * progress) / 100} className="text-emerald-500 emerald-glow transition-all duration-100" />
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center font-orbitron text-sm font-black text-white">
                      {Math.floor(progress)}%
                   </div>
                </div>
                <div className="text-center">
                   <p className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Aligning_Neural_Matrix</p>
                   <p className="text-[7px] text-emerald-900 uppercase font-bold tracking-widest mt-3">Accessing quantum logic gate...</p>
                </div>
             </div>
           )}

           {status === 'authorized' && (
             <div className="flex flex-col items-center py-10 space-y-6 animate-in zoom-in-95 duration-500">
                <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.5)]">
                   <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[1em]">ACCESS_GRANTED</p>
             </div>
           )}
        </div>

        {/* Terminal Info */}
        <div className="mt-16 w-full flex justify-between px-6 opacity-40">
           <div className="flex flex-col gap-1.5">
              <span className="text-[6px] text-emerald-500 font-black uppercase tracking-widest">Logic: Stable</span>
              <span className="text-[6px] text-emerald-500 font-black uppercase tracking-widest">Neural: 40.0</span>
           </div>
           <div className="flex flex-col items-end gap-1.5 text-right">
              <span className="text-[6px] text-emerald-500 font-black uppercase tracking-widest">Obsidian_Matrix</span>
              <span className="text-[6px] text-emerald-500 font-black uppercase tracking-widest">Syncing...</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
