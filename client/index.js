const ipcRenderer = require("electron").ipcRenderer;

window.onload = function () {
  ipcRenderer.on("uuid", (event, data) => {
    document.querySelector(".wrapper").style.display = "flex";
    document.getElementById("code").innerHTML = data;
  });
  ipcRenderer.on("error", (event, data) => {
    document.getElementById("code").innerHTML = null;
    document.querySelector(".wrapper").style.display = "none";
    document.getElementById("stop").style.display = "none";
    document.getElementById("start").style.display = "block";
  });
};

function startShare() {
  console.log("startShare");
  ipcRenderer.send("start-share", {});
  document.getElementById("start").style.display = "none";
  document.getElementById("stop").style.display = "block";
}

function stopShare() {
  ipcRenderer.send("stop-share", {});
  document.getElementById("code").innerHTML = null;
  document.querySelector(".wrapper").style.display = "none";
  document.getElementById("stop").style.display = "none";
  document.getElementById("start").style.display = "block";
}

async function copyToClipboard() {
  try {
    const copy = document.getElementById("code").innerHTML;
    await navigator.clipboard.writeText(copy);
    document.getElementById("copy").innerText = "Copied";
  } catch (error) {
    document.getElementById("copy").innerText = "Failed";
  }
  setTimeout(function () {
    document.getElementById("copy").innerText = "Copy";
  }, 1000);
}
