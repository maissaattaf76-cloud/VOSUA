
import React from 'react';
import { AIMode, AIPersona } from '../types';

interface SidebarProps {
  activeMode: AIMode;
  onModeChange: (mode: AIMode) => void;
  activePersona: AIPersona;
  onPersonaChange: (p: AIPersona) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  isHyperDrive: boolean;
  setHyperDrive: (val: boolean) => void;
  onOpenStateManager: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeMode, 
  onModeChange, 
  onOpenStateManager
}) => {
  const menuItems = [
    { id: 'chat' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
    ), label: 'Chat' },
    { id: 'vision' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ), label: 'Vision' },
    { id: 'builder' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
    ), label: 'Forge' },
    { id: 'voice' as AIMode, icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
    ), label: 'Sonic' },
  ];

  return (
    <nav className="floating-dock glass-mobile px-4 py-2 flex items-center justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-emerald-500/10">
      <div className="flex items-center justify-around flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onModeChange(item.id)}
            className={`w-12 h-12 flex flex-col items-center justify-center transition-all duration-300 ios-button relative rounded-2xl ${
              activeMode === item.id 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-white/20 hover:text-white/40'
            }`}
          >
            {item.icon}
            <span className={`text-[7px] font-black uppercase tracking-widest mt-1 ${activeMode === item.id ? 'opacity-100' : 'opacity-0'}`}>
              {item.label}
            </span>
            {activeMode === item.id && (
              <div className="absolute -top-1 w-1 h-1 bg-emerald-500 rounded-full emerald-glow" />
            )}
          </button>
        ))}
      </div>
      
      <div className="w-[1px] h-8 bg-white/5 mx-2" />
      
      <button 
        onClick={onOpenStateManager}
        className="w-12 h-12 flex items-center justify-center text-white/20 hover:text-emerald-400 transition-all ios-button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
      </button>
    </nav>
  );
};

export default Sidebar;
