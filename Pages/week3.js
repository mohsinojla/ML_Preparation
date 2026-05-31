// ===== SVM STATIC DIAGRAM =====
const svmDiagram = document.getElementById('svmDiagram');
const dCtx = svmDiagram?.getContext('2d');

function drawSVMDiagram() {
  if (!dCtx) return;
  const W = svmDiagram.width, H = svmDiagram.height;
  dCtx.clearRect(0, 0, W, H);

  // Background
  dCtx.fillStyle = '#0d1117';
  dCtx.fillRect(0, 0, W, H);

  // Shaded margin region
  const cx = W / 2, slope = -0.7;
  const lineY = x => H / 2 + slope * (x - cx);
  const posY  = x => lineY(x) - 60;
  const negY  = x => lineY(x) + 60;

  // Margin band fill
  dCtx.beginPath();
  dCtx.moveTo(0, posY(0)); dCtx.lineTo(W, posY(W));
  dCtx.lineTo(W, negY(W)); dCtx.lineTo(0, negY(0));
  dCtx.closePath();
  dCtx.fillStyle = 'rgba(63,185,80,0.07)';
  dCtx.fill();

  // Decision boundary
  dCtx.beginPath();
  dCtx.moveTo(0, lineY(0)); dCtx.lineTo(W, lineY(W));
  dCtx.strokeStyle = '#3fb950'; dCtx.lineWidth = 2.5; dCtx.stroke();

  // Margin boundaries
  dCtx.setLineDash([8, 5]);
  dCtx.lineWidth = 1.8;
  dCtx.strokeStyle = 'rgba(63,185,80,0.5)';
  dCtx.beginPath(); dCtx.moveTo(0, posY(0)); dCtx.lineTo(W, posY(W)); dCtx.stroke();
  dCtx.beginPath(); dCtx.moveTo(0, negY(0)); dCtx.lineTo(W, negY(W)); dCtx.stroke();
  dCtx.setLineDash([]);

  // Labels
  dCtx.font = 'bold 12px Segoe UI';
  dCtx.fillStyle = '#3fb950';
  dCtx.fillText('w·x + b = 0  (Decision boundary)', 10, lineY(10) - 8);
  dCtx.fillStyle = 'rgba(63,185,80,0.7)';
  dCtx.fillText('w·x + b = +1', 10, posY(10) - 8);
  dCtx.fillText('w·x + b = −1', 10, negY(10) + 18);

  // Margin arrow
  const mx = W * 0.75;
  dCtx.beginPath();
  dCtx.moveTo(mx, posY(mx)); dCtx.lineTo(mx, negY(mx));
  dCtx.strokeStyle = 'rgba(255,255,255,0.4)'; dCtx.lineWidth = 1;
  dCtx.setLineDash([3, 3]); dCtx.stroke(); dCtx.setLineDash([]);
  dCtx.fillStyle = 'rgba(255,255,255,0.6)'; dCtx.font = '11px Segoe UI';
  dCtx.fillText('margin = 2/‖w‖', mx + 6, (posY(mx) + negY(mx)) / 2 + 4);

  // Class +1 points (circles, blue)
  const plus = [{x:120,y:80},{x:80,y:160},{x:160,y:130},{x:60,y:60},{x:200,y:70}];
  plus.forEach(p => {
    const py = p.y + lineY(p.x) - H/2;
    dCtx.beginPath(); dCtx.arc(p.x, py - 80, 9, 0, Math.PI*2);
    dCtx.fillStyle = 'rgba(88,166,255,0.85)'; dCtx.fill();
    dCtx.strokeStyle = '#58a6ff'; dCtx.lineWidth = 2; dCtx.stroke();
    dCtx.fillStyle = '#fff'; dCtx.font = 'bold 10px Segoe UI'; dCtx.textAlign = 'center';
    dCtx.fillText('+1', p.x, py - 77);
    dCtx.textAlign = 'left';
  });

  // Class -1 points (squares, red)
  const minus = [{x:360,y:200},{x:420,y:150},{x:480,y:220},{x:400,y:270},{x:460,y:300}];
  minus.forEach(p => {
    const py = p.y + lineY(p.x) - H/2;
    dCtx.fillStyle = 'rgba(248,81,73,0.85)';
    dCtx.strokeStyle = '#f85149'; dCtx.lineWidth = 2;
    dCtx.fillRect(p.x-9, py+60, 18, 18); dCtx.strokeRect(p.x-9, py+60, 18, 18);
    dCtx.fillStyle = '#fff'; dCtx.font = 'bold 10px Segoe UI'; dCtx.textAlign = 'center';
    dCtx.fillText('−1', p.x, py+74);
    dCtx.textAlign = 'left';
  });

  // Support vectors (highlighted with ring)
  const svPlus = {x: 170, y: 60};
  const svMinus = {x: 360, y: 200};

  // SV+ ring
  const svpY = svPlus.y + lineY(svPlus.x) - H/2 - 80;
  dCtx.beginPath(); dCtx.arc(svPlus.x, svpY, 16, 0, Math.PI*2);
  dCtx.strokeStyle = '#d29922'; dCtx.lineWidth = 2.5; dCtx.stroke();
  dCtx.fillStyle = '#d29922'; dCtx.font = '10px Segoe UI';
  dCtx.fillText('SV', svPlus.x+18, svpY+4);

  // SV- ring
  const svmY = svMinus.y + lineY(svMinus.x) - H/2 + 60;
  dCtx.beginPath(); dCtx.arc(svMinus.x, svmY+9, 16, 0, Math.PI*2);
  dCtx.strokeStyle = '#d29922'; dCtx.lineWidth = 2.5; dCtx.stroke();
  dCtx.fillStyle = '#d29922';
  dCtx.fillText('SV', svMinus.x+18, svmY+13);

  // Normal vector (w direction)
  const nx = 300, ny = lineY(300);
  dCtx.beginPath();
  dCtx.moveTo(nx, ny); dCtx.lineTo(nx - 40, ny - 56);
  dCtx.strokeStyle = 'rgba(255,255,255,0.5)'; dCtx.lineWidth = 1.5;
  dCtx.setLineDash([]); dCtx.stroke();
  dCtx.fillStyle = 'rgba(255,255,255,0.6)'; dCtx.font = 'italic 12px Segoe UI';
  dCtx.fillText('w (normal)', nx - 80, ny - 60);
}

