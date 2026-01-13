
import { VersionManifest } from '../types';

const MANIFEST_URL = 'https://launchermeta.mojang.com/mc/game/version_manifest.json';

export const fetchVersionManifest = async (): Promise<VersionManifest> => {
  try {
    const response = await fetch(MANIFEST_URL);
    if (!response.ok) throw new Error('Failed to fetch version manifest');
    return await response.json();
  } catch (error) {
    console.error('Error fetching Minecraft versions:', error);
    throw error;
  }
};

export const generateUUID = (username: string): string => {
  // Simple deterministic UUID for offline mode simulation
  const hash = Array.from(username).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `00000000-0000-0000-0000-${hash.toString(16).padStart(12, '0')}`;
};
