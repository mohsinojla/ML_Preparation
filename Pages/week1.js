// ===== KNN VISUALIZER =====
const knnCanvas = document.getElementById('knnCanvas');
const kCtx = knnCanvas?.getContext('2d');
const kSlider = document.getElementById('kSlider');
const kVal = document.getElementById('kVal');

let classA = [], classB = [], queryPoint = null;

function addRandomPoints() {
  for (let i = 0; i < 8; i++) {
    classA.push({ x: Math.random() * 200 + 40, y: Math.random() * 300 + 40 });
    classB.push({ x: Math.random() * 200 + 300, y: Math.random() * 300 + 40 });
  }
  drawKNN();
}

function resetKNN() {
  classA = []; classB = []; queryPoint = null;
  addRandomPoints();
}

function drawKNN() {
  if (!kCtx) return;
  const W = knnCanvas.width, H = knnCanvas.height;
  kCtx.clearRect(0, 0, W, H);

  // Background grid
  kCtx.strokeStyle = 'rgba(255,255,255,0.05)';
  kCtx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { kCtx.beginPath(); kCtx.moveTo(x,0); kCtx.lineTo(x,H); kCtx.stroke(); }
  for (let y = 0; y < H; y += 40) { kCtx.beginPath(); kCtx.moveTo(0,y); kCtx.lineTo(W,y); kCtx.stroke(); }

  // Draw class A (circles, blue)
  classA.forEach(p => {
    kCtx.beginPath();
    kCtx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    kCtx.fillStyle = 'rgba(88,166,255,0.8)';
    kCtx.fill();
    kCtx.strokeStyle = '#58a6ff';
    kCtx.lineWidth = 2;
    kCtx.stroke();
  });

  // Draw class B (squares, red)
  classB.forEach(p => {
    kCtx.fillStyle = 'rgba(248,81,73,0.8)';
    kCtx.strokeStyle = '#f85149';
    kCtx.lineWidth = 2;
    kCtx.fillRect(p.x - 7, p.y - 7, 14, 14);
    kCtx.strokeRect(p.x - 7, p.y - 7, 14, 14);
  });

  // Query point and nearest neighbours
  if (queryPoint) {
    const K = parseInt(kSlider.value);
    const all = [
      ...classA.map(p => ({ ...p, label: 'A', dist: Math.hypot(p.x - queryPoint.x, p.y - queryPoint.y) })),
      ...classB.map(p => ({ ...p, label: 'B', dist: Math.hypot(p.x - queryPoint.x, p.y - queryPoint.y) }))
    ].sort((a, b) => a.dist - b.dist);

    const neighbours = all.slice(0, K);

    // Draw lines to neighbours
    neighbours.forEach(n => {
      kCtx.beginPath();
      kCtx.moveTo(queryPoint.x, queryPoint.y);
      kCtx.lineTo(n.x, n.y);
      kCtx.strokeStyle = 'rgba(255,255,255,0.3)';
      kCtx.setLineDash([4, 4]);
      kCtx.lineWidth = 1.5;
      kCtx.stroke();
      kCtx.setLineDash([]);

      // Highlight neighbour
      kCtx.beginPath();
      kCtx.arc(n.x, n.y, 14, 0, Math.PI * 2);
      kCtx.strokeStyle = 'rgba(255,255,255,0.5)';
      kCtx.lineWidth = 2;
      kCtx.stroke();
    });

    // Majority vote
    const votes = { A: 0, B: 0 };
    neighbours.forEach(n => votes[n.label]++);
    const prediction = votes.A >= votes.B ? 'A' : 'B';
    const predColor = prediction === 'A' ? '#58a6ff' : '#f85149';

    // Draw query point (star)
    kCtx.save();
    kCtx.translate(queryPoint.x, queryPoint.y);
    kCtx.fillStyle = '#39d353';
    kCtx.strokeStyle = '#fff';
    kCtx.lineWidth = 2;
    kCtx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
      const x = Math.cos(angle) * 12, y = Math.sin(angle) * 12;
      i === 0 ? kCtx.moveTo(x, y) : kCtx.lineTo(x, y);
    }
    kCtx.closePath();
    kCtx.fill();
    kCtx.stroke();
    kCtx.restore();

    // Prediction label
    kCtx.fillStyle = predColor;
    kCtx.font = 'bold 14px Segoe UI';
    kCtx.fillText(`→ Prediction: Class ${prediction} (${votes.A}A, ${votes.B}B)`, queryPoint.x + 16, queryPoint.y + 5);
  }
}

if (knnCanvas) {
  kSlider.addEventListener('input', () => { kVal.textContent = kSlider.value; drawKNN(); });
  knnCanvas.addEventListener('click', e => {
    const rect = knnCanvas.getBoundingClientRect();
    queryPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    drawKNN();
  });
  addRandomPoints();
}

// ===== GRADIENT DESCENT VISUALIZER =====
const gdCanvas = document.getElementById('gdCanvas');
const gCtx = gdCanvas?.getContext('2d');
let gdTheta = 3.0, gdLR = 0.1, gdRunning = false, gdHistory = [], gdAnimId = null;

const lrSlider = document.getElementById('lrSlider');
const startSlider = document.getElementById('startSlider');
const gdInfo = document.getElementById('gdInfo');

function J(t) { return t * t; }
function dJ(t) { return 2 * t; }

