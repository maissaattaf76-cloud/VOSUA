
import React from 'react';

interface ArtifactPreviewProps {
  code: string;
  onClose: () => void;
}

const ArtifactPreview: React.FC<ArtifactPreviewProps> = ({ code, onClose }) => {
  return (
    <div className="fixed inset-y-4 right-4 w-full lg:w-[45%] glass-ios-heavy ios-squircle z-[100] flex flex-col shadow-2xl animate-in slide-in-from-right-full duration-700 ease-[cubic-bezier(0.2,1,0.2,1)]">
      {/* iOS Handlebar */}
      <div className="h-1 bg-white/20 w-12 rounded-full mx-auto mt-3 shrink-0" />
      
      <header className="h-16 shrink-0 flex items-center justify-between px-8 mt-2">
        <h3 className="text-[12px] font-black uppercase tracking-widest text-gray-400">Live Artifact</h3>
        <div className="flex items-center gap-3">
          <button onClick={() => navigator.clipboard.writeText(code)} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 ios-button">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </button>
          <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-red-500 rounded-xl transition-all text-gray-400 hover:text-white ios-button">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </header>
      
      <div className="flex-1 m-4 ios-squircle overflow-hidden bg-white shadow-inner">
        <iframe
          srcDoc={code}
          title="Artifact"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-forms allow-modals allow-popups"
        />
      </div>

      <footer className="h-10 px-8 flex justify-between items-center text-[10px] text-gray-500 font-mono">
        <span>STATUS: ACTIVE_RENDER</span>
        <span className="text-blue-500 font-bold">VOSUA Vision v26</span>
      </footer>
    </div>
  );
};

export default ArtifactPreview;
