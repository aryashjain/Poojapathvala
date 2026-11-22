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
