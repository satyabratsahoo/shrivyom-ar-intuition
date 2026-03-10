/**
 * AR Renderer - WebGL-accelerated chakra visualization
 * Renders Doctor Strange-style geometric chakras with perfect body alignment
 * Supports 144Hz displays with GPU acceleration
 * @version 1.0.0
 * @license MIT
 */

class ARRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true,
            willReadFrequently: false
        });

        this.animationPhase = 0;
        this.rotationOffset = 0;
        this.isRunning = false;
        this.lastFrameTime = 0;
        this.targetFPS = 144;
        this.frameCount = 0;
        this.actualFPS = 0;
        this.lastFPSUpdate = 0;

        this.displayInfo = null;
        this.scaleFactor = 1;

        // 7 Kundalini Chakras with Rig Vedic Sanskrit names and body positions
        // Position: 0 = top of body (Crown), increasing values go down to Root
        // Chakras array is ordered from Crown (top) to Root (bottom)
        this.chakras = [
            {
                id: 7,
                name: "SAHASRARA",
                sanskrit: "सहस्रार",
                meaning: "Thousand-Petaled",
                mantra: "ॐ",
                color: "#9966ff",
                glowColor: "#bb88ff",
                position: 0.00,  // Top - Crown
                intensity: 70,
                frequency: 963,
                element: "COSMIC",
                petals: 1000,
                deity: "Shiva-Shakti"
            },
            {
                id: 6,
                name: "AJNA",
                sanskrit: "आज्ञा",
                meaning: "Command Center",
                mantra: "ॐ",
                color: "#6644bb",
                glowColor: "#8866dd",
                position: 0.12,  // Third Eye
                intensity: 70,
                frequency: 852,
                element: "LIGHT",
                petals: 2,
                deity: "Ardhanarishvara"
            },
            {
                id: 5,
                name: "VISHUDDHA",
                sanskrit: "विशुद्ध",
                meaning: "Purification",
                mantra: "हं",
                color: "#0099dd",
                glowColor: "#00bbff",
                position: 0.25,  // Throat
                intensity: 70,
                frequency: 741,
                element: "AKASHA",
                petals: 16,
                deity: "Sadashiva"
            },
            {
                id: 4,
                name: "ANAHATA",
                sanskrit: "अनाहत",
                meaning: "Unstruck Sound",
                mantra: "यं",
                color: "#00bb66",
                glowColor: "#00dd88",
                position: 0.40,  // Heart
                intensity: 70,
                frequency: 639,
                element: "VAYU",
                petals: 12,
                deity: "Ishana"
            },
            {
                id: 3,
                name: "MANIPURA",
                sanskrit: "मणिपुर",
                meaning: "City of Jewels",
                mantra: "रं",
                color: "#ddaa00",
                glowColor: "#ffcc00",
                position: 0.55,  // Solar Plexus
                intensity: 70,
                frequency: 528,
                element: "AGNI",
                petals: 10,
                deity: "Rudra"
            },
            {
                id: 2,
                name: "SVADHISTHANA",
                sanskrit: "स्वाधिष्ठान",
                meaning: "Self Abode",
                mantra: "वं",
                color: "#dd6600",
                glowColor: "#ff8822",
                position: 0.70,  // Sacral
                intensity: 70,
                frequency: 417,
                element: "APAS",
                petals: 6,
                deity: "Vishnu"
            },
            {
                id: 1,
                name: "MULADHARA",
                sanskrit: "मूलाधार",
                meaning: "Root Support",
                mantra: "लं",
                color: "#cc2222",
                glowColor: "#ff4444",
                position: 0.85,  // Root - Bottom
                intensity: 70,
                frequency: 396,
                element: "PRITHVI",
                petals: 4,
                deity: "Brahma"
            }
        ];

        this.bodyMetrics = null;
        this.smoothedBodyMetrics = null;
        this.overallActivation = 0.5;
        this.dynamicChakraScale = 1.0;

        // Intuition state
        this.intuitionLevel = 0;
        this.intuitionPulse = 0;

        // Decision making system (Yes/No)
        this.decisionState = {
            answer: 'NEUTRAL',
            confidence: 0,
            yesEnergy: 50,
            noEnergy: 50,
            history: []
        };

        // Shiva Mudras - activated by intuition levels
        this.shivaMudras = [
            { name: 'CHIN MUDRA', sanskrit: 'चिन्मुद्रा', symbol: '🤏', minIntuition: 20, effect: 'Consciousness Focus', active: false },
            { name: 'GYAN MUDRA', sanskrit: 'ज्ञानमुद्रा', symbol: '👌', minIntuition: 35, effect: 'Divine Knowledge', active: false },
            { name: 'DHYANA MUDRA', sanskrit: 'ध्यानमुद्रा', symbol: '🧘', minIntuition: 50, effect: 'Deep Meditation', active: false },
            { name: 'ABHAYA MUDRA', sanskrit: 'अभयमुद्रा', symbol: '✋', minIntuition: 65, effect: 'Fearlessness', active: false },
            { name: 'VARADA MUDRA', sanskrit: 'वरदमुद्रा', symbol: '🤲', minIntuition: 75, effect: 'Boon Granting', active: false },
            { name: 'SHIVA LINGA', sanskrit: 'शिवलिंग', symbol: '🙏', minIntuition: 85, effect: 'Supreme Union', active: false }
        ];

        // Detected noise types
        this.noiseTypes = [];
        this.noiseCategories = {
            SILENCE: { min: 0, max: 10, icon: '🤫', description: 'Pure Silence' },
            WHISPER: { min: 10, max: 25, icon: '🌬️', description: 'Whisper/Breath' },
            AMBIENT: { min: 25, max: 40, icon: '🍃', description: 'Ambient Sounds' },
            VOICE: { min: 40, max: 60, icon: '🗣️', description: 'Voice/Speech' },
            MUSIC: { min: 60, max: 75, icon: '🎵', description: 'Music/Rhythm' },
            NOISE: { min: 75, max: 90, icon: '📢', description: 'Loud Noise' },
            EXTREME: { min: 90, max: 100, icon: '⚠️', description: 'Extreme Sound' }
        };

        this.particles = [];
        this.maxParticles = 80; // Reduced particles

        this.calibration = {
            bodyScale: 1.0,
            chakraSize: 1.0,
            glowIntensity: 1.0,
            particleCount: 1.0,
            labelOpacity: 0.9,
            geometryComplexity: 3
        };

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    setDisplayInfo(info) {
        this.displayInfo = info;
        this.targetFPS = info.refreshRate || 144;
        this.scaleFactor = info.scaleFactor || 1;
    }

    resize() {
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.ctx.scale(dpr, dpr);
    }

    calibrate(settings) {
        Object.assign(this.calibration, settings);
    }

    start() {
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
    }

    updateChakras(chakraValues) {
        for (const chakra of this.chakras) {
            if (chakraValues[chakra.id] !== undefined) {
                const target = Math.max(0, Math.min(100, chakraValues[chakra.id]));
                chakra.intensity += (target - chakra.intensity) * 0.1;
            }
        }
        const total = this.chakras.reduce((sum, c) => sum + c.intensity, 0);
        this.overallActivation = total / (this.chakras.length * 100);
    }

    setIntuitionLevel(level) {
        this.intuitionLevel = Math.max(0, Math.min(100, level));
    }

    updateBodyMetrics(metrics) {
        if (!metrics) {
            this.bodyMetrics = null;
            return;
        }

        if (!this.smoothedBodyMetrics) {
            this.smoothedBodyMetrics = { ...metrics };
        } else {
            const alpha = 0.12;
            this.smoothedBodyMetrics.bodyTop += (metrics.bodyTop - this.smoothedBodyMetrics.bodyTop) * alpha;
            this.smoothedBodyMetrics.bodyBottom += (metrics.bodyBottom - this.smoothedBodyMetrics.bodyBottom) * alpha;
            this.smoothedBodyMetrics.centerX += (metrics.centerX - this.smoothedBodyMetrics.centerX) * alpha;
            this.smoothedBodyMetrics.bodyWidth += (metrics.bodyWidth - this.smoothedBodyMetrics.bodyWidth) * alpha;

            // Use dynamic scale from face detection
            if (metrics.dynamicScale) {
                this.smoothedBodyMetrics.dynamicScale = this.smoothedBodyMetrics.dynamicScale || 1.0;
                this.smoothedBodyMetrics.dynamicScale += (metrics.dynamicScale - this.smoothedBodyMetrics.dynamicScale) * 0.08;
            }

            // Always forward chakra positions with smoothing
            if (metrics.chakraPositions) {
                if (!this.smoothedBodyMetrics.chakraPositions) {
                    this.smoothedBodyMetrics.chakraPositions = JSON.parse(JSON.stringify(metrics.chakraPositions));
                } else {
                    const posAlpha = 0.15;
                    for (const id in metrics.chakraPositions) {
                        if (!this.smoothedBodyMetrics.chakraPositions[id]) {
                            this.smoothedBodyMetrics.chakraPositions[id] = { ...metrics.chakraPositions[id] };
                        } else {
                            this.smoothedBodyMetrics.chakraPositions[id].x += (metrics.chakraPositions[id].x - this.smoothedBodyMetrics.chakraPositions[id].x) * posAlpha;
                            this.smoothedBodyMetrics.chakraPositions[id].y += (metrics.chakraPositions[id].y - this.smoothedBodyMetrics.chakraPositions[id].y) * posAlpha;
                        }
                    }
                }
            }
        }

        this.bodyMetrics = this.smoothedBodyMetrics;

        // Apply dynamic scale to calibration
        if (this.bodyMetrics.dynamicScale) {
            this.dynamicChakraScale = this.bodyMetrics.dynamicScale;
        }
    }

    getFPS() {
        return this.actualFPS;
    }

    animate() {
        if (!this.isRunning) return;

        const now = performance.now();
        const delta = now - this.lastFrameTime;
        const frameTime = 1000 / this.targetFPS;

        this.frameCount++;
        if (now - this.lastFPSUpdate >= 1000) {
            this.actualFPS = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = now;
        }

        if (delta >= frameTime * 0.9) {
            this.lastFrameTime = now;
            this.animationPhase += 0.03;
            this.rotationOffset += 0.015;
            this.updateParticles();
            this.render();
        }

        requestAnimationFrame(() => this.animate());
    }

    updateParticles() {
        const targetCount = Math.floor(this.maxParticles * this.calibration.particleCount * this.overallActivation);

        while (this.particles.length < targetCount) {
            this.particles.push(this.createParticle());
        }

        while (this.particles.length > targetCount) {
            this.particles.pop();
        }

        for (const p of this.particles) {
            p.y -= p.speed;
            p.x += Math.sin(p.phase + this.animationPhase) * p.wobble;
            p.phase += 0.05;
            p.life -= 0.01;

            if (p.life <= 0 || p.y < -50) {
                this.resetParticle(p);
            }
        }
    }

    createParticle() {
        return {
            x: 0, y: 0,
            speed: 1 + Math.random() * 2,
            size: 2 + Math.random() * 4,
            life: 0.5 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2,
            wobble: 1 + Math.random() * 2,
            color: this.chakras[Math.floor(Math.random() * 7)].color
        };
    }

    resetParticle(p) {
        const w = window.innerWidth;
        const h = window.innerHeight;
        p.x = w * 0.3 + Math.random() * w * 0.4;
        p.y = h * 0.9;
        p.life = 0.5 + Math.random() * 0.5;
        p.speed = 1 + Math.random() * 2;
    }

    render() {
        const ctx = this.ctx;
        const w = window.innerWidth;
        const h = window.innerHeight;

        ctx.clearRect(0, 0, w, h);

        let centerX, bodyTop, bodyBottom, bodyWidth, bodyHeight;
        let chakraPositions = null;

        // Default body positioning (center of screen, occupying middle 60% vertically)
        centerX = w / 2;
        bodyTop = h * 0.08;
        bodyBottom = h * 0.88;
        bodyWidth = Math.min(w * 0.35, 400);
        bodyHeight = bodyBottom - bodyTop;

        // Override with detected body metrics if available
        if (this.bodyMetrics && this.bodyMetrics.centerX) {
            centerX = this.bodyMetrics.centerX;
            bodyTop = this.bodyMetrics.bodyTop || h * 0.08;
            bodyBottom = this.bodyMetrics.bodyBottom || h * 0.88;
            bodyWidth = this.bodyMetrics.bodyWidth || Math.min(w * 0.35, 400);
            bodyHeight = bodyBottom - bodyTop;

            // Use precise chakra positions from face detection if available
            if (this.bodyMetrics.chakraPositions) {
                chakraPositions = this.bodyMetrics.chakraPositions;
            }
        }

        // Dynamic scale from face detection + calibration
        const dynamicScale = (this.dynamicChakraScale || 1.0) * this.calibration.chakraSize;

        // Draw background energy effects
        this.drawEnergyField(ctx, centerX, bodyTop, bodyBottom, bodyWidth);
        this.drawParticles(ctx);
        this.drawSushumna(ctx, centerX, bodyTop, bodyBottom);
        this.drawNadis(ctx, centerX, bodyTop, bodyBottom, bodyWidth);

        // Calculate and draw each chakra at body position
        // Iterate in reverse order so Root (1) draws first, Crown (7) last (on top)
        for (let i = this.chakras.length - 1; i >= 0; i--) {
            const chakra = this.chakras[i];
            let x, y;

            if (chakraPositions && chakraPositions[chakra.id]) {
                // Use AR-tracked precise position
                x = chakraPositions[chakra.id].x;
                y = chakraPositions[chakra.id].y;
            } else {
                // Calculate position based on body proportion
                // chakra.position: 0 = top (Crown), increasing = lower (Root = 0.85)
                x = centerX;
                y = bodyTop + bodyHeight * chakra.position;
            }

            // Draw the chakra with Rig Vedic styling
            this.drawRigVedicChakra(ctx, x, y, chakra, bodyWidth, dynamicScale);
        }

        // Draw Kundalini energy flow
        this.drawKundaliniEnergy(ctx, centerX, bodyTop, bodyBottom);

        // Draw ghost/paranormal indicator (left side)
        this.drawGhostIndicator(ctx, w, h);

        // Draw intuition third eye indicator (right side)
        this.drawIntuitionIndicator(ctx, w, h);

        // Draw Yes/No Decision indicator (bottom center)
        this.drawDecisionIndicator(ctx, w, h);

        // Draw Shiva Mudras (bottom left)
        this.drawShivaMudras(ctx, w, h);

        // Draw Noise Type List (bottom right)
        this.drawNoiseTypeList(ctx, w, h);

        // Update animation phase
        this.intuitionPulse = (this.intuitionPulse + 0.05) % (Math.PI * 2);
    }

    drawDecisionIndicator(ctx, w, h) {
        if (!window.audioAnalyzer) return;

        const decision = window.audioAnalyzer.getDecisionSystem();
        const x = w / 2;
        const y = h - 80;

        // Background panel
        ctx.fillStyle = 'rgba(10, 15, 25, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x - 80, y - 35, 160, 70, 10);
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 150, 200, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Title
        ctx.fillStyle = 'rgba(150, 200, 255, 0.9)';
        ctx.font = 'bold 10px Consolas';
        ctx.textAlign = 'center';
        ctx.fillText('INTUITIVE ANSWER', x, y - 20);

        // Answer display
        let answerColor, answerText;
        if (decision.answer === 'YES') {
            answerColor = '#00ff88';
            answerText = '✓ YES';
        } else if (decision.answer === 'NO') {
            answerColor = '#ff4466';
            answerText = '✗ NO';
        } else {
            answerColor = '#aaaaaa';
            answerText = '◯ NEUTRAL';
        }

        ctx.fillStyle = answerColor;
        ctx.font = 'bold 22px Arial';
        ctx.fillText(answerText, x, y + 8);

        // Confidence bar
        const barWidth = 120;
        const barHeight = 6;
        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(x - barWidth/2, y + 18, barWidth, barHeight);

        ctx.fillStyle = answerColor;
        ctx.fillRect(x - barWidth/2, y + 18, barWidth * (decision.confidence / 100), barHeight);

        ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
        ctx.font = '9px Consolas';
        ctx.fillText(`${Math.round(decision.confidence)}% confidence`, x, y + 35);
    }

    drawShivaMudras(ctx, w, h) {
        const startX = 20;
        const startY = h - 150;
        const intuition = this.intuitionLevel;

        // Update active mudras based on intuition
        this.shivaMudras.forEach(mudra => {
            mudra.active = intuition >= mudra.minIntuition;
        });

        // Background panel
        ctx.fillStyle = 'rgba(10, 15, 25, 0.8)';
        ctx.beginPath();
        ctx.roundRect(startX - 5, startY - 20, 150, 160, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(180, 100, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Title
        ctx.fillStyle = 'rgba(180, 130, 255, 0.9)';
        ctx.font = 'bold 10px Consolas';
        ctx.textAlign = 'left';
        ctx.fillText('🙏 SHIVA MUDRAS', startX, startY - 5);

        // Draw each mudra
        this.shivaMudras.forEach((mudra, i) => {
            const y = startY + 15 + i * 22;
            const alpha = mudra.active ? 1.0 : 0.3;

            // Symbol
            ctx.font = '14px Arial';
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillText(mudra.symbol, startX, y + 5);

            // Name
            ctx.font = '9px Consolas';
            ctx.fillStyle = mudra.active ? 'rgba(180, 255, 180, 0.9)' : 'rgba(150, 150, 150, 0.5)';
            ctx.fillText(mudra.sanskrit, startX + 22, y);

            // Effect when active
            if (mudra.active) {
                ctx.fillStyle = 'rgba(100, 255, 150, 0.7)';
                ctx.font = '8px Consolas';
                ctx.fillText(mudra.effect, startX + 22, y + 10);
            } else {
                ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                ctx.font = '8px Consolas';
                ctx.fillText(`Need ${mudra.minIntuition}%`, startX + 22, y + 10);
            }
        });
    }

    drawNoiseTypeList(ctx, w, h) {
        if (!window.audioAnalyzer) return;

        const noiseTypes = window.audioAnalyzer.getNoiseTypes();
        const startX = w - 160;
        const startY = h - 150;

        // Background panel
        ctx.fillStyle = 'rgba(10, 15, 25, 0.8)';
        ctx.beginPath();
        ctx.roundRect(startX - 5, startY - 20, 155, 160, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(100, 200, 150, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Title
        ctx.fillStyle = 'rgba(100, 220, 180, 0.9)';
        ctx.font = 'bold 10px Consolas';
        ctx.textAlign = 'left';
        ctx.fillText('🎙️ DETECTED SOUNDS', startX, startY - 5);

        if (noiseTypes.length === 0) {
            ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
            ctx.font = '10px Consolas';
            ctx.fillText('Listening...', startX, startY + 20);
            return;
        }

        // Draw detected noise types (max 6)
        const displayTypes = noiseTypes.slice(0, 6);
        displayTypes.forEach((noise, i) => {
            const y = startY + 15 + i * 22;

            // Icon and type
            ctx.font = '12px Arial';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillText(noise.icon, startX, y + 4);

            ctx.font = '9px Consolas';
            ctx.fillStyle = 'rgba(150, 220, 200, 0.9)';
            ctx.fillText(noise.type, startX + 20, y);

            // Level bar
            const barWidth = 60;
            const barHeight = 4;
            const levelX = startX + 20;
            const levelY = y + 6;

            ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
            ctx.fillRect(levelX, levelY, barWidth, barHeight);

            const levelColor = noise.level > 70 ? '#ff6666' : noise.level > 40 ? '#ffaa44' : '#66ff88';
            ctx.fillStyle = levelColor;
            ctx.fillRect(levelX, levelY, barWidth * (noise.level / 100), barHeight);

            ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
            ctx.font = '8px Consolas';
            ctx.fillText(`${Math.round(noise.level)}%`, levelX + barWidth + 5, y + 4);
        });
    }

    drawRigVedicChakra(ctx, x, y, chakra, bodyWidth, dynamicScale) {
        const activation = Math.max(0.4, chakra.intensity / 100);
        const baseRadius = (22 + activation * 22) * dynamicScale;
        const pulse = 1 + 0.12 * Math.sin(this.animationPhase * 2 + chakra.id * 0.8);
        const radius = baseRadius * pulse;
        const intensity = this.calibration.glowIntensity;

        if (radius < 3) return;

        // Outer glow layers — more visible
        for (let glow = 3; glow > 0; glow--) {
            const glowRadius = radius + glow * 10;
            const alpha = activation * (1 - glow * 0.2) * 0.5 * intensity;
            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRgba(chakra.glowColor, alpha * 0.25);
            ctx.fill();
            ctx.strokeStyle = this.hexToRgba(chakra.glowColor, alpha);
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Main chakra disc — much more opaque
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, this.hexToRgba(chakra.glowColor, 0.95 * activation));
        gradient.addColorStop(0.45, this.hexToRgba(chakra.color, 0.8 * activation));
        gradient.addColorStop(0.85, this.hexToRgba(chakra.color, 0.5 * activation));
        gradient.addColorStop(1, this.hexToRgba(chakra.color, 0.15 * activation));
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Solid inner ring border
        ctx.beginPath();
        ctx.arc(x, y, radius * 0.92, 0, Math.PI * 2);
        ctx.strokeStyle = this.hexToRgba('#ffffff', 0.45 * activation);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Draw lotus petals
        this.drawLotusPetals(ctx, x, y, radius, chakra);

        // Draw Hindu yantra symbol specific to each chakra
        this.drawChakraYantra(ctx, x, y, radius, chakra, activation);

        // Draw Bija mantra at center
        if (chakra.mantra) {
            ctx.save();
            ctx.shadowColor = chakra.glowColor;
            ctx.shadowBlur = 8;
            ctx.fillStyle = this.hexToRgba('#ffffff', 0.85 + 0.15 * activation);
            ctx.font = `bold ${Math.max(16, radius * 0.55)}px Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(chakra.mantra, x, y);
            ctx.restore();
        }

        // Sanskrit name label
        const labelY = y + radius + 22;
        ctx.fillStyle = this.hexToRgba(chakra.glowColor, 0.9);
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(chakra.sanskrit || chakra.name, x, labelY);

        // English name
        ctx.fillStyle = this.hexToRgba('#ffffff', 0.8);
        ctx.font = '10px Consolas, monospace';
        ctx.fillText(chakra.name, x, labelY + 15);

        // Frequency, element & deity
        ctx.fillStyle = this.hexToRgba(chakra.color, 0.85);
        ctx.font = '9px Consolas';
        ctx.fillText(`${chakra.frequency}Hz • ${chakra.element} • ${chakra.deity}`, x, labelY + 28);
    }

    /**
     * Draw traditional Hindu yantra geometry inside each chakra
     */
    drawChakraYantra(ctx, x, y, radius, chakra, activation) {
        ctx.save();
        ctx.translate(x, y);

        const r = radius * 0.65;
        const lineAlpha = 0.7 * activation;
        const fillAlpha = 0.25 * activation;

        switch (chakra.id) {
            case 1: // MULADHARA — Yellow square (Prithvi yantra)
                ctx.rotate(this.animationPhase * 0.2);
                ctx.beginPath();
                ctx.rect(-r * 0.6, -r * 0.6, r * 1.2, r * 1.2);
                ctx.strokeStyle = this.hexToRgba('#ffdd44', lineAlpha);
                ctx.fillStyle = this.hexToRgba('#ffdd44', fillAlpha);
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
                // Downward triangle inside square
                ctx.beginPath();
                ctx.moveTo(0, r * 0.4);
                ctx.lineTo(-r * 0.4, -r * 0.25);
                ctx.lineTo(r * 0.4, -r * 0.25);
                ctx.closePath();
                ctx.strokeStyle = this.hexToRgba('#ff4444', lineAlpha * 0.8);
                ctx.lineWidth = 1.5;
                ctx.stroke();
                break;

            case 2: // SVADHISTHANA — Crescent moon (Apas/Water yantra)
                ctx.rotate(this.animationPhase * 0.25);
                // Inner circle
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
                ctx.strokeStyle = this.hexToRgba('#ff8822', lineAlpha);
                ctx.fillStyle = this.hexToRgba('#ff8822', fillAlpha);
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();
                // Crescent moon
                ctx.beginPath();
                ctx.arc(0, -r * 0.05, r * 0.45, Math.PI * 0.8, Math.PI * 0.2, false);
                ctx.strokeStyle = this.hexToRgba('#ffffff', lineAlpha);
                ctx.lineWidth = 2.5;
                ctx.stroke();
                // Second arc for crescent
                ctx.beginPath();
                ctx.arc(r * 0.1, -r * 0.12, r * 0.35, Math.PI * 0.85, Math.PI * 0.25, false);
                ctx.strokeStyle = this.hexToRgba('#ffcc88', lineAlpha * 0.7);
                ctx.lineWidth = 2;
                ctx.stroke();
                break;

            case 3: // MANIPURA — Downward red triangle (Agni/Fire yantra)
                ctx.rotate(this.animationPhase * 0.3);
                ctx.beginPath();
                ctx.moveTo(0, r * 0.55);
                ctx.lineTo(-r * 0.55, -r * 0.35);
                ctx.lineTo(r * 0.55, -r * 0.35);
                ctx.closePath();
                ctx.strokeStyle = this.hexToRgba('#ff4400', lineAlpha);
                ctx.fillStyle = this.hexToRgba('#ff6600', fillAlpha * 1.3);
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
                // T-shaped projections (swastika arms on the triangle)
                for (let i = 0; i < 3; i++) {
                    const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
                    const ex = r * 0.45 * Math.cos(a);
                    const ey = r * 0.45 * Math.sin(a);
                    ctx.beginPath();
                    ctx.moveTo(ex, ey);
                    ctx.lineTo(ex + r * 0.12 * Math.cos(a), ey + r * 0.12 * Math.sin(a));
                    ctx.strokeStyle = this.hexToRgba('#ffcc00', lineAlpha * 0.6);
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
                break;

            case 4: // ANAHATA — Two interlocking triangles / Shatkona (Air yantra)
                ctx.rotate(this.animationPhase * 0.2);
                // Upward triangle (Shiva)
                ctx.beginPath();
                ctx.moveTo(0, -r * 0.6);
                ctx.lineTo(-r * 0.52, r * 0.35);
                ctx.lineTo(r * 0.52, r * 0.35);
                ctx.closePath();
                ctx.strokeStyle = this.hexToRgba('#00ff88', lineAlpha);
                ctx.fillStyle = this.hexToRgba('#00ff88', fillAlpha * 0.7);
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
                // Downward triangle (Shakti)
                ctx.beginPath();
                ctx.moveTo(0, r * 0.6);
                ctx.lineTo(-r * 0.52, -r * 0.35);
                ctx.lineTo(r * 0.52, -r * 0.35);
                ctx.closePath();
                ctx.strokeStyle = this.hexToRgba('#88ffcc', lineAlpha);
                ctx.fillStyle = this.hexToRgba('#88ffcc', fillAlpha * 0.5);
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
                break;

            case 5: // VISHUDDHA — Circle within circle (Akasha/Ether yantra)
                ctx.rotate(this.animationPhase * 0.15);
                // Outer ring
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2);
                ctx.strokeStyle = this.hexToRgba('#00bbff', lineAlpha);
                ctx.fillStyle = this.hexToRgba('#00bbff', fillAlpha);
                ctx.lineWidth = 2;
                ctx.fill();
                ctx.stroke();
                // Downward triangle
                ctx.beginPath();
                ctx.moveTo(0, r * 0.38);
                ctx.lineTo(-r * 0.35, -r * 0.2);
                ctx.lineTo(r * 0.35, -r * 0.2);
                ctx.closePath();
                ctx.strokeStyle = this.hexToRgba('#ffffff', lineAlpha * 0.7);
                ctx.lineWidth = 1.5;
                ctx.stroke();
                // Small inner circle (bindu)
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
                ctx.fillStyle = this.hexToRgba('#ffffff', 0.6 * activation);
                ctx.fill();
                break;

            case 6: // AJNA — Downward triangle + Om (Third Eye)
                // Two petal arcs
                ctx.beginPath();
                ctx.ellipse(-r * 0.55, 0, r * 0.3, r * 0.55, 0, -Math.PI * 0.4, Math.PI * 0.4);
                ctx.strokeStyle = this.hexToRgba('#8866dd', lineAlpha);
                ctx.lineWidth = 2.5;
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(r * 0.55, 0, r * 0.3, r * 0.55, 0, Math.PI * 0.6, Math.PI * 1.4);
                ctx.strokeStyle = this.hexToRgba('#8866dd', lineAlpha);
                ctx.lineWidth = 2.5;
                ctx.stroke();
                // Downward triangle
                ctx.beginPath();
                ctx.moveTo(0, r * 0.35);
                ctx.lineTo(-r * 0.32, -r * 0.2);
                ctx.lineTo(r * 0.32, -r * 0.2);
                ctx.closePath();
                ctx.strokeStyle = this.hexToRgba('#ffffff', lineAlpha);
                ctx.fillStyle = this.hexToRgba('#bb88ff', fillAlpha);
                ctx.lineWidth = 1.5;
                ctx.fill();
                ctx.stroke();
                break;

            case 7: // SAHASRARA — Bindu (dot) + radiating lines (Cosmic consciousness)
                // Multiple concentric rings (representing 1000 petals)
                for (let ring = 3; ring >= 1; ring--) {
                    ctx.beginPath();
                    ctx.arc(0, 0, r * (ring * 0.2 + 0.1), 0, Math.PI * 2);
                    ctx.strokeStyle = this.hexToRgba('#bb88ff', lineAlpha * (1 - ring * 0.15));
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                }
                // Radiating lines
                for (let i = 0; i < 12; i++) {
                    const a = (i / 12) * Math.PI * 2 + this.animationPhase * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(r * 0.15 * Math.cos(a), r * 0.15 * Math.sin(a));
                    ctx.lineTo(r * 0.55 * Math.cos(a), r * 0.55 * Math.sin(a));
                    ctx.strokeStyle = this.hexToRgba('#ddbbff', lineAlpha * 0.5);
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
                // Central bindu
                ctx.beginPath();
                ctx.arc(0, 0, r * 0.1, 0, Math.PI * 2);
                ctx.fillStyle = this.hexToRgba('#ffffff', 0.9 * activation);
                ctx.fill();
                break;
        }

        ctx.restore();
    }

    drawLotusPetals(ctx, x, y, radius, chakra) {
        const petals = Math.min(16, chakra.petals || 4);
        const activation = Math.max(0.5, chakra.intensity / 100);
        const petalLength = radius * 0.35;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.animationPhase * 0.15);

        for (let i = 0; i < petals; i++) {
            const angle = (i / petals) * Math.PI * 2;
            ctx.save();
            ctx.rotate(angle);

            // Petal fill
            ctx.beginPath();
            ctx.ellipse(radius + petalLength * 0.3, 0, petalLength, petalLength * 0.35, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRgba(chakra.glowColor, 0.4 * activation);
            ctx.fill();

            // Petal outline
            ctx.strokeStyle = this.hexToRgba(chakra.color, 0.55 * activation);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();
    }

    drawAuraField(ctx, centerX, bodyTop, bodyBottom, bodyWidth) {
        // Removed - too much visual clutter
        // Aura info is shown in radar instead
        return;
    }

    drawGhostIndicator(ctx, w, h) {
        if (!window.audioAnalyzer) return;

        const ghostMetrics = window.audioAnalyzer.getGhostMetrics();
        const ghostLevel = ghostMetrics?.ghostFrequencyLevel || 0;

        if (ghostLevel < 15) return;

        const x = 80;
        const y = h / 2 - 100;
        const pulse = 1 + 0.2 * Math.sin(Date.now() / 150);

        // Ghost icon and level
        ctx.save();
        ctx.globalAlpha = Math.min(1, ghostLevel / 50);

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, 40 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 100, 100, ${ghostLevel / 200})`;
        ctx.fill();

        // Ghost emoji
        ctx.font = `${30 * pulse}px Arial`;
        ctx.fillStyle = `rgba(255, 200, 200, ${0.5 + ghostLevel / 200})`;
        ctx.textAlign = 'center';
        ctx.fillText('👻', x, y + 10);

        // Level text
        ctx.font = 'bold 12px Consolas';
        ctx.fillStyle = `rgba(255, 150, 150, 0.9)`;
        ctx.fillText(`${Math.round(ghostLevel)}%`, x, y + 40);
        ctx.fillText('ACTIVITY', x, y + 54);

        // Active entities
        if (ghostMetrics.activeEntities > 0) {
            ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
            ctx.fillText(`${ghostMetrics.activeEntities} ENTITIES`, x, y + 70);
        }

        ctx.restore();
    }

    drawIntuitionIndicator(ctx, w, h) {
        const x = w - 100;
        const y = h / 2;
        const baseRadius = 50;
        const activation = this.intuitionLevel / 100;

        if (activation < 0.05) return;

        const pulse = 1 + 0.1 * Math.sin(this.intuitionPulse * 3);
        const radius = baseRadius * pulse;

        // Outer glow rings
        for (let i = 4; i > 0; i--) {
            const glowRadius = radius + i * 15;
            const alpha = activation * (1 - i * 0.2) * 0.4;

            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(138, 43, 226, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }

        // Rotating third eye symbol
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.animationPhase * 0.5);

        // Eye outline
        ctx.beginPath();
        ctx.ellipse(0, 0, radius * 0.6, radius * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180, 100, 255, ${activation})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Pupil
        const pupilRadius = radius * 0.15 + activation * 0.05;
        const pupilGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pupilRadius);
        pupilGradient.addColorStop(0, `rgba(255, 255, 255, ${activation})`);
        pupilGradient.addColorStop(0.5, `rgba(180, 100, 255, ${activation})`);
        pupilGradient.addColorStop(1, `rgba(100, 50, 200, ${activation * 0.5})`);

        ctx.beginPath();
        ctx.arc(0, 0, pupilRadius, 0, Math.PI * 2);
        ctx.fillStyle = pupilGradient;
        ctx.fill();

        ctx.restore();

        // Label
        ctx.fillStyle = `rgba(180, 100, 255, ${activation})`;
        ctx.font = 'bold 12px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('INTUITION', x, y + radius + 25);
        ctx.fillText(`${Math.round(this.intuitionLevel)}%`, x, y + radius + 40);
        ctx.textAlign = 'left';
    }

    drawEnergyField(ctx, centerX, bodyTop, bodyBottom, bodyWidth) {
        // Simplified energy field - just a subtle outline
        const bodyHeight = bodyBottom - bodyTop;
        const centerY = (bodyTop + bodyBottom) / 2;
        const intensity = this.calibration.glowIntensity * 0.3;

        // Only 2 subtle layers
        for (let layer = 2; layer > 0; layer--) {
            const layerIntensity = this.overallActivation * 0.5;
            const breath = 1 + 0.03 * Math.sin(this.animationPhase * 0.4);
            const hRadius = (bodyWidth * 0.6 + layer * 15) * breath;
            const vRadius = (bodyHeight * 0.48 + layer * 20) * breath;
            const alpha = layerIntensity * 0.1 * intensity;

            const dominantChakra = this.getDominantChakra();
            const baseColor = this.hexToRgb(dominantChakra.color);

            ctx.beginPath();
            ctx.ellipse(centerX, centerY, hRadius, vRadius, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    drawParticles(ctx) {
        for (const p of this.particles) {
            const alpha = p.life * 0.8;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRgba(p.color, alpha * 0.3);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRgba(p.color, alpha);
            ctx.fill();
        }
    }

    drawSushumna(ctx, centerX, bodyTop, bodyBottom) {
        const intensity = this.calibration.glowIntensity;

        const gradient = ctx.createLinearGradient(centerX, bodyTop, centerX, bodyBottom);
        for (const chakra of this.chakras) {
            gradient.addColorStop(chakra.position, this.hexToRgba(chakra.color, 0.3 + this.overallActivation * 0.4));
        }

        for (let glow = 4; glow > 0; glow--) {
            const alpha = (0.2 + 0.3 * this.overallActivation) / glow * intensity;
            ctx.beginPath();
            ctx.moveTo(centerX, bodyTop - 20);
            ctx.lineTo(centerX, bodyBottom + 20);
            ctx.strokeStyle = `rgba(150, 220, 255, ${alpha})`;
            ctx.lineWidth = glow * 4;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.moveTo(centerX, bodyTop - 20);
        ctx.lineTo(centerX, bodyBottom + 20);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.stroke();

        const numParticles = Math.floor(15 + 25 * this.overallActivation);
        for (let i = 0; i < numParticles; i++) {
            const t = ((this.animationPhase * 0.4 + i / numParticles) % 1);
            const y = bodyTop + (bodyBottom - bodyTop) * t;
            const alpha = (1 - Math.abs(t - 0.5) * 2) * this.overallActivation;
            const size = 2 + 3 * Math.sin(this.animationPhase * 2 + i) * alpha;

            if (size > 1) {
                ctx.beginPath();
                ctx.arc(centerX, y, size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(220, 255, 255, ${alpha * 0.7})`;
                ctx.fill();
            }
        }
    }

    drawNadis(ctx, centerX, bodyTop, bodyBottom, bodyWidth) {
        const amplitude = bodyWidth * 0.3;
        this.drawNadiCurve(ctx, centerX, bodyTop, bodyBottom, -amplitude, '#6688cc', 0);
        this.drawNadiCurve(ctx, centerX, bodyTop, bodyBottom, amplitude, '#cc8866', Math.PI);
    }

    drawNadiCurve(ctx, centerX, bodyTop, bodyBottom, amplitude, color, phaseOffset) {
        const points = 100;
        const bodyHeight = bodyBottom - bodyTop;

        ctx.beginPath();

        for (let i = 0; i <= points; i++) {
            const t = i / points;
            const y = bodyTop + bodyHeight * t;
            const x = centerX + amplitude * Math.sin(t * Math.PI * 3.5 + phaseOffset + this.animationPhase * 0.3);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = this.hexToRgba(color, 0.15 + this.overallActivation * 0.15);
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    drawDocStrangeChakra(ctx, x, y, chakra, bodyWidth, dynamicScale = 1.0) {
        const activation = chakra.intensity / 100;
        const baseRadius = (30 + activation * 50) * dynamicScale;
        const pulse = 1 + 0.12 * Math.sin(this.animationPhase * 2.5 + chakra.id * 0.7);
        const radius = baseRadius * pulse;
        const intensity = this.calibration.glowIntensity;
        const complexity = this.calibration.geometryComplexity;

        if (activation < 0.05) {
            this.drawInactiveChakra(ctx, x, y, chakra);
            return;
        }

        for (let glow = 5; glow > 0; glow--) {
            const glowRadius = radius + glow * 15;
            const alpha = activation * (1 - glow * 0.15) * 0.35 * intensity;

            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            ctx.strokeStyle = this.hexToRgba(chakra.glowColor, alpha);
            ctx.lineWidth = glow * 4;
            ctx.stroke();
        }

        ctx.save();
        ctx.translate(x, y);

        const rotationSpeed = (chakra.id % 2 === 0 ? 1 : -1);

        this.drawMandalaRing(ctx, radius * 1.1, chakra, activation, complexity, rotationSpeed);
        this.drawSacredGeometryRing(ctx, radius * 0.75, chakra, activation, complexity, -rotationSpeed);
        this.drawInnerGeometry(ctx, radius * 0.5, chakra, activation, complexity, rotationSpeed * 0.5);

        ctx.restore();

        const coreRadius = radius * 0.25;
        const coreGradient = ctx.createRadialGradient(x, y, 0, x, y, coreRadius);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, ' + (activation * 0.9) + ')');
        coreGradient.addColorStop(0.3, this.hexToRgba(chakra.color, activation * 0.95));
        coreGradient.addColorStop(0.7, this.hexToRgba(chakra.glowColor, activation * 0.6));
        coreGradient.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(x, y, coreRadius, 0, Math.PI * 2);
        ctx.fillStyle = coreGradient;
        ctx.fill();

        this.drawFrequencyWave(ctx, x, y, radius, chakra, activation);

        if (activation > 0.1 && this.calibration.labelOpacity > 0) {
            this.drawHUDLabel(ctx, x + radius + 35, y, chakra, activation);
        }
    }

    drawInactiveChakra(ctx, x, y, chakra) {
        const radius = 15;

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.hexToRgba(chakra.color, 0.2);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRgba(chakra.color, 0.3);
        ctx.fill();
    }

    drawMandalaRing(ctx, radius, chakra, activation, complexity, rotationDir) {
        const phase = this.animationPhase * rotationDir + chakra.id;
        const segments = 12 * complexity;

        ctx.save();
        ctx.rotate(phase * 0.3);

        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const segmentAlpha = activation * (0.4 + 0.3 * Math.sin(this.animationPhase * 3 + i * 0.5));

            ctx.save();
            ctx.rotate(angle);

            ctx.beginPath();
            ctx.moveTo(radius * 0.7, 0);
            ctx.lineTo(radius, -3);
            ctx.lineTo(radius * 1.15, 0);
            ctx.lineTo(radius, 3);
            ctx.closePath();

            ctx.fillStyle = this.hexToRgba(chakra.color, segmentAlpha * 0.5);
            ctx.fill();
            ctx.strokeStyle = this.hexToRgba(chakra.glowColor, segmentAlpha);
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.restore();
        }

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = this.hexToRgba(chakra.color, activation * 0.6);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    drawSacredGeometryRing(ctx, radius, chakra, activation, complexity, rotationDir) {
        const phase = this.animationPhase * rotationDir + chakra.id * 0.5;

        ctx.save();
        ctx.rotate(phase * 0.5);

        const shapes = [6, 8, 12].slice(0, complexity);

        shapes.forEach((sides, idx) => {
            const shapeRadius = radius * (0.6 + idx * 0.2);
            const rotation = (idx % 2 === 0 ? 1 : -1) * this.animationPhase * 0.4;

            ctx.save();
            ctx.rotate(rotation);

            ctx.beginPath();
            for (let i = 0; i <= sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const px = shapeRadius * Math.cos(angle);
                const py = shapeRadius * Math.sin(angle);

                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            ctx.strokeStyle = this.hexToRgba(chakra.glowColor, activation * (0.5 - idx * 0.1));
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.restore();
        });

        const starPoints = 6;
        for (let i = 0; i < starPoints; i++) {
            const angle1 = (i / starPoints) * Math.PI * 2;
            const angle2 = ((i + 2) / starPoints) * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(radius * Math.cos(angle1), radius * Math.sin(angle1));
            ctx.lineTo(radius * Math.cos(angle2), radius * Math.sin(angle2));
            ctx.strokeStyle = this.hexToRgba(chakra.color, activation * 0.25);
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }

    drawInnerGeometry(ctx, radius, chakra, activation, complexity, rotationDir) {
        const phase = this.animationPhase * rotationDir + chakra.id * 0.3;

        ctx.save();
        ctx.rotate(phase);

        const spokes = chakra.id + 3;

        for (let i = 0; i < spokes; i++) {
            const angle = (i / spokes) * Math.PI * 2;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(radius * Math.cos(angle), radius * Math.sin(angle));
            ctx.strokeStyle = this.hexToRgba(chakra.glowColor, activation * 0.4);
            ctx.lineWidth = 2;
            ctx.stroke();

            const orbX = radius * 0.85 * Math.cos(angle);
            const orbY = radius * 0.85 * Math.sin(angle);

            ctx.beginPath();
            ctx.arc(orbX, orbY, 3 + activation * 2, 0, Math.PI * 2);
            ctx.fillStyle = this.hexToRgba(chakra.color, activation * 0.7);
            ctx.fill();
        }

        ctx.restore();
    }

    drawFrequencyWave(ctx, x, y, radius, chakra, activation) {
        const waveRadius = radius * 0.6;
        const waveAmplitude = 3 + activation * 5;
        const points = 36;

        ctx.beginPath();

        for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const wave = Math.sin(angle * chakra.id + this.animationPhase * 4) * waveAmplitude;
            const r = waveRadius + wave;

            const px = x + r * Math.cos(angle);
            const py = y + r * Math.sin(angle);

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }

        ctx.closePath();
        ctx.strokeStyle = this.hexToRgba(chakra.glowColor, activation * 0.5);
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    drawHUDLabel(ctx, x, y, chakra, activation) {
        const opacity = this.calibration.labelOpacity * activation;
        const boxWidth = 140;
        const boxHeight = 55;

        ctx.beginPath();
        ctx.moveTo(x - 35, y);
        ctx.lineTo(x - 8, y);
        ctx.lineTo(x - 3, y - 3);
        ctx.moveTo(x - 8, y);
        ctx.lineTo(x - 3, y + 3);
        ctx.strokeStyle = this.hexToRgba(chakra.color, opacity * 0.8);
        ctx.lineWidth = 2;
        ctx.stroke();

        const bgGradient = ctx.createLinearGradient(x, y - boxHeight/2, x + boxWidth, y + boxHeight/2);
        bgGradient.addColorStop(0, `rgba(0, 0, 0, ${opacity * 0.9})`);
        bgGradient.addColorStop(1, `rgba(10, 15, 25, ${opacity * 0.85})`);

        ctx.fillStyle = bgGradient;
        ctx.beginPath();
        ctx.roundRect(x, y - boxHeight / 2, boxWidth, boxHeight, 4);
        ctx.fill();

        ctx.strokeStyle = this.hexToRgba(chakra.color, opacity * 0.9);
        ctx.lineWidth = 2;
        ctx.stroke();

        const cornerSize = 8;
        ctx.strokeStyle = this.hexToRgba(chakra.glowColor, opacity);
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(x, y - boxHeight/2 + cornerSize);
        ctx.lineTo(x, y - boxHeight/2);
        ctx.lineTo(x + cornerSize, y - boxHeight/2);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + boxWidth - cornerSize, y + boxHeight/2);
        ctx.lineTo(x + boxWidth, y + boxHeight/2);
        ctx.lineTo(x + boxWidth, y + boxHeight/2 - cornerSize);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.font = 'bold 11px Consolas, monospace';
        ctx.fillText(chakra.name, x + 8, y - 14);

        ctx.fillStyle = this.hexToRgba(chakra.color, opacity);
        ctx.font = '10px Consolas, monospace';
        ctx.fillText(`${chakra.frequency} Hz`, x + 8, y + 2);

        ctx.fillStyle = `rgba(200, 255, 200, ${opacity})`;
        ctx.font = 'bold 14px Consolas, monospace';
        ctx.fillText(`${Math.round(chakra.intensity)}%`, x + 85, y + 2);

        ctx.fillStyle = `rgba(150, 180, 200, ${opacity * 0.8})`;
        ctx.font = '9px Consolas, monospace';
        ctx.fillText(chakra.element, x + 8, y + 18);
    }

    drawKundaliniEnergy(ctx, centerX, bodyTop, bodyBottom) {
        if (this.overallActivation < 0.3) return;

        const kundaliniHeight = (bodyBottom - bodyTop) * this.overallActivation;
        const kundaliniTop = bodyBottom - kundaliniHeight;

        const gradient = ctx.createLinearGradient(centerX, bodyBottom, centerX, kundaliniTop);
        gradient.addColorStop(0, 'rgba(255, 100, 50, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 50, 0.4)');
        gradient.addColorStop(1, 'rgba(255, 255, 150, 0.2)');

        ctx.beginPath();
        const amplitude = 20 + 30 * this.overallActivation;

        for (let y = bodyBottom; y >= kundaliniTop; y -= 2) {
            const t = (bodyBottom - y) / (bodyBottom - kundaliniTop);
            const x = centerX + amplitude * Math.sin(t * Math.PI * 4 + this.animationPhase * 2) * (1 - t * 0.5);

            if (y === bodyBottom) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = gradient;
        ctx.lineWidth = 6 - this.overallActivation * 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        if (this.overallActivation > 0.5) {
            const flameY = kundaliniTop;
            const flameX = centerX + amplitude * Math.sin(this.animationPhase * 2) * 0.3;

            for (let i = 3; i > 0; i--) {
                ctx.beginPath();
                ctx.arc(flameX, flameY - 10, 8 + i * 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 200, 100, ${0.3 / i})`;
                ctx.fill();
            }
        }
    }

    getDominantChakra() {
        return this.chakras.reduce((max, c) => c.intensity > max.intensity ? c : max, this.chakras[0]);
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    hexToRgba(hex, alpha) {
        const { r, g, b } = this.hexToRgb(hex);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

window.ARRenderer = ARRenderer;






