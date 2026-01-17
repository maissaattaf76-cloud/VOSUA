
import React, { useState, useEffect } from 'react';
import { AIMode, AIPersona } from './types';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import VoiceInterface from './components/VoiceInterface';
import ImageGenInterface from './components/ImageGenInterface';
import WebForgeInterface from './components/WebForgeInterface';
import ArtifactPreview from './components/ArtifactPreview';
import StateManager from './components/StateManager';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AIMode>('chat');
  const [activePersona, setActivePersona] = useState<AIPersona>('expert');
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const [isHyperDrive, setIsHyperDrive] = useState(false);
  const [isStateManagerOpen, setIsStateManagerOpen] = useState(false);
  
  const [stats, setStats] = useState({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    latency: '14ms'
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setStats({
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        latency: `${Math.floor(Math.random() * 8) + 10}ms`
      });
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex flex-col h-[100dvh] w-full bg-black overflow-hidden transition-all duration-1000 ${isHyperDrive ? 'brightness-110 contrast-110' : ''}`}>
      
      {/* Universal HUD - Compact for Mobile */}
      <header className="fixed top-0 left-0 w-full z-[100] px-4 pt-safe pointer-events-none">
        <div className="flex justify-center mt-3">
          <div className="h-10 px-5 glass-mobile rounded-full flex items-center justify-between gap-6 border border-emerald-500/10 shadow-2xl pointer-events-auto min-w-[280px] max-w-md transition-all duration-500 active:scale-[0.98]">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
               <span className="text-[10px] font-orbitron font-black text-white tracking-widest uppercase">VOSUA <span className="text-emerald-500">Ω</span></span>
            </div>
            
            <div className="flex items-center gap-3 text-[8px] font-black text-emerald-800 uppercase tracking-widest font-mono">
               <span className="opacity-80">{stats.latency}</span>
               <span className="opacity-20">|</span>
               <span className="text-emerald-500/60">{stats.time}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Viewport Engine */}
      <main className="flex-1 relative z-10 flex flex-col pt-16 pb-24 overflow-hidden">
        <div className="flex-1 relative overflow-hidden transition-all duration-500">
            {activeMode === 'chat' && <ChatInterface version="42.5" persona={activePersona} onPreviewCode={setPreviewCode} />}
            {activeMode === 'vision' && <ImageGenInterface />}
            {activeMode === 'voice' && <VoiceInterface hasKey={true} onKeyRequest={()=>{}} onArchitectCode={setPreviewCode} />}
            {activeMode === 'builder' && <WebForgeInterface hasKey={true} onKeyRequest={()=>{}} />}
        </div>

        {previewCode && (
          <ArtifactPreview code={previewCode} onClose={() => setPreviewCode(null)} />
        )}
      </main>

      {/* Native-Style Bottom Navigation */}
      <Sidebar 
        activeMode={activeMode} 
        onModeChange={setActiveMode} 
        activePersona={activePersona}
        onPersonaChange={setActivePersona}
        isOpen={true}
        toggleSidebar={() => {}}
        isHyperDrive={isHyperDrive}
        setHyperDrive={setIsHyperDrive}
        onOpenStateManager={() => setIsStateManagerOpen(true)}
      />

      {isStateManagerOpen && (
        <StateManager 
          onClose={() => setIsStateManagerOpen(false)} 
          onLoad={(s) => { setActiveMode(s.activeMode); setIsStateManagerOpen(false); }}
          currentState={{ activeMode, isHyperDrive }}
        />
      )}
    </div>
  );
};

export default App;
