
import React from 'react';
import { Artifact } from '../types';

interface ArtifactPreviewProps {
  artifact: Artifact;
  onClose: () => void;
}

const ArtifactPreview: React.FC<ArtifactPreviewProps> = ({ artifact, onClose }) => {
  return (
    <>
      {/* Dimmer for mobile */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[1000] lg:hidden animate-in fade-in duration-500"
        onClick={onClose}
      />

      <div className={`
        fixed z-[1001] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
        /* Mobile */
        bottom-0 left-0 right-0 w-full h-[85vh] rounded-t-[2.5rem] border-t border-emerald-500/20 shadow-2xl animate-in slide-in-from-bottom-full
        /* Desktop */
        lg:top-4 lg:right-4 lg:bottom-4 lg:w-[360px] lg:h-auto lg:rounded-[2.5rem] lg:border lg:animate-in lg:slide-in-from-right-full
        glass-premium flex flex-col overflow-hidden
      `}>
        
        <div className="h-1 bg-emerald-500/10 w-10 rounded-full mx-auto mt-3 mb-1 lg:hidden" />
        
        <header className="h-16 shrink-0 flex items-center justify-between px-8 bg-white/[0.01]">
          <div className="flex flex-col">
            <h3 className="text-[10px] font-orbitron font-black uppercase tracking-[0.2em] text-emerald-500">Sync</h3>
            <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">
              {artifact.type === 'image' ? 'Image' : 'Code'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                if (artifact.type === 'image') {
                  const link = document.createElement('a');
                  link.href = artifact.content;
                  link.download = `vosua-synthesis.png`;
                  link.click();
                } else {
                  navigator.clipboard.writeText(artifact.content);
                }
              }} 
              className="p-2.5 bg-white/5 hover:bg-emerald-600/20 text-emerald-500 rounded-xl transition-all ios-active border border-white/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {artifact.type === 'image' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2" />
                )}
              </svg>
            </button>
            <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/20 hover:text-red-500 rounded-xl transition-all border border-white/5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </header>
        
        <div className="flex-1 p-4 lg:p-5 overflow-hidden flex flex-col">
          <div className="flex-1 rounded-[1.8rem] overflow-hidden bg-black/40 border border-white/5 shadow-inner flex items-center justify-center relative">
            {artifact.type === 'code' ? (
              <iframe
                srcDoc={artifact.content}
                className="w-full h-full border-none bg-white rounded-2xl"
                sandbox="allow-scripts allow-forms allow-modals allow-popups"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                 <img 
                    src={artifact.content} 
                    alt="Synthesis" 
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-500" 
                 />
              </div>
            )}
          </div>
        </div>

        <footer className="h-10 flex justify-center items-center">
           <span className="text-[7px] text-white/10 font-black uppercase tracking-[0.4em]">VOSUA_Ω_SYNC</span>
        </footer>
      </div>
    </>
  );
};

export default ArtifactPreview;
