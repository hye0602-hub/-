
class AlarmAudio {
  private audioCtx: AudioContext | null = null;
  private oscillator1: OscillatorNode | null = null;
  private oscillator2: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private sweepInterval: any = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  start(volume: number = 85, isStorm: boolean = false) {
    this.init();
    if (!this.audioCtx || this.isPlaying) return;

    this.isPlaying = true;
    this.stop(); // Ensure everything is clean
    this.isPlaying = true;
    
    this.gainNode = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    if (isStorm) {
      // Harsh Duel Siren
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator2 = this.audioCtx.createOscillator();
      
      this.oscillator1.type = 'sawtooth';
      this.oscillator2.type = 'square';
      
      this.oscillator1.frequency.setValueAtTime(440, now);
      this.oscillator2.frequency.setValueAtTime(445, now); // Slight detune

      // Siren sweep
      this.oscillator1.frequency.exponentialRampToValueAtTime(880, now + 0.5);
      this.oscillator1.frequency.exponentialRampToValueAtTime(440, now + 1.0);
      
      this.oscillator1.connect(this.gainNode);
      this.oscillator2.connect(this.gainNode);
      
      this.oscillator1.start();
      this.oscillator2.start();

      // Repeat sweep
      this.sweepInterval = setInterval(() => {
        if (!this.isPlaying || !this.oscillator1 || !this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        this.oscillator1.frequency.exponentialRampToValueAtTime(880, t + 0.5);
        this.oscillator1.frequency.exponentialRampToValueAtTime(440, t + 1.0);
      }, 1000);

    } else {
      // Gentler Beep
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator1.type = 'sine';
      this.oscillator1.frequency.setValueAtTime(523.25, now); // C5
      
      this.oscillator1.connect(this.gainNode);
      this.oscillator1.start();
    }

    // Volume handling
    const vol = volume / 100;
    this.gainNode.gain.setValueAtTime(0, now);
    
    if (isStorm) {
        this.gainNode.gain.linearRampToValueAtTime(vol, now + 0.1);
    } else {
        // Pulsing beeps for normal
        const interval = 0.5;
        for (let i = 0; i < 1000; i++) {
            const startTime = now + (i * interval * 2);
            const stopTime = startTime + interval;
            this.gainNode.gain.setValueAtTime(vol, startTime);
            this.gainNode.gain.exponentialRampToValueAtTime(0.001, stopTime);
        }
    }

    this.gainNode.connect(this.audioCtx.destination);
  }

  stop() {
    this.isPlaying = false;
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
    [this.oscillator1, this.oscillator2].forEach(osc => {
      if (osc) {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {}
      }
    });
    this.oscillator1 = null;
    this.oscillator2 = null;

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }
}

export const alarmAudio = new AlarmAudio();
