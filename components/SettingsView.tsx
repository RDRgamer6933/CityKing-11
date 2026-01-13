
import React from 'react';
import { LauncherSettings } from '../types';

interface SettingsViewProps {
  settings: LauncherSettings;
  onSettingsChange: React.Dispatch<React.SetStateAction<LauncherSettings>>;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSettingsChange }) => {
  return (
    <div className="h-full flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-black mb-1">Preferences</h2>
        <p className="text-zinc-500">Configure your system paths and resource allocation.</p>
      </div>

      <div className="grid grid-cols-1 gap-8 max-w-4xl">
        <section className="space-y-6">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Profile Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Display Name</label>
              <input 
                type="text"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors"
                value={settings.username}
                onChange={(e) => onSettingsChange(s => ({...s, username: e.target.value}))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300">Mod Loader</label>
              <select 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-colors appearance-none"
                value={settings.modLoader}
                onChange={(e) => onSettingsChange(s => ({...s, modLoader: e.target.value as any}))}
              >
                <option value="vanilla">Vanilla (Default)</option>
                <option value="forge">Forge</option>
                <option value="fabric">Fabric</option>
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Java & Performance</h3>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-zinc-300">Allocated RAM (RAM Memory)</label>
                <span className="text-sm font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">{settings.ramAllocated} GB</span>
             </div>
             <input 
               type="range" 
               min="2" 
               max="16" 
               step="1"
               className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
               value={settings.ramAllocated}
               onChange={(e) => onSettingsChange(s => ({...s, ramAllocated: parseInt(e.target.value)}))}
             />
             <div className="flex justify-between text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
               <span>2GB (Min)</span>
               <span>16GB (Max)</span>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Java Executable Path</label>
            <div className="flex gap-2">
              <input 
                type="text"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-sm text-zinc-400"
                value={settings.javaPath}
                readOnly
              />
              <button className="px-6 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-colors">Browse</button>
            </div>
            <p className="text-[10px] text-zinc-600 italic">Recommended: Java 17 for Minecraft 1.18+</p>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">File Paths</h3>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-300">Minecraft Directory</label>
            <div className="flex gap-2">
              <input 
                type="text"
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 outline-none text-sm text-zinc-400"
                value={settings.minecraftDir}
                readOnly
              />
              <button className="px-6 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-colors">Change</button>
            </div>
          </div>
        </section>

        <section className="pt-8 flex justify-end gap-4">
           <button className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-bold transition-all">Discard</button>
           <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">Save Changes</button>
        </section>
      </div>
    </div>
  );
};

export default SettingsView;
