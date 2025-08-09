const socket = io();
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let drawing = false;
let points = [];
let targetShape = null;

document.getElementById("startBtn").addEventListener("click", () => {
  socket.emit("startGame");
});

canvas.addEventListener("mousedown", e => {
  drawing = true;
  points = [];
});
canvas.addEventListener("mouseup", e => {
  drawing = false;
  socket.emit("drawingData", points);
});
canvas.addEventListener("mousemove", e => {
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  points.push({ x, y });
  drawLine();
});

function drawLine() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (targetShape) {
    ctx.beginPath();
    ctx.strokeStyle = "#ccc";
    targetShape.points.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.strokeStyle = "black";
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();
}

socket.on("roundStart", data => {
  targetShape = data.shape;
  document.getElementById("timer").innerText = `Time left: ${data.time}`;
  points = [];
  drawLine();
});

socket.on("timer", t => {
  document.getElementById("timer").innerText = `Time left: ${t}`;
});

socket.on("roundEnd", scores => {
  let html = "<h3>Scores</h3>";
  for (let id in scores) {
    html += `<p>${id}: ${scores[id]} pts</p>`;
  }
  document.getElementById("scoreBoard").innerHTML = html;
});
