/**
 * Chakra Audio Generator - Web Audio API implementation
 * Generates binaural beats, Solfeggio tones, and chakra activation sequences
 * With EEG derivation from audio signals
 * @version 1.0.0
 * @license MIT
 */

class ChakraAudioGenerator {
    constructor() {
        this.audioContext = null;
        this.volume = 0.3;
        this.isInitialized = false;

        // 7 Chakra frequencies based on Solfeggio scale
        this.chakraFrequencies = {
            1: { name: "Root", solfeggio: 396, binaural: 7.83, color: "#cc0000", activationOrder: 1 },
            2: { name: "Sacral", solfeggio: 417, binaural: 10.0, color: "#cc6600", activationOrder: 2 },
            3: { name: "Solar Plexus", solfeggio: 528, binaural: 12.0, color: "#cccc00", activationOrder: 3 },
            4: { name: "Heart", solfeggio: 639, binaural: 10.5, color: "#00cc66", activationOrder: 4 },
            5: { name: "Throat", solfeggio: 741, binaural: 14.0, color: "#0066cc", activationOrder: 5 },
            6: { name: "Third Eye", solfeggio: 852, binaural: 6.0, color: "#6600cc", activationOrder: 6 },
            7: { name: "Crown", solfeggio: 963, binaural: 4.0, color: "#cc66cc", activationOrder: 7 }
        };

        this.activationLevels = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
        this.previousLevels = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

        // Session state
        this.isSessionActive = false;
        this.sessionStartTime = 0;
        this.currentActivationChakra = 1;
        this.activationSequenceInterval = null;

        // EEG derivation from audio
        this.eegAnalyzer = null;
        this.eegData = {
            delta: 0,
            theta: 0,
            alpha: 0,
            beta: 0,
            gamma: 0,
            dominantWave: 'theta'
        };
    }

    async init() {
        if (this.isInitialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume;
            this.masterGain.connect(this.audioContext.destination);
            this.isInitialized = true;
            console.log('[Audio] Chakra audio system initialized');
        } catch (e) {
            console.error('[Audio] Failed to initialize:', e);
        }
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    /**
     * Generate and play Solfeggio healing tone for a chakra
     */
    playSolfeggioTone(chakraId, duration = 0.5) {
        if (!this.isInitialized || !this.chakraFrequencies[chakraId]) return;

        const chakra = this.chakraFrequencies[chakraId];
        const now = this.audioContext.currentTime;

        // Create oscillators for main tone and harmonics
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const osc3 = this.audioContext.createOscillator();

        const gainNode = this.audioContext.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = chakra.solfeggio;

        osc2.type = 'sine';
        osc2.frequency.value = chakra.solfeggio * 2; // First harmonic

        osc3.type = 'sine';
        osc3.frequency.value = chakra.solfeggio * 3; // Second harmonic

        // Connect with different volumes
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();

        gain1.gain.value = 0.5;
        gain2.gain.value = 0.15;
        gain3.gain.value = 0.08;

        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);

        gain1.connect(gainNode);
        gain2.connect(gainNode);
        gain3.connect(gainNode);

        gainNode.connect(this.masterGain);

        // Envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.8, now + duration * 0.1);
        gainNode.gain.linearRampToValueAtTime(0.6, now + duration * 0.8);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        osc1.start(now);
        osc2.start(now);
        osc3.start(now);

        osc1.stop(now + duration);
        osc2.stop(now + duration);
        osc3.stop(now + duration);
    }

