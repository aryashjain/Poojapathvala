// Positive tarot card draw. Used inline on the tarot reader and as a pop-up when the ritual burn ends.
// Text is set with textContent only.
(function () {
  var btn = document.getElementById('hc-draw');
  var box = document.getElementById('hc-result');
  var dataEl = document.getElementById('hc-data');
  if (!dataEl) return;
  var cards = [];
  try { cards = JSON.parse(dataEl.textContent || '[]'); } catch (e) { cards = []; }
  if (!cards.length) { if (btn) btn.hidden = true; return; }

  var last = -1, overlay = null, lastFocus = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // The card face: gold frame, numeral, name, ornament and upright meaning.
  function face(c) {
    var wrap = el('article', 'hc-tarot');
    wrap.setAttribute('aria-label', c.name);
    var top = el('div', 'hc-top');
    top.appendChild(el('span', 'hc-sub', c.sub || ''));
    if (c.number != null) top.appendChild(el('span', 'hc-num', String(c.number)));
    wrap.appendChild(top);
    wrap.appendChild(el('h3', 'hc-name', c.name));
    wrap.appendChild(el('p', 'hc-orn', '✦ ✦ ✦'));
    wrap.appendChild(el('p', 'hc-text', c.upright));
    var links = el('p', 'hc-links');
    var a = el('a', 'hc-more', 'Read the full meaning');
    a.href = '/tarot/card/' + c.id;
    links.appendChild(a);
    wrap.appendChild(links);
    return wrap;
  }

  function pick() {
    var i = Math.floor(Math.random() * cards.length);
    if (cards.length > 1 && i === last) i = (i + 1) % cards.length;
    last = i;
    return cards[i];
  }

  function drawInto(container, withBack) {
    var c = pick();
    container.textContent = '';
    if (withBack) container.appendChild(el('p', 'hc-kicker', 'Your positive card'));
    container.appendChild(face(c));
    var row = el('p', 'hc-actions');
    var again = el('button', 'hc-again', 'Draw another');
    again.type = 'button';
    again.addEventListener('click', function () { drawInto(container, withBack); animate(container); });
    row.appendChild(again);
    container.appendChild(row);
    animate(container);
    return c;
  }

  function animate(node) {
    node.classList.remove('hc-in');
    void node.offsetWidth;
    node.classList.add('hc-in');
  }

  // Pop-up used when the ritual burn ends.
  function ensureOverlay() {
    if (overlay) return overlay;
    overlay = el('div', 'hc-overlay');
    overlay.hidden = true;
    var dialog = el('div', 'hc-dialog');
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', 'hc-dialog-title');
    var title = el('h2', 'hc-dialog-title', 'Your positive card');
    title.id = 'hc-dialog-title';
    dialog.appendChild(title);
    var body = el('div', 'hc-dialog-body');
    dialog.appendChild(body);
    var close = el('button', 'hc-close', 'Close');
    close.type = 'button';
    close.addEventListener('click', closeOverlay);
    dialog.appendChild(close);
    overlay.appendChild(dialog);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeOverlay(); });
    document.body.appendChild(overlay);
    overlay._body = body;
    return overlay;
  }
  function openOverlay() {
    var o = ensureOverlay();
    lastFocus = document.activeElement;
    drawInto(o._body, false);
    o.hidden = false;
    document.body.classList.add('hc-lock');
    var close = o.querySelector('.hc-close');
    if (close) close.focus();
  }
  function closeOverlay() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('hc-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeOverlay();
  });

  if (btn && box) {
    btn.addEventListener('click', function () {
      box.hidden = false;
      drawInto(box, true);
    });
  }
  // The ritual page opens the pop-up when the burn ends.
  document.addEventListener('pp:burned', openOverlay);
})();
