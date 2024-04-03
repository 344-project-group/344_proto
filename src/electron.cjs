const windowStateManager = require('electron-window-state');
const { app, BrowserWindow, ipcMain } = require('electron');
const serve = require('electron-serve');
const path = require('path');
const env = require('dotenv').config();

try {
  require('electron-reloader')(module);
} catch (e) {
  console.error(e)
  console.log('Electron reloader is disabled');
}

const serveURL = serve({ directory: '.' });
const port = env.PORT || 3344;
const isDev = env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  let mainWindowState = windowStateManager('main', {
    defaultWidth: 800,
    defaultHeight: 600,
  });

  const mainWindow = new BrowserWindow({
    backgroundColor: '#fff',
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: true,
      contextIsolation: false,
      spellcheck: false,
      devTools: isDev,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
  });

  mainWindowState.manage(mainWindow);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindowState.saveState(mainWindow);
  });

  return mainWindow;
}

function loadVite(port) {
  mainWindow.loadURL(`http://localhost:${port}`).catch((err) => {
    console.log("Error loading URL, retrying.\n", err);
    setTimeout(() => loadVite(port), 200);
  });
}

function createMainWindow() {
  mainWindow = createWindow();
  mainWindow.once('close', () => {
    mainWindow = null;
  });
  
  loadVite(port);
}

app.on('ready', createMainWindow);
app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.on('to-main', (event, count) => {
  return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
});