import { app, BrowserWindow, ipcMain } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import { join } from 'node:path';
import merge from 'ts-deepmerge';
import { SerializedTracker, ServerStatus } from '../../shared/IPCMessages';
import { Server } from '../Server';

let mainWindow: BrowserWindow | null;

let shuttingDown = false;

let server: Server | null = null;
let serverStatus = ServerStatus.Stopped;

const trackers: Record<string, SerializedTracker> = {};

const startServer = async () => {
  if (server) {
    return;
  }

  server = new Server();

  server.events.on('server:status', (s) => {
    serverStatus = s;

    if (mainWindow && !shuttingDown) {
      mainWindow.webContents.send('server:status', s);
    }
  });

  server.events.on('tracker:new', (t) => {
    trackers[t.mac] = t;

    if (mainWindow && !shuttingDown) {
      mainWindow.webContents.send('tracker:new', t);
    }
  });

  server.events.on('tracker:changed', (t) => {
    trackers[t.mac] = merge(trackers[t.mac], t);

    if (mainWindow && !shuttingDown) {
      mainWindow.webContents.send('tracker:changed', t);
    }
  });

  server.events.on('tracker:removed', (t) => {
    delete trackers[t.mac];

    if (mainWindow && !shuttingDown) {
      mainWindow.webContents.send('tracker:removed', t);
    }
  });

  await server.start();
};

const stopServer = async () => {
  if (!server) {
    return;
  }

  await server.stop();

  server = null;
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  });

  const startUrl = process.env.ELECTRON_START_URL || `file://${__dirname}/../../build/index.html`;
  mainWindow.loadURL(startUrl);

  mainWindow.webContents.openDevTools();
};

app.on('ready', () => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.on('server:start', startServer);
  ipcMain.on('server:stop', stopServer);

  ipcMain.handle('server:status:get', () => serverStatus);
  ipcMain.handle('trackers:get', () => trackers);

  installExtension(REACT_DEVELOPER_TOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));

  installExtension(REDUX_DEVTOOLS)
    .then((name) => console.log(`Added Extension:  ${name}`))
    .catch((err) => console.log('An error occurred: ', err));
});

app.on('window-all-closed', () => {
  shuttingDown = true;

  if (process.platform !== 'darwin') {
    stopServer().then(() => app.quit());
  }
});
