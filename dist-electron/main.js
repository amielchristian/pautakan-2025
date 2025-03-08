import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sqlite3 from "sqlite3";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log("Current file:", __filename);
console.log("Current directory:", __dirname);
process.env.APP_ROOT = path.join(__dirname, "..");
const APP_ROOT = process.env.APP_ROOT;
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const RENDERER_DIST = path.join(APP_ROOT, "dist");
const PUBLIC_DIR = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, "public") : RENDERER_DIST;
console.log("APP_ROOT:", APP_ROOT);
console.log("RENDERER_DIST:", RENDERER_DIST);
console.log("PUBLIC_DIR:", PUBLIC_DIR);
let mainWindow = null;
let controlWindow = null;
const dbPath = path.join(APP_ROOT, "college_rankings.db");
console.log("Database path:", dbPath);
const db = new sqlite3.Database(dbPath);
const colleges = [
  {
    name: "College of Rehabilitation Sciences",
    shortHand: "CRS",
    imagePath: "public/icons/CRS.png"
  },
  {
    name: "College of Accountancy",
    shortHand: "ACC",
    imagePath: "public/icons/ACC.png"
  },
  {
    name: "College of Architecture",
    shortHand: "ARKI",
    imagePath: "public/icons/ARKI.png"
  },
  {
    name: "Faculty of Arts and Letters",
    shortHand: "AB",
    imagePath: "public/icons/AB.png"
  },
  {
    name: "Faculty of Civil Law",
    shortHand: "LAW",
    imagePath: "public/icons/LAW.png"
  },
  {
    name: "College of Commerce and Business Administration",
    shortHand: "COMM",
    imagePath: "public/icons/COMM.png"
  },
  {
    name: "College of Education",
    shortHand: "EDUC",
    imagePath: "public/icons/EDUC.png"
  },
  {
    name: "Faculty of Engineering",
    shortHand: "ENGG",
    imagePath: "public/icons/ENGG.png"
  },
  {
    name: "College of Information and Computing Sciences",
    shortHand: "CICS",
    imagePath: "public/icons/CICS.png"
  },
  {
    name: "Faculty of Medicine and Surgery",
    shortHand: "MED",
    imagePath: "public/icons/MED.png"
  },
  {
    name: "Conservatory of Music",
    shortHand: "MUSIC",
    imagePath: "public/icons/MUSIC.png"
  },
  {
    name: "College of Nursing",
    shortHand: "NUR",
    imagePath: "public/icons/NURSING.png"
  },
  {
    name: "Faculty of Pharmacy",
    shortHand: "PHARMA",
    imagePath: "public/icons/PHARMA.png"
  },
  {
    name: "Institute of Physical Education and Athletics",
    shortHand: "IPEA",
    imagePath: "public/icons/IPEA.png"
  },
  {
    name: "College of Science",
    shortHand: "COS",
    imagePath: "public/icons/COS.png"
  },
  {
    name: "College of Tourism and Hospitality Management",
    shortHand: "CTHM",
    imagePath: "public/icons/CTHM.png"
  }
];
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    console.log("Initializing database...");
    db.serialize(() => {
      db.run(
        `CREATE TABLE IF NOT EXISTS college (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        shortHand TEXT NOT NULL UNIQUE,
        imagePath TEXT NOT NULL,
        score INTEGER DEFAULT 0
      )`,
        (err) => {
          if (err) {
            console.error("Error creating table:", err);
            reject(err);
            return;
          }
          db.get("SELECT COUNT(*) as count FROM college", (err2, row) => {
            if (err2) {
              console.error("Error checking college count:", err2);
              reject(err2);
              return;
            }
            if (row.count === 0) {
              console.log("Populating database with initial data...");
              const stmt = db.prepare(
                "INSERT INTO college (name, shortHand, imagePath, score) VALUES (?, ?, ?, ?)"
              );
              let completed = 0;
              const total = colleges.length;
              colleges.forEach((college) => {
                stmt.run(
                  college.name,
                  college.shortHand,
                  college.imagePath,
                  0,
                  (err3) => {
                    completed++;
                    if (err3) {
                      console.error(
                        `Error inserting college ${college.shortHand}:`,
                        err3
                      );
                    }
                    if (completed === total) {
                      stmt.finalize();
                      console.log("Database initialized with college data");
                      resolve();
                    }
                  }
                );
              });
            } else {
              console.log("Database already contains college data");
              resolve();
            }
          });
        }
      );
    });
  });
}
function setupIpcHandlers() {
  ipcMain.handle("get-all-colleges", () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM college ORDER BY score DESC", (err, rows) => {
        if (err) {
          console.error("Error getting colleges:", err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  });
  ipcMain.handle("get-college", (_, shortHand) => {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM college WHERE shortHand = ?",
        [shortHand],
        (err, row) => {
          if (err) {
            console.error(`Error getting college ${shortHand}:`, err);
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  });
  ipcMain.handle("update-score", (_, shortHand, newScore) => {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE college SET score = ? WHERE shortHand = ?",
        [newScore, shortHand],
        function(err) {
          if (err) {
            console.error(`Error updating score for ${shortHand}:`, err);
            reject(err);
          } else {
            BrowserWindow.getAllWindows().forEach((window) => {
              window.webContents.send("score-updated", shortHand, newScore);
            });
            resolve({ success: true, changes: this.changes });
          }
        }
      );
    });
  });
  ipcMain.handle("increment-score", (_, shortHand, increment = 1) => {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE college SET score = score + ? WHERE shortHand = ?",
        [increment, shortHand],
        function(err) {
          if (err) {
            console.error(`Error incrementing score for ${shortHand}:`, err);
            reject(err);
          } else {
            db.get(
              "SELECT * FROM college WHERE shortHand = ?",
              [shortHand],
              (err2, row) => {
                if (err2) {
                  console.error(
                    `Error getting updated college ${shortHand}:`,
                    err2
                  );
                  reject(err2);
                } else {
                  BrowserWindow.getAllWindows().forEach((window) => {
                    window.webContents.send(
                      "score-updated",
                      shortHand,
                      row.score
                    );
                  });
                  resolve(row);
                }
              }
            );
          }
        }
      );
    });
  });
  ipcMain.handle("reset-scores", () => {
    return new Promise((resolve, reject) => {
      db.run("UPDATE college SET score = 0", function(err) {
        if (err) {
          console.error("Error resetting scores:", err);
          reject(err);
        } else {
          BrowserWindow.getAllWindows().forEach((window) => {
            window.webContents.send("scores-reset");
          });
          resolve({ success: true, changes: this.changes });
        }
      });
    });
  });
}
function createWindow() {
  try {
    console.log("Creating windows...");
    mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        // Changed to .cjs
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
        // Allow preload script to access Node APIs
      },
      frame: false,
      alwaysOnTop: true
    });
    mainWindow.setFullScreen(true);
    controlWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        // Changed to .cjs
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false
        // Allow preload script to access Node APIs
      }
    });
    console.log("Windows created, loading content...");
    if (VITE_DEV_SERVER_URL) {
      console.log("Loading from dev server:", VITE_DEV_SERVER_URL);
      mainWindow.loadURL(VITE_DEV_SERVER_URL);
      controlWindow.loadURL(`${VITE_DEV_SERVER_URL}/control.html`);
    } else {
      console.log("Loading from build files");
      mainWindow.loadFile(path.join(RENDERER_DIST, "index.html"));
      controlWindow.loadFile(path.join(RENDERER_DIST, "control.html"));
    }
    mainWindow.webContents.on("did-finish-load", () => {
      mainWindow == null ? void 0 : mainWindow.webContents.send(
        "main-process-message",
        "Window in fullscreen mode"
      );
      if (mainWindow && !mainWindow.isFullScreen()) {
        mainWindow.setFullScreen(true);
      }
    });
    mainWindow.on("enter-full-screen", () => {
      console.log("Window entered full screen mode");
    });
    mainWindow.on("leave-full-screen", () => {
      console.log("Window left full screen mode");
      if (mainWindow) {
        mainWindow.setFullScreen(true);
      }
    });
    console.log("Content loaded");
  } catch (error) {
    console.error("Error creating windows:", error);
  }
}
function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error("Error closing database:", err);
          reject(err);
        } else {
          console.log("Database connection closed");
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}
app.on("window-all-closed", async () => {
  console.log("All windows closed");
  try {
    await closeDatabase();
  } catch (error) {
    console.error("Error during database close:", error);
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  console.log("App activated");
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.on("before-quit", async (event) => {
  console.log("App quitting...");
  try {
    await closeDatabase();
  } catch (error) {
    console.error("Error during database close:", error);
  }
});
console.log("App initializing...");
app.whenReady().then(async () => {
  try {
    await initializeDatabase();
    setupIpcHandlers();
    createWindow();
    console.log("App startup complete");
  } catch (error) {
    console.error("Error during app initialization:", error);
  }
}).catch((error) => {
  console.error("Error during app ready:", error);
});
//# sourceMappingURL=main.js.map
