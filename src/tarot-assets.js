// Tarot reader stylesheet and game script, served from /assets/tarot.css and /assets/tarot.js.
// Cards are drawn with original styling; no third-party card artwork is used.

export const TAROT_CSS = `
.btn { display: inline-block; font: inherit; font-family: var(--sans); font-size: .95rem; font-weight: 600; padding: .7rem 1.3rem; border: 0; border-radius: 999px; background: var(--accent); color: #fff; cursor: pointer; text-decoration: none; }
.btn:hover { filter: brightness(1.06); text-decoration: none; }
.btn-ghost { background: transparent; color: var(--accent); border: 1px solid var(--line); }
.muted { color: var(--muted); font-family: var(--sans); font-size: .9rem; }
.disclaimer { font-family: var(--sans); font-size: .85rem; color: var(--muted); border-left: 3px solid var(--accent); padding-left: .8rem; margin: 1.2rem 0; }

.spreads { display: flex; flex-wrap: wrap; gap: .5rem; margin-bottom: 1rem; }
.spread { font-family: var(--sans); font-size: .9rem; padding: .5rem .95rem; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); cursor: pointer; }
.spread[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: #fff; }
.reader-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin: .5rem 0 1rem; }
.streak { margin-left: auto; font-family: var(--sans); font-size: .9rem; font-weight: 700; color: var(--accent); }
.status { font-family: var(--sans); font-size: .95rem; color: var(--muted); }

.stage { display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; min-height: 260px; margin: 1.5rem 0; }
.slot { display: flex; flex-direction: column; align-items: center; gap: .5rem; }
.position { font-family: var(--sans); font-size: .75rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }

.tcard { width: 150px; height: 230px; perspective: 900px; cursor: pointer; outline: none; }
.tcard:focus-visible { box-shadow: 0 0 0 3px var(--accent-soft); border-radius: 12px; }
.tcard-inner { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .7s cubic-bezier(.2, .7, .2, 1); }
.tcard.flipped .tcard-inner { transform: rotateY(180deg); }
.tcard-back, .tcard-face { position: absolute; inset: 0; border-radius: 12px; backface-visibility: hidden; -webkit-backface-visibility: hidden; box-shadow: 0 10px 22px rgba(0, 0, 0, .18); }
.tcard-back { display: grid; place-items: center; background: radial-gradient(circle at 50% 40%, #3b2f5c, #1d1733 70%); color: #f4e6c4; border: 3px double #c9a45c; font-size: 1rem; letter-spacing: .3em; }
.tcard-face { transform: rotateY(180deg); display: flex; align-items: center; justify-content: center; padding: .6rem; border: 3px double #c9a45c; background: linear-gradient(160deg, #fff8e8, #f1e1bd); color: #2a2118; }
.tcard.suit-major .tcard-face { background: linear-gradient(160deg, #f7f0ff, #dccbff); }
.tcard.suit-wands .tcard-face { background: linear-gradient(160deg, #fff1e6, #f7c79b); }
.tcard.suit-cups .tcard-face { background: linear-gradient(160deg, #eaf6ff, #b9dcf5); }
.tcard.suit-swords .tcard-face { background: linear-gradient(160deg, #f2f4f7, #c8cfd9); }
.tcard.suit-pentacles .tcard-face { background: linear-gradient(160deg, #f3f8e8, #c9dfa3); }
.tcard-content { display: flex; flex-direction: column; align-items: center; gap: .35rem; text-align: center; transition: transform .3s; }
.tcard-face.rev .tcard-content { transform: rotate(180deg); }
.tcard-num { font-family: var(--serif); font-size: .95rem; letter-spacing: .08em; }
.tcard-glyph { font-size: 2rem; line-height: 1; }
.tcard-name { font-family: var(--serif); font-weight: 700; font-size: .95rem; line-height: 1.2; }

.results { margin-top: .5rem; }
.result { padding: 1rem 1.2rem; margin-bottom: .8rem; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; }
.result h3 { margin: 0 0 .35rem; font-size: 1.05rem; }
.result p { margin: .3rem 0; }
.rev-tag { margin-left: .4rem; font-family: var(--sans); font-size: .72rem; letter-spacing: .08em; text-transform: uppercase; color: var(--accent); }
.verdict { font-family: var(--sans); }
.done { font-family: var(--sans); font-weight: 700; color: var(--accent); }

.card-pair { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: center; margin: 1.5rem 0; }
.card-pair figure { margin: 0; display: flex; flex-direction: column; align-items: center; gap: .5rem; }
.card-pair figcaption { font-family: var(--sans); font-size: .8rem; color: var(--muted); }
.card-links { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: .4rem .8rem; }
.card-links a { font-family: var(--sans); font-size: .92rem; color: var(--ink); }
.library { margin-top: 3rem; }
`;

