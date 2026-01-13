
import React, { useState } from 'react';
import { MCVersion } from '../types';

interface VersionsViewProps {
  versions: MCVersion[];
  loading: boolean;
  selectedVersion: string;
  onSelect: (id: string) => void;
}

const VersionsView: React.FC<VersionsViewProps> = ({ versions, loading, selectedVersion, onSelect }) => {
  const [filter, setFilter] = useState<'all' | 'release' | 'snapshot'>('release');
  const [search, setSearch] = useState('');

  const filteredVersions = versions.filter(v => {
    const matchesFilter = filter === 'all' || v.type === filter;
    const matchesSearch = v.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black mb-1">Version Manifest</h2>
          <p className="text-zinc-500">Choose your game version or install a custom profile.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
           {(['release', 'snapshot', 'all'] as const).map(f => (
             <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                filter === f ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
             >
               {f}s
             </button>
           ))}
        </div>
      </div>

      <div className="flex items-center gap-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-4">
        <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          type="text" 
          placeholder="Search versions..." 
          className="bg-transparent border-none outline-none text-zinc-200 w-full font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-zinc-500 font-medium">Fetching from Mojang APIs...</p>
          </div>
        ) : filteredVersions.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No versions found matching your criteria.</p>
          </div>
        ) : (
          filteredVersions.map(version => (
            <div 
              key={version.id}
              onClick={() => onSelect(version.id)}
              className={`group flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer ${
                selectedVersion === version.id 
                  ? 'bg-indigo-600/10 border-indigo-600/50' 
                  : 'bg-zinc-900/30 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xs ${
                version.type === 'release' ? 'bg-green-600/20 text-green-400' : 'bg-amber-600/20 text-amber-400'
              }`}>
                {version.type.substring(0, 3).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-bold">{version.id}</h4>
                <p className="text-xs text-zinc-500">Released on {new Date(version.releaseTime).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                {selectedVersion === version.id && (
                  <span className="text-[10px] font-black bg-indigo-600 text-white px-2 py-1 rounded uppercase tracking-wider">Active</span>
                )}
                <button className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default VersionsView;
