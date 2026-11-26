import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mantraCounterPage } from '../src/templates.js';

test('mantra counter page has the speak-your-mantra controls', () => {
  const body = String(mantraCounterPage({ origin: 'https://example.test', topics: [] }));
  for (const id of ['mc-mic', 'mc-heard', 'mc-rec', 'mc-play', 'mc-rec-state', 'mc-speak-msg']) {
    assert.ok(body.includes(`id="${id}"`), `missing #${id}`);
  }
});

test('mantra counter script wires the speak controls', () => {
  const js = readFileSync(new URL('../public/mantra-counter.js', import.meta.url), 'utf8');
  for (const id of ['mc-mic', 'mc-rec', 'mc-play', 'mc-heard']) assert.ok(js.includes(`'${id}'`), `script misses ${id}`);
});
