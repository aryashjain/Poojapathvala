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

  // Log bed: two split logs with glowing cracks, lit from above by the fire.
  function drawLogs(w, h, k) {
    if (k <= 0.01) return;
    g.globalCompositeOperation = 'source-over';
    var logs = [
      { x: w * 0.08, y: h - 22, len: w * 0.84, r: 12, tilt: -4 },
      { x: w * 0.18, y: h - 8, len: w * 0.66, r: 10, tilt: 3 },
    ];
    logs.forEach(function (lg) {
      g.save();
      g.translate(lg.x, lg.y);
      g.rotate(lg.tilt * Math.PI / 180);
      g.beginPath();
      g.roundRect ? g.roundRect(0, -lg.r, lg.len, lg.r * 2, lg.r) : g.rect(0, -lg.r, lg.len, lg.r * 2);
      var wood = g.createLinearGradient(0, -lg.r, 0, lg.r);
      wood.addColorStop(0, 'rgba(120,62,26,1)');
      wood.addColorStop(0.5, 'rgba(70,32,12,1)');
      wood.addColorStop(1, 'rgba(34,14,4,1)');
      g.fillStyle = wood;
      g.fill();
      // Glowing cracks where the wood is burning.
      g.globalCompositeOperation = 'lighter';
      for (var c = 0; c < 6; c++) {
        var cx = lg.len * (0.1 + c * 0.15) + Math.sin(t * 2 + c) * 3;
        g.fillStyle = 'rgba(255,' + Math.round(110 + 60 * Math.sin(t * 7 + c)) + ',30,' + (0.55 * k) + ')';
        g.fillRect(cx, -lg.r * 0.4, 6 + (c % 3) * 3, lg.r * 0.8);
      }
      g.globalCompositeOperation = 'source-over';
      g.restore();
    });
    // Glow spilling onto the logs.
    g.globalCompositeOperation = 'lighter';
    var glow = g.createRadialGradient(w / 2, h, 10, w / 2, h, w * 0.6);
    glow.addColorStop(0, 'rgba(255,120,30,' + (0.45 * k) + ')');
    glow.addColorStop(1, 'rgba(255,60,0,0)');
    g.fillStyle = glow;
    g.fillRect(0, h - w * 0.6, w, w * 0.6);
    g.globalCompositeOperation = 'source-over';
  }

  // Big flames: several layers of tongues that lick up from the burn line and flicker fast.
  function drawFlame(w, frontY, k, time) {
    if (k <= 0.01) return;
    var step = 3, x, h;
    var layers = [
      { amp: 230, pow: 1.5, speed: 1.0, phase: 0, c0: 'rgba(255,190,60,', c1: 'rgba(255,60,10,', c2: 'rgba(120,10,0,', a: 0.95 },
      { amp: 160, pow: 1.7, speed: 1.4, phase: 40, c0: 'rgba(255,230,120,', c1: 'rgba(255,120,30,', c2: 'rgba(200,40,0,', a: 0.8 },
      { amp: 90, pow: 1.9, speed: 2.1, phase: 90, c0: 'rgba(255,255,220,', c1: 'rgba(255,215,90,', c2: 'rgba(255,120,40,', a: 0.7 },
    ];
    g.globalCompositeOperation = 'lighter';
    layers.forEach(function (ly) {
      var top = frontY - ly.amp * k;
      var grad = g.createLinearGradient(0, frontY, 0, top);
      grad.addColorStop(0, ly.c0 + (ly.a * k) + ')');
      grad.addColorStop(0.35, ly.c1 + (0.7 * ly.a * k) + ')');
      grad.addColorStop(1, ly.c2 + '0)');
      g.fillStyle = grad;
      g.shadowColor = 'rgba(255,110,30,' + (0.8 * k) + ')';
      g.shadowBlur = 18;
      g.beginPath();
      g.moveTo(0, frontY + 4);
      for (x = 0; x <= w + step; x += step) {
        var n = flicker(x + ly.phase, time * ly.speed);
        var lick = Math.sin(x * 0.09 - time * (9 + ly.speed * 4) + ly.phase) * 0.18;
        h = ly.amp * k * Math.pow(Math.max(0.05, n + lick), ly.pow);
        g.lineTo(x, frontY - h);
      }
      g.lineTo(w, frontY + 4);
      g.closePath();
      g.fill();
    });
    g.shadowBlur = 0;
    // Hot base where the paper meets the fire.
    var base = g.createLinearGradient(0, frontY + 6, 0, frontY - 26 * k);
    base.addColorStop(0, 'rgba(210,235,255,' + (0.9 * k) + ')');
    base.addColorStop(1, 'rgba(255,240,170,0)');
    g.fillStyle = base;
    g.fillRect(0, frontY - 26 * k, w, 32 * k);
    // Char edge that eats into the card.
    g.globalCompositeOperation = 'source-over';
    var char = g.createLinearGradient(0, frontY - 14, 0, frontY + 6);
    char.addColorStop(0, 'rgba(30,12,4,0)');
    char.addColorStop(1, 'rgba(30,12,4,' + (0.9 * k) + ')');
    g.fillStyle = char;
    g.fillRect(0, frontY - 14, w, 20);
  }

  var ash = [];
  function spawnAsh(w, frontY, n) {
    for (var i = 0; i < n; i++) {
      ash.push({ x: Math.random() * w, y: frontY - Math.random() * 16, vx: (Math.random() - 0.5) * 0.6, vy: -(0.3 + Math.random() * 0.9), life: 1, decay: 0.006 + Math.random() * 0.006, r: 0.8 + Math.random() * 1.6 });
    }
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
    // The positive card pops up now.
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
    drawLogs(w, h, Math.max(intensity, progress > 0 ? 0.5 : 0));
    if (!reduce && intensity > 0.02) {
      drawFlame(w, frontY, intensity, t);
      if (progress > 0 && !done) spawnAsh(w, frontY, 2);
      if (holding && !done) spawnEmbers(w, frontY, 3);
      if (intensity > 0.3) spawnSmoke(w, frontY, 1);
    }

    g.globalCompositeOperation = 'source-over';
    ash = ash.filter(function (p) { return p.life > 0; });
    ash.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.life -= p.decay;
      g.beginPath();
      g.fillStyle = 'rgba(150,140,130,' + Math.max(0, p.life) * 0.7 + ')';
      g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      g.fill();
    });
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
