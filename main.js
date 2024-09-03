const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('fs')

const appPath = app.getAppPath()

app.setPath('userData', path.join(__dirname, 'data'))

function exStartup() {
  // ensure the chars directory exists
  let dir = `${appPath}\\chars`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // ensure the mods directory exists
  dir = `${appPath}\\mods`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function onStart() {
  const win = new BrowserWindow({
    webPreferences: {
      // Prevents slowdown of script execution
      backgroundThrottling: false,

      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  })

  win.webContents.session.on('will-download', (event, item, webContents) => {
    console.log('will-download', item, item.getFilename())
    item.setSavePath(`${__dirname}\\deaths\\${item.getFilename()}`)
  })

  // TODO Enter your creds to automate signin
  let myemail = "EMAIL@EMAIL.COM"
  let mypassword = "MYPASSWORD"
  let charname = "CHARNAME"
  if (myemail != "EMAIL@EMAIL.COM") {
    win.webContents.on('did-navigate', async (event, url) => {
      if (url === 'https://deepestworld.com/login') {
        await win.webContents.executeJavaScript(`
        document.querySelector("input#username").value = ${JSON.stringify(myemail)};
        document.querySelector("input#password").value = ${JSON.stringify(mypassword)};
        document.querySelector("button[type=submit]").click();
      `)
        return
      }

      if (url !== `https://deepestworld.com/game?c=${charname}`) {
          await win.webContents.executeJavaScript(`
              location = 'https://deepestworld.com/game?c=${charname}';
          `);
          return;
      }
    })
  }

  const template = [
    // { role: 'fileMenu' }
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    // { role: 'viewMenu' }
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Deepest World Ex',
      submenu: [
        {
          label: 'Load Character', click: () => {
            dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [
                { name: 'Scripts', extensions: ['js'] }
              ],
              defaultPath: `${appPath}\\chars`
            }).then(function (response) {
              if (!response.canceled) {
                // handle fully qualified file name
                console.log(response.filePaths[0]);

                let outFilePath = `${appPath}\\tmp.js`
                buildCharacter(response.filePaths[0], outFilePath, () => {
                  fs.readFile(outFilePath, 'utf-8', (err, data) => {
                    if (err) {
                      console.log("An error ocurred reading the file :" + err.message);
                      return;
                    }

                    win.webContents.executeJavaScript(`
                        Array.from(document.querySelector("#code").querySelectorAll(".ui-btn-frame")).find(e => e.innerHTML.trim() == 'Stop').click();
                        dw.editor.session.setValue(${JSON.stringify(data)});
                        Array.from(document.querySelector("#code").querySelectorAll(".ui-btn-frame")).find(e => e.innerHTML.trim() == 'Save + Start').click();
                      `)
                  })
                })

              } else {
                console.log("no file selected");
              }
            });
          }
        }
      ]
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  win.loadURL('https://deepestworld.com/login')

  

  ipcMain.on('send-ws-data', (event, data) => {
    const json = JSON.parse(data);
    const eventName = json[0];

    //console.log('send-ws-data', event, data)
    trackEvent({"ts": new Date().toLocaleString(), "eventName": eventName});
  })

  ipcMain.on('received-ws-data', (event, data) => {
    //console.log('received-ws-data', event, data)

    const json = JSON.parse(data);
    const eventName = json[1];
    if (eventName === 'callLimitDc') {
      let date = new Date();
      let easternTime = date.toLocaleString("en-US", {timeZone: "America/New_York"});
      console.log(`[${easternTime}] DISCONNECTED - callLimitDc. ${JSON.stringify(json[2])}`);
      console.log("Events Buffer: ");
      console.log(JSON.stringify(eventsBuffer, undefined, 2));
    }
  })
}

// Ring buffer for last 100 events
var n = 100;
var i = 0;
var eventsBuffer = new Array(n);
function trackEvent(x) {
  i = (i + 1) % n;
  eventsBuffer[i] = x;
}

async function buildCharacter(scriptPath, outFilePath, onComplete) {
  let modsDir = `${appPath}\\mods`
  let scriptContent = ""

  let files = fs.readdirSync(modsDir)

  for (let file of files) {

    let data = fs.readFileSync(`${modsDir}\\${file}`, 'utf-8')

    scriptContent += data + "\r\n"
  }

  let data = fs.readFileSync(scriptPath, 'utf-8')
  scriptContent += data + "\r\n"

  fs.writeFileSync(outFilePath, scriptContent);
  onComplete()

  // load every mod's content into memory
  // inject some code to call any of their preinit methods that exist
  // inject some code to call any of their appinit methods that exist
  // append the character code
  // write it to disk
}

exStartup()

app.whenReady().then(() => { onStart() })
