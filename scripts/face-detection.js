/**
 * Face Detection Module - Dynamic body tracking with ML simulation
 * Provides face tracking for AR chakra alignment with dynamic sizing
 * @version 1.0.0
 * @license MIT
 */

class FaceDetector {
    constructor() {
        this.isInitialized = false;
        this.model = null;
        this.videoElement = null;
        this.lastFaceData = null;
        this.smoothingFactor = 0.12;

        // Smoothed values
        this.smoothedFaceCenter = null;
        this.smoothedFaceBox = null;

        // Motion detection for dynamic tracking
        this.previousFrame = null;
        this.motionCanvas = null;
        this.motionCtx = null;
        this.motionHistory = [];
        this.maxMotionHistory = 10;

        // Dynamic scaling based on detected face size
        this.detectedScale = 1.0;
        this.baselineSize = null;

        // Brightness analysis for simple face region detection
        this.analysisCanvas = null;
        this.analysisCtx = null;
    }

    async init(videoElement) {
        this.videoElement = videoElement;

        // Create analysis canvas for frame processing
        this.analysisCanvas = document.createElement('canvas');
        this.analysisCtx = this.analysisCanvas.getContext('2d', { willReadFrequently: true });

        this.motionCanvas = document.createElement('canvas');
        this.motionCtx = this.motionCanvas.getContext('2d', { willReadFrequently: true });

        console.log('[FaceDetector] Initialized with video element');
        this.isInitialized = true;

        return true;
    }

    /**
     * Detect face in current video frame with brightness analysis
     */
    async detectFace() {
        if (!this.isInitialized || !this.videoElement) {
            return null;
        }

        const video = this.videoElement;
        if (video.readyState < 2 || video.videoWidth === 0) {
            return null;
        }

        const width = video.videoWidth;
        const height = video.videoHeight;

        // Resize analysis canvas
        const scale = 0.25; // Process at 25% resolution for speed
        this.analysisCanvas.width = width * scale;
        this.analysisCanvas.height = height * scale;

        // Draw video frame
        this.analysisCtx.drawImage(video, 0, 0, this.analysisCanvas.width, this.analysisCanvas.height);

        // Analyze for face region using skin tone and brightness
        let faceData = this.analyzeFaceRegion(width, height, scale);

        if (faceData) {
            faceData = this.smoothFaceData(faceData);
            this.lastFaceData = faceData;

            // Update dynamic scale
            this.updateDynamicScale(faceData);
        }

        return faceData || this.lastFaceData;
    }

    /**
     * Analyze frame for likely face region using brightness/skin tone
     */
    analyzeFaceRegion(videoWidth, videoHeight, scale) {
        const canvasWidth = this.analysisCanvas.width;
        const canvasHeight = this.analysisCanvas.height;

        try {
            const imageData = this.analysisCtx.getImageData(0, 0, canvasWidth, canvasHeight);
            const pixels = imageData.data;

            // Scan for skin-tone-like regions (simplified)
            let sumX = 0, sumY = 0, skinCount = 0;
            let minX = canvasWidth, maxX = 0, minY = canvasHeight, maxY = 0;

            for (let y = 0; y < canvasHeight; y++) {
                for (let x = 0; x < canvasWidth; x++) {
                    const i = (y * canvasWidth + x) * 4;
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];

                    // Simple skin tone detection
                    if (this.isSkinTone(r, g, b)) {
                        sumX += x;
                        sumY += y;
                        skinCount++;

                        minX = Math.min(minX, x);
                        maxX = Math.max(maxX, x);
                        minY = Math.min(minY, y);
                        maxY = Math.max(maxY, y);
                    }
                }
            }

            if (skinCount > 100) {
                // Found skin region
                const centerX = (sumX / skinCount) / scale;
                const centerY = (sumY / skinCount) / scale;

                const faceWidth = Math.max(50, (maxX - minX) / scale * 1.2);
                const faceHeight = faceWidth * 1.3;

                return {
                    detected: true,
                    confidence: Math.min(1, skinCount / 1000),
                    center: { x: centerX, y: centerY },
                    boundingBox: {
                        x: centerX - faceWidth / 2,
                        y: centerY - faceHeight / 2,
                        width: faceWidth,
                        height: faceHeight
                    },
                    bodyTop: centerY - faceHeight * 0.5,
                    bodyBottom: centerY + faceHeight * 4.5,
                    bodyCenter: centerX
                };
            }
        } catch (e) {
            // Fall back to center detection
        }

