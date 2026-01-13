
import { YouTubeChannel, YouTubeBroadcast, YouTubeChatMessage } from '../types';

/**
 * YouTube Data API v3 Service - CityKing Studio
 */

export interface GoogleAccount {
  email: string;
  name: string;
  avatar: string;
}

export const getMockGoogleAccounts = (username: string): GoogleAccount[] => [
  { 
    email: `${username.toLowerCase()}@gmail.com`, 
    name: username, 
    avatar: `https://mc-heads.net/avatar/${username}/64` 
  },
  { 
    email: "cityking.studio@gmail.com", 
    name: "CityKing Official", 
    avatar: "https://cdn.discordapp.com/attachments/1383875664142401617/1451219928966369280/20251218_202925.png" 
  }
];

export const loginWithGoogle = async (account: GoogleAccount): Promise<{ channel: YouTubeChannel, token: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        token: `ya29.${Math.random().toString(36).substring(7)}`,
        channel: {
          id: `UC_${account.name.replace(/\s+/g, '_')}`,
          title: `${account.name} Gaming`,
          customUrl: `@${account.name.toLowerCase().replace(/\s+/g, '')}`,
          thumbnails: { default: { url: account.avatar } },
          statistics: { subscriberCount: (Math.floor(Math.random() * 50000) + 500).toString() }
        }
      });
    }, 1200);
  });
};

export const createLiveBroadcast = async (token: string, details: { title: string, desc: string, privacy: string }): Promise<YouTubeBroadcast> => {
  console.log('[YouTube] Creating broadcast on YouTube Data API v3...');
  return {
    id: `bc-${Math.random().toString(36).substr(2, 9)}`,
    title: details.title,
    description: details.desc,
    status: 'offline',
    privacyStatus: details.privacy as any,
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    streamKey: `ckst-xxxx-yyyy-zzzz-${Math.random().toString(36).substr(2, 4)}`,
    liveChatId: `chat-${Math.random().toString(36).substr(2, 9)}`,
    viewers: 0
  };
};

export const createYouTubeStream = async (title: string, desc: string, privacy: string): Promise<YouTubeBroadcast> => {
  return createLiveBroadcast('mock-token', { title, desc, privacy });
};

export const fetchChatMessages = async (chatId: string): Promise<YouTubeChatMessage[]> => {
  const authors = ['BlockMaster', 'CreepHunter', 'DiamondFinder', 'RedstonePro', 'KingBuilder'];
  const texts = ['Let\'s go CityKing!', 'Epic build today!', 'Show the redstone circuit', 'HYPE', 'Is this server public?', 'Legendary stream!'];
  
  return [
    {
      id: Math.random().toString(),
      authorName: authors[Math.floor(Math.random() * authors.length)],
      authorId: 'user-123',
      messageText: texts[Math.floor(Math.random() * texts.length)],
      publishedAt: new Date().toISOString(),
      isModerator: Math.random() > 0.9,
      isOwner: false
    }
  ];
};

export const fetchLiveChat = async (chatId: string): Promise<{id: string, author: string, message: string, time: number}[]> => {
  const messages = await fetchChatMessages(chatId);
  return messages.map(m => ({
    id: m.id,
    author: m.authorName,
    message: m.messageText,
    time: new Date(m.publishedAt).getTime()
  }));
};

export const sendChatMessage = async (chatId: string, message: string): Promise<void> => {
  console.log(`[YouTube] SENT message to ${chatId}: ${message}`);
};

export const deleteMessage = async (messageId: string) => {
  console.log(`[YouTube] DELETED message: ${messageId}`);
};

export const banUser = async (userId: string) => {
  console.log(`[YouTube] BANNED user: ${userId}`);
};
