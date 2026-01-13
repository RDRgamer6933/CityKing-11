
import React, { useState, useRef, useEffect } from 'react';
import { ModEntry, UserProfile, LauncherSettings, OnlineMod } from '../types';
import { loadMods, installMod, toggleModState, removeModFile, searchOnlineMods, downloadAndInstallOnlineMod } from '../services/modService';

interface ModsViewProps {
  user: UserProfile;
  settings: LauncherSettings;
  addLog: (msg: string, level?: 'INFO' | 'WARN' | 'ERROR') => void;
}

type ModTab = 'installed' | 'market';

const ModsView: React.FC<ModsViewProps> = ({ user, settings, addLog }) => {
  const [activeTab, setActiveTab] = useState<ModTab>('installed');
  const [mods, setMods] = useState<ModEntry[]>([]);
  const [marketMods, setMarketMods] = useState<OnlineMod[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installMessage, setInstallMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isVanilla = settings.modLoader === 'vanilla';

  useEffect(() => {
    refreshList();
    if (activeTab === 'market') fetchMarket();
  }, [user.id, settings.modLoader, activeTab]);

  const refreshList = () => {
    if (isVanilla) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setMods(loadMods(user.id, settings.modLoader));
      setIsRefreshing(false);
    }, 400);
  };

  const fetchMarket = async () => {
    if (isVanilla) return;
    setIsRefreshing(true);
    try {
      const results = await searchOnlineMods(searchQuery, settings.modLoader);
      setMarketMods(results);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLocalInstall = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.jar')) {
      setError('INVALID FILE: Only .jar files are supported.');
      return;
    }

    setIsInstalling(true);
    setInstallMessage(`Uploading ${file.name}...`);
    setInstallProgress(20);

    try {
      await new Promise(r => setTimeout(r, 800)); // Simulate file I/O
      const newMod = await installMod(file, user.id, settings.modLoader);
      addLog(`Installed local mod: ${newMod.fileName}`, 'INFO');
      setInstallProgress(100);
      setInstallMessage('Installation complete!');
      setTimeout(() => {
        setIsInstalling(false);
        refreshList();
      }, 500);
    } catch (err: any) {
      setError(err.message);
      setIsInstalling(false);
    }
  };

  const handleOnlineInstall = async (mod: OnlineMod) => {
    if (isInstalling) return;
    
    // Duplicate Check
    if (mods.some(m => m.id === mod.id)) {
      setError('ALREADY INSTALLED: This mod is already in your profile.');
      return;
    }

    setIsInstalling(true);
    try {
      const newMod = await downloadAndInstallOnlineMod(mod, user.id, (p) => {
        setInstallProgress(p);
        setInstallMessage(p < 100 ? `Downloading ${mod.name}...` : 'Finishing...');
      });
      addLog(`Market Install: ${newMod.name} (${newMod.version})`, 'INFO');
      setTimeout(() => {
        setIsInstalling(false);
        setActiveTab('installed');
      }, 800);
    } catch (err: any) {
      setError(err.message);
      setIsInstalling(false);
    }
  };

  if (isVanilla) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-500">
        <div className="w-24 h-24 bg-zinc-900 rounded-3xl flex items-center justify-center text-zinc-700 mb-6 border-2 border-dashed border-zinc-800">
           <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
           </svg>
        </div>
        <h2 className="text-2xl font-black text-white mb-3">Mod Menu Disabled</h2>
        <p className="max-w-md text-zinc-500 font-medium leading-relaxed">
          You are currently using the <span className="text-zinc-200">Vanilla</span> profile. To use Forge or Fabric mods, switch profile in the <span className="text-yellow-500 font-bold">Profiles</span> tab.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500 relative">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-1 uppercase tracking-tight">Kingdom Arsenal</h2>
          <p className="text-zinc-500 font-medium">Equip your <span className="text-yellow-500 capitalize">{settings.modLoader}</span> mods for <span className="text-zinc-300">{user.username}</span></p>
        </div>
        
        <div className="flex bg-zinc-900 border border-zinc-800 p-1.5 rounded-2xl">
           {(['installed', 'market'] as const).map(tab => (
             <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-zinc-800 text-yellow-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
             >
               {tab === 'installed' ? 'Management Hub' : 'Kingdom Market'}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'market' && (
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl px-5 py-4 animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder={`Search ${settings.modLoader} mods on Kingdom Market...`}
            className="bg-transparent border-none outline-none text-zinc-200 w-full font-medium placeholder:text-zinc-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchMarket()}
          />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-between animate-in slide-in-from-left-2">
           <div className="flex items-center gap-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-bold text-red-400">{error}</span>
           </div>
           <button onClick={() => setError(null)} className="text-red-500 hover:text-white font-black text-[10px] uppercase">Dismiss</button>
        </div>
      )}

      <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col bg-zinc-900/40 border-zinc-800">
        {activeTab === 'installed' ? (
          <>
            <div className="grid grid-cols-12 gap-4 p-5 bg-zinc-950/50 border-b border-zinc-800/50 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
               <div className="col-span-6">Mod Name / Filename</div>
               <div className="col-span-2 text-center">Status</div>
               <div className="col-span-2 text-center">Size</div>
               <div className="col-span-2 text-right">Actions</div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {mods.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                   <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center text-3xl opacity-20">📦</div>
                   <p className="text-lg font-bold text-zinc-600">No modifications installed</p>
                   <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black text-zinc-400 uppercase tracking-widest rounded-xl transition-all"
                   >
                     Upload Local .jar
                   </button>
                </div>
              ) : (
                mods.map(mod => (
                  <div key={mod.id} className={`grid grid-cols-12 gap-4 p-5 border-b border-zinc-800/30 items-center transition-all hover:bg-zinc-800/20 group ${!mod.enabled ? 'opacity-40 grayscale' : ''}`}>
                    <div className="col-span-6 flex items-center gap-4">
                      <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center text-xl shadow-inner border border-zinc-800">🛠️</div>
                      <div>
                        <h4 className="font-bold text-zinc-100">{mod.name}</h4>
                        <p className="text-[9px] font-mono text-zinc-600 truncate max-w-xs">{mod.fileName}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-center">
                       <button 
                        onClick={() => { toggleModState(mod.id, !mod.enabled); refreshList(); }}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${mod.enabled ? 'bg-yellow-600' : 'bg-zinc-700'}`}
                       >
                         <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${mod.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                       </button>
                    </div>
                    <div className="col-span-2 text-center text-xs font-bold text-zinc-500">{mod.size}</div>
                    <div className="col-span-2 flex justify-end">
                       <button onClick={() => { removeModFile(mod.id); refreshList(); }} className="p-2 text-zinc-600 hover:text-red-400 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
             {marketMods.length === 0 ? (
               <div className="col-span-full h-full flex flex-col items-center justify-center opacity-30 italic py-12">
                 {isRefreshing ? 'Scanning Market...' : 'Enter keywords to browse the Kingdom Market'}
               </div>
             ) : (
               marketMods.map(m => (
                 <div key={m.id} className="glass-panel p-5 rounded-2xl border-zinc-800 hover:border-yellow-500/30 transition-all flex flex-col gap-4 group">
                    <div className="flex items-start justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center text-2xl border border-zinc-800 group-hover:bg-yellow-500/10 transition-colors">{m.iconUrl}</div>
                          <div>
                             <h4 className="font-black text-white">{m.name}</h4>
                             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{m.author}</p>
                          </div>
                       </div>
                       <span className="text-[9px] font-black bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded uppercase tracking-tighter">{m.version}</span>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 min-h-[2.5rem]">{m.summary}</p>
                    <div className="flex items-center justify-between mt-2 pt-4 border-t border-zinc-800/50">
                       <div className="flex items-center gap-2">
                          <svg className="w-3 h-3 text-zinc-600" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /></svg>
                          <span className="text-[10px] font-bold text-zinc-600">{m.downloads}</span>
                       </div>
                       <button 
                        onClick={() => handleOnlineInstall(m)}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-zinc-950 text-[10px] font-black rounded-lg transition-all"
                       >
                         INSTALL
                       </button>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}

        <div className="p-5 bg-zinc-950/30 border-t border-zinc-800/50 flex items-center justify-between">
           <div className="flex gap-4">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-[10px] font-black text-zinc-400 hover:text-white transition-all active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                MANUAL INSTALL (.JAR)
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".jar" onChange={handleLocalInstall} />
           </div>
           <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">
             Storage: {mods.length} items active
           </p>
        </div>
      </div>

      {/* Installation Overlay */}
      {isInstalling && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="max-w-sm w-full glass-panel rounded-3xl p-8 border-zinc-800 shadow-2xl space-y-6 text-center">
              <div className="relative w-20 h-20 mx-auto">
                 <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
                 <div 
                   className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin" 
                   style={{ clipPath: `inset(0 0 ${100 - installProgress}% 0)` }}
                 ></div>
                 <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white">{installProgress}%</div>
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter">Forge Installation</h3>
                 <p className="text-zinc-500 font-medium text-sm h-6">{installMessage}</p>
              </div>
              <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-zinc-800">
                 <div 
                   className="h-full bg-yellow-500 transition-all duration-300" 
                   style={{ width: `${installProgress}%` }}
                 ></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ModsView;
