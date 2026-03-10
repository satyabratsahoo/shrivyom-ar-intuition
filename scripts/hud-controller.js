/**
 * HUD Controller - Manages all HUD elements and metrics display
 * Enhanced with chakra visualization and improved radar
 * @version 1.0.0
 * @license MIT
 */

class HUDController {
    constructor() {
        this.metrics = {
            focus: 0,
            stillness: 0,
            breath: 0,
            calmness: 0,
            balance: 0,
            noise: 0,
            nearbyIntuition: 0,
            intuition: 0
        };

        this.chakraValues = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0
        };

        this.sessionStartTime = null;
        this.sessionActive = false;
        this.eegState = 'UNKNOWN';
        this.sessionDuration = 0;

        // Radar animation
        this.radarAngle = 0;
        this.radarCanvas = null;
        this.radarCtx = null;

        this.init();
    }

    init() {
        // Initialize radar canvas
        this.radarCanvas = document.getElementById('radar-canvas');
        if (this.radarCanvas) {
            this.radarCtx = this.radarCanvas.getContext('2d');
        }

        // Start radar animation
        this.animateRadar();
    }

    updateMetrics(newMetrics) {
        Object.assign(this.metrics, newMetrics);
        this.renderMetrics();
    }

    updateChakraValues(values) {
        Object.assign(this.chakraValues, values);
        this.renderChakras();
    }

    renderChakras() {
        for (let i = 1; i <= 7; i++) {
            const bar = document.getElementById(`chakra-${i}-bar`);
            const value = document.getElementById(`chakra-${i}-value`);
            const intensity = Math.round(this.chakraValues[i] || 0);

            if (bar) bar.style.width = `${Math.min(100, intensity)}%`;
            if (value) value.textContent = `${intensity}%`;
        }

        // Update intuition circle
        const intuitionCircle = document.getElementById('intuition-circle');
        if (intuitionCircle) {
            const circumference = 283;
            const offset = circumference - (circumference * this.metrics.intuition / 100);
            intuitionCircle.style.strokeDashoffset = offset;
        }
    }

    renderMetrics() {
        // Update bar fills and values
        this.updateBar('focus', this.metrics.focus);
        this.updateBar('stillness', this.metrics.stillness);
        this.updateBar('breath', this.metrics.breath);
        this.updateBar('calmness', this.metrics.calmness);
        this.updateBar('balance', this.metrics.balance);
        this.updateBar('noise', this.metrics.noise);
        this.updateBar('nearby', this.metrics.nearbyIntuition);

        // Update intuition display
        const intuitionValue = document.getElementById('intuition-value');
        if (intuitionValue) {
            intuitionValue.textContent = `${Math.round(this.metrics.intuition)}%`;

            // Color based on level
            if (this.metrics.intuition >= 70) {
                intuitionValue.style.color = '#00cc88';
            } else if (this.metrics.intuition >= 40) {
                intuitionValue.style.color = '#cccc00';
            } else {
                intuitionValue.style.color = '#cc6666';
            }
        }

        // Update intuition status
        this.updateIntuitionStatus();

        // Update frequency balance
        this.updateFrequencyBalance();
    }

    updateBar(name, value) {
        const bar = document.getElementById(`${name}-bar`);
        const valueEl = document.getElementById(`${name}-value`);

        if (bar) {
            bar.style.width = `${Math.max(0, Math.min(100, value))}%`;
        }
        if (valueEl) {
            valueEl.textContent = `${Math.round(value)}%`;
        }
    }

    updateIntuitionStatus() {
        const statusEl = document.getElementById('intuition-status');
        if (!statusEl) return;

        let status, color;
        const level = this.metrics.intuition;

        if (level >= 80) {
            status = '⚡ PEAK ACTIVATION';
            color = '#00ff88';
        } else if (level >= 60) {
            status = '▲ HIGH INTUITION';
            color = '#88ff00';
        } else if (level >= 40) {
            status = '● MEDIUM STATE';
            color = '#ffff00';
        } else if (level >= 20) {
            status = '▼ LOW STATE';
            color = '#ff8800';
        } else {
            status = '○ MINIMAL';
            color = '#ff4444';
        }

        statusEl.querySelector('.status-text').textContent = status;
        statusEl.style.borderColor = color;
        statusEl.style.color = color;
    }

    updateFrequencyBalance() {
        const freqFill = document.getElementById('freq-bar-fill');
        const freqValue = document.getElementById('freq-value');
        const freqBalance = document.getElementById('freq-balance');

        const balance = Math.max(0, 100 - this.metrics.noise);

        if (freqFill) {
            freqFill.style.width = `${balance}%`;
        }
        if (freqValue) {
            freqValue.textContent = `${Math.round(balance)}%`;
        }

        if (freqBalance) {
            let color;
            if (balance > 70) {
                color = '#00aa77';
            } else if (balance > 40) {
                color = '#aaaa00';
            } else {
                color = '#aa4444';
            }
            freqBalance.style.borderColor = color;
        }
    }

    updateEEGState(state) {
        this.eegState = state.toUpperCase();
        const eegText = document.getElementById('eeg-text');
        const eegState = document.getElementById('eeg-state');

        if (eegText) {
            eegText.textContent = this.eegState;
        }

        if (eegState) {
            const colors = {
                'DELTA': '#880088',
                'THETA': '#6666ff',
                'ALPHA': '#00ff66',
                'BETA': '#ffff00',
                'GAMMA': '#ff6666',
                'UNKNOWN': '#888888'
            };
            eegState.style.borderColor = colors[this.eegState] || '#888888';
        }
    }

    startSession() {
        this.sessionStartTime = Date.now();
        this.sessionActive = true;
        this.updateSessionTime();
    }

    stopSession() {
        this.sessionActive = false;
        this.sessionStartTime = null;
    }

    updateSessionTime() {
        if (!this.sessionActive) return;

        const elapsed = Math.floor((Date.now() - this.sessionStartTime) / 1000);
        const hours = Math.floor(elapsed / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsed % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');

        const timeEl = document.getElementById('session-time');
        if (timeEl) {
            timeEl.textContent = `${hours}:${minutes}:${seconds}`;
        }

        requestAnimationFrame(() => this.updateSessionTime());
    }

    animateRadar() {
        if (!this.radarCtx) {
            requestAnimationFrame(() => this.animateRadar());
            return;
        }

        const ctx = this.radarCtx;
        const w = this.radarCanvas.width;
        const h = this.radarCanvas.height;
        const centerX = w / 2;
        const centerY = h / 2;
        const radius = Math.min(w, h) / 2 - 10;

        // Clear with dark background
        ctx.fillStyle = 'rgba(5, 10, 15, 0.95)';
        ctx.fillRect(0, 0, w, h);

        // Get radar data from audio analyzer
        let radarData = null;
        if (window.audioAnalyzer) {
            radarData = window.audioAnalyzer.getRadarData();
        }

        // Draw radar rings with glow
        for (let i = 1; i <= 4; i++) {
            const r = radius * (i / 4);
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);

            // Ghost activity affects ring color
            const ghostLevel = radarData?.ghostLevel || 0;
            const greenVal = Math.max(80, 160 - ghostLevel);
            const redVal = Math.min(100, ghostLevel);
            ctx.strokeStyle = `rgba(${redVal}, ${greenVal}, 120, ${0.5 - i * 0.1})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Cross lines
        ctx.beginPath();
        ctx.moveTo(centerX - radius, centerY);
        ctx.lineTo(centerX + radius, centerY);
        ctx.moveTo(centerX, centerY - radius);
        ctx.lineTo(centerX, centerY + radius);
        ctx.strokeStyle = 'rgba(0, 160, 120, 0.2)';
        ctx.stroke();

        // Sweep line animation
        this.radarAngle = (this.radarAngle + 0.025) % (Math.PI * 2);

        // Sweep gradient trail
        for (let i = 0; i < 40; i++) {
            const angle = this.radarAngle - i * 0.04;
            const alpha = 0.5 * (1 - i / 40);

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + radius * Math.cos(angle),
                centerY + radius * Math.sin(angle)
            );

            // Color based on ghost activity
            const ghostHue = radarData?.ghostLevel > 30 ? '255, 100, 100' : '0, 200, 150';
            ctx.strokeStyle = `rgba(${ghostHue}, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // Draw nearby presences/auras
        if (radarData?.presences && radarData.presences.length > 0) {
            radarData.presences.forEach((presence, i) => {
                const angleRad = (presence.angle * Math.PI) / 180;
                const dist = (parseFloat(presence.distance) / 5) * radius * 0.85;
                const x = centerX + dist * Math.cos(angleRad);
                const y = centerY + dist * Math.sin(angleRad);

                // Aura color
                const auraColors = {
                    RED: '#ff4444',
                    ORANGE: '#ff8844',
                    YELLOW: '#ffff44',
                    GREEN: '#44ff88',
                    BLUE: '#4488ff',
                    INDIGO: '#8844ff',
                    VIOLET: '#ff44ff',
                    WHITE: '#ffffff',
                    BLACK: '#444444'
                };

                const color = auraColors[presence.auraType] || '#00ffaa';
                const pulse = 1 + 0.3 * Math.sin(Date.now() / 200 + i);
                const size = 4 + (presence.strength / 100) * 6;

                // Glow
                ctx.beginPath();
                ctx.arc(x, y, size * 2.5 * pulse, 0, Math.PI * 2);
                ctx.fillStyle = color.replace('#', 'rgba(').replace(/(..)(..)(..)/, (m, r, g, b) =>
                    `${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, 0.2)`);
                ctx.fill();

                // Core
                ctx.beginPath();
                ctx.arc(x, y, size * pulse, 0, Math.PI * 2);
                ctx.fillStyle = color;
                ctx.fill();

                // Label
                ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.font = '8px Consolas';
                ctx.fillText(presence.auraType.charAt(0), x - 3, y + 3);
            });
        }

        // Draw chakra metric points
        const values = [
            this.metrics.focus,
            this.metrics.stillness,
            this.metrics.breath,
            this.metrics.calmness,
            this.metrics.intuition,
            this.metrics.balance,
            this.metrics.nearbyIntuition
        ];

        const colors = [
            '#aa0000', '#aa6600', '#aaaa00', '#00aa66',
            '#0066aa', '#6600aa', '#aa66aa'
        ];

        values.forEach((value, i) => {
            if (value < 5) return;

            const angle = (i / 7) * Math.PI * 2;
            const distance = radius * 0.15 + (value / 100) * radius * 0.3;
            const x = centerX + distance * Math.cos(angle);
            const y = centerY + distance * Math.sin(angle);

            const blipSize = 2 + (value / 100) * 3;
            const pulse = 1 + 0.2 * Math.sin(Date.now() / 250 + i);

            ctx.beginPath();
            ctx.arc(x, y, blipSize * pulse, 0, Math.PI * 2);
            ctx.fillStyle = colors[i];
            ctx.fill();
        });

        // Draw center indicator
        const centerPulse = 1 + 0.15 * Math.sin(Date.now() / 300);
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6 * centerPulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 255, 200, 0.8)';
        ctx.fill();

        // Display stats
        ctx.fillStyle = 'rgba(150, 255, 200, 0.9)';
        ctx.font = 'bold 9px Consolas';

        // Aura count
        const auraCount = radarData?.auraCount || 0;
        ctx.fillText(`AURAS: ${auraCount}`, 5, 12);

        // Ghost level
        const ghostLevel = Math.round(radarData?.ghostLevel || 0);
        if (ghostLevel > 10) {
            ctx.fillStyle = `rgba(255, ${150 - ghostLevel}, ${150 - ghostLevel}, 0.9)`;
            ctx.fillText(`👻 ${ghostLevel}%`, 5, 24);
        }

        // Dominant aura
        if (radarData?.dominantAura && radarData.dominantAura !== 'NONE') {
            ctx.fillStyle = 'rgba(200, 150, 255, 0.9)';
            ctx.fillText(`${radarData.dominantAura}`, w - 45, 12);
        }

        // Active entities
        if (radarData?.activeEntities > 0) {
            ctx.fillStyle = 'rgba(255, 200, 100, 0.9)';
            ctx.fillText(`ENTITIES: ${radarData.activeEntities}`, 5, h - 5);
        }

        requestAnimationFrame(() => this.animateRadar());
    }
}

// Export
window.HUDController = HUDController;

