// ===== OUTLIER COMPARISON DIAGRAM =====
const outlierCanvas = document.getElementById('outlierCanvas');
const oCtx = outlierCanvas?.getContext('2d');

function drawOutlierDiagram() {
  if (!oCtx) return;
  const W = outlierCanvas.width, H = outlierCanvas.height;
  oCtx.clearRect(0, 0, W, H);

  const half = W / 2;

  // --- LEFT PANEL: Hard Margin (affected by outlier) ---
  oCtx.fillStyle = 'rgba(255,255,255,0.03)';
  oCtx.fillRect(0, 0, half - 4, H);

  // Title
  oCtx.fillStyle = 'rgba(248,81,73,0.8)';
  oCtx.font = 'bold 12px Segoe UI';
  oCtx.textAlign = 'center';
  oCtx.fillText('Hard Margin (squeezed by outlier)', half / 2, 20);

  // Draw hard-margin decision boundary (tilted, squeezed)
  const hDecY = x => H * 0.5 + (x - half * 0.5) * 0.2;
  const hPosY = x => hDecY(x) - 30;
  const hNegY = x => hDecY(x) + 30;

  oCtx.beginPath(); oCtx.moveTo(10, hDecY(10)); oCtx.lineTo(half - 10, hDecY(half - 10));
  oCtx.strokeStyle = '#3fb950'; oCtx.lineWidth = 2; oCtx.stroke();

  oCtx.setLineDash([5, 4]);
  oCtx.strokeStyle = 'rgba(63,185,80,0.45)'; oCtx.lineWidth = 1.5;
  oCtx.beginPath(); oCtx.moveTo(10, hPosY(10)); oCtx.lineTo(half - 10, hPosY(half - 10)); oCtx.stroke();
  oCtx.beginPath(); oCtx.moveTo(10, hNegY(10)); oCtx.lineTo(half - 10, hNegY(half - 10)); oCtx.stroke();
  oCtx.setLineDash([]);

  // Margin width annotation
  oCtx.fillStyle = 'rgba(248,81,73,0.7)'; oCtx.font = '10px Segoe UI'; oCtx.textAlign = 'left';
  oCtx.fillText('narrow margin!', 10, hDecY(10) - 38);
  // Arrow
  oCtx.beginPath(); oCtx.moveTo(55, hPosY(55)); oCtx.lineTo(55, hNegY(55));
  oCtx.strokeStyle = 'rgba(248,81,73,0.5)'; oCtx.lineWidth = 1; oCtx.stroke();

  // Class +1 points (blue circles)
  [[50,60],[70,90],[40,110],[80,70]].forEach(([px, py]) => {
    const canY = H * 0.25 + py * 0.4;
    oCtx.beginPath(); oCtx.arc(px, canY, 7, 0, Math.PI*2);
    oCtx.fillStyle = 'rgba(88,166,255,0.8)'; oCtx.fill();
    oCtx.strokeStyle = '#58a6ff'; oCtx.lineWidth = 1.5; oCtx.stroke();
  });

  // Outlier (blue circle, wrong position — close to boundary)
  oCtx.beginPath(); oCtx.arc(120, H * 0.54, 7, 0, Math.PI*2);
  oCtx.fillStyle = 'rgba(88,166,255,0.8)'; oCtx.fill();
  oCtx.strokeStyle = '#d29922'; oCtx.lineWidth = 2.5; oCtx.stroke();
  oCtx.fillStyle = '#d29922'; oCtx.font = 'bold 9px Segoe UI'; oCtx.textAlign = 'center';
  oCtx.fillText('outlier!', 120, H * 0.54 - 12);

  // Class -1 points (red squares)
  [[100,160],[120,190],[90,200],[140,170]].forEach(([px, py]) => {
    const canY = H * 0.45 + py * 0.25;
    oCtx.fillStyle = 'rgba(248,81,73,0.8)';
    oCtx.strokeStyle = '#f85149'; oCtx.lineWidth = 1.5;
    oCtx.fillRect(px - 6, canY - 6, 12, 12); oCtx.strokeRect(px - 6, canY - 6, 12, 12);
  });

  // Divider
  oCtx.strokeStyle = 'rgba(255,255,255,0.1)'; oCtx.lineWidth = 1;
  oCtx.setLineDash([4, 4]);
  oCtx.beginPath(); oCtx.moveTo(half, 0); oCtx.lineTo(half, H); oCtx.stroke();
  oCtx.setLineDash([]);

  // --- RIGHT PANEL: Soft Margin (ignores outlier) ---
  oCtx.fillStyle = 'rgba(63,185,80,0.03)';
  oCtx.fillRect(half + 4, 0, half - 4, H);

  oCtx.fillStyle = 'rgba(63,185,80,0.8)';
  oCtx.font = 'bold 12px Segoe UI'; oCtx.textAlign = 'center';
  oCtx.fillText('Soft Margin (ignores outlier)', half + half / 2, 20);

  // Soft margin — wider, centered
  const sDecY = x => H * 0.5;
  const sPosY = x => H * 0.5 - 55;
  const sNegY = x => H * 0.5 + 55;

  oCtx.beginPath(); oCtx.moveTo(half + 10, sDecY()); oCtx.lineTo(W - 10, sDecY());
  oCtx.strokeStyle = '#3fb950'; oCtx.lineWidth = 2; oCtx.stroke();

  oCtx.setLineDash([5, 4]);
  oCtx.strokeStyle = 'rgba(63,185,80,0.45)'; oCtx.lineWidth = 1.5;
  oCtx.beginPath(); oCtx.moveTo(half + 10, sPosY()); oCtx.lineTo(W - 10, sPosY()); oCtx.stroke();
  oCtx.beginPath(); oCtx.moveTo(half + 10, sNegY()); oCtx.lineTo(W - 10, sNegY()); oCtx.stroke();
  oCtx.setLineDash([]);

  oCtx.fillStyle = 'rgba(63,185,80,0.7)'; oCtx.font = '10px Segoe UI'; oCtx.textAlign = 'left';
  oCtx.fillText('wider margin ✓', half + 10, sPosY() - 6);
  oCtx.beginPath(); oCtx.moveTo(half + 60, sPosY()); oCtx.lineTo(half + 60, sNegY());
  oCtx.strokeStyle = 'rgba(63,185,80,0.5)'; oCtx.lineWidth = 1; oCtx.stroke();

  // Class +1 points (right side)
  [[half+50,70],[half+70,100],[half+40,120],[half+80,80]].forEach(([px, py]) => {
    const canY = H * 0.18 + py * 0.5;
    oCtx.beginPath(); oCtx.arc(px, canY, 7, 0, Math.PI*2);
    oCtx.fillStyle = 'rgba(88,166,255,0.8)'; oCtx.fill();
    oCtx.strokeStyle = '#58a6ff'; oCtx.lineWidth = 1.5; oCtx.stroke();
  });

  // Outlier inside margin (allowed by soft margin) — shown faded with slack annotation
  oCtx.beginPath(); oCtx.arc(half + 120, H * 0.42, 7, 0, Math.PI*2);
  oCtx.fillStyle = 'rgba(88,166,255,0.4)'; oCtx.fill();
  oCtx.strokeStyle = '#d29922'; oCtx.lineWidth = 1.5; oCtx.setLineDash([3,2]); oCtx.stroke(); oCtx.setLineDash([]);
  oCtx.fillStyle = '#d29922'; oCtx.font = '9px Segoe UI'; oCtx.textAlign = 'center';
  oCtx.fillText('ξ > 0', half + 120, H * 0.42 - 12);

  // Class -1 points (right side)
  [[half+100,150],[half+120,180],[half+90,195],[half+140,160]].forEach(([px, py]) => {
    const canY = H * 0.4 + py * 0.25;
    oCtx.fillStyle = 'rgba(248,81,73,0.8)';
    oCtx.strokeStyle = '#f85149'; oCtx.lineWidth = 1.5;
    oCtx.fillRect(px - 6, canY - 6, 12, 12); oCtx.strokeRect(px - 6, canY - 6, 12, 12);
  });

  oCtx.textAlign = 'left';
}

