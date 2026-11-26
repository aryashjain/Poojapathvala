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

  // A session is live once the first chant is counted or the timer starts: the "Now chanting" band shows the mantra.
  function setLive(on) {
    app.classList.toggle('mc-live', on);
    $('mc-focus-band').hidden = !on;
  }
  function updateFocusText() {
    var v = text.value.trim();
    $('mc-focus-text').textContent = v || 'Write or choose a mantra to begin.';
  }
  function endSession() {
    stopAuto();
    count = 0;
    renderCount();
    setLive(false);
    msg.textContent = 'Session ended. Today\u2019s total is kept.';
  }
  function renderCount() {
    countEl.textContent = String(count);
    $('mc-focus-count').textContent = String(count);
    if (count === 0 && !running) setLive(false);
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
    setLive(true);
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
    setLive(true);
    $('mc-focus-timer').textContent = 'Timer running';
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
    $('mc-focus-timer').textContent = 'Timer paused';
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
    updateFocusText();
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
  $('mc-focus-end').addEventListener('click', endSession);
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

  // Speak your mantra: record on a chosen microphone, count the repeats by silence gaps,
  // then play the first repeat back that many times. Audio is decoded and played in the browser only.
  var micSel = $('mc-mic'), recBtn = $('mc-rec'), recState = $('mc-rec-state');
  var heardEl = $('mc-heard'), playBtn = $('mc-play'), speakMsg = $('mc-speak-msg');
  var CHANT_GAP = 1.0, MAX_REPEATS = 1000, MAX_REC_MS = 60000;
  var FRAME = 0.02, PAUSE_FRAMES = 18, MIN_FRAMES = 13; // 20 ms frames; 0.36 s pause ends a repeat; repeats under 0.26 s are ignored
  var clip = null, recorder = null, recStream = null, recChunks = [], recStarted = 0, recTimer = null, recTicker = null;
  var playSources = [], playEndTimer = null;

  function fmtSecs(s) { return (Math.round(s * 10) / 10).toFixed(1) + ' s'; }
  function fmtDur(s) { return s < 60 ? Math.max(1, Math.round(s)) + ' s' : (Math.round(s / 6) / 10).toFixed(1) + ' min'; }
  function setRecording(on) {
    recBtn.classList.toggle('is-recording', on);
    recBtn.textContent = on ? 'Stop and count' : 'Start recording';
    recBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function loadMics() {
    if (!micSel || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices().then(function (list) {
      var keep = micSel.value;
      micSel.innerHTML = '';
      var def = document.createElement('option');
      def.value = ''; def.textContent = 'Default microphone';
      micSel.appendChild(def);
      list.filter(function (d) { return d.kind === 'audioinput'; }).forEach(function (d, i) {
        var o = document.createElement('option');
        o.value = d.deviceId;
        o.textContent = d.label || ('Microphone ' + (i + 1));
        micSel.appendChild(o);
      });
      micSel.value = keep;
      if (micSel.value !== keep) micSel.value = '';
    }).catch(function () {});
  }

  // Finds the repeats in a decoded recording. Works on the RMS of 20 ms frames against a threshold set from the room noise.
  function findRepeats(buf) {
    var data = buf.getChannelData(0), win = Math.max(1, Math.round(buf.sampleRate * FRAME));
    var frames = Math.floor(data.length / win), rms = new Float32Array(frames), i, j, s;
    for (i = 0; i < frames; i++) {
      s = 0;
      for (j = i * win; j < (i + 1) * win; j++) s += data[j] * data[j];
      rms[i] = Math.sqrt(s / win);
    }
    var sorted = Array.prototype.slice.call(rms).sort(function (a, b) { return a - b; });
    var floor = sorted[Math.floor(frames * 0.2)] || 0, peak = sorted[Math.floor(frames * 0.98)] || 0;
    var thr = Math.max(0.01, floor * 4, peak * 0.15);
    var segs = [], start = -1, quiet = 0;
    for (i = 0; i < frames; i++) {
      if (rms[i] > thr) {
        if (start < 0) start = i;
        quiet = 0;
      } else if (start >= 0) {
        quiet++;
        if (quiet >= PAUSE_FRAMES) {
          var end = i - quiet + 1;
          if (end - start >= MIN_FRAMES) segs.push({ from: start, to: end });
          start = -1; quiet = 0;
        }
      }
    }
    if (start >= 0 && frames - start >= MIN_FRAMES) segs.push({ from: start, to: frames });
    return { segs: segs, win: win };
  }

  function sliceBuffer(buf, from, to) {
    var len = Math.max(1, to - from), out = ctx.createBuffer(buf.numberOfChannels, len, buf.sampleRate), c;
    for (c = 0; c < buf.numberOfChannels; c++) out.getChannelData(c).set(buf.getChannelData(c).subarray(from, to));
    return out;
  }

  function finishRecording(blob) {
    ensureCtx();
    if (!ctx) { speakMsg.textContent = 'This browser cannot decode the recording.'; return; }
    blob.arrayBuffer().then(function (ab) { return ctx.decodeAudioData(ab); }).then(function (buf) {
      var found = findRepeats(buf), n = found.segs.length, win = found.win;
      if (n === 0) {
        // Nothing separated from the room: keep the whole take as one chant.
        clip = sliceBuffer(buf, 0, buf.length);
        n = 1;
      } else {
        var first = found.segs[0];
        clip = sliceBuffer(buf, Math.max(0, first.from * win - Math.round(buf.sampleRate * 0.05)),
          Math.min(buf.length, first.to * win + Math.round(buf.sampleRate * 0.05)));
      }
      heardEl.value = String(Math.min(MAX_REPEATS, n));
      playBtn.disabled = false;
      speakMsg.textContent = 'Heard ' + n + (n === 1 ? ' chant' : ' chants') + ', about ' + fmtSecs(clip.duration) +
        ' each. Change the number if it is off, then play.';
    }).catch(function () {
      speakMsg.textContent = 'That recording could not be read. Try again.';
    }).then(function () {
      recState.textContent = 'Not recording';
      setRecording(false);
      loadMics();
    });
  }

  function stopRecording() {
    clearTimeout(recTimer);
    clearInterval(recTicker);
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    if (recStream) recStream.getTracks().forEach(function (t) { t.stop(); });
    recStream = null;
  }

  function startRecording() {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      speakMsg.textContent = 'Recording is not supported in this browser.';
      return;
    }
    stopPlaying();
    speakMsg.textContent = '';
    var constraints = { audio: micSel.value ? { deviceId: { exact: micSel.value } } : true };
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      recStream = stream;
      recChunks = [];
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = function (e) { if (e.data && e.data.size) recChunks.push(e.data); };
      recorder.onstop = function () {
        var type = recorder.mimeType || 'audio/webm';
        finishRecording(new Blob(recChunks, { type: type }));
      };
      recorder.start(200);
      recStarted = Date.now();
      setRecording(true);
      recState.textContent = 'Recording: say your mantra once, or several times with a pause';
      recTicker = setInterval(function () {
        recState.textContent = 'Recording ' + Math.floor((Date.now() - recStarted) / 1000) + ' s. Stop when you are done.';
      }, 500);
      recTimer = setTimeout(stopRecording, MAX_REC_MS);
      loadMics();
    }).catch(function (err) {
      speakMsg.textContent = 'The microphone is not available (' + (err && err.name ? err.name : 'error') + '). Allow microphone access and try again.';
    });
  }

  function stopPlaying() {
    clearTimeout(playEndTimer);
    playSources.forEach(function (s) { try { s.stop(); } catch (e) {} });
    playSources = [];
    playBtn.textContent = 'Play chants';
    playBtn.setAttribute('aria-pressed', 'false');
  }

  function playChants() {
    if (!clip) return;
    ensureCtx();
    if (!ctx) { speakMsg.textContent = 'Audio playback is not supported in this browser.'; return; }
    stopPlaying();
    var n = Math.min(MAX_REPEATS, Math.max(1, parseInt(heardEl.value, 10) || 1));
    var t0 = ctx.currentTime + 0.1, step = clip.duration + CHANT_GAP, i;
    for (i = 0; i < n; i++) {
      var src = ctx.createBufferSource();
      src.buffer = clip;
      src.connect(ctx.destination);
      src.start(t0 + i * step);
      playSources.push(src);
    }
    playBtn.textContent = 'Stop playing';
    playBtn.setAttribute('aria-pressed', 'true');
    speakMsg.textContent = 'Playing ' + n + (n === 1 ? ' chant' : ' chants') + ', about ' + fmtDur(n * step) + ' in total.';
    playEndTimer = setTimeout(function () {
      playSources = [];
      playBtn.textContent = 'Play chants';
      playBtn.setAttribute('aria-pressed', 'false');
      speakMsg.textContent = 'Finished ' + n + (n === 1 ? ' chant.' : ' chants.');
    }, (n * step + 0.2) * 1000);
  }

  // Two ways in: write a mantra, or speak it. Each has its own panel; the other stays hidden.
  var tabWrite = $('mc-tab-write'), tabSpeak = $('mc-tab-speak');
  var panelWrite = $('mc-panel-write'), panelSpeak = $('mc-panel-speak');
  function showMode(mode, focus) {
    var speak = mode === 'speak';
    if (!speak) { stopRecording(); stopPlaying(); }
    tabWrite.setAttribute('aria-selected', speak ? 'false' : 'true');
    tabWrite.tabIndex = speak ? -1 : 0;
    tabSpeak.setAttribute('aria-selected', speak ? 'true' : 'false');
    tabSpeak.tabIndex = speak ? 0 : -1;
    panelWrite.hidden = speak;
    panelSpeak.hidden = !speak;
    if (speak) { loadMics(); if (focus) tabSpeak.focus(); }
    else if (focus) tabWrite.focus();
  }
  if (tabWrite && tabSpeak) {
    tabWrite.addEventListener('click', function () { showMode('write'); });
    tabSpeak.addEventListener('click', function () { showMode('speak'); });
    tabWrite.parentNode.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return;
      e.preventDefault();
      showMode(e.key === 'ArrowRight' || e.key === 'End' ? 'speak' : 'write', true);
    });
  }

  if (recBtn && playBtn) {
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      recBtn.disabled = true;
      speakMsg.textContent = 'Recording is not supported in this browser. You can still type a mantra and use the counter.';
    }
    recBtn.addEventListener('click', function () {
      if (recorder && recorder.state === 'recording') stopRecording();
      else startRecording();
    });
    playBtn.addEventListener('click', function () {
      if (playSources.length) stopPlaying(); else playChants();
    });
    heardEl.addEventListener('input', function () { if (playSources.length) stopPlaying(); });
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) navigator.mediaDevices.addEventListener('devicechange', loadMics);
    loadMics();
  }

  tick();
  setInterval(tick, 1000);
  showText();
  renderCount();
  renderStats();
  timerState.textContent = 'Timer paused';
})();
