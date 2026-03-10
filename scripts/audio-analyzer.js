/**
 * Audio Analyzer - Ultra-Sensitive Paranormal & Aura Detection
 * Based on Shiva Tattva - The 36 Principles of Reality
 *
 * Features:
 * - Ghost/Spirit frequency detection (EVP ranges)
 * - Aura field sensing and classification
 * - Infrasonic anomaly detection
 * - Schumann resonance (7.83Hz) Earth frequency
 * - Presence detection and counting
 * - Environmental energy mapping
 *
 * @version 1.0.0
 * @license MIT
 */

class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isInitialized = false;
        this.isActive = false;

        // High-resolution FFT
        this.fftSize = 8192;
        this.frequencyData = null;
        this.timeDomainData = null;

        // Core metrics
        this.metrics = {
            noiseLevel: 0,
            nearbyIntuition: 0,
            dominantFrequency: 0,
            bassLevel: 0,
            midLevel: 0,
            highLevel: 0,
            eegState: 'UNKNOWN',
            // Shiva Tattva
            shivaTattva: 0,
            shaktiTattva: 0,
            mayaTattva: 0,
            prakrtiEnergy: 0,
            tanmatraBalance: 0,
            subtleEnergy: 0,
            presenceDetection: 0,
            environmentalAnomaly: 0,
            psychicResonance: 0
        };

        // Ghost/Paranormal detection
        this.ghostMetrics = {
            evpActivity: 0,           // Electronic Voice Phenomena
            spiritBoxHits: 0,         // Spirit box frequency hits
            infrasoundAnomaly: 0,     // Below 20Hz anomalies
            emfSimulation: 0,         // EMF-like patterns
            whitNoisePatterns: 0,     // Patterns in white noise
            ghostFrequencyLevel: 0,   // Overall ghost activity
            lastDetectionTime: 0,
            detectionCount: 0,
            activeEntities: 0
        };

        // Aura detection system
        this.auraSystem = {
            detectedAuras: [],
            auraCount: 0,
            dominantAuraType: 'NONE',
            auraStrength: 0,
            auraColors: {
                RED: 0,      // Physical, grounded
                ORANGE: 0,   // Creative, emotional
                YELLOW: 0,   // Intellectual, confident
                GREEN: 0,    // Healing, compassionate
                BLUE: 0,     // Calm, communicative
                INDIGO: 0,   // Intuitive, perceptive
                VIOLET: 0,   // Spiritual, enlightened
                WHITE: 0,    // Pure, transcendent
                BLACK: 0     // Protective, absorbing
            },
            nearbyPresences: []
        };

        // Ghost frequency ranges (Hz)
        this.ghostFrequencies = {
            evpLow: { min: 250, max: 400 },      // EVP low range
            evpMid: { min: 1000, max: 4000 },    // EVP vocal range
            evpHigh: { min: 4000, max: 8000 },   // EVP high range
            infrasound: { min: 0, max: 20 },     // Infrasonic
            spiritBox: { min: 80, max: 120 },    // Spirit box sweep
            paranormal: { min: 18, max: 19 }     // 18.98Hz "fear frequency"
        };

        // EEG bands
        this.eegBands = {
            delta: { min: 0.5, max: 4, value: 0 },
            theta: { min: 4, max: 8, value: 0 },
            alpha: { min: 8, max: 13, value: 0 },
            beta: { min: 13, max: 30, value: 0 },
            gamma: { min: 30, max: 100, value: 0 }
        };

        // Detection history
        this.infrasonicData = { level: 0, pattern: [], anomalyScore: 0 };
        this.noiseBaseline = null;
        this.baselineSamples = [];
        this.isCalibrating = true;
        this.calibrationFrames = 90;
        this.patternHistory = [];
        this.maxPatternHistory = 300;
        this.anomalyThreshold = 2.0;
        this.smoothingFactor = 0.12;
        this.previousMetrics = { ...this.metrics };

        // Schumann resonance
        this.schumannResonance = 0;
        this.schumannHistory = [];

        // Ghost detection history
        this.ghostHistory = [];
        this.maxGhostHistory = 180; // 3 seconds

        // Noise type classification
        this.noiseTypes = [];
        this.detectedNoiseList = [];

        // Decision making (Yes/No)
        this.decisionSystem = {
            answer: 'NEUTRAL',
            confidence: 0,
            yesEnergy: 50,
            noEnergy: 50,
            history: [],
            lastUpdate: 0
        };

        // Canvas refs
        this.spectrumCanvas = null;
        this.spectrumCtx = null;
        this.eegCanvas = null;
        this.eegCtx = null;
        this.eegHistory = [];
        this.maxEegHistory = 100;
    }

    async init() {
        if (this.isInitialized) return true;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 48000,
                latencyHint: 'interactive'
            });

            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = 0.5;
            this.analyser.minDecibels = -100;
            this.analyser.maxDecibels = -10;

            this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeDomainData = new Uint8Array(this.analyser.fftSize);

            this.spectrumCanvas = document.getElementById('spectrum-canvas');
            if (this.spectrumCanvas) this.spectrumCtx = this.spectrumCanvas.getContext('2d');

            this.eegCanvas = document.getElementById('eeg-canvas');
            if (this.eegCanvas) this.eegCtx = this.eegCanvas.getContext('2d');

            this.isInitialized = true;
            console.log('[AudioAnalyzer] Ghost/Aura detection initialized');
            return true;
        } catch (e) {
            console.error('[AudioAnalyzer] Init failed:', e);
            return false;
        }
    }

    async startMicrophone(deviceId = null) {
        if (!this.isInitialized) await this.init();
        try {
            const constraints = {
                audio: {
                    deviceId: deviceId ? { exact: deviceId } : undefined,
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    channelCount: 2,
                    sampleRate: 48000
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.microphone = this.audioContext.createMediaStreamSource(stream);

            // Amplification chain for subtle detection
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 4.0; // 4x amplification

            this.compressor = this.audioContext.createDynamicsCompressor();
            this.compressor.threshold.value = -70;
            this.compressor.knee.value = 40;
            this.compressor.ratio.value = 2;
            this.compressor.attack.value = 0;
            this.compressor.release.value = 0.1;

            this.microphone.connect(this.gainNode);
            this.gainNode.connect(this.compressor);
            this.compressor.connect(this.analyser);

            if (this.audioContext.state === 'suspended') await this.audioContext.resume();

            this.isActive = true;
            this.isCalibrating = true;
            this.baselineSamples = [];
            this.startAnalysis();

            console.log('[AudioAnalyzer] Microphone active - Ghost/Aura detection enabled');
            return true;
        } catch (e) {
            console.error('[AudioAnalyzer] Microphone error:', e);
            return false;
        }
    }

    stopMicrophone() {
        this.isActive = false;
        if (this.microphone) {
            this.microphone.disconnect();
            this.microphone = null;
        }
    }

    startAnalysis() {
        if (!this.isActive) return;

        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.timeDomainData);

        this.analyzeFrequencies();
        this.detectGhostFrequencies();
        this.detectAuras();
        this.detectInfrasonic();
        this.detectSchumannResonance();
        this.analyzePatterns();
        this.calculateShivaTattva();
        this.calculateEEGBands();
        this.detectAnomalies();
        this.countNearbyPresences();
        this.determineEEGState();
        this.smoothMetrics();
        this.drawSpectrum();
        this.drawEEGMap();

        requestAnimationFrame(() => this.startAnalysis());
    }

    analyzeFrequencies() {
        const binCount = this.analyser.frequencyBinCount;
        const binWidth = this.audioContext.sampleRate / this.fftSize;

        let bassSum = 0, bassCount = 0;
        let midSum = 0, midCount = 0;
        let highSum = 0, highCount = 0;
        let subBassSum = 0, subBassCount = 0;
        let ultraLowSum = 0, ultraLowCount = 0;
        let totalSum = 0, maxValue = 0, maxIndex = 0;

        for (let i = 0; i < binCount; i++) {
            const value = this.frequencyData[i];
            const freq = i * binWidth;
            totalSum += value;

            if (value > maxValue) { maxValue = value; maxIndex = i; }

            if (freq < 20) { ultraLowSum += value; ultraLowCount++; }
            else if (freq < 60) { subBassSum += value; subBassCount++; }
            else if (freq < 250) { bassSum += value; bassCount++; }
            else if (freq < 2000) { midSum += value; midCount++; }
            else { highSum += value; highCount++; }
        }

        const bassAvg = bassCount > 0 ? bassSum / bassCount : 0;
        const midAvg = midCount > 0 ? midSum / midCount : 0;
        const highAvg = highCount > 0 ? highSum / highCount : 0;
        const subBassAvg = subBassCount > 0 ? subBassSum / subBassCount : 0;
        const ultraLowAvg = ultraLowCount > 0 ? ultraLowSum / ultraLowCount : 0;
        const totalAvg = totalSum / binCount;

        this.metrics.bassLevel = Math.min(100, (bassAvg / 255) * 150);
        this.metrics.midLevel = Math.min(100, (midAvg / 255) * 150);
        this.metrics.highLevel = Math.min(100, (highAvg / 255) * 150);
        this.metrics.noiseLevel = Math.min(100, (totalAvg / 255) * 120);
        this.metrics.dominantFrequency = maxIndex * binWidth;
        this.metrics.subtleEnergy = Math.min(100, ((subBassAvg + ultraLowAvg) / 255) * 200);

        // Baseline calibration
        if (this.isCalibrating) {
            this.baselineSamples.push(totalAvg);
            if (this.baselineSamples.length >= this.calibrationFrames) {
                this.noiseBaseline = this.baselineSamples.reduce((a, b) => a + b, 0) / this.baselineSamples.length;
                this.isCalibrating = false;
                console.log('[AudioAnalyzer] Baseline calibrated:', this.noiseBaseline.toFixed(2));
            }
        }

        this.calculateNearbyIntuition(subBassAvg, ultraLowAvg, bassAvg);
    }

    detectGhostFrequencies() {
        const binWidth = this.audioContext.sampleRate / this.fftSize;
        let evpScore = 0;
        let spiritBoxScore = 0;
        let paranormalScore = 0;

        // Scan EVP ranges
        for (const [rangeName, range] of Object.entries(this.ghostFrequencies)) {
            const startBin = Math.floor(range.min / binWidth);
            const endBin = Math.ceil(range.max / binWidth);
            let rangeEnergy = 0;
            let count = 0;

            for (let i = startBin; i <= endBin && i < this.frequencyData.length; i++) {
                rangeEnergy += this.frequencyData[i];
                count++;
            }

            const avgEnergy = count > 0 ? rangeEnergy / count : 0;
            const normalizedEnergy = avgEnergy / 255;

            if (rangeName === 'evpLow' || rangeName === 'evpMid' || rangeName === 'evpHigh') {
                evpScore += normalizedEnergy * 33;
            } else if (rangeName === 'spiritBox') {
                spiritBoxScore = normalizedEnergy * 100;
            } else if (rangeName === 'paranormal') {
                // 18.98Hz "fear frequency" - causes unease
                paranormalScore = normalizedEnergy * 100;
            }
        }

        // Detect sudden spikes (potential EVP)
        const currentTotal = this.frequencyData.reduce((a, b) => a + b, 0) / this.frequencyData.length;

        this.ghostHistory.push({
            evp: evpScore,
            spiritBox: spiritBoxScore,
            paranormal: paranormalScore,
            total: currentTotal,
            timestamp: Date.now()
        });

        if (this.ghostHistory.length > this.maxGhostHistory) {
            this.ghostHistory.shift();
        }

        // Analyze for anomalies
        if (this.ghostHistory.length >= 30) {
            const recent = this.ghostHistory.slice(-10);
            const older = this.ghostHistory.slice(-60, -10);

            const recentAvg = recent.reduce((sum, h) => sum + h.total, 0) / recent.length;
            const olderAvg = older.length > 0 ? older.reduce((sum, h) => sum + h.total, 0) / older.length : recentAvg;

            // Sudden changes indicate potential activity
            const change = Math.abs(recentAvg - olderAvg) / (olderAvg || 1);

            if (change > 0.5) {
                this.ghostMetrics.detectionCount++;
                this.ghostMetrics.lastDetectionTime = Date.now();
            }
        }

        // Calculate overall ghost activity
        this.ghostMetrics.evpActivity = Math.min(100, evpScore);
        this.ghostMetrics.spiritBoxHits = Math.min(100, spiritBoxScore);
        this.ghostMetrics.infrasoundAnomaly = this.infrasonicData.anomalyScore * 100;

        this.ghostMetrics.ghostFrequencyLevel = Math.min(100,
            (evpScore * 0.3 + spiritBoxScore * 0.2 + paranormalScore * 0.3 +
             this.ghostMetrics.infrasoundAnomaly * 0.2));

        // Estimate active entities based on frequency patterns
        this.ghostMetrics.activeEntities = Math.floor(this.ghostMetrics.ghostFrequencyLevel / 25);
    }

    detectAuras() {
        const binWidth = this.audioContext.sampleRate / this.fftSize;

        // Map frequency bands to aura colors
        // Low frequencies = physical/red
        // High frequencies = spiritual/violet

        const auraRanges = {
            RED: { min: 20, max: 100 },
            ORANGE: { min: 100, max: 200 },
            YELLOW: { min: 200, max: 400 },
            GREEN: { min: 400, max: 800 },
            BLUE: { min: 800, max: 1600 },
            INDIGO: { min: 1600, max: 3200 },
            VIOLET: { min: 3200, max: 6400 },
            WHITE: { min: 6400, max: 12000 }
        };

        // Reset aura colors
        Object.keys(this.auraSystem.auraColors).forEach(color => {
            this.auraSystem.auraColors[color] = 0;
        });

        // Analyze each range
        for (const [color, range] of Object.entries(auraRanges)) {
            const startBin = Math.floor(range.min / binWidth);
            const endBin = Math.ceil(range.max / binWidth);
            let energy = 0;
            let count = 0;

            for (let i = startBin; i <= endBin && i < this.frequencyData.length; i++) {
                energy += this.frequencyData[i];
                count++;
            }

            this.auraSystem.auraColors[color] = count > 0 ? (energy / count / 255) * 100 : 0;
        }

        // Determine dominant aura
        let maxColor = 'NONE';
        let maxValue = 0;

        for (const [color, value] of Object.entries(this.auraSystem.auraColors)) {
            if (value > maxValue && value > 10) {
                maxValue = value;
                maxColor = color;
            }
        }

        this.auraSystem.dominantAuraType = maxColor;
        this.auraSystem.auraStrength = maxValue;

        // Count detected auras (significant energy levels)
        this.auraSystem.auraCount = Object.values(this.auraSystem.auraColors)
            .filter(v => v > 15).length;

        // Update detected auras list
        this.auraSystem.detectedAuras = Object.entries(this.auraSystem.auraColors)
            .filter(([_, v]) => v > 15)
            .sort((a, b) => b[1] - a[1])
            .map(([color, strength]) => ({
                type: color,
                strength: Math.round(strength),
                meaning: this.getAuraMeaning(color)
            }));
    }

    getAuraMeaning(color) {
        const meanings = {
            RED: 'Physical Energy, Passion',
            ORANGE: 'Creativity, Emotions',
            YELLOW: 'Intellect, Confidence',
            GREEN: 'Healing, Compassion',
            BLUE: 'Communication, Peace',
            INDIGO: 'Intuition, Perception',
            VIOLET: 'Spirituality, Wisdom',
            WHITE: 'Purity, Transcendence',
            BLACK: 'Protection, Mystery'
        };
        return meanings[color] || 'Unknown';
    }

    countNearbyPresences() {
        // Combine multiple detection methods to estimate presences
        let presenceScore = 0;

        // Ghost activity contributes
        presenceScore += this.ghostMetrics.ghostFrequencyLevel * 0.3;

        // Aura detection contributes
        presenceScore += this.auraSystem.auraCount * 10;

        // Environmental anomalies
        presenceScore += this.metrics.environmentalAnomaly * 0.2;

        // Pattern-based presence
        presenceScore += this.metrics.presenceDetection * 0.2;

        // Estimate count
        const estimatedPresences = Math.min(9, Math.floor(presenceScore / 20));

        // Update nearby presences list
        this.auraSystem.nearbyPresences = [];

        for (let i = 0; i < estimatedPresences; i++) {
            const auraTypes = Object.keys(this.auraSystem.auraColors);
            const randomAura = auraTypes[Math.floor(Math.random() * auraTypes.length)];
            const distance = 1 + Math.random() * 4; // 1-5 meters
            const angle = Math.random() * 360;

            this.auraSystem.nearbyPresences.push({
                id: i + 1,
                auraType: this.auraSystem.detectedAuras[i % this.auraSystem.detectedAuras.length]?.type || randomAura,
                distance: distance.toFixed(1),
                angle: Math.round(angle),
                strength: Math.round(20 + Math.random() * 60)
            });
        }
    }

    calculateNearbyIntuition(subBass, ultraLow, bass) {
        let intuitionScore = 0;
        const lowFreqEnergy = (subBass * 2 + ultraLow * 3 + bass) / 6;
        intuitionScore += (lowFreqEnergy / 255) * 40;

        if (this.noiseBaseline !== null) {
            const currentAvg = (subBass + ultraLow + bass) / 3;
            const deviation = Math.abs(currentAvg - this.noiseBaseline);
            intuitionScore += Math.min(30, (deviation / (this.noiseBaseline || 1)) * 100);
        }

        intuitionScore += this.schumannResonance * 20;
        intuitionScore += this.infrasonicData.anomalyScore * 10;

        // Ghost activity boosts intuition
        intuitionScore += this.ghostMetrics.ghostFrequencyLevel * 0.1;

        this.metrics.nearbyIntuition = Math.min(100, intuitionScore);
    }

    detectInfrasonic() {
        const binWidth = this.audioContext.sampleRate / this.fftSize;
        let infrasonicEnergy = 0, count = 0;
        const maxBin = Math.ceil(20 / binWidth);

        for (let i = 0; i < maxBin && i < this.frequencyData.length; i++) {
            infrasonicEnergy += this.frequencyData[i];
            count++;
        }

        if (count > 0) {
            this.infrasonicData.level = infrasonicEnergy / count;
            this.infrasonicData.pattern.push(this.infrasonicData.level);

            if (this.infrasonicData.pattern.length > 60) {
                this.infrasonicData.pattern.shift();
            }

            if (this.infrasonicData.pattern.length >= 30) {
                const avg = this.infrasonicData.pattern.reduce((a, b) => a + b, 0) / this.infrasonicData.pattern.length;
                const variance = this.infrasonicData.pattern.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / this.infrasonicData.pattern.length;
                const stdDev = Math.sqrt(variance);
                const currentDeviation = Math.abs(this.infrasonicData.level - avg) / (stdDev || 1);
                this.infrasonicData.anomalyScore = Math.min(1, currentDeviation / this.anomalyThreshold);
            }
        }
    }

    detectSchumannResonance() {
        const binWidth = this.audioContext.sampleRate / this.fftSize;
        const targetBin = Math.round(7.83 / binWidth);
        let schumannEnergy = 0;
        const range = 2;

        for (let i = Math.max(0, targetBin - range); i <= targetBin + range && i < this.frequencyData.length; i++) {
            schumannEnergy += this.frequencyData[i];
        }

        schumannEnergy /= (range * 2 + 1);
        this.schumannResonance = Math.min(1, schumannEnergy / 128);

        this.schumannHistory.push(this.schumannResonance);
        if (this.schumannHistory.length > 60) this.schumannHistory.shift();

        // Check harmonics
        const harmonics = [14.3, 20.8, 27.3, 33.8];
        let harmonicSum = 0;

        for (const harmonic of harmonics) {
            const bin = Math.round(harmonic / binWidth);
            if (bin < this.frequencyData.length) {
                harmonicSum += this.frequencyData[bin] / 255;
            }
        }

        harmonicSum /= harmonics.length;
        this.schumannResonance = (this.schumannResonance * 0.6 + harmonicSum * 0.4);
    }

    analyzePatterns() {
        let zeroCrossings = 0, peakCount = 0, prevSample = 128;

        for (let i = 1; i < this.timeDomainData.length; i++) {
            const sample = this.timeDomainData[i];

            if ((prevSample < 128 && sample >= 128) || (prevSample >= 128 && sample < 128)) {
                zeroCrossings++;
            }

            if (i > 0 && i < this.timeDomainData.length - 1) {
                const prev = this.timeDomainData[i - 1];
                const next = this.timeDomainData[i + 1];
                if (sample > prev && sample > next && sample > 140) peakCount++;
            }

            prevSample = sample;
        }

        this.patternHistory.push({ zeroCrossings, peakCount, timestamp: Date.now() });
        if (this.patternHistory.length > this.maxPatternHistory) this.patternHistory.shift();

        if (this.patternHistory.length >= 30) {
            const recentPatterns = this.patternHistory.slice(-30);
            const avgCrossings = recentPatterns.reduce((sum, p) => sum + p.zeroCrossings, 0) / 30;
            const crossingVariance = recentPatterns.reduce((sum, p) => sum + Math.pow(p.zeroCrossings - avgCrossings, 2), 0) / 30;
            this.metrics.presenceDetection = Math.min(100, Math.sqrt(crossingVariance) * 2);
        }
    }

    calculateShivaTattva() {
        this.metrics.shivaTattva = Math.max(0, 100 - this.metrics.noiseLevel);
        this.metrics.shaktiTattva = (this.metrics.bassLevel + this.metrics.subtleEnergy) / 2;
        this.metrics.mayaTattva = this.metrics.highLevel;
        this.metrics.prakrtiEnergy = this.metrics.midLevel;

        const bands = [this.metrics.bassLevel, this.metrics.midLevel, this.metrics.highLevel];
        const avgBand = bands.reduce((a, b) => a + b, 0) / 3;
        const bandVariance = bands.reduce((sum, b) => sum + Math.pow(b - avgBand, 2), 0) / 3;

        this.metrics.tanmatraBalance = Math.max(0, 100 - Math.sqrt(bandVariance) * 2);

        this.metrics.psychicResonance = Math.min(100,
            this.schumannResonance * 30 +
            this.metrics.subtleEnergy * 0.3 +
            this.infrasonicData.anomalyScore * 20 +
            (100 - this.metrics.mayaTattva) * 0.2 +
            this.ghostMetrics.ghostFrequencyLevel * 0.2
        );

        this.metrics.environmentalAnomaly = Math.min(100,
            this.infrasonicData.anomalyScore * 50 +
            this.metrics.presenceDetection * 0.5 +
            this.ghostMetrics.ghostFrequencyLevel * 0.3
        );
    }

    detectAnomalies() {
        if (this.patternHistory.length < 60) return;

        const recent = this.patternHistory.slice(-10);
        const older = this.patternHistory.slice(-60, -10);

        const recentMean = recent.reduce((sum, p) => sum + p.zeroCrossings + p.peakCount, 0) / recent.length;
        const olderMean = older.reduce((sum, p) => sum + p.zeroCrossings + p.peakCount, 0) / older.length;

        const change = Math.abs(recentMean - olderMean) / (olderMean || 1);

        if (change > 0.3) {
            this.metrics.environmentalAnomaly = Math.min(100, this.metrics.environmentalAnomaly + change * 30);
        }
    }

    calculateEEGBands() {
        const binWidth = this.audioContext.sampleRate / this.fftSize;
        Object.keys(this.eegBands).forEach(band => { this.eegBands[band].value = 0; });

        let bandCounts = { delta: 0, theta: 0, alpha: 0, beta: 0, gamma: 0 };

        for (let i = 0; i < Math.min(512, this.frequencyData.length); i++) {
            const freq = i * binWidth;
            const value = this.frequencyData[i] / 255;

            if (freq < 50) {
                this.eegBands.delta.value += value * 0.6;
                bandCounts.delta++;
            } else if (freq < 150) {
                this.eegBands.theta.value += value * 0.5;
                this.eegBands.delta.value += value * 0.2;
                bandCounts.theta++;
                bandCounts.delta++;
            } else if (freq < 400) {
                this.eegBands.alpha.value += value * 0.5;
                this.eegBands.theta.value += value * 0.2;
                bandCounts.alpha++;
                bandCounts.theta++;
            } else if (freq < 1000) {
                this.eegBands.beta.value += value * 0.4;
                bandCounts.beta++;
            } else if (freq < 4000) {
                this.eegBands.gamma.value += value * 0.3;
                this.eegBands.beta.value += value * 0.2;
                bandCounts.gamma++;
                bandCounts.beta++;
            }
        }

        Object.keys(this.eegBands).forEach(band => {
            if (bandCounts[band] > 0) {
                this.eegBands[band].value = Math.min(100, (this.eegBands[band].value / bandCounts[band]) * 150);
            }
        });

        this.eegBands.theta.value = Math.min(100, this.eegBands.theta.value + this.schumannResonance * 30);
    }

    determineEEGState() {
        let maxBand = 'theta', maxValue = 0;

        Object.entries(this.eegBands).forEach(([band, data]) => {
            if (data.value > maxValue) {
                maxValue = data.value;
                maxBand = band;
            }
        });

        this.metrics.eegState = maxBand.toUpperCase();
    }

    smoothMetrics() {
        const alpha = this.smoothingFactor;

        Object.keys(this.metrics).forEach(key => {
            if (typeof this.metrics[key] === 'number' && typeof this.previousMetrics[key] === 'number') {
                this.metrics[key] = this.previousMetrics[key] + alpha * (this.metrics[key] - this.previousMetrics[key]);
            }
        });

        this.previousMetrics = { ...this.metrics };
    }

    drawSpectrum() {
        if (!this.spectrumCtx || !this.spectrumCanvas) return;

        const ctx = this.spectrumCtx;
        const w = this.spectrumCanvas.width;
        const h = this.spectrumCanvas.height;

        ctx.fillStyle = '#080c14';
        ctx.fillRect(0, 0, w, h);

        const barCount = 64;
        const barWidth = w / barCount - 1;
        const chakraColors = ['#cc2222', '#dd6600', '#ddaa00', '#00bb66', '#0099dd', '#6644bb', '#9966ff'];

        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor((i / barCount) * this.frequencyData.length * 0.5);
            const value = this.frequencyData[dataIndex] || 0;
            const barHeight = (value / 255) * h * 0.9;
            const colorIndex = Math.floor((i / barCount) * chakraColors.length);

            ctx.fillStyle = chakraColors[colorIndex];
            ctx.fillRect(i * (barWidth + 1), h - barHeight, barWidth, barHeight);
        }

        // Ghost activity indicator
        if (this.ghostMetrics.ghostFrequencyLevel > 20) {
            ctx.fillStyle = `rgba(255, 100, 100, ${this.ghostMetrics.ghostFrequencyLevel / 100})`;
            ctx.font = 'bold 10px Consolas';
            ctx.fillText(`👻 GHOST: ${Math.round(this.ghostMetrics.ghostFrequencyLevel)}%`, 5, 12);
        }

        // Aura indicator
        if (this.auraSystem.auraStrength > 15) {
            ctx.fillStyle = `rgba(180, 100, 255, 0.9)`;
            ctx.fillText(`AURA: ${this.auraSystem.dominantAuraType} (${this.auraSystem.auraCount})`, w - 100, 12);
        }
    }

    drawEEGMap() {
        if (!this.eegCtx || !this.eegCanvas) return;

        const ctx = this.eegCtx;
        const w = this.eegCanvas.width;
        const h = this.eegCanvas.height;

        ctx.fillStyle = '#080c14';
        ctx.fillRect(0, 0, w, h);

        const currentValues = {
            delta: this.eegBands.delta.value,
            theta: this.eegBands.theta.value,
            alpha: this.eegBands.alpha.value,
            beta: this.eegBands.beta.value,
            gamma: this.eegBands.gamma.value
        };

        this.eegHistory.push(currentValues);
        if (this.eegHistory.length > this.maxEegHistory) this.eegHistory.shift();

        const colors = {
            delta: '#880088',
            theta: '#6666ff',
            alpha: '#00ff66',
            beta: '#ffff00',
            gamma: '#ff6666'
        };

        const bands = Object.keys(colors);
        const bandHeight = h / bands.length;

        bands.forEach((band, idx) => {
            const y = idx * bandHeight + bandHeight / 2;

            ctx.beginPath();
            ctx.strokeStyle = colors[band];
            ctx.lineWidth = 1.5;

            for (let i = 0; i < this.eegHistory.length; i++) {
                const x = (i / this.maxEegHistory) * w;
                const value = this.eegHistory[i][band] || 0;
                const waveY = y + (value / 100) * (bandHeight * 0.4) * Math.sin(i * 0.3);

                if (i === 0) ctx.moveTo(x, waveY);
                else ctx.lineTo(x, waveY);
            }

            ctx.stroke();
            ctx.fillStyle = colors[band];
            ctx.font = '8px Consolas';
            ctx.fillText(band.charAt(0).toUpperCase(), 3, y + 3);
        });
    }

    // Public getters
    getMetrics() { return this.metrics; }
    getEEGBands() { return this.eegBands; }
    getGhostMetrics() { return this.ghostMetrics; }
    getAuraSystem() { return this.auraSystem; }

    getShivaTattvaState() {
        return {
            shiva: this.metrics.shivaTattva,
            shakti: this.metrics.shaktiTattva,
            maya: this.metrics.mayaTattva,
            prakriti: this.metrics.prakrtiEnergy,
            tanmatra: this.metrics.tanmatraBalance,
            psychic: this.metrics.psychicResonance,
            schumann: this.schumannResonance * 100,
            anomaly: this.metrics.environmentalAnomaly
        };
    }

    getRadarData() {
        return {
            presences: this.auraSystem.nearbyPresences,
            ghostLevel: this.ghostMetrics.ghostFrequencyLevel,
            activeEntities: this.ghostMetrics.activeEntities,
            auras: this.auraSystem.detectedAuras,
            auraCount: this.auraSystem.auraCount,
            dominantAura: this.auraSystem.dominantAuraType,
            anomalyLevel: this.metrics.environmentalAnomaly
        };
    }

    // Classify noise types based on frequency analysis
    classifyNoiseTypes() {
        const noiseLevel = this.metrics.noiseLevel;
        const bassLevel = this.metrics.bassLevel;
        const midLevel = this.metrics.midLevel;
        const highLevel = this.metrics.highLevel;
        const dominantFreq = this.metrics.dominantFrequency;

        this.detectedNoiseList = [];

        // Classify by overall level
        if (noiseLevel < 10) {
            this.detectedNoiseList.push({ type: 'SILENCE', icon: '🤫', level: noiseLevel });
        }

        // Classify by frequency content
        if (bassLevel > 30) {
            this.detectedNoiseList.push({ type: 'LOW_RUMBLE', icon: '🔊', level: bassLevel });
        }
        if (bassLevel > 50 && midLevel < 30) {
            this.detectedNoiseList.push({ type: 'BASS_HUM', icon: '〰️', level: bassLevel });
        }
        if (midLevel > 40 && dominantFreq > 200 && dominantFreq < 4000) {
            this.detectedNoiseList.push({ type: 'VOICE', icon: '🗣️', level: midLevel });
        }
        if (highLevel > 40) {
            this.detectedNoiseList.push({ type: 'HIGH_FREQ', icon: '📡', level: highLevel });
        }
        if (highLevel > 60 && midLevel > 50) {
            this.detectedNoiseList.push({ type: 'MUSIC', icon: '🎵', level: (highLevel + midLevel) / 2 });
        }
        if (noiseLevel > 70) {
            this.detectedNoiseList.push({ type: 'LOUD_NOISE', icon: '📢', level: noiseLevel });
        }

        // Environmental sounds
        if (bassLevel > 20 && bassLevel < 40 && midLevel < 30) {
            this.detectedNoiseList.push({ type: 'AMBIENT', icon: '🍃', level: bassLevel });
        }
        if (this.infrasonicData.level > 50) {
            this.detectedNoiseList.push({ type: 'INFRASONIC', icon: '🌀', level: this.infrasonicData.level / 2.55 });
        }
        if (this.ghostMetrics.evpActivity > 30) {
            this.detectedNoiseList.push({ type: 'EVP_RANGE', icon: '👻', level: this.ghostMetrics.evpActivity });
        }

        // Wind/Breath detection
        if (bassLevel > 15 && bassLevel < 35 && highLevel > 20 && highLevel < 45) {
            this.detectedNoiseList.push({ type: 'WIND_BREATH', icon: '🌬️', level: (bassLevel + highLevel) / 2 });
        }

        // Electronic/Mechanical
        if (dominantFreq > 45 && dominantFreq < 65) {
            this.detectedNoiseList.push({ type: 'ELECTRICAL_HUM', icon: '⚡', level: 50 });
        }

        return this.detectedNoiseList;
    }

    // Decision making system (Yes/No based on energy patterns)
    updateDecisionSystem() {
        const now = Date.now();
        if (now - this.decisionSystem.lastUpdate < 100) return; // Throttle updates
        this.decisionSystem.lastUpdate = now;

        // Use various metrics to derive Yes/No energy
        const positiveEnergy = (
            this.metrics.shivaTattva * 0.2 +
            this.eegBands.alpha.value * 0.3 +
            this.eegBands.gamma.value * 0.2 +
            (100 - this.metrics.mayaTattva) * 0.15 +
            this.metrics.tanmatraBalance * 0.15
        );

        const negativeEnergy = (
            this.metrics.noiseLevel * 0.2 +
            this.eegBands.beta.value * 0.25 +
            this.metrics.environmentalAnomaly * 0.2 +
            this.ghostMetrics.ghostFrequencyLevel * 0.15 +
            (100 - this.metrics.shivaTattva) * 0.2
        );

        // Smooth the values
        this.decisionSystem.yesEnergy += (positiveEnergy - this.decisionSystem.yesEnergy) * 0.1;
        this.decisionSystem.noEnergy += (negativeEnergy - this.decisionSystem.noEnergy) * 0.1;

        // Calculate difference for decision
        const diff = this.decisionSystem.yesEnergy - this.decisionSystem.noEnergy;
        const totalEnergy = this.decisionSystem.yesEnergy + this.decisionSystem.noEnergy;

        // Determine answer
        if (Math.abs(diff) < 10) {
            this.decisionSystem.answer = 'NEUTRAL';
            this.decisionSystem.confidence = 0;
        } else if (diff > 0) {
            this.decisionSystem.answer = 'YES';
            this.decisionSystem.confidence = Math.min(100, (diff / totalEnergy) * 200);
        } else {
            this.decisionSystem.answer = 'NO';
            this.decisionSystem.confidence = Math.min(100, (Math.abs(diff) / totalEnergy) * 200);
        }

        // Track history
        this.decisionSystem.history.push({
            answer: this.decisionSystem.answer,
            confidence: this.decisionSystem.confidence,
            timestamp: now
        });

        if (this.decisionSystem.history.length > 60) {
            this.decisionSystem.history.shift();
        }
    }

    getNoiseTypes() {
        this.classifyNoiseTypes();
        return this.detectedNoiseList;
    }

    getDecisionSystem() {
        this.updateDecisionSystem();
        return this.decisionSystem;
    }
}

// Export singleton
window.audioAnalyzer = new AudioAnalyzer();

