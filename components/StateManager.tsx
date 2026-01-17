
import React, { useState, useEffect } from 'react';
import { AIMode, SystemSnapshot } from '../types';

interface StateManagerProps {
  onClose: () => void;
  onLoad: (snapshot: SystemSnapshot) => void;
  currentState: {
    activeMode: AIMode;
    isHyperDrive: boolean;
  };
}

const StateManager: React.FC<StateManagerProps> = ({ onClose, onLoad, currentState }) => {
  const [snapshots, setSnapshots] = useState<SystemSnapshot[]>([]);
  const [newSnapshotName, setNewSnapshotName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('vosua_snapshots');
    if (saved) {
      setSnapshots(JSON.parse(saved));
    }
  }, []);

  const saveSnapshots = (updated: SystemSnapshot[]) => {
    setSnapshots(updated);
    localStorage.setItem('vosua_snapshots', JSON.stringify(updated));
  };

  const handleCreate = () => {
    if (!newSnapshotName.trim()) return;
    const snapshot: SystemSnapshot = {
      id: Date.now().toString(),
      name: newSnapshotName,
      timestamp: Date.now(),
      activeMode: currentState.activeMode,
      isHyperDrive: currentState.isHyperDrive,
    };
    saveSnapshots([snapshot, ...snapshots]);
    setNewSnapshotName('');
  };

  const handleDelete = (id: string) => {
    saveSnapshots(snapshots.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-lg glass-card rounded-[2.5rem] border-white/10 p-8 shadow-[0_0_100px_#f001] relative overflow-hidden flex flex-col max-h-[80vh]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-transparent to-red-600 opacity-30" />
        
        <header className="flex justify-between items-center mb-8">
           <div>
              <h2 className="text-xl font-orbitron font-black tracking-tighter text-white">NEURAL SNAPSHOTS</h2>
              <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Memory Management v1.0</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </header>

        <div className="flex gap-2 mb-8">
           <input 
            type="text" 
            value={newSnapshotName}
            onChange={(e) => setNewSnapshotName(e.target.value)}
            placeholder="Snapshot Identity..."
            className="flex-1 bg-black/60 border border-white/5 rounded-xl px-4 py-3 text-[12px] text-white focus:ring-1 focus:ring-red-500/50 outline-none"
           />
           <button 
            onClick={handleCreate}
            className="px-6 py-3 bg-red-600 text-white font-black text-[10px] uppercase rounded-xl hover:bg-red-500 transition-all shadow-[0_0_20px_#f004]"
           >
             Save_State
           </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
           {snapshots.length === 0 ? (
             <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/5 rounded-3xl opacity-30">
                <p className="text-[10px] uppercase font-black tracking-widest">No Memories Found</p>
             </div>
           ) : (
             snapshots.map(s => (
               <div key={s.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-red-500/30 transition-all">
                  <div>
                     <p className="text-xs font-black text-white uppercase tracking-wider">{s.name}</p>
                     <p className="text-[7px] text-gray-600 font-mono mt-1 uppercase">
                       Mode: {s.activeMode} • Hyper: {s.isHyperDrive ? 'ON' : 'OFF'} • {new Date(s.timestamp).toLocaleDateString()}
                     </p>
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                      onClick={() => onLoad(s)}
                      className="px-4 py-2 bg-white/5 hover:bg-red-600 text-white text-[8px] font-black uppercase rounded-lg transition-all"
                     >
                        Recall
                     </button>
                     <button 
                      onClick={() => handleDelete(s.id)}
                      className="p-2 hover:bg-red-600/20 text-gray-700 hover:text-red-500 rounded-lg transition-all"
                     >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>

        <footer className="mt-8 pt-6 border-t border-white/5 flex justify-center">
           <p className="text-[7px] text-gray-700 uppercase font-black tracking-[0.3em]">Persistent_Storage_Active</p>
        </footer>
      </div>
    </div>
  );
};

export default StateManager;
