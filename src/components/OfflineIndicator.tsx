import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-3 right-3 z-40 flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-md bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] shadow-lg backdrop-blur-md">
      <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
      <span>Offline Mode</span>
    </div>
  );
};
