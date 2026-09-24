import { useCallback } from 'react';

export type HapticType = 'light' | 'medium' | 'heavy' | 'double' | 'success';

export function useHaptics(enabled: boolean) {
  const trigger = useCallback(
    (type: HapticType = 'light') => {
      if (!enabled || typeof navigator === 'undefined' || !navigator.vibrate) {
        return;
      }

      try {
        switch (type) {
          case 'light':
            navigator.vibrate(10);
            break;
          case 'medium':
            navigator.vibrate(25);
            break;
          case 'heavy':
            navigator.vibrate(45);
            break;
          case 'double':
            navigator.vibrate([20, 40, 20]);
            break;
          case 'success':
            navigator.vibrate([30, 60, 40, 60, 80]);
            break;
        }
      } catch {}
    },
    [enabled]
  );

  return { trigger };
}