if (outlierCanvas) drawOutlierDiagram();

// ===== KERNEL VISUALIZER =====
const kernelCanvas = document.getElementById('kernelCanvas');
const kCtx = kernelCanvas?.getContext('2d');
let kernelData = { plus: [], minus: [] };
let cValue = 1.0;

function updateC() {
  cValue = parseFloat(document.getElementById('cSlider').value);
  document.getElementById('cVal').textContent = cValue.toFixed(1);
  drawKernelViz();
}

function loadKernelSample(type) {
  kernelData = { plus: [], minus: [] };
  if (!kernelCanvas) return;
  const W = kernelCanvas.width, H = kernelCanvas.height;
  const cx = W / 2, cy = H / 2;

  if (type === 'xor') {
    // XOR-like data: 4 clusters, linearly inseparable
    kernelData.plus  = [{x:cx-100,y:cy-80},{x:cx-120,y:cy-100},{x:cx-80,y:cy-60},{x:cx+100,y:cy+80},{x:cx+120,y:cy+100},{x:cx+80,y:cy+60}];
    kernelData.minus = [{x:cx+100,y:cy-80},{x:cx+120,y:cy-100},{x:cx+80,y:cy-60},{x:cx-100,y:cy+80},{x:cx-120,y:cy+100},{x:cx-80,y:cy+60}];
  } else {
    // Concentric circles
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * 2 * Math.PI;
      kernelData.plus.push({ x: cx + 60*Math.cos(a) + (Math.random()-0.5)*20, y: cy + 60*Math.sin(a) + (Math.random()-0.5)*20 });
      kernelData.minus.push({ x: cx + 130*Math.cos(a) + (Math.random()-0.5)*20, y: cy + 130*Math.sin(a) + (Math.random()-0.5)*20 });
    }
  }
  const info = document.getElementById('kernelInfo');
  if (info) info.textContent = `Dataset: ${type} | Kernel: ${document.getElementById('kernelSelect')?.value || 'rbf'}`;
  drawKernelViz();
}

