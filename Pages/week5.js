// ===== ENTROPY CURVE =====
const entropyCanvas = document.getElementById('entropyCanvas');
const eCtx = entropyCanvas?.getContext('2d');

function drawEntropyCurve(highlight) {
  if (!eCtx) return;
  const W = entropyCanvas.width, H = entropyCanvas.height;
  const PAD = { left: 52, right: 20, top: 20, bottom: 38 };
  eCtx.clearRect(0, 0, W, H);

  const cx = p => PAD.left + p * (W - PAD.left - PAD.right);
  const cy = h => H - PAD.bottom - h * (H - PAD.top - PAD.bottom);

  // Grid
  eCtx.strokeStyle = 'rgba(255,255,255,0.05)'; eCtx.lineWidth = 1;
  [0.2,0.4,0.6,0.8].forEach(p => { eCtx.beginPath(); eCtx.moveTo(cx(p), PAD.top); eCtx.lineTo(cx(p), H-PAD.bottom); eCtx.stroke(); });
  [0.25,0.5,0.75,1].forEach(h => { eCtx.beginPath(); eCtx.moveTo(PAD.left, cy(h)); eCtx.lineTo(W-PAD.right, cy(h)); eCtx.stroke(); });

  // Axes
  eCtx.strokeStyle = 'rgba(255,255,255,0.2)'; eCtx.lineWidth = 1.5;
  eCtx.beginPath(); eCtx.moveTo(PAD.left, PAD.top); eCtx.lineTo(PAD.left, H-PAD.bottom); eCtx.lineTo(W-PAD.right, H-PAD.bottom); eCtx.stroke();

  // Axis labels
  eCtx.fillStyle = 'rgba(255,255,255,0.4)'; eCtx.font = '11px Segoe UI'; eCtx.textAlign = 'center';
  eCtx.fillText('p (probability of class +)', W/2, H-6);
  eCtx.textAlign = 'right';
  eCtx.fillText('1.0', PAD.left-6, cy(1)+4);
  eCtx.fillText('0.5', PAD.left-6, cy(0.5)+4);
  [0, 0.25, 0.5, 0.75, 1].forEach(p => {
    eCtx.textAlign = 'center';
    eCtx.fillText(p.toFixed(2), cx(p), H-PAD.bottom+14);
  });

  // Y-axis label
  eCtx.save();
  eCtx.translate(14, H/2);
  eCtx.rotate(-Math.PI/2);
  eCtx.textAlign = 'center';
  eCtx.fillText('H(p) — bits', 0, 0);
  eCtx.restore();

  // Entropy curve
  eCtx.beginPath();
  eCtx.strokeStyle = '#58a6ff'; eCtx.lineWidth = 2.5;
  let first = true;
  for (let i = 1; i < 999; i++) {
    const p = i / 1000;
    const h = -(p * Math.log2(p) + (1-p) * Math.log2(1-p));
    first ? eCtx.moveTo(cx(p), cy(h)) : eCtx.lineTo(cx(p), cy(h));
    first = false;
  }
  eCtx.stroke();

  // Maximum marker
  eCtx.beginPath(); eCtx.arc(cx(0.5), cy(1), 6, 0, Math.PI*2);
  eCtx.fillStyle = '#d29922'; eCtx.fill();
  eCtx.fillStyle = '#d29922'; eCtx.font = 'bold 11px Segoe UI'; eCtx.textAlign = 'left';
  eCtx.fillText('H=1 (max)', cx(0.5)+8, cy(1)+4);

  // Zero markers
  eCtx.beginPath(); eCtx.arc(cx(0.01), cy(0.08), 5, 0, Math.PI*2);
  eCtx.fillStyle = '#3fb950'; eCtx.fill();
  eCtx.beginPath(); eCtx.arc(cx(0.99), cy(0.08), 5, 0, Math.PI*2);
  eCtx.fillStyle = '#3fb950'; eCtx.fill();
  eCtx.fillStyle = '#3fb950'; eCtx.font = '10px Segoe UI';
  eCtx.fillText('H≈0 (pure)', cx(0.99)-80, cy(0.08)-8);

  // Highlight current p if given
  if (highlight !== undefined) {
    const p = Math.max(0.001, Math.min(0.999, highlight));
    const h = -(p * Math.log2(p) + (1-p) * Math.log2(1-p));
    // Vertical dashed line
    eCtx.setLineDash([5,4]);
    eCtx.strokeStyle = '#39d353'; eCtx.lineWidth = 1.5;
    eCtx.beginPath(); eCtx.moveTo(cx(p), H-PAD.bottom); eCtx.lineTo(cx(p), cy(h)); eCtx.stroke();
    eCtx.setLineDash([]);
    // Point on curve
    eCtx.beginPath(); eCtx.arc(cx(p), cy(h), 8, 0, Math.PI*2);
    eCtx.fillStyle = '#39d353'; eCtx.fill();
    eCtx.fillStyle = '#fff'; eCtx.font = 'bold 10px Segoe UI'; eCtx.textAlign = 'center';
    eCtx.fillText(`H=${h.toFixed(3)}`, cx(p), cy(h)-14);
  }
  eCtx.textAlign = 'left';
}

