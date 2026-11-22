// Public stylesheet and scripts, served from /assets/*.
// Kept as strings so the Worker has no static-file dependency.

// Runs before the page paints so a saved reading theme never flashes light.
export const THEME_JS = `
(function () {
  try {
    var saved = localStorage.getItem('pp-theme');
    if (saved === 'sepia' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch (error) {}
})();
`;

export const CSS = `
:root {
  --bg: #fbfaf6;
  --surface: #ffffff;
  --ink: #1d1b18;
  --muted: #6b655e;
  --line: #e8e4dc;
  --accent: #b4532a;
  --accent-soft: #f7e6dc;
  --serif: Charter, "Iowan Old Style", Georgia, "Kohinoor Devanagari", "Noto Serif Devanagari", Mangal, serif;
  --sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Kohinoor Devanagari", "Noto Sans Devanagari", sans-serif;
  --reader-scale: 1;
  color-scheme: light;
}
html[data-theme="sepia"] {
  --bg: #f4ecd8;
  --surface: #faf5e6;
  --ink: #3b2f1e;
  --muted: #7a6b52;
  --line: #e0d3b5;
  --accent: #9a4a1f;
  --accent-soft: #eadbbc;
}
html[data-theme="dark"] {
  --bg: #15130f;
  --surface: #1f1c17;
  --ink: #ece6dc;
  --muted: #a39a8c;
  --line: #363027;
  --accent: #e8895a;
  --accent-soft: #3a2b20;
  color-scheme: dark;
}

/* Hindi is the default: Devanagari faces come first in both families. */
html[lang="hi"] {
  --serif: "Kohinoor Devanagari", "Noto Serif Devanagari", Mangal, Charter, Georgia, serif;
  --sans: "Kohinoor Devanagari", "Noto Sans Devanagari", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
}
html[lang="hi"] body { line-height: 1.8; }
html[lang="hi"] h1, html[lang="hi"] h2, html[lang="hi"] h3 { line-height: 1.3; }

* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--serif);
  font-size: 18px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }
h1, h2, h3 { font-weight: 700; }
.wrap { width: min(100% - 2rem, 720px); margin-inline: auto; }
main { padding: 2.5rem 0 4rem; }
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- header ---- */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
}
.header-inner { display: flex; align-items: center; gap: 1.25rem; padding: .85rem 0; }
.brand {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-family: var(--sans);
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: -.02em;
  color: var(--ink);
  white-space: nowrap;
}
.brand::before {
  content: "";
  width: .6rem;
  height: .6rem;
  border-radius: 50%;
  background: var(--accent);
}
.brand:hover { text-decoration: none; }

/* Header: lamp-and-book mark beside the brand name. */
.brand img { display: block; flex: none; height: 30px; width: 30px; max-width: 30px; }
.brand::before { display: none; }

/* ---- language toggle ---- */
.lang-toggle {
  flex: none;
  font-family: var(--sans);
  font-size: .85rem;
  font-weight: 600;
  padding: .45rem .8rem;
  color: var(--ink);
  border: 1px solid var(--line);
  border-radius: 999px;
  white-space: nowrap;
}
.lang-toggle:hover { border-color: var(--accent); text-decoration: none; }

/* ---- search ---- */
.search {
  position: relative;
  display: flex;
  gap: .5rem;
  flex: 1;
  max-width: 400px;
  margin-left: auto;
  font-family: var(--sans);
}
.search input {
  flex: 1;
  min-width: 0;
  font: inherit;
  font-size: .95rem;
  padding: .55rem .95rem;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--ink);
}
.search input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.search button {
  font: inherit;
  font-size: .9rem;
  font-weight: 600;
  padding: .55rem 1.05rem;
  border: 0;
  border-radius: 999px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
}
.search-home { max-width: 100%; margin-top: 1.75rem; }
.search-home input { font-size: 1.05rem; padding: .85rem 1.25rem; }
.search-home button { padding: .85rem 1.4rem; font-size: 1rem; }
.search-panel {
  position: absolute;
  top: calc(100% + .5rem);
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 60vh;
  overflow: auto;
  padding: .5rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, .1);
}
.search-panel[hidden] { display: none; }
.search-panel a {
  display: flex;
  flex-direction: column;
  padding: .6rem .7rem;
  border-radius: 10px;
  color: var(--ink);
}
.search-panel a:hover, .search-panel a:focus { background: var(--accent-soft); text-decoration: none; outline: none; }
.search-title { font-weight: 700; font-size: .98rem; }
.search-meta { font-family: var(--sans); font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); }
.search-snippet { font-family: var(--sans); font-size: .88rem; color: var(--muted); }
.search-empty, .search-all { display: block; padding: .6rem .7rem; font-family: var(--sans); font-size: .9rem; color: var(--muted); }
.search-all { color: var(--accent); font-weight: 600; }

/* ---- home ---- */
.hero { padding: 1.25rem 0 2.5rem; }
.eyebrow {
  margin: 0 0 .65rem;
  font-family: var(--sans);
  font-size: .75rem;
  font-weight: 700;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--accent);
}
h1 {
  margin: .2rem 0 .8rem;
  font-size: clamp(2rem, 5vw, 2.8rem);
  line-height: 1.15;
  letter-spacing: -.02em;
}
h2 { margin: 0 0 .35rem; font-size: 1.3rem; line-height: 1.3; }
.lede { margin: 0 0 1.5rem; font-size: 1.1rem; line-height: 1.6; color: var(--muted); }
.page-head { margin-bottom: 2.25rem; }
.page-head .lede { max-width: 36em; }

.topics { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); }
.topic-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: .35rem;
  padding: 1.35rem 1.4rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
  color: var(--ink);
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.topic-card::before {
  content: "";
  position: absolute;
  left: 1.4rem;
  top: 0;
  width: 2.25rem;
  height: 3px;
  border-radius: 0 0 3px 3px;
  background: var(--accent);
}
.topic-card:hover { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(0, 0, 0, .07); border-color: var(--accent-soft); text-decoration: none; }
.topic-card h2 { margin-top: .35rem; font-size: 1.2rem; }
.topic-card p { margin: 0; font-size: .95rem; line-height: 1.5; color: var(--muted); }
.topic-count {
  font-family: var(--sans);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
}
.featured { margin-top: 3rem; }
.featured h2 { margin-bottom: .75rem; }

/* ---- lists ---- */
.doc-list { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.doc-list li { border-bottom: 1px solid var(--line); }
.doc-list a { display: flex; flex-direction: column; gap: .2rem; padding: 1.05rem .2rem; color: var(--ink); }
.doc-list a:hover { color: var(--accent); text-decoration: none; }
.doc-title { font-size: 1.12rem; font-weight: 700; }
.doc-hindi { font-size: 1rem; color: var(--muted); }
.doc-desc { font-family: var(--sans); font-size: .9rem; line-height: 1.45; color: var(--muted); }
.snippet { font-family: var(--sans); font-size: .88rem; color: var(--muted); }
.empty { padding: 1rem .2rem; color: var(--muted); }

/* ---- breadcrumbs and meta ---- */
.crumbs {
  margin-bottom: 1.75rem;
  font-family: var(--sans);
  font-size: .85rem;
  color: var(--muted);
}
.crumbs a { color: var(--muted); }
.crumbs span { margin: 0 .35rem; opacity: .6; }
.byline {
  display: flex;
  flex-wrap: wrap;
  gap: .2rem .9rem;
  margin: 0;
  font-family: var(--sans);
  font-size: .88rem;
  color: var(--muted);
}
.byline span + span::before { content: "·"; margin-right: .9rem; opacity: .6; }

/* ---- article ---- */
.article h1 { font-size: clamp(2.2rem, 5.5vw, 3rem); margin-bottom: .5rem; }
.hindi-title { margin: 0 0 .9rem; font-size: 1.35rem; color: var(--muted); }
.deck { margin: 0 0 1.1rem; font-size: 1.22rem; line-height: 1.55; font-style: italic; color: var(--muted); }
.article .byline { margin-bottom: 1.75rem; }

/* ---- reader controls ---- */
.reader-bar {
  position: sticky;
  top: 4.4rem;
  z-index: 5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .5rem .9rem;
  margin: 0 0 2.25rem;
  padding: .55rem .7rem;
  font-family: var(--sans);
  font-size: .85rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
}
.reader-group { display: flex; align-items: center; gap: .3rem; }
.reader-group + .reader-group::before {
  content: "";
  width: 1px;
  height: 1.2rem;
  margin-right: .6rem;
  background: var(--line);
}
.reader-bar .spacer { flex: 1; }
.reader-bar button,
.reader-bar .chip {
  font: inherit;
  font-size: .85rem;
  padding: .38rem .8rem;
  color: var(--ink);
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}
.reader-bar button:hover,
.reader-bar .chip:hover { border-color: var(--accent); text-decoration: none; }
.reader-bar button[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: #fff; }
.reader-bar button:focus-visible,
.reader-bar .chip:focus-visible { outline: 3px solid var(--accent-soft); outline-offset: 2px; }

/* ---- prose ---- */
.prose {
  font-size: calc(1.2rem * var(--reader-scale));
  line-height: 1.85;
}
.prose p { margin: 0 0 1.25em; }
.prose h2, .prose h3, .prose h4 { margin: 1.9em 0 .5em; line-height: 1.3; }
.prose blockquote {
  margin: 1.5em 0;
  padding: .1em 0 .1em 1.2em;
  border-left: 3px solid var(--accent);
  color: var(--muted);
  font-style: italic;
}
.prose blockquote p { margin: 0; }
.prose ul, .prose ol { padding-left: 1.3em; margin: 0 0 1.25em; }
.prose hr { margin: 2.2em 0; border: 0; text-align: center; }
.prose hr::after { content: "❖"; color: var(--accent); }
.prose code {
  padding: .05em .3em;
  border-radius: 4px;
  background: var(--accent-soft);
  font-family: ui-monospace, Menlo, monospace;
  font-size: .9em;
}

/* ---- pager ---- */
.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 3.25rem;
  padding-top: 1.75rem;
  border-top: 1px solid var(--line);
  font-family: var(--sans);
}
.pager a {
  display: flex;
  flex-direction: column;
  padding: 1rem 1.1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
  color: var(--ink);
}
.pager a:hover { border-color: var(--accent); text-decoration: none; }
.pager a span {
  margin-bottom: .2rem;
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--accent);
}
.pager .next { grid-column: 2; text-align: right; }

/* ---- footer ---- */
.site-footer {
  padding: 1.5rem 0;
  border-top: 1px solid var(--line);
  font-family: var(--sans);
  font-size: .85rem;
  color: var(--muted);
}
.site-footer .wrap { display: flex; flex-wrap: wrap; justify-content: space-between; gap: .5rem 1rem; }

@media (max-width: 640px) {
  body { font-size: 17px; }
  .header-inner { flex-wrap: wrap; gap: .75rem; }
  .search { flex-basis: 100%; max-width: none; margin-left: 0; }
  .reader-bar { top: 7.5rem; }
  .pager { grid-template-columns: 1fr; }
  .pager .next { grid-column: 1; text-align: left; }
}
`;

