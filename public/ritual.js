// Burn your worry: hold the flame to burn the card. Nothing is stored or sent. Canvas fire and a Web Audio crackle, no audio files.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var burnBtn = $('rt-burn'), card = $('rt-card'), text = $('rt-text'), canvas = $('rt-fire');
  if (!burnBtn || !card || !canvas) return;
  var status = $('rt-status'), reveal = $('rt-reveal'), quote = $('rt-quote'), source = $('rt-source'), resetBtn = $('rt-reset');
  var list = [];
  try { list = JSON.parse(($('rt-data') || { textContent: '[]' }).textContent || '[]'); } catch (e) { list = []; }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOLD_MS = reduce ? 900 : 2600;
  var ctx2d = canvas.getContext('2d');
  var particles = [];
  var progress = 0, holding = false, done = false, last = 0, audio = null, noiseGain = null;

  function size() {
    var r = card.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
    canvas.style.width = r.width + 'px';
    canvas.style.height = r.height + 'px';
    ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function ensureAudio() {
    try {
      if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
    } catch (e) { audio = null; }
  }
  // Crackle: looped noise through a band-pass filter, on only while the flame is held.
  function startCrackle() {
    if (!audio) return;
    if (noiseGain) return;
    var buf = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate), d = buf.getChannelData(0), i;
    for (i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.02 ? 1 : 0.15);
    var src = audio.createBufferSource(), filt = audio.createBiquadFilter(), g = audio.createGain();
    src.buffer = buf; src.loop = true;
    filt.type = 'bandpass'; filt.frequency.value = 1400; filt.Q.value = 0.7;
    g.gain.value = 0.12;
    src.connect(filt); filt.connect(g); g.connect(audio.destination);
    src.start();
    noiseGain = { src: src, g: g };
  }
  function stopCrackle() {
    if (!noiseGain || !audio) { noiseGain = null; return; }
    try { noiseGain.g.gain.setTargetAtTime(0, audio.currentTime, 0.05); noiseGain.src.stop(audio.currentTime + 0.3); } catch (e) {}
    noiseGain = null;
  }
  // Temple chime: two bell partials with a long decay.
  function chime() {
    if (!audio) return;
    var now = audio.currentTime;
    [880, 1318].forEach(function (f, i) {
      var o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.18 / (i + 1), now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      o.connect(g); g.connect(audio.destination);
      o.start(now); o.stop(now + 3.3);
    });
  }

  function spawn(x, y, n, power) {
    for (var i = 0; i < n; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 18, y: y,
        vx: (Math.random() - 0.5) * (power ? 2.4 : 0.8),
        vy: -(0.6 + Math.random() * (power ? 3 : 1.6)),
        life: 1, decay: 0.012 + Math.random() * 0.018,
        r: 1 + Math.random() * 2.6,
        hue: 25 + Math.random() * 30,
      });
    }
  }

  function setBurn(p) { card.style.setProperty('--burn', (p * 100).toFixed(2)); }

  function frame(now) {
    var dt = Math.min(64, now - (last || now)) / 1000;
    last = now;
    var w = canvas.clientWidth, h = canvas.clientHeight;
    ctx2d.clearRect(0, 0, w, h);

    if (holding && !done) {
      progress = Math.min(1, progress + dt * 1000 / HOLD_MS);
      setBurn(progress);
      var frontY = h * (1 - progress);
      if (!reduce) spawn(w * (0.15 + Math.random() * 0.7), Math.min(h, frontY + 6), 6, false);
      if (progress >= 1) complete();
    } else if (!done && progress > 0) {
      progress = Math.max(0, progress - dt * 0.35);
      setBurn(progress);
    }

    ctx2d.globalCompositeOperation = 'lighter';
    particles = particles.filter(function (p) { return p.life > 0; });
    particles.forEach(function (p) {
      p.x += p.vx; p.y += p.vy; p.vy *= 0.99; p.life -= p.decay;
      var a = Math.max(0, p.life);
      ctx2d.beginPath();
      ctx2d.fillStyle = 'hsla(' + p.hue + ', 100%, ' + (55 + 25 * a) + '%, ' + a + ')';
      ctx2d.arc(p.x, p.y, p.r * (0.5 + a), 0, Math.PI * 2);
      ctx2d.fill();
    });
    ctx2d.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }

  function startHold(e) {
    if (done) return;
    if (!text.value.trim()) { status.textContent = 'Write what is on your mind first.'; return; }
    if (holding) return;
    holding = true;
    status.textContent = 'Keep holding the flame…';
    ensureAudio();
    startCrackle();
    if (navigator.vibrate) navigator.vibrate(8);
    if (e && e.preventDefault && e.type !== 'click') e.preventDefault();
  }
  function stopHold() {
    if (!holding) return;
    holding = false;
    stopCrackle();
    if (!done) status.textContent = progress > 0 ? 'Released. Hold again to finish the burn.' : '';
  }

  var QUOTES = JSON.parse(($('rt-data') || { textContent: '[]' }).textContent || '[]');
  function complete() {
    done = true; holding = false;
    stopCrackle();
    chime();
    if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
    var w = canvas.clientWidth, h = canvas.clientHeight;
    if (!reduce) for (var i = 0; i < 3; i++) spawn(w * Math.random(), h * (0.2 + Math.random() * 0.7), 40, true);
    text.value = '';
    text.blur();
    text.setAttribute('aria-hidden', 'true');
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
  }

  function reset() {
    done = false; progress = 0; setBurn(0);
    text.disabled = false;
    text.removeAttribute('aria-hidden');
    text.value = '';
    burnBtn.hidden = false;
    resetBtn.hidden = true;
    reveal.hidden = true;
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
