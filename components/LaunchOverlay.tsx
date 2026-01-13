
import React from 'react';

interface LaunchOverlayProps {
  progress: number;
  status: string;
}

const LaunchOverlay: React.FC<LaunchOverlayProps> = ({ progress, status }) => {
  const logoUrl = "https://cdn.discordapp.com/attachments/1383875664142401617/1451219928966369280/20251218_202925.png?ex=6966ffa1&is=6965ae21&hm=3820f83b49fc71d484bb1f0a9b6948c57b4d2577aa21916cc8153cc8a2bb95db&";

  return (
    <div className="fixed inset-0 bg-zinc-950/90 backdrop-blur-2xl z-[100] flex items-center justify-center p-8 transition-opacity duration-500">
      <div className="max-w-md w-full flex flex-col items-center text-center gap-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl shadow-yellow-500/40 animate-bounce overflow-hidden">
             <img src={logoUrl} alt="CityKing" className="w-full h-full object-cover" />
          </div>
          <div className="absolute -inset-4 bg-yellow-500/20 blur-xl rounded-full animate-pulse-soft"></div>
        </div>

        <div className="space-y-3 w-full">
          <h2 className="text-3xl font-black tracking-tight text-white">Entering the City</h2>
          <p className="text-zinc-400 font-medium h-6">{status}</p>
          
          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-6 border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500 ease-out shadow-[0_0_12px_rgba(234,179,8,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{progress}% Processed</p>
        </div>

        <div className="mt-8 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
          <p className="text-xs text-zinc-500 leading-relaxed italic">
            "A true King is known not by his crown, but by the blocks he builds."
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaunchOverlay;
