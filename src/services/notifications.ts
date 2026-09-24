export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function sendTimerCompletedNotification(timerName = 'Timer'): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    const n = new Notification('xeno.', {
      body: `${timerName} completed.`,
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      tag: 'xeno-timer-done',
      silent: false,
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  } catch (e) {
    console.warn('[xeno.] Notification error:', e);
  }
}
