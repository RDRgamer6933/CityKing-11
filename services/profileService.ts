
import { GameProfile, LoaderType } from '../types';

const STORAGE_KEY = 'cityking_profiles_v1';

export const loadGameProfiles = (): GameProfile[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return getInitialProfiles();
  return JSON.parse(data);
};

export const saveGameProfiles = (profiles: GameProfile[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

export const createProfile = (name: string, version: string, loader: LoaderType): GameProfile => {
  const id = crypto.randomUUID();
  const newProfile: GameProfile = {
    id,
    name,
    versionId: version,
    loader,
    gameDir: `.minecraft/profiles/${id}/`,
    javaPath: 'C:\\Program Files\\Java\\jdk-17\\bin\\java.exe',
    ramMin: 2,
    ramMax: 4,
    jvmArgs: '-XX:+UseG1GC -XX:+UnlockExperimentalVMOptions',
    resolutionW: 1920,
    resolutionH: 1080,
    lastPlayed: 0,
    created: Date.now(),
    icon: ['🧱', '⚔️', '📦', '🧪', '🏹'][Math.floor(Math.random() * 5)]
  };

  const profiles = loadGameProfiles();
  saveGameProfiles([...profiles, newProfile]);
  return newProfile;
};

export const duplicateProfile = (id: string): void => {
  const profiles = loadGameProfiles();
  const original = profiles.find(p => p.id === id);
  if (!original) return;

  const copy: GameProfile = {
    ...original,
    id: crypto.randomUUID(),
    name: `${original.name} (Copy)`,
    created: Date.now(),
    lastPlayed: 0
  };

  saveGameProfiles([...profiles, copy]);
};

export const deleteProfile = (id: string): void => {
  const profiles = loadGameProfiles();
  saveGameProfiles(profiles.filter(p => p.id !== id));
};

const getInitialProfiles = (): GameProfile[] => {
  return [
    {
      id: 'default-vanilla',
      name: 'Latest Release',
      versionId: '1.21.1',
      loader: 'vanilla',
      gameDir: '.minecraft/',
      javaPath: 'internal',
      ramMin: 2,
      ramMax: 4,
      jvmArgs: '',
      resolutionW: 1920,
      resolutionH: 1080,
      lastPlayed: Date.now(),
      created: Date.now(),
      icon: '👑'
    }
  ];
};
