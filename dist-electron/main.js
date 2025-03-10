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
const db = new sqlite3.Database("./db.sqlite3", (err) => {
  if (err) {
    console.error(err.message);
  }
});
const colleges = JSON.parse(fs.readFileSync("./colleges.json", "utf-8"));
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS colleges");
  db.run(
    "CREATE TABLE IF NOT EXISTS colleges (id INTEGER PRIMARY KEY, name TEXT, shorthand TEXT, imagePath TEXT)"
  );
  for (const college of colleges) {
    db.run(
      "INSERT INTO colleges (name, shorthand, imagePath) VALUES (?, ?, ?)",
      [college.name, college.shortHand, college.imagePath]
    );
  }
});
function initializeIPC() {
  ipcMain.handle("getColleges", () => {
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
}
function createWindow() {
  mainView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
      // Changed to .cjs
    },
    frame: false,
    alwaysOnTop: true
  });
  mainView.setFullScreen(true);
  techView = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  mainView.webContents.on("did-finish-load", () => {
    mainView == null ? void 0 : mainView.webContents.send(
      "main-process-message",
      (/* @__PURE__ */ new Date()).toLocaleString()
    );
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
  initializeIPC();
  createWindow();
});
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
//# sourceMappingURL=main.js.map
