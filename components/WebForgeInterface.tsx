
import { GoogleGenAI } from "@google/genai";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-markup.js';
import 'prismjs/components/prism-css.js';
import 'prismjs/components/prism-javascript.js';

interface WebForgeInterfaceProps {
  hasKey: boolean;
  onKeyRequest: () => void;
}

const SYMBOL_TOOLBAR = ['<', '>', '/', '{', '}', '(', ')', '=', '"', ';', '.', ':'];

const TEMPLATES = [
  {
    id: 'blog',
    label: 'Personal Blog',
    icon: '✍️',
    prompt: 'A minimalist personal blog with a clean typographic focus. Include a hero section with an avatar, a grid of recent posts with cards, and a newsletter subscription footer. Use Obsidian and Emerald color palette.'
  },
  {
    id: 'store',
    label: 'Online Store',
    icon: '🛍️',
    prompt: 'A high-end e-commerce storefront for luxury goods. Feature a transparent glassmorphic navigation bar, a multi-product grid with hover effects, a shopping cart drawer, and professional product detail sections.'
  },
  {
    id: 'landing',
    label: 'Company Landing',
    icon: '🏢',
    prompt: 'A corporate landing page for a tech startup. Include a high-impact hero area with a geometric background, a features section with icons, social proof logos, a contact form, and a sleek footer.'
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: '🎨',
    prompt: 'A visionary designer portfolio. Use a dark aesthetic with neon Emerald accents. Feature an interactive project gallery, a timeline of experience, and a custom cursor animation with a contact CTA.'
  }
];

