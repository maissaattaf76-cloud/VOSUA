
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, AIPersona } from '../types';

interface ChatInterfaceProps {
  onPreviewCode?: (code: string | null) => void;
  version: string;
  persona: AIPersona;
}

const QUICK_ACTIONS = ["لخص", "اشرح", "كود", "ترجم"];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (customText?: string) => {
    const text = customText || input;
    if (!text.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: text,
        config: { systemInstruction: `VOSUA Ω AI. Mode: ${persona}. Professional Arabic/English.` }
      });
      const aiText = response.text || "حدث خطأ في النظام.";
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: aiText, type: 'text' }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "فشل الاتصال.", type: 'text' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-32 no-scrollbar space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-40 animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center mb-4">
              <span className="font-orbitron font-black text-2xl text-emerald-500">Ω</span>
            </div>
            <h2 className="text-xl font-orbitron font-black text-white">VOSUA <span className="text-emerald-500">ELITE</span></h2>
            <p className="text-[8px] font-black uppercase tracking-[0.4em] mt-2">Neural Link Ready</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[15px] font-arabic leading-relaxed shadow-lg ${
              m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white/[0.04] text-emerald-50 border border-emerald-500/10 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-1.5 p-3 bg-white/[0.02] border border-emerald-500/5 rounded-2xl w-fit">
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'0ms'}} />
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'200ms'}} />
            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay:'400ms'}} />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/95 to-transparent">
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-3">
          {QUICK_ACTIONS.map(a => (
            <button key={a} onClick={() => handleSend(a)} className="shrink-0 px-5 py-2 glass-mobile rounded-full text-[10px] font-black text-emerald-400 border border-emerald-500/10 ios-button">
              {a}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 glass-mobile p-1.5 rounded-full border border-emerald-500/20 shadow-2xl">
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="اسأل VOSUA..."
            className="flex-1 bg-transparent border-none py-3 px-5 text-white outline-none font-arabic text-[15px] placeholder:text-white/10"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 rounded-full flex items-center justify-center ios-button transition-all ${input.trim() ? 'bg-emerald-600 shadow-[0_0_15px_#10b98144]' : 'bg-white/5 text-white/20'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
