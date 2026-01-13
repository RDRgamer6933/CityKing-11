
import React from 'react';
import { LauncherSettings } from '../types';

interface HomeViewProps {
  settings: LauncherSettings;
  onLaunch: () => void;
  isLaunching: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ settings, onLaunch, isLaunching }) => {
  return (
    <div className="h-full flex flex-col gap-8 relative z-10 animate-in fade-in duration-700">
      <section className="relative h-80 rounded-[2.5rem] overflow-hidden shadow-2xl group border border-zinc-800/50">
        <img 
          src="https://picsum.photos/id/1015/1200/600" 
          alt="Banner" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-12 max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 bg-yellow-500 text-zinc-950 text-[10px] font-black rounded-full uppercase tracking-[0.2em]">Kingdom News</span>
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">March 15, 2024</span>
          </div>
          <h2 className="text-5xl font-black mb-4 leading-tight text-white drop-shadow-md">Minecraft 1.21: The Tricky Trials</h2>
          <p className="text-zinc-300 line-clamp-2 text-lg font-medium opacity-90">
            Explore new structures, face formidable trials, and discover the secrets buried within the Crafter. Join the community in the biggest update of the year.
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-wider">Top Realms</h3>
            <button className="text-yellow-500 text-xs font-black hover:text-white transition-colors uppercase tracking-widest">Explore Servers</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-panel p-6 rounded-[2rem] border-zinc-800 hover:border-yellow-500/50 transition-all cursor-pointer group flex items-center gap-5">
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl group-hover:scale-110 transition-transform">
                <img src={`https://picsum.photos/id/11/128/128`} alt="Server Icon" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-zinc-100 uppercase tracking-wide">City Realms</h4>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] text-zinc-500 font-bold uppercase">1,242 Players</p>
                </div>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-[2rem] border-zinc-800 hover:border-yellow-500/50 transition-all cursor-pointer group flex items-center gap-5">
              <div className="w-14 h-14 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl group-hover:scale-110 transition-transform">
                <img src={`https://picsum.photos/id/12/128/128`} alt="Server Icon" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-black text-zinc-100 uppercase tracking-wide">Sky Kingdom</h4>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] text-zinc-500 font-bold uppercase">843 Players</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
           <h3 className="text-xl font-black text-white uppercase tracking-wider">Ready for Ascent</h3>
           <div className="flex-1 glass-panel rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center gap-8 border-zinc-800/80 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none"></div>
              
              <div className="space-y-3 z-10">
                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Launch Target</p>
                <div className="flex flex-col items-center">
                  <p className="text-3xl font-black text-white mb-1">{settings.selectedVersion}</p>
                  <div className="flex items-center justify-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${settings.modLoader === 'vanilla' ? 'bg-zinc-800 text-zinc-400' : 'bg-yellow-500 text-zinc-950'}`}>
                      {settings.modLoader}
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Optimized</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={onLaunch}
                disabled={isLaunching}
                className="w-full group relative overflow-hidden bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:cursor-not-allowed text-zinc-950 py-6 rounded-2xl font-black text-2xl shadow-2xl shadow-yellow-500/20 transition-all active:scale-[0.98] z-10"
              >
                <span className="relative z-10 flex items-center justify-center gap-4">
                  {isLaunching ? (
                    <>
                      <svg className="animate-spin h-7 w-7 text-zinc-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      ASCENDING...
                    </>
                  ) : (
                    <>
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ASCEND NOW
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
              </button>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default HomeView;
