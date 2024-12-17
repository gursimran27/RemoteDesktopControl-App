var app = require("express")();
var http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

app.get("/view", (req, res) => {
  res.sendFile(__dirname + "/display.html");
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("join-message", (roomId) => {
    socket.join(roomId);
    console.log("User joined in a room : " + roomId);
  });

  socket.on("screen-data", function (data) {
    data = JSON.parse(data);
    var room = data.room;
    var imgStr = data.image;
    var remoteScreenSize = data.remoteScreenSize;
    socket.broadcast.to(room).emit("screen-data", imgStr, remoteScreenSize);
    console.log("receiverd screen data");
  });

  socket.on("mouse-move", function (data) {
    var room = JSON.parse(data).room;
    socket.broadcast.to(room).emit("mouse-move", data);
  });

  // socket.on("mouse-click", function (data) {
  //   var room = JSON.parse(data).room;
  //   socket.broadcast.to(room).emit("mouse-click", data);
  // });

  socket.on("mouse-drag", function (data) {
    var room = JSON.parse(data).room;
    socket.broadcast.to(room).emit("mouse-drag", data);
  });

  socket.on("mouse-scroll", function (data) {
    var room = JSON.parse(data).room;
    socket.broadcast.to(room).emit("mouse-scroll", data);
  });

  socket.on("type", function (data) {
    var room = JSON.parse(data).room;
    socket.broadcast.to(room).emit("type", data);
  });

  socket.on("end-session", function (uuid) {
    socket.broadcast.to(uuid).emit("end-session");
    console.log("User ended session : " + uuid);
  });
});

var server_port = process.env.YOUR_PORT || process.env.PORT || 5000;
http.listen(server_port, () => {
  console.log("Started on : " + server_port);
});

app.get("/", (req, res) => {
  return res.send(`
        <h1>Visit the /view path</h1>
        <button class="styled-btn" onclick="window.location.href='/view'">Go to View Path</button>
        <style>
            body {
                font-family: Arial, sans-serif;
                text-align: center;
                margin-top: 20%;
                background: linear-gradient(45deg, #7b0909, #6771b8b8);
                color: white;
                height: 100vh;
                width: 100vw;
                overflow: hidden;
            }

            .styled-btn {
                padding: 15px 30px;
                font-size: 18px;
                background-color: #4CAF50;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                transition: background-color 0.3s, transform 0.2s;
            }

            .styled-btn:hover {
                background-color: #45a049;
                transform: scale(1.05);
            }

            .styled-btn:active {
                background-color: #3e8e41;
            }
        </style>
    `);
});
