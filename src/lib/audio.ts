
class AlarmAudio {
  private audioCtx: AudioContext | null = null;
  private oscillator1: OscillatorNode | null = null;
  private oscillator2: OscillatorNode | null = null;
  private pulseGainNode: GainNode | null = null;
  private volumeGainNode: GainNode | null = null;
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

  start(volume: number = 10, isStorm: boolean = false) {
    this.init();
    if (!this.audioCtx || this.isPlaying) return;

    this.isPlaying = true;
    this.stop(); // Ensure everything is clean
    this.isPlaying = true;
    
    this.pulseGainNode = this.audioCtx.createGain();
    this.volumeGainNode = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    // Master volume
    const vol = volume / 100;
    this.volumeGainNode.gain.setValueAtTime(vol, now);

    if (isStorm) {
      // Harsh Duel Siren
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator2 = this.audioCtx.createOscillator();
      
      this.oscillator1.type = 'sawtooth';
      this.oscillator2.type = 'square';
      
      this.oscillator1.frequency.setValueAtTime(440, now);
      this.oscillator2.frequency.setValueAtTime(445, now);

      this.oscillator1.frequency.exponentialRampToValueAtTime(880, now + 0.5);
      this.oscillator1.frequency.exponentialRampToValueAtTime(440, now + 1.0);
      
      this.oscillator1.connect(this.pulseGainNode);
      this.oscillator2.connect(this.pulseGainNode);
      
      this.oscillator1.start();
      this.oscillator2.start();

      this.sweepInterval = setInterval(() => {
        if (!this.isPlaying || !this.oscillator1 || !this.audioCtx) return;
        const t = this.audioCtx.currentTime;
        this.oscillator1.frequency.exponentialRampToValueAtTime(880, t + 0.5);
        this.oscillator1.frequency.exponentialRampToValueAtTime(440, t + 1.0);
      }, 1000);

      this.pulseGainNode.gain.setValueAtTime(1, now);
    } else {
      // Refreshing Melody
      this.oscillator1 = this.audioCtx.createOscillator();
      this.oscillator1.type = 'triangle'; // Smooth but bright tone
      this.oscillator1.connect(this.pulseGainNode);
      this.oscillator1.start();

      this.pulseGainNode.gain.setValueAtTime(0, now);

      // A bright, bouncy major melody
      const notes = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.50, d: 0.30 }, // C6
        { f: 783.99, d: 0.15 }, // G5
        { f: 659.25, d: 0.30 }, // E5
      ];
      
      let currentTime = now;
      // loop the melody 150 times (plenty of time for an alarm)
      for (let cycle = 0; cycle < 150; cycle++) {
        for (let i = 0; i < notes.length; i++) {
          const note = notes[i];
          
          this.oscillator1.frequency.setValueAtTime(note.f, currentTime);
          this.pulseGainNode.gain.setValueAtTime(0, currentTime);
          this.pulseGainNode.gain.linearRampToValueAtTime(0.8, currentTime + 0.02);
          this.pulseGainNode.gain.exponentialRampToValueAtTime(0.001, currentTime + note.d - 0.01);
          
          currentTime += note.d;
        }
        currentTime += 0.5; // Pause between melody cycles
      }
    }

    this.pulseGainNode.connect(this.volumeGainNode);
    this.volumeGainNode.connect(this.audioCtx.destination);
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

    if (this.pulseGainNode) {
      this.pulseGainNode.disconnect();
      this.pulseGainNode = null;
    }
    if (this.volumeGainNode) {
      this.volumeGainNode.disconnect();
      this.volumeGainNode = null;
    }
  }

  setVolume(volume: number) {
    if (this.volumeGainNode && this.audioCtx) {
      const vol = volume / 100;
      this.volumeGainNode.gain.setTargetAtTime(vol, this.audioCtx.currentTime, 0.05);
    }
  }
}

export const alarmAudio = new AlarmAudio();
