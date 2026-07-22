const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    title: 'Robotaxi站点测试报告工具',
    show: false,
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
    win.loadFile(indexPath)
  }

  return win
}

function setupAutoUpdater() {
  if (isDev) {
    return
  }

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '发现新版本',
      message: '检测到新版本，正在后台下载，请稍候...',
      buttons: ['好的'],
    })
    notifyAllWindows('update-available')
  })

  autoUpdater.on('update-not-available', () => {
    notifyAllWindows('update-not-available')
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: '更新已就绪',
      message: '新版本已下载完成，是否立即重启安装？',
      buttons: ['立即重启', '稍后'],
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall(true, true)
      }
    })
    notifyAllWindows('update-downloaded')
  })

  autoUpdater.on('error', (err) => {
    console.error('自动更新出错:', err)
    notifyAllWindows('update-error', err.message)
  })

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch((err) => {
      console.error('检查更新失败:', err)
    })
  }, 3000)
}

function notifyAllWindows(channel, ...args) {
  BrowserWindow.getAllWindows().forEach((win) => {
    win.webContents.send(channel, ...args)
  })
}

ipcMain.handle('app-version', () => app.getVersion())

ipcMain.handle('check-for-updates', async () => {
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, updateInfo: result?.updateInfo || null }
  } catch (err) {
    return { success: false, error: err.message }
  }
})

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdater()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

if (!isDev) {
  app.setAboutPanelOptions({
    applicationName: 'Robotaxi站点测试报告工具',
  })
}
