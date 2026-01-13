
import { UserProfile, LoginType } from '../types';

const STORAGE_KEY = 'prismforge_profiles';

/**
 * Simulates Java's UUID.nameUUIDFromBytes(bytes)
 * Specifically for "OfflinePlayer:username" format.
 */
export const generateOfflineUUID = (username: string): string => {
  const source = `OfflinePlayer:${username}`;
  // Simple MD5-like hash simulation for UUID v3 (Namespace: OfflinePlayer)
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    const char = source.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const absHash = Math.abs(hash).toString(16).padStart(8, '0');
  return `00000000-0000-3000-8000-${absHash}${absHash}`;
};

export const loadProfiles = (): UserProfile[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveProfiles = (profiles: UserProfile[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
};

export const validateUsername = (username: string): string | null => {
  if (username.length < 3 || username.length > 16) {
    return 'Username must be 3-16 characters.';
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Only letters, numbers, and underscores allowed.';
  }
  return null;
};
