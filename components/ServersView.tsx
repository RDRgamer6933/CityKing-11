
import React from 'react';
import { ServerEntry } from '../types';

const ServersView: React.FC = () => {
  const servers: ServerEntry[] = [
    {
      id: '1',
      name: 'Thunder Craft',
      ip: 'play.thundercraft.org',
      players: 72,
      maxPlayers: 200,
      status: 'online',
      description: 'The official kingdom of Thunder Craft. Survival, FFA, and 24/7 online.',
      icon: 'https://picsum.photos/id/11/64/64'
    },
    {
      id: '2',
      name: 'City Realms',
      ip: 'play.cityking.net',
      players: 1242,
      maxPlayers: 5000,
      status: 'online',
      description: 'The official kingdom of CityKing. Survival, Economy, and Custom Quests.',
      icon: 'https://picsum.photos/id/15/64/64'
    }
  ];

  return (
    <div className="h-full flex flex-col gap-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-1">Featured Realms</h2>
          <p className="text-zinc-500">Discover the best community-hosted experiences.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-zinc-950 font-black rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/20">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Server
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servers.map(server => (
          <div key={server.id} className="glass-panel group relative overflow-hidden rounded-3xl border-zinc-800 hover:border-yellow-500/50 transition-all p-6 flex flex-col gap-6 cursor-pointer">
            <div className="flex items-start justify-between">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 overflow-hidden shadow-xl">
                <img src={server.icon} alt={server.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${
                  server.status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {server.status}
                </span>
                <span className="text-xs text-zinc-500 font-bold">{server.players}/{server.maxPlayers} Players</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">{server.name}</h3>
              <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed h-10">{server.description}</p>
            </div>

            <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
              <code className="text-[10px] font-mono bg-zinc-950 px-2 py-1 rounded text-zinc-500">{server.ip}</code>
              <button className="text-sm font-black text-yellow-500 hover:text-white transition-colors">JOIN REALM</button>
            </div>

            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-yellow-500/20 transition-all"></div>
          </div>
        ))}
      </div>

      <section className="mt-8 space-y-4">
        <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest border-b border-zinc-800 pb-2">Community Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
             <p className="text-2xl font-black text-white">42.1K</p>
             <p className="text-[10px] text-zinc-500 font-bold uppercase">Total Citizens</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
             <p className="text-2xl font-black text-white">152</p>
             <p className="text-[10px] text-zinc-500 font-bold uppercase">Active Realms</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
             <p className="text-2xl font-black text-white">99.9%</p>
             <p className="text-[10px] text-zinc-500 font-bold uppercase">Uptime Score</p>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
             <p className="text-2xl font-black text-white">42ms</p>
             <p className="text-[10px] text-zinc-500 font-bold uppercase">Avg. Latency</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServersView;
