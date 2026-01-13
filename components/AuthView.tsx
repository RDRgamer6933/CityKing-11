
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { validateUsername, generateOfflineUUID } from '../services/authService';

interface AuthViewProps {
  onLogin: (user: UserProfile) => void;
  savedProfiles: UserProfile[];
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, savedProfiles }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const logoUrl = "https://cdn.discordapp.com/attachments/1383875664142401617/1451219928966369280/20251218_202925.png?ex=6966ffa1&is=6965ae21&hm=3820f83b49fc71d484bb1f0a9b6948c57b4d2577aa21916cc8153cc8a2bb95db&";

  const handleOfflineLogin = () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    const newUser: UserProfile = {
      id: crypto.randomUUID(),
      username: username,
      uuid: generateOfflineUUID(username),
      loginType: 'OFFLINE',
      lastLoginTime: Date.now()
    };
    onLogin(newUser);
  };

  return (
    <div className="fixed inset-0 bg-[#09090b] z-[200] flex items-center justify-center p-6 overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[20%] left-[10%] w-[400px] h-[400px] bg-yellow-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[300px] h-[300px] bg-red-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-md w-full glass-panel rounded-[2rem] p-10 border-zinc-800 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center shadow-xl shadow-yellow-500/20 mb-6 transform -rotate-3 overflow-hidden">
             <img src={logoUrl} alt="CityKing" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">CityKing Launcher</h1>
          <p className="text-zinc-500 font-medium">Authentication required to enter the realm</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Minecraft Username</label>
            <input 
              type="text"
              placeholder="Enter username"
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-4 outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-white font-medium"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleOfflineLogin()}
            />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold text-red-400">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button 
              onClick={handleOfflineLogin}
              className="w-full bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black py-4 rounded-xl transition-all active:scale-[0.98]"
            >
              PLAY AS CITIZEN
            </button>
          </div>
        </div>

        {savedProfiles.length > 0 && (
          <div className="mt-10 border-t border-zinc-800 pt-8">
             <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 text-center">Switch Inhabitant</h3>
             <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {savedProfiles.map(profile => (
                  <button 
                    key={profile.id}
                    onClick={() => onLogin(profile)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 overflow-hidden group-hover:border-yellow-500 transition-colors">
                      <img src={`https://mc-heads.net/avatar/${profile.username}/48`} alt="" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 group-hover:text-zinc-200">{profile.username}</span>
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthView;
