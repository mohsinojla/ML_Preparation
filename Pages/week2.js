// ===== REGRESSION VISUALIZER =====
const regCanvas = document.getElementById('regCanvas');
const rCtx = regCanvas?.getContext('2d');
let regPoints = [];

function toCanvasX(v, min, max, pad, W) { return pad + (v - min) / (max - min) * (W - 2 * pad); }
function toCanvasY(v, min, max, pad, H) { return H - pad - (v - min) / (max - min) * (H - 2 * pad); }

function leastSquares(pts) {
  const n = pts.length;
  if (n < 2) return null;
  const mx = pts.reduce((s, p) => s + p.x, 0) / n;
  const my = pts.reduce((s, p) => s + p.y, 0) / n;
  const num = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const den = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  if (Math.abs(den) < 1e-10) return null;
  const t1 = num / den;
  const t0 = my - t1 * mx;
  const mse = pts.reduce((s, p) => s + (t0 + t1 * p.x - p.y) ** 2, 0) / (2 * n);
  return { t0, t1, mse };
}

function drawReg() {
  if (!rCtx) return;
  const W = regCanvas.width, H = regCanvas.height, PAD = 40;
  rCtx.clearRect(0, 0, W, H);

  // Grid
  rCtx.strokeStyle = 'rgba(255,255,255,0.05)';
  rCtx.lineWidth = 1;
  for (let x = PAD; x < W - PAD; x += 50) { rCtx.beginPath(); rCtx.moveTo(x, PAD); rCtx.lineTo(x, H - PAD); rCtx.stroke(); }
  for (let y = PAD; y < H - PAD; y += 50) { rCtx.beginPath(); rCtx.moveTo(PAD, y); rCtx.lineTo(W - PAD, y); rCtx.stroke(); }

  // Axes
  rCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  rCtx.lineWidth = 1.5;
  rCtx.beginPath(); rCtx.moveTo(PAD, PAD); rCtx.lineTo(PAD, H - PAD); rCtx.lineTo(W - PAD, H - PAD); rCtx.stroke();

  if (regPoints.length === 0) {
    rCtx.fillStyle = 'rgba(255,255,255,0.2)';
    rCtx.font = '14px Segoe UI';
    rCtx.textAlign = 'center';
    rCtx.fillText('Click to add data points', W / 2, H / 2);
    rCtx.textAlign = 'left';
    return;
  }

  const xs = regPoints.map(p => p.x), ys = regPoints.map(p => p.y);
  const xMin = Math.min(...xs) - 1, xMax = Math.max(...xs) + 1;
  const yMin = Math.min(...ys) - 1, yMax = Math.max(...ys) + 1;

  const cx = v => toCanvasX(v, xMin, xMax, PAD, W);
  const cy = v => toCanvasY(v, yMin, yMax, PAD, H);

  // Points
  regPoints.forEach(p => {
    rCtx.beginPath();
    rCtx.arc(cx(p.x), cy(p.y), 6, 0, Math.PI * 2);
    rCtx.fillStyle = '#58a6ff';
    rCtx.fill();
    rCtx.strokeStyle = '#79c0ff';
    rCtx.lineWidth = 1.5;
    rCtx.stroke();
  });

  const model = leastSquares(regPoints);
  if (!model) return;

  const { t0, t1, mse } = model;

  // Regression line
  const x1 = xMin, y1 = t0 + t1 * x1;
  const x2 = xMax, y2 = t0 + t1 * x2;
  rCtx.beginPath();
  rCtx.moveTo(cx(x1), cy(y1));
  rCtx.lineTo(cx(x2), cy(y2));
  rCtx.strokeStyle = '#3fb950';
  rCtx.lineWidth = 2.5;
  rCtx.stroke();

  // Residual lines
  regPoints.forEach(p => {
    const pred = t0 + t1 * p.x;
    rCtx.beginPath();
    rCtx.moveTo(cx(p.x), cy(p.y));
    rCtx.lineTo(cx(p.x), cy(pred));
    rCtx.strokeStyle = 'rgba(248,81,73,0.5)';
    rCtx.setLineDash([3, 3]);
    rCtx.lineWidth = 1.5;
    rCtx.stroke();
    rCtx.setLineDash([]);
  });

  // Info
  const info = document.getElementById('regInfo');
  if (info) info.textContent = `θ₀ = ${t0.toFixed(3)} | θ₁ = ${t1.toFixed(3)} | MSE = ${mse.toFixed(4)} | n = ${regPoints.length}`;
}

if (regCanvas) {
  regCanvas.addEventListener('click', e => {
    const rect = regCanvas.getBoundingClientRect();
    const W = regCanvas.width, H = regCanvas.height, PAD = 40;
    const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
    // Convert canvas coords to data coords (approximate 0-10 range)
    const x = (cx - PAD) / (W - 2 * PAD) * 10;
    const y = (H - PAD - cy) / (H - 2 * PAD) * 10;
    regPoints.push({ x, y });
    drawReg();
  });
  drawReg();
}

function clearRegData() { regPoints = []; drawReg(); if (document.getElementById('regInfo')) document.getElementById('regInfo').textContent = 'θ₀ = — | θ₁ = — | MSE = —'; }

