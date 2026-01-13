
import React, { useState, useEffect, useCallback } from 'react';
import { AppTab, MCVersion, LauncherSettings, ConsoleLog, ModEntry, UserProfile, GameProfile } from './types';
import { fetchVersionManifest } from './services/mojangService';
import { loadProfiles, saveProfiles } from './services/authService';
import { loadGameProfiles } from './services/profileService';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import VersionsView from './components/VersionsView';
import ProfilesView from './components/ProfilesView';
import ModsView from './components/ModsView';
import SettingsView from './components/SettingsView';
import ConsoleView from './components/ConsoleView';
import LaunchOverlay from './components/LaunchOverlay';
import AuthView from './components/AuthView';
import SkinManagerView from './components/SkinManagerView';
import ServersView from './components/ServersView';
import AIAssistantView from './components/AIAssistantView';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [versions, setVersions] = useState<MCVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to play');
  const [logs, setLogs] = useState<ConsoleLog[]>([]);

  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [savedProfiles, setSavedProfiles] = useState<UserProfile[]>([]);

  // Game Profiles State
  const [gameProfiles, setGameProfiles] = useState<GameProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('default-vanilla');

  const [settings, setSettings] = useState<LauncherSettings>({
    ramAllocated: 4,
    javaPath: 'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
    minecraftDir: 'C:\\Users\\User\\AppData\\Roaming\\.minecraft',
    username: 'Steve',
    isOffline: true,
    selectedVersion: '',
    modLoader: 'vanilla'
  });

  useEffect(() => {
    const init = async () => {
      try {
        const manifest = await fetchVersionManifest();
        setVersions(manifest.versions);
        setSettings(prev => ({ ...prev, selectedVersion: manifest.latest.release }));

        const profiles = loadProfiles();
        setSavedProfiles(profiles);

        const gProfiles = loadGameProfiles();
        setGameProfiles(gProfiles);
        
        if (profiles.length > 0) {
          const lastUser = profiles.reduce((prev, current) => 
            (prev.lastLoginTime > current.lastLoginTime) ? prev : current
          );
          handleLogin(lastUser);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setSettings(prev => ({ ...prev, username: user.username, isOffline: true }));
    
    setSavedProfiles(prev => {
      const exists = prev.find(p => p.username === user.username);
      const updated = exists 
        ? prev.map(p => p.id === exists.id ? { ...user, lastLoginTime: Date.now() } : p)
        : [...prev, { ...user, lastLoginTime: Date.now() }];
      
      saveProfiles(updated);
      return updated;
    });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    handleLogin(updatedUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  const addLog = useCallback((message: string, level: ConsoleLog['level'] = 'INFO') => {
    const newLog: ConsoleLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message
    };
    setLogs(prev => [...prev.slice(-100), newLog]);
  }, []);

  const activeGameProfile = gameProfiles.find(p => p.id === activeProfileId) || gameProfiles[0];

  const simulateLaunch = async () => {
    if (!currentUser || !activeGameProfile) return;
    setIsLaunching(true);
    setLaunchProgress(0);
    setStatusMessage('Preparing Isolation...');
    addLog(`Launching Profile: ${activeGameProfile.name}`);

    const steps = [
      { p: 15, m: 'Setting up isolated directories...', l: `Directory bound to: ${activeGameProfile.gameDir}` },
      { p: 35, m: 'Gathering assets...', l: 'Downloaded 22 asset objects (4.1 MB)' },
      { p: 55, m: 'Checking libraries...', l: 'Core dependencies verified' },
      { p: 75, m: 'Applying JVM arguments...', l: `Args: ${activeGameProfile.jvmArgs}` },
      { p: 90, m: 'Injecting authentication...', l: `UUID: ${currentUser.uuid} | Type: ${currentUser.loginType}` },
      { p: 100, m: 'Ascending', l: 'Process started successfully' }
    ];

    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600 + Math.random() * 800));
      setLaunchProgress(step.p);
      setStatusMessage(step.m);
      addLog(step.l);
    }

    setTimeout(() => {
      setIsLaunching(false);
      setStatusMessage('Game is running');
      setActiveTab('console');
    }, 1000);
  };

  if (!currentUser) {
    return <AuthView onLogin={handleLogin} savedProfiles={savedProfiles} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 select-none">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <header className="h-14 flex items-center justify-between px-6 border-b border-zinc-800/50 bg-zinc-900/30 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${isLaunching ? 'bg-amber-500 animate-pulse' : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'}`}></div>
            <span className="text-sm font-medium text-zinc-400">
               {isLaunching ? statusMessage : `Ready: ${activeGameProfile?.name}`}
            </span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                  Offline Citizen
                </p>
                <p className="text-sm font-black text-zinc-200">{currentUser.username}</p>
             </div>
             <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden hover:border-yellow-500 transition-colors cursor-pointer group">
                <img 
                  src={currentUser.skinUrl || `https://mc-heads.net/avatar/${currentUser.username}/40`} 
                  alt="Skin" 
                  className="w-8 h-8 rounded shadow-inner object-cover group-hover:scale-110 transition-transform" 
                />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          {activeTab === 'home' && (
            <HomeView 
              settings={{...settings, selectedVersion: activeGameProfile?.versionId || '', modLoader: activeGameProfile?.loader || 'vanilla'}} 
              onLaunch={simulateLaunch} 
              isLaunching={isLaunching}
            />
          )}
          {activeTab === 'profiles' && (
            <ProfilesView 
              versions={versions} 
              activeProfileId={activeProfileId}
              onSelect={(id) => {
                setActiveProfileId(id);
                setGameProfiles(loadGameProfiles());
              }}
            />
          )}
          {activeTab === 'servers' && <ServersView />}
          {activeTab === 'versions' && (
            <VersionsView 
              versions={versions} 
              loading={loading} 
              selectedVersion={activeGameProfile?.versionId || ''}
              onSelect={() => {}} 
            />
          )}
          {activeTab === 'skins' && <SkinManagerView user={currentUser} onUpdateUser={handleUpdateProfile} />}
          {activeTab === 'ai-assistant' && <AIAssistantView />}
          {activeTab === 'mods' && (
            <ModsView 
              user={currentUser}
              settings={{...settings, modLoader: activeGameProfile?.loader || 'vanilla'}}
              addLog={addLog}
            />
          )}
          {activeTab === 'settings' && <SettingsView settings={settings} onSettingsChange={setSettings} />}
          {activeTab === 'console' && <ConsoleView logs={logs} />}
        </div>

        {isLaunching && <LaunchOverlay progress={launchProgress} status={statusMessage} />}

        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[100px] rounded-full"></div>
        </div>
      </main>
    </div>
  );
};

export default App;
