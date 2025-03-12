import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sqlite3 from "sqlite3";
import fs from "node:fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let mainView;
let techView;
function initializeDB() {
  const db = new sqlite3.Database("./db.sqlite3", (err) => {
    if (err) {
      console.error(err.message);
    }
  });
  const colleges = JSON.parse(
    fs.readFileSync(
      path.join(process.env.VITE_PUBLIC, "./colleges.json"),
      "utf-8"
    )
  );
  db.serialize(() => {
    db.run("DROP TABLE IF EXISTS colleges");
    db.run(
      "CREATE TABLE IF NOT EXISTS colleges (id INTEGER PRIMARY KEY, name TEXT, shorthand TEXT, imagePath TEXT, score NUMBER)"
    );
    for (const college of colleges) {
      db.run(
        "INSERT INTO colleges (name, shorthand, imagePath, score) VALUES (?, ?, ?, ?)",
        [college.name, college.shortHand, college.imagePath, 0]
      );
    }
  });
  return db;
}
function initializeIPC(db) {
  ipcMain.handle("change-category", (_, category) => {
    console.log("Category change invoked.");
    mainView == null ? void 0 : mainView.webContents.send("category-changed", category);
  });
  ipcMain.handle("change-difficulty", (_, difficulty) => {
    mainView == null ? void 0 : mainView.webContents.send("difficulty-changed", difficulty);
  });
  ipcMain.handle("get-colleges", () => {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM colleges", (err, rows) => {
        if (err) {
          console.error("Couldn't get colleges");
          reject(err);
        }
        resolve(rows);
      });
    });
  });
  ipcMain.handle("update-college-score", (_, shortHand, newScore) => {
    console.log("Score update invoked.");
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE colleges SET score = ? WHERE shortHand = ?",
        [newScore, shortHand],
        function(err) {
          if (err) {
            console.error(`Error updating score for ${shortHand}:`, err);
            reject(err);
          } else {
            BrowserWindow.getAllWindows().forEach((window) => {
              window.webContents.send("score-updated", shortHand, newScore);
              window.webContents.send("db-updated");
            });
            resolve({ success: true, changes: this.changes });
          }
        }
      );
    });
  });
}
function createWindow() {
  mainView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    },
    frame: false
    // alwaysOnTop: true,
  });
  techView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  techView.on("close", () => {
    app.quit();
  });
  if (VITE_DEV_SERVER_URL) {
    mainView.loadURL(VITE_DEV_SERVER_URL);
    techView.loadURL(VITE_DEV_SERVER_URL + "/control.html");
  } else {
    mainView.loadFile(path.join(RENDERER_DIST, "index.html"));
    techView.loadFile(path.join(RENDERER_DIST, "control.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    mainView = null;
    techView = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(async () => {
  const db = initializeDB();
  initializeIPC(db);
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
//# sourceMappingURL=main.js.map