function addRegSample() {
  regPoints = [
    {x:1,y:2.1},{x:2,y:3.9},{x:3,y:6.2},{x:4,y:7.8},{x:5,y:10.1},
    {x:6,y:11.9},{x:7,y:14.2},{x:8,y:15.8},{x:1.5,y:3},{x:3.5,y:7},{x:5.5,y:11},{x:7.5,y:15}
  ];
  drawReg();
}

// ===== BIAS VARIANCE CURVE =====
const bvCanvas = document.getElementById('bvCanvas');
const bCtx = bvCanvas?.getContext('2d');

function drawBV() {
  if (!bCtx) return;
  const W = bvCanvas.width, H = bvCanvas.height;
  const PAD = 50;
  bCtx.clearRect(0, 0, W, H);

  const n = 200;
  const bias2 = x => 4 / (x + 0.5) ** 1.5;
  const variance = x => 0.2 * x ** 1.8;
  const total = x => bias2(x) + variance(x) + 0.3;

  const xMax = 8, yMax = 6;
  const cx = x => PAD + x / xMax * (W - 2 * PAD);
  const cy = y => H - PAD - y / yMax * (H - 2 * PAD);

  // Grid
  rCtx_grid(bCtx, W, H, PAD);

  // Axes labels
  bCtx.fillStyle = 'rgba(255,255,255,0.4)';
  bCtx.font = '11px Segoe UI';
  bCtx.fillText('Model Complexity →', W / 2 - 60, H - 8);
  bCtx.save();
  bCtx.translate(14, H / 2);
  bCtx.rotate(-Math.PI / 2);
  bCtx.fillText('Error →', -20, 0);
  bCtx.restore();

  // Find sweet spot
  let minX = 0, minY = Infinity;
  for (let i = 0; i < n; i++) {
    const x = i / n * xMax;
    const y = total(x);
    if (y < minY) { minY = y; minX = x; }
  }

  // Draw curves
  function drawCurve(fn, color, dash = []) {
    bCtx.beginPath();
    bCtx.strokeStyle = color;
    bCtx.lineWidth = 2.5;
    bCtx.setLineDash(dash);
    for (let i = 0; i <= n; i++) {
      const x = i / n * xMax;
      const y = fn(x);
      if (y > yMax) continue;
      i === 0 ? bCtx.moveTo(cx(x), cy(y)) : bCtx.lineTo(cx(x), cy(y));
    }
    bCtx.stroke();
    bCtx.setLineDash([]);
  }

  drawCurve(bias2, '#58a6ff');
  drawCurve(variance, '#f85149');
  drawCurve(total, '#d29922');

  // Labels
  bCtx.fillStyle = '#58a6ff';
  bCtx.font = 'bold 12px Segoe UI';
  bCtx.fillText('Bias²', cx(0.3), cy(bias2(0.3)) - 8);
  bCtx.fillStyle = '#f85149';
  bCtx.fillText('Variance', cx(6), cy(variance(6)) - 8);
  bCtx.fillStyle = '#d29922';
  bCtx.fillText('Total Error', cx(3), cy(total(3)) - 8);

  // Sweet spot star
  bCtx.beginPath();
  bCtx.arc(cx(minX), cy(minY), 10, 0, Math.PI * 2);
  bCtx.strokeStyle = '#3fb950';
  bCtx.lineWidth = 2;
  bCtx.stroke();
  bCtx.fillStyle = '#3fb950';
  bCtx.font = 'bold 11px Segoe UI';
  bCtx.fillText('★ Optimal', cx(minX) + 12, cy(minY) + 4);

  // Underfitting / Overfitting regions
  bCtx.fillStyle = 'rgba(88,166,255,0.06)';
  bCtx.fillRect(PAD, PAD, cx(minX) - PAD, H - 2 * PAD);
  bCtx.fillStyle = 'rgba(248,81,73,0.06)';
  bCtx.fillRect(cx(minX), PAD, W - PAD - cx(minX), H - 2 * PAD);

  bCtx.fillStyle = 'rgba(88,166,255,0.5)';
  bCtx.font = '11px Segoe UI';
  bCtx.fillText('← Underfitting', PAD + 5, PAD + 16);
  bCtx.fillStyle = 'rgba(248,81,73,0.5)';
  bCtx.fillText('Overfitting →', cx(minX) + 8, PAD + 16);

  // Irreducible noise line
  bCtx.beginPath();
  bCtx.setLineDash([6, 4]);
  bCtx.strokeStyle = 'rgba(255,255,255,0.2)';
  bCtx.lineWidth = 1;
  bCtx.moveTo(PAD, cy(0.3));
  bCtx.lineTo(W - PAD, cy(0.3));
  bCtx.stroke();
  bCtx.setLineDash([]);
  bCtx.fillStyle = 'rgba(255,255,255,0.3)';
  bCtx.font = '10px Segoe UI';
  bCtx.fillText('Irreducible noise σ²', W - PAD - 100, cy(0.3) - 4);
}

function rCtx_grid(ctx, W, H, PAD) {
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let x = PAD; x < W - PAD; x += 60) { ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, H - PAD); ctx.stroke(); }
  for (let y = PAD; y < H - PAD; y += 40) { ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(W - PAD, y); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(PAD, PAD); ctx.lineTo(PAD, H - PAD); ctx.lineTo(W - PAD, H - PAD); ctx.stroke();
}

if (bvCanvas) drawBV();
