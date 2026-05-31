// Week 12 — MLOps Lifecycle Pipeline Diagram
(function() {
  const canvas = document.getElementById('mlopsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const stages = [
    { label: 'Data\nCollection', color: '#58a6ff', icon: '📦' },
    { label: 'Data\nPrep', color: '#3fb950', icon: '🔧' },
    { label: 'Model\nTraining', color: '#d29922', icon: '🏋' },
    { label: 'Model\nEvaluation', color: '#bc8cff', icon: '📊' },
    { label: 'Model\nPackaging', color: '#f85149', icon: '📦' },
    { label: 'Deploy\n& Serve', color: '#39d353', icon: '🚀' },
    { label: 'Monitor\n& Retrain', color: '#79c0ff', icon: '👁' },
  ];

  const BOX_W = 78, BOX_H = 70;
  const ARROW_W = 16;
  const TOTAL_W = stages.length * BOX_W + (stages.length - 1) * ARROW_W;
  const START_X = (canvas.width - TOTAL_W) / 2;
  const START_Y = (canvas.height - BOX_H) / 2;

  let animStep = -1;
  let animTimer = null;

  function drawStage(i, lit) {
    const x = START_X + i * (BOX_W + ARROW_W);
    const y = START_Y;
    const s = stages[i];
    ctx.fillStyle = lit ? s.color : '#21262d';
    ctx.strokeStyle = lit ? s.color : '#30363d';
    ctx.lineWidth = 2;
    roundRect(ctx, x, y, BOX_W, BOX_H, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = lit ? '#0d1117' : '#8b949e';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    const lines = s.label.split('\n');
    lines.forEach((line, li) => {
      ctx.fillText(line, x + BOX_W/2, y + 24 + li * 14);
    });
    ctx.font = '16px sans-serif';
    ctx.fillText(s.icon, x + BOX_W/2, y + BOX_H - 10);

    // Stage number
    ctx.fillStyle = lit ? 'rgba(0,0,0,0.7)' : '#30363d';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText((i+1), x + 10, y + 14);
  }

  function drawArrow(i, lit) {
    if (i >= stages.length - 1) return;
    const ax = START_X + (i+1) * BOX_W + i * ARROW_W;
    const ay = START_Y + BOX_H/2;
    ctx.strokeStyle = lit ? stages[i].color : '#30363d';
    ctx.fillStyle = lit ? stages[i].color : '#30363d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax + ARROW_W - 2, ay);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(ax + ARROW_W - 2, ay - 5);
    ctx.lineTo(ax + ARROW_W, ay);
    ctx.lineTo(ax + ARROW_W - 2, ay + 5);
    ctx.fill();
  }

  // Feedback arrow (Monitor -> Data Collection)
  function drawFeedback(lit) {
    const ax = START_X;
    const bx = START_X + (stages.length - 1) * (BOX_W + ARROW_W) + BOX_W;
    const y1 = START_Y + BOX_H;
    const y2 = y1 + 40;
    ctx.strokeStyle = lit ? '#79c0ff' : '#30363d';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5,4]);
    ctx.beginPath();
    ctx.moveTo(bx - 8, y1);
    ctx.lineTo(bx - 8, y2);
    ctx.lineTo(ax + 8, y2);
    ctx.lineTo(ax + 8, y1);
    ctx.stroke();
    ctx.setLineDash([]);
    if (lit) {
      ctx.fillStyle = '#79c0ff';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('↺ Retrain loop', (ax + bx) / 2, y2 + 14);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.arcTo(x+w, y, x+w, y+h, r);
    ctx.arcTo(x+w, y+h, x, y+h, r);
    ctx.arcTo(x, y+h, x, y, r);
    ctx.arcTo(x, y, x+w, y, r);
    ctx.closePath();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stages.forEach((_, i) => {
      const lit = animStep < 0 || i <= animStep;
      drawStage(i, lit);
      drawArrow(i, lit);
    });
    drawFeedback(animStep >= stages.length - 1);

    // Title
    ctx.fillStyle = '#8b949e';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MLOps Lifecycle — 7 Stages', canvas.width/2, 20);
  }

  document.getElementById('animatePipeline').addEventListener('click', () => {
    if (animTimer) { clearInterval(animTimer); animTimer = null; }
    animStep = -1;
    animTimer = setInterval(() => {
      animStep++;
      draw();
      if (animStep >= stages.length) { clearInterval(animTimer); animTimer = null; }
    }, 500);
  });

  document.getElementById('resetPipeline').addEventListener('click', () => {
    if (animTimer) { clearInterval(animTimer); animTimer = null; }
    animStep = -1;
    draw();
  });

  draw();
})();
