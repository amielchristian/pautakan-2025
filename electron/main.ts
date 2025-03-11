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
function initializeDB(): sqlite3.Database {
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
    // db.run('DROP TABLE IF EXISTS colleges');

    // Checks if table exists - if so, no insert is done
    let isEmpty: boolean = true;
    db.run(
      'CREATE TABLE colleges (id INTEGER PRIMARY KEY, name TEXT, shorthand TEXT, imagePath TEXT, score NUMBER)',
      () => {
        isEmpty = false;
      }
    );
    if (isEmpty) {
      for (const college of colleges) {
        db.run(
          'INSERT INTO colleges (name, shorthand, imagePath, score) VALUES (?, ?, ?, ?)',
          [college.name, college.shortHand, college.imagePath, 0]
        );
      }
    }
  });

  return db;
}

// IPC handlers
function initializeIPC(db: sqlite3.Database) {
  ipcMain.handle('change-category', (_, category) => {
    console.log('Category change invoked.');
    mainView?.webContents.send('category-changed', category);
  });

  ipcMain.handle('change-difficulty', (_, difficulty) => {
    mainView?.webContents.send('difficulty-changed', difficulty);
  });

  ipcMain.handle('get-colleges', () => {
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

  // Update college score
  ipcMain.handle('update-college-score', (_, shortHand, newScore) => {
    console.log('Score update invoked.');
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE colleges SET score = ? WHERE shortHand = ?',
        [newScore, shortHand],
        function (err) {
          if (err) {
            console.error(`Error updating score for ${shortHand}:`, err);
            reject(err);
          } else {
            // Notify all windows about the update
            BrowserWindow.getAllWindows().forEach((window) => {
              window.webContents.send('score-updated', shortHand, newScore);
              window.webContents.send('db-updated');
            });
            resolve({ success: true, changes: this.changes });
          }
        }
      );
    });
  });

  // // Reset all scores
  // ipcMain.handle('reset-scores', () => {
  //   return new Promise((resolve, reject) => {
  //     db.run('UPDATE college SET score = 0', function (err) {
  //       if (err) {
  //         console.error('Error resetting scores:', err);
  //         reject(err);
  //       } else {
  //         // Notify all windows about the reset
  //         BrowserWindow.getAllWindows().forEach((window) => {
  //           window.webContents.send('scores-reset');
  //         });
  //         resolve({ success: true, changes: this.changes });
  //       }
  //     });
  //   });
  // });
}

// Views
function createWindow() {
  mainView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    // width: 1920,
    // height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    // frame: false,
    // alwaysOnTop: true,
  });

  // Set fullscreen mode
  // mainView.setFullScreen(true);

  techView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });
  techView.on('close', () => {
    app.quit();
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
  const db = initializeDB();
  initializeIPC(db);
  createWindow();
});
