// 10-minute calm practice: three guided stages with a bowl cue at each change. Synthesised in the browser.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var circle = $('pr-circle'), phase = $('pr-phase'), count = $('med-stage-time'), total = $('med-total-time');
  var bar = $('pr-bar'), prompt = $('med-prompt'), startBtn = $('med-start'), pauseBtn = $('med-pause'), stopBtn = $('med-stop');
  var stageList = $('med-stages');
  if (!circle || !startBtn) return;

  var STAGES = [
    { name: 'Settle', secs: 120, prompt: 'Sit comfortably. Let the breath be natural. Notice the sounds around you without naming them.' },
    { name: 'Body', secs: 240, prompt: 'Move attention slowly from the feet up to the head. Soften any tension you notice on the way.' },
    { name: 'Open awareness', secs: 240, prompt: 'Let attention rest on whatever is here. When thoughts arise, notice them and gently come back to the breath.' },
  ];
  var TOTAL = STAGES.reduce(function (s, x) { return s + x.secs; }, 0);
  var ac = null, running = false, paused = false, stageIdx = 0, left = 0, elapsed = 0, last = 0, timer = null;

  function ensureAudio() {
    if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; } }
    if (ac.state === 'suspended') ac.resume();
    return true;
  }
  function bowl(freqs, dur) {
    if (!ensureAudio()) return;
    var now = ac.currentTime;
    freqs.forEach(function (f, i) {
      var o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.16 / (i + 1), now + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(g); g.connect(ac.destination);
      o.start(now); o.stop(now + dur + 0.1);
    });
  }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
  function renderStages() {
    stageList.textContent = '';
    STAGES.forEach(function (st, i) {
      var li = document.createElement('li');
      li.textContent = (i + 1) + '. ' + st.name + ' · ' + Math.round(st.secs / 60) + ' min';
      li.setAttribute('data-stage', i);
      li.className = i === stageIdx && running ? 'med-current' : '';
      stageList.appendChild(li);
    });
  }
  function enterStage() {
    var st = STAGES[stageIdx];
    left = st.secs * 1000;
    phase.textContent = st.name;
    prompt.textContent = st.prompt;
    bowl(stageIdx === 0 ? [396, 792] : [528, 1056], 3.5);
    renderStages();
  }
  function breatheCircle(on) {
    circle.style.transition = on ? 'transform 6s ease-in-out' : 'transform 1.2s ease-in-out';
    circle.style.transform = on ? 'scale(1.35)' : 'scale(1)';
  }
  function tick(now) {
    if (!running) return;
    var dt = now - last; last = now;
    if (!paused) {
      left -= dt; elapsed += dt;
      count.textContent = fmt(left / 1000);
      total.textContent = fmt((TOTAL * 1000 - elapsed) / 1000);
      bar.style.width = Math.min(100, (elapsed / (TOTAL * 1000)) * 100).toFixed(1) + '%';
      if (left <= 0) {
        stageIdx++;
        if (stageIdx >= STAGES.length) { finish(true); return; }
        enterStage();
      }
    }
  }
  function start() {
    if (running) return;
    ensureAudio();
    running = true; paused = false; stageIdx = 0; elapsed = 0;
    startBtn.hidden = true; pauseBtn.hidden = false; stopBtn.hidden = false;
    pauseBtn.textContent = 'Pause';
    breatheCircle(true);
    enterStage();
    last = performance.now();
    timer = setInterval(function () { tick(performance.now()); }, 100);
  }
  function finish(done) {
    running = false; clearInterval(timer);
    if (done) bowl([396, 792, 1188], 5);
    phase.textContent = done ? 'Practice complete' : 'Practice stopped';
    prompt.textContent = done ? 'Notice how you feel now. You can practise again whenever you like.' : 'You can start again whenever you are ready.';
    count.textContent = '—';
    total.textContent = done ? '0:00' : total.textContent;
    if (done) bar.style.width = '100%';
    breatheCircle(false);
    startBtn.hidden = false; startBtn.textContent = 'Start again';
    pauseBtn.hidden = true; stopBtn.hidden = true;
    renderStages();
  }
  function togglePause() {
    if (!running) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
    if (paused) circle.style.transition = 'none';
    else { last = performance.now(); breatheCircle(true); }
  }
  total.textContent = fmt(TOTAL);
  count.textContent = fmt(STAGES[0].secs);
  renderStages();
  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', togglePause);
  stopBtn.addEventListener('click', function () { finish(false); });
})();
