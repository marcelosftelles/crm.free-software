const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

app.setAppUserModelId('telles.tec.os');

function createWindow() {
    const iconPath = path.join(__dirname, 'assets', 'icon.ico');
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: iconPath,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });
    win.removeMenu();
    win.loadFile(path.join(__dirname, 'index.html'));
}

ipcMain.handle('print-os', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { error: 'no-window' };
    win.webContents.print({ printBackground: true });
    return { success: true };
});

ipcMain.handle('save-pdf', async (event, opts = {}) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { error: 'no-window' };
    try {
        const pdfData = await win.webContents.printToPDF({ printBackground: true });
        const suggested = (opts.fileName || 'os') + '.pdf';
        const { canceled, filePath } = await dialog.showSaveDialog(win, {
            title: 'Salvar PDF',
            defaultPath: suggested,
            filters: [{ name: 'PDF', extensions: ['pdf'] }]
        });
        if (canceled || !filePath) return { canceled: true };
        await fs.promises.writeFile(filePath, pdfData);
        return { success: true, filePath };
    } catch (err) {
        console.error('Erro ao salvar PDF:', err);
        return { error: err.message || String(err) };
    }
});

app.on('ready', createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
