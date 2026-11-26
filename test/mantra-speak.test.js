import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mantraCounterPage } from '../src/templates.js';

test('mantra counter page has the speak-your-mantra controls', () => {
  const body = String(mantraCounterPage({ origin: 'https://example.test', topics: [] }));
  for (const id of ['mc-mic', 'mc-heard', 'mc-rec', 'mc-play', 'mc-rec-state', 'mc-speak-msg',
    'mc-tab-write', 'mc-tab-speak', 'mc-panel-write', 'mc-panel-speak', 'mc-select', 'mc-text']) {
    assert.ok(body.includes(`id="${id}"`), `missing #${id}`);
  }
  // The record button sits inside the speak panel, and the old separate speak card is gone.
  assert.ok(body.indexOf('id="mc-rec"') > body.indexOf('id="mc-panel-speak"'), 'record button must be in the speak panel');
  assert.ok(!body.includes('mc-speak"'), 'old separate speak card should be gone');
});

test('mantra counter script wires the speak controls', () => {
  const js = readFileSync(new URL('../public/mantra-counter.js', import.meta.url), 'utf8');
  for (const id of ['mc-mic', 'mc-rec', 'mc-play', 'mc-heard', 'mc-tab-speak']) assert.ok(js.includes(`'${id}'`), `script misses ${id}`);
});