function kernelFn(xi, xj, type) {
  const dot = xi[0]*xj[0] + xi[1]*xj[1];
  if (type === 'linear') return dot;
  if (type === 'poly') return (dot + 1) ** 2;
  if (type === 'rbf') {
    const gamma = 0.005;
    const d2 = (xi[0]-xj[0])**2 + (xi[1]-xj[1])**2;
    return Math.exp(-gamma * d2);
  }
  return dot;
}

// Simple kernel classifier via vote of training points
function classifyKernel(px, py, plusPts, minusPts, kernelType) {
  let score = 0;
  const pt = [px, py];
  plusPts.forEach(p => { score += kernelFn(pt, [p.x, p.y], kernelType); });
  minusPts.forEach(p => { score -= kernelFn(pt, [p.x, p.y], kernelType); });
  return score;
}

function drawKernelViz() {
  if (!kCtx || !kernelCanvas) return;
  const W = kernelCanvas.width, H = kernelCanvas.height;
  const kernelType = document.getElementById('kernelSelect')?.value || 'rbf';
  kCtx.clearRect(0, 0, W, H);

  if (kernelData.plus.length < 2) {
    kCtx.fillStyle = 'rgba(255,255,255,0.2)'; kCtx.font = '14px Segoe UI'; kCtx.textAlign = 'center';
    kCtx.fillText('Load a dataset above to see kernel boundaries', W/2, H/2);
    kCtx.textAlign = 'left';
    return;
  }

  // Draw decision region (pixel by pixel — subsampled)
  const step = 8;
  for (let px = 0; px < W; px += step) {
    for (let py = 0; py < H; py += step) {
      const score = classifyKernel(px, py, kernelData.plus, kernelData.minus, kernelType);
      if (score > 0) {
        kCtx.fillStyle = 'rgba(88,166,255,0.08)';
      } else {
        kCtx.fillStyle = 'rgba(248,81,73,0.08)';
      }
      kCtx.fillRect(px, py, step, step);
    }
  }

  // Draw decision boundary (contour at score=0)
  const res = 4;
  for (let px = 0; px < W - res; px += res) {
    for (let py = 0; py < H - res; py += res) {
      const s1 = classifyKernel(px, py, kernelData.plus, kernelData.minus, kernelType);
      const s2 = classifyKernel(px + res, py, kernelData.plus, kernelData.minus, kernelType);
      const s3 = classifyKernel(px, py + res, kernelData.plus, kernelData.minus, kernelType);
      if ((s1 > 0) !== (s2 > 0) || (s1 > 0) !== (s3 > 0)) {
        kCtx.fillStyle = '#3fb950';
        kCtx.fillRect(px, py, res, res);
      }
    }
  }

  // Draw points
  kernelData.plus.forEach(p => {
    kCtx.beginPath(); kCtx.arc(p.x, p.y, 8, 0, Math.PI*2);
    kCtx.fillStyle = 'rgba(88,166,255,0.9)'; kCtx.fill();
    kCtx.strokeStyle = '#79c0ff'; kCtx.lineWidth = 1.5; kCtx.stroke();
    kCtx.fillStyle = '#fff'; kCtx.font = 'bold 9px Segoe UI'; kCtx.textAlign = 'center';
    kCtx.fillText('+', p.x, p.y + 3); kCtx.textAlign = 'left';
  });

  kernelData.minus.forEach(p => {
    kCtx.fillStyle = 'rgba(248,81,73,0.9)';
    kCtx.strokeStyle = '#ff7b72'; kCtx.lineWidth = 1.5;
    kCtx.fillRect(p.x-8, p.y-8, 16, 16); kCtx.strokeRect(p.x-8, p.y-8, 16, 16);
    kCtx.fillStyle = '#fff'; kCtx.font = 'bold 10px Segoe UI'; kCtx.textAlign = 'center';
    kCtx.fillText('−', p.x, p.y + 4); kCtx.textAlign = 'left';
  });

  // Kernel label
  const labels = { linear: 'Linear Kernel', poly: 'Polynomial Kernel (d=2)', rbf: 'RBF / Gaussian Kernel' };
  kCtx.fillStyle = 'rgba(255,255,255,0.5)'; kCtx.font = 'bold 11px Segoe UI';
  kCtx.fillText(labels[kernelType] || kernelType, 10, H - 10);
}

if (kernelCanvas) drawKernelViz();
