
import React, { useState, useEffect, useRef } from 'react';
import { YouTubeStream } from '../types';
import { createYouTubeStream, fetchLiveChat, sendChatMessage } from '../services/youtubeService';

const StudioView: React.FC = () => {
  const [stream, setStream] = useState<YouTubeStream | null>(null);
  const [chatMessages, setChatMessages] = useState<{id: string, author: string, message: string, time: number}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [setupForm, setSetupForm] = useState({ title: '', desc: '', privacy: 'unlisted' as any });
  const [stats, setStats] = useState({ bitrate: 0, fps: 0, dropped: 0, duration: 0 });
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stats Simulation
  useEffect(() => {
    if (stream?.status === 'live') {
      const interval = setInterval(() => {
        setStats(prev => ({
          bitrate: Math.floor(4500 + Math.random() * 500),
          fps: Math.random() > 0.95 ? 59 : 60,
          dropped: prev.dropped + (Math.random() > 0.98 ? 1 : 0),
          duration: prev.duration + 1
        }));
        
        // Polling chat
        fetchLiveChat('mock-id').then(newMessages => {
          setChatMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const filtered = newMessages.filter(m => !existingIds.has(m.id));
            return [...prev, ...filtered].slice(-50);
          });
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [stream?.status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const newStream = await createYouTubeStream(setupForm.title, setupForm.desc, setupForm.privacy);
      setStream(newStream);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStart = () => {
    if (stream) setStream({ ...stream, status: 'live', startTime: Date.now() });
  };

  const formatDuration = (s: number) => {
    const hrs = Math.floor(s / 3600).toString().padStart(2, '0');
    const mins = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    await sendChatMessage('mock-id', chatInput);
    setChatMessages(prev => [...prev, {
      id: Date.now().toString(),
      author: 'Owner (Me)',
      message: chatInput,
      time: Date.now()
    }]);
    setChatInput('');
  };

  if (!stream) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto gap-8 animate-in fade-in duration-500">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-yellow-500/10 rounded-3xl flex items-center justify-center text-yellow-500 mx-auto border border-yellow-500/20 mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-4xl font-black text-white">Broadcast Center</h2>
          <p className="text-zinc-500 font-medium">Configure your YouTube Live stream for the Kingdom.</p>
        </div>

        <div className="w-full glass-panel rounded-3xl p-8 border-zinc-800 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Stream Title</label>
              <input 
                type="text" 
                placeholder="Epic Minecraft Adventure..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white font-medium outline-none focus:border-yellow-500 transition-all"
                value={setupForm.title}
                onChange={e => setSetupForm({...setupForm, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                placeholder="Tell your viewers what is happening..."
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white font-medium outline-none focus:border-yellow-500 transition-all resize-none"
                value={setupForm.desc}
                onChange={e => setSetupForm({...setupForm, desc: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Privacy</label>
                <select 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 text-white font-bold outline-none focus:border-yellow-500 appearance-none"
                  value={setupForm.privacy}
                  onChange={e => setSetupForm({...setupForm, privacy: e.target.value as any})}
                >
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                <div className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-4 text-zinc-500 font-bold">Gaming / Minecraft</div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleCreate}
            disabled={isCreating || !setupForm.title.trim()}
            className="w-full py-5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-black rounded-2xl shadow-xl shadow-yellow-500/10 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isCreating ? 'CREATING BROADCAST...' : 'ESTABLISH STREAM'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header Stat Bar */}
      <div className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-4 rounded-3xl">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${stream.status === 'live' ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`}></div>
               <span className="text-xs font-black uppercase tracking-widest">{stream.status}</span>
            </div>
            {stream.status === 'live' && (
              <>
                <div className="h-8 w-px bg-zinc-800"></div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-zinc-600 uppercase">Duration</span>
                   <span className="text-sm font-mono font-bold">{formatDuration(stats.duration)}</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-zinc-600 uppercase">Concurrent Viewers</span>
                   <span className="text-sm font-bold text-yellow-500">{stream.viewers}</span>
                </div>
              </>
            )}
         </div>
         <div className="flex gap-3">
            {stream.status === 'offline' ? (
               <button onClick={handleStart} className="px-8 py-2 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl text-xs transition-all">START STREAM</button>
            ) : (
               <button onClick={() => setStream(null)} className="px-8 py-2 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-xs transition-all">STOP STREAM</button>
            )}
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Main Panel: Preview & Stats */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
           <div className="aspect-video bg-black rounded-3xl border border-zinc-800 relative group overflow-hidden shadow-2xl">
              {stream.status === 'live' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                   <div className="w-16 h-16 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin mb-4"></div>
                   <p className="text-yellow-500 font-black italic">BROADCASTING LIVE SIGNAL</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700">
                   <p className="text-xs font-black uppercase tracking-[0.3em]">No Signal Detected</p>
                   <p className="text-[10px] font-bold mt-2 opacity-50">Launch Minecraft & Click Start</p>
                </div>
              )}
           </div>

           <div className="grid grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-3xl border-zinc-800 space-y-2">
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Bitrate</p>
                 <p className="text-2xl font-black text-white">{stats.bitrate} <span className="text-xs text-zinc-600">Kbps</span></p>
                 <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: '85%' }}></div>
                 </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl border-zinc-800 space-y-2">
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Framerate</p>
                 <p className="text-2xl font-black text-white">{stats.fps} <span className="text-xs text-zinc-600">FPS</span></p>
                 <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: '99%' }}></div>
                 </div>
              </div>
              <div className="glass-panel p-6 rounded-3xl border-zinc-800 space-y-2">
                 <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Health</p>
                 <p className={`text-2xl font-black ${stats.dropped > 5 ? 'text-amber-500' : 'text-green-500'}`}>
                    {stats.dropped > 10 ? 'POOR' : stats.dropped > 0 ? 'GOOD' : 'EXCELLENT'}
                 </p>
                 <p className="text-[10px] font-bold text-zinc-600">{stats.dropped} dropped frames</p>
              </div>
           </div>

           <div className="glass-panel p-8 rounded-3xl border-zinc-800 space-y-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">Stream Configuration</h3>
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500 font-medium">RTMP URL</span>
                    <code className="text-[10px] bg-zinc-950 px-2 py-1 rounded text-zinc-300">{stream.rtmpUrl}</code>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-500 font-medium">Stream Key</span>
                    <div className="flex gap-2">
                       <code className="text-[10px] bg-zinc-950 px-2 py-1 rounded text-zinc-300">••••••••••••••••</code>
                       <button className="text-[10px] font-black text-yellow-500">COPY</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Panel: Chat */}
        <div className="col-span-12 lg:col-span-4 flex flex-col glass-panel rounded-3xl border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-2xl">
           <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <h3 className="text-xs font-black text-zinc-300 uppercase tracking-widest">Live Chat</h3>
              <div className="flex gap-2">
                 <span className="w-2 h-2 rounded-full bg-green-500"></span>
                 <span className="text-[10px] font-bold text-zinc-500">CONNECTED</span>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-zinc-700 text-xs font-bold uppercase italic">
                   Waiting for messages...
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className="group animate-in slide-in-from-right-2">
                     <div className="flex items-baseline gap-2">
                        <span className={`text-[11px] font-black ${msg.author === 'Owner (Me)' ? 'text-yellow-500' : 'text-indigo-400'}`}>
                           {msg.author}:
                        </span>
                        <p className="text-xs text-zinc-300 leading-relaxed">{msg.message}</p>
                     </div>
                     <div className="flex gap-3 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-[8px] font-black text-zinc-600 hover:text-red-500">TIMEOUT</button>
                        <button className="text-[8px] font-black text-zinc-600 hover:text-red-500">BAN</button>
                        <button className="text-[8px] font-black text-zinc-600 hover:text-white">DELETE</button>
                     </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
           </div>

           <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
              <div className="relative">
                 <input 
                  type="text" 
                  placeholder="Say something to the realm..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pr-10 text-xs text-white outline-none focus:border-yellow-500 transition-all"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                />
                <button 
                  onClick={handleSendChat}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-yellow-500"
                >
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudioView;
