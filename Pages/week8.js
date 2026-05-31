// Week 8 — Gaussian Anomaly Detection Visualizer
(function() {
  const canvas = document.getElementById('gaussianCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('epsilonSlider');
  const epsilonValEl = document.getElementById('epsilonVal');

  const mu = 5, sigma2 = 2, sigma = Math.sqrt(sigma2);
  const xMin = -2, xMax = 12;
  const PAD = { l: 60, r: 30, t: 30, b: 50 };
  const W = canvas.width - PAD.l - PAD.r;
  const H = canvas.height - PAD.t - PAD.b;

  function gaussian(x) {
    return (1 / Math.sqrt(2 * Math.PI * sigma2)) * Math.exp(-((x - mu) ** 2) / (2 * sigma2));
  }

  function toCanvasX(x) { return PAD.l + (x - xMin) / (xMax - xMin) * W; }
  function toCanvasY(y) { return PAD.t + H - y / 0.32 * H; }

  function getEpsilon() {
    const raw = parseInt(slider.value);
    return raw / 1000;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const eps = getEpsilon();
    if (epsilonValEl) epsilonValEl.textContent = eps.toFixed(3);

    // Find x values where gaussian(x) = epsilon
    // gaussian(x) = eps => solve for x
    // x = mu ± sigma * sqrt(-2 * ln(eps * sigma * sqrt(2pi)))
    const inner = -2 * Math.log(eps * sigma * Math.sqrt(2 * Math.PI));
    let xLow = xMin, xHigh = xMax;
    if (inner > 0) {
      xLow = mu - sigma * Math.sqrt(inner);
      xHigh = mu + sigma * Math.sqrt(inner);
    }

    const steps = 300;
    const dx = (xMax - xMin) / steps;

    // Draw anomaly regions (red fill)
    ctx.beginPath();
    ctx.moveTo(toCanvasX(xMin), toCanvasY(0));
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      if (x <= xLow || x >= xHigh) {
        ctx.lineTo(toCanvasX(x), toCanvasY(gaussian(x)));
      }
    }
    ctx.lineTo(toCanvasX(xMax), toCanvasY(0));
    ctx.closePath();
    ctx.fillStyle = 'rgba(248,81,73,0.3)';
    ctx.fill();

    // Draw normal region (blue fill)
    ctx.beginPath();
    const startX = Math.max(xMin, xLow);
    const endX = Math.min(xMax, xHigh);
    ctx.moveTo(toCanvasX(startX), toCanvasY(0));
    for (let i = 0; i <= steps; i++) {
      const x = xMin + i * dx;
      if (x >= xLow && x <= xHigh) {
        ctx.lineTo(toCanvasX(x), toCanvasY(gaussian(x)));
      }
    }
    ctx.lineTo(toCanvasX(endX), toCanvasY(0));
    ctx.closePath();
    ctx.fillStyle = 'rgba(88,166,255,0.25)';
    ctx.fill();

    // Draw Gaussian curve
    ctx.beginPath();
    ctx.moveTo(toCanvasX(xMin), toCanvasY(gaussian(xMin)));
    for (let i = 1; i <= steps; i++) {
      const x = xMin + i * dx;
      ctx.lineTo(toCanvasX(x), toCanvasY(gaussian(x)));
    }
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Draw epsilon threshold line
    const epsY = toCanvasY(eps);
    if (epsY >= PAD.t && epsY <= PAD.t + H) {
      ctx.strokeStyle = '#f85149';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(PAD.l, epsY);
      ctx.lineTo(PAD.l + W, epsY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f85149';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ε = ' + eps.toFixed(3), PAD.l + 4, epsY - 6);
    }

    // Draw threshold vertical lines
    if (inner > 0) {
      [xLow, xHigh].forEach(x => {
        if (x > xMin && x < xMax) {
          ctx.strokeStyle = '#d29922';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.moveTo(toCanvasX(x), toCanvasY(0));
          ctx.lineTo(toCanvasX(x), toCanvasY(gaussian(x)));
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // Axes
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD.l, PAD.t);
    ctx.lineTo(PAD.l, PAD.t + H);
    ctx.lineTo(PAD.l + W, PAD.t + H);
    ctx.stroke();

    // X axis labels
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += 2) {
      ctx.fillText(x, toCanvasX(x), PAD.t + H + 18);
    }
    ctx.fillText('x', PAD.l + W + 10, PAD.t + H + 4);

    // Labels
    ctx.fillStyle = '#58a6ff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Normal', toCanvasX(mu), toCanvasY(gaussian(mu)) - 10);

    ctx.fillStyle = '#f85149';
    if (inner > 0 && xLow > xMin + 0.5) {
      ctx.fillText('Anomaly', toCanvasX(xMin + 0.8), toCanvasY(0) - 12);
    }

    // μ label
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(toCanvasX(mu), PAD.t);
    ctx.lineTo(toCanvasX(mu), PAD.t + H);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#3fb950';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('μ=' + mu, toCanvasX(mu), PAD.t + H + 35);
  }

  slider.addEventListener('input', draw);
  document.getElementById('resetGaussBtn').addEventListener('click', () => {
    slider.value = 10; draw();
  });

  draw();
})();
