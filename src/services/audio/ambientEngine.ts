import { WhiteNoiseType } from '../../types/audio';

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentType: WhiteNoiseType = 'brown';
  private currentVolume = 0.35;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private intervalIds: number[] = [];

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

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentType(): WhiteNoiseType {
    return this.currentType;
  }

  public getCurrentVolume(): number {
    return this.currentVolume;
  }

  public setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
  }

  public play(type: WhiteNoiseType = this.currentType, volume: number = this.currentVolume): void {
    const ctx = this.getContext();
    if (!ctx) return;

    this.stop();
    this.currentType = type;
    this.currentVolume = Math.max(0, Math.min(1, volume));

    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, ctx.currentTime);
    this.masterGain.gain.linearRampToValueAtTime(this.currentVolume, ctx.currentTime + 0.4);
    this.masterGain.connect(ctx.destination);

    this.isPlaying = true;

    switch (type) {
      case 'white':
        this.startWhiteNoise(ctx, this.masterGain);
        break;
      case 'pink':
        this.startPinkNoise(ctx, this.masterGain);
        break;
      case 'brown':
        this.startBrownNoise(ctx, this.masterGain);
        break;
      case 'rain':
        this.startRain(ctx, this.masterGain);
        break;
      case 'fan':
        this.startFan(ctx, this.masterGain);
        break;
      case 'fireplace':
        this.startFireplace(ctx, this.masterGain);
        break;
      case 'ocean':
        this.startOcean(ctx, this.masterGain);
        break;
      case 'cafe':
        this.startCafe(ctx, this.masterGain);
        break;
      case 'forest':
        this.startForest(ctx, this.masterGain);
        break;
    }
  }

  public stop(): void {
    if (!this.isPlaying && this.activeNodes.length === 0) return;

    this.intervalIds.forEach((id) => window.clearInterval(id));
    this.intervalIds = [];

    if (this.ctx && this.masterGain) {
      try {
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
      } catch {}
    }

    setTimeout(() => {
      this.activeNodes.forEach((n) => {
        try {
          if (n.stop) n.stop();
          if (n.disconnect) n.disconnect();
        } catch {}
      });
      this.activeNodes = [];
      this.masterGain = null;
      this.isPlaying = false;
    }, 120);
  }

  public fadeOut(durationSeconds = 15, onComplete?: () => void): void {
    if (!this.isPlaying || !this.masterGain || !this.ctx) {
      this.stop();
      onComplete?.();
      return;
    }

    const now = this.ctx.currentTime;
    const dur = Math.max(1, durationSeconds);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + dur);

    setTimeout(() => {
      this.stop();
      onComplete?.();
    }, dur * 1000);
  }

  // --- Procedural Noise Generators ---

  private createNoiseBuffer(ctx: AudioContext, type: 'white' | 'pink' | 'brown', duration = 5): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'pink') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }
    }

    return buffer;
  }

  private startWhiteNoise(ctx: AudioContext, dest: GainNode): void {
    const buf = this.createNoiseBuffer(ctx, 'white');
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 8000;

    src.connect(filter);
    filter.connect(dest);
    src.start(0);

    this.activeNodes.push(src, filter);
  }

  private startPinkNoise(ctx: AudioContext, dest: GainNode): void {
    const buf = this.createNoiseBuffer(ctx, 'pink');
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    src.connect(dest);
    src.start(0);
    this.activeNodes.push(src);
  }

  private startBrownNoise(ctx: AudioContext, dest: GainNode): void {
    const buf = this.createNoiseBuffer(ctx, 'brown');
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 500; // Warm deep focus rumble

    src.connect(filter);
    filter.connect(dest);
    src.start(0);
    this.activeNodes.push(src, filter);
  }

  private startRain(ctx: AudioContext, dest: GainNode): void {
    // Continuous filtered pink rain + subtle dynamic highpass crackle
    const pinkBuf = this.createNoiseBuffer(ctx, 'pink', 4);
    const pinkSrc = ctx.createBufferSource();
    pinkSrc.buffer = pinkBuf;
    pinkSrc.loop = true;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1800;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 350;

    pinkSrc.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(dest);
    pinkSrc.start(0);

    this.activeNodes.push(pinkSrc, lowpass, highpass);
  }

  private startFan(ctx: AudioContext, dest: GainNode): void {
    // Dual low droning tones (120Hz & 60Hz) + lowpass noise + subtle amplitude modulation
    const brownBuf = this.createNoiseBuffer(ctx, 'brown', 4);
    const noise = ctx.createBufferSource();
    noise.buffer = brownBuf;
    noise.loop = true;

    const hum = ctx.createOscillator();
    hum.type = 'sine';
    hum.frequency.value = 115;
    const humGain = ctx.createGain();
    humGain.gain.value = 0.15;

    // Amplitude modulation for fan blades
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 4.2; // 4.2 rotations/sec
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.08;

    const fanGain = ctx.createGain();
    fanGain.gain.value = 0.8;

    lfo.connect(fanGain.gain);
    noise.connect(fanGain);
    hum.connect(humGain);
    humGain.connect(dest);
    fanGain.connect(dest);

    noise.start(0);
    hum.start(0);
    lfo.start(0);

    this.activeNodes.push(noise, hum, lfo, humGain, lfoGain, fanGain);
  }

  private startFireplace(ctx: AudioContext, dest: GainNode): void {
    // Warm low-frequency hearth rumble + procedural crackling impulses
    const brownBuf = this.createNoiseBuffer(ctx, 'brown', 4);
    const rumble = ctx.createBufferSource();
    rumble.buffer = brownBuf;
    rumble.loop = true;

    const rumbleFilter = ctx.createBiquadFilter();
    rumbleFilter.type = 'lowpass';
    rumbleFilter.frequency.value = 300;

    rumble.connect(rumbleFilter);
    rumbleFilter.connect(dest);
    rumble.start(0);

    // Dynamic crackle pops
    const intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      if (Math.random() < 0.6) {
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(800 + Math.random() * 1400, now);
          gain.gain.setValueAtTime(0.04 + Math.random() * 0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.02);
        } catch {}
      }
    }, 180);

    this.intervalIds.push(intervalId);
    this.activeNodes.push(rumble, rumbleFilter);
  }

  private startOcean(ctx: AudioContext, dest: GainNode): void {
    // Ocean surf: deep noise with an ultra-slow swept filter and volume swelling every 7 seconds
    const brownBuf = this.createNoiseBuffer(ctx, 'brown', 6);
    const noise = ctx.createBufferSource();
    noise.buffer = brownBuf;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const waveLfo = ctx.createOscillator();
    waveLfo.type = 'sine';
    waveLfo.frequency.value = 0.12; // ~8 sec ocean wave period

    const lfoFilterGain = ctx.createGain();
    lfoFilterGain.gain.value = 350; // Sweeps filter cutoff between 250Hz and 750Hz

    waveLfo.connect(lfoFilterGain);
    lfoFilterGain.connect(filter.frequency);

    noise.connect(filter);
    filter.connect(dest);

    noise.start(0);
    waveLfo.start(0);

    this.activeNodes.push(noise, filter, waveLfo, lfoFilterGain);
  }

  private startCafe(ctx: AudioContext, dest: GainNode): void {
    // Café ambience: warm low-mid conversational murmur + occasional distant gentle ceramic clink
    const pinkBuf = this.createNoiseBuffer(ctx, 'pink', 5);
    const murmur = ctx.createBufferSource();
    murmur.buffer = pinkBuf;
    murmur.loop = true;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 450;
    bandpass.Q.value = 1.2;

    murmur.connect(bandpass);
    bandpass.connect(dest);
    murmur.start(0);

    // Random porcelain/cup chimes
    const intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      if (Math.random() < 0.25) {
        try {
          const now = this.ctx.currentTime;
          const chime = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          chime.type = 'sine';
          chime.frequency.setValueAtTime(2400 + Math.random() * 800, now);
          gain.gain.setValueAtTime(0.015, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

          chime.connect(gain);
          gain.connect(dest);
          chime.start(now);
          chime.stop(now + 0.16);
        } catch {}
      }
    }, 1200);

    this.intervalIds.push(intervalId);
    this.activeNodes.push(murmur, bandpass);
  }

  private startForest(ctx: AudioContext, dest: GainNode): void {
    // Forest: soft breeze pink noise + occasional gentle algorithmic birdsong tweet
    const pinkBuf = this.createNoiseBuffer(ctx, 'pink', 5);
    const breeze = ctx.createBufferSource();
    breeze.buffer = pinkBuf;
    breeze.loop = true;

    const breezeFilter = ctx.createBiquadFilter();
    breezeFilter.type = 'lowpass';
    breezeFilter.frequency.value = 600;

    breeze.connect(breezeFilter);
    breezeFilter.connect(dest);
    breeze.start(0);

    // Algorithmic delicate chirps
    const intervalId = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      if (Math.random() < 0.35) {
        try {
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          const f0 = 2800 + Math.random() * 800;
          osc.frequency.setValueAtTime(f0, now);
          osc.frequency.linearRampToValueAtTime(f0 + 600, now + 0.05);
          osc.frequency.linearRampToValueAtTime(f0 + 200, now + 0.12);

          gain.gain.setValueAtTime(0.02, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

          osc.connect(gain);
          gain.connect(dest);
          osc.start(now);
          osc.stop(now + 0.16);
        } catch {}
      }
    }, 2000);

    this.intervalIds.push(intervalId);
    this.activeNodes.push(breeze, breezeFilter);
  }
}

export const ambientEngine = new AmbientEngine();
