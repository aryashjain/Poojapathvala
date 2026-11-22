import { test } from 'node:test';
import assert from 'node:assert/strict';
import { langFromRequest, loc, t, minutes, textCount } from '../src/i18n.js';

test('language defaults to Hindi and reads the pp-lang cookie', () => {
  assert.equal(langFromRequest(new Request('http://x/')), 'hi');
  assert.equal(langFromRequest(new Request('http://x/', { headers: { cookie: 'a=1; pp-lang=en' } })), 'en');
  assert.equal(langFromRequest(new Request('http://x/', { headers: { cookie: 'pp-lang=fr' } })), 'hi');
});

test('loc picks Hindi when available and falls back to English', () => {
  assert.equal(loc('hi', 'Hindu Texts', 'हिंदू ग्रंथ'), 'हिंदू ग्रंथ');
  assert.equal(loc('hi', 'Jain Texts', ''), 'Jain Texts');
  assert.equal(loc('en', 'Hindu Texts', 'हिंदू ग्रंथ'), 'Hindu Texts');
});

test('t fills placeholders and falls back to English keys', () => {
  assert.equal(t('en', 'matchMany', { q: 'moon', n: 3 }), '3 matches for “moon”.');
  assert.match(t('hi', 'searchButton'), /खोजें/);
});

test('reading time and counts localise', () => {
  assert.equal(minutes('hi', '4 min'), '4 मिनट');
  assert.equal(minutes('en', '4 min'), '4 min');
  assert.equal(textCount('hi', 1), '1 रचना');
  assert.equal(textCount('hi', 2), '2 रचनाएँ');
});
