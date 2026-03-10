# SHRIVYOM AR Intuition System

[![CI](https://github.com/satyabratsahoo/shrivyom-ar-intuition/actions/workflows/ci.yml/badge.svg)](https://github.com/satyabratsahoo/shrivyom-ar-intuition/actions/workflows/ci.yml)
[![Release](https://github.com/satyabratsahoo/shrivyom-ar-intuition/actions/workflows/release.yml/badge.svg)](https://github.com/satyabratsahoo/shrivyom-ar-intuition/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Version](https://img.shields.io/github/v/release/satyabratsahoo/shrivyom-ar-intuition?label=version)](https://github.com/satyabratsahoo/shrivyom-ar-intuition/releases)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![GPU](https://img.shields.io/badge/GPU-Accelerated-green)

## Ultimate Chakra Visualization & Intuition Training

A high-performance Electron-based AR application that visualizes the 7 Kundalini chakras with Doctor Strange-style sacred geometry effects overlaid on live camera feed. Features GPU-accelerated rendering optimized for high refresh rate displays (up to 144Hz).

---

## ✨ Features

### 🎯 Core Features
- **7 Kundalini Chakras** - Full visualization with accurate body alignment
- **Doctor Strange Style** - Rotating sacred geometry, mandala rings, portal effects
- **AR Overlay** - Chakras aligned to detected face/body position with dynamic scaling
- **Intuition Indicator** - Third Eye-style intuition meter with real-time feedback
- **Real-time Metrics** - Focus, Stillness, Breath, Calmness, Balance tracking
- **EEG Simulation** - Brainwave state visualization (Alpha, Beta, Theta, Gamma, Delta)
- **Audio Analysis** - Noise detection and nearby intuition sensing

### 🚀 Performance
- **144Hz Support** - Optimized for high refresh rate displays
- **GPU Acceleration** - WebGL, hardware compositing, zero-copy
- **Adaptive Sync** - Works with G-Sync/FreeSync displays
- **Auto-Calibration** - Adjusts to display resolution, DPI, and face distance

### 🎨 Visual Effects
- **Aura Field** - Multi-layer energy field visualization
- **Kundalini Energy** - Rising serpent energy animation
- **Nadis** - Ida and Pingala energy channel visualization
- **Sushumna** - Central energy spine with flowing particles
- **Sacred Geometry** - Hexagons, octagons, dodecagons, star patterns
- **Dynamic Sizing** - Chakras scale based on face distance from camera

### 🔊 Audio Features
- **Solfeggio Frequencies** - 396Hz to 963Hz healing tones per chakra
- **Binaural Beats** - Brainwave entrainment with stereo panning
- **Session Activation Sequence** - Progressive chakra opening
- **Chakra-specific Tones** - Each chakra plays its resonant frequency
- **Intuition Frequencies** - Third Eye + Crown combined tones
- **Noise Balancing** - Environmental audio compensation

### 🧠 EEG Derivation
- **Audio-based Analysis** - Derives brainwave patterns from audio
- **State Detection** - Delta, Theta, Alpha, Beta, Gamma waves
- **Real-time Updates** - EEG state changes based on metrics
- **Biometric Correlation** - Maps calmness/focus to brainwave states

---

## 🖥️ System Requirements

### Minimum
- **OS**: Windows 10 / macOS 10.14 / Ubuntu 18.04
- **CPU**: Intel i5 or AMD Ryzen 5
- **RAM**: 8GB
- **GPU**: Integrated graphics with WebGL 2.0 support
- **Display**: 1920x1080 @ 60Hz

### Recommended
- **OS**: Windows 11 / macOS 12 / Ubuntu 22.04
- **CPU**: Intel i7 or AMD Ryzen 7
- **RAM**: 16GB
- **GPU**: NVIDIA RTX 3060 / AMD RX 6600 or better
- **Display**: 2560x1440 @ 144Hz with Adaptive Sync

---

## 🛠️ Installation

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

### Build Standalone Application

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `ESC` | Exit application |
| `F11` | Toggle fullscreen |
| `SPACE` | Start/Stop session |
| `A` | Toggle device selectors |
| `C` | Refresh camera list |
| `M` | Mute/Unmute audio |
| `+` / `-` | Increase/Decrease chakra size |
| `[` / `]` | Decrease/Increase glow intensity |

---

## 🎡 The 7 Kundalini Chakras

| # | Name | Sanskrit | Frequency | Element | Color |
|---|------|----------|-----------|---------|-------|
| 7 | Sahasrara | सहस्रार | 963 Hz | Cosmic Energy | Purple |
| 6 | Ajna | आज्ञा | 852 Hz | Light | Indigo |
| 5 | Vishuddha | विशुद्ध | 741 Hz | Ether | Blue |
| 4 | Anahata | अनाहत | 639 Hz | Air | Green |
| 3 | Manipura | मणिपुर | 528 Hz | Fire | Yellow |
| 2 | Svadhisthana | स्वाधिष्ठान | 417 Hz | Water | Orange |
| 1 | Muladhara | मूलाधार | 396 Hz | Earth | Red |

---

## 📊 Metrics Explained

### Biometrics
- **Focus** - Mental concentration level
- **Stillness** - Physical stability measure
- **Breath** - Breathing pattern analysis
- **Calmness** - Overall relaxation state
- **Balance** - Combined equilibrium metric

### Environment
- **Noise Level** - Ambient sound intensity
- **Nearby Intuition** - Low-frequency energy detection
- **Frequency Balance** - Environmental harmony measure

### EEG States
- **Delta (0.5-4 Hz)** - Deep sleep, healing
- **Theta (4-8 Hz)** - Meditation, creativity
- **Alpha (8-13 Hz)** - Relaxed awareness
- **Beta (13-30 Hz)** - Active thinking
- **Gamma (30-100 Hz)** - Higher consciousness

---

## 🔧 Configuration

### Auto-Calibration
The app automatically calibrates based on:
- Screen resolution
- Display refresh rate
- DPI/Scale factor
- Available GPU capabilities
- Face distance from camera (dynamic sizing)

### Session Flow
When you start a session:
1. **Grounding** - Root chakra tone plays for stability
2. **Opening Sweep** - Quick activation through all 7 chakras
3. **Progressive Activation** - Each chakra activates for 30 seconds
4. **Binaural Beats** - Brainwave entrainment runs continuously
5. **Closing** - Heart-centered descending sequence on stop

### Manual Calibration
Use keyboard shortcuts or modify calibration settings:

```javascript
calibrationSettings = {
    bodyScale: 1.0,      // Body tracking scale
    chakraSize: 1.0,     // Chakra visualization size
    glowIntensity: 1.0,  // Glow effect intensity
    particleCount: 1.0,  // Energy particle density
    labelOpacity: 0.9,   // HUD label visibility
    geometryComplexity: 3 // Sacred geometry detail (1-5)
}
```

---

## 📁 Project Structure

```
shrivyom-ar-intuition/
├── main.js              # Electron main process
├── index.html           # Main HTML with HUD layout
├── package.json         # Dependencies and scripts
├── .gitignore           # Git ignore rules
├── .eslintrc.json       # ESLint configuration
├── .editorconfig        # Editor settings
├── LICENSE              # MIT License
├── CHANGELOG.md         # Version history
├── CONTRIBUTING.md      # Contribution guide
├── .github/
│   ├── workflows/
│   │   ├── ci.yml       # CI pipeline (lint + build)
│   │   └── release.yml  # Release pipeline (build + publish)
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
├── assets/              # Icons and static assets
├── scripts/
│   ├── app.js           # Main application logic
│   ├── ar-renderer.js   # AR chakra rendering
│   ├── audio-analyzer.js # Audio processing
│   ├── chakra-audio.js  # Sound generation
│   ├── face-detection.js # Face/body tracking
│   └── hud-controller.js # HUD management
└── styles/
    └── main.css         # Dark theme styling
```

---

## 🎯 Development

### Run with DevTools
```bash
npm run dev
```

### Debug Commands
- Open DevTools: `Ctrl+Shift+I` (when in dev mode)
- Reload: `Ctrl+R`
- Toggle Console: `F12`

---

## 🐛 Troubleshooting

### Camera Not Working
1. Check browser/app camera permissions
2. Try selecting a different camera from the dropdown
3. Press `C` to refresh camera list

### Low FPS
1. Close other GPU-intensive applications
2. Reduce geometry complexity with calibration
3. Ensure GPU acceleration is enabled

### Audio Issues
1. Select correct audio input device
2. Check system audio permissions
3. Verify microphone is not muted

---

## 📜 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 📋 Versioning

This project uses [Semantic Versioning](https://semver.org/). See [CHANGELOG.md](CHANGELOG.md) for release history.

To create a new release:

```bash
# Bump version (patch, minor, or major)
npm version patch -m "chore: release v%s"

# Tags are pushed automatically via postversion script
# GitHub Actions will build and create a release
```

---

## 🙏 Acknowledgments

- Inspired by Doctor Strange visual effects
- Based on traditional Kundalini yoga chakra system
- Solfeggio frequencies from ancient healing traditions

**SHRIVYOM** - _Awakening Intuition Through Technology_