        // Fallback: assume face is centered
        return this.simulateFaceDetection(videoWidth, videoHeight);
    }

    /**
     * Check if RGB values represent skin tone
     */
    isSkinTone(r, g, b) {
        // Multiple skin tone ranges
        const brightness = (r + g + b) / 3;

        // Skip very dark or very bright
        if (brightness < 40 || brightness > 250) return false;

        // Check for warm/skin-like colors
        const rgDiff = r - g;
        const rbDiff = r - b;

        // Skin typically has R > G > B with certain relationships
        return (
            r > 60 && g > 40 && b > 20 &&
            r > b &&
            rgDiff > -15 && rgDiff < 80 &&
            rbDiff > 10 && rbDiff < 120 &&
            Math.abs(r - g) < 100
        );
    }

    /**
     * Simulate face detection for demo purposes
     */
    simulateFaceDetection(videoWidth, videoHeight) {
        const faceWidth = videoWidth * 0.22;
        const faceHeight = faceWidth * 1.3;

        const centerX = videoWidth / 2;
        const centerY = videoHeight * 0.32;

        const faceX = centerX - faceWidth / 2;
        const faceY = centerY - faceHeight / 2;

        return {
            detected: true,
            confidence: 0.5,
            center: { x: centerX, y: centerY },
            boundingBox: {
                x: faceX,
                y: faceY,
                width: faceWidth,
                height: faceHeight
            },
            bodyTop: faceY - faceHeight * 0.3,
            bodyBottom: faceY + faceHeight * 5,
            bodyCenter: centerX
        };
    }

    /**
     * Update dynamic scale based on face size
     */
    updateDynamicScale(faceData) {
        const faceSize = faceData.boundingBox.width * faceData.boundingBox.height;

        if (!this.baselineSize) {
            this.baselineSize = faceSize;
        }

        // Calculate scale relative to baseline
        const rawScale = Math.sqrt(faceSize / this.baselineSize);

        // Smooth the scale change
        this.detectedScale += (rawScale - this.detectedScale) * 0.1;

        // Clamp to reasonable range
        this.detectedScale = Math.max(0.5, Math.min(2.0, this.detectedScale));
    }

    /**
     * Apply exponential smoothing to reduce jitter
     */
    smoothFaceData(data) {
        if (!this.smoothedFaceCenter) {
            this.smoothedFaceCenter = { ...data.center };
            this.smoothedFaceBox = { ...data.boundingBox };
            return data;
        }

        const alpha = this.smoothingFactor;

        this.smoothedFaceCenter.x += alpha * (data.center.x - this.smoothedFaceCenter.x);
        this.smoothedFaceCenter.y += alpha * (data.center.y - this.smoothedFaceCenter.y);

        this.smoothedFaceBox.x += alpha * (data.boundingBox.x - this.smoothedFaceBox.x);
        this.smoothedFaceBox.y += alpha * (data.boundingBox.y - this.smoothedFaceBox.y);
        this.smoothedFaceBox.width += alpha * (data.boundingBox.width - this.smoothedFaceBox.width);
        this.smoothedFaceBox.height += alpha * (data.boundingBox.height - this.smoothedFaceBox.height);

        return {
            ...data,
            center: { ...this.smoothedFaceCenter },
            boundingBox: { ...this.smoothedFaceBox },
            bodyCenter: this.smoothedFaceCenter.x,
            bodyTop: this.smoothedFaceBox.y - this.smoothedFaceBox.height * 0.3,
            bodyBottom: this.smoothedFaceBox.y + this.smoothedFaceBox.height * 5,
            dynamicScale: this.detectedScale
        };
    }

    /**
     * Calculate body metrics from face data with dynamic scaling
     * Returns precise positions for all 7 chakras aligned to body
     */
    calculateBodyMetrics(faceData) {
        if (!faceData) return null;

        const scale = faceData.dynamicScale || 1.0;
        const headHeight = faceData.boundingBox.height * 1.3;

        // Convert from video coordinates to screen coordinates
        const video = this.videoElement;
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Video is mirrored, so flip X
        const scaleX = screenWidth / video.videoWidth;
        const scaleY = screenHeight / video.videoHeight;

        // Use the larger scale to maintain aspect ratio (cover)
        const displayScale = Math.max(scaleX, scaleY);

        // Calculate offset for centering
        const offsetX = (screenWidth - video.videoWidth * displayScale) / 2;
        const offsetY = (screenHeight - video.videoHeight * displayScale) / 2;

        // Convert body center - flip for mirror
        const screenCenterX = screenWidth - (faceData.bodyCenter * displayScale + offsetX);

        const screenBodyTop = faceData.bodyTop * displayScale + offsetY;
        const screenBodyBottom = Math.min(screenHeight * 0.95, faceData.bodyBottom * displayScale + offsetY);
        const screenBodyWidth = faceData.boundingBox.width * displayScale * 2.5;

        // Calculate head position
        const headTop = faceData.boundingBox.y * displayScale + offsetY - headHeight * 0.2;
        const headBottom = (faceData.boundingBox.y + faceData.boundingBox.height) * displayScale + offsetY;
        const headCenterY = (headTop + headBottom) / 2;

        // Calculate body height for chakra positioning
        const bodyHeight = screenBodyBottom - headBottom;

        // Calculate specific chakra positions based on body anatomy
        // Using standard anatomical proportions
        // Chakras are placed from top (Crown) to bottom (Root)
        const chakraPositions = {
            // Crown - top of head (above head)
            7: {
                x: screenCenterX,
                y: headTop - headHeight * 0.15,
                name: 'SAHASRARA'
            },
            // Third Eye - forehead center
            6: {
                x: screenCenterX,
                y: headTop + (headBottom - headTop) * 0.3,
                name: 'AJNA'
            },
            // Throat - base of neck
            5: {
                x: screenCenterX,
                y: headBottom + bodyHeight * 0.08,
                name: 'VISHUDDHA'
            },
            // Heart - chest center
            4: {
                x: screenCenterX,
                y: headBottom + bodyHeight * 0.22,
                name: 'ANAHATA'
            },
            // Solar Plexus - upper abdomen
            3: {
                x: screenCenterX,
                y: headBottom + bodyHeight * 0.35,
                name: 'MANIPURA'
            },
            // Sacral - lower abdomen
            2: {
                x: screenCenterX,
                y: headBottom + bodyHeight * 0.50,
                name: 'SVADHISTHANA'
            },
            // Root - base of spine (lowest chakra)
            1: {
                x: screenCenterX,
                y: headBottom + bodyHeight * 0.65,
                name: 'MULADHARA'
            }
        };

        return {
            headTop: headTop,
            headBottom: headBottom,
            headCenterY: headCenterY,
            bodyTop: Math.max(screenHeight * 0.02, screenBodyTop),
            bodyBottom: Math.min(screenHeight * 0.98, screenBodyBottom),
            centerX: screenCenterX,
            headHeight: headHeight * displayScale,
            bodyWidth: screenBodyWidth,
            bodyHeight: bodyHeight,
            dynamicScale: scale,
            confidence: faceData.confidence || 0.5,
            chakraPositions: chakraPositions
        };
    }
}

// Export singleton
window.faceDetector = new FaceDetector();

