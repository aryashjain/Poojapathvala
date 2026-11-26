// Mantra counter: a 108-bead mala, a timed chant mode, a focus mode and a daily count saved on this device.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var dataEl = $('mc-data');
  var bead = $('mc-bead');
  if (!bead || !dataEl) return;

  var LIB = [];
  try { LIB = JSON.parse(dataEl.textContent || '[]'); } catch (e) { LIB = []; }

  var BEADS = 108;
  var KEY = 'pp-mala-days';
  var app = $('mc-app');
  var sel = $('mc-select'), text = $('mc-text'), secs = $('mc-secs'), total = $('mc-total'), sound = $('mc-sound');
  var countEl = $('mc-count'), ofEl = $('mc-of'), beadsEl = $('mc-beads'), ringEl = $('mc-ring'), clockEl = $('mc-clock');
  var autoBtn = $('mc-auto'), resetBtn = $('mc-reset'), focusBtn = $('mc-focus-btn'), msg = $('mc-msg'), shim = $('mc-shimmer');
  var todayEl = $('mc-today'), streakEl = $('mc-streak'), weekEl = $('mc-week'), timerState = $('mc-timer-state');

  var count = 0, timer = null, running = false, ctx = null;

  function pad(n) { return String(n).padStart(2, '0'); }
  function dayKey(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }

  function loadDays() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; }
  }
  function addToday() {
    var days = loadDays(), k = dayKey();
    days[k] = (days[k] || 0) + 1;
    try { localStorage.setItem(KEY, JSON.stringify(days)); } catch (e) {}
    return days;
  }
  function streak(days) {
    var n = 0, d = new Date();
    if (!days[dayKey(d)]) d.setDate(d.getDate() - 1);
    while (days[dayKey(d)] > 0) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  var WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  function renderWeek(days) {
    if (!weekEl) return;
    var cells = [], max = 1, d, k, i;
    for (i = 6; i >= 0; i--) {
      d = new Date();
      d.setDate(d.getDate() - i);
      k = dayKey(d);
      cells.push({ label: WEEKDAYS[d.getDay()], value: days[k] || 0, today: i === 0 });
      if ((days[k] || 0) > max) max = days[k];
    }
    weekEl.innerHTML = '';
    cells.forEach(function (c) {
      var col = document.createElement('div');
      col.className = 'mc-week-col' + (c.today ? ' is-today' : '');
      var bar = document.createElement('div');
      bar.className = 'mc-week-bar';
      bar.style.height = Math.max(4, Math.round((c.value / max) * 100)) + '%';
      bar.title = c.value + ' japa';
      var lab = document.createElement('span');
      lab.textContent = c.label;
      var num = document.createElement('small');
      num.textContent = c.value ? String(c.value) : '';
      col.appendChild(num);
      col.appendChild(bar);
      col.appendChild(lab);
      weekEl.appendChild(col);
    });
  }
  function renderStats() {
    var days = loadDays();
    todayEl.textContent = String(days[dayKey()] || 0);
    streakEl.textContent = String(streak(days));
    renderWeek(days);
  }

  for (var i = 0; i < BEADS; i++) {
    var dot = document.createElement('span');
    dot.className = 'mc-dot';
    beadsEl.appendChild(dot);
  }

  function chants() { return Math.max(0, parseInt(total.value, 10) || 0); }
  function clampSecs() { return Math.min(120, Math.max(1, parseFloat(secs.value) || 6)); }

  function renderCount() {
    countEl.textContent = String(count);
    var t = chants();
    ofEl.textContent = t ? 'of ' + t : 'chants';
    var full = count === 0 ? 0 : (count % BEADS === 0 ? BEADS : count % BEADS);
    var dots = beadsEl.children;
    for (var j = 0; j < dots.length; j++) dots[j].classList.toggle('on', j < full);
    var malas = Math.floor(count / BEADS);
    $('mc-malas').textContent = malas ? malas + (malas === 1 ? ' mala' : ' malas') + ' completed' : 'Your first mala starts here';
  }

  function ensureCtx() {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }
  // Synthesised bell: two sine partials with a long decay. No audio files.
  function bell() {
    if (!sound.checked) return;
    ensureCtx();
    if (!ctx) return;
    var now = ctx.currentTime;
    [432, 648].forEach(function (f, i) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.25 / (i + 1), now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 2.6);
    });
  }

  function pulse() {
    bead.classList.remove('mc-pulse');
    void bead.offsetWidth;
    bead.classList.add('mc-pulse');
  }

  function tap() {
    count++;
    addToday();
    if (navigator.vibrate) navigator.vibrate(12);
    var t = chants();
    if (count % BEADS === 0) { msg.textContent = 'Mala complete: 108 beads.'; bell(); }
    if (t && count >= t) {
      stopAuto();
      msg.textContent = 'Target reached: ' + t + ' chants.';
      bell();
    }
    renderCount();
    renderStats();
    pulse();
  }

  function runRing() {
    ringEl.style.animation = 'none';
    void ringEl.getBoundingClientRect();
    ringEl.style.animation = 'mc-run ' + clampSecs() + 's linear forwards';
  }

  function startAuto() {
    running = true;
    autoBtn.textContent = 'Pause timer';
    autoBtn.setAttribute('aria-pressed', 'true');
    timerState.textContent = 'Timer running: one chant every ' + clampSecs() + ' seconds';
    msg.textContent = '';
    runRing();
    ensureCtx();
    timer = setInterval(function () {
      tap();
      if (running) runRing();
    }, clampSecs() * 1000);
  }

  function stopAuto() {
    clearInterval(timer);
    timer = null;
    running = false;
    autoBtn.textContent = 'Start timer';
    autoBtn.setAttribute('aria-pressed', 'false');
    timerState.textContent = 'Timer paused';
    ringEl.style.animation = 'none';
  }

  function toggleFocus() {
    var on = !app.classList.contains('mc-focus');
    app.classList.toggle('mc-focus', on);
    focusBtn.textContent = on ? 'Exit focus mode' : 'Focus mode';
    focusBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function showText() {
    var v = text.value.trim();
    shim.textContent = v || 'Write or choose a mantra above.';
    shim.classList.toggle('mc-empty', !v);
  }

  function tick() {
    clockEl.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  sel.addEventListener('change', function () {
    var idx = parseInt(sel.value, 10);
    if (!isNaN(idx) && LIB[idx]) text.value = LIB[idx].body;
    showText();
  });
  text.addEventListener('input', showText);
  total.addEventListener('input', renderCount);
  secs.addEventListener('change', function () { if (running) runRing(); });
  bead.addEventListener('click', function () { ensureCtx(); tap(); });
  autoBtn.addEventListener('click', function () { if (running) stopAuto(); else startAuto(); });
  focusBtn.addEventListener('click', toggleFocus);
  resetBtn.addEventListener('click', function () {
    stopAuto();
    count = 0;
    msg.textContent = 'Counter reset. Today’s total is kept.';
    renderCount();
  });
  document.addEventListener('keydown', function (e) {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName || '')) return;
    if (e.code === 'Space' && !/BUTTON/.test(e.target.tagName || '')) { e.preventDefault(); ensureCtx(); tap(); return; }
    if (e.key === 't' || e.key === 'T') { if (running) stopAuto(); else startAuto(); }
    if (e.key === 'r' || e.key === 'R') { resetBtn.click(); }
    if (e.key === 'f' || e.key === 'F') { toggleFocus(); }
    if (e.key === 'Escape' && app.classList.contains('mc-focus')) { toggleFocus(); }
  });

  tick();
  setInterval(tick, 1000);
  showText();
  renderCount();
  renderStats();
  timerState.textContent = 'Timer paused';
})();
