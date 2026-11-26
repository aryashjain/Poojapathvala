// The Zen Space: release a worry into stardust, draw in sand or silk, sweep the canvas back to the night sky,
// blow out a candle, follow the breathing light, and tune the soundscape. All drawn and synthesised on the client.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var canvas = $('zen-canvas'), ctx = canvas.getContext('2d');
  var input = $('zen-thought'), labelIn = $('zen-in'), labelOut = $('zen-out');
  var W = 0, H = 0, dpr = 1, t0 = performance.now();
  var stars = [], dust = [], marks = [], puffs = [];
  var brush = 'sand', drawing = false, last = null;
  var sweepStart = null, SWEEP_MS = 2600;
  var candle = { state: 'hidden', x: 0, baseY: 0, flick: 0, smokeUntil: 0 };
  var mic = { stream: null, analyser: null, data: null, loud: 0, on: false };
  var MAX_DUST = 2400, MAX_MARKS = 2200;

  // ---- sizing ----
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = [];
    var n = Math.min(240, Math.round((W * H) / 7000));
    for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * 0.95, s: 0.5 + Math.random() * 1.5, ph: Math.random() * 6.28, gold: Math.random() < 0.3 });
    candle.x = W * 0.5;
    candle.baseY = H * 0.56;
  }
  window.addEventListener('resize', resize);

  // ---- breathing: a 10 second cycle ----
  function breathPhase(now) { return Math.sin(((now - t0) / 1000) * 2 * Math.PI / 10); }
  var lastDir = 0;
  function breathLabels(now) {
    var dir = breathPhase(now) >= 0 ? 1 : -1;
    if (dir !== lastDir) { lastDir = dir; labelIn.classList.toggle('on', dir > 0); labelOut.classList.toggle('on', dir < 0); }
  }
  function trackY(x) { return H * 0.6 + Math.sin((x / W) * Math.PI * 2 * 1.1) * H * 0.018; }

  // ---- release: a typed worry crumbles into stardust ----
  function release(text) {
    var off = document.createElement('canvas'), octx = off.getContext('2d'), fs = 22;
    octx.font = fs + 'px Georgia, serif';
    var w = Math.ceil(octx.measureText(text).width) + 8;
    off.width = w; off.height = fs * 2;
    octx.font = fs + 'px Georgia, serif'; octx.fillStyle = '#fff'; octx.textBaseline = 'middle';
    octx.fillText(text, 4, fs);
    var data = octx.getImageData(0, 0, off.width, off.height).data;
    var r = input.getBoundingClientRect();
    var ox = r.left + r.width / 2 - w / 2, oy = r.top + r.height / 2 - fs;
    for (var y = 0; y < off.height; y += 3) for (var x = 0; x < off.width; x += 3) {
      if (data[(y * off.width + x) * 4 + 3] > 120 && dust.length < MAX_DUST) {
        dust.push({ x: ox + x, y: oy + y, vx: (Math.random() - 0.5) * 0.9, vy: 0.2 + Math.random() * 0.8, a: 0.95, r: 0.8 + Math.random() * 1.2, ph: Math.random() * 6.28 });
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

  // ---- brush ----
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
  canvas.addEventListener('pointerdown', function (e) {
    ensureAudio();
    if (candleHit(e.clientX, e.clientY)) { toggleCandle(); return; }
    drawing = true; last = null; strokeTo(e.clientX, e.clientY);
  });
  canvas.addEventListener('pointermove', function (e) { if (drawing) strokeTo(e.clientX, e.clientY); });
  window.addEventListener('pointerup', function () { drawing = false; last = null; });

  // ---- candle: hidden until someone asks for it. States: hidden, lit, smoking (blown out, then hidden). ----
  function candleHit(x, y) {
    return candle.state !== 'hidden' && Math.abs(x - candle.x) < 34 && y > candle.baseY - 110 && y < candle.baseY + 20;
  }
  function lightCandle() {
    candle.state = 'lit';
    candle.smokeUntil = 0;
    setCandleUI();
  }
  function blowOut() {
    if (candle.state !== 'lit') return;
    candle.state = 'smoking';
    candle.smokeUntil = performance.now() + 3200;
    for (var i = 0; i < 26; i++) {
      puffs.push({ x: candle.x + (Math.random() - 0.5) * 4, y: candle.baseY - 74, vx: (Math.random() - 0.5) * 0.5, vy: -(0.5 + Math.random() * 0.8), r: 3 + Math.random() * 4, a: 0.35 });
    }
    puff();
    setCandleUI();
  }
  function toggleCandle() {
    if (candle.state === 'lit') blowOut();
    else lightCandle();
  }
  function setCandleUI() {
    var btn = $('zen-candle');
    var label = candle.state === 'lit' ? 'Blow it out' : candle.state === 'smoking' ? 'Blowing out…' : 'Light a candle';
    btn.textContent = label;
    btn.setAttribute('aria-pressed', candle.state === 'lit' ? 'true' : 'false');
    btn.disabled = candle.state === 'smoking';
    $('zen-mic').disabled = candle.state !== 'lit';
  }
  function drawCandle(t, now) {
    if (candle.state === 'hidden') return;
    if (candle.state === 'smoking' && now > candle.smokeUntil) {
      candle.state = 'hidden';
      setCandleUI();
      return;
    }
    var x = candle.x, by = candle.baseY, top = by - 70;
    var wax = ctx.createLinearGradient(x - 11, 0, x + 11, 0);
    wax.addColorStop(0, '#d9c49a'); wax.addColorStop(0.5, '#f7ecd0'); wax.addColorStop(1, '#c9b07f');
    ctx.fillStyle = wax;
    ctx.fillRect(x - 11, top, 22, 70);
    ctx.fillStyle = 'rgba(60,40,15,0.5)';
    ctx.fillRect(x - 11, by - 2, 22, 4);
    ctx.strokeStyle = '#2a1a0a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, top - 6); ctx.stroke();
    if (candle.state === 'lit') {
      candle.flick = 0.5 + 0.25 * Math.sin(t * 9) + 0.25 * Math.sin(t * 17 + 1);
      var fh = 34 + 5 * candle.flick, fw = 10 + 2 * candle.flick;
      var halo = ctx.createRadialGradient(x, top - 12, 4, x, top - 12, 150);
      halo.addColorStop(0, 'rgba(255,190,90,0.42)');
      halo.addColorStop(0.5, 'rgba(255,140,50,0.12)');
      halo.addColorStop(1, 'rgba(255,140,50,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(x - 160, top - 170, 320, 330);
      ctx.globalCompositeOperation = 'lighter';
      var outer = ctx.createLinearGradient(0, top - 6, 0, top - 6 - fh);
      outer.addColorStop(0, 'rgba(255,120,30,0.9)'); outer.addColorStop(1, 'rgba(255,60,0,0)');
      ctx.fillStyle = outer;
      ctx.beginPath();
      ctx.moveTo(x - fw, top - 6);
      ctx.quadraticCurveTo(x - fw * 1.1, top - 6 - fh * 0.5, x + (candle.flick - 0.5) * 4, top - 6 - fh);
      ctx.quadraticCurveTo(x + fw * 1.1, top - 6 - fh * 0.5, x + fw, top - 6);
      ctx.closePath(); ctx.fill();
      var inner = ctx.createLinearGradient(0, top - 6, 0, top - 6 - fh * 0.7);
      inner.addColorStop(0, 'rgba(255,250,200,0.95)'); inner.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.moveTo(x - fw * 0.45, top - 6);
      ctx.quadraticCurveTo(x, top - 6 - fh * 0.9, x + fw * 0.45, top - 6);
      ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    } else {
      // smoking: a thin wisp rises from the wick until the candle is hidden
      puffs.push({ x: x + (Math.random() - 0.5) * 2, y: top - 8, vx: 0.05, vy: -0.25, r: 1.5, a: 0.12, wisp: true });
    }
  }

  // ---- stardust, smoke puffs and the sweep ----
  function drawFrame(now) {
    var t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // night sky
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#07081a'); sky.addColorStop(0.55, '#10132c'); sky.addColorStop(1, '#0a0912');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    stars.forEach(function (s) {
      var a = 0.25 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.8 + s.ph));
      ctx.fillStyle = s.gold ? 'rgba(246,214,150,' + a.toFixed(3) + ')' : 'rgba(220,225,255,' + (a * 0.8).toFixed(3) + ')';
      ctx.fillRect(s.x, s.y, s.s, s.s);
    });

    // breathing track and orb
    ctx.strokeStyle = 'rgba(233,213,176,0.28)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (var x = 0; x <= W; x += 6) { if (x === 0) ctx.moveTo(x, trackY(x)); else ctx.lineTo(x, trackY(x)); }
    ctx.stroke();
    var phase = (1 - Math.cos(((now - t0) / 1000) * 2 * Math.PI / 10)) / 2;
    var ox = W * (0.12 + 0.76 * phase), oy = trackY(ox);
    var halo = ctx.createRadialGradient(ox, oy, 2, ox, oy, 42);
    halo.addColorStop(0, 'rgba(255,236,180,0.95)'); halo.addColorStop(0.4, 'rgba(246,200,120,0.35)'); halo.addColorStop(1, 'rgba(246,200,120,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(ox, oy, 42, 0, 6.283); ctx.fill();
    ctx.fillStyle = '#fbe7b5'; ctx.beginPath(); ctx.arc(ox, oy, 9, 0, 6.283); ctx.fill();
    breathLabels(now);

    drawCandle(t, now);

    // sweep: a golden band moves across and dissolves everything it passes
    var sweepX = null;
    if (sweepStart !== null) {
      var p = (now - sweepStart) / SWEEP_MS;
      if (p >= 1) sweepStart = null;
      else {
        sweepX = W * 1.1 * Math.min(1, p);
        var band = ctx.createLinearGradient(sweepX - 120, 0, sweepX + 20, 0);
        band.addColorStop(0, 'rgba(246,200,120,0)');
        band.addColorStop(0.9, 'rgba(246,200,120,0.16)');
        band.addColorStop(1, 'rgba(246,200,120,0)');
        ctx.fillStyle = band; ctx.fillRect(sweepX - 120, 0, 140, H);
      }
    }

    // brush marks, fading (anitya)
    marks = marks.filter(function (m) { return m.a > 0.01; });
    marks.forEach(function (m) {
      m.x += m.vx; m.y += m.vy;
      m.a -= m.fade;
      if (sweepX !== null && m.x < sweepX) m.a -= 0.12;
      if (m.kind === 'silk') {
        ctx.fillStyle = 'rgba(255,236,190,' + Math.max(0, m.a * 0.12).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 1.8, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = m.kind === 'silk' ? 'rgba(255,240,210,' + Math.max(0, m.a * 0.5).toFixed(3) + ')' : 'rgba(246,206,130,' + Math.max(0, m.a * 0.95).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
    });

    // stardust from released worries: drifts down, fades
    dust = dust.filter(function (p) { return p.a > 0.02; });
    var floor = H * 0.86;
    dust.forEach(function (p) {
      p.x += p.vx + Math.sin(t * 2 + p.ph) * 0.2; p.y += p.vy;
      p.vy = Math.min(p.vy + 0.004, 1.4);
      p.a -= p.y > floor ? 0.02 : 0.0012;
      if (sweepX !== null && p.x < sweepX) p.a -= 0.1;
      ctx.fillStyle = 'rgba(255,230,165,' + Math.max(0, p.a).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    });

    // smoke from a blown candle
    puffs = puffs.filter(function (q) { return q.a > 0.01 && q.y > -20; });
    puffs.forEach(function (q) {
      q.x += q.vx + Math.sin(t * 1.5 + q.y * 0.05) * 0.15; q.y += q.vy; q.r += 0.18;
      q.a -= q.wisp ? 0.02 : 0.004;
      ctx.fillStyle = 'rgba(200,195,205,' + Math.max(0, q.a).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.283); ctx.fill();
    });

    readMic();
    requestAnimationFrame(drawFrame);
  }

  // ---- microphone: a loud breath or blow puts the candle out ----
  function readMic() {
    if (!mic.on || !mic.analyser) return;
    if (candle.state !== 'lit') return;
    mic.analyser.getByteTimeDomainData(mic.data);
    var sum = 0;
    for (var i = 0; i < mic.data.length; i++) { var v = (mic.data[i] - 128) / 128; sum += v * v; }
    var rms = Math.sqrt(sum / mic.data.length);
    mic.loud = rms > 0.12 ? mic.loud + 1 : 0;
    if (mic.loud >= 3 && candle.state === 'lit') { blowOut(); mic.loud = 0; setMicStatus('Candle out. Light it again when you like.'); }
  }
  function setMicStatus(s) { $('zen-mic-status').textContent = s; }
  function startMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setMicStatus('This browser cannot use the microphone. Use the button instead.'); return; }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      mic.stream = stream;
      ensureAudio();
      var src = ac.createMediaStreamSource(stream);
      mic.analyser = ac.createAnalyser(); mic.analyser.fftSize = 512;
      mic.data = new Uint8Array(mic.analyser.fftSize);
      src.connect(mic.analyser);
      mic.on = true;
      $('zen-mic').setAttribute('aria-pressed', 'true');
      $('zen-mic').textContent = 'Stop microphone';
      setMicStatus('Listening. Blow gently toward the screen.');
    }).catch(function () {
      setMicStatus('Microphone permission was not given. Use the button instead.');
    });
  }
  function stopMic() {
    if (mic.stream) mic.stream.getTracks().forEach(function (tr) { tr.stop(); });
    mic.stream = null; mic.analyser = null; mic.on = false;
    $('zen-mic').setAttribute('aria-pressed', 'false');
    $('zen-mic').textContent = 'Blow with microphone';
    setMicStatus('');
  }

  // ---- sound ----
  var ac = null, master = null, rainGain = null, droneGain = null, riverGain = null, binGain = null, binPanL = null, binPanR = null, bilateralOn = false;
  function noiseBuffer(seconds) {
    var b = ac.createBuffer(1, Math.round(ac.sampleRate * seconds), ac.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return b;
  }
  function ensureAudio() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
    // rain: looping noise through a band-pass
    var rs = ac.createBufferSource(); rs.buffer = noiseBuffer(3); rs.loop = true;
    var bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.4;
    rainGain = ac.createGain(); rainGain.gain.value = 0;
    rs.connect(bp); bp.connect(rainGain); rainGain.connect(master); rs.start();
    // river: low rumble of noise with a slow swell (LFO on the filter) and a bright splash layer
    var rv = ac.createBufferSource(); rv.buffer = noiseBuffer(4); rv.loop = true;
    var lpR = ac.createBiquadFilter(); lpR.type = 'lowpass'; lpR.frequency.value = 700; lpR.Q.value = 0.6;
    var lfo = ac.createOscillator(); lfo.frequency.value = 0.18;
    var lfoGain = ac.createGain(); lfoGain.gain.value = 320;
    lfo.connect(lfoGain); lfoGain.connect(lpR.frequency); lfo.start();
    var splash = ac.createBiquadFilter(); splash.type = 'highpass'; splash.frequency.value = 2200;
    riverGain = ac.createGain(); riverGain.gain.value = 0;
    rv.connect(lpR); lpR.connect(riverGain); rv.connect(splash); splash.connect(riverGain); riverGain.connect(master); rv.start();
    // tanpura-style drone
    var dosc = ac.createOscillator(); dosc.type = 'sawtooth'; dosc.frequency.value = 98;
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 420;
    droneGain = ac.createGain(); droneGain.gain.value = 0;
    dosc.connect(lp); lp.connect(droneGain); droneGain.connect(master); dosc.start();
    // bilateral: 200 Hz left, 206 Hz right (a 6 Hz binaural beat), pan follows the breath
    binGain = ac.createGain(); binGain.gain.value = 0;
    var oL = ac.createOscillator(), oR = ac.createOscillator();
    oL.frequency.value = 200; oR.frequency.value = 206;
    binPanL = ac.createStereoPanner(); binPanR = ac.createStereoPanner();
    binPanL.pan.value = -1; binPanR.pan.value = 1;
    oL.connect(binPanL); oR.connect(binPanR); binPanL.connect(binGain); binPanR.connect(binGain); binGain.connect(master);
    oL.start(); oR.start();
    return true;
  }
  function setGain(node, v) { if (node && ac) node.gain.setTargetAtTime(v, ac.currentTime, 0.1); }
  function strikeBowl() {
    if (!ensureAudio()) return;
    var now = ac.currentTime;
    [196, 392, 587].forEach(function (f, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.22 / (i + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 7);
      o.connect(g); g.connect(master); o.start(now); o.stop(now + 7.1);
    });
  }
  function puff() {
    if (!ensureAudio()) return;
    var src = ac.createBufferSource(); src.buffer = noiseBuffer(0.4);
    var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    var g = ac.createGain(); g.gain.setValueAtTime(0.5, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
    src.connect(lp); lp.connect(g); g.connect(master); src.start(); src.stop(ac.currentTime + 0.45);
  }
  // The binaural pair moves with the breath.
  function followBreath() {
    if (!bilateralOn || !ac) return;
    var p = breathPhase(performance.now());
    binPanL.pan.setTargetAtTime(-1 + (p + 1) * 0.25, ac.currentTime, 0.05);
    binPanR.pan.setTargetAtTime(1 - (p + 1) * 0.25, ac.currentTime, 0.05);
    requestAnimationFrame(followBreath);
  }

  // ---- controls ----
  document.querySelectorAll('[data-brush]').forEach(function (b) {
    b.addEventListener('click', function () {
      brush = b.getAttribute('data-brush');
      document.querySelectorAll('[data-brush]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
    });
  });
  $('zen-sweep').addEventListener('click', function () { sweepStart = performance.now(); });
  $('zen-candle').addEventListener('click', function () { ensureAudio(); toggleCandle(); });
  $('zen-mic').addEventListener('click', function () { if (mic.on) stopMic(); else startMic(); });
  $('zen-bilateral').addEventListener('click', function () {
    if (!ensureAudio()) return;
    bilateralOn = !bilateralOn;
    setGain(binGain, bilateralOn ? 0.05 : 0);
    this.setAttribute('aria-pressed', bilateralOn ? 'true' : 'false');
    this.textContent = bilateralOn ? 'On' : 'Off';
    if (bilateralOn) followBreath();
  });
  $('zen-bowl').addEventListener('click', strikeBowl);
  $('zen-rain').addEventListener('input', function (e) { if (ensureAudio()) setGain(rainGain, (e.target.value / 100) * 0.18); });
  $('zen-river').addEventListener('input', function (e) { if (ensureAudio()) setGain(riverGain, (e.target.value / 100) * 0.22); });
  $('zen-drone').addEventListener('input', function (e) { if (ensureAudio()) setGain(droneGain, (e.target.value / 100) * 0.12); });

  resize();
  setCandleUI();
  requestAnimationFrame(drawFrame);
})();
