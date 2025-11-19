const { contextBridge, ipcRenderer } = require('electron');

// Expose only the APIs needed by the renderer
contextBridge.exposeInMainWorld('ElectronAPI', {
  printOS: () => ipcRenderer.invoke('print-os'),
  savePDF: (options) => ipcRenderer.invoke('save-pdf', options || {})
});