export const JS = `
(function () {
  'use strict';

  // ---- search ----
  var forms = document.querySelectorAll('[data-search-form]');

  forms.forEach(function (form) {
    var input = form.querySelector('input[name="q"]');
    var panel = form.querySelector('[data-search-panel]');
    var timer = null;
    var controller = null;

    function close() {
      panel.hidden = true;
    }

    function el(tag, className, text) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (text) node.textContent = text;
      return node;
    }

    function render(query, results) {
      panel.replaceChildren();
      if (!results.length) {
        panel.append(el('span', 'search-empty', form.getAttribute('data-no-match').replace('{q}', query)));
      }
      results.slice(0, 8).forEach(function (result) {
        var link = el('a');
        link.href = result.url;
        link.append(
          el('span', 'search-title', result.title),
          el('span', 'search-meta', result.topic),
          el('span', 'search-snippet', result.snippet)
        );
        panel.append(link);
      });
      if (results.length) {
        var all = el('a', 'search-all', form.getAttribute('data-see-all').replace('{n}', String(results.length)));
        all.href = '/search?q=' + encodeURIComponent(query);
        panel.append(all);
      }
      panel.hidden = false;
    }

    function run(query) {
      if (!query) {
        if (controller) controller.abort();
        close();
        return;
      }
      if (controller) controller.abort();
      controller = new AbortController();
      fetch('/api/search?q=' + encodeURIComponent(query), {
        signal: controller.signal,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Search failed: ' + response.status);
          return response.json();
        })
        .then(function (data) {
          if (input.value.trim() === query) render(query, data.results);
        })
        .catch(function (error) {
          if (error.name !== 'AbortError') close();
        });
    }

    input.addEventListener('input', function () {
      clearTimeout(timer);
      var query = input.value.trim();
      timer = setTimeout(function () { run(query); }, 150);
    });

    input.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') close();
    });

    document.addEventListener('click', function (event) {
      if (!form.contains(event.target)) close();
    });
  });

  // ---- reader controls (only present on text pages) ----
  var root = document.documentElement;
  var themeButtons = document.querySelectorAll('[data-theme-set]');
  var sizeButtons = document.querySelectorAll('[data-size-step]');

  function storeGet(key) {
    try { return localStorage.getItem(key); } catch (error) { return null; }
  }
  function storeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (error) {}
  }

  function markTheme() {
    var current = root.getAttribute('data-theme') || 'light';
    themeButtons.forEach(function (button) {
      button.setAttribute('aria-pressed', button.getAttribute('data-theme-set') === current ? 'true' : 'false');
    });
  }

  themeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var name = button.getAttribute('data-theme-set');
      if (name === 'light') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', name);
      storeSet('pp-theme', name);
      markTheme();
    });
  });
  markTheme();

  var scale = parseFloat(storeGet('pp-size')) || 1;
  function applyScale() {
    scale = Math.min(1.4, Math.max(0.85, Math.round(scale * 100) / 100));
    root.style.setProperty('--reader-scale', String(scale));
    storeSet('pp-size', String(scale));
  }
  if (themeButtons.length || sizeButtons.length) applyScale();

  sizeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      scale += parseInt(button.getAttribute('data-size-step'), 10) * 0.1;
      applyScale();
    });
  });

  document.querySelectorAll('[data-copy-url]').forEach(function (button) {
    var label = button.textContent;
    var bar = button.closest('.reader-bar');
    button.addEventListener('click', function () {
      if (!navigator.clipboard) {
        button.textContent = bar.getAttribute('data-copy-unsupported');
        return;
      }
      navigator.clipboard.writeText(window.location.href).then(function () {
        button.textContent = bar.getAttribute('data-copied');
        setTimeout(function () { button.textContent = label; }, 1800);
      }, function () {
        button.textContent = bar.getAttribute('data-copy-failed');
        setTimeout(function () { button.textContent = label; }, 1800);
      });
    });
  });
})();
`;
