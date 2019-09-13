import { app, BrowserWindow, screen, Tray, Menu, globalShortcut, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

let win: BrowserWindow;
let serve: boolean;
let tray: Tray;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

function createWindow() {
  tray = new Tray(path.join(__dirname, 'favicon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open', click: () => {
        win.show();
      }
    },
    {
      label: 'Close', click: () => {
        win.close();
      }
    }
  ]);
  tray.setToolTip('incognito');
  tray.setContextMenu(contextMenu);
  // const electronScreen = screen;
  // const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
    },
    alwaysOnTop: true,
    frame: false,
    center: true,
    useContentSize: true,
    icon: path.join(__dirname, 'favicon.ico')
  });

  win.on('minimize', function (event) {
    event.preventDefault();
    win.hide();
  });
  win.hide();
  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools({ mode: 'undocked' });
  }

  globalShortcut.register('Esc', () => {
    win.hide();
  });
  globalShortcut.register('Alt+M', () => {
    win.focus();
    win.show();
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;

    // Unregister all shortcuts.
    globalShortcut.unregisterAll();
  });

}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

  ipcMain.on('resize-window', (event, arg) => {
    if (arg['width'] && arg['height']) {
      win.setSize(arg['width'], arg['height']);
    }
  });
  ipcMain.on('hide-window', (event, arg) => {
    win.hide();
  });

} catch (e) {
  // Catch Error
  // throw e;
}
