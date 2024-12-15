// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, screen } = require("electron");
const { v4: uuidv4 } = require("uuid");
const screenshot = require("screenshot-desktop");
var robot = require("robotjs");

var socket = require("socket.io-client")(
  "https://remotedesktopcontrol-app.onrender.com/"
);
var interval;
let uuid;

// Pressing a combination of keys
// function pressKeyCombination(keys) {
//   keys.forEach((key) => robot.keyToggle(key, "down")); // Hold down all keys in combination
//   keys.forEach((key) => robot.keyTap(key)); // Tap each key
//   keys.forEach((key) => robot.keyToggle(key, "up")); // Release all keys
// }

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
  // win.webContents.openDevTools();

  socket.on("mouse-move", function (data) {
    const obj = JSON.parse(data);
    robot.moveMouse(obj.x, obj.y);
  });

  socket.on("mouse-click", function (data) {
    const obj = JSON.parse(data);

    if (obj.type === "single-click") {
      robot.mouseClick();
    } else if (obj.type === "double-click") {
      robot.mouseClick("left", true);
    } else if (obj.type === "right-click") {
      robot.mouseClick("right");
    }
  });

  socket.on("mouse-scroll", function (data) {
    const obj = JSON.parse(data);

    if (obj.direction === "up") {
      console.log("up");
      robot.scrollMouse(0, -10);
    } else {
      console.log("up-reverse");
      robot.scrollMouse(0, 10);
    }
  });

  socket.on("type", function (data) {
    const obj = JSON.parse(data);
    let key = obj.key;
    console.log(key);

    switch (key) {
      case "backspace":
        robot.keyTap("backspace");
        break;
      case "enter":
        robot.keyTap("enter");
        break;
      case "shift":
        robot.keyTap("shift");
        break;
      case "ctrl":
        robot.keyTap("control");
        break;
      case "alt":
        robot.keyTap("alt");
        break;
      case "capslock":
        robot.keyTap("capslock");
        break;
      case "space":
        robot.keyTap("space");
        break;
      case "escape":
        robot.keyTap("escape");
        break;
      case "tab":
        robot.keyTap("tab");
        break;
      case "delete":
        robot.keyTap("delete");
        break;
      case "insert":
        robot.keyTap("insert");
        break;
      case "home":
        robot.keyTap("home");
        break;
      case "end":
        robot.keyTap("end");
        break;
      case "pageup":
        robot.keyTap("pageup");
        break;
      case "pagedown":
        robot.keyTap("pagedown");
        break;
      case "f1":
        robot.keyTap("f1");
        break;
      case "f2":
        robot.keyTap("f2");
        break;
      case "f3":
        robot.keyTap("f3");
        break;
      case "f4":
        robot.keyTap("f4");
        break;
      case "f5":
        robot.keyTap("f5");
        break;
      case "f6":
        robot.keyTap("f6");
        break;
      case "f7":
        robot.keyTap("f7");
        break;
      case "f8":
        robot.keyTap("f8");
        break;
      case "f9":
        robot.keyTap("f9");
        break;
      case "f10":
        robot.keyTap("f10");
        break;
      case "f11":
        robot.keyTap("f11");
        break;
      case "f12":
        robot.keyTap("f12");
        break;
      case "numlock":
        break;
      case "pause":
        robot.keyTap("pause");
        break;
      case "printscreen":
        robot.keyTap("printscreen");
        break;
      case "windows":
        robot.keyTap("meta"); // Windows key on macOS or equivalent
        break;
      case "arrowup":
        robot.keyTap("up");
        break;
      case "arrowdown":
        robot.keyTap("down"); 
        break;
      case "arrowleft":
        robot.keyTap("left"); 
        break;
      case "arrowright":
        robot.keyTap("right"); 
        break;
      case "scrolllock":
        break;

      default:
        try {
          robot.keyTap(key.toString()); // For regular alphanumeric keys
        } catch (error) {
          console.log("Error: " + error);
        }
    }
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
  const scaleFactor = screen.getPrimaryDisplay().scaleFactor;
  const actualSize = {
    width: remoteScreenSize.width * scaleFactor,
    height: remoteScreenSize.height * scaleFactor,
  };

  interval = setInterval(function () {
    // console.log("Interval triggered"); //print in VsCode termical not console
    screenshot()
      .then((img) => {
        var imgStr = Buffer.from(img).toString("base64");
        // throw new Error; //testing purposes only
        var obj = {};
        obj.room = uuid;
        obj.image = imgStr;
        obj.remoteScreenSize = actualSize;

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
