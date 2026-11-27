import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSearchDocs, searchDocs } from '../src/search.js';

test('search finds texts through their tags', () => {
  const topics = [
    {
      slug: 'pooja',
      title: 'Pooja Vidhi',
      docs: [{ slug: 'nitya', title: 'Daily Puja Vidhi', body: 'Steps.', tags: ['pooja', 'puja', 'vidhi'] }],
    },
    {
      slug: 'aarti',
      title: 'Hindu Aartis',
      docs: [{ slug: 'jagdish', title: 'Om Jai Jagdish Hare', body: 'Aarti.', tags: ['aarti', 'pooja'] }],
    },
  ];
  const docs = buildSearchDocs(topics, 'hi');
  const titles = searchDocs(docs, 'pooja').map((r) => r.title);
  assert.deepEqual(titles.sort(), ['Daily Puja Vidhi', 'Om Jai Jagdish Hare']);
  assert.equal(searchDocs(docs, 'aarti')[0].title, 'Om Jai Jagdish Hare');
});

test('a spelling variant finds the same text, in English letters or Hindi script', () => {
  const topics = [
    {
      slug: 'stotra',
      title: 'Stotra',
      titleHi: 'स्तोत्र',
      docs: [{ slug: 'bhaktamar', title: 'Bhaktamar Stotra', hindiTitle: 'भक्तामर स्तोत्र', body: 'Prayer.', tags: ['stotra', 'jain'] }],
    },
    {
      slug: 'jain',
      title: 'Jain',
      docs: [{ slug: 'jinvani', title: 'Jinvani Puja', body: 'Worship.', tags: ['puja'] }],
    },
  ];
  const docs = buildSearchDocs(topics, 'en');
  assert.equal(searchDocs(docs, 'bhaktambar')[0].title, 'Bhaktamar Stotra');
  assert.equal(searchDocs(docs, 'bhaktamar')[0].title, 'Bhaktamar Stotra');
  assert.equal(searchDocs(docs, 'भक्तामर')[0].title, 'Bhaktamar Stotra');
  assert.equal(searchDocs(docs, 'jinwani')[0].title, 'Jinvani Puja');
  assert.equal(searchDocs(docs, 'pooja')[0].title, 'Jinvani Puja');
  assert.equal(searchDocs(docs, 'strota')[0].title, 'Bhaktamar Stotra');
  assert.equal(searchDocs(docs, 'bhaktambar?!')[0].title, 'Bhaktamar Stotra');
  assert.deepEqual(searchDocs(docs, 'zzzz'), []);
});
