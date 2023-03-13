const path = require("path");
const os = require("os");
const fs = require("fs");
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  screen,
} = require("electron");

const isDev = process.env.NODE_ENV !== "production";
const isMac = process.platform === "darwin";

let mainWindow;
let frameWindow;

let lockedFrame = true;

// Create the main window
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "G-popout",
    opacity: 1,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  mainWindow.loadFile(path.join(__dirname, "./renderer/index.html"));
}

// Create about window
function createAboutWindow() {
  const aboutWindow = new BrowserWindow({
    title: "About G-popout",
    width: 300,
    height: 220,
  });

  aboutWindow.loadFile(path.join(__dirname, "./renderer/about.html"));
}

// Create design frame window
function createFrameWindow({ width, height, opacity }) {
  frameWindow = new BrowserWindow({
    title: "Design frame",
    width: +width,
    height: +height,
    resizable: true,
    useContentSize: true,
    vibrancy: "popover",
    alwaysOnTop: lockedFrame,
    opacity: +opacity,
    frame: false,
    roundedCorners: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  frameWindow.loadFile(path.join(__dirname, "./renderer/frame.html"));
}

// Handle opacity changes to design frame
function setFrameOpacity(opacity) {
  frameWindow ? frameWindow.setOpacity(opacity) : "";
}

// Handle if frame is locked or not
function handleLockedFrame(lock) {
  frameWindow ? frameWindow.setAlwaysOnTop(lock) : "";
}

// App is ready
app.whenReady().then(() => {
  // createMainWindow();

  // Opens app in current window
  // Requires app to open in fullsize of window
  const { screen } = require("electron");
  const { getCursorScreenPoint, getDisplayNearestPoint } = screen;

  const currentScreen = getDisplayNearestPoint(getCursorScreenPoint());
  createMainWindow();
  mainWindow.setBounds(currentScreen.workArea);

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);

  // Remove mainWindow from memory on close
  mainWindow.on("closed", () => (mainWindow = null));
  frameWindow.on("closed", () => (frameWindow = null));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// Menu template
const mainMenuTemplate = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
  {
    role: "fileMenu",
  },
  {
    label: "Frame options",
    submenu: [
      {
        label: "Opacity",
        submenu: [
          {
            label: "100%",
            click: () => {
              setFrameOpacity(1);
            },
            accelerator: "Cmd+f",
          },
          {
            label: "90%",
            click: () => {
              setFrameOpacity(0.9);
            },
            accelerator: "Cmd+9",
          },
          {
            label: "80%",
            click: () => {
              setFrameOpacity(0.8);
            },
            accelerator: "Cmd+8",
          },
          {
            label: "70%",
            click: () => {
              setFrameOpacity(0.7);
            },
            accelerator: "Cmd+7",
          },
          {
            label: "60%",
            click: () => {
              setFrameOpacity(0.6);
            },
            accelerator: "Cmd+6",
          },
          {
            label: "50%",
            click: () => {
              setFrameOpacity(0.5);
            },
            accelerator: "Cmd+5",
          },
          {
            label: "40%",
            click: () => {
              setFrameOpacity(0.4);
            },
            accelerator: "Cmd+4",
          },
          {
            label: "30%",
            click: () => {
              setFrameOpacity(0.3);
            },
            accelerator: "Cmd+3",
          },
          {
            label: "20%",
            click: () => {
              setFrameOpacity(0.2);
            },
            accelerator: "Cmd+2",
          },
          {
            label: "10%",
            click: () => {
              setFrameOpacity(0.1);
            },
            accelerator: "Cmd+1",
          },
        ],
      },
      {
        label: "Toggle locked frame",
        click: () => {
          lockedFrame = !lockedFrame;
          handleLockedFrame(lockedFrame);
        },
        accelerator: "Cmd+L",
      },
    ],
  },
  { role: "viewMenu" },
  { role: "windowMenu" },

  ...(!isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: "About",
              click: createAboutWindow,
            },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" },
          ],
        },
      ]
    : []),
];

// Recieving properties for the design frame window
ipcMain.on("image:designFrame", (e, options) => {
  // Creating the design frame window
  createFrameWindow(options);

  // Response to renderer that the window is created
  mainWindow.webContents.send("image:created");
});

// Response to render the actual image in frame.js
ipcMain.on("image:render", (e, options) => {
  frameWindow.webContents.on("did-finish-load", () => {
    frameWindow.webContents.send("image:rendered", options);
  });
});

app.on("window-all-closed", () => {
  if (!isMac) {
    app.quit();
  }
});
