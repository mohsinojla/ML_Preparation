// ===== KS TEST CDF VISUALIZER =====
// Lecture example: Reference {1,2,3,4} vs Production {3,4,5,6}
const ksCanvas = document.getElementById('ksCanvas');
const ksCtx = ksCanvas?.getContext('2d');

function drawKSTest() {
  if (!ksCtx || !ksCanvas) return;
  const W = ksCanvas.width, H = ksCanvas.height;
  const PAD = { left: 60, right: 30, top: 30, bottom: 50 };
  ksCtx.clearRect(0, 0, W, H);

  const xMin = 0, xMax = 7;
  const cx = v => PAD.left + (v - xMin) / (xMax - xMin) * (W - PAD.left - PAD.right);
  const cy = v => H - PAD.bottom - v * (H - PAD.top - PAD.bottom);

  // Grid
  ksCtx.strokeStyle = 'rgba(255,255,255,0.05)'; ksCtx.lineWidth = 1;
  [1,2,3,4,5,6].forEach(x => { ksCtx.beginPath(); ksCtx.moveTo(cx(x), PAD.top); ksCtx.lineTo(cx(x), H - PAD.bottom); ksCtx.stroke(); });
  [0.25, 0.5, 0.75, 1.0].forEach(y => { ksCtx.beginPath(); ksCtx.moveTo(PAD.left, cy(y)); ksCtx.lineTo(W - PAD.right, cy(y)); ksCtx.stroke(); });

  // Axes
  ksCtx.strokeStyle = 'rgba(255,255,255,0.2)'; ksCtx.lineWidth = 1.5;
  ksCtx.beginPath(); ksCtx.moveTo(PAD.left, PAD.top); ksCtx.lineTo(PAD.left, H - PAD.bottom); ksCtx.lineTo(W - PAD.right, H - PAD.bottom); ksCtx.stroke();

  // Axis labels
  ksCtx.fillStyle = 'rgba(255,255,255,0.4)'; ksCtx.font = '11px Segoe UI'; ksCtx.textAlign = 'center';
  ksCtx.fillText('Feature Value  x', W / 2, H - 8);
  ksCtx.textAlign = 'right';
  ['0', '0.25', '0.50', '0.75', '1.00'].forEach((l, i) => ksCtx.fillText(l, PAD.left - 6, cy(i * 0.25) + 4));
  ksCtx.textAlign = 'center';
  [1,2,3,4,5,6].forEach(x => ksCtx.fillText(x, cx(x), H - PAD.bottom + 16));

  // Y-axis rotated label
  ksCtx.save(); ksCtx.translate(14, H / 2); ksCtx.rotate(-Math.PI / 2);
  ksCtx.fillText('CDF  F(x)', 0, 0); ksCtx.restore();

  // === TRAINING CDF: {1, 2, 3, 4} ===
  // F(x) = 0 for x<1, 0.25 at x=1, 0.5 at x=2, 0.75 at x=3, 1.0 at x=4
  const trainSteps = [
    { x: xMin, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 0.25 }, { x: 2, y: 0.25 }, { x: 2, y: 0.5 },
    { x: 3, y: 0.5 }, { x: 3, y: 0.75 }, { x: 4, y: 0.75 }, { x: 4, y: 1.0 }, { x: xMax, y: 1.0 }
  ];

  ksCtx.beginPath();
  ksCtx.strokeStyle = '#58a6ff'; ksCtx.lineWidth = 2.5;
  trainSteps.forEach((p, i) => i === 0 ? ksCtx.moveTo(cx(p.x), cy(p.y)) : ksCtx.lineTo(cx(p.x), cy(p.y)));
  ksCtx.stroke();

  // === PRODUCTION CDF: {3, 4, 5, 6} ===
  // F(x) = 0 for x<3, 0.25 at x=3, 0.5 at x=4, 0.75 at x=5, 1.0 at x=6
  const prodSteps = [
    { x: xMin, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 0.25 }, { x: 4, y: 0.25 }, { x: 4, y: 0.5 },
    { x: 5, y: 0.5 }, { x: 5, y: 0.75 }, { x: 6, y: 0.75 }, { x: 6, y: 1.0 }, { x: xMax, y: 1.0 }
  ];

  ksCtx.beginPath();
  ksCtx.strokeStyle = '#f85149'; ksCtx.lineWidth = 2.5;
  prodSteps.forEach((p, i) => i === 0 ? ksCtx.moveTo(cx(p.x), cy(p.y)) : ksCtx.lineTo(cx(p.x), cy(p.y)));
  ksCtx.stroke();

  // === MAX GAP (KS statistic D) ===
  // At x=4: F_train(4) = 1.0, F_prod(4) = 0.5 → gap = 0.5
  // But also at x=3: F_train(3) = 0.75, F_prod(3) = 0.25 → gap = 0.5
  // Max D = 0.5 at x=3 (just after the step)
  const gapX = 3;
  const gapYtrain = 0.75;
  const gapYprod = 0.25;

  // Shaded gap region
  ksCtx.fillStyle = 'rgba(57,211,83,0.12)';
  ksCtx.fillRect(cx(gapX), cy(gapYtrain), 4, cy(gapYprod) - cy(gapYtrain));

  // Gap line
  ksCtx.beginPath();
  ksCtx.moveTo(cx(gapX) + 20, cy(gapYtrain));
  ksCtx.lineTo(cx(gapX) + 20, cy(gapYprod));
  ksCtx.strokeStyle = '#39d353'; ksCtx.lineWidth = 3;
  ksCtx.stroke();

  // Arrow heads
  [[cy(gapYtrain), 1], [cy(gapYprod), -1]].forEach(([y, dir]) => {
    ksCtx.beginPath();
    ksCtx.moveTo(cx(gapX) + 20, y);
    ksCtx.lineTo(cx(gapX) + 15, y + dir * 8);
    ksCtx.lineTo(cx(gapX) + 25, y + dir * 8);
    ksCtx.closePath();
    ksCtx.fillStyle = '#39d353'; ksCtx.fill();
  });

  // D label
  ksCtx.fillStyle = '#39d353'; ksCtx.font = 'bold 13px Segoe UI'; ksCtx.textAlign = 'left';
  ksCtx.fillText('D = 0.5', cx(gapX) + 28, cy((gapYtrain + gapYprod) / 2) + 5);
  ksCtx.fillStyle = 'rgba(57,211,83,0.7)'; ksCtx.font = '11px Segoe UI';
  ksCtx.fillText('← max gap', cx(gapX) + 28, cy((gapYtrain + gapYprod) / 2) + 20);

  // Legend
  ksCtx.font = 'bold 11px Segoe UI';
  ksCtx.fillStyle = '#58a6ff';
  ksCtx.fillRect(PAD.left + 10, PAD.top + 5, 20, 3);
  ksCtx.fillText('F_train  {1,2,3,4}', PAD.left + 36, PAD.top + 10);
  ksCtx.fillStyle = '#f85149';
  ksCtx.fillRect(PAD.left + 10, PAD.top + 22, 20, 3);
  ksCtx.fillText('F_prod   {3,4,5,6}', PAD.left + 36, PAD.top + 27);
  ksCtx.textAlign = 'left';

  // Conclusion box
  ksCtx.fillStyle = 'rgba(248,81,73,0.12)';
  ksCtx.fillRect(W - PAD.right - 200, PAD.top + 5, 190, 50);
  ksCtx.strokeStyle = 'rgba(248,81,73,0.4)'; ksCtx.lineWidth = 1;
  ksCtx.strokeRect(W - PAD.right - 200, PAD.top + 5, 190, 50);
  ksCtx.fillStyle = '#f85149'; ksCtx.font = 'bold 11px Segoe UI'; ksCtx.textAlign = 'center';
  ksCtx.fillText('D = 0.5 ≥ 0.2', W - PAD.right - 105, PAD.top + 22);
  ksCtx.fillStyle = 'rgba(255,255,255,0.6)'; ksCtx.font = '10px Segoe UI';
  ksCtx.fillText('→ SIGNIFICANT DRIFT DETECTED', W - PAD.right - 105, PAD.top + 40);
  ksCtx.textAlign = 'left';
}

