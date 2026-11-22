// Admin-only stylesheet and script, served from /assets/admin.css and
// /assets/admin.js. Loaded only on /admin pages.

export const ADMIN_CSS = `
.wrap.wide { width: min(100% - 2rem, 1080px); }

/* Honeypot field for the public feedback form: hidden from people, visible to bots. */
.hp { position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden; }
.alert-ok {
  margin-bottom: 1rem;
  padding: .9rem 1.1rem;
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--ink);
  font-family: var(--sans);
}
.feedback-message { margin: 0; font-family: var(--serif); font-size: 1rem; line-height: 1.6; white-space: pre-wrap; color: var(--ink); }
.feedback-card .muted { margin: 0; }

.admin-top {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.admin-top h1 { margin: .2rem 0 .4rem; }
.admin-top .lede { margin: 0; max-width: 46ch; }
.stats { display: flex; gap: .75rem; margin: 0; }
.stat {
  min-width: 118px;
  padding: .7rem 1.1rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 14px;
}
.stat dt {
  font-family: var(--sans);
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--muted);
}
.stat dd { margin: 0; font-family: var(--sans); font-size: 1.6rem; font-weight: 700; }

.admin-grid { display: grid; gap: 1.25rem; grid-template-columns: minmax(0, 1fr); align-items: start; }
@media (min-width: 920px) {
  .admin-grid { grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); }
}

.panel {
  padding: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(31, 26, 23, .05);
  scroll-margin-top: 5rem;
}
.panel-head { display: flex; gap: .9rem; align-items: flex-start; margin-bottom: 1.25rem; }
.panel-head h2 { margin: 0; font-size: 1.2rem; }
.panel-head p { margin: .15rem 0 0; font-family: var(--sans); font-size: .9rem; color: var(--muted); }
.step {
  flex: none;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-family: var(--sans);
  font-weight: 700;
}

.alert {
  margin-bottom: .25rem;
  padding: .8rem 1rem;
  border-radius: 12px;
  background: #fdecea;
  color: #8a1c12;
  font-family: var(--sans);
  font-size: .9rem;
}
.alert ul { margin: .35rem 0 0; padding-left: 1.1em; }
@media (prefers-color-scheme: dark) {
  .alert { background: #3b1714; color: #ffb4a8; }
}

.form { display: grid; gap: 1.1rem; font-family: var(--sans); }
.form-row { display: grid; gap: 1.1rem; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
@media (max-width: 520px) { .form-row { grid-template-columns: minmax(0, 1fr); } }

.field { min-width: 0; }
.field label { display: block; margin-bottom: .4rem; font-size: .875rem; font-weight: 600; }
.field .req { color: var(--accent); }
.field input,
.field select,
.field textarea {
  width: 100%;
  padding: .7rem .85rem;
  font: inherit;
  font-size: .95rem;
  color: var(--ink);
  background: var(--bg);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: border-color .15s ease, box-shadow .15s ease;
}
.field input { min-height: 2.75rem; }
.field select {
  appearance: none;
  padding-right: 2.5rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%236e625a' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right .9rem center;
  background-size: 12px 8px;
  cursor: pointer;
}
.field input[type="number"] { font-variant-numeric: tabular-nums; }
.field textarea {
  font-family: var(--serif);
  font-size: 1.02rem;
  line-height: 1.7;
  resize: vertical;
  min-height: 6rem;
}
.field textarea.body-input { min-height: 22rem; }
.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.field.has-error input,
.field.has-error select,
.field.has-error textarea { border-color: #b42318; }
.field.has-error input:focus,
.field.has-error select:focus,
.field.has-error textarea:focus { box-shadow: 0 0 0 3px rgba(180, 35, 24, .15); }

.field .hint,
.field .counter,
.field .slug-preview {
  margin: .35rem 0 0;
  font-size: .8rem;
  line-height: 1.5;
  color: var(--muted);
}
.field .counter { text-align: right; font-variant-numeric: tabular-nums; }
.field .slug-preview code {
  padding: .1em .4em;
  border-radius: 6px;
  background: var(--accent-soft);
  color: var(--accent);
  font-family: ui-monospace, Menlo, monospace;
  font-size: .95em;
  word-break: break-all;
}
.field .field-error { margin: .35rem 0 0; font-size: .85rem; font-weight: 600; color: #b42318; }
@media (prefers-color-scheme: dark) {
  .field .field-error { color: #ffb4a8; }
}

.btn {
  justify-self: start;
  appearance: none;
  padding: .75rem 1.4rem;
  font: inherit;
  font-size: .95rem;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  text-decoration: none;
  transition: filter .15s ease, transform .05s ease;
}
.btn:hover { filter: brightness(1.06); text-decoration: none; }
.btn:active { transform: translateY(1px); }
.btn:focus-visible { outline: 3px solid var(--accent-soft); outline-offset: 2px; }
.btn:disabled { opacity: .6; cursor: progress; }
.btn-sm { padding: .45rem .95rem; font-size: .82rem; }
.btn-ghost { color: var(--accent); background: transparent; border: 1px solid var(--line); }
.btn-ghost:hover { background: var(--accent-soft); filter: none; }

.collections { margin-top: 2.5rem; }
.collections-head { margin-bottom: 1rem; }
.collections-head h2 { margin: 0; font-size: 1.25rem; }
.collection-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
.collection-card {
  display: flex;
  flex-direction: column;
  gap: .4rem;
  padding: 1.2rem 1.25rem;
  font-family: var(--sans);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 16px;
}
.collection-card h3 { margin: 0; font-family: var(--serif); font-size: 1.15rem; line-height: 1.3; }
.collection-card h3 a { color: var(--ink); }
.collection-card p { flex: 1; margin: 0; font-size: .88rem; line-height: 1.5; color: var(--muted); }
.collection-card .count {
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--accent);
}
.collection-card .actions { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: .8rem; }

.empty-state {
  padding: 2rem 1.5rem;
  text-align: center;
  font-family: var(--sans);
  font-size: .92rem;
  color: var(--muted);
  border: 1px dashed var(--line);
  border-radius: 16px;
}
`;

