class MusicPlayer {
  private audio: HTMLAudioElement | null = null;
  private currentUrl = '';
  private currentVolume = 0.7;
  private isPlaying = false;
  private onStateChangeCallback: ((playing: boolean, error?: string) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'none';

      this.audio.addEventListener('play', () => {
        this.isPlaying = true;
        this.notify(true);
      });

      this.audio.addEventListener('pause', () => {
        this.isPlaying = false;
        this.notify(false);
      });

      this.audio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.notify(false);
      });

      this.audio.addEventListener('error', () => {
        this.isPlaying = false;
        let msg = 'Unable to play audio stream.';
        if (this.currentUrl.includes('spotify.com') || this.currentUrl.includes('youtube.com') || this.currentUrl.includes('youtu.be')) {
          msg = 'Spotify and YouTube require their native players and do not support direct web audio streaming. Use direct MP3/WAV/AAC stream URLs.';
        }
        this.notify(false, msg);
      });
    }
  }

  public setOnStateChange(cb: (playing: boolean, error?: string) => void): void {
    this.onStateChangeCallback = cb;
  }

  private notify(playing: boolean, error?: string): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(playing, error);
    }
  }

  public setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.currentVolume;
    }
  }

  public play(url: string, volume = this.currentVolume): Promise<void> {
    if (!this.audio) return Promise.resolve();
    this.currentVolume = Math.max(0, Math.min(1, volume));
    this.audio.volume = this.currentVolume;

    // Check for obvious non-streamable links
    if (url.includes('spotify.com') || url.includes('youtube.com') || url.includes('youtu.be')) {
      this.notify(
        false,
        'Spotify and YouTube do not permit direct audio embedding. Please provide a direct stream or MP3 URL.'
      );
      return Promise.reject(new Error('Streaming restricted by provider'));
    }

    if (this.currentUrl !== url) {
      this.currentUrl = url;
      this.audio.src = url;
      this.audio.load();
    }

    return this.audio.play().catch((err) => {
      this.notify(false, 'Playback failed or was blocked by browser autoplay policy.');
      throw err;
    });
  }

  public pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.isPlaying = false;
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const musicPlayer = new MusicPlayer();