export const TAROT_JS = `
(function () {
  'use strict';
  var dataEl = document.getElementById('tarot-data');
  if (!dataEl) return;
  var data = JSON.parse(dataEl.textContent);
  var cards = data.cards;
  var spreads = data.spreads;
  var stage = document.getElementById('tarot-stage');
  var results = document.getElementById('tarot-results');
  var status = document.getElementById('tarot-status');
  var streakEl = document.getElementById('tarot-streak');
  var current = 'three';
  var deck = [];
  var dealt = [];
  var revealed = 0;

  var ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
  var RANK = { 1: 'Ace', 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' };
  var GLYPH = { major: '✦', wands: '🔥', cups: '🌊', swords: '⚔', pentacles: '✺' };

  function esc(text) {
    return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function numberLabel(card) {
    return card.arcana === 'major' ? ROMAN[card.number] : (RANK[card.number] || String(card.number));
  }
  function randomInt(max) {
    var values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  }
  function shuffle(list) {
    var copy = list.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = randomInt(i + 1);
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }
  function reshuffle() {
    deck = shuffle(cards);
    status.textContent = 'Deck shuffled. Tap Draw cards.';
  }

  function buildCard(item, index) {
    var card = item.card;
    var el = document.createElement('div');
    el.className = 'tcard suit-' + card.suit;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Reveal card ' + (index + 1) + ' of ' + dealt.length);
    el.innerHTML =
      '<div class="tcard-inner">' +
      '<div class="tcard-back" aria-hidden="true"><span>☽ ✦ ☾</span></div>' +
      '<div class="tcard-face' + (item.reversed ? ' rev' : '') + '"><div class="tcard-content">' +
      '<span class="tcard-num">' + esc(numberLabel(card)) + '</span>' +
      '<span class="tcard-glyph" aria-hidden="true">' + GLYPH[card.suit] + '</span>' +
      '<span class="tcard-name">' + esc(card.name) + '</span>' +
      '</div></div></div>';
    el.addEventListener('click', function () { reveal(index); });
    el.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        reveal(index);
      }
    });
    return el;
  }

  function render() {
    stage.innerHTML = '';
    dealt.forEach(function (item, index) {
      var slot = document.createElement('div');
      slot.className = 'slot';
      var label = document.createElement('span');
      label.className = 'position';
      label.textContent = spreads[current].positions[index];
      slot.appendChild(label);
      item.el = buildCard(item, index);
      slot.appendChild(item.el);
      stage.appendChild(slot);
    });
  }

  function meaningOf(item) {
    return item.reversed ? item.card.reversed : item.card.upright;
  }
  function verdict(item) {
    var base = item.card.tone === 'p' ? 'Yes' : item.card.tone === 'n' ? 'No' : 'Maybe';
    if (base === 'Maybe' || !item.reversed) return base;
    return base === 'Yes' ? 'No' : 'Yes';
  }
  function addResult(index) {
    var item = dealt[index];
    var box = document.createElement('article');
    box.className = 'result';
    var html =
      '<h3>' + esc(spreads[current].positions[index]) + ': ' + esc(item.card.name) +
      (item.reversed ? '<span class="rev-tag">Reversed</span>' : '') + '</h3>' +
      '<p>' + esc(meaningOf(item)) + '</p>';
    if (current === 'yesno') html += '<p class="verdict">Answer: <strong>' + verdict(item) + '</strong></p>';
    html += '<p><a href="/tarot/card/' + esc(item.card.id) + '">Full card page</a></p>';
    box.innerHTML = html;
    results.appendChild(box);
  }

  function reveal(index) {
    var item = dealt[index];
    if (!item || item.shown) return;
    item.shown = true;
    item.el.classList.add('flipped');
    revealed++;
    addResult(index);
    var total = dealt.length;
    if (revealed < total) {
      status.textContent = 'Revealed ' + revealed + ' of ' + total + '. Tap the next card.';
    } else {
      finish();
    }
  }

  function readStorage(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }
  function writeStorage(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {}
  }
  function isoDay(offsetDays) {
    return new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
  }
  function showStreak() {
    var count = parseInt(readStorage('tarot-streak') || '0', 10);
    streakEl.textContent = count ? 'Daily streak: ' + count + (count === 1 ? ' day' : ' days') : '';
  }
  function updateStreak() {
    var today = isoDay(0);
    var last = readStorage('tarot-last');
    if (last === today) return;
    var count = parseInt(readStorage('tarot-streak') || '0', 10);
    count = last === isoDay(-1) ? count + 1 : 1;
    writeStorage('tarot-last', today);
    writeStorage('tarot-streak', String(count));
  }

  function finish() {
    if (current === 'daily') {
      updateStreak();
      showStreak();
    }
    status.innerHTML = '<span class="done">Reading complete.</span>' + (current === 'daily' ? ' Come back tomorrow for your next daily card.' : '');
  }

  function draw() {
    var needed = spreads[current].positions.length;
    if (deck.length < needed) reshuffle();
    var picks = deck.splice(0, needed);
    dealt = picks.map(function (card) {
      return { card: card, reversed: randomInt(100) < 30, shown: false, el: null };
    });
    revealed = 0;
    results.innerHTML = '';
    render();
    status.textContent = 'Tap each card to reveal it.';
  }

  document.getElementById('tarot-shuffle').addEventListener('click', reshuffle);
  document.getElementById('tarot-draw').addEventListener('click', draw);
  document.querySelectorAll('[data-spread]').forEach(function (button) {
    button.addEventListener('click', function () {
      current = button.getAttribute('data-spread');
      document.querySelectorAll('[data-spread]').forEach(function (other) {
        other.setAttribute('aria-pressed', other === button ? 'true' : 'false');
      });
      dealt = [];
      results.innerHTML = '';
      stage.innerHTML = '';
      status.textContent = 'Spread changed. Tap Draw cards.';
    });
  });

  reshuffle();
  showStreak();
})();
`;
