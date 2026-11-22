import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, validateTopic, validateDoc } from '../src/library.js';

test('slugify makes URL-safe slugs from titles', () => {
  assert.equal(slugify('Hindu Texts!'), 'hindu-texts');
  assert.equal(slugify('  Café  Poems '), 'cafe-poems');
  assert.equal(slugify('श्रीगुरु'), '');
});

test('validateTopic accepts a minimal topic and derives the slug', () => {
  const result = validateTopic({ title: 'Night Poems' }, []);
  assert.equal(result.ok, true);
  assert.equal(result.value.slug, 'night-poems');
  assert.equal(result.value.order, 9999);
});

test('validateTopic rejects a missing title and taken slugs', () => {
  assert.equal(validateTopic({ title: '' }, []).errors.title !== undefined, true);
  const taken = validateTopic({ title: 'Poems' }, ['poems']);
  assert.match(taken.errors.slug, /already in use/);
});

test('validateTopic needs an explicit slug for non-latin titles', () => {
  const result = validateTopic({ title: 'श्रीगुरु' }, []);
  assert.ok(result.errors.slug);
  const withSlug = validateTopic({ title: 'श्रीगुरु', slug: 'shri-guru' }, []);
  assert.equal(withSlug.ok, true);
});

test('validateTopic checks slug format and order', () => {
  assert.ok(validateTopic({ title: 'X', slug: 'Bad Slug' }, []).errors.slug);
  assert.ok(validateTopic({ title: 'X', order: 'first' }, []).errors.order);
});

test('validateDoc requires a body and a real date', () => {
  assert.ok(validateDoc({ title: 'A', body: '' }, []).errors.body);
  assert.ok(validateDoc({ title: 'A', body: 'x', date: '2026-02-30' }, []).errors.date);
  const ok = validateDoc({ title: 'A', body: 'x', date: '2026-11-21', order: '2' }, []);
  assert.equal(ok.ok, true);
  assert.equal(ok.value.order, 2);
  assert.equal(ok.value.date, '2026-11-21');
});

test('validateDoc rejects duplicate text slugs within a collection', () => {
  const result = validateDoc({ title: 'Moon', body: 'x' }, ['moon']);
  assert.match(result.errors.slug, /already in use/);
});
