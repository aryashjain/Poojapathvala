// Homepage: draw one positive tarot card. Uses only cards with a positive tone. Text is set with textContent.
(function () {
  var btn = document.getElementById('hc-draw');
  var box = document.getElementById('hc-result');
  var dataEl = document.getElementById('hc-data');
  if (!btn || !box || !dataEl) return;
  var cards = [];
  try { cards = JSON.parse(dataEl.textContent || '[]'); } catch (e) { cards = []; }
  if (!cards.length) { btn.hidden = true; return; }
  var last = -1;
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function draw() {
    var i = Math.floor(Math.random() * cards.length);
    if (cards.length > 1 && i === last) i = (i + 1) % cards.length;
    last = i;
    var c = cards[i];
    box.textContent = '';
    box.appendChild(el('p', 'hc-kicker', 'Your positive card'));
    box.appendChild(el('h3', 'hc-name', c.name));
    box.appendChild(el('p', 'hc-text', c.upright));
    var row = el('p', 'hc-links');
    var a = el('a', 'hc-more', 'Read the full meaning');
    a.href = '/tarot/card/' + c.id;
    row.appendChild(a);
    var again = el('button', 'hc-again', 'Draw another');
    again.type = 'button';
    again.addEventListener('click', draw);
    row.appendChild(again);
    box.appendChild(row);
    box.hidden = false;
    box.classList.remove('hc-in');
    void box.offsetWidth;
    box.classList.add('hc-in');
  }
  btn.addEventListener('click', draw);
  // The ritual page draws a card when the burn ends.
  document.addEventListener('pp:burned', draw);
})();
