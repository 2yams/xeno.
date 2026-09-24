import { CompletionSoundType } from '../../types/audio';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playSound(type: CompletionSoundType, volume = 0.8): void {
    if (type === 'silent') return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), now);
      masterGain.connect(ctx.destination);

      switch (type) {
        case 'soft-bell':
          this.playSoftBell(ctx, masterGain, now);
          break;
        case 'gentle-chime':
          this.playGentleChime(ctx, masterGain, now);
          break;
        case 'digital-beep':
          this.playDigitalBeep(ctx, masterGain, now);
          break;
        case 'soft-click':
          this.playSoftClick(ctx, masterGain, now);
          break;
        case 'minimal-tone':
          this.playMinimalTone(ctx, masterGain, now);
          break;
      }
    } catch (e) {
      console.warn('[xeno.] Audio playback warning:', e);
    }
  }

  private playSoftBell(ctx: AudioContext, dest: GainNode, now: number): void {
    // Multi-harmonic gentle bell chime (A5 ~ 880Hz with minor third overtone)
    const frequencies = [587.33, 880, 1174.66, 1760]; // D5, A5, D6, A6
    const gains = [0.6, 0.4, 0.25, 0.1];

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = gains[index];
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(amp, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + index * 0.2);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + 2.5);
    });
  }

  private playGentleChime(ctx: AudioContext, dest: GainNode, now: number): void {
    // Warm meditative singing bowl / Tibetan chime
    const baseFreq = 432; // 432 Hz warm resonance
    const freqs = [baseFreq, baseFreq * 1.5, baseFreq * 2.01, baseFreq * 2.76];
    const decays = [2.8, 2.2, 1.8, 1.2];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4 / (idx + 1), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[idx]);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now);
      osc.stop(now + decays[idx] + 0.1);
    });
  }

  private playDigitalBeep(ctx: AudioContext, dest: GainNode, now: number): void {
    // Crisp minimalist modern double-beep
    [0, 0.15].forEach((offset) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1046.5, now + offset); // C6

      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(0.3, now + offset + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.09);

      osc.connect(gain);
      gain.connect(dest);

      osc.start(now + offset);
      osc.stop(now + offset + 0.1);
    });
  }

  private playSoftClick(ctx: AudioContext, dest: GainNode, now: number): void {
    // Tactile minimal haptic click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  private playMinimalTone(ctx: AudioContext, dest: GainNode, now: number): void {
    // Pure warm low sine swell
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.4, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 1.3);
  }
}

export const soundSynthesizer = new SoundSynthesizer();
