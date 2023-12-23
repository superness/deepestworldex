const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron')
const path = require('node:path')
const fs = require('fs')

const appPath = app.getAppPath()

function exStartup()
{
  // ensure the chars directory exists
  let dir = `${appPath}\\chars`
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }

  // ensure the mods directory exists
  dir = `${appPath}\\mods`
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
  }
}

function onStart()
{
  const win = new BrowserWindow({
    webPreferences: {
      // Prevents slowdown of script execution
      backgroundThrottling: false,

      contextIsolation: false,
    },
  })

  
  let myemail = "EMAIL@EMAIL.COM"
  let mypassword = "MYPASSWORD"
  win.webContents.on('did-navigate', async (event, url) => {
    if (url === 'https://deepestworld.com/login') {
      await win.webContents.executeJavaScript(`
        document.querySelector("input#username").value = ${JSON.stringify(myemail)};
        document.querySelector("input#password").value = ${JSON.stringify(mypassword)};
        document.querySelector("button[type=submit]").click();
      `)
      return
    }
  })

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
          { label: 'Load Character', click: () => { 
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
                        if(err){
                            console.log("An error ocurred reading the file :" + err.message);
                            return;
                        }
                        
                        win.webContents.executeJavaScript(`
                        document.querySelector("#stop-code").click();
                        document.querySelector("textarea#code-editor").value = ${JSON.stringify(data)};
                        document.querySelector("#start-code").click();
                      `)
                    })
                    })

                  } else {
                    console.log("no file selected");
                  }
              });
          }}
        ]
      },
    ]
    
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

  win.loadURL('https://deepestworld.com/login')
}

async function buildCharacter(scriptPath, outFilePath, onComplete) {
  let modsDir = `${appPath}\\mods`
  let scriptContent = ""
  
  let files = fs.readdirSync(modsDir)
    
  for(let file of files) {
    console.log(file)
    
    let data = fs.readFileSync(`${modsDir}\\${file}`, 'utf-8')

    console.log(`read ${file}`, data)
    scriptContent += data + "\r\n"
  }
  
  console.log('post mods', scriptContent)
  
  let data = fs.readFileSync(scriptPath, 'utf-8')
  console.log(`read ${scriptPath}`, data)
  scriptContent += data + "\r\n"

  console.log('to write', scriptContent)

  fs.writeFileSync(outFilePath, scriptContent);
  onComplete()

  // load every mod's content into memory
  // inject some code to call any of their preinit methods that exist
  // inject some code to call any of their appinit methods that exist
  // append the character code
  // write it to disk
}

exStartup()

app.whenReady().then(() => {onStart()})
