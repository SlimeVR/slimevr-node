import { SerializedTracker, ServerStatus } from '@slimevr/firmware-protocol-debugger-shared';
import { BrowserWindow, app, ipcMain } from 'electron';
import { join } from 'node:path';
import merge from 'ts-deepmerge';
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
    if (!trackers[t.mac]) {
      return;
    }

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

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  });

  const url = app.isPackaged ? `file://${__dirname}/../../index.html` : (process.env.ELECTRON_START_URL as string);

  console.log(url);

  if (!app.isPackaged) {
    // const devtoolsInstaller = await import('electron-devtools-installer');
    // devtoolsInstaller.default
    //   .default(devtoolsInstaller.REACT_DEVELOPER_TOOLS)
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log('An error occurred: ', err));
    //
    // devtoolsInstaller.default
    //   .default(devtoolsInstaller.REDUX_DEVTOOLS)
    //   .then((name) => console.log(`Added Extension:  ${name}`))
    //   .catch((err) => console.log('An error occurred: ', err));
  }

  mainWindow.loadURL(url);
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
});

app.on('window-all-closed', () => {
  shuttingDown = true;

  if (process.platform !== 'darwin') {
    stopServer().then(() => app.quit());
  }
});
