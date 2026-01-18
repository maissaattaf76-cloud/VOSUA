
import React, { useState, useEffect } from 'react';
import { AIMode, AIPersona, Artifact } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import ImageGenInterface from './components/ImageGenInterface';
import WebForgeInterface from './components/WebForgeInterface';
import VideoGenInterface from './components/VideoGenInterface';
import ArtifactPreview from './components/ArtifactPreview';
import StateManager from './components/StateManager';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AIMode>('chat');
  const [activePersona, setActivePersona] = useState<AIPersona>('expert');
  const [activeArtifact, setActiveArtifact] = useState<Artifact | null>(null);
  const [isStateManagerOpen, setIsStateManagerOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  
  // نظام التطور اللحظي
  const [evoStats, setEvoStats] = useState({
    level: 1.0001,
    optimizations: 142,
    currentTask: 'تحليل البروتوكولات...'
  });

  const [evoLogs, setEvoLogs] = useState<string[]>([]);

  useEffect(() => {
    const tasks = [
      'تحديث منطق الاستجابة...',
      'تحسين مصفوفة الألوان...',
      'مزامنة الأنوية العصبية...',
      'تشفير بيانات الواجهة...',
      'رفع كفاءة المعالجة...',
      'ضبط معايير VOSUA Ω...'
    ];

    const timer = setInterval(() => {
      setEvoStats(prev => ({
        level: prev.level + 0.0001,
        optimizations: prev.optimizations + 1,
        currentTask: tasks[Math.floor(Math.random() * tasks.length)]
      }));

      const newLog = `EVO_LOG: [${new Date().toLocaleTimeString()}] تم تحسين ${Math.random().toString(16).slice(2, 8)}`;
      setEvoLogs(prev => [newLog, ...prev].slice(0, 5));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const handleModeChange = (mode: AIMode) => {
    setActiveMode(mode);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`flex h-[100dvh] w-full overflow-hidden relative transition-colors duration-300 ${theme === 'dark' ? 'bg-[#010204]' : 'bg-white'}`}>
      
      {/* HUD - Evolution Engine Header */}
      <div className="fixed top-0 left-0 w-full z-[100] px-4 pt-safe pointer-events-none">
        <div className={`flex justify-between items-center h-12 backdrop-blur-2xl px-6 rounded-full border border-emerald-500/20 mt-3 pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.5)] transition-all ${theme === 'dark' ? 'bg-black/60' : 'bg-white/90'}`}>
           <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 relative shadow-[0_0_15px_#10b981]" />
              </div>
              <div className="flex flex-col">
                <span className={`text-[10px] font-orbitron font-black tracking-tighter uppercase ${theme === 'dark' ? 'text-white' : 'text-black'}`}>VOSUA <span className="text-emerald-500">Ω</span> EVOLVING</span>
                <span className="text-[6px] text-emerald-500/60 font-bold uppercase tracking-[0.2em]">{evoStats.currentTask}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">LVL: {evoStats.level.toFixed(4)}</span>
                <span className="text-[6px] text-white/20 font-bold">OPTS: {evoStats.optimizations}</span>
              </div>

              <button 
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all ios-active ${theme === 'dark' ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-emerald-600 hover:bg-emerald-500/5'}`}
              >
                {theme === 'dark' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                )}
              </button>
           </div>
        </div>
      </div>

      {/* Evolution Side Logs (Floating Desktop) */}
      <div className="fixed right-6 top-24 z-50 pointer-events-none hidden xl:block">
        <div className="glass-premium p-4 rounded-3xl border border-white/5 w-64 space-y-2 opacity-50 hover:opacity-100 transition-opacity">
          <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">سجل التطور العصبوني</p>
          {evoLogs.map((log, i) => (
            <p key={i} className="text-[7px] text-white/40 font-mono animate-in fade-in slide-in-from-right-2" style={{ animationDelay: `${i * 0.1}s` }}>
              {log}
            </p>
          ))}
        </div>
      </div>

      <main className="flex-1 h-full overflow-hidden relative z-10 page-transition">
        {activeMode === 'chat' && <ChatInterface version="ULTRA" persona={activePersona} onArtifact={(art) => setActiveArtifact(art)} />}
        {activeMode === 'vision' && <ImageGenInterface />}
        {activeMode === 'video' && <VideoGenInterface hasKey={true} />}
        {activeMode === 'voice' && <VoiceInterface hasKey={true} onKeyRequest={()=>{}} />}
        {activeMode === 'builder' && <WebForgeInterface hasKey={true} onKeyRequest={()=>{}} />}

        {activeArtifact && (
          <ArtifactPreview artifact={activeArtifact} onClose={() => setActiveArtifact(null)} />
        )}
      </main>

      <Sidebar 
        activeMode={activeMode} 
        onModeChange={handleModeChange} 
        onOpenStateManager={() => setIsStateManagerOpen(true)}
      />

      {isStateManagerOpen && (
        <StateManager 
          onClose={() => setIsStateManagerOpen(false)} 
          onLoad={(s) => { setActiveMode(s.activeMode); setIsStateManagerOpen(false); }}
          currentState={{ activeMode, isHyperDrive: false }}
        />
      )}
    </div>
  );
};

export default App;
