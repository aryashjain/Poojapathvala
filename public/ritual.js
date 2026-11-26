// Burn your worry: hold the flame to burn the card. Nothing is stored or sent.
// Canvas fire along the burn line, smoke and embers, plus a Web Audio crackle and chime. No audio files.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var burnBtn = $('rt-burn'), card = $('rt-card'), text = $('rt-text'), canvas = $('rt-fire');
  if (!burnBtn || !card || !canvas) return;
  var status = $('rt-status'), reveal = $('rt-reveal'), quote = $('rt-quote'), source = $('rt-source'), resetBtn = $('rt-reset');
  var QUOTES = [];
  try { QUOTES = JSON.parse(($('rt-data') || { textContent: '[]' }).textContent || '[]'); } catch (e) { QUOTES = []; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD_MS = reduce ? 900 : 2600;
  var g = canvas.getContext('2d');
  var embers = [], smoke = [];
  var progress = 0, holding = false, done = false, last = 0, intensity = 0, audio = null, crackle = null;
  var t = 0;

  function size() {
    var r = card.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ensureAudio() {
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
    } catch (e) { audio = null; }
  }
  function startCrackle() {
    if (!audio || crackle) return;
    var buf = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate), d = buf.getChannelData(0), i;
    for (i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.03 ? 1 : 0.12);
    var src = audio.createBufferSource(), filt = audio.createBiquadFilter(), gain = audio.createGain();
    src.buffer = buf; src.loop = true;
    filt.type = 'bandpass'; filt.frequency.value = 1400; filt.Q.value = 0.7;
    gain.gain.value = 0.14;
    src.connect(filt); filt.connect(gain); gain.connect(audio.destination);
    src.start();
    crackle = { src: src, gain: gain };
  }
  function stopCrackle() {
    if (!crackle || !audio) { crackle = null; return; }
    try { crackle.gain.gain.setTargetAtTime(0, audio.currentTime, 0.05); crackle.src.stop(audio.currentTime + 0.3); } catch (e) {}
    crackle = null;
  }
  function chime() {
    if (!audio) return;
    var now = audio.currentTime;
    [880, 1318].forEach(function (f, i) {
      var o = audio.createOscillator(), gn = audio.createGain();
      o.type = 'sine'; o.frequency.value = f;
      gn.gain.setValueAtTime(0.0001, now);
      gn.gain.exponentialRampToValueAtTime(0.18 / (i + 1), now + 0.02);
      gn.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      o.connect(gn); gn.connect(audio.destination);
      o.start(now); o.stop(now + 3.3);
    });
  }

  // Smooth, flickering value along x for the flame tongues.
  function flicker(x, time) {
    return 0.5 + 0.25 * Math.sin(x * 0.045 + time * 3.1) + 0.15 * Math.sin(x * 0.11 - time * 5.7) + 0.1 * Math.sin(x * 0.27 + time * 9.3);
  }

  // A real-looking flame band along the burn line: a dark char edge, an orange body, a yellow core and a blue base.
  function drawFlame(w, frontY, k, time) {
    if (k <= 0.01) return;
    var step = 5, x, h, top;
    // Char edge where the paper meets the fire.
    g.globalCompositeOperation = 'source-over';
    var char = g.createLinearGradient(0, frontY - 10, 0, frontY + 6);
    char.addColorStop(0, 'rgba(40,18,6,0)');
    char.addColorStop(1, 'rgba(40,18,6,' + (0.85 * k) + ')');
    g.fillStyle = char;
    g.fillRect(0, frontY - 10, w, 16);

    g.globalCompositeOperation = 'lighter';
    // Outer flame: long tongues in orange and red.
    var outer = g.createLinearGradient(0, frontY, 0, frontY - 150 * k);
    outer.addColorStop(0, 'rgba(255,140,40,' + (0.95 * k) + ')');
    outer.addColorStop(0.45, 'rgba(255,70,20,' + (0.55 * k) + ')');
    outer.addColorStop(1, 'rgba(120,20,0,0)');
    g.fillStyle = outer;
    g.beginPath();
    g.moveTo(0, frontY + 2);
    for (x = 0; x <= w + step; x += step) {
      h = 150 * k * Math.pow(flicker(x, time), 1.6) * (0.75 + 0.25 * Math.sin(x * 0.2 + time * 13));
      top = frontY - h;
      g.lineTo(x, top);
    }
    g.lineTo(w, frontY + 2);
    g.closePath();
    g.fill();

    // Inner body: brighter and shorter.
    var body = g.createLinearGradient(0, frontY, 0, frontY - 90 * k);
    body.addColorStop(0, 'rgba(255,230,120,' + (0.95 * k) + ')');
    body.addColorStop(0.6, 'rgba(255,150,40,' + (0.6 * k) + ')');
    body.addColorStop(1, 'rgba(255,80,20,0)');
    g.fillStyle = body;
    g.beginPath();
    g.moveTo(0, frontY + 2);
    for (x = 0; x <= w + step; x += step) {
      h = 90 * k * Math.pow(flicker(x + 40, time * 1.3), 1.8) * (0.7 + 0.3 * Math.sin(x * 0.31 - time * 17));
      g.lineTo(x, frontY - h);
    }
    g.lineTo(w, frontY + 2);
    g.closePath();
    g.fill();

    // Blue-white base where the fire is hottest.
    var base = g.createLinearGradient(0, frontY + 2, 0, frontY - 14 * k);
    base.addColorStop(0, 'rgba(200,230,255,' + (0.8 * k) + ')');
    base.addColorStop(1, 'rgba(255,240,180,0)');
    g.fillStyle = base;
    g.fillRect(0, frontY - 14 * k, w, 16 * k);
    g.globalCompositeOperation = 'source-over';
  }

  function spawnEmbers(w, frontY, n) {
    for (var i = 0; i < n; i++) {
      embers.push({
        x: Math.random() * w, y: frontY - Math.random() * 10,
        vx: (Math.random() - 0.5) * 1.2, vy: -(1.2 + Math.random() * 2.6),
        life: 1, decay: 0.012 + Math.random() * 0.016, r: 0.8 + Math.random() * 1.8,
      });
    }
  }
  function spawnSmoke(w, frontY, n) {
    for (var i = 0; i < n; i++) {
      smoke.push({
        x: Math.random() * w, y: frontY - 20, vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.4 + Math.random() * 0.6), life: 1, decay: 0.004 + Math.random() * 0.004,
        r: 10 + Math.random() * 14,
      });
    }
  }

  function setBurn(p) { card.style.setProperty('--burn', (p * 100).toFixed(2)); }

  function complete() {
    done = true; holding = false;
    stopCrackle();
    chime();
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    for (var i = 0; i < 3; i++) spawnEmbers(w, h * (0.2 + Math.random() * 0.7), 40);
    text.value = '';
    text.blur();
    text.disabled = true;
    burnBtn.hidden = true;
    resetBtn.hidden = false;
    var pick = QUOTES.length ? QUOTES[Math.floor(Math.random() * QUOTES.length)] : null;
    if (pick) {
      quote.textContent = pick.text;
      source.textContent = pick.source || '';
      reveal.hidden = false;
    }
    status.textContent = 'Burned. Your words are gone from this page.';
    // Show the positive card draw, then draw one straight away.
    var draw = document.querySelector('.hc');
    if (draw) draw.hidden = false;
    document.dispatchEvent(new Event('pp:burned'));
  }

  function frame(now) {
    var dt = Math.min(64, now - (last || now)) / 1000;
    last = now;
    t += dt;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    g.clearRect(0, 0, w, h);

    if (holding && !done) {
      progress = Math.min(1, progress + dt * 1000 / HOLD_MS);
      setBurn(progress);
      if (progress >= 1) complete();
    } else if (!done && progress > 0) {
      progress = Math.max(0, progress - dt * 0.35);
      setBurn(progress);
    }

    // Flame strength rises while held and dies down after release.
    var target = holding && !done ? 0.75 + 0.25 * progress : (progress > 0 && !done ? 0.35 : 0);
    intensity += (target - intensity) * Math.min(1, dt * 4);

    var frontY = h * (1 - progress);
    if (!reduce && intensity > 0.02) {
      drawFlame(w, frontY, intensity, t);
      if (holding && !done) spawnEmbers(w, frontY, 3);
      if (intensity > 0.3) spawnSmoke(w, frontY, 1);
    }

    g.globalCompositeOperation = 'lighter';
    embers = embers.filter(function (p) { return p.life > 0; });
    embers.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy *= 0.99; p.life -= p.decay;
      var a = Math.max(0, p.life);
      g.beginPath();
      g.fillStyle = 'rgba(255,' + Math.round(120 + 110 * a) + ',60,' + a + ')';
      g.arc(p.x, p.y, p.r * (0.5 + a), 0, Math.PI * 2);
      g.fill();
    });
    g.globalCompositeOperation = 'source-over';
    smoke = smoke.filter(function (p) { return p.life > 0; });
    smoke.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.r += 0.25; p.life -= p.decay;
      var a = Math.max(0, p.life) * 0.18;
      g.beginPath();
      g.fillStyle = 'rgba(70,60,55,' + a + ')';
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    });
    requestAnimationFrame(frame);
  }

  function startHold(e) {
    if (done || holding) return;
    if (!text.value.trim()) { status.textContent = 'Write what is on your mind first.'; return; }
    holding = true;
    status.textContent = 'Keep holding the flame…';
    ensureAudio();
    startCrackle();
    if (navigator.vibrate) navigator.vibrate(8);
    if (e && e.type !== 'click' && e.preventDefault) e.preventDefault();
  }
  function stopHold() {
    if (!holding) return;
    holding = false;
    stopCrackle();
    if (!done) status.textContent = progress > 0 ? 'Released. Hold again to finish the burn.' : 'Write what is on your mind.';
  }

  function reset() {
    done = false; progress = 0; intensity = 0; setBurn(0);
    text.disabled = false;
    text.value = '';
    burnBtn.hidden = false;
    resetBtn.hidden = true;
    reveal.hidden = true;
    var drawSec = document.querySelector('.hc');
    if (drawSec) drawSec.hidden = true;
    quote.textContent = ''; source.textContent = '';
    status.textContent = 'Write what is on your mind.';
    text.focus();
  }

  burnBtn.addEventListener('pointerdown', startHold);
  burnBtn.addEventListener('pointerup', stopHold);
  burnBtn.addEventListener('pointerleave', stopHold);
  burnBtn.addEventListener('pointercancel', stopHold);
  burnBtn.addEventListener('keydown', function (e) {
    if ((e.code === 'Space' || e.code === 'Enter') && !e.repeat) { e.preventDefault(); startHold(); }
  });
  burnBtn.addEventListener('keyup', function (e) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); stopHold(); }
  });
  burnBtn.addEventListener('blur', stopHold);
  resetBtn.addEventListener('click', reset);
  window.addEventListener('resize', size);

  size();
  setBurn(0);
  requestAnimationFrame(frame);
})();
