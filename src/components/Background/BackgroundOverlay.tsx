import React from 'react';
import { BackgroundImageSettings } from '../../types/theme';

interface BackgroundOverlayProps {
  settings: BackgroundImageSettings;
}

export const BackgroundOverlay: React.FC<BackgroundOverlayProps> = ({ settings }) => {
  const imageSrc = settings.dataUrl || settings.url;
  if (!imageSrc) return null;

  const fitClass =
    settings.fit === 'contain'
      ? 'object-contain'
      : settings.fit === 'center'
      ? 'object-none object-center'
      : 'object-cover';

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <img
        src={imageSrc}
        alt=""
        className={`w-full h-full ${fitClass} transition-opacity duration-700 select-none`}
        style={{
          opacity: settings.opacity,
          filter: `blur(${settings.blur}px) brightness(${settings.brightness})`,
          transform: 'scale(1.04)', // prevents blur white edge clipping
        }}
        loading="lazy"
        decoding="async"
      />
      {/* Dark overlay backdrop */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-700"
        style={{ opacity: settings.overlay }}
      />
    </div>
  );
};