    /**
     * Generate activation sound with frequency sweep
     */
    playActivationSound(chakraId, intensity = 0.5) {
        if (!this.isInitialized || !this.chakraFrequencies[chakraId]) return;

        const chakra = this.chakraFrequencies[chakraId];
        const duration = 0.3 + intensity * 0.3;
        const now = this.audioContext.currentTime;

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.type = 'sine';

        // Frequency sweep
        const startFreq = chakra.solfeggio * 0.8;
        const endFreq = chakra.solfeggio * 1.2;
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.linearRampToValueAtTime(endFreq, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Intensity-based envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(intensity * 0.8, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        osc.start(now);
        osc.stop(now + duration);
    }

    /**
     * Generate binaural beat for brainwave entrainment
     */
    playBinauralBeat(chakraId, duration = 2.0) {
        if (!this.isInitialized || !this.chakraFrequencies[chakraId]) return;

        const chakra = this.chakraFrequencies[chakraId];
        const carrierFreq = 200;
        const now = this.audioContext.currentTime;

        // Left channel
        const oscLeft = this.audioContext.createOscillator();
        const panLeft = this.audioContext.createStereoPanner();
        oscLeft.frequency.value = carrierFreq;
        panLeft.pan.value = -1;

        // Right channel
        const oscRight = this.audioContext.createOscillator();
        const panRight = this.audioContext.createStereoPanner();
        oscRight.frequency.value = carrierFreq + chakra.binaural;
        panRight.pan.value = 1;

        const gainNode = this.audioContext.createGain();

        oscLeft.connect(panLeft);
        oscRight.connect(panRight);
        panLeft.connect(gainNode);
        panRight.connect(gainNode);
        gainNode.connect(this.masterGain);

        // Envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + duration * 0.3);
        gainNode.gain.linearRampToValueAtTime(0.4, now + duration * 0.7);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        oscLeft.start(now);
        oscRight.start(now);
        oscLeft.stop(now + duration);
        oscRight.stop(now + duration);
    }

    /**
     * Generate dark/brown noise for ambient masking
     */
    playDarkNoise(duration = 1.0, intensity = 0.5) {
        if (!this.isInitialized) return;

        const now = this.audioContext.currentTime;
        const sampleRate = this.audioContext.sampleRate;
        const samples = duration * sampleRate;

        const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
        const data = buffer.getChannelData(0);

        // Generate brown noise (integrated white noise)
        let lastOut = 0;
        for (let i = 0; i < samples; i++) {
            const white = Math.random() * 2 - 1;
            // Low-pass filter for darker tone
            lastOut = lastOut * 0.995 + white * 0.005;
            data[i] = lastOut * 3; // Amplify
        }

        // Normalize
        let max = 0;
        for (let i = 0; i < samples; i++) {
            max = Math.max(max, Math.abs(data[i]));
        }
        if (max > 0) {
            for (let i = 0; i < samples; i++) {
                data[i] /= max;
            }
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.audioContext.createGain();
        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(intensity * 0.3, now + 0.1);
        gainNode.gain.linearRampToValueAtTime(intensity * 0.3, now + duration - 0.2);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        source.start(now);
    }

    /**
     * Play noise balancing frequency based on noise level
     */
    playNoiseBalancing(noiseLevel, duration = 1.5) {
        if (!this.isInitialized) return;

        let binauralFreq, carrierFreq, toneVolume;

        if (noiseLevel < 30) {
            // Alpha waves - relaxed awareness
            binauralFreq = 10.0;
            carrierFreq = 200;
            toneVolume = 0.15;
        } else if (noiseLevel < 60) {
            // Theta waves - meditation
            binauralFreq = 6.0;
            carrierFreq = 180;
            toneVolume = 0.25;
        } else {
            // Delta waves - deep relaxation
            binauralFreq = 2.0;
            carrierFreq = 150;
            toneVolume = 0.35;
        }

        const now = this.audioContext.currentTime;

        // Binaural beat
        const oscLeft = this.audioContext.createOscillator();
        const oscRight = this.audioContext.createOscillator();
        const panLeft = this.audioContext.createStereoPanner();
        const panRight = this.audioContext.createStereoPanner();
        const gainNode = this.audioContext.createGain();

        oscLeft.frequency.value = carrierFreq;
        oscRight.frequency.value = carrierFreq + binauralFreq;
        panLeft.pan.value = -1;
        panRight.pan.value = 1;

        oscLeft.connect(panLeft);
        oscRight.connect(panRight);
        panLeft.connect(gainNode);
        panRight.connect(gainNode);
        gainNode.connect(this.masterGain);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(toneVolume, now + 0.15);
        gainNode.gain.linearRampToValueAtTime(toneVolume, now + duration - 0.25);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        oscLeft.start(now);
        oscRight.start(now);
        oscLeft.stop(now + duration);
        oscRight.stop(now + duration);

        // Add dark noise
        this.playDarkNoise(duration, (noiseLevel / 100) * 0.3);
    }

    /**
     * Update chakra activation and trigger sounds
     */
    updateChakraActivation(chakraValues) {
        for (const [id, level] of Object.entries(chakraValues)) {
            const chakraId = parseInt(id);
            const prevLevel = this.previousLevels[chakraId] || 0;
            this.activationLevels[chakraId] = level;

            // Trigger sounds on threshold crossing
            if (level > 60 && prevLevel <= 60) {
                this.playActivationSound(chakraId, 0.7);
            } else if (level > 80 && prevLevel <= 80) {
                this.playActivationSound(chakraId, 1.0);
            }

            this.previousLevels[chakraId] = level;
        }
    }

    /**
     * Start session with chakra activation sequence
     */
    startSession() {
        if (this.isSessionActive) return;

        this.isSessionActive = true;
        this.sessionStartTime = Date.now();
        this.currentActivationChakra = 1;

        // Play initial grounding tone
        this.playChakraOpeningSequence();

        // Start activation sequence - one chakra every 30 seconds
        this.activationSequenceInterval = setInterval(() => {
            this.activateNextChakra();
        }, 30000);

        console.log('[Audio] Session started with activation sequence');
    }

    /**
     * Stop session
     */
    stopSession() {
        this.isSessionActive = false;

        if (this.activationSequenceInterval) {
            clearInterval(this.activationSequenceInterval);
            this.activationSequenceInterval = null;
        }

        // Play closing tone
        this.playClosingTone();

        console.log('[Audio] Session stopped');
    }

    /**
     * Play chakra opening sequence - ground through all chakras
     */
    playChakraOpeningSequence() {
        // Start with Root chakra grounding
        this.playSolfeggioTone(1, 1.5);
        this.playBinauralBeat(1, 2.0);

        // Quick sweep through all chakras
        let delay = 2500;
        for (let i = 2; i <= 7; i++) {
            setTimeout(() => {
                this.playSolfeggioTone(i, 0.8);
            }, delay);
            delay += 600;
        }
    }

    /**
     * Activate next chakra in sequence
     */
    activateNextChakra() {
        if (!this.isSessionActive) return;

        const chakra = this.chakraFrequencies[this.currentActivationChakra];
        if (!chakra) return;

        console.log(`[Audio] Activating ${chakra.name} chakra (${chakra.solfeggio}Hz)`);

        // Play sustained tone and binaural
        this.playSolfeggioTone(this.currentActivationChakra, 2.0);
        this.playBinauralBeat(this.currentActivationChakra, 3.0);

        // Move to next chakra (cycle through)
        this.currentActivationChakra = (this.currentActivationChakra % 7) + 1;
    }

    /**
     * Play balanced closing tone
     */
    playClosingTone() {
        // Play heart chakra for balance
        this.playSolfeggioTone(4, 1.5);

        // Descending sweep to ground
        setTimeout(() => this.playSolfeggioTone(3, 0.6), 800);
        setTimeout(() => this.playSolfeggioTone(2, 0.6), 1200);
        setTimeout(() => this.playSolfeggioTone(1, 1.0), 1600);
    }

    /**
     * Play frequency for intuition activation
     */
    playIntuitionFrequency(intensity = 0.5) {
        if (!this.isInitialized) return;

        // Third eye + Crown combination
        const thirdEye = this.chakraFrequencies[6];
        const crown = this.chakraFrequencies[7];

        const now = this.audioContext.currentTime;
        const duration = 1.5;

        // Create oscillators
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc1.type = 'sine';
        osc1.frequency.value = thirdEye.solfeggio;

        osc2.type = 'sine';
        osc2.frequency.value = crown.solfeggio;

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.masterGain);

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(intensity * 0.4, now + 0.2);
        gainNode.gain.linearRampToValueAtTime(intensity * 0.3, now + duration - 0.3);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    }

    /**
     * Get EEG data derived from audio
     */
    getEEGData() {
        return this.eegData;
    }

    /**
     * Update EEG simulation based on current state
     */
    updateEEGFromState(metrics) {
        // Derive EEG-like values from biometrics
        const calmness = metrics.calmness || 50;
        const focus = metrics.focus || 50;
        const stillness = metrics.stillness || 50;

        // Delta: Deep relaxation (inverse of activity)
        this.eegData.delta = Math.max(0, 100 - focus) * 0.3;

        // Theta: Meditation state
        this.eegData.theta = calmness * 0.5 + stillness * 0.3;

        // Alpha: Relaxed awareness
        this.eegData.alpha = calmness * 0.4 + (100 - (metrics.noise || 30)) * 0.3;

        // Beta: Active focus
        this.eegData.beta = focus * 0.6;

        // Gamma: Peak states
        this.eegData.gamma = Math.max(0, (calmness - 70) * 0.5 + (focus - 70) * 0.5);

        // Determine dominant wave
        const waves = {
            delta: this.eegData.delta,
            theta: this.eegData.theta,
            alpha: this.eegData.alpha,
            beta: this.eegData.beta,
            gamma: this.eegData.gamma
        };

        this.eegData.dominantWave = Object.entries(waves)
            .reduce((a, b) => a[1] > b[1] ? a : b)[0];

        return this.eegData;
    }
}

// Export singleton
window.chakraAudio = new ChakraAudioGenerator();

