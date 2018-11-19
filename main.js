// const {app, BrowserWindow} = require('electron')
// const path = require('path')
//const url = require('url')

const electron = require('electron')
const { app, Menu, Tray } = electron
const { BrowserWindow } = electron
const path = require('path')
const url = require('url')

let win
let tray = null
function createWindow () {
  win = new BrowserWindow({
    width: 1000, 
    height: 800,
    icon: path.join(__dirname,'resources/icon/icon.png')
  })
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  // 打开窗口的调试工具
  //win.webContents.openDevTools();
  //win.setMenu(null)

  win.on('closed', () => {
    win = null;
  });

  win.on('close', (event) => {
    //win = null
    win.hide(); 
    win.setSkipTaskbar(true);
    event.preventDefault();
  })

  win.on('show', () => {
    tray.setHighlightMode('always')
  })

  win.on('hide', () => {
    tray.setHighlightMode('never')
  })

  //创建系统通知区菜单
  tray = new Tray(path.join(__dirname, 'resources/icon/icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    {label: '退出', click: () => {win.destroy()}},//我们需要在这里有一个真正的退出（这里直接强制退出）
  ])

  tray.setToolTip('drink_water')
  tray.setContextMenu(contextMenu)

  tray.on('click', ()=>{ //我们这里模拟桌面程序点击通知区图标实现打开关闭应用的功能
      win.isVisible() ? win.hide() : win.show()
      win.isVisible() ?win.setSkipTaskbar(false):win.setSkipTaskbar(true);
  })
}
app.on('ready', createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})

const ipc = require('electron').ipcMain
const dialog = require('electron').dialog

ipc.on('open-information-dialog', function (event) {
  const options = {
    type: 'info',
    title: '提示',
    message: "你该喝水了呢",
    buttons: ['现在就喝', '这就去倒水']
  }
  dialog.showMessageBox(options, function (index) {
    event.sender.send('information-dialog-selection', index)
  })
})
