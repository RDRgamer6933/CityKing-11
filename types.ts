
export type AppTab = 'home' | 'profiles' | 'versions' | 'mods' | 'settings' | 'console' | 'accounts' | 'skins' | 'servers' | 'ai-assistant';

export type LoginType = 'OFFLINE';
export type LoaderType = 'vanilla' | 'forge' | 'fabric';

export interface UserProfile {
  id: string; 
  username: string;
  uuid: string;
  loginType: LoginType;
  lastLoginTime: number;
  skinUrl?: string; 
  skinModel?: 'classic' | 'slim';
}

export interface GameProfile {
  id: string;
  name: string;
  versionId: string;
  loader: LoaderType;
  loaderVersion?: string;
  gameDir: string;
  javaPath: string;
  ramMin: number;
  ramMax: number;
  jvmArgs: string;
  resolutionW: number;
  resolutionH: number;
  lastPlayed: number;
  created: number;
  icon: string;
}

export interface MCVersion {
  id: string;
  type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha';
  url: string;
  time: string;
  releaseTime: string;
}

export interface VersionManifest {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: MCVersion[];
}

export interface LauncherSettings {
  ramAllocated: number;
  javaPath: string;
  minecraftDir: string;
  username: string;
  isOffline: boolean;
  selectedVersion: string;
  modLoader: LoaderType;
}

export interface ModEntry {
  id: string;
  name: string;
  version: string;
  author: string;
  enabled: boolean;
  description: string;
  size: string;
  fileName: string;
  profileId: string; 
  loader: LoaderType;
  installedAt?: number;
}

export interface OnlineMod {
  id: string;
  name: string;
  summary: string;
  author: string;
  downloads: string;
  iconUrl: string;
  version: string;
  loader: LoaderType;
}

export interface ConsoleLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

export interface ServerEntry {
  id: string;
  name: string;
  ip: string;
  players: number;
  maxPlayers: number;
  status: 'online' | 'offline';
  description: string;
  icon: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  customUrl: string;
  thumbnails: { default: { url: string } };
  statistics: { subscriberCount: string };
}

export interface YouTubeBroadcast {
  id: string;
  title: string;
  description: string;
  status: 'offline' | 'live' | 'complete';
  privacyStatus: 'public' | 'unlisted' | 'private';
  rtmpUrl: string;
  streamKey: string;
  liveChatId: string;
  viewers: number;
  startTime?: number;
}

export type YouTubeStream = YouTubeBroadcast;

export interface YouTubeChatMessage {
  id: string;
  authorName: string;
  authorId: string;
  messageText: string;
  publishedAt: string;
  isModerator: boolean;
  isOwner: boolean;
}
