// Geeta Says ||: tap a feeling, read its quote, and see the verse attached to it. Then run a one-minute reset.
// Everything runs in the browser. Nothing is sent or stored.
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var dataEl = $('gs-data');
  if (!dataEl) return;
  var data = { verses: [], capsules: [] };
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch (e) {}
  var verses = data.verses || [], capsules = data.capsules || [];
  var capsuleStage = $('gs-capsules'), resultStage = $('gs-result');
  var current = null, pathTimer = null, secs = 60, beads = 0, ac = null;

  function chime() {
    try {
      if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
      var now = ac.currentTime;
      [528, 1056].forEach(function (f, i) {
        var o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(i === 0 ? 0.12 : 0.04, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
        o.connect(g); g.connect(ac.destination); o.start(now); o.stop(now + 2.9);
      });
    } catch (e) {}
  }
  function verseFor(id) {
    var found = verses.filter(function (v) { return v.id === id; })[0];
    return found || verses[0];
  }
  function fill(v) {
    current = v;
    $('gs-ref').textContent = v.ref;
    $('gs-sanskrit').textContent = v.sanskrit;
    $('gs-translit').textContent = v.translit || '';
    $('gs-translation').textContent = v.meaning;
    $('gs-reflection').textContent = v.reflection;
  }

  // ---- the 60-second pathway ----
  function stopPath() { clearInterval(pathTimer); pathTimer = null; }
  function renderStep(step) {
    var box = $('gs-path');
    if (step === 1) {
      box.innerHTML = '<p class="gs-step">Step 1 of 3 · Slow the breath</p><div class="gs-orb" id="gs-orb"></div><p class="gs-cue" id="gs-cue">Breathe in for 4 seconds</p>';
    } else if (step === 2) {
      var dots = '';
      for (var i = 0; i < 9; i++) dots += '<button type="button" class="gs-bead" data-bead="' + i + '" aria-label="Bead ' + (i + 1) + '"></button>';
      box.innerHTML = '<p class="gs-step">Step 2 of 3 · Tap nine beads</p><p class="gs-mantra">“' + current.mantraLine + '”</p><div class="gs-beads">' + dots + '</div><p class="gs-note">Tap each bead slowly as you repeat the line silently.</p>';
      beads = 0;
    } else {
      box.innerHTML = '<p class="gs-step">Step 3 of 3 · One grounded step</p><p class="gs-action">' + current.microAction + '</p>';
    }
  }
  function startPath() {
    stopPath();
    secs = 60; beads = 0;
    renderStep(1);
    pathTimer = setInterval(function () {
      secs--;
      $('gs-timer').textContent = '00:' + (secs < 10 ? '0' : '') + Math.max(0, secs);
      var elapsed = 60 - secs;
      if (elapsed < 20) {
        var inhale = (elapsed % 10) < 4;
        var orb = $('gs-orb'), cue = $('gs-cue');
        if (orb) orb.classList.toggle('in', inhale);
        if (cue) cue.textContent = inhale ? 'Breathe in for 4 seconds' : 'Breathe out for 6 seconds';
      }
      if (elapsed === 20) renderStep(2);
      if (elapsed === 45 && beads < 9) renderStep(3);
      if (secs <= 0) {
        stopPath();
        $('gs-timer').textContent = 'Complete';
        if (!$('gs-again')) {
          var again = document.createElement('button');
          again.type = 'button'; again.className = 'gs-secondary'; again.id = 'gs-again'; again.textContent = 'Do the reset again';
          $('gs-path').appendChild(again);
        }
      }
    }, 1000);
  }
  function tapBead(b) {
    if (b.classList.contains('done')) return;
    b.classList.add('done');
    beads++;
    if (beads === 9) { chime(); secs = Math.min(secs, 15); renderStep(3); }
  }

  // ---- a feeling capsule opens its quote and verse ----
  function openCapsule(index) {
    var c = capsules[index];
    if (!c) return;
    var v = verseFor(c.verse);
    fill(v);
    $('gs-label').textContent = c.label;
    $('gs-quote').textContent = c.quote;
    $('gs-why').textContent = 'Attached to the feeling “' + c.label + '”.';
    chime();
    capsuleStage.hidden = true;
    resultStage.hidden = false;
    $('gs-timer').textContent = '01:00';
    $('gs-start').hidden = false;
    renderStep(1);
    $('gs-path').querySelector('.gs-cue').textContent = 'Press start to begin the one-minute reset.';
    resultStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function back() {
    stopPath();
    resultStage.hidden = true;
    capsuleStage.hidden = false;
    capsuleStage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---- export a verse card (no personal text is included) ----
  function wrap(ctx, text, x, y, maxW, lh) {
    var words = text.split(' '), line = '';
    for (var n = 0; n < words.length; n++) {
      var test = line + words[n] + ' ';
      if (ctx.measureText(test).width > maxW && n > 0) { ctx.fillText(line, x, y); line = words[n] + ' '; y += lh; }
      else line = test;
    }
    ctx.fillText(line, x, y);
  }
  function exportCard() {
    if (!current) return;
    var c = document.createElement('canvas');
    c.width = 1080; c.height = 1350;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#0b0b0f'; ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = 'rgba(229,193,88,0.4)'; ctx.lineWidth = 3; ctx.strokeRect(54, 54, c.width - 108, c.height - 108);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e5c158'; ctx.font = '600 32px Georgia, serif';
    ctx.fillText('GEETA SAYS ||  ' + current.ref.toUpperCase(), c.width / 2, 170);
    ctx.fillStyle = '#f3efe6'; ctx.font = '40px Georgia, serif';
    wrap(ctx, '“' + current.meaning + '”', c.width / 2, 430, 860, 60);
    ctx.fillStyle = '#c9c4b8'; ctx.font = '28px sans-serif';
    ctx.fillText('poojapathvala.in/geeta-says', c.width / 2, c.height - 110);
    var a = document.createElement('a');
    a.download = current.ref.toLowerCase().replace(/\s+/g, '-') + '.png';
    a.href = c.toDataURL('image/png');
    a.click();
  }

  // ---- wiring ----
  document.querySelectorAll('[data-capsule]').forEach(function (b) {
    b.addEventListener('click', function () { openCapsule(parseInt(b.getAttribute('data-capsule'), 10)); });
  });
  $('gs-start').addEventListener('click', function () { chime(); startPath(); $('gs-start').hidden = true; });
  $('gs-release').addEventListener('click', back);
  $('gs-export').addEventListener('click', exportCard);
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.classList && t.classList.contains('gs-bead')) tapBead(t);
    if (t.id === 'gs-again') { renderStep(1); startPath(); }
  });
  // an emotion page opens with its verse already shown; the reset starts on request
  var preset = resultStage.getAttribute('data-verse');
  if (preset) {
    fill(verseFor(preset));
    capsuleStage.hidden = true;
    resultStage.hidden = false;
    $('gs-start').hidden = false;
    $('gs-timer').textContent = '01:00';
  }
})();