if (svmDiagram) drawSVMDiagram();

// ===== INTERACTIVE SVM CANVAS =====
const svmCanvas = document.getElementById('svmCanvas');
const sCtx = svmCanvas?.getContext('2d');
let svmPlus = [], svmMinus = [];

function clearSVM() { svmPlus = []; svmMinus = []; drawSVM(); }

function loadSVMSample() {
  svmPlus  = [{x:100,y:100},{x:120,y:180},{x:80,y:150},{x:150,y:120},{x:90,y:220}];
  svmMinus = [{x:380,y:200},{x:400,y:140},{x:450,y:220},{x:420,y:280},{x:350,y:170}];
  drawSVM();
}

// Simple linear SVM via gradient descent (simplified for visualization)
function simpleSVM(pos, neg) {
  if (pos.length < 2 || neg.length < 2) return null;
  const W = svmCanvas.width, H = svmCanvas.height;
  const all = [
    ...pos.map(p => ({ x: p.x/W*2-1, y: -(p.y/H*2-1), label: 1 })),
    ...neg.map(p => ({ x: p.x/W*2-1, y: -(p.y/H*2-1), label: -1 }))
  ];
  let w = [0.1, 0.1], b = 0;
  const lr = 0.01, C = 1, epochs = 500;
  for (let e = 0; e < epochs; e++) {
    all.forEach(pt => {
      const margin = pt.label * (w[0]*pt.x + w[1]*pt.y + b);
      if (margin < 1) {
        w[0] -= lr * (w[0] - C * pt.label * pt.x);
        w[1] -= lr * (w[1] - C * pt.label * pt.y);
        b    -= lr * (-C * pt.label);
      } else {
        w[0] -= lr * w[0];
        w[1] -= lr * w[1];
      }
    });
  }
  return { w, b };
}