export const ADMIN_JS = `
(function () {
  'use strict';

  function slugify(text) {
    return text
      .normalize('NFKD')
      .replace(/[\\u0300-\\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  function countWords(text) {
    var trimmed = text.trim();
    return trimmed ? trimmed.split(/\\s+/).length : 0;
  }

  function countStanzas(text) {
    var trimmed = text.trim();
    return trimmed ? trimmed.split(/\\n\\s*\\n/).length : 0;
  }

  // Live address preview: "/t/<slug>" or "/t/<collection>/<slug>".
  document.querySelectorAll('[data-slug-preview]').forEach(function (preview) {
    var prefix = preview.getAttribute('data-slug-preview');
    var title = document.getElementById(prefix + '-title');
    var slugInput = document.getElementById(prefix + '-slug');
    var topicSelect = preview.hasAttribute('data-topic-select')
      ? document.getElementById(preview.getAttribute('data-topic-select'))
      : null;
    var code = preview.querySelector('code');

    function update() {
      var slug = slugInput.value.trim().toLowerCase() || slugify(title ? title.value : '') || '…';
      var path = topicSelect
        ? '/t/' + (topicSelect.value || '…') + '/' + slug
        : '/t/' + slug;
      code.textContent = path;
    }

    if (title) title.addEventListener('input', update);
    slugInput.addEventListener('input', update);
    if (topicSelect) topicSelect.addEventListener('change', update);
  });

  // Word and stanza counter under the text area.
  document.querySelectorAll('[data-counter-for]').forEach(function (counter) {
    var area = document.getElementById(counter.getAttribute('data-counter-for'));
    if (!area) return;
    function update() {
      counter.textContent =
        countWords(area.value) + ' words · ' + countStanzas(area.value) + ' stanzas';
    }
    area.addEventListener('input', update);
  });

  // Stop double submits and show progress.
  document.querySelectorAll('form.form').forEach(function (form) {
    form.addEventListener('submit', function () {
      var button = form.querySelector('button[type="submit"]');
      if (!button) return;
      button.disabled = true;
      button.textContent = 'Saving…';
    });
  });

  // Jump to the form when a collection's "Add a text" link is used.
  if (window.location.hash === '#add-text') {
    var textTitle = document.getElementById('text-title');
    if (textTitle) textTitle.focus({ preventScroll: true });
  }
})();
`;
