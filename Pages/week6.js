// ===== K-MEANS VISUALIZER =====
const kmeansCanvas = document.getElementById('kmeansCanvas');
const kmCtx = kmeansCanvas?.getContext('2d');

const COLORS = ['#58a6ff','#3fb950','#f85149','#d29922','#bc8cff','#39d353'];
const CENTROID_COLORS = ['#79c0ff','#56d364','#ff7b72','#e3b341','#d2a8ff','#56d364'];

let kmPoints = [];
let kmCentroids = [];
let kmAssignments = [];
let kmK = 3;
let kmStep = 0;

function updateKM() {
  kmK = parseInt(document.getElementById('kmSlider').value);
  document.getElementById('kmVal').textContent = kmK;
}

function loadKMSample() {
  kmK = parseInt(document.getElementById('kmSlider').value);
  kmPoints = [];
  const W = kmeansCanvas.width, H = kmeansCanvas.height;
  // Generate blobs
  const centres = Array.from({length: kmK}, () => ({
    x: Math.random()*(W-100)+50,
    y: Math.random()*(H-80)+40
  }));
  centres.forEach(c => {
    for (let i = 0; i < 20; i++) {
      kmPoints.push({
        x: c.x + (Math.random()-0.5)*80,
        y: c.y + (Math.random()-0.5)*80
      });
    }
  });
  // Random initial centroids
  kmCentroids = Array.from({length: kmK}, () => ({
    x: Math.random()*(W-100)+50,
    y: Math.random()*(H-80)+40
  }));
  kmAssignments = new Array(kmPoints.length).fill(0);
  kmStep = 0;
  drawKM('Loaded! Click Step to begin.');
}

function assignPoints() {
  let changed = false;
  kmPoints.forEach((p, i) => {
    let best = 0, bestD = Infinity;
    kmCentroids.forEach((c, k) => {
      const d = Math.hypot(p.x-c.x, p.y-c.y);
      if (d < bestD) { bestD = d; best = k; }
    });
    if (kmAssignments[i] !== best) changed = true;
    kmAssignments[i] = best;
  });
  return changed;
}

function updateCentroids() {
  kmCentroids = kmCentroids.map((_, k) => {
    const pts = kmPoints.filter((_, i) => kmAssignments[i] === k);
    if (!pts.length) return { x: Math.random()*kmeansCanvas.width, y: Math.random()*kmeansCanvas.height };
    return {
      x: pts.reduce((s,p) => s+p.x, 0)/pts.length,
      y: pts.reduce((s,p) => s+p.y, 0)/pts.length
    };
  });
}

function computeInertia() {
  return kmPoints.reduce((s, p, i) => {
    const c = kmCentroids[kmAssignments[i]];
    return s + (p.x-c.x)**2 + (p.y-c.y)**2;
  }, 0);
}

function stepKMeans() {
  if (!kmPoints.length) { loadKMSample(); return; }
  kmStep++;
  const isAssign = kmStep % 2 === 1;
  let msg = '';
  if (isAssign) {
    const changed = assignPoints();
    msg = `Step ${kmStep}: Assignment — each point → nearest centroid. ${changed ? 'Assignments changed.' : 'No changes — converged!'}`;
  } else {
    updateCentroids();
    const inertia = computeInertia();
    msg = `Step ${kmStep}: Update — recompute centroids as cluster means. Inertia = ${inertia.toFixed(1)}`;
  }
  drawKM(msg);
}

function runKMeans() {
  if (!kmPoints.length) { loadKMSample(); return; }
  let iter = 0;
  function loop() {
    assignPoints();
    updateCentroids();
    iter++;
    const inertia = computeInertia();
    drawKM(`Running... Iteration ${iter} | Inertia = ${inertia.toFixed(1)}`);
    if (iter < 20) setTimeout(loop, 150);
    else drawKM(`Converged after ${iter} iterations. Inertia = ${computeInertia().toFixed(1)}`);
  }
  loop();
}

function resetKMeans() {
  kmPoints = []; kmCentroids = []; kmAssignments = []; kmStep = 0;
  if (kmCtx) kmCtx.clearRect(0, 0, kmeansCanvas.width, kmeansCanvas.height);
  document.getElementById('kmInfo').textContent = 'Click "Random Data" then "Step" to watch each iteration';
}

