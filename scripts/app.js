/**
 * Shrivyom AR Intuition System - Main Application
 * High-performance Electron-based AR chakra visualization
 * With auto-calibration, GPU optimization, and advanced metrics
 * @version 1.0.0
 * @license MIT
 */

const { ipcRenderer } = require('electron');

class ShrivyomApp {
    constructor() {
        this.isInitialized = false;
        this.isSessionActive = false;
        this.videoStream = null;
        this.displayInfo = null;

        // Components
        this.arRenderer = null;
        this.hudController = null;
        this.audioAnalyzer = null;

        // Biometric state
        this.currentMetrics = {
            focus: 50,
            stillness: 50,
            breath: 50,
            calmness: 50,
            balance: 50,
            noise: 30,
            nearbyIntuition: 20,
            intuition: 50
        };

        // Calibration state
        this.calibrationSettings = {
            bodyScale: 1.0,
            chakraSize: 1.0,
            glowIntensity: 1.0,
            particleCount: 1.0,
            labelOpacity: 0.9,
            geometryComplexity: 3
        };

        this.init();
    }

    async init() {
        console.log('[App] Initializing Shrivyom AR System v1.0.0...');

        try {
            this.displayInfo = await ipcRenderer.invoke('get-display-info');
            console.log('[App] Display info:', this.displayInfo);
        } catch (e) {
            this.displayInfo = { width: 1920, height: 1080, refreshRate: 144 };
        }

        this.startMatrixEffect();
        await this.simulateLoading();
        await this.initializeComponents();
        this.setupEventListeners();
        this.autoCalibrate();
        this.showMainInterface();
        this.startMainLoop();

        console.log('[App] System ready');
    }

    startMatrixEffect() {
        const canvas = document.getElementById('matrix-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const chars = 'अआइईउऊएऐओऔकखगघचछजझ१२३४५६७८९०ΩΨΦΣΠΛ';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);
        const colors = ['#00ff88', '#00ffaa', '#00ddff', '#8866ff', '#ff6688'];
        let colorIndex = 0;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                ctx.fillStyle = drops[i] === 1 ? '#ffffff' : colors[(i + colorIndex) % colors.length];
                ctx.fillText(char, x, y);

                if (y > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
            colorIndex = (colorIndex + 1) % colors.length;
        };

        this.matrixInterval = setInterval(draw, 33);
    }

    async simulateLoading() {
        const messages = [
            'INITIALIZING CONSCIOUSNESS INTERFACE...',
            'CALIBRATING DISPLAY FOR ' + (this.displayInfo?.refreshRate || 60) + 'Hz...',
            'ACTIVATING GPU ACCELERATION...',
            'LOADING KUNDALINI PROTOCOLS...',
            'ESTABLISHING CHAKRA RESONANCE...',
            'ENTERING INTUITION MATRIX...',
            'SYSTEM READY'
        ];

        const checkItems = ['check-gpu', 'check-camera', 'check-audio', 'check-chakra'];
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const statusMessage = document.getElementById('status-message');

        // Faster loading - less delay per step
        for (let i = 0; i <= 100; i += 4) {
            if (progressFill) progressFill.style.width = `${i}%`;
            if (progressText) progressText.textContent = `${i}%`;

            const msgIndex = Math.min(Math.floor(i / 15), messages.length - 1);
            if (statusMessage) statusMessage.textContent = messages[msgIndex];

            const checkIndex = Math.floor(i / 25);
            if (checkIndex < checkItems.length) {
                const checkEl = document.getElementById(checkItems[checkIndex]);
                if (checkEl && !checkEl.classList.contains('active')) {
                    checkEl.classList.add('active');
                    checkEl.querySelector('.check-icon').textContent = '●';
                }
            }
            await this.sleep(15); // Much faster loading
        }
        await this.sleep(200);
    }

    async initializeComponents() {
        console.log('[App] Initializing components...');

        try {
            // Initialize audio first (lightweight)
            if (window.chakraAudio) {
                await window.chakraAudio.init();
                console.log('[App] Chakra audio ready');
            }

            // Initialize audio analyzer
            if (window.audioAnalyzer) {
                await window.audioAnalyzer.init();
                // Don't start microphone until session starts to avoid blocking
                console.log('[App] Audio analyzer ready');
            }

            // Setup camera (may take time)
            await this.setupCamera();

            // Initialize face detection after camera
            const video = document.getElementById('camera-feed');
            if (window.faceDetector && video) {
                await window.faceDetector.init(video);
                console.log('[App] Face detector ready');
            }

            // Initialize AR canvas
            const arCanvas = document.getElementById('ar-canvas');
            if (arCanvas && window.ARRenderer) {
                this.arRenderer = new window.ARRenderer(arCanvas);
                if (this.displayInfo) this.arRenderer.setDisplayInfo(this.displayInfo);
                console.log('[App] AR renderer ready');
            }

            // Initialize HUD controller
            if (window.HUDController) {
                this.hudController = new window.HUDController();
                console.log('[App] HUD controller ready');
            }

            // Enumerate devices in background
            this.enumerateDevices();

            console.log('[App] All components initialized');
        } catch (e) {
            console.error('[App] Component initialization error:', e);
            // Continue anyway - some components may still work
        }
    }

    async setupCamera() {
        const video = document.getElementById('camera-feed');
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                attempt++;
                console.log(`[App] Camera setup attempt ${attempt}/${maxRetries}`);

                // Stop any existing stream first
                if (this.videoStream) {
                    this.videoStream.getTracks().forEach(track => track.stop());
                }

                const constraints = {
                    video: {
                        width: { ideal: 1280, max: 1920 },
                        height: { ideal: 720, max: 1080 },
                        frameRate: { ideal: 30, max: 60 },
                        facingMode: 'user'
                    },
                    audio: true
                };

                this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
                video.srcObject = this.videoStream;

                // Wait for video to be ready with timeout
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Video load timeout'));
                    }, 5000);

