
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
        latency: `${Math.floor(Math.random() * 10) + 12}ms`
      });
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`flex flex-col lg:flex-row h-[100dvh] w-full bg-transparent overflow-hidden transition-all duration-1000 ${isHyperDrive ? 'brightness-[1.1] contrast-[1.1]' : ''}`}>
      
      {/* HUD Bar - Mobile Optimized "Dynamic Island" */}
      <div className="absolute top-0 left-0 w-full z-[100] px-4 pt-safe pointer-events-none">
        <div className="flex justify-center mt-2">
          <div className="h-10 px-6 glass-obsidian rounded-full flex items-center justify-between gap-8 border border-emerald-500/20 shadow-2xl pointer-events-auto min-w-[280px] lg:min-w-[340px] transition-all duration-700 hover:scale-[1.02]">
            <div className="flex items-center gap-2.5">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
               <span className="text-[9px] font-orbitron font-black text-white tracking-[0.2em] uppercase">VOSUA <span className="text-emerald-500">Ω</span></span>
            </div>
            
            <div className="flex items-center gap-4 text-[7px] font-black text-emerald-800 uppercase tracking-widest font-mono">
               <span>{stats.latency}</span>
               <span className="opacity-40">|</span>
               <span>{stats.time}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-700 ${previewCode ? 'lg:mr-[40%]' : ''} pt-16 pb-20 lg:pb-0`}>
            {activeMode === 'chat' && <ChatInterface version="42.5" persona={activePersona} onPreviewCode={setPreviewCode} />}
            {activeMode === 'vision' && <ImageGenInterface />}
            {activeMode === 'voice' && <VoiceInterface hasKey={true} onKeyRequest={()=>{}} onArchitectCode={setPreviewCode} />}
            {activeMode === 'builder' && <WebForgeInterface hasKey={true} onKeyRequest={()=>{}} />}
        </div>

        {previewCode && (
          <ArtifactPreview code={previewCode} onClose={() => setPreviewCode(null)} />
        )}
      </main>

      {/* Navigation Dock - Mobile Bottom / Desktop Left */}
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
