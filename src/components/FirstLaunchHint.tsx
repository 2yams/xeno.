import React, { useState, useEffect } from 'react';
import { isFirstLaunchHintShown, markFirstLaunchHintShown } from '../services/storage';

export const FirstLaunchHint: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isFirstLaunchHintShown()) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        markFirstLaunchHintShown();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    markFirstLaunchHintShown();
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleDismiss}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-[var(--panel)] border border-[var(--border)] text-[var(--muted)] text-[11px] font-mono shadow-lg cursor-pointer transition-all hover:text-[var(--fg)] flex items-center gap-2 animate-fade-in"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-ping" />
      <span>Tap numbers to edit time &middot; Swipe to adjust</span>
    </div>
  );
};
