// Week 13 — Data Drift Visualizer: two Gaussian distributions
(function() {
  const canvas = document.getElementById('driftCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('driftSlider');
  const driftValEl = document.getElementById('driftVal');

  const PAD = { l: 60, r: 30, t: 30, b: 50 };
  const W = canvas.width - PAD.l - PAD.r;
  const H = canvas.height - PAD.t - PAD.b;
  const xMin = -5, xMax = 15;

  function gaussian(x, mu, sigma2) {
    const sigma = Math.sqrt(sigma2);
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-((x - mu) ** 2) / (2 * sigma2));
  }

  function toCanvasX(x) { return PAD.l + (x - xMin) / (xMax - xMin) * W; }
  function toCanvasY(y) { return PAD.t + H - y / 0.25 * H; }

  function getDrift() {
    return parseInt(slider.value) / 100 * 5; // 0 to 5
  }

  function drawCurve(mu, sigma2, color, label) {
    const steps = 300;
    const dx = (xMax - xMin) / steps;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      const y = gaussian(x, mu, sigma2);
      const cx = toCanvasX(x), cy = toCanvasY(y);
      i === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Fill under curve
    ctx.beginPath();
    ctx.moveTo(toCanvasX(xMin), toCanvasY(0));
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      ctx.lineTo(toCanvasX(x), toCanvasY(gaussian(x, mu, sigma2)));
    }
    ctx.lineTo(toCanvasX(xMax), toCanvasY(0));
    ctx.closePath();
    ctx.fillStyle = color.replace(')', ',0.15)').replace('rgb', 'rgba');
    ctx.fill();

    // Peak label
    const peakY = gaussian(mu, mu, sigma2);
    ctx.fillStyle = color;
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label + ' (μ=' + mu.toFixed(1) + ')', toCanvasX(mu), toCanvasY(peakY) - 10);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drift = getDrift();
    if (driftValEl) driftValEl.textContent = drift.toFixed(1);

    const muTrain = 4, muProd = 4 + drift;
    const sigma2 = 2;

    // Axes
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.l, PAD.t);
    ctx.lineTo(PAD.l, PAD.t + H);
    ctx.lineTo(PAD.l + W, PAD.t + H);
    ctx.stroke();

    // Grid
    ctx.strokeStyle = '#161b22';
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x++) {
      const cx = toCanvasX(x);
      ctx.beginPath();
      ctx.moveTo(cx, PAD.t);
      ctx.lineTo(cx, PAD.t + H);
      ctx.stroke();
      ctx.fillStyle = '#8b949e';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(x, cx, PAD.t + H + 16);
    }

    drawCurve(muTrain, sigma2, '#58a6ff', 'Training');
    drawCurve(muProd, sigma2, '#f85149', 'Production');

    // KS statistic approximation at mu midpoint
    const xKS = (muTrain + muProd) / 2;
    ctx.strokeStyle = '#d29922';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5,3]);
    const cx = toCanvasX(xKS);
    ctx.beginPath();
    ctx.moveTo(cx, PAD.t);
    ctx.lineTo(cx, PAD.t + H);
    ctx.stroke();
    ctx.setLineDash([]);

    if (drift > 0.3) {
      ctx.fillStyle = '#d29922';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('← Drift = ' + drift.toFixed(1) + ' units →', cx + 4, PAD.t + 20);
    }

    // Status
    let status = '';
    if (drift < 1) status = 'No significant drift detected.';
    else if (drift < 2.5) status = 'Mild drift detected — monitor closely.';
    else status = 'Significant drift! Consider retraining.';

    ctx.fillStyle = drift < 1 ? '#3fb950' : drift < 2.5 ? '#d29922' : '#f85149';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(status, canvas.width / 2, PAD.t + H + 40);
  }

  slider.addEventListener('input', draw);
  document.getElementById('resetDrift').addEventListener('click', () => {
    slider.value = 0; draw();
  });

  draw();
})();