const WebForgeInterface: React.FC<WebForgeInterfaceProps> = ({ hasKey, onKeyRequest }) => {
  const [directive, setDirective] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [manifestedCode, setManifestedCode] = useState<string>('');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');
  const [mobileTab, setMobileTab] = useState<'architect' | 'view'>('architect');
  const [highlightedHTML, setHighlightedHTML] = useState('');
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const performHighlight = useCallback((code: string) => {
    if (!code) return;
    const html = Prism.highlight(code, Prism.languages.markup, 'markup');
    setHighlightedHTML(html + '\n');
  }, []);

  useEffect(() => {
    if (manifestedCode) performHighlight(manifestedCode);
  }, [manifestedCode, performHighlight]);

  const insertSymbol = (s: string) => {
    if (!editorRef.current) return;
    const start = editorRef.current.selectionStart;
    const end = editorRef.current.selectionEnd;
    const text = manifestedCode;
    const newText = text.substring(0, start) + s + text.substring(end);
    setManifestedCode(newText);
    setTimeout(() => {
      editorRef.current?.setSelectionRange(start + s.length, start + s.length);
      editorRef.current?.focus();
    }, 0);
  };

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setDirective(template.prompt);
    setActiveTemplate(template.id);
  };

  const handleForge = async () => {
    if (isGenerating || !directive.trim()) return;
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a responsive high-end website based on this blueprint: ${directive}. 
        Use Tailwind CSS via CDN. Ensure ultra-modern aesthetics. 
        Output ONLY the raw HTML/JS code in a single block.`,
        config: { systemInstruction: "Output HTML/Tailwind raw code only. No markdown formatting, just the code itself." }
      });
      
      // Clean up response if model includes markdown wrappers
      let code = response.text;
      const markdownMatch = code.match(/```(?:html|xml|typescript|javascript|tsx|jsx)?\n([\s\S]*?)```/);
      if (markdownMatch) code = markdownMatch[1];
      
      if (code) { 
        setManifestedCode(code);
        setMobileTab('view');
        setViewMode('preview');
      }
    } catch (e) { 
      console.error(e); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden font-arabic">
      
      {/* Mobile-Centric Tab Navigator */}
      <div className="lg:hidden flex p-4 gap-2 bg-black border-b border-white/5">
        <button onClick={() => setMobileTab('architect')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${mobileTab === 'architect' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-white/20'}`}>Architect</button>
        <button onClick={() => setMobileTab('view')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${mobileTab === 'view' ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'text-white/20'}`}>Manifest</button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Input Panel */}
        <div className={`w-full lg:w-[400px] flex flex-col p-6 space-y-6 overflow-y-auto no-scrollbar ${mobileTab === 'architect' ? 'flex' : 'hidden lg:flex'}`}>
           <div className="space-y-1">
             <h2 className="text-2xl font-orbitron font-black text-white">FORGE<span className="text-emerald-500"> Ω</span></h2>
             <p className="text-[8px] text-emerald-900 font-bold uppercase tracking-[0.4em]">Synthesis Blueprints</p>
           </div>

           {/* Template Grid */}
           <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t)}
                  className={`p-3 rounded-2xl border transition-all text-left ios-button ${
                    activeTemplate === t.id 
                      ? 'bg-emerald-500/10 border-emerald-500/40' 
                      : 'bg-[#050505] border-white/5 hover:border-emerald-500/20'
                  }`}
                >
                  <span className="text-xl mb-1 block">{t.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${activeTemplate === t.id ? 'text-emerald-400' : 'text-white/40'}`}>
                    {t.label}
                  </span>
                </button>
              ))}
           </div>
           
           <div className="flex-1 flex flex-col space-y-3">
             <label className="text-[9px] font-black text-emerald-800 uppercase tracking-widest">Architectural Directive</label>
             <textarea 
              value={directive} 
              onChange={(e) => {
                setDirective(e.target.value);
                setActiveTemplate(null);
              }}
              placeholder="وصف الموقع الذي تريده..."
              className="flex-1 bg-[#050505] border border-white/5 rounded-3xl p-6 text-[14px] leading-relaxed text-white focus:border-emerald-500/30 outline-none resize-none placeholder:text-white/5"
             />
           </div>

           <button 
            onClick={handleForge} 
            disabled={isGenerating || !directive.trim()}
            className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-20 text-white font-black rounded-3xl ios-button uppercase tracking-widest text-[11px] shadow-2xl"
           >
             {isGenerating ? 'جاري البناء...' : 'بناء الموقع الآن'}
           </button>
        </div>

        {/* View/Edit Panel */}
        <div className={`flex-1 flex flex-col overflow-hidden border-l border-white/5 bg-black ${mobileTab === 'view' ? 'flex' : 'hidden lg:flex'}`}>
           <div className="h-14 flex items-center justify-between px-6 bg-[#050505] border-b border-white/5">
              <div className="flex bg-black rounded-full p-1 border border-white/5">
                 <button onClick={() => setViewMode('preview')} className={`px-5 py-1.5 text-[9px] font-black uppercase rounded-full transition-all ${viewMode === 'preview' ? 'bg-emerald-600 shadow-lg' : 'text-white/20'}`}>Preview</button>
                 <button onClick={() => setViewMode('code')} className={`px-5 py-1.5 text-[9px] font-black uppercase rounded-full transition-all ${viewMode === 'code' ? 'bg-emerald-600 shadow-lg' : 'text-white/20'}`}>Code</button>
              </div>
              
              {manifestedCode && (
                <button 
                  onClick={() => navigator.clipboard.writeText(manifestedCode)}
                  className="p-2 text-white/20 hover:text-emerald-500 transition-colors"
                  title="Copy Code"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </button>
              )}
           </div>
           
           <div className="flex-1 relative overflow-hidden bg-black">
              {isGenerating && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
                  <div className="w-12 h-12 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <p className="text-[10px] font-orbitron font-black text-emerald-500 uppercase tracking-[0.5em] animate-pulse">Synthesis Active</p>
                </div>
              )}

              {manifestedCode ? (
                viewMode === 'preview' ? (
                  <iframe srcDoc={manifestedCode} className="w-full h-full bg-white border-none" />
                ) : (
                  <div className="h-full flex flex-col">
                    {/* Mobile Symbol Toolbar */}
                    <div className="flex gap-2 overflow-x-auto p-3 bg-white/[0.02] no-scrollbar shrink-0 border-b border-white/5">
                      {SYMBOL_TOOLBAR.map(s => (
                        <button key={s} onClick={() => insertSymbol(s)} className="w-10 h-10 flex items-center justify-center glass-mobile border-emerald-500/10 rounded-xl text-emerald-400 font-mono font-bold shrink-0 active:scale-90 shadow-sm">
                          {s}
                        </button>
                      ))}
                    </div>
                    <div className="flex-1 relative p-4 overflow-hidden">
                      <pre ref={preRef} className="absolute inset-4 m-0 language-markup text-[12px] font-mono leading-relaxed overflow-hidden pointer-events-none opacity-80" dangerouslySetInnerHTML={{ __html: highlightedHTML }} />
                      <textarea 
                        ref={editorRef}
                        value={manifestedCode} 
                        onChange={(e) => setManifestedCode(e.target.value)} 
                        spellCheck={false}
                        className="absolute inset-4 m-0 bg-transparent text-transparent caret-emerald-500 border-none outline-none resize-none font-mono text-[12px] leading-relaxed no-scrollbar code-textarea"
                      />
                    </div>
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                   <div className="w-12 h-12 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                     <span className="font-orbitron font-black text-emerald-500">Ω</span>
                   </div>
                   <p className="text-[8px] font-black uppercase tracking-[0.6em] text-emerald-900">Waiting for Architecture Input</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default WebForgeInterface;
