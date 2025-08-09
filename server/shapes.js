// shapes.js
module.exports = {
  shapes: [
    { name: "circle", points: generateCirclePoints(150, 150, 80) },
    { name: "square", points: generateSquarePoints(70, 70, 160) },
    { name: "triangle", points: generateTrianglePoints(150, 50, 100) }
  ],
  scoreDrawing
};

function generateCirclePoints(cx, cy, r, steps = 60) {
  return Array.from({ length: steps }, (_, i) => {
    const angle = (i / steps) * 2 * Math.PI;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

function generateSquarePoints(x, y, size) {
  const points = [];
  const step = size / 20;
  for (let i = 0; i <= size; i += step) points.push({ x: x + i, y });
  for (let i = 0; i <= size; i += step) points.push({ x: x + size, y: y + i });
  for (let i = 0; i <= size; i += step) points.push({ x: x + size - i, y: y + size });
  for (let i = 0; i <= size; i += step) points.push({ x, y: y + size - i });
  return points;
}

function generateTrianglePoints(x, y, size) {
  const p1 = { x, y: y + size };
  const p2 = { x: x + size, y: y + size };
  const p3 = { x: x + size / 2, y };
  const points = [];
  const steps = 20;
  for (let i = 0; i <= steps; i++) points.push(interpolate(p1, p2, i / steps));
  for (let i = 0; i <= steps; i++) points.push(interpolate(p2, p3, i / steps));
  for (let i = 0; i <= steps; i++) points.push(interpolate(p3, p1, i / steps));
  return points;
}

function interpolate(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

// Basic scoring function
function scoreDrawing(userPoints, targetPoints) {
  if (userPoints.length === 0) return 0;
  const targetSet = new Set(targetPoints.map(p => `${Math.round(p.x)},${Math.round(p.y)}`));

  let totalDist = 0;
  let matchedCount = 0;
  let overdrawCount = 0;

  userPoints.forEach(up => {
    let minDist = Infinity;
    let matched = false;
    targetPoints.forEach(tp => {
      const dist = Math.hypot(up.x - tp.x, up.y - tp.y);
      if (dist < minDist) minDist = dist;
      if (dist < 5) matched = true;
    });
    totalDist += minDist;
    if (matched) matchedCount++;
    else overdrawCount++;
  });

  const completeness = matchedCount / targetPoints.length;
  const avgDistScore = Math.max(0, 1 - totalDist / (matchedCount * 10));
  const overdrawPenalty = Math.max(0, 1 - overdrawCount / userPoints.length);

  const finalScore = Math.round(
    100 * completeness * avgDistScore * overdrawPenalty
  );

  return finalScore;
}