                    video.onloadedmetadata = () => {
                        clearTimeout(timeout);
                        video.play()
                            .then(resolve)
                            .catch(reject);
                    };

                    video.onerror = () => {
                        clearTimeout(timeout);
                        reject(new Error('Video element error'));
                    };
                });

                console.log('[App] Camera initialized:', video.videoWidth, 'x', video.videoHeight);
                return; // Success, exit the retry loop

            } catch (e) {
                console.error(`[App] Camera error (attempt ${attempt}):`, e);

                if (attempt >= maxRetries) {
                    console.error('[App] All camera attempts failed, using fallback');
                    // Show error to user but continue without camera
                    this.showCameraError();
                }

                // Wait before retry
                await this.sleep(500);
            }
        }
    }

    showCameraError() {
        const video = document.getElementById('camera-feed');
        if (video) {
            video.style.background = 'linear-gradient(135deg, #1a0a2e 0%, #0a0a1a 100%)';
            video.style.opacity = '0.3';
        }
        console.warn('[App] Running without camera - chakras will use screen center positioning');
    }

    async enumerateDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameraSelect = document.getElementById('camera-select');
            const audioSelect = document.getElementById('audio-select');

            if (cameraSelect) cameraSelect.innerHTML = '<option value="">Select Camera</option>';
            if (audioSelect) audioSelect.innerHTML = '<option value="">Select Audio</option>';

            let cameraCount = 0, audioCount = 0;

            devices.forEach((device) => {
                const option = document.createElement('option');
                option.value = device.deviceId;

                if (device.kind === 'videoinput') {
                    cameraCount++;
                    option.textContent = device.label || `Camera ${cameraCount}`;
                    if (cameraSelect) cameraSelect.appendChild(option);
                } else if (device.kind === 'audioinput') {
                    audioCount++;
                    option.textContent = device.label || `Microphone ${audioCount}`;
                    if (audioSelect) audioSelect.appendChild(option);
                }
            });

            if (cameraSelect && cameraSelect.options.length > 1) cameraSelect.selectedIndex = 1;
            if (audioSelect && audioSelect.options.length > 1) audioSelect.selectedIndex = 1;
        } catch (e) {
            console.error('[App] Device enumeration error:', e);
        }
    }

    autoCalibrate() {
        if (this.displayInfo) {
            const { width, scaleFactor } = this.displayInfo;

            if (width >= 2560) {
                this.calibrationSettings.chakraSize = 1.2;
                this.calibrationSettings.labelOpacity = 1.0;
            } else if (width <= 1366) {
                this.calibrationSettings.chakraSize = 0.8;
                this.calibrationSettings.labelOpacity = 0.8;
            }

            if (scaleFactor > 1) {
                this.calibrationSettings.glowIntensity = 1.0 / scaleFactor;
            }

            if (this.arRenderer) this.arRenderer.calibrate(this.calibrationSettings);
            console.log('[App] Auto-calibrated for:', width);
        }
    }

    showMainInterface() {
        if (this.matrixInterval) clearInterval(this.matrixInterval);

        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('fade-out');

        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            document.getElementById('main-interface').classList.remove('hidden');
            this.arRenderer.start();
        }, 500);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        document.getElementById('start-btn')?.addEventListener('click', () => this.startSession());
        document.getElementById('stop-btn')?.addEventListener('click', () => this.stopSession());
        document.getElementById('camera-select')?.addEventListener('change', (e) => this.switchCamera(e.target.value));
        document.getElementById('audio-select')?.addEventListener('change', (e) => this.switchAudio(e.target.value));

        window.addEventListener('resize', () => {
            if (this.arRenderer) this.arRenderer.resize();
            this.autoCalibrate();
        });

        ipcRenderer.on('display-info', (event, info) => {
            this.displayInfo = info;
            if (this.arRenderer) this.arRenderer.setDisplayInfo(info);
            this.autoCalibrate();
        });
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'Escape': this.exitApp(); break;
            case 'F11': ipcRenderer.send('toggle-fullscreen'); break;
            case 'a': case 'A': this.toggleDeviceSelectors(); break;
            case 'c': case 'C': this.enumerateDevices(); break;
            case 'm': case 'M': this.toggleMute(); break;
            case ' ':
                e.preventDefault();
                this.isSessionActive ? this.stopSession() : this.startSession();
                break;
            case '+': case '=': this.adjustCalibration('chakraSize', 0.1); break;
            case '-': this.adjustCalibration('chakraSize', -0.1); break;
            case '[': this.adjustCalibration('glowIntensity', -0.1); break;
            case ']': this.adjustCalibration('glowIntensity', 0.1); break;
        }
    }

    adjustCalibration(key, delta) {
        this.calibrationSettings[key] = Math.max(0.1, Math.min(2.0, this.calibrationSettings[key] + delta));
        if (this.arRenderer) this.arRenderer.calibrate(this.calibrationSettings);
        console.log(`[App] Calibration ${key}: ${this.calibrationSettings[key].toFixed(2)}`);
    }

    toggleDeviceSelectors() {
        const controls = document.querySelector('.device-controls');
        if (controls) controls.classList.toggle('expanded');
    }

    toggleMute() {
        if (window.chakraAudio) {
            window.chakraAudio.setVolume(window.chakraAudio.volume > 0 ? 0 : 0.3);
        }
    }

    async switchCamera(deviceId) {
        if (!deviceId) return;
        try {
            if (this.videoStream) this.videoStream.getTracks().forEach(track => track.stop());

            const constraints = {
                video: { deviceId: { exact: deviceId }, width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } }
            };

            this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            document.getElementById('camera-feed').srcObject = this.videoStream;
            console.log('[App] Camera switched');
        } catch (e) {
            console.error('[App] Camera switch error:', e);
        }
    }

    async switchAudio(deviceId) {
        console.log('[App] Audio input switched to:', deviceId);
    }

    async startSession() {
        this.isSessionActive = true;
        document.getElementById('start-btn').disabled = true;
        document.getElementById('stop-btn').disabled = false;

        const statusEl = document.querySelector('.status-text');
        if (statusEl) statusEl.textContent = '● SESSION ACTIVE';

        this.hudController.startSession();

        // Start audio analyzer with microphone when session starts
        if (window.audioAnalyzer && !window.audioAnalyzer.isActive) {
            await window.audioAnalyzer.startMicrophone();
            console.log('[App] Audio analyzer microphone activated');
        }

        // Start chakra activation sequence
        if (window.chakraAudio) {
            window.chakraAudio.startSession();
        }

        console.log('[App] Session started with chakra activation sequence');
    }

    stopSession() {
        this.isSessionActive = false;
        document.getElementById('start-btn').disabled = false;
        document.getElementById('stop-btn').disabled = true;

        const statusEl = document.querySelector('.status-text');
        if (statusEl) statusEl.textContent = '○ SESSION PAUSED';

        this.hudController.stopSession();

        // Stop chakra audio session
        if (window.chakraAudio) {
            window.chakraAudio.stopSession();
        }

        console.log('[App] Session stopped');
    }

    startMainLoop() {
        let lastFpsUpdate = 0;

        const update = async () => {
            const now = performance.now();

            if (window.faceDetector) {
                const faceData = await window.faceDetector.detectFace();
                if (faceData) {
                    const bodyMetrics = window.faceDetector.calculateBodyMetrics(faceData);
                    this.arRenderer.updateBodyMetrics(bodyMetrics);
                }
            }

            this.updateMetrics();

            const chakraValues = this.calculateChakraValues();
            this.arRenderer.updateChakras(chakraValues);
            this.arRenderer.setIntuitionLevel(this.currentMetrics.intuition);

            this.hudController.updateMetrics(this.currentMetrics);
            this.hudController.updateChakraValues(chakraValues);

            // Update chakra audio and EEG derivation
            if (window.chakraAudio) {
                if (this.isSessionActive) {
                    window.chakraAudio.updateChakraActivation(chakraValues);
                }
                // Update EEG simulation from metrics
                window.chakraAudio.updateEEGFromState(this.currentMetrics);
            }

            if (now - lastFpsUpdate > 500) {
                const fpsEl = document.getElementById('fps-value');
                if (fpsEl) fpsEl.textContent = this.arRenderer.getFPS() || 60;
                lastFpsUpdate = now;
            }

            requestAnimationFrame(update);
        };

        update();
    }

    updateMetrics() {
        const fluctuate = (current, min, max, speed = 0.5) => {
            const change = (Math.random() - 0.5) * speed;
            return Math.max(min, Math.min(max, current + change));
        };

        // Get metrics from audio analyzer if available
        if (window.audioAnalyzer && window.audioAnalyzer.isActive) {
            const audioMetrics = window.audioAnalyzer.getMetrics();
            this.currentMetrics.noise = audioMetrics.noiseLevel;
            this.currentMetrics.nearbyIntuition = audioMetrics.nearbyIntuition;

            // Use Shiva Tattva for enhanced intuition
            const shivaTattva = window.audioAnalyzer.getShivaTattvaState();

            // Shiva (stillness) enhances calmness
            if (shivaTattva.shiva > 50) {
                this.currentMetrics.calmness = fluctuate(this.currentMetrics.calmness, 50, 95, 0.3);
            }

            // Shakti (energy) enhances focus
            if (shivaTattva.shakti > 40) {
                this.currentMetrics.focus = fluctuate(this.currentMetrics.focus, 40, 90, 0.4);
            }

            // Psychic resonance boosts intuition
            this.currentMetrics.nearbyIntuition = Math.min(100,
                this.currentMetrics.nearbyIntuition + shivaTattva.psychic * 0.3);

            // Schumann resonance (7.83Hz) enhances meditation state
            if (shivaTattva.schumann > 30) {
                this.currentMetrics.calmness = Math.min(100,
                    this.currentMetrics.calmness + shivaTattva.schumann * 0.2);
            }
        }

        if (this.isSessionActive) {
            this.currentMetrics.focus = fluctuate(this.currentMetrics.focus, 40, 95, 0.4);
            this.currentMetrics.stillness = fluctuate(this.currentMetrics.stillness, 35, 90, 0.5);
            this.currentMetrics.breath = fluctuate(this.currentMetrics.breath, 30, 90, 0.6);
            this.currentMetrics.calmness = fluctuate(this.currentMetrics.calmness, 40, 95, 0.4);
        } else {
            this.currentMetrics.focus = fluctuate(this.currentMetrics.focus, 20, 60, 0.2);
            this.currentMetrics.stillness = fluctuate(this.currentMetrics.stillness, 15, 55, 0.3);
            this.currentMetrics.breath = fluctuate(this.currentMetrics.breath, 10, 50, 0.4);
            this.currentMetrics.calmness = fluctuate(this.currentMetrics.calmness, 20, 60, 0.2);
        }

        this.currentMetrics.balance = (this.currentMetrics.focus + this.currentMetrics.stillness + this.currentMetrics.breath + this.currentMetrics.calmness) / 4;
        this.currentMetrics.intuition = this.currentMetrics.balance * 0.5 + this.currentMetrics.calmness * 0.2 + (100 - this.currentMetrics.noise) * 0.1 + this.currentMetrics.nearbyIntuition * 0.2;
        this.currentMetrics.noise = fluctuate(this.currentMetrics.noise, 10, 60, 0.5);
        this.currentMetrics.nearbyIntuition = fluctuate(this.currentMetrics.nearbyIntuition, 5, 50, 0.4);

        this.updateEEGState();
    }

    updateEEGState() {
        const m = this.currentMetrics;
        let eegState;

        if (m.calmness > 80 && m.focus > 70) eegState = 'GAMMA';
        else if (m.calmness > 70) eegState = 'ALPHA';
        else if (m.calmness > 50 && m.stillness > 60) eegState = 'THETA';
        else if (m.focus > 60) eegState = 'BETA';
        else eegState = 'THETA';

        this.hudController.updateEEGState(eegState);
    }

    calculateChakraValues() {
        const m = this.currentMetrics;
        return {
            1: m.calmness * 0.6 + m.stillness * 0.4,
            2: m.breath * 0.5 + m.calmness * 0.3 + m.nearbyIntuition * 0.2,
            3: m.focus * 0.6 + m.balance * 0.4,
            4: m.calmness * 0.5 + m.balance * 0.5,
            5: m.intuition * 0.5 + m.stillness * 0.3 + m.focus * 0.2,
            6: m.balance * 0.4 + m.intuition * 0.4 + m.stillness * 0.2,
            7: m.intuition * 0.3 + m.nearbyIntuition * 0.3 + m.calmness * 0.4
        };
    }

    exitApp() {
        const mainInterface = document.getElementById('main-interface');
        mainInterface.style.opacity = '0';
        mainInterface.style.transition = 'opacity 0.5s ease';
        mainInterface.style.transform = 'scale(0.95)';

        if (this.videoStream) this.videoStream.getTracks().forEach(track => track.stop());

        setTimeout(() => { ipcRenderer.send('exit-app'); }, 500);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new ShrivyomApp();
});



