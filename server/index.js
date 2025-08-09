const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { shapes, scoreDrawing } = require("./shapes");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let currentShapeIndex = 0;
let timeLeft = 30;
let roundInProgress = false;
let drawings = {}; // { socketId: [points] }

function startRound() {
  drawings = {};
  roundInProgress = true;
  timeLeft = 30;
  currentShapeIndex = Math.floor(Math.random() * shapes.length);
  io.emit("roundStart", { shape: shapes[currentShapeIndex], time: timeLeft });

  const timer = setInterval(() => {
    timeLeft--;
    io.emit("timer", timeLeft);
    if (timeLeft <= 0) {
      clearInterval(timer);
      roundInProgress = false;
      const scores = {};
      for (let id in drawings) {
        scores[id] = scoreDrawing(drawings[id], shapes[currentShapeIndex].points);
      }
      io.emit("roundEnd", scores);
    }
  }, 1000);
}

io.on("connection", socket => {
  console.log("Player connected:", socket.id);

  socket.on("startGame", () => {
    if (!roundInProgress) startRound();
  });

  socket.on("drawingData", points => {
    drawings[socket.id] = points;
  });

  socket.on("disconnect", () => {
    delete drawings[socket.id];
    console.log("Player disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
