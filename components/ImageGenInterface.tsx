
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

const RATIOS = ["1:1", "4:3", "3:4", "16:9", "9:16"];

const STYLE_PRESETS = [
  { id: 'real', label: 'واقعي', icon: '📸', modifier: 'photorealistic, ultra-detailed, 8k raw photo, sharp focus, cinematic' },
  { id: 'none', label: 'تلقائي', icon: '✨', modifier: '' },
  { id: 'master', label: 'لوحة فنية', icon: '🎨', modifier: 'oil painting, digital art, masterpiece' },
  { id: 'neon', label: 'نيون', icon: '🌃', modifier: 'cyberpunk style, glowing neon accents, vibrant colors' }
];

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

const ImageGenInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState(RATIOS[0]);
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0]);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [history, isLoading]);

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setErrorInfo(null);
    const currentPrompt = prompt;
    setPrompt('');

    try {
      // استخدام المفتاح الأحدث من البيئة
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let finalPrompt = currentPrompt + (stylePreset.modifier ? `, ${stylePreset.modifier}` : '');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
        config: { 
          imageConfig: { 
            aspectRatio: ratio as any,
          }
        }
      });

      let imageUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (imageUrl) {
        setHistory(prev => [...prev, { id: Date.now().toString(), url: imageUrl, prompt: currentPrompt }]);
      } else {
        throw new Error("No image data returned from API");
      }
    } catch (error: any) {
      console.error("Image Gen Error:", error);
      const errorMsg = error.message || JSON.stringify(error);
      
      // Fix: changed setErrorStatus to setErrorInfo as the former was not defined in the state
      if (errorMsg.includes("403") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("permission")) {
        setErrorInfo("خطأ في الصلاحيات: مطلوب مفتاح API صالح لتوليد الصور");
        if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
           await (window as any).aistudio.openSelectKey();
        }
      } else {
        setErrorInfo("حدث خطأ تقني في الاتصال بمصفوفة الصور.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent font-arabic relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto no-scrollbar px-6 lg:px-32 pt-16 pb-64 space-y-12 relative z-10">
        
        {errorInfo && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center text-red-400 text-xs animate-in fade-in slide-in-from-top-2">
            {errorInfo}
          </div>
        )}

        {history.length === 0 && !isLoading && (
          <div className="h-full flex flex-col items-center justify-center opacity-40 animate-in fade-in zoom-in-95 duration-1000">
            <div className="w-32 h-32 rounded-[3.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-10 shadow-3xl">
               <span className="font-orbitron font-black text-5xl text-emerald-500">Im</span>
            </div>
            <h1 className="text-2xl font-orbitron font-black text-white mb-3 tracking-tighter">VISUAL SYNTHESIS LAB</h1>
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.5em]">Quantum Image Engine Active</p>
          </div>
        )}

        {history.map((img) => (
          <div key={img.id} className="flex flex-col gap-5 animate-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto w-full group">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-emerald" />
                  <span className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] truncate max-w-[150px]">{img.prompt}</span>
               </div>
               <button onClick={() => {
                 const link = document.createElement('a');
                 link.href = img.url;
                 link.download = `vosua-artifact-${Date.now()}.png`;
                 link.click();
               }} className="text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-full border border-white/10">Download PNG</button>
            </div>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] border border-white/10 transition-transform duration-700 hover:scale-[1.01]">
              <img src={img.url} alt={img.prompt} className="w-full" />
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-center gap-8 animate-in fade-in duration-500">
             <div className="w-full max-w-xl aspect-square glass-premium rounded-[3rem] border border-emerald-500/20 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="w-40 h-40 border-[1px] border-emerald-500/10 rounded-full animate-ping" />
                </div>
                <div className="w-12 h-12 border-2 border-emerald-500/5 border-t-emerald-500 rounded-full animate-spin mb-6" />
                <span className="text-[12px] font-orbitron font-black text-emerald-500 uppercase tracking-[0.6em] animate-pulse">Encoding Visual Matrix</span>
             </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-28 left-0 w-full px-4 z-20">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/5 shadow-lg">
              {STYLE_PRESETS.map((s) => (
                <button key={s.id} onClick={() => setStylePreset(s)} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tight transition-all ${stylePreset.id === s.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}>
                  {s.label}
                </button>
              ))}
            </div>
            <div className="flex bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/5 shadow-lg">
              {RATIOS.map((r) => (
                <button key={r} onClick={() => setRatio(r)} className={`px-3 py-1.5 rounded-full text-[9px] font-black transition-all ${ratio === r ? 'bg-emerald-600 text-white shadow-lg' : 'text-white/30 hover:text-white/50'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-premium p-2.5 rounded-[2.5rem] border border-emerald-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex items-end gap-2">
            <textarea
              rows={1}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="صف المشهد الذي تريده..."
              className="flex-1 bg-transparent border-none py-3.5 px-4 text-emerald-50 focus:ring-0 outline-none text-[17px] font-medium placeholder:text-white/10 max-h-32 resize-none no-scrollbar"
              dir="auto"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  generateImage();
                }
              }}
            />
            <button 
              onClick={generateImage}
              disabled={!prompt.trim() || isLoading}
              className={`w-14 h-14 flex items-center justify-center rounded-full transition-all shrink-0 shadow-emerald ${
                prompt.trim() ? 'bg-emerald-600 text-white scale-105 active:scale-95' : 'bg-white/5 text-white/10'
              }`}
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageGenInterface;
