// Week 10 — Interactive Confusion Matrix Visualizer
(function() {
  const canvas = document.getElementById('confusionCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function getVals() {
    return {
      TP: parseInt(document.getElementById('inTP').value) || 0,
      FP: parseInt(document.getElementById('inFP').value) || 0,
      FN: parseInt(document.getElementById('inFN').value) || 0,
      TN: parseInt(document.getElementById('inTN').value) || 0,
    };
  }

  function computeMetrics(v) {
    const total = v.TP + v.FP + v.FN + v.TN;
    const acc = total > 0 ? (v.TP + v.TN) / total : 0;
    const prec = (v.TP + v.FP) > 0 ? v.TP / (v.TP + v.FP) : 0;
    const rec  = (v.TP + v.FN) > 0 ? v.TP / (v.TP + v.FN) : 0;
    const f1   = (prec + rec) > 0 ? 2 * prec * rec / (prec + rec) : 0;
    return { acc, prec, rec, f1 };
  }

  function draw() {
    const v = getVals();
    const m = computeMetrics(v);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Matrix layout
    const mx = 180, my = 60, cw = 150, ch = 110;

    // Column/row headers
    ctx.fillStyle = '#8b949e';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Predicted Positive', mx + cw/2, my - 10);
    ctx.fillText('Predicted Negative', mx + cw + cw/2, my - 10);

    ctx.save();
    ctx.translate(mx - 14, my + ch);
    ctx.rotate(-Math.PI/2);
    ctx.textAlign = 'center';
    ctx.fillText('Actual Positive', 0, 0);
    ctx.restore();

    ctx.save();
    ctx.translate(mx - 14, my + ch + ch/2 + 10);
    ctx.rotate(-Math.PI/2);
    ctx.fillText('Actual Negative', 0, 0);
    ctx.restore();

    // Cells
    const cells = [
      { label: 'TP', value: v.TP, x: mx, y: my, color: 'rgba(63,185,80,0.25)', border: '#3fb950' },
      { label: 'FN', value: v.FN, x: mx + cw, y: my, color: 'rgba(248,81,73,0.25)', border: '#f85149' },
      { label: 'FP', value: v.FP, x: mx, y: my + ch, color: 'rgba(248,81,73,0.25)', border: '#f85149' },
      { label: 'TN', value: v.TN, x: mx + cw, y: my + ch, color: 'rgba(63,185,80,0.25)', border: '#3fb950' },
    ];

    cells.forEach(cell => {
      ctx.fillStyle = cell.color;
      ctx.fillRect(cell.x, cell.y, cw, ch);
      ctx.strokeStyle = cell.border;
      ctx.lineWidth = 2;
      ctx.strokeRect(cell.x, cell.y, cw, ch);

      ctx.fillStyle = cell.border;
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cell.label, cell.x + cw/2, cell.y + 38);

      ctx.fillStyle = '#c9d1d9';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(cell.value, cell.x + cw/2, cell.y + 78);
    });

    // Description labels
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px sans-serif';
    const descs = ['True Positive', 'False Negative', 'False Positive', 'True Negative'];
    cells.forEach((cell, i) => {
      ctx.fillText(descs[i], cell.x + cw/2, cell.y + ch - 8);
    });

    // Metrics bar
    const barY = my + ch * 2 + 30;
    const metrics = [
      { name: 'Accuracy', val: m.acc, color: '#58a6ff' },
      { name: 'Precision', val: m.prec, color: '#3fb950' },
      { name: 'Recall', val: m.rec, color: '#d29922' },
      { name: 'F1-Score', val: m.f1, color: '#bc8cff' },
    ];

    const barW = 500;
    const barH = 22;
    const startX = (canvas.width - barW) / 2;

    metrics.forEach((met, i) => {
      const bx = startX;
      const by = barY + i * 36;
      ctx.fillStyle = '#21262d';
      ctx.fillRect(bx, by, barW, barH);

      ctx.fillStyle = met.color;
      ctx.fillRect(bx, by, barW * met.val, barH);

      ctx.fillStyle = '#c9d1d9';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(met.name, bx - 80, by + 15);

      ctx.textAlign = 'right';
      ctx.fillText((met.val * 100).toFixed(1) + '%', bx + barW + 44, by + 15);
    });

    // Update metrics text
    const disp = document.getElementById('metricsDisplay');
    if (disp) {
      disp.innerHTML = `Accuracy: <strong>${(m.acc*100).toFixed(1)}%</strong> &nbsp;|&nbsp; Precision: <strong>${(m.prec*100).toFixed(1)}%</strong> &nbsp;|&nbsp; Recall: <strong>${(m.rec*100).toFixed(1)}%</strong> &nbsp;|&nbsp; F1: <strong>${(m.f1*100).toFixed(1)}%</strong>`;
    }
  }

  document.getElementById('updateConfusion').addEventListener('click', draw);
  ['inTP','inFP','inFN','inTN'].forEach(id => {
    document.getElementById(id).addEventListener('input', draw);
  });

  draw();
})();
