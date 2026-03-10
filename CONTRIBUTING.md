# Contributing to Shrivyom AR Intuition

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- [Git](https://git-scm.com/)

### Setup

```bash
# Fork and clone the repo
git clone https://github.com/<your-username>/shrivyom-ar-intuition.git
# Or clone the original:
# git clone https://github.com/satyabratsahoo/shrivyom-ar-intuition.git
cd shrivyom-ar-intuition

# Install dependencies
npm install

# Start in development mode
npm run dev
```

## Development Workflow

### Branch Naming

- `feature/<description>` — New features
- `fix/<description>` — Bug fixes
- `docs/<description>` — Documentation changes
- `refactor/<description>` — Code refactoring

### Making Changes

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-feature
   ```
2. Make your changes
3. Run the linter:
   ```bash
   npm run lint
   ```
4. Test locally:
   ```bash
   npm run dev
   ```
5. Commit with a clear message:
   ```bash
   git commit -m "feat: add new visualization mode"
   ```
6. Push and open a Pull Request

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation only
- `style:` — Formatting, no code change
- `refactor:` — Code restructuring
- `perf:` — Performance improvement
- `chore:` — Build, CI, or tooling changes

## Project Structure

```
├── main.js              # Electron main process
├── index.html           # HUD interface
├── scripts/
│   ├── app.js           # Main app logic & initialization
│   ├── ar-renderer.js   # WebGL chakra rendering
│   ├── audio-analyzer.js # Audio processing & analysis
│   ├── chakra-audio.js  # Solfeggio & binaural generation
│   ├── face-detection.js # Face/body tracking
│   └── hud-controller.js # HUD metrics & display
├── styles/
│   └── main.css         # Dark theme UI
└── assets/              # Icons & static files
```

## Code Style

- Use `const` / `let`, not `var`
- Use descriptive class and method names
- Keep methods focused and under ~50 lines where possible
- Add JSDoc comments for public methods

## Reporting Issues

Use the [GitHub Issues](https://github.com/satyabratsahoo/shrivyom-ar-intuition/issues) tab with the provided templates.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
