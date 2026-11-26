// The Zen Space: release a thought, breathe with the orb, draw in sand or silk, and tune the soundscape.
// Everything is generated on the client with Canvas and Web Audio. No audio files.
(function () {
  var canvas = document.getElementById('zen-canvas');
  var ctx = canvas.getContext('2d');
  var input = document.getElementById('zen-thought');
  var breathLabel = document.getElementById('zen-breath');
  var W = 0, H = 0, dpr = 1;
  var t0 = performance.now();
  var stars = [];
  var dust = [];   // stardust from released thoughts
  var marks = [];  // brush strokes: sand or silk
  var brush = 'sand', drawing = false, last = null, sweeping = false;
  var MAX_DUST = 2600, MAX_MARKS = 2600;

  // ---- sizing and stars ----
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    var n = Math.round((W * H) / 9000);
    for (var i = 0; i < Math.min(n, 220); i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H * 0.9, s: 0.6 + Math.random() * 1.6, ph: Math.random() * 6.28 });
    }
  }
  window.addEventListener('resize', resize);
  resize();

  // ---- breathing orb: a 10 second cycle, left to right and back ----
  function orbPhase(now) { return (1 - Math.cos(((now - t0) / 1000) * 2 * Math.PI / 10)) / 2; } // 0 at left, 1 at right
  var lastDir = 0;
  function breathText(now) {
    var s = Math.sin(((now - t0) / 1000) * 2 * Math.PI / 10);
    var dir = s < 0 ? 1 : -1; // rising phase goes right: breathing in
    if (dir !== lastDir) { lastDir = dir; breathLabel.textContent = dir > 0 ? 'Breathe in… 4 seconds' : 'Breathe out… 6 seconds'; }
  }

  // ---- release: a typed thought crumbles into stardust ----
  function release(text) {
    var off = document.createElement('canvas');
    var fs = 22;
    var octx = off.getContext('2d');
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
          dust.push({
            x: ox + x, y: oy + y,
            vx: (Math.random() - 0.5) * 0.9, vy: 0.2 + Math.random() * 0.8,
            a: 0.9, r: 0.8 + Math.random() * 1.2, ph: Math.random() * 6.28,
          });
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

  // ---- brush: draw in sand or silk, which fades (anitya, impermanence) ----
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
      for (var k = 0; k < (brush === 'sand' ? 2 : 1); k++) {
        addMark(px, py, (Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6);
      }
    }
    last = { x: x, y: y };
  }
  canvas.addEventListener('pointerdown', function (e) { drawing = true; last = null; ensureAudio(); strokeTo(e.clientX, e.clientY); });
  canvas.addEventListener('pointermove', function (e) { if (drawing) strokeTo(e.clientX, e.clientY); });
  window.addEventListener('pointerup', function () { drawing = false; last = null; });
  canvas.style.touchAction = 'none';

  // ---- frame loop ----
  function frame(now) {
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // sky: deep night with a soft golden horizon
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#080710');
    sky.addColorStop(0.7, '#15121f');
    sky.addColorStop(1, '#2a2014');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // golden-dappled stars
    stars.forEach(function (s) {
      var a = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 0.8 + s.ph));
      ctx.fillStyle = 'rgba(243,229,202,' + a.toFixed(3) + ')';
      ctx.fillRect(s.x, s.y, s.s, s.s);
    });

    // sand line
    var sandY = H * 0.78;
    var glow = ctx.createLinearGradient(0, sandY - 40, 0, sandY + 40);
    glow.addColorStop(0, 'rgba(233,190,110,0)');
    glow.addColorStop(0.5, 'rgba(233,190,110,0.08)');
    glow.addColorStop(1, 'rgba(233,190,110,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, sandY - 40, W, 80);

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
      ctx.fillStyle = m.kind === 'silk' ? 'rgba(255,240,210,' + (m.a * 0.5).toFixed(3) + ')' : 'rgba(233,200,130,' + (m.a * 0.9).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
    });
    if (sweeping && marks.length === 0) sweeping = false;

    // stardust from released thoughts: drifts down and settles into the sand
    dust = dust.filter(function (p) { return p.a > 0.02; });
    dust.forEach(function (p) {
      p.x += p.vx + Math.sin(t * 2 + p.ph) * 0.2;
      p.y += p.vy;
      p.vy = Math.min(p.vy + 0.004, 1.4);
      if (p.y > sandY) { p.a -= 0.02; p.y = sandY; }
      else { p.a -= 0.0015; }
      ctx.fillStyle = 'rgba(255,232,170,' + Math.max(0, p.a).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    });

    // breathing orb
    var ox = W * (0.08 + 0.84 * orbPhase(now));
    var oy = sandY - 30;
    var halo = ctx.createRadialGradient(ox, oy, 2, ox, oy, 46);
    halo.addColorStop(0, 'rgba(255,230,160,0.9)');
    halo.addColorStop(0.35, 'rgba(233,190,110,0.35)');
    halo.addColorStop(1, 'rgba(233,190,110,0)');
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(ox, oy, 46, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#f7e2b0';
    ctx.beginPath(); ctx.arc(ox, oy, 9, 0, 6.283); ctx.fill();
    breathText(now);

    updateBilateral(ox / W);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---- sound: all synthesised ----
  var ac = null, master = null, rainGain = null, droneGain = null, binGain = null, binPanL = null, binPanR = null, bilateralOn = false;
  function ensureAudio() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { ac = null; return; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    // rain: looping noise through a band-pass filter
    var nb = ac.createBuffer(1, ac.sampleRate * 3, ac.sampleRate), nd = nb.getChannelData(0);
    for (var i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
    var rs = ac.createBufferSource(); rs.buffer = nb; rs.loop = true;
    var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.4;
    rainGain = ac.createGain(); rainGain.gain.value = 0;
    rs.connect(bp); bp.connect(rainGain); rainGain.connect(master); rs.start();
    // tanpura-style drone: a low saw through a low-pass filter
    var dosc = ac.createOscillator(); dosc.type = 'sawtooth'; dosc.frequency.value = 98;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    droneGain = ac.createGain(); droneGain.gain.value = 0;
    dosc.connect(lp); lp.connect(droneGain); droneGain.connect(master); dosc.start();
    // bilateral: two tones, one per ear, 6 Hz apart (a binaural beat), panned with the orb
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

  function updateBilateral(pos) {
    if (!bilateralOn || !ac) return;
    var p = Math.max(-1, Math.min(1, pos * 2 - 1));
    binPanL.pan.setTargetAtTime(-1 + p * 0.5, ac.currentTime, 0.05);
    binPanR.pan.setTargetAtTime(1 + p * 0.5, ac.currentTime, 0.05);
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
    bil.textContent = bilateralOn ? 'Bilateral sound on' : 'Bilateral sound off';
    bil.setAttribute('aria-pressed', bilateralOn ? 'true' : 'false');
  });
  document.getElementById('zen-bowl').addEventListener('click', strikeBowl);
  document.getElementById('zen-rain').addEventListener('input', function (e) {
    ensureAudio(); setGain(rainGain, (e.target.value / 100) * 0.18);
  });
  document.getElementById('zen-drone').addEventListener('input', function (e) {
    ensureAudio(); setGain(droneGain, (e.target.value / 100) * 0.12);
  });
})();