function drawKM(msg) {
  if (!kmCtx || !kmeansCanvas) return;
  const W = kmeansCanvas.width, H = kmeansCanvas.height;
  kmCtx.clearRect(0, 0, W, H);

  // Voronoi regions (simple coloured background)
  for (let px = 0; px < W; px += 6) {
    for (let py = 0; py < H; py += 6) {
      let best = 0, bestD = Infinity;
      kmCentroids.forEach((c, k) => {
        const d = Math.hypot(px-c.x, py-c.y);
        if (d < bestD) { bestD = d; best = k; }
      });
      kmCtx.fillStyle = COLORS[best % COLORS.length].replace(')', ',0.07)').replace('rgb', 'rgba').replace('#', '');
      // Simple hex color fill
      kmCtx.globalAlpha = 0.07;
      kmCtx.fillStyle = COLORS[best % COLORS.length];
      kmCtx.fillRect(px, py, 6, 6);
    }
  }
  kmCtx.globalAlpha = 1;

  // Data points
  kmPoints.forEach((p, i) => {
    const k = kmAssignments[i];
    kmCtx.beginPath();
    kmCtx.arc(p.x, p.y, 5, 0, Math.PI*2);
    kmCtx.fillStyle = COLORS[k % COLORS.length];
    kmCtx.globalAlpha = 0.8;
    kmCtx.fill();
    kmCtx.globalAlpha = 1;
    kmCtx.strokeStyle = 'rgba(255,255,255,0.3)';
    kmCtx.lineWidth = 1;
    kmCtx.stroke();
  });

  // Lines from points to centroids (thin, faded)
  if (kmStep > 0) {
    kmCtx.globalAlpha = 0.12;
    kmPoints.forEach((p, i) => {
      const c = kmCentroids[kmAssignments[i]];
      kmCtx.beginPath(); kmCtx.moveTo(p.x, p.y); kmCtx.lineTo(c.x, c.y);
      kmCtx.strokeStyle = COLORS[kmAssignments[i] % COLORS.length];
      kmCtx.lineWidth = 1; kmCtx.stroke();
    });
    kmCtx.globalAlpha = 1;
  }

  // Centroids (large cross + circle)
  kmCentroids.forEach((c, k) => {
    const col = CENTROID_COLORS[k % CENTROID_COLORS.length];
    kmCtx.beginPath(); kmCtx.arc(c.x, c.y, 12, 0, Math.PI*2);
    kmCtx.fillStyle = 'rgba(0,0,0,0.6)'; kmCtx.fill();
    kmCtx.strokeStyle = col; kmCtx.lineWidth = 3; kmCtx.stroke();
    // Cross
    kmCtx.strokeStyle = col; kmCtx.lineWidth = 2.5;
    kmCtx.beginPath(); kmCtx.moveTo(c.x-8, c.y); kmCtx.lineTo(c.x+8, c.y); kmCtx.stroke();
    kmCtx.beginPath(); kmCtx.moveTo(c.x, c.y-8); kmCtx.lineTo(c.x, c.y+8); kmCtx.stroke();
    // Label
    kmCtx.fillStyle = col; kmCtx.font = 'bold 10px Segoe UI'; kmCtx.textAlign = 'center';
    kmCtx.fillText(`μ${k+1}`, c.x, c.y-16);
  });

  if (msg) document.getElementById('kmInfo').textContent = msg;
  kmCtx.textAlign = 'left';
}

if (kmeansCanvas) drawKM('');

// ===== ELBOW METHOD VISUALIZER =====
const elbowCanvas = document.getElementById('elbowCanvas');
const elCtx = elbowCanvas?.getContext('2d');
let elbowData = [];
let trueK = 3;

function updateElbow() {
  trueK = parseInt(document.getElementById('trueCSlider').value);
  document.getElementById('trueCVal').textContent = trueK;
  regenElbow();
}

function regenElbow() {
  trueK = parseInt(document.getElementById('trueCSlider').value);
  // Generate synthetic data with trueK clusters
  const pts = [];
  const W = 500, H = 300;
  const centres = Array.from({length: trueK}, (_, i) => ({
    x: (i+1) * W/(trueK+1),
    y: H/2 + (Math.random()-0.5)*80
  }));
  centres.forEach(c => {
    for (let i = 0; i < 30; i++) {
      pts.push({ x: c.x+(Math.random()-0.5)*50, y: c.y+(Math.random()-0.5)*50 });
    }
  });
  // Compute inertia for K=1..8 via simple simulation
  elbowData = [];
  for (let k = 1; k <= 8; k++) {
    let bestInertia = Infinity;
    for (let trial = 0; trial < 5; trial++) {
      let centroids = pts.slice().sort(() => Math.random()-0.5).slice(0, k).map(p => ({...p}));
      for (let iter = 0; iter < 30; iter++) {
        const assigns = pts.map(p => {
          let best = 0, bestD = Infinity;
          centroids.forEach((c, ci) => { const d = (p.x-c.x)**2+(p.y-c.y)**2; if (d<bestD){bestD=d;best=ci;} });
          return best;
        });
        centroids = centroids.map((_, ki) => {
          const cluster = pts.filter((_, i) => assigns[i] === ki);
          if (!cluster.length) return centroids[ki];
          return { x: cluster.reduce((s,p)=>s+p.x,0)/cluster.length, y: cluster.reduce((s,p)=>s+p.y,0)/cluster.length };
        });
        const inertia = pts.reduce((s,p,i) => { const c = centroids[assigns[i]]; return s+(p.x-c.x)**2+(p.y-c.y)**2; }, 0);
        bestInertia = Math.min(bestInertia, inertia);
      }
    }
    elbowData.push({ k, inertia: bestInertia });
  }
  drawElbow();
}

