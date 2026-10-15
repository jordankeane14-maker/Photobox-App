/**
 * Synthesizes audio feedback using the Web Audio API without needing external sound files.
 */
class SoundEffects {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Short countdown beep for 3, 2, 1
   */
  playCountdownBeep(isFinal: boolean = false) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = isFinal ? 1320 : 880;
      const duration = isFinal ? 0.25 : 0.12;

      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio errors should be silently ignored in restricted environments
    }
  }

  /**
   * Shutter snap click and mechanical clack
   */
  playShutterSound() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Noise burst for mechanical shutter
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();

      // Secondary clack click
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(240, ctx.currentTime + 0.03);
      clickOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.09);

      clickGain.gain.setValueAtTime(0.25, ctx.currentTime + 0.03);
      clickGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);

      clickOsc.start(ctx.currentTime + 0.03);
      clickOsc.stop(ctx.currentTime + 0.09);
    } catch {
      // Audio errors silently ignored
    }
  }

  /**
   * Pleasant celebration chime when strip is complete
   */
  playChime() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch {
      // Silently ignore
    }
  }
}

export const sounds = new SoundEffects();