if (entropyCanvas) drawEntropyCurve(0.5);

// ===== ENTROPY INTERACTIVE (dtVizCanvas) =====
const dtVizCanvas = document.getElementById('dtVizCanvas');
const dvCtx = dtVizCanvas?.getContext('2d');

function updateEntropy() {
  const p = parseFloat(document.getElementById('pposSlider').value);
  document.getElementById('pposVal').textContent = p.toFixed(2);
  const h = p <= 0 || p >= 1 ? 0 : -(p * Math.log2(p) + (1-p) * Math.log2(1-p));
  document.getElementById('entropyVal').textContent = `H = ${h.toFixed(3)} bits`;
  drawDTViz(p, h);
  drawEntropyCurve(p);
}

function drawDTViz(p, h) {
  if (!dvCtx || !dtVizCanvas) return;
  const W = dtVizCanvas.width, H = dtVizCanvas.height;
  dvCtx.clearRect(0, 0, W, H);

  const pneg = 1 - p;
  const BAR_H = 60, BAR_Y = 40, BAR_X = 60, BAR_W = W - 120;

  // Class distribution bar
  dvCtx.fillStyle = 'rgba(88,166,255,0.8)';
  dvCtx.fillRect(BAR_X, BAR_Y, p * BAR_W, BAR_H);
  dvCtx.fillStyle = 'rgba(248,81,73,0.8)';
  dvCtx.fillRect(BAR_X + p * BAR_W, BAR_Y, pneg * BAR_W, BAR_H);

  dvCtx.strokeStyle = 'rgba(255,255,255,0.2)'; dvCtx.lineWidth = 1;
  dvCtx.strokeRect(BAR_X, BAR_Y, BAR_W, BAR_H);

  dvCtx.fillStyle = '#fff'; dvCtx.font = 'bold 13px Segoe UI'; dvCtx.textAlign = 'center';
  if (p > 0.08) dvCtx.fillText(`+ ${(p*100).toFixed(0)}%`, BAR_X + p*BAR_W*0.5, BAR_Y + BAR_H/2 + 5);
  if (pneg > 0.08) dvCtx.fillText(`− ${(pneg*100).toFixed(0)}%`, BAR_X + p*BAR_W + pneg*BAR_W*0.5, BAR_Y + BAR_H/2 + 5);

  dvCtx.fillStyle = 'rgba(255,255,255,0.5)'; dvCtx.font = '11px Segoe UI';
  dvCtx.fillText('Class distribution', W/2, BAR_Y - 10);

  // Entropy gauge
  const gaugeY = 150, gaugeX = 60, gaugeW = W - 120, gaugeH = 36;
  dvCtx.fillStyle = 'rgba(255,255,255,0.05)';
  dvCtx.fillRect(gaugeX, gaugeY, gaugeW, gaugeH);
  dvCtx.strokeStyle = 'rgba(255,255,255,0.1)'; dvCtx.strokeRect(gaugeX, gaugeY, gaugeW, gaugeH);

  // Entropy fill — colour goes red → green based on entropy
  const hue = h < 0.5 ? 120 : h < 0.85 ? 50 : 0; // green → orange → red
  dvCtx.fillStyle = `hsla(${120 - h*120}, 70%, 50%, 0.7)`;
  dvCtx.fillRect(gaugeX, gaugeY, h * gaugeW, gaugeH);

  dvCtx.fillStyle = '#fff'; dvCtx.font = 'bold 13px Segoe UI';
  dvCtx.fillText(`H(S) = ${h.toFixed(3)} bits`, W/2, gaugeY + gaugeH/2 + 5);

  dvCtx.fillStyle = 'rgba(255,255,255,0.5)'; dvCtx.font = '11px Segoe UI';
  dvCtx.fillText('Entropy gauge  (0 = pure, 1 = maximally impure)', W/2, gaugeY - 10);

  // Labels
  dvCtx.fillStyle = 'rgba(255,255,255,0.3)'; dvCtx.font = '10px Segoe UI';
  dvCtx.textAlign = 'left'; dvCtx.fillText('0 bits', gaugeX, gaugeY + gaugeH + 14);
  dvCtx.textAlign = 'right'; dvCtx.fillText('1 bit', gaugeX + gaugeW, gaugeY + gaugeH + 14);
  dvCtx.textAlign = 'center';

  // Interpretation
  let msg = '';
  if (h < 0.1) msg = '✅ Nearly pure — very low uncertainty';
  else if (h < 0.5) msg = '🟡 Moderately impure';
  else if (h < 0.9) msg = '🟠 High impurity — mixed classes';
  else msg = '🔴 Maximum impurity — equal class split';

  dvCtx.fillStyle = 'rgba(255,255,255,0.6)'; dvCtx.font = '12px Segoe UI';
  dvCtx.fillText(msg, W/2, H - 12);
  dvCtx.textAlign = 'left';
}

