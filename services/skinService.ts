
import { UserProfile } from '../types';

export interface SkinValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  format?: 'modern' | 'legacy';
}

/**
 * Validates a Minecraft skin file according to Mojang standards.
 * Rules: PNG format, 64x64 (modern) or 64x32 (legacy) only.
 */
export const validateSkinFile = async (file: File): Promise<SkinValidationResult> => {
  if (file.type !== 'image/png') {
    return { valid: false, error: 'INVALID FORMAT: Only .png files are accepted.' };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const w = img.width;
        const h = img.height;
        
        const isModern = w === 64 && h === 64;
        const isLegacy = w === 64 && h === 32;

        if (isModern) {
          resolve({ valid: true, width: w, height: h, format: 'modern' });
        } else if (isLegacy) {
          resolve({ valid: true, width: w, height: h, format: 'legacy' });
        } else {
          // Reject HD skins (128x128, etc)
          resolve({ valid: false, error: `DIMENSION ERROR: ${w}x${h} detected. Only 64x64 or 64x32 supported.` });
        }
      };
      img.onerror = () => resolve({ valid: false, error: 'CORRUPTED: Failed to read image data.' });
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Simulates saving the skin to the local filesystem: .minecraft/skins/<username>.png
 */
export const saveSkinLocally = async (user: UserProfile, skinDataUrl: string): Promise<string> => {
  // In a real environment, this would call a backend or native API to write to Disk
  console.log(`[FileIO] Creating directory: .minecraft/skins/`);
  console.log(`[FileIO] Writing profile-bound skin: .minecraft/skins/${user.username}.png`);
  
  // Persist to simulated local storage (already handled by App state in this demo)
  return skinDataUrl;
};

/**
 * Fetches skin texture URL from Mojang API.
 */
export const fetchSkinByUsername = async (username: string): Promise<string> => {
  const skinUrl = `https://mc-heads.net/skin/${username}`;
  try {
    const response = await fetch(skinUrl);
    if (!response.ok) throw new Error('FETCH ERROR: Skin not found for this user.');
    return skinUrl;
  } catch (err) {
    throw new Error('NETWORK ERROR: Could not connect to Mojang API.');
  }
};