function drawElbow() {
  if (!elCtx || !elbowCanvas || !elbowData.length) return;
  const W = elbowCanvas.width, H = elbowCanvas.height;
  const PAD = { left: 60, right: 20, top: 20, bottom: 40 };
  elCtx.clearRect(0, 0, W, H);

  const maxI = Math.max(...elbowData.map(d => d.inertia));
  const cx = k => PAD.left + (k-1)/(7)*( W-PAD.left-PAD.right);
  const cy = i => H - PAD.bottom - (i/maxI)*(H-PAD.top-PAD.bottom);

  // Grid
  elCtx.strokeStyle = 'rgba(255,255,255,0.05)'; elCtx.lineWidth = 1;
  for (let k = 1; k <= 8; k++) { elCtx.beginPath(); elCtx.moveTo(cx(k), PAD.top); elCtx.lineTo(cx(k), H-PAD.bottom); elCtx.stroke(); }
  [0.25,0.5,0.75,1].forEach(f => { elCtx.beginPath(); elCtx.moveTo(PAD.left, cy(f*maxI)); elCtx.lineTo(W-PAD.right, cy(f*maxI)); elCtx.stroke(); });

  // Axes
  elCtx.strokeStyle = 'rgba(255,255,255,0.2)'; elCtx.lineWidth = 1.5;
  elCtx.beginPath(); elCtx.moveTo(PAD.left, PAD.top); elCtx.lineTo(PAD.left, H-PAD.bottom); elCtx.lineTo(W-PAD.right, H-PAD.bottom); elCtx.stroke();

  // Axis labels
  elCtx.fillStyle = 'rgba(255,255,255,0.4)'; elCtx.font = '11px Segoe UI'; elCtx.textAlign = 'center';
  elCtx.fillText('Number of Clusters K', W/2, H-6);
  elCtx.save(); elCtx.translate(14, H/2); elCtx.rotate(-Math.PI/2); elCtx.fillText('Inertia (WCSS)', 0, 0); elCtx.restore();
  for (let k = 1; k <= 8; k++) { elCtx.fillText(k, cx(k), H-PAD.bottom+14); }

  // Inertia curve
  elCtx.beginPath(); elCtx.strokeStyle = '#58a6ff'; elCtx.lineWidth = 2.5;
  elbowData.forEach((d, i) => { i === 0 ? elCtx.moveTo(cx(d.k), cy(d.inertia)) : elCtx.lineTo(cx(d.k), cy(d.inertia)); });
  elCtx.stroke();

  // Points
  elbowData.forEach(d => {
    elCtx.beginPath(); elCtx.arc(cx(d.k), cy(d.inertia), 5, 0, Math.PI*2);
    elCtx.fillStyle = '#58a6ff'; elCtx.fill();
  });

  // Elbow marker (at trueK — shaded area)
  const elbowX = cx(trueK);
  elCtx.fillStyle = 'rgba(63,185,80,0.12)';
  elCtx.fillRect(elbowX-22, PAD.top, 44, H-PAD.top-PAD.bottom);
  elCtx.beginPath(); elCtx.arc(elbowX, cy(elbowData[trueK-1].inertia), 10, 0, Math.PI*2);
  elCtx.strokeStyle = '#3fb950'; elCtx.lineWidth = 2.5; elCtx.stroke();
  elCtx.fillStyle = '#3fb950'; elCtx.font = 'bold 11px Segoe UI'; elCtx.textAlign = 'center';
  elCtx.fillText(`★ Elbow at K=${trueK}`, elbowX, cy(elbowData[trueK-1].inertia)-18);
  elCtx.textAlign = 'left';
}

if (elbowCanvas) regenElbow();
