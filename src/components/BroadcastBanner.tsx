import React, { useState, useEffect } from 'react';
import { Radio, X } from 'lucide-react';

export const BroadcastBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState(() => {
    return localStorage.getItem('nexus_site_announcement') || '';
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setAnnouncement(localStorage.getItem('nexus_site_announcement') || '');
      setDismissed(false);
    };

    window.addEventListener('nexus_announcement_updated', handleUpdate);
    return () => window.removeEventListener('nexus_announcement_updated', handleUpdate);
  }, []);

  if (!announcement || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black px-4 py-2 text-xs font-black flex items-center justify-between shadow-lg shadow-amber-500/10 z-[60] relative">
      <div className="flex items-center gap-2 max-w-4xl mx-auto truncate">
        <Radio className="w-4 h-4 shrink-0 animate-pulse" />
        <span className="truncate">{announcement}</span>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-black/10 rounded-full transition-colors cursor-pointer"
        title="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
