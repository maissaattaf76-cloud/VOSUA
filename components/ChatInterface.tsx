
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Message, AIPersona } from '../types';

interface ChatInterfaceProps {
  onPreviewCode?: (code: string | null) => void;
  version: string;
  persona: AIPersona;
}

const QUICK_PROMPTS = ["لخص النص", "اشرح الفكرة", "كود برمجي", "ترجمة"];

const ChatInterface: React.FC<ChatInterfaceProps> = ({ version, persona }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (customInput?: string) => {
    const textToSend = customInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend, type: 'text' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textToSend,
        config: {
          systemInstruction: `VOSUA Ω Pro. Professional Arabic/English assistant. Elite tone. Mode: ${persona}.`,
        }
      });
      const text = response.text || "حدث خطأ في الاتصال العصبوني.";
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: text, type: 'text' }]);
    } catch (error) {
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "فشل المزامنة. حاول مرة أخرى.", type: 'text' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black font-arabic overflow-hidden relative">
      
      {/* Dynamic Header Mask */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black via-black/80 to-transparent z-10 pointer-events-none" />

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-48 pt-10 no-scrollbar space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-700">
            <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mb-6 shadow-2xl">
               <span className="font-orbitron font-black text-2xl text-emerald-500">Ω</span>
            </div>
            <h1 className="text-3xl font-orbitron font-black text-white mb-2">VOSUA<span className="text-emerald-500"> ELITE</span></h1>
            <p className="text-emerald-900 font-bold uppercase tracking-[0.4em] text-[8px]">Next-Gen Intelligence Bridge</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[92%] px-5 py-4 rounded-[1.8rem] text-[15px] leading-relaxed shadow-lg ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-tr-none' 
                : 'bg-white/[0.03] text-emerald-50 border border-emerald-500/10 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2 p-4 bg-white/[0.02] rounded-2xl w-fit border border-emerald-500/5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
          </div>
        )}
      </div>

      {/* Input Group */}
      <div className="absolute bottom-0 left-0 w-full p-4 pb-24 lg:pb-8 bg-gradient-to-t from-black via-black/95 to-transparent z-20">
        
        {/* Quick Actions Scrollable */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 px-2">
          {QUICK_PROMPTS.map(p => (
            <button key={p} onClick={() => handleSend(p)} className="shrink-0 px-4 py-2 glass-mobile rounded-full text-[10px] font-bold text-emerald-400 border border-emerald-500/20 ios-button">
              {p}
            </button>
          ))}
        </div>

        <div className="max-w-2xl mx-auto flex items-end gap-2 glass-mobile p-2.5 rounded-[2.2rem] shadow-2xl border border-emerald-500/20">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="تحدث مع VOSUA..."
            className="flex-1 bg-transparent border-none py-3 px-4 text-emerald-50 focus:ring-0 outline-none text-[16px] font-medium placeholder:text-white/10 max-h-40 resize-none"
            dir="auto"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all shrink-0 ios-button ${
              input.trim() ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white/5 text-white/20'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
