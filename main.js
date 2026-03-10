/**
 * Shrivyom AR Intuition System - Electron Main Process
 * High-performance AR chakra visualization with GPU acceleration
 * @version 1.0.0
 * @license MIT
 */

const { app, BrowserWindow, ipcMain, screen, Menu } = require('electron');
const path = require('path');

let mainWindow = null;
let displayInfo = null;

// Enable maximum GPU acceleration flags before app is ready
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-webgl');
app.commandLine.appendSwitch('enable-webgl2-compute-context');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');
app.commandLine.appendSwitch('disable-gpu-vsync');
app.commandLine.appendSwitch('max-gum-fps', '144');
app.commandLine.appendSwitch('enable-features', 'VaapiVideoDecoder,VaapiVideoEncoder,Metal,Vulkan');
app.commandLine.appendSwitch('enable-unsafe-webgpu');
app.commandLine.appendSwitch('use-angle', 'default');
app.commandLine.appendSwitch('enable-oop-rasterization');
app.commandLine.appendSwitch('canvas-oop-rasterization');
app.commandLine.appendSwitch('enable-hardware-overlays', 'single-fullscreen,single-on-top,underlay');

// Disable frame rate limiting
app.commandLine.appendSwitch('disable-frame-rate-limit');

function createWindow() {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.size;
    const workArea = primaryDisplay.workAreaSize;
    const refreshRate = primaryDisplay.displayFrequency || 144;
    const scaleFactor = primaryDisplay.scaleFactor || 1;

    displayInfo = {
        width: width,
        height: height,
        workAreaWidth: workArea.width,
        workAreaHeight: workArea.height,
        refreshRate: refreshRate,
        scaleFactor: scaleFactor,
        colorDepth: primaryDisplay.colorDepth || 24,
        colorSpace: primaryDisplay.colorSpace || 'srgb'
    };

    console.log(`[Main] Display: ${width}x${height} @ ${refreshRate}Hz (scale: ${scaleFactor})`);
    console.log(`[Main] Work Area: ${workArea.width}x${workArea.height}`);

    mainWindow = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        fullscreen: true,
        frame: false,
        transparent: false,
        backgroundColor: '#000000',
        show: false,
        hasShadow: false,
        skipTaskbar: false,
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webgl: true,
            experimentalFeatures: true,
            backgroundThrottling: false,
            offscreen: false,
            v8CacheOptions: 'bypassHeatCheck',
            spellcheck: false
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    // Hide menu bar
    Menu.setApplicationMenu(null);

    // Optimize for high refresh rate display
    mainWindow.webContents.setFrameRate(refreshRate);

    // Enable vsync-free rendering
    mainWindow.webContents.setBackgroundThrottling(false);

    mainWindow.loadFile('index.html');

    // Show window when ready to prevent flickering
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();

        // Send display info to renderer
        mainWindow.webContents.send('display-info', displayInfo);
    });

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Handle display changes
    screen.on('display-metrics-changed', (event, display, changedMetrics) => {
        if (mainWindow && changedMetrics.includes('scaleFactor')) {
            displayInfo.scaleFactor = display.scaleFactor;
            mainWindow.webContents.send('display-info', displayInfo);
        }
    });
}

// Handle fullscreen toggle
ipcMain.on('toggle-fullscreen', () => {
    if (mainWindow) {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
});

// Handle app exit
ipcMain.on('exit-app', () => {
    app.quit();
});

// Get display info
ipcMain.handle('get-display-info', async () => {
    return displayInfo;
});

// Get GPU info
ipcMain.handle('get-gpu-info', async () => {
    return app.getGPUInfo('complete');
});

// Get system memory info
ipcMain.handle('get-memory-info', async () => {
    return process.getHeapStatistics ? process.getHeapStatistics() : {};
});

// Force window calibration
ipcMain.on('calibrate-display', () => {
    if (mainWindow) {
        const display = screen.getPrimaryDisplay();
        mainWindow.setBounds({
            x: 0,
            y: 0,
            width: display.size.width,
            height: display.size.height
        });
        mainWindow.setFullScreen(true);
    }
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle GPU process crash
app.on('gpu-process-crashed', (event, killed) => {
    console.error('[Main] GPU process crashed:', killed);
    if (mainWindow) {
        mainWindow.webContents.reload();
    }
});

// Handle renderer process crash
app.on('render-process-gone', (event, webContents, details) => {
    console.error('[Main] Renderer process gone:', details);
});
