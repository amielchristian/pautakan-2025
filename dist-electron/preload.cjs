// preload.cjs - Place this file directly in dist-electron folder
const { contextBridge, ipcRenderer } = require('electron');

// Log preload execution
console.log('Preload script executing from dist-electron folder');

// Expose APIs to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  getAllColleges: () => ipcRenderer.invoke('get-all-colleges'),
  getCollege: (shortHand) => ipcRenderer.invoke('get-college', shortHand),
  updateScore: (shortHand, newScore) => ipcRenderer.invoke('update-score', shortHand, newScore),
  incrementScore: (shortHand, increment = 1) => ipcRenderer.invoke('increment-score', shortHand, increment),
  resetScores: () => ipcRenderer.invoke('reset-scores'),
  
  // Event listeners
  onScoreUpdated: (callback) => {
    const listener = (_, shortHand, newScore) => callback(shortHand, newScore);
    ipcRenderer.on('score-updated', listener);
    return () => {
      ipcRenderer.removeListener('score-updated', listener);
    };
  },
  
  onScoresReset: (callback) => {
    const listener = () => callback();
    ipcRenderer.on('scores-reset', listener);
    return () => {
      ipcRenderer.removeListener('scores-reset', listener);
    };
  },
  
  // Basic messaging
  receive: (channel, func) => {
    const validChannels = ['main-process-message'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => func(...args));
    }
  },
  
  send: (channel, data) => {
    const validChannels = ['from-renderer'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  }
});

console.log('Preload script completed');