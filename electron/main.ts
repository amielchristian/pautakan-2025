import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sqlite3 from 'sqlite3';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..');

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let mainView: BrowserWindow | null;
let techView: BrowserWindow | null;

// DB
const db = new sqlite3.Database('./db.sqlite3', (err) => {
  if (err) {
    console.error(err.message);
  }
});
const colleges = JSON.parse(
  fs.readFileSync(
    path.join(process.env.VITE_PUBLIC, './colleges.json'),
    'utf-8'
  )
);

db.serialize(() => {
  db.run('DROP TABLE IF EXISTS colleges');
  db.run(
    'CREATE TABLE IF NOT EXISTS colleges (id INTEGER PRIMARY KEY, name TEXT, shorthand TEXT, imagePath TEXT)'
  );
  for (const college of colleges) {
    db.run(
      'INSERT INTO colleges (name, shorthand, imagePath) VALUES (?, ?, ?)',
      [college.name, college.shortHand, college.imagePath]
    );
  }
});

// IPC handlers
function initializeIPC() {
  ipcMain.handle('getColleges', () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM colleges', (err, rows) => {
        if (err) {
          console.error("Couldn't get colleges");
          reject(err);
        }
        resolve(rows);
      });
    });
  });
}

// Views
function createWindow() {
  mainView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'), // Changed to .cjs
    },
    frame: false,
    alwaysOnTop: true,
  });

  // Set fullscreen mode
  mainView.setFullScreen(true);

  techView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  // Test active push message to Renderer-process.
  mainView.webContents.on('did-finish-load', () => {
    mainView?.webContents.send(
      'main-process-message',
      new Date().toLocaleString()
    );
  });

  if (VITE_DEV_SERVER_URL) {
    mainView.loadURL(VITE_DEV_SERVER_URL);
    techView.loadURL(VITE_DEV_SERVER_URL + '/control.html');
  } else {
    mainView.loadFile(path.join(RENDERER_DIST, 'index.html'));
    techView.loadFile(path.join(RENDERER_DIST, 'control.html'));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    mainView = null;
    techView = null;
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  initializeIPC();
  createWindow();
});
