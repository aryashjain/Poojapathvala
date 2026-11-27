// Pranayama pacer: a 1 : 4 : 2 ratio (inhale : hold : exhale) from one base count, with a bowl cue for each phase.
// Everything is synthesised in the browser. Progress is kept on this device only.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var circle = $('pr-circle'), label = $('pr-phase'), count = $('pr-count'), round = $('pr-round');
  var bar = $('pr-bar'), startBtn = $('pr-start'), pauseBtn = $('pr-pause'), stopBtn = $('pr-stop');
  var baseButtons = document.querySelectorAll('[data-base]');
  var roundsInput = $('pr-rounds'), preview = $('pr-preview'), estimate = $('pr-estimate');
  if (!circle || !startBtn) return;

  var KEY = 'pp-pranayama';
  var MAX_BASE = 8;
  var state = { base: 4, rounds: 4, log: [], lastBumpDate: null };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved) state = Object.assign(state, saved); } catch (e) {}

  var running = false, paused = false, phaseIdx = 0, roundNo = 1, left = 0, last = 0, timer = null;
  var completedRounds = 0, startedAt = null, totalMs = 0, elapsedMs = 0, wake = null;
  var ac = null;

  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function phases() {
    var b = state.base;
    return [
      { name: 'Inhale · Puraka', secs: b, cue: 'in', buzz: [60] },
      { name: 'Hold · Kumbhaka', secs: 4 * b, cue: 'hold', buzz: [120, 60, 120] },
      { name: 'Exhale · Rechaka', secs: 2 * b, cue: 'out', buzz: [30, 30, 30] },
    ];
  }
  function cycleSecs() { return state.base * 7; }
  function totalSecs() { return cycleSecs() * state.rounds; }

  function ensureAudio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; } }
    if (ac.state === 'suspended') ac.resume();
    return true;
  }
  // Each cue is a different bowl: a bright one to breathe in, a deep one to hold, a warm one to breathe out.
  var BOWLS = {
    in: { freqs: [528, 1056], dur: 2.6, gain: 0.16 },
    hold: { freqs: [196, 294], dur: 4.2, gain: 0.16 },
    out: { freqs: [324, 648, 972], dur: 3.2, gain: 0.13 },
    end: { freqs: [396, 792], dur: 4.5, gain: 0.16 },
  };
  function bowl(kind) {
    if (!ensureAudio()) return;
    var cfg = BOWLS[kind], now = ac.currentTime;
    cfg.freqs.forEach(function (f, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(cfg.gain / (i + 1), now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + cfg.dur);
      o.connect(g); g.connect(ac.destination);
      o.start(now); o.stop(now + cfg.dur + 0.1);
    });
  }
  function buzz(p) { if (navigator.vibrate) navigator.vibrate(p); }
  function fmt(ms) { return Math.max(0, Math.ceil(ms / 1000)); }

  function setCircle(cue, secs) {
    circle.style.transition = 'none';
    if (cue === 'in') circle.style.transform = 'scale(1)';
    if (cue === 'hold') circle.style.transform = 'scale(1.5)';
    if (cue === 'out') circle.style.transform = 'scale(1.5)';
    void circle.offsetWidth;
    if (cue === 'in') { circle.style.transition = 'transform ' + secs + 's ease-in-out'; circle.style.transform = 'scale(1.5)'; }
    if (cue === 'out') { circle.style.transition = 'transform ' + secs + 's ease-in-out'; circle.style.transform = 'scale(1)'; }
    circle.setAttribute('data-phase', cue);
  }
  function enterPhase() {
    var p = phases()[phaseIdx];
    left = p.secs * 1000;
    label.textContent = p.name;
    round.textContent = 'Round ' + roundNo + ' of ' + state.rounds;
    setCircle(p.cue, p.secs);
    bowl(p.cue);
    buzz(p.buzz);
  }
  function setBar() {
    var pct = totalMs ? Math.min(100, (elapsedMs / totalMs) * 100) : 0;
    bar.style.width = pct.toFixed(1) + '%';
  }
  function tick(now) {
    if (!running) return;
    var dt = now - last; last = now;
    if (!paused) {
      left -= dt; elapsedMs += dt;
      count.textContent = fmt(left);
      setBar();
      if (left <= 0) advance();
    }
  }
  function advance() {
    phaseIdx++;
    if (phaseIdx >= 3) {
      phaseIdx = 0;
      completedRounds++;
      if (roundNo >= state.rounds) { finish(true); return; }
      roundNo++;
    }
    enterPhase();
  }
  function wakeLock(on) {
    try {
      if (on && navigator.wakeLock && !wake) navigator.wakeLock.request('screen').then(function (w) { wake = w; }, function () {});
      if (!on && wake) { wake.release(); wake = null; }
    } catch (e) {}
  }
  function start() {
    if (running) return;
    ensureAudio();
    running = true; paused = false;
    phaseIdx = 0; roundNo = 1; completedRounds = 0; elapsedMs = 0;
    totalMs = totalSecs() * 1000;
    startedAt = new Date().toISOString().slice(0, 10);
    startBtn.hidden = true; pauseBtn.hidden = false; stopBtn.hidden = false;
    pauseBtn.textContent = 'Pause';
    lockControls(true);
    wakeLock(true);
    enterPhase();
    last = performance.now();
    timer = setInterval(function () { tick(performance.now()); }, 100);
  }
  function finish(done) {
    if (!running) return;
    running = false;
    clearInterval(timer);
    wakeLock(false);
    if (done) bowl('end');
    buzz(done ? [200, 100, 200] : [40]);
    state.log.push({ date: startedAt, base: state.base, rounds: state.rounds, done: completedRounds, completed: !!done, minutes: Math.round(elapsedMs / 60000 * 10) / 10 });
    if (state.log.length > 200) state.log = state.log.slice(-200);
    save();
    circle.style.transition = 'transform 1.2s ease-in-out';
    circle.style.transform = 'scale(1)';
    circle.setAttribute('data-phase', 'rest');
    label.textContent = done ? 'Session complete' : 'Session stopped';
    count.textContent = '—';
    round.textContent = completedRounds + ' of ' + state.rounds + ' rounds';
    bar.style.width = done ? '100%' : bar.style.width;
    startBtn.hidden = false; startBtn.textContent = 'Start again';
    pauseBtn.hidden = true; stopBtn.hidden = true;
    lockControls(false);
    renderProgress();
  }
  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if (paused) circle.style.transition = 'none';
    else { last = performance.now(); }
    label.textContent = paused ? 'Paused — breathe naturally' : phases()[phaseIdx].name;
  }
  function lockControls(lock) {
    baseButtons.forEach(function (b) { b.disabled = lock; });
    roundsInput.disabled = lock;
  }

  // ---- setup ----
  function renderSetup() {
    baseButtons.forEach(function (b) {
      b.setAttribute('aria-pressed', parseInt(b.getAttribute('data-base'), 10) === state.base ? 'true' : 'false');
    });
    roundsInput.value = state.rounds;
    var b = state.base;
    preview.textContent = 'Inhale ' + b + ' s · hold ' + (4 * b) + ' s · exhale ' + (2 * b) + ' s';
    var mins = totalSecs() / 60;
    estimate.textContent = 'About ' + (Math.round(mins * 10) / 10) + ' minutes for ' + state.rounds + ' rounds';
  }
  baseButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.base = parseInt(btn.getAttribute('data-base'), 10);
      save(); renderSetup();
    });
  });
  roundsInput.addEventListener('input', function () {
    var n = parseInt(roundsInput.value, 10);
    if (n >= 1 && n <= 12) { state.rounds = n; save(); renderSetup(); }
  });

  // ---- progress ----
  function weekEntries() {
    var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 6);
    var from = weekAgo.toISOString().slice(0, 10);
    return state.log.filter(function (e) { return e.date >= from; });
  }
  function suggestion() {
    var week = weekEntries().filter(function (e) { return e.completed; });
    var today = new Date().toISOString().slice(0, 10);
    var bumpedThisWeek = state.lastBumpDate && (new Date(today) - new Date(state.lastBumpDate)) / 86400000 < 7;
    if (state.base >= MAX_BASE) return { base: state.base, text: 'You are at the top of the suggested range. Keep practising at this count.' };
    if (week.length < 3) return { base: state.base, text: 'Complete at least 3 sessions this week before the base count can rise.' };
    if (bumpedThisWeek) return { base: state.base, text: 'The base count rose recently. Keep it steady for a week.' };
    return { base: state.base + 1, text: 'You have completed ' + week.length + ' sessions this week. You can raise the base count by one.' };
  }
  function renderProgress() {
    var week = weekEntries();
    var done = week.filter(function (e) { return e.completed; });
    var mins = done.reduce(function (s, e) { return s + e.minutes; }, 0);
    $('pr-week-sessions').textContent = String(done.length);
    $('pr-week-minutes').textContent = String(Math.round(mins));
    var sug = suggestion();
    $('pr-suggest-text').textContent = sug.text;
    var accept = $('pr-accept');
    accept.hidden = sug.base === state.base;
    accept.setAttribute('data-next', sug.base);
    var list = $('pr-log');
    list.textContent = '';
    state.log.slice(-7).reverse().forEach(function (e) {
      var li = document.createElement('li');
      li.textContent = e.date + ' · base ' + e.base + ' · ' + e.done + '/' + e.rounds + ' rounds' + (e.completed ? '' : ' (stopped)');
      list.appendChild(li);
    });
    if (!state.log.length) { var empty = document.createElement('li'); empty.textContent = 'No sessions yet. Your first session will appear here.'; list.appendChild(empty); }
  }
  $('pr-accept').addEventListener('click', function () {
    var next = parseInt($('pr-accept').getAttribute('data-next'), 10);
    if (next > state.base && next <= MAX_BASE) {
      state.base = next;
      state.lastBumpDate = new Date().toISOString().slice(0, 10);
      save(); renderSetup(); renderProgress();
    }
  });

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', togglePause);
  stopBtn.addEventListener('click', function () { finish(false); });

  renderSetup();
  renderProgress();
})();
