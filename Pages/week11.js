// Week 11 — Cyclical Feature Encoding Visualizer (Clock face)
(function() {
  const canvas = document.getElementById('cyclicalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const slider = document.getElementById('hourSlider');
  const hourValEl = document.getElementById('hourVal');
  const infoEl = document.getElementById('cyclicalInfo');

  let animTimer = null;
  let animHour = 0;

  // Two panels: left = clock face, right = sin/cos plot
  const LEFT_CX = 180, LEFT_CY = 180, R = 130;
  const PLOT_X = 370, PLOT_Y = 20, PLOT_W = 310, PLOT_H = 300;

  function hourToAngle(h) {
    // hour 0 -> top -> 90 deg offset, going clockwise
    // sin(2pi*h/24), cos(2pi*h/24) in math coords
    return (h / 24) * 2 * Math.PI - Math.PI / 2;
  }

  function sinEnc(h) { return Math.sin(2 * Math.PI * h / 24); }
  function cosEnc(h) { return Math.cos(2 * Math.PI * h / 24); }

  function draw(h) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ---- LEFT: Clock face / unit circle ----
    // All hour dots
    ctx.fillStyle = '#21262d';
    ctx.beginPath();
    ctx.arc(LEFT_CX, LEFT_CY, R, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Hour markers
    for (let i = 0; i < 24; i++) {
      const ang = hourToAngle(i);
      const px = LEFT_CX + R * Math.cos(ang);
      const py = LEFT_CY + R * Math.sin(ang);
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, 2 * Math.PI);
      ctx.fillStyle = '#30363d';
      ctx.fill();
    }

    // Show hour 0 and 23 in red to show closeness
    [0, 23].forEach(hi => {
      const ang = hourToAngle(hi);
      const px = LEFT_CX + R * Math.cos(ang);
      const py = LEFT_CY + R * Math.sin(ang);
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(248,81,73,0.7)';
      ctx.fill();
      ctx.fillStyle = '#f85149';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('h=' + hi, px, py - 10);
    });

    // Line connecting h=0 and h=23
    const a0 = hourToAngle(0), a23 = hourToAngle(23);
    ctx.strokeStyle = 'rgba(248,81,73,0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,3]);
    ctx.beginPath();
    ctx.moveTo(LEFT_CX + R * Math.cos(a0), LEFT_CY + R * Math.sin(a0));
    ctx.lineTo(LEFT_CX + R * Math.cos(a23), LEFT_CY + R * Math.sin(a23));
    ctx.stroke();
    ctx.setLineDash([]);

    // Selected hour
    const ang = hourToAngle(h);
    const px = LEFT_CX + R * Math.cos(ang);
    const py = LEFT_CY + R * Math.sin(ang);

    // Spoke
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(LEFT_CX, LEFT_CY);
    ctx.lineTo(px, py);
    ctx.stroke();

    // Dot
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#58a6ff';
    ctx.fill();

    // Label
    ctx.fillStyle = '#58a6ff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('h=' + h, px, py + (py > LEFT_CY ? 22 : -14));

    // Center
    ctx.beginPath();
    ctx.arc(LEFT_CX, LEFT_CY, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#8b949e';
    ctx.fill();

    // Clock title
    ctx.fillStyle = '#c9d1d9';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Unit Circle (Hour Encoding)', LEFT_CX, 330);
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px sans-serif';
    ctx.fillText('h=23 and h=0 are adjacent on circle', LEFT_CX, 348);

    // ---- RIGHT: sin and cos over all 24 hours ----
    // Axes
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PLOT_X, PLOT_Y);
    ctx.lineTo(PLOT_X, PLOT_Y + PLOT_H);
    ctx.lineTo(PLOT_X + PLOT_W, PLOT_Y + PLOT_H);
    ctx.stroke();

    // Zero line
    const midY = PLOT_Y + PLOT_H / 2;
    ctx.strokeStyle = '#21262d';
    ctx.beginPath();
    ctx.moveTo(PLOT_X, midY);
    ctx.lineTo(PLOT_X + PLOT_W, midY);
    ctx.stroke();

    function toPlotX(hour) { return PLOT_X + (hour / 23) * PLOT_W; }
    function toPlotY(val)  { return midY - val * (PLOT_H / 2 - 10); }

    // Sin curve
    ctx.beginPath();
    for (let i = 0; i <= 23; i++) {
      const x = toPlotX(i), y = toPlotY(sinEnc(i));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#3fb950';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cos curve
    ctx.beginPath();
    for (let i = 0; i <= 23; i++) {
      const x = toPlotX(i), y = toPlotY(cosEnc(i));
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#bc8cff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Selected hour marker
    const sx = toPlotX(h);
    ctx.strokeStyle = '#58a6ff';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4,3]);
    ctx.beginPath();
    ctx.moveTo(sx, PLOT_Y);
    ctx.lineTo(sx, PLOT_Y + PLOT_H);
    ctx.stroke();
    ctx.setLineDash([]);

    // Dots at selected hour
    [[sinEnc(h), '#3fb950'], [cosEnc(h), '#bc8cff']].forEach(([val, col]) => {
      ctx.beginPath();
      ctx.arc(sx, toPlotY(val), 5, 0, 2 * Math.PI);
      ctx.fillStyle = col;
      ctx.fill();
    });

    // Axis labels
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    [0,6,12,18,23].forEach(i => {
      ctx.fillText(i, toPlotX(i), PLOT_Y + PLOT_H + 14);
    });
    ctx.fillText('Hour', PLOT_X + PLOT_W/2, PLOT_Y + PLOT_H + 28);

    ctx.fillStyle = '#3fb950';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('sin', PLOT_X + PLOT_W - 30, PLOT_Y + 14);
    ctx.fillStyle = '#bc8cff';
    ctx.fillText('cos', PLOT_X + PLOT_W - 30, PLOT_Y + 28);

    // Values display
    if (infoEl) {
      infoEl.textContent = `Hour ${h}: sin = ${sinEnc(h).toFixed(3)}, cos = ${cosEnc(h).toFixed(3)}`;
    }
  }

  slider.addEventListener('input', () => {
    const h = parseInt(slider.value);
    if (hourValEl) hourValEl.textContent = h;
    draw(h);
  });

  document.getElementById('animateClock').addEventListener('click', () => {
    if (animTimer) { clearInterval(animTimer); animTimer = null; return; }
    animHour = parseInt(slider.value);
    animTimer = setInterval(() => {
      animHour = (animHour + 1) % 24;
      slider.value = animHour;
      if (hourValEl) hourValEl.textContent = animHour;
      draw(animHour);
    }, 200);
  });

  document.getElementById('resetClock').addEventListener('click', () => {
    if (animTimer) { clearInterval(animTimer); animTimer = null; }
    slider.value = 0;
    if (hourValEl) hourValEl.textContent = 0;
    draw(0);
  });

  draw(0);
})();
