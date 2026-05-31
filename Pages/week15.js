// ===== FAIRNESS VISUALIZER =====
const fairnessCanvas = document.getElementById('fairnessCanvas');
const fCtx = fairnessCanvas?.getContext('2d');

function updateFairness() {
  const rateA = parseInt(document.getElementById('groupASlider').value);
  const rateB = parseInt(document.getElementById('groupBSlider').value);
  document.getElementById('groupAVal').textContent = rateA + '%';
  document.getElementById('groupBVal').textContent = rateB + '%';
  drawFairness(rateA, rateB);
}

function drawFairness(rateA, rateB) {
  if (!fCtx || !fairnessCanvas) return;
  const W = fairnessCanvas.width, H = fairnessCanvas.height;
  fCtx.clearRect(0, 0, W, H);

  const PAD = 50, barW = 90, gap = 80;
  const maxH = H - PAD - 60;
  const baseY = H - 40;

  // Title
  fCtx.fillStyle = 'rgba(255,255,255,0.5)'; fCtx.font = '12px Segoe UI'; fCtx.textAlign = 'center';
  fCtx.fillText('Positive Prediction Rate by Group', W / 2, 20);

  const groups = [
    { label: 'Group A', rate: rateA, x: 120, col: '#58a6ff' },
    { label: 'Group B', rate: rateB, x: 320, col: '#f85149' }
  ];

  // Parity line (target line if they were equal)
  const avgRate = (rateA + rateB) / 2;
  const avgY = baseY - (avgRate / 100) * maxH;
  fCtx.setLineDash([6, 4]);
  fCtx.strokeStyle = 'rgba(255,255,255,0.15)'; fCtx.lineWidth = 1;
  fCtx.beginPath(); fCtx.moveTo(PAD, avgY); fCtx.lineTo(W - PAD, avgY); fCtx.stroke();
  fCtx.setLineDash([]);

  groups.forEach(g => {
    const bH = (g.rate / 100) * maxH;
    const bY = baseY - bH;

    // Bar shadow
    fCtx.fillStyle = 'rgba(0,0,0,0.3)';
    fCtx.fillRect(g.x - barW / 2 + 3, bY + 3, barW, bH);

    // Bar
    const grad = fCtx.createLinearGradient(g.x, bY, g.x, baseY);
    grad.addColorStop(0, g.col);
    grad.addColorStop(1, g.col + '44');
    fCtx.fillStyle = grad;
    fCtx.fillRect(g.x - barW / 2, bY, barW, bH);

    // Bar border
    fCtx.strokeStyle = g.col; fCtx.lineWidth = 1.5;
    fCtx.strokeRect(g.x - barW / 2, bY, barW, bH);

    // Rate label inside bar
    fCtx.fillStyle = '#fff'; fCtx.font = 'bold 18px Segoe UI'; fCtx.textAlign = 'center';
    if (bH > 30) fCtx.fillText(g.rate + '%', g.x, bY + bH / 2 + 7);

    // Group label
    fCtx.fillStyle = g.col; fCtx.font = 'bold 13px Segoe UI';
    fCtx.fillText(g.label, g.x, baseY + 16);
  });

  // Gap annotation
  const gapSize = Math.abs(rateA - rateB);
  const xMid = (groups[0].x + groups[1].x) / 2;
  const yA = baseY - (rateA / 100) * maxH;
  const yB = baseY - (rateB / 100) * maxH;
  const yTop = Math.min(yA, yB), yBot = Math.max(yA, yB);

  if (gapSize > 3) {
    // Gap line
    fCtx.beginPath();
    fCtx.moveTo(xMid, yTop); fCtx.lineTo(xMid, yBot);
    fCtx.strokeStyle = '#d29922'; fCtx.lineWidth = 2;
    fCtx.setLineDash([4, 3]); fCtx.stroke(); fCtx.setLineDash([]);
    fCtx.fillStyle = '#d29922'; fCtx.font = 'bold 12px Segoe UI';
    fCtx.fillText(`Gap: ${gapSize}pp`, xMid + 10, (yTop + yBot) / 2 + 5);
  }

  // Parity status
  const parityMet = gapSize <= 5;
  const statusCol = parityMet ? '#3fb950' : gapSize <= 20 ? '#d29922' : '#f85149';
  const statusMsg = parityMet
    ? '✅ Demographic Parity SATISFIED (gap ≤ 5pp)'
    : gapSize <= 20
      ? `⚠️ Mild Disparity — gap = ${gapSize}pp`
      : `❌ Demographic Parity VIOLATED — gap = ${gapSize}pp`;

  fCtx.fillStyle = statusCol; fCtx.font = 'bold 12px Segoe UI'; fCtx.textAlign = 'center';
  fCtx.fillText(statusMsg, W / 2, H - 8);

  // Y axis
  fCtx.strokeStyle = 'rgba(255,255,255,0.15)'; fCtx.lineWidth = 1;
  fCtx.beginPath(); fCtx.moveTo(PAD, PAD); fCtx.lineTo(PAD, baseY); fCtx.stroke();
  [0, 25, 50, 75, 100].forEach(v => {
    const y = baseY - (v / 100) * maxH;
    fCtx.fillStyle = 'rgba(255,255,255,0.3)'; fCtx.font = '10px Segoe UI'; fCtx.textAlign = 'right';
    fCtx.fillText(v + '%', PAD - 6, y + 4);
    fCtx.beginPath(); fCtx.setLineDash([3, 3]);
    fCtx.moveTo(PAD, y); fCtx.lineTo(W - PAD, y);
    fCtx.strokeStyle = 'rgba(255,255,255,0.05)'; fCtx.stroke(); fCtx.setLineDash([]);
  });

  // Update info div
  const info = document.getElementById('fairnessInfo');
  if (info) info.textContent = `P(Ŷ=1|A=Majority) = ${rateA}% | P(Ŷ=1|A=Minority) = ${rateB}% | Disparity = ${gapSize}pp`;
  fCtx.textAlign = 'left';
}

if (fairnessCanvas) updateFairness();