if (ksCanvas) drawKSTest();

// ===== MONITORING DASHBOARD DEMO =====
const dashCanvas = document.getElementById('dashCanvas');
const dCtx = dashCanvas?.getContext('2d');

function drawMonitoringDash() {
  if (!dCtx || !dashCanvas) return;
  const W = dashCanvas.width, H = dashCanvas.height;
  dCtx.clearRect(0, 0, W, H);

  // Title
  dCtx.fillStyle = 'rgba(255,255,255,0.7)'; dCtx.font = 'bold 13px Segoe UI'; dCtx.textAlign = 'center';
  dCtx.fillText('ML Monitoring Dashboard — Fraud Detection Model', W / 2, 22);

  const cards = [
    { label: 'KS Statistic', value: '0.08', sub: 'top feature', status: 'normal', x: 30, y: 42, w: 115, h: 64 },
    { label: 'Predictions', value: '1.2M', sub: '24h volume', status: 'normal', x: 165, y: 42, w: 115, h: 64 },
    { label: 'Avg Latency', value: '42ms', sub: 'p95', status: 'normal', x: 300, y: 42, w: 115, h: 64 },
    { label: 'Missing Data', value: '2.3%', sub: 'rate', status: 'warning', x: 435, y: 42, w: 115, h: 64 },
  ];

  const statusColor = { normal: '#3fb950', warning: '#d29922', critical: '#f85149' };
  const statusLabel = { normal: '● Normal', warning: '⚠ Warning', critical: '🔴 Critical' };

  cards.forEach(c => {
    dCtx.fillStyle = 'rgba(22,27,34,0.9)';
    dCtx.strokeStyle = statusColor[c.status];
    dCtx.lineWidth = 1.5;
    roundRect(dCtx, c.x, c.y, c.w, c.h, 8);
    dCtx.fill(); dCtx.stroke();

    dCtx.fillStyle = 'rgba(255,255,255,0.5)'; dCtx.font = '10px Segoe UI'; dCtx.textAlign = 'center';
    dCtx.fillText(c.label, c.x + c.w / 2, c.y + 16);
    dCtx.fillStyle = '#e6edf3'; dCtx.font = 'bold 20px Segoe UI';
    dCtx.fillText(c.value, c.x + c.w / 2, c.y + 40);
    dCtx.fillStyle = statusColor[c.status]; dCtx.font = '10px Segoe UI';
    dCtx.fillText(statusLabel[c.status], c.x + c.w / 2, c.y + 56);
  });

  // Feature drift chart (mini bar chart)
  const chartY = 125, chartH = 80, chartW = 230;
  dCtx.fillStyle = 'rgba(22,27,34,0.9)'; dCtx.strokeStyle = 'rgba(255,255,255,0.1)'; dCtx.lineWidth = 1;
  roundRect(dCtx, 30, chartY, chartW, chartH + 24, 8); dCtx.fill(); dCtx.stroke();

  dCtx.fillStyle = 'rgba(255,255,255,0.5)'; dCtx.font = 'bold 10px Segoe UI'; dCtx.textAlign = 'left';
  dCtx.fillText('Feature KS Statistics', 42, chartY + 14);

  const features = [
    { name: 'age', ks: 0.08, col: '#3fb950' },
    { name: 'income', ks: 0.17, col: '#d29922' },
    { name: 'balance', ks: 0.31, col: '#f85149' },
    { name: 'txn_cnt', ks: 0.05, col: '#3fb950' },
  ];
  features.forEach((f, i) => {
    const bx = 42, by = chartY + 22 + i * 18, bh = 12;
    const bw = (chartW - 80) * f.ks / 0.35;
    dCtx.fillStyle = 'rgba(255,255,255,0.08)'; dCtx.fillRect(bx + 50, by, chartW - 80, bh);
    dCtx.fillStyle = f.col; dCtx.fillRect(bx + 50, by, bw, bh);
    dCtx.fillStyle = 'rgba(255,255,255,0.5)'; dCtx.font = '10px Segoe UI';
    dCtx.fillText(f.name, bx, by + 10);
    dCtx.fillStyle = f.col;
    dCtx.fillText(f.ks.toFixed(2), bx + 52 + bw + 2, by + 10);
  });

  // KS threshold line
  const threshX = 42 + 50 + (chartW - 80) * 0.2 / 0.35;
  dCtx.beginPath(); dCtx.setLineDash([3, 3]);
  dCtx.moveTo(threshX, chartY + 22); dCtx.lineTo(threshX, chartY + chartH + 4);
  dCtx.strokeStyle = 'rgba(255,255,255,0.2)'; dCtx.lineWidth = 1; dCtx.stroke(); dCtx.setLineDash([]);
  dCtx.fillStyle = 'rgba(255,255,255,0.3)'; dCtx.font = '9px Segoe UI';
  dCtx.fillText('0.2', threshX - 8, chartY + chartH + 16);

  // Alert feed
  const alertY = 125, alertX = 280;
  dCtx.fillStyle = 'rgba(22,27,34,0.9)'; dCtx.strokeStyle = 'rgba(255,255,255,0.1)'; dCtx.lineWidth = 1;
  roundRect(dCtx, alertX, alertY, 270, 104, 8); dCtx.fill(); dCtx.stroke();

  dCtx.fillStyle = 'rgba(255,255,255,0.5)'; dCtx.font = 'bold 10px Segoe UI'; dCtx.textAlign = 'left';
  dCtx.fillText('🔔 Alert History', alertX + 12, alertY + 14);

  const alerts = [
    { p: 'P1', msg: 'balance KS=0.31 > 0.3 — drift!', col: '#f85149', t: '09:42' },
    { p: 'P2', msg: 'income KS=0.17 — mild drift', col: '#d29922', t: '08:15' },
    { p: 'P3', msg: 'missing_data 2.3% > 2%', col: '#58a6ff', t: 'Yesterday' },
  ];
  alerts.forEach((a, i) => {
    const ay = alertY + 26 + i * 24;
    dCtx.fillStyle = a.col; dCtx.font = 'bold 9px Segoe UI';
    dCtx.fillText(`[${a.p}]`, alertX + 12, ay + 10);
    dCtx.fillStyle = 'rgba(255,255,255,0.6)'; dCtx.font = '9px Segoe UI';
    dCtx.fillText(a.msg, alertX + 36, ay + 10);
    dCtx.fillStyle = 'rgba(255,255,255,0.3)';
    dCtx.fillText(a.t, alertX + 248, ay + 10);
  });

  dCtx.textAlign = 'left';
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

if (dashCanvas) drawMonitoringDash();
