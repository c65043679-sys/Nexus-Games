import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { User as UserIcon, Save, Palette, Bell, Shield, Laptop, Zap, Heart, CheckCircle2 } from 'lucide-react';

const THEME_COLORS = [
  { name: 'Default Violet', value: '#7c3aed' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Amber', value: '#d97706' },
  { name: 'Sky', value: '#0284c7' },
  { name: 'Fuchsia', value: '#c026d3' },
];

export const Settings: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [nickname, setNickname] = useState('');
  const [themeColor, setThemeColor] = useState('#7c3aed');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || profile.displayName || '');
      setThemeColor(profile.themeColor || '#7c3aed');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({
        nickname,
        themeColor,
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      console.error(err);
      setMessage(`Error: ${err.message || 'Updating profile failed'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-slate-400">Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-black text-white mb-2">Command Center</h1>
        <p className="text-slate-400">Customize your Nexus experience and profile preferences.</p>
      </header>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.includes('Error') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-bold">{message}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Settings */}
        <section className="md:col-span-2 space-y-6">
          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <UserIcon className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Identity</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Public Profile Info</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Nexus Nickname</label>
                <input 
                  type="text" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  placeholder="Enter your handle..."
                />
                <p className="text-[10px] text-slate-500 mt-2 font-medium italic">This name will be visible to other players on leaderboards.</p>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-bold text-slate-400 mb-4">Core UI Hue</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setThemeColor(color.value)}
                      className={`h-12 rounded-xl transition-all border-2 flex items-center justify-center ${
                        themeColor === color.value 
                          ? 'border-white scale-105 shadow-lg' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {themeColor === color.value && <div className="w-2 h-2 bg-white rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-8 rounded-3xl border border-white/10 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <Zap className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Performance</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Optimization & Visuals</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Interface Animations</p>
                  <p className="text-xs text-slate-500">Enable smooth UI transitions and mesh gradients.</p>
                </div>
                <div className="w-12 h-6 bg-violet-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-md" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-white">Auto-Play Games</p>
                  <p className="text-xs text-slate-500">Automatically load game scripts on navigation.</p>
                </div>
                <div className="w-12 h-6 bg-slate-800 rounded-full relative cursor-pointer opacity-50">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-slate-600 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Sidebar */}
        <aside className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
             <h3 className="font-bold text-white mb-4 flex items-center gap-2">
               <Shield className="w-4 h-4 text-emerald-400" />
               Account Status
             </h3>
             <ul className="space-y-4">
               <li className="flex items-center justify-between">
                 <span className="text-xs text-slate-500">Clearance</span>
                 <span className="text-xs font-bold text-violet-400 px-2 py-0.5 bg-violet-400/10 rounded">LEVEL 1</span>
               </li>
               <li className="flex items-center justify-between">
                 <span className="text-xs text-slate-500">Games Saved</span>
                 <span className="text-xs font-bold text-white">{profile?.favorites?.length || 0}</span>
               </li>
               <li className="flex items-center justify-between">
                 <span className="text-xs text-slate-500">Sector</span>
                 <span className="text-xs font-bold text-white">EARTH-Prime</span>
               </li>
             </ul>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-3">
             <button
               onClick={handleSave}
               disabled={isSaving}
               className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-500 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-emerald-900/40"
             >
               <Save className={`w-5 h-5 ${isSaving ? 'animate-spin' : ''}`} />
               {isSaving ? 'Saving Changes...' : 'Save Profile'}
             </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
