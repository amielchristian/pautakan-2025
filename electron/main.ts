import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { College } from '../src/types';

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
let division ='Teams';
let topFiveColleges: College[] = [];

// Mock colleges data directly in memory
const colleges: College[] = [
  {
    id: 1,
    name: 'College of Rehabilitation Sciences',
    shorthand: 'CRS',
    imagePath: './images/colleges/CRS.png',
    score: 0,
  },
  {
    id: 2,
    name: 'College of Accountancy',
    shorthand: 'AMV',
    imagePath: './images/colleges/ACC.png',
    score: 0,
  },
  {
    id: 3,
    name: 'Faculty of Arts and Letters',
    shorthand: 'AB',
    imagePath: './images/colleges/AB.png',
    score: 0,
  },
  {
    id: 4,
    name: 'College of Commerce and Business Administration',
    shorthand: 'COMM',
    imagePath: './images/colleges/COMM.png',
    score: 0,
  },
  {
    id: 5,
    name: 'College of Education',
    shorthand: 'EDUC',
    imagePath: './images/colleges/EDUC.png',
    score: 0,
  },
  {
    id: 6,
    name: 'Faculty of Engineering',
    shorthand: 'ENGG',
    imagePath: './images/colleges/ENGG.png',
    score: 0,
  },
  {
    id: 7,
    name: 'College of Information and Computing Sciences',
    shorthand: 'CICS',
    imagePath: './images/colleges/CICS.png',
    score: 0,
  },
  {
    id: 8,
    name: 'Faculty of Medicine and Surgery',
    shorthand: 'MEDSURG',
    imagePath: './images/colleges/MED.png',
    score: 0,
  },
  {
    id: 9,
    name: 'Conservatory of Music',
    shorthand: 'MUSIC',
    imagePath: './images/colleges/MUSIC.png',
    score: 0,
  },
  {
    id: 10,
    name: 'College of Nursing',
    shorthand: 'NURSING',
    imagePath: './images/colleges/NURSING.png',
    score: 0,
  },
  {
    id: 11,
    name: 'Faculty of Pharmacy',
    shorthand: 'PHARMA',
    imagePath: './images/colleges/PHARMA.png',
    score: 0,
  },
  {
    id: 12,
    name: 'Institute of Physical Education and Athletics',
    shorthand: 'IPEA',
    imagePath: './images/colleges/IPEA.png',
    score: 0,
  },
  {
    id: 13,
    name: 'College of Science',
    shorthand: 'COS',
    imagePath: './images/colleges/COS.png',
    score: 0,
  },
  {
    id: 14,
    name: 'College of Tourism and Hospitality Management',
    shorthand: 'CTHM',
    imagePath: './images/colleges/CTHM.png',
    score: 0,
  },
  {
    id: 15,
    name: 'Faculty of Civil Law',
    shorthand: 'CIVIL LAW',
    imagePath: './images/colleges/LAW.png',
    score: 0,
  },
];

// IPC handlers
function initializeIPC() {
  ipcMain.handle('sync-category', (_, data?) => {
    const oldCategory = category;
    if (data) category = data;

    // Reset scores when changing between Elimination and Finals
    if (oldCategory !== category) {
      // Only reset top five when switching back to eliminations
      if (category === 'Eliminations') {
        topFiveColleges = [];
      }
    }

    if (
      oldCategory === 'Eliminations' &&
      category === 'Finals' &&
      topFiveColleges.length > 0
    ) {
      mainView?.webContents.send('switch-to-finals', topFiveColleges);
    } else {
      mainView?.webContents.send('category-synced', category);
    }

    return { category, topFiveColleges };
  });

  ipcMain.handle('sync-difficulty', (_, data) => {
    if (data) difficulty = data;
    mainView?.webContents.send('difficulty-synced', difficulty);
  });

  ipcMain.handle('sync-division', (_, data) => {
    if (data) division = data;
    mainView?.webContents.send('division-synced', division);
  });
  
  ipcMain.handle('show-top-five', (_, selectedColleges) => {
    topFiveColleges = selectedColleges;
    mainView?.webContents.send('top-five-colleges', topFiveColleges);
    return { success: true };
  });

  ipcMain.handle('get-colleges', () => {
    // If we're in Finals mode and have top five colleges, only return those
    if (category === 'Finals' && topFiveColleges.length > 0) {
      return topFiveColleges;
    }

    // Return all colleges
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
      // The adjustRadius flag is no longer needed here - RadarView will handle it
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
      topFiveColleges.forEach((college) => {
        college.score = 0;
      });

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
    mainView?.webContents.send('refresh');
  });

  ipcMain.handle('get-top-five', () => {
    return topFiveColleges;
  });

  ipcMain.handle('close-top-five', () => {
    // Forward the event to the MainView
    if (mainView) {
      mainView.webContents.send('close-top-five');
    }
  });
}

// Views
function createWindow() {
  mainView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
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
      (input.key === '+' || input.key === '-' || input.key === '=' || input.key === '0')
    ) {
      event.preventDefault();
    }
  });

  techView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    width: 880,              // Fixed width
    height: 880,             // Fixed height
    resizable: false,        // Prevent resizing
    useContentSize: true,    // Use content dimensions exactly as specified
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