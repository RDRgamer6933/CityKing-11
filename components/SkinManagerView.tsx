
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { validateSkinFile, fetchSkinByUsername, saveSkinLocally } from '../services/skinService';

interface SkinManagerViewProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

const SkinManagerView: React.FC<SkinManagerViewProps> = ({ user, onUpdateUser }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.skinUrl || null);
  const [importUsername, setImportUsername] = useState('');
  const [modelType, setModelType] = useState<'classic' | 'slim'>(user.skinModel || 'classic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skinName, setSkinName] = useState<string | null>(user.skinUrl ? 'Active Bound Skin' : null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 2D Preview Rendering logic (Front View)
  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    if (!previewUrl) {
      ctx.clearRect(0, 0, 300, 450);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, 300, 450);
      ctx.imageSmoothingEnabled = false;

      // Scale factor (pixel size)
      const s = 10;
      const headX = 110;
      const headY = 20;
      const bodyY = 100;
      const legsY = 220;
      
      // 1. Head (8x8 at 8,8 in source)
      ctx.drawImage(img, 8, 8, 8, 8, headX, headY, 8 * s, 8 * s);
      
      // 2. Torso (8x12 at 20,20 in source)
      ctx.drawImage(img, 20, 20, 8, 12, headX, bodyY, 8 * s, 12 * s);
      
      const armW = modelType === 'slim' ? 3 : 4;
      const armOff = modelType === 'slim' ? 1 : 0;
      
      // 3. Right Arm (44,20 in source)
      ctx.drawImage(img, 44, 20, armW, 12, headX + 80, bodyY, armW * s, 12 * s);
      
      // 4. Left Arm (Mirrored for visualization)
      ctx.save();
      ctx.translate(headX, bodyY);
      ctx.scale(-1, 1);
      ctx.drawImage(img, 44, 20, armW, 12, 0, 0, armW * s, 12 * s);
      ctx.restore();

      // 5. Legs (4,20 in source)
      // Left Leg
      ctx.drawImage(img, 4, 20, 4, 12, headX, legsY, 4 * s, 12 * s);
      // Right Leg
      ctx.drawImage(img, 4, 20, 4, 12, headX + 40, legsY, 4 * s, 12 * s);
    };
    img.onerror = () => {
      setError('PREVIEW ERROR: Resource failed to load.');
    };
    img.src = previewUrl;
  }, [previewUrl, modelType]);

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);
    
    // Skin Validation
    const validation = await validateSkinFile(file);
    if (!validation.valid) {
      setError(validation.error || 'INVALID SKIN FILE');
      setIsProcessing(false);
      // Reset input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Update preview instantly
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewUrl(dataUrl);
      setSelectedFile(file);
      setSkinName(file.name);
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyAndBind = async () => {
    if (!previewUrl) return;
    
    setIsProcessing(true);
    try {
      // Save to simulated .minecraft/skins/ path
      const savedPath = await saveSkinLocally(user, previewUrl);
      
      // Bind skin to profile
      onUpdateUser({ skinUrl: savedPath, skinModel: modelType });
      setSelectedFile(null);
      setError(null);
      alert(`SUCCESS: Skin successfully bound and persistent for profile: ${user.username}`);
    } catch (err) {
      setError('WRITE ERROR: Could not bind skin to profile.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMojangSync = async () => {
    if (!importUsername.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const url = await fetchSkinByUsername(importUsername.trim());
      setPreviewUrl(url);
      setSkinName(`${importUsername}_mojang.png`);
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black mb-1">Skin Manager</h2>
          <p className="text-zinc-500">Configure visual identity and profile texture mapping.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            disabled={!previewUrl || isProcessing}
            onClick={handleApplyAndBind}
            className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:opacity-50 text-white font-black rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-3"
          >
            {isProcessing ? 'PROCESSING...' : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                APPLY & BIND SKIN
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        {/* Left: Preview & Status */}
        <div className="col-span-12 lg:col-span-5 glass-panel rounded-3xl p-8 flex flex-col items-center bg-zinc-900/40 border-zinc-800 relative overflow-hidden">
           <p className="absolute top-6 left-8 text-[10px] font-black text-zinc-600 uppercase tracking-widest">Preview Mode: 2D Front</p>
           
           <div className="flex-1 w-full flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                width={300} 
                height={380} 
                className="pixelated drop-shadow-[0_20px_60px_rgba(79,70,229,0.3)]" 
              />
              {!previewUrl && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 text-zinc-800">
                   <div className="w-24 h-24 rounded-full border-4 border-dashed border-zinc-800 flex items-center justify-center">
                      <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                   </div>
                   <span className="font-black text-xs uppercase tracking-widest opacity-30">Import required to preview</span>
                </div>
              )}
           </div>

           <div className="mt-6 text-center w-full bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/50">
              {skinName ? (
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Active State</p>
                   <p className="text-sm font-bold text-zinc-200">
                      Skin loaded: <span className="text-indigo-300">{skinName}</span>
                   </p>
                </div>
              ) : (
                <p className="text-sm font-bold text-zinc-600">No profile skin active</p>
              )}
           </div>
        </div>

        {/* Right: Actions */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-1">
           {/* Section: Import Action */}
           <section className="glass-panel rounded-3xl p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                 <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Import Controller</h3>
                 <span className="text-[10px] font-bold text-zinc-600">64x64 or 64x32 PNG</span>
              </div>
              
              <div className="space-y-6">
                 <div>
                    <button 
                      onClick={handleImportButtonClick}
                      className="w-full flex items-center justify-center gap-4 px-6 py-10 bg-zinc-950/50 border-2 border-dashed border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl transition-all group active:scale-[0.99]"
                    >
                      <div className="w-14 h-14 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 group-hover:bg-indigo-400/10 transition-all">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <p className="text-xl font-black text-zinc-300 group-hover:text-white transition-colors">Import Skin</p>
                        <p className="text-xs text-zinc-500 font-medium">Click to select local .png file</p>
                      </div>
                    </button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/png" 
                      onChange={handleFileChange} 
                    />
                 </div>

                 <div className="relative flex items-center">
                    <div className="flex-grow border-t border-zinc-800"></div>
                    <span className="flex-shrink mx-6 text-[10px] font-black text-zinc-700 uppercase tracking-widest">or sync from mojang</span>
                    <div className="flex-grow border-t border-zinc-800"></div>
                 </div>

                 <div className="flex gap-3">
                    <div className="flex-1 relative group">
                       <input 
                        type="text"
                        placeholder="Fetch by Minecraft Username..."
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-5 py-4 outline-none focus:border-indigo-500/50 transition-colors text-sm font-medium placeholder:text-zinc-600"
                        value={importUsername}
                        onChange={(e) => setImportUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleMojangSync()}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity">
                         <span className="text-[10px] font-black text-zinc-600 border border-zinc-800 rounded px-1.5 py-0.5">ENTER</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleMojangSync}
                      disabled={isProcessing || !importUsername.trim()}
                      className="px-8 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all shadow-lg active:scale-95"
                    >
                      SYNC
                    </button>
                 </div>
              </div>
           </section>

           {error && (
             <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
               <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
               </div>
               <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Error Detected</p>
                  <p className="text-sm font-bold text-red-400">{error}</p>
               </div>
             </div>
           )}

           {/* Profile Context Selection */}
           <section className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 bg-indigo-500/[0.02]">
              <div className="flex items-center gap-4 shrink-0">
                 <div className="relative">
                    <img src={`https://mc-heads.net/avatar/${user.username}/64`} className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800" alt="" />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-zinc-950"></div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Target Profile</p>
                    <p className="text-xl font-black text-white">{user.username}</p>
                    <p className="text-xs text-zinc-600 font-medium">Bound to {user.loginType.toLowerCase()} auth</p>
                 </div>
              </div>
              
              <div className="flex-1 w-full grid grid-cols-2 gap-4">
                 <button 
                  onClick={() => setModelType('classic')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${modelType === 'classic' ? 'bg-indigo-600/10 border-indigo-600/50 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                 >
                   <span className="text-xs font-black uppercase tracking-widest mb-1">Classic</span>
                   <span className="text-[10px] font-medium opacity-60">4px arms (Steve)</span>
                 </button>
                 <button 
                  onClick={() => setModelType('slim')}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${modelType === 'slim' ? 'bg-indigo-600/10 border-indigo-600/50 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                 >
                   <span className="text-xs font-black uppercase tracking-widest mb-1">Slim</span>
                   <span className="text-[10px] font-medium opacity-60">3px arms (Alex)</span>
                 </button>
              </div>
           </section>

           <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                 </svg>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">
                PrismForge enforces strict validation on skin textures to prevent client-side crashes. Profile binding is persistent across launcher sessions via encrypted <code>profiles.json</code>.
              </p>
           </div>
        </div>
      </div>
      
      <style>{`
        .pixelated { image-rendering: pixelated; }
      `}</style>
    </div>
  );
};

export default SkinManagerView;
