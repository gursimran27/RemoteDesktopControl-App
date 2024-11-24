// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { v4: uuidv4 } = require("uuid");
const screenshot = require("screenshot-desktop");
var robot = require("robotjs");

var socket = require("socket.io-client")(
  "http://localhost:5000/"
);
var interval;
let uuid;

const createWindow = () => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 500,
    height: 150,
    webPreferences: {
      nodeIntegration: true, // Required for `require('electron')` in renderer
      contextIsolation: false, // Allows access to Electron APIs
    },
  });

  //  to remove menu items
  win.removeMenu();

  // and load the index.html of the app.
  win.loadFile("./index.html");

  // Open the DevTools.
  // win.webContents.openDevTools()

  socket.on("mouse-move", function (data) {
    var obj = JSON.parse(data);
    var x = obj.x;
    var y = obj.y;

    robot.moveMouse(x, y);
  });

  socket.on("mouse-click", function (data) {
    robot.mouseClick();
  });

  socket.on("type", function (data) {
    var obj = JSON.parse(data);
    var key = obj.key;

    robot.keyTap(key.toString());
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("start-share", function (event, arg) {
  uuid = uuidv4();
  socket.emit("join-message", uuid);
  event.reply("uuid", uuid);

  const remoteScreenSize = screen.getPrimaryDisplay().size;

  interval = setInterval(function () {
    // console.log("Interval triggered"); //print in VsCode termical not console
    screenshot()
      .then((img) => {
        var imgStr = Buffer.from(img).toString("base64");
        // throw new Error; //testing purposes only
        var obj = {};
        obj.room = uuid;
        obj.image = imgStr;
        obj.remoteScreenSize = remoteScreenSize;

        socket.emit("screen-data", JSON.stringify(obj));
      })
      .catch((err) => {
        console.error("Screenshot error:", err); //it will print in VsCode termical not console
        event.reply("error", "ScreenShare failed: " + err.message);
        clearInterval(interval);
      });
  }, 500);
});

ipcMain.on("stop-share", function (event, arg) {
  socket.emit("end-session", uuid);
  clearInterval(interval);
});
