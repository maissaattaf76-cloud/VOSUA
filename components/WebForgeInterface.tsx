
import { GoogleGenAI } from "@google/genai";
import React, { useState } from 'react';
import JSZip from 'jszip';

interface WebForgeInterfaceProps {
  hasKey: boolean;
  onKeyRequest: () => void;
}

const WebForgeInterface: React.FC<WebForgeInterfaceProps> = ({ hasKey, onKeyRequest }) => {
  const [directive, setDirective] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [manifestedCode, setManifestedCode] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'architect' | 'view'>('architect');
  const [isZipping, setIsZipping] = useState(false);
  const [isSimulation, setIsSimulation] = useState(false);

  const getFallbackTemplate = (topic: string) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.tailwindcss.com"></script>
    <title>${topic}</title>
</head>
<body class="bg-slate-900 text-white font-sans min-h-screen flex flex-col items-center justify-center p-8">
    <div class="max-w-2xl w-full text-center space-y-6">
        <h1 class="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">${topic}</h1>
        <p class="text-slate-400 text-lg">تم بناء هذا النموذج الأولي بواسطة VOSUA Forge في وضع المحاكاة.</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div class="p-6 bg-slate-800 rounded-3xl border border-slate-700">
                <h3 class="text-xl font-bold mb-2">المعمارية</h3>
                <p class="text-slate-500 text-sm">تصميم متجاوب يعتمد على Tailwind CSS.</p>
            </div>
            <div class="p-6 bg-slate-800 rounded-3xl border border-slate-700">
                <h3 class="text-xl font-bold mb-2">الرؤية</h3>
                <p class="text-slate-500 text-sm">تم استلهام التصميم من: ${topic}</p>
            </div>
        </div>
        <button class="mt-8 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-full font-bold transition-all shadow-lg shadow-emerald-900/20">استكشاف المزيد</button>
    </div>
</body>
</html>`;

  const handleForge = async () => {
    if (isGenerating || !directive.trim()) return;
    setIsGenerating(true);
    setIsSimulation(false);

    if (!process.env.API_KEY) {
      await new Promise(r => setTimeout(r, 2000));
      setManifestedCode(getFallbackTemplate(directive));
      setMobileTab('view');
      setIsSimulation(true);
      setIsGenerating(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a single-file responsive website for: ${directive}. Use Tailwind CSS. Clean, modern design. Output ONLY HTML code inside markdown blocks.`,
        config: { systemInstruction: "Output pure HTML code only." }
      });
      let code = response.text;
      const markdownMatch = code.match(/```(?:html)?\n([\s\S]*?)```/);
      if (markdownMatch) code = markdownMatch[1];
      if (code) { 
        setManifestedCode(code);
        setMobileTab('view');
      }
    } catch (error: any) { 
      console.error(error);
      setIsSimulation(true);
      setManifestedCode(getFallbackTemplate(directive));
      setMobileTab('view');
    } finally { setIsGenerating(false); }
  };

  const handleExportZip = async () => {
    if (!manifestedCode || isZipping) return;
    setIsZipping(true);

    try {
      const zip = new JSZip();
      zip.file("index.html", manifestedCode);
      zip.file("styles.css", "/* VOSUA Forge Custom Styles */");
      zip.file("script.js", "// VOSUA Forge Custom Scripts\nconsole.log('VOSUA Project Loaded');");
      zip.file("README.md", `# VOSUA Ω Forge Project\n\nGenerated for: "${directive}"\nMode: ${isSimulation ? 'Simulated' : 'Neural'}`);

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vosua-forge-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Zip Export Error:", error);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden font-arabic page-transition">
      <div className="flex p-4 gap-2 shrink-0 bg-black/20">
         <button onClick={() => setMobileTab('architect')} className={`flex-1 py-3.5 text-[11px] font-black uppercase rounded-2xl transition-all ${mobileTab === 'architect' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-white/30'}`}>المهندس</button>
         <button onClick={() => setMobileTab('view')} className={`flex-1 py-3.5 text-[11px] font-black uppercase rounded-2xl transition-all ${mobileTab === 'view' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-white/30'}`}>المعاينة</button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {mobileTab === 'architect' ? (
          <div className="p-6 space-y-8 h-full overflow-y-auto pb-44 no-scrollbar">
            <div className="space-y-2">
              <h2 className="text-2xl font-orbitron font-black text-white">FORGE<span className="text-emerald-500"> Ω</span></h2>
              <p className="text-[8px] text-emerald-900 font-bold uppercase tracking-widest">Architectural Node</p>
            </div>
            
            <textarea 
              value={directive} 
              onChange={(e) => setDirective(e.target.value)}
              placeholder="صف فكرة الموقع..."
              className="w-full h-64 bg-white/5 border border-white/10 rounded-[2rem] p-6 text-[15px] text-white focus:border-emerald-500/40 outline-none resize-none no-scrollbar shadow-inner"
            />

            <button onClick={handleForge} disabled={isGenerating || !directive.trim()} className="w-full py-5 bg-emerald-600 text-white font-black rounded-[2rem] ios-active uppercase tracking-widest text-[11px] shadow-2xl">
              {isGenerating ? 'جاري البناء...' : 'ابدأ البناء الرقمي'}
            </button>
          </div>
        ) : (
          <div className="h-full bg-white relative flex flex-col">
            {manifestedCode && (
              <div className="absolute top-4 right-4 z-[60] flex gap-2">
                {isSimulation && (
                  <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 px-3 py-2 rounded-xl text-[8px] font-black uppercase flex items-center">
                    وضع المحاكاة
                  </span>
                )}
                <button 
                  onClick={handleExportZip}
                  disabled={isZipping}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ios-active border border-emerald-400/20"
                >
                  {isZipping ? <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                  تصدير كـ ZIP
                </button>
              </div>
            )}
            
            <div className="flex-1 relative">
              {manifestedCode ? (
                <iframe srcDoc={manifestedCode} className="w-full h-full border-none" sandbox="allow-scripts allow-modals" title="Preview" />
              ) : (
                <div className="h-full flex items-center justify-center opacity-20">
                  <p className="text-[10px] uppercase font-black tracking-widest">لا يوجد معمارية جاهزة</p>
                </div>
              )}
              {isGenerating && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
                    <span className="text-[10px] text-emerald-500 font-black tracking-widest uppercase">توليد المعمارية...</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebForgeInterface;