function updateLR() {
  gdLR = parseFloat(lrSlider.value);
  document.getElementById('lrVal').textContent = gdLR.toFixed(2);
}

function updateStart() {
  gdTheta = parseFloat(startSlider.value);
  document.getElementById('startVal').textContent = gdTheta.toFixed(1);
  gdHistory = [{ t: gdTheta, j: J(gdTheta) }];
  drawGD();
}

function drawGD() {
  if (!gCtx) return;
  const W = gdCanvas.width, H = gdCanvas.height;
  const PAD = 50;
  gCtx.clearRect(0, 0, W, H);

  const tMin = -4.5, tMax = 4.5, jMax = 22;

  const tx = t => PAD + (t - tMin) / (tMax - tMin) * (W - 2 * PAD);
  const ty = j => H - PAD - j / jMax * (H - 2 * PAD);

  // Axes
  gCtx.strokeStyle = 'rgba(255,255,255,0.15)';
  gCtx.lineWidth = 1;
  gCtx.beginPath(); gCtx.moveTo(PAD, ty(0)); gCtx.lineTo(W - PAD, ty(0)); gCtx.stroke();
  gCtx.beginPath(); gCtx.moveTo(tx(0), PAD); gCtx.lineTo(tx(0), H - PAD); gCtx.stroke();

  // Labels
  gCtx.fillStyle = 'rgba(255,255,255,0.4)';
  gCtx.font = '11px Segoe UI';
  gCtx.fillText('θ', W - PAD + 8, ty(0) + 4);
  gCtx.fillText('J(θ)', tx(0) + 6, PAD - 8);
  gCtx.fillText('0', tx(0) - 12, ty(0) + 14);

  // Tick labels
  [-4,-3,-2,-1,1,2,3,4].forEach(v => {
    gCtx.fillText(v, tx(v) - 4, ty(0) + 14);
  });

  // Draw J(θ) = θ²
  gCtx.beginPath();
  gCtx.strokeStyle = 'rgba(88,166,255,0.6)';
  gCtx.lineWidth = 2.5;
  let first = true;
  for (let t = tMin; t <= tMax; t += 0.05) {
    const j = J(t);
    if (j > jMax) { first = true; continue; }
    first ? gCtx.moveTo(tx(t), ty(j)) : gCtx.lineTo(tx(t), ty(j));
    first = false;
  }
  gCtx.stroke();

  // Curve label
  gCtx.fillStyle = '#58a6ff';
  gCtx.font = '12px Segoe UI';
  gCtx.fillText('J(θ) = θ²', tx(3.5), ty(J(3.5)) - 10);

  // Draw path
  if (gdHistory.length > 1) {
    gCtx.beginPath();
    gCtx.strokeStyle = 'rgba(63,185,80,0.7)';
    gCtx.lineWidth = 2;
    gdHistory.forEach((pt, i) => {
      const x = tx(pt.t), y = ty(Math.min(pt.j, jMax));
      i === 0 ? gCtx.moveTo(x, y) : gCtx.lineTo(x, y);
    });
    gCtx.stroke();
  }

  // Draw points on path
  gdHistory.forEach((pt, i) => {
    const x = tx(pt.t), y = ty(Math.min(pt.j, jMax));
    const alpha = 0.3 + 0.7 * (i / Math.max(gdHistory.length - 1, 1));
    gCtx.beginPath();
    gCtx.arc(x, y, i === gdHistory.length - 1 ? 8 : 4, 0, Math.PI * 2);
    gCtx.fillStyle = i === gdHistory.length - 1 ? '#3fb950' : `rgba(63,185,80,${alpha})`;
    gCtx.fill();
  });

  // Minimum marker
  gCtx.beginPath();
  gCtx.arc(tx(0), ty(0), 6, 0, Math.PI * 2);
  gCtx.fillStyle = '#d29922';
  gCtx.fill();
  gCtx.fillStyle = '#d29922';
  gCtx.font = '11px Segoe UI';
  gCtx.fillText('min', tx(0) + 8, ty(0) - 4);
}

function runGD() {
  if (gdRunning) return;
  gdRunning = true;
  gdTheta = parseFloat(startSlider.value);
  gdLR = parseFloat(lrSlider.value);
  gdHistory = [{ t: gdTheta, j: J(gdTheta) }];

  let iter = 0;
  function step() {
    if (Math.abs(gdTheta) < 0.001 || iter >= 60) { gdRunning = false; return; }
    gdTheta = gdTheta - gdLR * dJ(gdTheta);
    gdHistory.push({ t: gdTheta, j: J(gdTheta) });
    iter++;
    if (gdInfo) gdInfo.textContent = `Iteration: ${iter} | θ = ${gdTheta.toFixed(4)} | J(θ) = ${J(gdTheta).toFixed(4)}`;
    drawGD();
    gdAnimId = setTimeout(step, 120);
  }
  step();
}

function resetGD() {
  clearTimeout(gdAnimId);
  gdRunning = false;
  gdTheta = parseFloat(startSlider.value);
  gdHistory = [{ t: gdTheta, j: J(gdTheta) }];
  if (gdInfo) gdInfo.textContent = `Iteration: 0 | θ = ${gdTheta.toFixed(2)} | J(θ) = ${J(gdTheta).toFixed(2)}`;
  drawGD();
}

if (gdCanvas) { resetGD(); }
