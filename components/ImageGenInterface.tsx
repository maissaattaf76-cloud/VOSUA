
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

const STYLE_PRESETS = [
  { id: 'none', label: 'None', icon: '🎨', modifier: '' },
  { id: 'photo', label: 'Photoreal', icon: '📸', modifier: 'photorealistic, highly detailed, 8k resolution, cinematic lighting, professional photography' },
  { id: 'anime', label: 'Anime', icon: '🌸', modifier: 'anime style, vibrant colors, expressive eyes, high quality illustration, cel shaded' },
  { id: 'cartoon', label: 'Cartoon', icon: '✏️', modifier: '3D cartoon style, stylized characters, bright colors, clean lines, playful' },
  { id: 'oil', label: 'Oil Painting', icon: '🖼️', modifier: 'classical oil painting, visible brushstrokes, rich textures, artistic masterpiece, museum quality' },
  { id: 'cyber', label: 'Cyberpunk', icon: '🏙️', modifier: 'cyberpunk aesthetic, neon lights, high tech low life, futuristic, detailed metallic surfaces' }
];

const ImageGenInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [stylePreset, setStylePreset] = useState(STYLE_PRESETS[0]);
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct final prompt with style and exclusion instructions
      let finalPrompt = prompt;
      if (stylePreset.modifier) {
        finalPrompt += `, ${stylePreset.modifier}`;
      }
      if (negativePrompt.trim()) {
        finalPrompt += ` | EXCLUDE the following from the image: ${negativePrompt}`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: finalPrompt }] },
        config: {
          imageConfig: { aspectRatio: aspectRatio as any }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          setResult(`data:image/png;base64,${part.inlineData.data}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert('Generation failed. The neural pathways were blocked. Please try refining your request.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAsPng = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `vosua-synthesis-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#010204]">
      {/* Control Sidebar */}
      <div className="w-full lg:w-96 border-r border-gray-900/50 p-6 space-y-6 flex flex-col bg-black/40 backdrop-blur-xl overflow-y-auto custom-scrollbar">
        <div>
          <h2 className="text-xl font-orbitron font-black tracking-tighter text-blue-400">IMAGE SYNTHESIS</h2>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-1">Latent Diffusion v2.5</p>
        </div>
        
        {/* Main Prompt */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
            Visual Directive
            <span className="text-blue-500/50">INPUT_PROMPT</span>
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-28 bg-[#030712] border border-gray-800 rounded-2xl p-4 text-sm text-gray-200 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all placeholder:text-gray-800"
            placeholder="Describe your vision..."
          />
        </div>

        {/* Negative Prompt */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
            Exclusion Parameters
            <span className="text-red-500/50">NEGATIVE_PROMPT</span>
          </label>
          <input
            type="text"
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="w-full bg-[#030712] border border-gray-800 rounded-xl px-4 py-3 text-xs text-gray-400 focus:ring-1 focus:ring-red-500/30 outline-none transition-all placeholder:text-gray-800"
            placeholder="Things to avoid (e.g. blurry, low quality)..."
          />
        </div>

        {/* Style Presets */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Aesthetic Preset</label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_PRESETS.map((style) => (
              <button
                key={style.id}
                onClick={() => setStylePreset(style)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all text-left ${
                  stylePreset.id === style.id 
                    ? 'bg-blue-600/10 border-blue-500/50 text-white' 
                    : 'bg-gray-900/50 border-gray-800 text-gray-500 hover:border-gray-700'
                }`}
              >
                <span className="text-lg">{style.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-tight">{style.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Dimension Link</label>
          <div className="grid grid-cols-3 gap-2">
            {['1:1', '16:9', '9:16'].map(ratio => (
              <button
                key={ratio}
                onClick={() => setAspectRatio(ratio)}
                className={`py-2 text-[10px] font-bold rounded-xl border transition-all ${
                  aspectRatio === ratio 
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                    : 'bg-gray-900/50 border-gray-800 text-gray-600 hover:border-gray-700'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={generateImage}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-20 text-white font-black rounded-2xl shadow-xl shadow-blue-900/20 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Iniate Synthesis
              </>
            )}
          </button>

          {result && (
            <button
              onClick={exportAsPng}
              className="w-full py-4 bg-white/5 border border-white/10 text-white font-black rounded-2xl transition-all uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-white/10 ios-button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export PNG
            </button>
          )}
        </div>

        <div className="mt-auto p-4 glass-card rounded-2xl border-white/5">
          <p className="text-[9px] text-blue-400 uppercase font-black mb-1 flex items-center gap-2">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
            Neural Tip
          </p>
          <p className="text-[10px] text-gray-600 leading-relaxed font-medium">VOSUA Image Core understands complex spatial arrangements and artistic textures.</p>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-10 flex flex-col items-center justify-center bg-gray-950/20 relative overflow-hidden">
        {/* Background neural pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px]" />

        {!result && !isLoading && (
          <div className="text-center space-y-8 animate-in fade-in duration-1000">
            <div className="relative group">
               <div className="absolute -inset-10 bg-blue-500/5 blur-[100px] rounded-full group-hover:bg-blue-500/10 transition-all duration-1000" />
               <div className="w-40 h-40 mx-auto border border-gray-900 rounded-[2.5rem] flex items-center justify-center relative bg-black/60 shadow-2xl">
                 <svg className="w-16 h-16 text-gray-800 group-hover:text-blue-500/40 transition-colors duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-orbitron tracking-[0.5em] uppercase text-xs text-gray-600 font-black">Visualizer Standby</h3>
              <p className="text-[9px] text-gray-800 uppercase tracking-widest font-bold">Inject visual directive to materialize artifact</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center gap-10 animate-in zoom-in-95 duration-500">
            <div className="relative w-80 h-80">
               <div className="absolute inset-0 bg-gray-900/50 rounded-[3rem] animate-pulse overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
               </div>
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
               </div>
            </div>
            <div className="space-y-3 text-center">
              <p className="text-[11px] font-orbitron font-black text-blue-500 uppercase tracking-[0.4em] animate-pulse">Computing Latent Space</p>
              <div className="flex gap-1 justify-center">
                 {[1,2,3,4].map(i => (
                   <div key={i} className={`w-1 h-3 rounded-full bg-blue-500/20 animate-bounce`} style={{ animationDelay: `${i*0.1}s` }} />
                 ))}
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="relative group max-w-full max-h-full animate-in zoom-in-95 fade-in duration-700">
            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <img 
              src={result} 
              alt="Generated" 
              className="max-h-[75vh] rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 object-contain transition-transform duration-700 group-hover:scale-[1.005]"
            />
            
            <div className="absolute top-6 right-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
              <button 
                onClick={() => window.open(result, '_blank')}
                className="p-4 bg-black/80 backdrop-blur-md rounded-2xl hover:bg-white hover:text-black transition-all shadow-2xl border border-white/10"
                title="Open Master File"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </button>
              <button 
                onClick={exportAsPng}
                className="p-4 bg-blue-600 rounded-2xl hover:bg-blue-500 transition-all shadow-2xl text-white border border-white/10"
                title="Extract Artifact"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
            </div>

            <div className="absolute bottom-6 left-6 p-4 glass-card rounded-2xl border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Master Output Established</p>
               <p className="text-[9px] text-gray-500 font-mono">STYLE: {stylePreset.label.toUpperCase()} • DIM: {aspectRatio}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenInterface;
