
import React, { useState, useEffect } from 'react';
import { AIMode } from '../types';

interface SidebarProps {
  activeMode: AIMode;
  onModeChange: (mode: AIMode) => void;
  onOpenStateManager: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeMode, 
  onModeChange, 
  onOpenStateManager
}) => {
  const [iq, setIq] = useState(145);

  useEffect(() => {
    const interval = setInterval(() => {
      setIq(prev => prev + (Math.random() > 0.5 ? 1 : 0));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: 'chat' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    ), label: 'دردشة' },
    { id: 'vision' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ), label: 'رؤية' },
    { id: 'video' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
    ), label: 'سينما' },
    { id: 'builder' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    ), label: 'برمجة' },
    { id: 'voice' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
    ), label: 'صوت' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[1000] px-3 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto mb-4 pointer-events-auto">
        <div className="glass-premium rounded-[2.5rem] p-2 flex items-center justify-between shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-emerald-500/20 relative overflow-hidden">
          
          {/* Evolution Indicator Background */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent pointer-events-none" />

          <div className="flex items-center justify-around flex-1 relative z-10">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onModeChange(item.id);
                  if(window.navigator.vibrate) window.navigator.vibrate(8);
                }}
                className={`w-12 h-12 flex flex-col items-center justify-center transition-all duration-300 ios-active relative ${
                  activeMode === item.id 
                    ? 'text-emerald-400 scale-110' 
                    : 'text-white/20'
                }`}
              >
                {item.icon}
                <span className={`text-[7px] font-black uppercase mt-0.5 tracking-tighter ${activeMode === item.id ? 'opacity-100' : 'opacity-0'}`}>
                  {item.label}
                </span>
                {activeMode === item.id && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]" />
                )}
              </button>
            ))}
          </div>
          
          <div className="w-[1px] h-8 bg-white/10 mx-2" />
          
          <button 
            onClick={onOpenStateManager}
            className="w-12 h-12 flex flex-col items-center justify-center text-white/10 hover:text-emerald-400 transition-all ios-active"
          >
            <span className="text-[8px] font-black mb-1 font-orbitron text-emerald-500/50">{iq}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
