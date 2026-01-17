
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const PRESETS = [
  { id: 'photo', label: 'Photo', icon: '📸', mod: 'photorealistic, ultra detailed, 8k' },
  { id: 'anime', label: 'Anime', icon: '🌸', mod: 'anime, high quality, vibrant' },
  { id: '3d', label: '3D Render', icon: '🎨', mod: 'unreal engine 5, octane render, stylized' },
  { id: 'cyber', label: 'Cyber', icon: '🏙️', mod: 'cyberpunk, neon, detailed' }
];

const ImageGenInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [aspect, setAspect] = useState('1:1');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const finalPrompt = `${prompt}, ${activePreset.mod}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
        config: { imageConfig: { aspectRatio: aspect as any } }
      });
      const imgData = response.candidates[0].content.parts.find(p => p.inlineData)?.inlineData?.data;
      if (imgData) setResult(`data:image/png;base64,${imgData}`);
    } catch (e) { alert("Synthesis failed."); }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-black">
      <div className="flex-1 relative flex items-center justify-center p-4">
        {!result && !loading && (
          <div className="text-center opacity-20">
            <div className="w-20 h-20 border border-emerald-500/20 rounded-3xl mx-auto flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Standby for Vision</p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest animate-pulse">Materializing...</p>
          </div>
        )}

        {result && (
          <img src={result} className="max-w-full max-h-full rounded-3xl shadow-2xl animate-in zoom-in-95" alt="Synthesis" />
        )}
      </div>

      <div className="bg-[#050505] border-t border-emerald-500/5 p-4 space-y-4 pb-10">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {PRESETS.map(p => (
            <button key={p.id} onClick={() => setActivePreset(p)} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ios-button ${activePreset.id === p.id ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/5 text-white/30'}`}>
              {p.icon} {p.label}
            </button>
          ))}
          <div className="w-[1px] bg-white/5 mx-1" />
          {['1:1', '16:9', '9:16'].map(r => (
            <button key={r} onClick={() => setAspect(r)} className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ios-button ${aspect === r ? 'bg-emerald-600/10 border-emerald-500 text-emerald-500' : 'bg-white/5 border-white/5 text-white/30'}`}>
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 glass-mobile p-1.5 rounded-full border border-emerald-500/10">
          <input 
            value={prompt} 
            onChange={e => setPrompt(e.target.value)} 
            placeholder="صف الصورة التي تريدها..." 
            className="flex-1 bg-transparent border-none py-3 px-5 text-white text-sm outline-none font-arabic placeholder:text-white/10"
          />
          <button 
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="w-11 h-11 bg-emerald-600 rounded-full flex items-center justify-center ios-button shadow-lg shadow-emerald-900/20"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageGenInterface;
