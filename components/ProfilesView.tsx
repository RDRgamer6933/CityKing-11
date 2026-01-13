
import React, { useState, useEffect } from 'react';
import { GameProfile, LoaderType, MCVersion } from '../types';
import { loadGameProfiles, saveGameProfiles, createProfile, duplicateProfile, deleteProfile } from '../services/profileService';

interface ProfilesViewProps {
  versions: MCVersion[];
  activeProfileId: string;
  onSelect: (id: string) => void;
}

const ProfilesView: React.FC<ProfilesViewProps> = ({ versions, activeProfileId, onSelect }) => {
  const [profiles, setProfiles] = useState<GameProfile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editProfile, setEditProfile] = useState<GameProfile | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [loader, setLoader] = useState<LoaderType>('vanilla');
  const [ram, setRam] = useState(4);

  useEffect(() => {
    setProfiles(loadGameProfiles());
    if (versions.length > 0 && !version) setVersion(versions[0].id);
  }, [versions]);

  const refresh = () => setProfiles(loadGameProfiles());

  const handleCreate = () => {
    createProfile(name, version, loader);
    setIsCreating(false);
    setName('');
    refresh();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Erase this profile from the royal archives? This cannot be undone.')) {
      deleteProfile(id);
      refresh();
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateProfile(id);
    refresh();
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-1">Royal Archives</h2>
          <p className="text-zinc-500 font-medium">Manage and isolate your Minecraft journey configurations.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-zinc-950 font-black rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          CREATE PROFILE
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map(p => (
          <div 
            key={p.id}
            className={`glass-panel group relative overflow-hidden rounded-3xl p-6 border-2 transition-all cursor-pointer ${
              activeProfileId === p.id ? 'border-yellow-500 bg-yellow-500/5 shadow-xl' : 'border-zinc-800 hover:border-zinc-700'
            }`}
            onClick={() => onSelect(p.id)}
          >
            <div className="flex items-start justify-between mb-4">
               <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-zinc-700">
                  {p.icon}
               </div>
               <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleDuplicate(p.id); }} className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white" title="Duplicate">
                    📑
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400" title="Delete">
                    🗑️
                  </button>
               </div>
            </div>

            <div className="mb-4">
               <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors">{p.name}</h3>
               <p className="text-xs text-zinc-500 font-mono mt-1">{p.versionId}</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
               <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${
                 p.loader === 'vanilla' ? 'bg-zinc-800 text-zinc-500' : 'bg-yellow-500 text-zinc-950'
               }`}>
                 {p.loader}
               </span>
               <span className="text-[10px] font-bold text-zinc-500 uppercase">
                 {p.ramMax}GB RAM
               </span>
            </div>

            {activeProfileId === p.id && (
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-yellow-500 text-zinc-950 px-2 py-0.5 rounded-full text-[9px] font-black uppercase">
                 <div className="w-1.5 h-1.5 rounded-full bg-zinc-950"></div>
                 Active
              </div>
            )}
          </div>
        ))}
      </div>

      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="max-w-xl w-full glass-panel rounded-3xl p-8 border-zinc-800 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black">Architect New Journey</h3>
                <button onClick={() => setIsCreating(false)} className="text-zinc-500 hover:text-white">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Profile Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Modded Kingdom"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 outline-none focus:border-yellow-500 transition-all text-white font-medium"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Version</label>
                      <select 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 outline-none focus:border-yellow-500 text-sm font-bold appearance-none"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                      >
                         {versions.map(v => <option key={v.id} value={v.id}>{v.id} ({v.type})</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Loader</label>
                      <select 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-4 outline-none focus:border-yellow-500 text-sm font-bold appearance-none"
                        value={loader}
                        onChange={(e) => setLoader(e.target.value as any)}
                      >
                        <option value="vanilla">Vanilla</option>
                        <option value="forge">Forge</option>
                        <option value="fabric">Fabric</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <label className="text-xs font-black text-zinc-500 uppercase tracking-widest">Max Memory (RAM)</label>
                     <span className="text-sm font-black text-yellow-500">{ram} GB</span>
                   </div>
                   <input 
                    type="range" min="2" max="16" step="1"
                    className="w-full h-2 bg-zinc-800 rounded-full appearance-none accent-yellow-500 cursor-pointer"
                    value={ram}
                    onChange={(e) => setRam(parseInt(e.target.value))}
                   />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                 <button onClick={() => setIsCreating(false)} className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-xl transition-all">ABANDON</button>
                 <button 
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="flex-[2] py-4 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-zinc-950 font-black rounded-xl transition-all shadow-lg shadow-yellow-500/20"
                >
                   ESTABLISH PROFILE
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProfilesView;
