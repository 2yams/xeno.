import React, { useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        aria-label="Install xeno. app"
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tracking-tight text-[var(--fg)] opacity-70 hover:opacity-100 bg-[var(--panel)] border border-[var(--border)] rounded-md transition-all active:scale-95"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Install</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          aria-label="Install on iOS"
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono tracking-tight text-[var(--fg)] opacity-70 hover:opacity-100 bg-[var(--panel)] border border-[var(--border)] rounded-md transition-all active:scale-95"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install</span>
        </button>

        {showIOSGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-xs p-5 rounded-xl bg-[var(--bg)] text-[var(--fg)] border border-[var(--border)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-mono text-sm tracking-wider uppercase opacity-80">
                Install on iPhone / iPad
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                1. Tap the <strong className="text-[var(--fg)]">Share</strong> button in the Safari
                toolbar.
                <br />
                2. Scroll down and tap{' '}
                <strong className="text-[var(--fg)]">Add to Home Screen</strong>.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 text-xs font-mono tracking-wider uppercase rounded-md bg-[var(--panel)] border border-[var(--border)] text-[var(--fg)] hover:opacity-80 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