function drawSVM() {
  if (!sCtx) return;
  const W = svmCanvas.width, H = svmCanvas.height;
  sCtx.clearRect(0, 0, W, H);

  // Grid
  sCtx.strokeStyle = 'rgba(255,255,255,0.04)'; sCtx.lineWidth = 1;
  for (let x = 0; x < W; x += 40) { sCtx.beginPath(); sCtx.moveTo(x,0); sCtx.lineTo(x,H); sCtx.stroke(); }
  for (let y = 0; y < H; y += 40) { sCtx.beginPath(); sCtx.moveTo(0,y); sCtx.lineTo(W,y); sCtx.stroke(); }

  if (svmPlus.length === 0 && svmMinus.length === 0) {
    sCtx.fillStyle = 'rgba(255,255,255,0.2)'; sCtx.font = '14px Segoe UI'; sCtx.textAlign = 'center';
    sCtx.fillText('Left-click = Class +1 (blue)  |  Right-click = Class -1 (red)', W/2, H/2);
    sCtx.textAlign = 'left'; return;
  }

  const model = simpleSVM(svmPlus, svmMinus);

  if (model) {
    const { w, b } = model;
    // Draw decision boundary
    // w[0]*(x*2/W-1) + w[1]*(-(y*2/H-1)) + b = 0
    // Solve for y at x=0 and x=W
    const decY = px => {
      const nx = px/W*2-1;
      const ny = -(w[0]*nx + b) / w[1];
      return ((-ny) + 1) / 2 * H;
    };
    sCtx.beginPath(); sCtx.moveTo(0, decY(0)); sCtx.lineTo(W, decY(W));
    sCtx.strokeStyle = '#3fb950'; sCtx.lineWidth = 2.5; sCtx.stroke();

    // Margin boundaries (offset by 1/‖w‖ in feature space)
    const norm = Math.sqrt(w[0]**2 + w[1]**2);
    const marginPx = (1/norm) * (W/2); // approximate pixel offset

    const posMarginY = px => decY(px) - marginPx * (w[0]/norm);
    const negMarginY = px => decY(px) + marginPx * (w[0]/norm);

    sCtx.setLineDash([7,4]);
    sCtx.strokeStyle = 'rgba(63,185,80,0.5)'; sCtx.lineWidth = 1.5;
    sCtx.beginPath(); sCtx.moveTo(0, posMarginY(0)); sCtx.lineTo(W, posMarginY(W)); sCtx.stroke();
    sCtx.beginPath(); sCtx.moveTo(0, negMarginY(0)); sCtx.lineTo(W, negMarginY(W)); sCtx.stroke();
    sCtx.setLineDash([]);

    const info = document.getElementById('svmInfo');
    if (info) info.textContent = `w = [${w[0].toFixed(3)}, ${w[1].toFixed(3)}] | b = ${b.toFixed(3)} | Margin ≈ ${(2/norm * W/2).toFixed(1)}px`;
  }

  // Draw points
  svmPlus.forEach(p => {
    sCtx.beginPath(); sCtx.arc(p.x, p.y, 8, 0, Math.PI*2);
    sCtx.fillStyle = 'rgba(88,166,255,0.8)'; sCtx.fill();
    sCtx.strokeStyle = '#58a6ff'; sCtx.lineWidth = 2; sCtx.stroke();
    sCtx.fillStyle = '#fff'; sCtx.font = 'bold 9px Segoe UI'; sCtx.textAlign = 'center';
    sCtx.fillText('+', p.x, p.y+3); sCtx.textAlign = 'left';
  });

  svmMinus.forEach(p => {
    sCtx.fillStyle = 'rgba(248,81,73,0.8)';
    sCtx.strokeStyle = '#f85149'; sCtx.lineWidth = 2;
    sCtx.fillRect(p.x-8, p.y-8, 16, 16); sCtx.strokeRect(p.x-8, p.y-8, 16, 16);
    sCtx.fillStyle = '#fff'; sCtx.font = 'bold 10px Segoe UI'; sCtx.textAlign = 'center';
    sCtx.fillText('−', p.x, p.y+4); sCtx.textAlign = 'left';
  });
}

if (svmCanvas) {
  svmCanvas.addEventListener('click', e => {
    const r = svmCanvas.getBoundingClientRect();
    svmPlus.push({ x: e.clientX - r.left, y: e.clientY - r.top });
    drawSVM();
  });
  svmCanvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    const r = svmCanvas.getBoundingClientRect();
    svmMinus.push({ x: e.clientX - r.left, y: e.clientY - r.top });
    drawSVM();
  });
  drawSVM();
}
