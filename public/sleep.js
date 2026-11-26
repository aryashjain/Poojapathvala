// Bedtime wind-down: a 4-7-8 breathing guide, a sleep timer with a fade, night sounds and a checklist. No audio files.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var circle = $('sleep-circle'), cue = $('sleep-cue'), breathBtn = $('sleep-breath-btn');
  var clock = $('sleep-clock'), timerBtn = $('sleep-timer-btn'), soundSel = $('sleep-sound');
  if (!circle || !timerBtn) return;

  // ---- breathing: 4 in, 7 hold, 8 out ----
  var PHASES = [['Breathe in for 4', 4, 'in'], ['Hold for 7', 7, 'hold'], ['Breathe out for 8', 8, 'out']];
  var breathing = false, phaseIdx = 0, phaseTimer = null;
  function runPhase() {
    var p = PHASES[phaseIdx];
    cue.textContent = p[0];
    circle.setAttribute('data-phase', p[2]);
    circle.style.transitionDuration = p[1] + 's';
    phaseTimer = setTimeout(function () {
      phaseIdx = (phaseIdx + 1) % PHASES.length;
      runPhase();
    }, p[1] * 1000);
  }
  breathBtn.addEventListener('click', function () {
    breathing = !breathing;
    breathBtn.setAttribute('aria-pressed', breathing ? 'true' : 'false');
    breathBtn.textContent = breathing ? 'Stop breathing' : 'Start breathing';
    clearTimeout(phaseTimer);
    if (breathing) { phaseIdx = 0; runPhase(); }
    else { circle.setAttribute('data-phase', 'rest'); circle.style.transitionDuration = '1s'; cue.textContent = 'Breathe in for 4'; }
  });

  // ---- timer ----
  var minutes = 20, remaining = 0, tick = null, ac = null, bed = null, bedGain = null;
  function fmt(s) { var m = Math.floor(s / 60), r = s % 60; return (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r; }
  document.querySelectorAll('[data-min]').forEach(function (b) {
    b.addEventListener('click', function () {
      minutes = parseInt(b.getAttribute('data-min'), 10);
      document.querySelectorAll('[data-min]').forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      if (!tick) clock.textContent = fmt(minutes * 60);
    });
  });
  function ensureAudio() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return true; }
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    return true;
  }
  function startSound() {
    if (soundSel.value === 'none' || !ensureAudio()) return;
    var b = ac.createBuffer(1, ac.sampleRate * 4, ac.sampleRate), d = b.getChannelData(0), i;
    for (i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    bed = ac.createBufferSource(); bed.buffer = b; bed.loop = true;
    var f = ac.createBiquadFilter();
    if (soundSel.value === 'rain') { f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 0.4; }
    else { f.type = 'lowpass'; f.frequency.value = 600; f.Q.value = 0.6; }
    bedGain = ac.createGain();
    bedGain.gain.setValueAtTime(0.0001, ac.currentTime);
    bedGain.gain.exponentialRampToValueAtTime(soundSel.value === 'rain' ? 0.12 : 0.18, ac.currentTime + 3);
    bed.connect(f); f.connect(bedGain); bedGain.connect(ac.destination); bed.start();
  }
  function fadeSound() {
    if (!bedGain || !ac) return;
    bedGain.gain.setTargetAtTime(0.0001, ac.currentTime, 6);
  }
  function stopSound() {
    if (bed) { try { bed.stop(); } catch (e) {} bed = null; }
  }
  function chime() {
    if (!ensureAudio()) return;
    var now = ac.currentTime;
    [528, 792].forEach(function (f, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.16 / (i + 1), now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 4);
      o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 4.1);
    });
  }
  function stopTimer(done) {
    clearInterval(tick); tick = null;
    stopSound();
    timerBtn.textContent = 'Start timer';
    timerBtn.setAttribute('aria-pressed', 'false');
    clock.textContent = done ? 'Goodnight' : fmt(minutes * 60);
    if (done) chime();
  }
  timerBtn.addEventListener('click', function () {
    if (tick) { stopTimer(false); return; }
    remaining = minutes * 60;
    clock.textContent = fmt(remaining);
    timerBtn.textContent = 'Stop timer';
    timerBtn.setAttribute('aria-pressed', 'true');
    startSound();
    tick = setInterval(function () {
      remaining -= 1;
      if (remaining === 60) fadeSound();
      if (remaining <= 0) { stopTimer(true); return; }
      clock.textContent = fmt(remaining);
    }, 1000);
  });

  // ---- checklist, kept on this device ----
  var KEY = 'pp-sleep-checks';
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { saved = {}; }
  document.querySelectorAll('[data-check]').forEach(function (box) {
    var k = box.getAttribute('data-check');
    box.checked = !!saved[k];
    box.addEventListener('change', function () {
      saved[k] = box.checked;
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {}
    });
  });
})();
