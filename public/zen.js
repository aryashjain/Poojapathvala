// The Zen Space: write a worry and watch it dissolve, breathe with the light, draw in gold sand or silk,
// and tune the soundscape. Everything is drawn and synthesised on the client. No audio files.
(function () {
  var canvas = document.getElementById('zen-canvas');
  var ctx = canvas.getContext('2d');
  var input = document.getElementById('zen-thought');
  var labelIn = document.getElementById('zen-in');
  var labelOut = document.getElementById('zen-out');
  var W = 0, H = 0, dpr = 1;
  var t0 = performance.now();
  var stars = [], swirls = [], dust = [], marks = [];
  var brush = 'sand', drawing = false, last = null, sweeping = false;
  var MAX_DUST = 2600, MAX_MARKS = 2400;
  var TRACK_Y = 0.6; // breathing track sits at 60% of the height

  // ---- layout ----
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    var n = Math.min(260, Math.round((W * H) / 7000));
    for (var i = 0; i < n; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, s: 0.5 + Math.random() * 1.6, ph: Math.random() * 6.28, gold: Math.random() < 0.3 });
    }
    buildSwirls();
  }
  window.addEventListener('resize', resize);

  // ---- gold swirls: spirals and flowing ribbons of particles, built once per size ----
  function buildSwirls() {
    swirls = [];
    var spirals = [
      { cx: 0.56, cy: 0.56, R: 0.13, turns: 2.4, dir: 1 },
      { cx: 0.42, cy: 0.62, R: 0.07, turns: 1.8, dir: -1 },
      { cx: 0.7, cy: 0.5, R: 0.05, turns: 1.6, dir: -1 },
    ];
    spirals.forEach(function (s) {
      var rMax = Math.min(W * s.R, H * s.R * 1.4);
      for (var i = 0; i < 900; i++) {
        var u = i / 900;
        var ang = u * s.turns * 2 * Math.PI;
        var rr = rMax * (0.08 + 0.92 * u);
        var jitter = (Math.random() - 0.5) * rMax * 0.05;
        swirls.push({ x: W * s.cx + Math.cos(ang * s.dir) * (rr + jitter), y: H * s.cy + Math.sin(ang * s.dir) * (rr + jitter) * 0.7, ph: Math.random() * 6.28, s: 0.6 + Math.random() * 1.4 });
      }
    });
    for (var k = 0; k < 7; k++) {
      var phase = k * 0.7, amp = 0.05 + k * 0.012;
      for (var j = 0; j < 320; j++) {
        var uu = j / 320;
        var x = W * (0.12 + 0.8 * uu);
        var y = H * (0.5 + amp * Math.sin(uu * 6.28 * 1.1 + phase)) + (Math.random() - 0.5) * 6;
        swirls.push({ x: x, y: y, ph: Math.random() * 6.28, s: 0.5 + Math.random() * 1.1 });
      }
    }
  }

  // ---- breathing: a 10 second cycle along a wave track ----
  function trackY(x) { return H * TRACK_Y + Math.sin((x / W) * Math.PI * 2 * 1.1) * H * 0.018; }
  function cyclePos(now) { return Math.sin(((now - t0) / 1000) * 2 * Math.PI / 10); } // +: breathing in, -: breathing out
  var lastDir = 0;
  function breathLabels(now) {
    var s = cyclePos(now);
    var dir = s >= 0 ? 1 : -1;
    if (dir !== lastDir) {
      lastDir = dir;
      labelIn.classList.toggle('on', dir > 0);
      labelOut.classList.toggle('on', dir < 0);
    }
  }

  // ---- release: a typed worry crumbles into stardust ----
  function release(text) {
    var off = document.createElement('canvas');
    var fs = 22, octx = off.getContext('2d');
    octx.font = fs + 'px Georgia, serif';
    var w = Math.ceil(octx.measureText(text).width) + 8;
    off.width = w; off.height = fs * 2;
    octx.font = fs + 'px Georgia, serif';
    octx.fillStyle = '#fff';
    octx.textBaseline = 'middle';
    octx.fillText(text, 4, fs);
    var data = octx.getImageData(0, 0, off.width, off.height).data;
    var rect = input.getBoundingClientRect();
    var ox = rect.left + rect.width / 2 - w / 2, oy = rect.top + rect.height / 2 - fs;
    for (var y = 0; y < off.height; y += 3) {
      for (var x = 0; x < off.width; x += 3) {
        if (data[(y * off.width + x) * 4 + 3] > 120 && dust.length < MAX_DUST) {
          dust.push({ x: ox + x, y: oy + y, vx: (Math.random() - 0.5) * 0.9, vy: 0.2 + Math.random() * 0.8, a: 0.95, r: 0.8 + Math.random() * 1.2, ph: Math.random() * 6.28 });
        }
      }
    }
  }
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && input.value.trim()) {
      var text = input.value.trim().slice(0, 120);
      input.value = '';
      release(text);
    }
  });

  // ---- brush: sand or silk, which fades (anitya, impermanence) ----
  function addMark(x, y, vx, vy) {
    if (marks.length >= MAX_MARKS) marks.shift();
    marks.push(brush === 'sand'
      ? { x: x, y: y, vx: vx, vy: vy, a: 1, fade: 0.012 + Math.random() * 0.01, r: 0.8 + Math.random() * 1.4, kind: 'sand' }
      : { x: x, y: y, vx: vx * 0.3, vy: vy * 0.3, a: 0.9, fade: 0.0045, r: 4 + Math.random() * 3, kind: 'silk' });
  }
  function strokeTo(x, y) {
    if (!last) { last = { x: x, y: y }; return; }
    var dx = x - last.x, dy = y - last.y, d = Math.sqrt(dx * dx + dy * dy);
    var steps = Math.max(1, Math.ceil(d / 3));
    for (var i = 0; i < steps; i++) {
      var px = last.x + dx * (i / steps), py = last.y + dy * (i / steps);
      for (var k = 0; k < (brush === 'sand' ? 2 : 1); k++) addMark(px, py, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6);
    }
    last = { x: x, y: y };
  }
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', function (e) { drawing = true; last = null; ensureAudio(); strokeTo(e.clientX, e.clientY); });
  canvas.addEventListener('pointermove', function (e) { if (drawing) strokeTo(e.clientX, e.clientY); });
  window.addEventListener('pointerup', function () { drawing = false; last = null; });

  // ---- frame loop ----
  function frame(now) {
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // night sky with a faint blue haze
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#0b0c1e');
    sky.addColorStop(0.55, '#141733');
    sky.addColorStop(1, '#0c0b18');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // stars, some warm gold
    stars.forEach(function (s) {
      var a = 0.25 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.8 + s.ph));
      ctx.fillStyle = s.gold ? 'rgba(246,214,150,' + a.toFixed(3) + ')' : 'rgba(220,225,255,' + (a * 0.8).toFixed(3) + ')';
      ctx.fillRect(s.x, s.y, s.s, s.s);
    });

    // gold swirls, shimmering
    swirls.forEach(function (p) {
      var a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.4 + p.ph));
      ctx.fillStyle = 'rgba(255,220,140,' + a.toFixed(3) + ')';
      ctx.fillRect(p.x, p.y, p.s, p.s);
    });

    // breathing track and orb
    ctx.strokeStyle = 'rgba(233,213,176,0.28)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (var x = 0; x <= W; x += 6) { if (x === 0) ctx.moveTo(x, trackY(x)); else ctx.lineTo(x, trackY(x)); }
    ctx.stroke();
    var phase = (1 - Math.cos(((now - t0) / 1000) * 2 * Math.PI / 10)) / 2;
    var ox = W * (0.12 + 0.76 * phase), oy = trackY(ox);
    var halo = ctx.createRadialGradient(ox, oy, 2, ox, oy, 42);
    halo.addColorStop(0, 'rgba(255,236,180,0.95)');
    halo.addColorStop(0.4, 'rgba(246,200,120,0.35)');
    halo.addColorStop(1, 'rgba(246,200,120,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(ox, oy, 42, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#fbe7b5';
    ctx.beginPath(); ctx.arc(ox, oy, 9, 0, 6.283); ctx.fill();
    breathLabels(now);

    // brush marks
    var fadeMul = sweeping ? 6 : 1;
    marks = marks.filter(function (m) { return m.a > 0.01; });
    marks.forEach(function (m) {
      m.x += m.vx; m.y += m.vy;
      m.a -= m.fade * fadeMul;
      if (m.kind === 'silk') {
        ctx.fillStyle = 'rgba(255,236,190,' + (m.a * 0.12).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 1.8, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = m.kind === 'silk' ? 'rgba(255,240,210,' + (m.a * 0.5).toFixed(3) + ')' : 'rgba(246,206,130,' + (m.a * 0.95).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
    });
    if (sweeping && marks.length === 0) sweeping = false;

    // stardust from released worries: drifts down and fades
    dust = dust.filter(function (p) { return p.a > 0.02; });
    var floor = H * 0.86;
    dust.forEach(function (p) {
      p.x += p.vx + Math.sin(t * 2 + p.ph) * 0.2;
      p.y += p.vy;
      p.vy = Math.min(p.vy + 0.004, 1.4);
      if (p.y > floor) p.a -= 0.02; else p.a -= 0.0012;
      ctx.fillStyle = 'rgba(255,230,165,' + Math.max(0, p.a).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    });

    requestAnimationFrame(frame);
  }

  // ---- sound: all synthesised with Web Audio ----
  var ac = null, master = null, rainGain = null, droneGain = null, binGain = null, binPanL = null, binPanR = null, bilateralOn = false;
  function ensureAudio() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    var nb = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    var rs = ac.createBufferSource(); rs.buffer = nb; rs.loop = true;
    var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.4;
    rainGain = ac.createGain(); rainGain.gain.value = 0;
    rs.connect(bp); bp.connect(rainGain); rainGain.connect(master); rs.start();
    var dosc = ac.createOscillator(); dosc.type = 'sawtooth'; dosc.frequency.value = 98;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    droneGain = ac.createGain(); droneGain.gain.value = 0;
    dosc.connect(lp); lp.connect(droneGain); droneGain.connect(master); dosc.start();
    binGain = ac.createGain(); binGain.gain.value = 0;
    var oL = ac.createOscillator(), oR = ac.createOscillator();
    oL.frequency.value = 200; oR.frequency.value = 206;
    binPanL = ac.createStereoPanner(); binPanR = ac.createStereoPanner();
    binPanL.pan.value = -1; binPanR.pan.value = 1;
    oL.connect(binPanL); oR.connect(binPanR);
    binPanL.connect(binGain); binPanR.connect(binGain);
    binGain.connect(master);
    oL.start(); oR.start();
  }
  function setGain(node, v) { if (node && ac) node.gain.setTargetAtTime(v, ac.currentTime, 0.1); }
  function strikeBowl() {
    ensureAudio();
    if (!ac) return;
    var now = ac.currentTime;
    [196, 392, 587].forEach(function (f, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.22 / (i + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 7);
      o.connect(g); g.connect(master);
      o.start(now); o.stop(now + 7.1);
    });
  }
  // The binaural pair follows the orb: the sound moves with the breath.
  function updateBilateral(now) {
    if (!bilateralOn || !ac) return;
    var p = cyclePos(now);
    binPanL.pan.setTargetAtTime(-1 + (p + 1) * 0.25, ac.currentTime, 0.05);
    binPanR.pan.setTargetAtTime(1 - (p + 1) * 0.25, ac.currentTime, 0.05);
    requestAnimationFrame(function () { updateBilateral(performance.now()); });
  }

  // ---- controls ----
  document.querySelectorAll('[data-brush]').forEach(function (b) {
    b.addEventListener('click', function () {
      brush = b.getAttribute('data-brush');
      document.querySelectorAll('[data-brush]').forEach(function (o) {
        o.classList.toggle('on', o === b);
        o.setAttribute('aria-pressed', o === b ? 'true' : 'false');
      });
    });
  });
  document.getElementById('zen-sweep').addEventListener('click', function () { sweeping = true; });
  var bil = document.getElementById('zen-bilateral');
  bil.addEventListener('click', function () {
    ensureAudio();
    bilateralOn = !bilateralOn;
    setGain(binGain, bilateralOn ? 0.05 : 0);
    bil.setAttribute('aria-pressed', bilateralOn ? 'true' : 'false');
    bil.textContent = bilateralOn ? 'On' : 'Off';
    if (bilateralOn) updateBilateral(performance.now());
  });
  document.getElementById('zen-bowl').addEventListener('click', strikeBowl);
  document.getElementById('zen-rain').addEventListener('input', function (e) { ensureAudio(); setGain(rainGain, (e.target.value / 100) * 0.18); });
  document.getElementById('zen-drone').addEventListener('input', function (e) { ensureAudio(); setGain(droneGain, (e.target.value / 100) * 0.12); });

  resize();
  requestAnimationFrame(frame);
})();
