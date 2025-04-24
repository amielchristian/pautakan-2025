import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { College } from '../src/types';
import colleges from '../public/colleges.json';

// In ES modules, __dirname is not available directly, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The built directory structure
process.env.APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist');

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST;

let mainView: BrowserWindow | null;
let techView: BrowserWindow | null;

// Data
let category = 'Eliminations';
let difficulty = 'Easy';
let division = 'Teams';
let topFiveColleges: College[] = [];

// IPC handlers
function initializeIPC() {
  // File: electron/main.ts
  // Function: ipcMain.handle('sync-category')

  ipcMain.handle('sync-category', (_, data?) => {
    const oldCategory = category;
    if (data) category = data;

    // If changing from Eliminations to Finals, ensure we have top five colleges
    if (oldCategory === 'Eliminations' && category === 'Finals') {
      // If top five colleges are not already set, calculate them now
      if (topFiveColleges.length === 0) {
        topFiveColleges = [...colleges]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .filter((college) => college.score > 0);
      }

      // Only proceed if we have exactly 5 colleges with scores
      if (topFiveColleges.length === 5) {
        // Reset scores for the top five colleges
        topFiveColleges = topFiveColleges.map((college) => ({
          ...college,
          score: 0,
        }));

        // Update the scores in the main colleges array
        topFiveColleges.forEach((college) => {
          const index = colleges.findIndex((c) => c.id === college.id);
          if (index !== -1) {
            colleges[index].score = 0;
          }
        });

        // Send signal to switch to finals but don't show leaderboard
        mainView?.webContents.send('switch-to-finals', topFiveColleges);
      } else {
        // Revert to Eliminations if we don't have 5 colleges with scores
        category = 'Eliminations';
        mainView?.webContents.send('category-synced', category);
        return { category, topFiveColleges: [] };
      }
    } else {
      // Normal category sync
      mainView?.webContents.send('category-synced', category);
    }

    return { category, topFiveColleges };
  });

  ipcMain.handle('sync-difficulty', (_, data, clincherColleges) => {
    if (data) difficulty = data;
    // Send both difficulty and clincher colleges to the main view
    mainView?.webContents.send('difficulty-synced', difficulty, clincherColleges);
    return { success: true };
  });

  ipcMain.handle('sync-division', (_, data) => {
    if (data) division = data;
    colleges.forEach((college) => {
      college.score = 0;
    });
    mainView?.webContents.send('division-synced', division);
    return { success: true };
  });

  ipcMain.handle('update-top-five', (_, selectedColleges) => {
    // Store the top five colleges for other operations to use
    topFiveColleges = selectedColleges;

    // If in Finals mode, make sure the main view shows these colleges
    if (category === 'Finals') {
      mainView?.webContents.send('switch-to-finals', topFiveColleges);
    }

    return { success: true };
  });

  // for eliminations
  ipcMain.handle('show-top-five', (_, selectedColleges) => {
    // Store the top five colleges for other operations to use
    topFiveColleges = selectedColleges;

    // If in Finals mode, make sure the main view shows these colleges
    if (category === 'Finals') {
      mainView?.webContents.send('switch-to-finals', topFiveColleges);
    }

    mainView?.webContents.send('top-five-colleges', topFiveColleges);

    return { success: true };
  });

  ipcMain.handle('show-top-three', (_, selectedColleges) => {
    mainView?.webContents.send('switch-to-finals', topFiveColleges);

    mainView?.webContents.send('top-three-colleges', selectedColleges);

    return { success: true };
  });

  ipcMain.handle('close-top-five', () => {
    // Just hide the leaderboard popup, don't change the mode
    mainView?.webContents.send('close-top-five');
    return { success: true };
  });

  ipcMain.handle('get-colleges', () => {
    // If we're in Finals mode, only return top five colleges
    if (category === 'Finals' && topFiveColleges.length === 5) {
      return topFiveColleges;
    }

    // Otherwise return all colleges
    return colleges;
  });

  ipcMain.handle('update-college-score', (_, shorthand, newScore) => {
    try {
      // Update score in colleges array
      for (let i = 0; i < colleges.length; i++) {
        if (colleges[i].shorthand === shorthand) {
          // Update the score
          colleges[i].score = newScore;
          break;
        }
      }

      // Update score in topFiveColleges if it exists there
      for (let i = 0; i < topFiveColleges.length; i++) {
        if (topFiveColleges[i].shorthand === shorthand) {
          topFiveColleges[i].score = newScore;
          break;
        }
      }

      // Notify all windows about the update
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('score-updated', shorthand, newScore);
        window.webContents.send('db-updated');
      });

      return { success: true };
    } catch (err) {
      console.error(`Error updating score for ${shorthand}:`, err);
      return { success: false, error: err };
    }
  });

  ipcMain.handle('reset-scores', () => {
    try {
      // Reset all scores
      colleges.forEach((college) => {
        college.score = 0;
      });

      // Clear the top five colleges
      topFiveColleges = [];

      // If we were in Finals mode, switch back to Eliminations
      if (category === 'Finals') {
        category = 'Eliminations';
        mainView?.webContents.send('category-synced', category);
      }

      // Notify all windows about the reset
      BrowserWindow.getAllWindows().forEach((window) => {
        window.webContents.send('scores-reset');
      });

      return { success: true };
    } catch (err) {
      console.error('Error resetting scores:', err);
      return { success: false, error: err };
    }
  });

  ipcMain.handle('refresh', () => {
    // If we're in Finals mode, ensure the main view shows the top five
    if (category === 'Finals' && topFiveColleges.length === 5) {
      mainView?.webContents.send('switch-to-finals', topFiveColleges);
    } else {
      mainView?.webContents.send('refresh');
    }
    return { success: true };
  });

  ipcMain.handle('get-top-five', () => {
    return topFiveColleges;
  });
}

// Views
function createWindow() {
  mainView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'CENTER VAULT.png'),
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
    frame: false,
  });

  mainView.webContents.on('before-input-event', (event, input) => {
    if (
      (input.control || input.meta) &&
      (input.key === '+' ||
        input.key === '-' ||
        input.key === '=' ||
        input.key === '0')
    ) {
      event.preventDefault();
    }
  });

  techView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'CENTER VAULT.png'),
    width: 1000, // Fixed width
    height: 1080, // Fixed height
    resizable: false, // Prevent resizing
    useContentSize: true, // Use content dimensions exactly as specified
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    mainView = null;
    techView = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(async () => {
  try {
    initializeIPC();
    createWindow();
  } catch (err) {
    console.error('Failed to initialize application:', err);
  }
});
