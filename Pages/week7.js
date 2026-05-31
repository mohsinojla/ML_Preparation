// Week 7 — Hierarchical Clustering Dendrogram Visualizer
// Points: {18, 22, 25, 42, 27, 43} — sorted: 18, 22, 25, 27, 42, 43
// Single linkage merge steps

(function() {
  const canvas = document.getElementById('dendrogramCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Merge history: each entry {clusterA, clusterB, height, newCluster}
  // Points indices: 0=18, 1=22, 2=25, 3=27, 4=42, 5=43
  const labels = [18, 22, 25, 27, 42, 43];
  const merges = [
    { a: [4], b: [5], height: 1,  merged: [4,5],        desc: 'Merge 42 & 43 (dist=1)' },
    { a: [2], b: [3], height: 2,  merged: [2,3],        desc: 'Merge 25 & 27 (dist=2)' },
    { a: [1], b: [2,3], height: 3, merged: [1,2,3],     desc: 'Merge 22 & {25,27} (dist=3)' },
    { a: [0], b: [1,2,3], height: 4, merged: [0,1,2,3], desc: 'Merge 18 & {22,25,27} (dist=4)' },
    { a: [0,1,2,3], b: [4,5], height: 15, merged: [0,1,2,3,4,5], desc: 'Merge {18,22,25,27} & {42,43} (dist=15)' },
  ];

  let step = 0;
  const maxH = 18;

  // Layout
  const PAD_L = 50, PAD_R = 30, PAD_T = 30, PAD_B = 60;
  const W = canvas.width - PAD_L - PAD_R;
  const H = canvas.height - PAD_T - PAD_B;
  const n = labels.length;

  function xPos(i) {
    return PAD_L + (i + 0.5) * (W / n);
  }
  function yPos(h) {
    return PAD_T + H - (h / maxH) * H;
  }

  // Track x-center of each cluster by member set
  // Map from sorted key to x center
  function clusterKey(arr) { return arr.slice().sort((a,b)=>a-b).join(','); }
  function clusterCenter(members) {
    return members.reduce((s,i) => s + xPos(i), 0) / members.length;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Y-axis label
    ctx.save();
    ctx.translate(14, canvas.height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillStyle = '#8b949e';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Distance (height)', 0, 0);
    ctx.restore();

    // Y-axis ticks
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    [0,2,4,6,8,10,12,14,16,18].forEach(h => {
      const y = yPos(h);
      ctx.fillText(h, PAD_L - 6, y + 4);
      ctx.strokeStyle = '#21262d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(PAD_L, y);
      ctx.lineTo(PAD_L + W, y);
      ctx.stroke();
    });

    // Baseline (y=0)
    ctx.strokeStyle = '#30363d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_L, yPos(0));
    ctx.lineTo(PAD_L + W, yPos(0));
    ctx.stroke();

    // Draw leaf labels
    ctx.textAlign = 'center';
    ctx.fillStyle = '#c9d1d9';
    ctx.font = 'bold 13px sans-serif';
    for (let i = 0; i < n; i++) {
      ctx.fillText(labels[i], xPos(i), yPos(0) + 20);
    }

    // Draw vertical stems from baseline to merge height
    for (let i = 0; i < n; i++) {
      ctx.strokeStyle = '#58a6ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(xPos(i), yPos(0));
      ctx.lineTo(xPos(i), yPos(0) - 2);
      ctx.stroke();
    }

    // Draw completed merges
    const colors = ['#3fb950','#d29922','#bc8cff','#f85149','#58a6ff'];
    for (let m = 0; m < step; m++) {
      const merge = merges[m];
      const color = colors[m % colors.length];
      const xA = clusterCenter(merge.a);
      const xB = clusterCenter(merge.b);
      const y  = yPos(merge.height);
      const yBase = yPos(0);

      // Horizontal bar
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(xA, y);
      ctx.lineTo(xB, y);
      ctx.stroke();

      // Left vertical
      ctx.beginPath();
      ctx.moveTo(xA, y);
      ctx.lineTo(xA, yBase);
      ctx.stroke();

      // Right vertical
      ctx.beginPath();
      ctx.moveTo(xB, y);
      ctx.lineTo(xB, yBase);
      ctx.stroke();

      // Height label
      ctx.fillStyle = color;
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      const midX = (xA + xB) / 2;
      ctx.fillText('d=' + merge.height, midX, y - 6);
    }

    // Current merge description
    const msgEl = document.getElementById('mergeLabel');
    if (step === 0) {
      if (msgEl) msgEl.textContent = 'Click "Next Merge" to animate the dendrogram step by step.';
    } else {
      if (msgEl) msgEl.textContent = 'Step ' + step + '/5: ' + merges[step-1].desc;
    }
    if (step >= merges.length) {
      if (msgEl) msgEl.textContent = 'All 5 merges complete. Cut at height ~10 → 2 clusters: {18,22,25,27} and {42,43}.';
      // Draw cut line
      ctx.strokeStyle = '#f85149';
      ctx.lineWidth = 2;
      ctx.setLineDash([8,4]);
      const cutY = yPos(10);
      ctx.beginPath();
      ctx.moveTo(PAD_L, cutY);
      ctx.lineTo(PAD_L + W, cutY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f85149';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('← Cut at h=10 → K=2', PAD_L + 4, cutY - 6);
    }
  }

  document.getElementById('stepBtn').addEventListener('click', () => {
    if (step < merges.length) { step++; draw(); }
  });
  document.getElementById('resetDendroBtn').addEventListener('click', () => {
    step = 0; draw();
  });

  draw();
})();
