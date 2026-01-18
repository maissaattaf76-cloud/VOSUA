
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, AIPersona, Artifact } from '../types';

interface ChatInterfaceProps {
  onArtifact?: (artifact: Artifact | null) => void;
  version: string;
  persona: AIPersona;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ version, persona, onArtifact }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageMode, setIsImageMode] = useState(false);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const getSimulatedResponse = (text: string) => {
    const responses = [
      "مرحباً بك في مصفوفة VOSUA. أنا أعمل الآن في وضع المحاكاة العصبونية المستقلة.",
      "طلبك قيد المعالجة في النواة المحلية. بصفتي VOSUA Ω، سأحاول مساعدتك بأفضل ما يمكن.",
      "تم استقبال الموجة الفكرية. البيئة الحالية تعمل بنظام التشفير الذاتي.",
      "بناءً على تحليلي للمدخلات، يبدو أنك تبحث عن تكامل عالي المستوى. كيف يمكنني تطوير هذه الفكرة؟"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSend = async (customInput?: string, forceType?: 'text' | 'image' | 'code') => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const useSimulation = !process.env.API_KEY || isSimulationMode;

    try {
      if (useSimulation) {
        await new Promise(r => setTimeout(r, 1500));
        const simText = getSimulatedResponse(textToSend);
        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: simText + "\n\n(تعمل VOSUA الآن في وضع المحاكاة لعدم توفر اتصال بالشبكة العصبونية العالمية)", 
          type: 'text' 
        }]);
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const isActuallyImage = forceType === 'image' || isImageMode || textToSend.includes('صورة') || textToSend.toLowerCase().includes('image');

      if (isActuallyImage) {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: `${textToSend}, realistic, highly detailed, 8k resolution, cinematic lighting` }] },
        });

        let imageBase64 = '';
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              imageBase64 = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        }

        if (imageBase64) {
          setMessages(prev => [...prev, { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: "تم إنتاج الصورة عبر محرك VOSUA الذكي.", 
            type: 'image',
            metadata: { mediaUrl: imageBase64 }
          }]);
          if (onArtifact) onArtifact({ type: 'image', content: imageBase64, title: textToSend });
        } else {
          throw new Error("No image returned");
        }
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: textToSend,
          config: {
            systemInstruction: `أنت VOSUA Ω، المساعد الذكي الخارق. رد باللغة العربية بأسلوب تقني راقٍ ومستقبلي.`,
            tools: isSearchEnabled ? [{ googleSearch: {} }] : []
          }
        });

        const text = response.text || "عذراً، لم أستطع معالجة طلبك.";
        const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        
        const codeMatch = text.match(/```html\n([\s\S]*?)```/);
        if (codeMatch && onArtifact) {
          onArtifact({ type: 'code', content: codeMatch[1], title: 'VOSUA Artifact' });
        }

        setMessages(prev => [...prev, { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: text, 
          type: 'text',
          metadata: { 
            urls: grounding?.map((c: any) => ({ title: c.web?.title || 'مرجع بحث', uri: c.web?.uri || '#' }))
          }
        }]);
      }
    } catch (error: any) {
      console.error("API Error:", error);
      setIsSimulationMode(true);
      handleSend(textToSend); // Retry with simulation
    } finally {
      setIsLoading(false);
      setIsImageMode(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent font-arabic relative overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 lg:px-24 pb-64 pt-16 no-scrollbar space-y-6 relative z-10">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-8 opacity-40">
            <div className="w-20 h-20 rounded-[2.2rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center mb-6 emerald-pulse">
               <span className="font-orbitron font-black text-4xl text-emerald-500">Ω</span>
            </div>
            <h1 className="text-xl font-orbitron font-black text-white">VOSUA <span className="text-emerald-500">ULTRA</span></h1>
            <p className="text-[8px] uppercase font-bold tracking-[0.4em] mt-2">Neural Link {isSimulationMode ? 'Simulated' : 'Ready'}</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[88%] px-5 py-3.5 rounded-[1.6rem] text-[14px] border shadow-sm ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none border-emerald-400' 
                : 'bg-white/[0.08] text-emerald-50 border-white/10 rounded-tl-none backdrop-blur-xl'
            }`}>
              <div dir="auto" className="whitespace-pre-wrap">{msg.content}</div>
              
              {msg.metadata?.urls && msg.metadata.urls.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2">
                  {msg.metadata.urls.map((link, i) => (
                    <a key={i} href={link.uri} target="_blank" rel="noreferrer" className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] text-emerald-400 border border-white/5 font-bold hover:bg-emerald-500/20 transition-all">
                      {link.title}
                    </a>
                  ))}
                </div>
              )}

              {msg.type === 'image' && msg.metadata?.mediaUrl && (
                <img src={msg.metadata.mediaUrl} alt="Synthesis" className="mt-4 rounded-xl w-full aspect-square object-cover border border-white/10 shadow-2xl" />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-1.5 p-3 bg-white/5 rounded-2xl w-fit border border-emerald-500/10">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.1s]" />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
          </div>
        )}
      </div>

      <div className="absolute bottom-24 left-0 w-full px-4 z-20 transition-all duration-500">
        <div className="max-w-xl mx-auto">
          <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
             <button onClick={() => setIsSearchEnabled(!isSearchEnabled)} className={`shrink-0 h-9 px-4 rounded-full border text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all ${isSearchEnabled ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'glass-premium border-white/5 text-white/40'}`}>
                {isSearchEnabled ? '✅ بحث مفعل' : '🌐 بحث ذكي'}
             </button>
             <button onClick={() => setIsImageMode(!isImageMode)} className={`shrink-0 h-9 px-4 rounded-full border text-[9px] font-black uppercase tracking-wider flex items-center gap-2 transition-all ${isImageMode ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'glass-premium border-white/5 text-white/40'}`}>
                🎨 توليد صور
             </button>
             {isSimulationMode && (
               <button onClick={() => { setIsSimulationMode(false); window.aistudio.openSelectKey(); }} className="shrink-0 h-9 px-4 rounded-full border border-red-500/30 bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-wider">
                  ⚠️ وضع المحاكاة: فعل المفتاح
               </button>
             )}
          </div>

          <div className="glass-premium p-2 rounded-[2.2rem] flex items-end gap-2 shadow-[0_25px_60px_rgba(0,0,0,0.8)] border border-emerald-500/25">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isImageMode ? "صف الصورة..." : "كيف يمكن لـ VOSUA مساعدتك؟"}
              className="flex-1 bg-transparent border-none py-3 px-3 text-white focus:ring-0 outline-none text-[16px] max-h-32 resize-none no-scrollbar placeholder:text-white/10 font-medium"
              dir="auto"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={`w-11 h-11 flex items-center justify-center rounded-full transition-all shrink-0 ${
                input.trim() ? 'bg-emerald-600 text-white shadow-emerald scale-105 active:scale-95' : 'bg-white/5 text-white/10'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
