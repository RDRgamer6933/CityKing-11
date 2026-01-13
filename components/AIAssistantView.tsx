
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface Message {
  role: 'user' | 'ai';
  content: string;
  sources?: { uri: string; title: string }[];
}

// Audio Utilities
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Greetings, Traveler. I am the Royal Oracle of CityKing. How may I assist your journey through the blocks today? I can now search the web for live updates or speak with you directly." }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live Session Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const stopLive = useCallback(() => {
    setIsLive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    for (const source of sourcesRef.current) {
      try { source.stop(); } catch (e) {}
    }
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);

  const startLive = async () => {
    setMicError(null);
    try {
      // Permission pre-check for better UX
      if (navigator.permissions && (navigator.permissions as any).query) {
        const result = await navigator.permissions.query({ name: 'microphone' as any });
        if (result.state === 'denied') {
          setMicError("Microphone access is blocked. Please enable it in your browser settings to use the Live Oracle.");
          return;
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err => {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDismissedError') {
          throw new Error("Microphone access was denied or dismissed. Please click the microphone icon in your address bar to grant permission.");
        }
        throw err;
      });

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      streamRef.current = stream;
      setIsLive(true);

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) {
                try { s.stop(); } catch (e) {}
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            stopLive();
          },
          onclose: () => stopLive(),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "You are the 'Royal Oracle' of CityKing. Speak with wisdom and a slight regal tone. You are in a live voice conversation. Keep answers concise for audio flow.",
        }
      });
    } catch (err: any) {
      console.error('Mic access failed:', err);
      setMicError(err.message || "Could not access microphone. Please ensure no other app is using it and that you have granted permission.");
      stopLive();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping || isLive) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userMessage,
        config: {
          systemInstruction: "You are the 'Royal Oracle' of CityKing. You have access to Google Search to provide up-to-date Minecraft information. Cite your sources where possible. Speak regally.",
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || "My crystal ball is foggy. Try again, traveler.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = chunks?.map((c: any) => ({
        uri: c.web?.uri || '',
        title: c.web?.title || 'Royal Scroll'
      })).filter((s: any) => s.uri !== '') || [];

      setMessages(prev => [...prev, { role: 'ai', content: text, sources }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', content: "The royal archives are currently unreachable. Please verify your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-500 ${isLive ? 'bg-red-600 animate-pulse shadow-red-600/30' : 'bg-indigo-600 shadow-indigo-600/30'}`}>
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isLive ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              )}
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-black mb-1">Royal Oracle</h2>
            <p className="text-zinc-500 font-medium">{isLive ? 'Listening to your voice...' : 'AI-Powered Wisdom with Real-time Search'}</p>
          </div>
        </div>
        
        <button 
          onClick={isLive ? stopLive : startLive}
          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-3 ${
            isLive ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20'
          }`}
        >
          {isLive ? (
            <>
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              End Voice Session
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
              </svg>
              Go Live (Voice)
            </>
          )}
        </button>
      </div>

      {micError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
           <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
           <p className="text-sm font-bold text-red-400 leading-snug">{micError}</p>
           <button onClick={() => setMicError(null)} className="ml-auto text-red-500 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
           </button>
        </div>
      )}

      <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col bg-zinc-900/30 border-zinc-800/50 shadow-2xl relative">
        {isLive && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="flex gap-2 items-end h-24 mb-8">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-2 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
             </div>
             <p className="text-xl font-bold text-white mb-2">Voice Session Active</p>
             <p className="text-zinc-400 text-sm">Speak naturally. The Oracle is listening.</p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] p-5 rounded-2xl flex flex-col gap-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-zinc-800/80 text-zinc-100 border border-zinc-700/50'
              }`}>
                <div className="flex gap-4">
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0 shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 16L3 5l5 5 4-7 4 7 5-5-2 11H5zm14 2H5v2h14v-2z" />
                      </svg>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {msg.role === 'ai' && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-2 pt-4 border-t border-zinc-700/30 flex flex-wrap gap-2">
                    {msg.sources.map((src, idx) => (
                      <a 
                        key={idx} 
                        href={src.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 hover:bg-zinc-950 border border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-400 hover:text-indigo-400 transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        {src.title.length > 30 ? src.title.slice(0, 30) + '...' : src.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
               <div className="bg-zinc-800/80 p-5 rounded-2xl border border-zinc-700/50 flex gap-2">
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
               </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 bg-zinc-950/50 border-t border-zinc-800/50">
           <div className="relative">
             <input 
              type="text"
              placeholder={isLive ? "End voice session to type..." : "Ask for latest updates, recipes, or redstone help..."}
              disabled={isLive}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 pr-16 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/5 transition-all text-white font-medium disabled:opacity-50"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim() || isLive}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-xl flex items-center justify-center text-white transition-all shadow-lg active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
           </div>
           <div className="flex justify-center gap-6 mt-4">
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                Gemini 3 Pro + Search Grounding
              </p>
              <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">
                Live Voice API Enabled
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantView;