if (dtVizCanvas) updateEntropy();

// ===== DT BOUNDARY DIAGRAM =====
const dtBoundaryCanvas = document.getElementById('dtBoundaryCanvas');
const dbCtx = dtBoundaryCanvas?.getContext('2d');

function drawDTBoundary() {
  if (!dbCtx) return;
  const W = dtBoundaryCanvas.width, H = dtBoundaryCanvas.height;
  dbCtx.clearRect(0, 0, W, H);

  // Axis labels
  dbCtx.fillStyle = 'rgba(255,255,255,0.3)'; dbCtx.font = '12px Segoe UI';
  dbCtx.textAlign = 'center'; dbCtx.fillText('Feature x₁', W/2, H-6);
  dbCtx.save(); dbCtx.translate(14, H/2); dbCtx.rotate(-Math.PI/2);
  dbCtx.fillText('Feature x₂', 0, 0); dbCtx.restore(); dbCtx.textAlign = 'left';

  const PAD = 30;

  // Axis-parallel splits — coloured regions
  const regions = [
    { x:PAD, y:PAD,        w:200, h:130, cls:'+', color:'rgba(88,166,255,0.12)', border:'rgba(88,166,255,0.4)' },
    { x:PAD, y:PAD+130,    w:200, h:H-PAD*2-130, cls:'−', color:'rgba(248,81,73,0.10)', border:'rgba(248,81,73,0.4)' },
    { x:PAD+200, y:PAD,    w:150, h:H-PAD*2, cls:'+', color:'rgba(88,166,255,0.07)', border:'rgba(88,166,255,0.3)' },
    { x:PAD+350, y:PAD,    w:W-PAD-350, h:100, cls:'−', color:'rgba(248,81,73,0.08)', border:'rgba(248,81,73,0.3)' },
    { x:PAD+350, y:PAD+100,w:W-PAD-350, h:H-PAD*2-100, cls:'+', color:'rgba(88,166,255,0.10)', border:'rgba(88,166,255,0.3)' },
  ];

  regions.forEach(r => {
    dbCtx.fillStyle = r.color; dbCtx.fillRect(r.x, r.y, r.w, r.h);
    dbCtx.strokeStyle = r.border; dbCtx.lineWidth = 1.5;
    dbCtx.strokeRect(r.x, r.y, r.w, r.h);
    dbCtx.fillStyle = r.cls === '+' ? 'rgba(88,166,255,0.6)' : 'rgba(248,81,73,0.6)';
    dbCtx.font = 'bold 14px Segoe UI'; dbCtx.textAlign = 'center';
    dbCtx.fillText(r.cls, r.x + r.w/2, r.y + r.h/2 + 5);
  });

  // Split lines
  dbCtx.strokeStyle = '#d29922'; dbCtx.lineWidth = 2; dbCtx.setLineDash([]);
  // Vertical split at x=PAD+200
  dbCtx.beginPath(); dbCtx.moveTo(PAD+200, PAD); dbCtx.lineTo(PAD+200, H-PAD); dbCtx.stroke();
  // Horizontal split at y=PAD+130 (left of vertical)
  dbCtx.beginPath(); dbCtx.moveTo(PAD, PAD+130); dbCtx.lineTo(PAD+200, PAD+130); dbCtx.stroke();
  // Vertical split at x=PAD+350 (right)
  dbCtx.beginPath(); dbCtx.moveTo(PAD+350, PAD); dbCtx.lineTo(PAD+350, H-PAD); dbCtx.stroke();
  // Horizontal split at y=PAD+100 (far right)
  dbCtx.beginPath(); dbCtx.moveTo(PAD+350, PAD+100); dbCtx.lineTo(W-PAD, PAD+100); dbCtx.stroke();

  // Split condition labels
  dbCtx.fillStyle = '#d29922'; dbCtx.font = 'bold 10px Segoe UI'; dbCtx.textAlign = 'center';
  dbCtx.fillText('x₁ ≤ 3.2', PAD+200, PAD-8);
  dbCtx.fillText('x₂ ≤ 2.1', 20, PAD+130);
  dbCtx.fillText('x₁ ≤ 5.0', PAD+350, PAD-8);
  dbCtx.fillText('x₂ ≤ 1.5', W-36, PAD+100);

  // Axis lines
  dbCtx.strokeStyle = 'rgba(255,255,255,0.15)'; dbCtx.lineWidth = 1;
  dbCtx.beginPath(); dbCtx.moveTo(PAD, PAD); dbCtx.lineTo(PAD, H-PAD); dbCtx.lineTo(W-PAD, H-PAD); dbCtx.stroke();

  dbCtx.textAlign = 'left';
}

if (dtBoundaryCanvas) drawDTBoundary();
