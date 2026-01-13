
import { ModEntry, OnlineMod, LoaderType } from '../types';

const MODS_STORAGE_KEY = 'cityking_mods_v1';

/**
 * Loads mods for a specific profile and loader.
 */
export const loadMods = (profileId: string, loader: LoaderType): ModEntry[] => {
  const data = localStorage.getItem(MODS_STORAGE_KEY);
  if (!data) return getInitialMods(profileId, loader);
  const allMods: ModEntry[] = JSON.parse(data);
  return allMods.filter(m => m.profileId === profileId && m.loader === loader);
};

export const saveAllMods = (mods: ModEntry[]): void => {
  localStorage.setItem(MODS_STORAGE_KEY, JSON.stringify(mods));
};

/**
 * Simulates a local file installation.
 */
export const installMod = async (file: File, profileId: string, loader: LoaderType): Promise<ModEntry> => {
  const data = localStorage.getItem(MODS_STORAGE_KEY);
  const allMods: ModEntry[] = data ? JSON.parse(data) : [];

  if (allMods.some(m => m.fileName.replace('.disabled', '') === file.name && m.profileId === profileId)) {
    throw new Error(`Conflict: A mod named ${file.name} already exists in this profile.`);
  }

  const newMod: ModEntry = {
    id: Math.random().toString(36).substr(2, 9),
    name: file.name.replace('.jar', '').split(/[-_]/)[0],
    version: '1.0.0',
    author: 'Local User',
    enabled: true,
    description: 'Manually imported local modification.',
    size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
    fileName: file.name,
    profileId: profileId,
    loader: loader,
    installedAt: Date.now()
  };

  const updated = [...allMods, newMod];
  saveAllMods(updated);
  return newMod;
};

/**
 * Simulates an online mod download and installation.
 */
export const downloadAndInstallOnlineMod = async (mod: OnlineMod, profileId: string, onProgress: (p: number) => void): Promise<ModEntry> => {
  const stages = [
    { p: 10, m: 'Initializing handshake...' },
    { p: 40, m: 'Downloading source binaries...' },
    { p: 70, m: 'Verifying MD5 Checksum...' },
    { p: 90, m: 'Mapping to profile directory...' },
    { p: 100, m: 'Installation complete.' }
  ];

  for (const stage of stages) {
    onProgress(stage.p);
    await new Promise(r => setTimeout(r, 400 + Math.random() * 600));
  }

  const newMod: ModEntry = {
    id: mod.id,
    name: mod.name,
    version: mod.version,
    author: mod.author,
    enabled: true,
    description: mod.summary,
    size: (Math.random() * 5 + 1).toFixed(1) + ' MB',
    fileName: `${mod.name.toLowerCase().replace(/\s/g, '-')}-${mod.version}.jar`,
    profileId,
    loader: mod.loader,
    installedAt: Date.now()
  };

  const data = localStorage.getItem(MODS_STORAGE_KEY);
  const allMods: ModEntry[] = data ? JSON.parse(data) : [];
  saveAllMods([...allMods, newMod]);

  return newMod;
};

/**
 * Mock API for searching mods.
 */
export const searchOnlineMods = async (query: string, loader: LoaderType): Promise<OnlineMod[]> => {
  const database: OnlineMod[] = [
    { id: 'm-1', name: 'Sodium', summary: 'Modern rendering engine for Minecraft', author: 'jellysquid', downloads: '12M', iconUrl: '🧪', version: '0.5.8', loader: 'fabric' },
    { id: 'm-2', name: 'Iris Shaders', summary: 'The modern shaders mod', author: 'coderbot', downloads: '8M', iconUrl: '🌈', version: '1.7.0', loader: 'fabric' },
    { id: 'm-3', name: 'JourneyMap', summary: 'Real-time mapping in-game', author: 'techbrew', downloads: '45M', iconUrl: '🗺️', version: '5.9.7', loader: 'forge' },
    { id: 'm-4', name: 'Biomes O Plenty', summary: 'Adds 80+ new biomes', author: 'Forstride', downloads: '90M', iconUrl: '🌳', version: '18.0.0', loader: 'forge' },
    { id: 'm-5', name: 'Roughly Enough Items', summary: 'Clean and efficient recipe viewer', author: 'shedaniel', downloads: '25M', iconUrl: '📦', version: '12.0.0', loader: 'fabric' },
    { id: 'm-6', name: 'JEI', summary: 'Just Enough Items', author: 'mezz', downloads: '200M', iconUrl: '📖', version: '15.0.0', loader: 'forge' }
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      const results = database.filter(m => 
        (m.name.toLowerCase().includes(query.toLowerCase()) || m.summary.toLowerCase().includes(query.toLowerCase())) &&
        m.loader === loader
      );
      resolve(results);
    }, 600);
  });
};

export const toggleModState = (modId: string, enabled: boolean): void => {
  const data = localStorage.getItem(MODS_STORAGE_KEY);
  if (!data) return;
  const allMods: ModEntry[] = JSON.parse(data);
  const updated = allMods.map(m => m.id === modId ? { ...m, enabled, fileName: enabled ? m.fileName.replace('.disabled', '') : m.fileName.replace('.disabled', '') + '.disabled' } : m);
  saveAllMods(updated);
};

export const removeModFile = (modId: string): void => {
  const data = localStorage.getItem(MODS_STORAGE_KEY);
  if (!data) return;
  const allMods: ModEntry[] = JSON.parse(data);
  saveAllMods(allMods.filter(m => m.id !== modId));
};

const getInitialMods = (profileId: string, loader: LoaderType): ModEntry[] => {
  if (loader === 'vanilla') return [];
  return [
    { id: `initial-${loader}-1`, name: 'CityKing Core', version: '1.0.0', author: 'CityKing Team', enabled: true, description: 'Essential launcher bridge.', size: '1.2 MB', fileName: `cityking-core-${loader}.jar`, profileId, loader, installedAt: Date.now() }
  ];
};
