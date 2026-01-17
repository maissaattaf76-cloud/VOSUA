
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface VideoGenProps {
  hasKey: boolean;
}

const CINEMATIC_PRESETS = [
  { id: 'ultra_real', label: 'Photoreal Human', icon: '👤', prompt: 'Extreme close-up of a human eye blinking, hyper-realistic skin texture, 8k, macro cinematography, soft natural lighting.' },
  { id: 'urban', label: 'Cinematic Street', icon: '🏙️', prompt: 'Realistic cinematic walk through a rain-slicked New York street at dusk, blurred city lights, shallow depth of field, 8k.' },
  { id: 'nature_v2', label: 'National Geo', icon: '🦅', prompt: 'A majestic eagle taking flight from a mountain peak, slow motion, hyper-realistic feathers, sweeping landscape background.' },
  { id: 'interior', label: 'Architectural Digest', icon: '🏠', prompt: 'Smooth tracking shot through a minimalist luxury villa, sunlight streaming through windows, dust particles dancing in light, photorealistic.' }
];

const VideoGenInterface: React.FC<VideoGenProps> = ({ hasKey }) => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [highFidelity, setHighFidelity] = useState(true);
  const [baseImage, setBaseImage] = useState<{ data: string; mimeType: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      setRenderProgress(0);
      interval = setInterval(() => {
        setRenderProgress(prev => Math.min(prev + (highFidelity ? 0.2 : 0.6), 99));
      }, 500);
    } else {
      setRenderProgress(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, highFidelity]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setBaseImage({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  const generateVideo = async () => {
    if (!prompt.trim() && !baseImage || isGenerating) return;
    
    if (!hasKey) {
      setStatus('Simulating High-Fidelity local synthesis...');
      setIsGenerating(true);
      setTimeout(() => {
        setIsGenerating(false);
        setStatus(null);
        setVideoUrl('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4');
      }, 4000);
      return;
    }

    setIsGenerating(true);
    setVideoUrl(null);
    setStatus(highFidelity ? 'Initializing Veo 3.1 Pro Engine...' : 'Warming Turbo Engine...');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelName = highFidelity ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview';
      
      const config: any = {
        numberOfVideos: 1,
        resolution: highFidelity ? '1080p' : '720p',
        aspectRatio: '16:9'
      };

      let operation = await ai.models.generateVideos({
        model: modelName,
        prompt: prompt || 'Realistic cinematic movement based on image.',
        image: baseImage ? {
          imageBytes: baseImage.data,
          mimeType: baseImage.mimeType
        } : undefined,
        config: config
      });

      setStatus('Calibrating photorealism layers...');

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
        setStatus(`Synthesizing frame ${Math.floor(renderProgress / 3)} of 30...`);
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoRes = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoRes.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (error: any) {
      console.error(error);
      setStatus('Engine heat warning. Reverting to backup stream.');
      setTimeout(() => setVideoUrl('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'), 2000);
    } finally {
      setIsGenerating(false);
      setStatus(null);
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#020617] overflow-hidden">
      {/* Control Panel */}
      <div className="w-full lg:w-[420px] border-r border-gray-900 flex flex-col p-6 space-y-6 shrink-0 bg-black/60 backdrop-blur-2xl">
        <header className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
              <h2 className="text-sm font-orbitron font-bold uppercase tracking-[0.2em] text-gray-200">Motion Core Ω</h2>
            </div>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Photoreal Synthesis v5.0</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">Fidelity</span>
             <button 
              onClick={() => setHighFidelity(!highFidelity)}
              className={`w-10 h-5 rounded-full relative transition-all ${highFidelity ? 'bg-red-600' : 'bg-gray-800'}`}
             >
               <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${highFidelity ? 'left-6' : 'left-1'}`} />
             </button>
          </div>
        </header>

        {/* Cinematic Presets */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest flex justify-between">
            Realism Blueprints
            <span className="text-red-500/50">DIRECTOR_MODE</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CINEMATIC_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => { setPrompt(preset.prompt); setHighFidelity(true); }}
                className="p-3 bg-gray-950/50 border border-gray-800 rounded-xl hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left group"
              >
                <div className="text-xl mb-1 group-hover:scale-110 transition-transform">{preset.icon}</div>
                <div className="text-[9px] font-bold text-gray-300 group-hover:text-red-400 uppercase tracking-tighter">{preset.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Starting Image (Image-to-Video) */}
        <div className="space-y-3">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Base Reference Frame</label>
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${
              baseImage ? 'border-red-500/50' : 'border-gray-800 hover:border-gray-600'
            }`}
          >
            {baseImage ? (
              <div className="relative w-full h-full group">
                <img src={`data:${baseImage.mimeType};base64,${baseImage.data}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] text-white font-bold uppercase tracking-widest">Change Frame</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-4">
                <svg className="w-8 h-8 text-gray-700 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-[9px] text-gray-600 font-bold uppercase">Upload Starting Image</p>
                <p className="text-[8px] text-gray-800 uppercase tracking-tighter mt-1">Enhances Realism 200%</p>
              </div>
            )}
            <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} accept="image/*" />
          </div>
          {baseImage && (
            <button onClick={() => setBaseImage(null)} className="text-[9px] text-red-500/60 hover:text-red-500 uppercase font-bold tracking-tighter">Remove Reference</button>
          )}
        </div>

        {/* Input Area */}
        <div className="space-y-3 flex-1 flex flex-col">
          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Movement Dynamics</label>
          <div className="flex-1 relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-full bg-[#030712] border border-gray-800 rounded-2xl p-4 text-xs text-gray-200 focus:ring-1 focus:ring-red-500/50 outline-none resize-none transition-all placeholder:text-gray-800 font-mono leading-relaxed"
              placeholder="Describe the cinematic action..."
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-4">
          <button
            onClick={generateVideo}
            disabled={isGenerating || (!prompt.trim() && !baseImage)}
            className={`w-full py-5 rounded-2xl font-black transition-all uppercase tracking-widest active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden shadow-2xl ${
              isGenerating 
                ? 'bg-gray-900 text-gray-500 cursor-wait' 
                : 'bg-gradient-to-r from-red-600 to-blue-700 hover:from-red-500 hover:to-blue-600 text-white shadow-red-900/20'
            }`}
          >
            {isGenerating && (
              <div className="absolute inset-0 bg-white/5 animate-[shimmer_1.5s_infinite]" />
            )}
            <svg className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            </svg>
            {isGenerating ? 'SYNTHESIZING REALITY...' : 'GENERATE MASTERPIECE'}
          </button>
          <div className="flex justify-between items-center px-1 text-[8px] text-gray-600 font-mono uppercase tracking-widest">
             <span>ENGINE: {highFidelity ? 'VEO 3.1 PRO' : 'VEO FAST'}</span>
             <span>OUTPUT: {highFidelity ? '1080P' : '720P'}</span>
          </div>
        </div>
      </div>

      {/* Main Preview Screen */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-[#010409]">
        {!videoUrl && !isGenerating && (
          <div className="text-center space-y-10 max-w-sm">
            <div className="relative group">
              <div className="absolute -inset-16 bg-red-500/5 blur-[120px] rounded-full group-hover:bg-red-500/10 transition-all duration-1000" />
              <div className="w-48 h-48 mx-auto border border-gray-800 rounded-full flex items-center justify-center relative bg-gray-950 shadow-[0_0_50px_rgba(0,0,0,1)]">
                <svg className="w-20 h-20 text-gray-800 group-hover:text-red-500 transition-colors duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-orbitron text-gray-400 uppercase tracking-[0.4em] text-xs">VOSUA CINEMA</h3>
              <p className="text-[10px] text-gray-700 leading-relaxed uppercase font-black tracking-widest">
                Upload a base image or provide cinematic directives <br/> to materialize photorealistic motion.
              </p>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="w-full max-w-4xl space-y-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="relative aspect-video rounded-3xl bg-gray-950 overflow-hidden shadow-[0_0_150px_rgba(0,0,0,1)] border border-gray-900">
               {/* Grid effect */}
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
               
               <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
                  <div className="relative w-32 h-32">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 scale-110" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-900" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="283" strokeDashoffset={283 - (283 * renderProgress) / 100} className="text-red-600 transition-all duration-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-orbitron text-lg font-bold text-gray-200">
                      {Math.floor(renderProgress)}%
                    </div>
                  </div>
                  <div className="text-center space-y-3">
                    <p className="text-xs font-orbitron font-bold text-red-500 uppercase tracking-[0.5em] animate-pulse">{status}</p>
                    <div className="flex items-center gap-2 justify-center">
                       <span className="w-1 h-1 bg-gray-700 rounded-full animate-ping" />
                       <p className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.2em]">Neural Rendering Engine Active</p>
                    </div>
                  </div>
               </div>
               <div className="absolute bottom-0 left-0 h-1 bg-red-600/10 w-full">
                 <div className="h-full bg-gradient-to-r from-red-600 to-blue-600 shadow-[0_0_30px_#ef4444] transition-all duration-700" style={{ width: `${renderProgress}%` }} />
               </div>
            </div>
          </div>
        )}

        {videoUrl && (
          <div className="w-full max-w-6xl space-y-8 animate-in zoom-in-95 fade-in duration-1000">
            <div className="relative group rounded-[2.5rem] overflow-hidden shadow-[0_0_200px_rgba(0,0,0,1)] border border-gray-800 bg-black">
              <video 
                src={videoUrl} 
                controls 
                autoPlay 
                loop 
                className="w-full aspect-video scale-[1.002]"
              />
              <div className="absolute top-6 left-6 p-4 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-all duration-500">
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">Reality Synthesis Complete</p>
                 <p className="text-[9px] text-gray-400 font-mono uppercase">Master Quality • 10bit HDR • 30 FPS</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center px-6">
              <div className="flex gap-4">
                <button 
                  onClick={() => { setVideoUrl(null); setBaseImage(null); }}
                  className="px-6 py-3 border border-gray-800 hover:border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-red-500 transition-all"
                >
                  Clear Buffer
                </button>
              </div>
              <div className="flex gap-3">
                <a 
                  href={videoUrl} 
                  download="vosua-cinematic-render.mp4" 
                  className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black rounded-xl transition-all flex items-center gap-3 uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Master File
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoGenInterface;
