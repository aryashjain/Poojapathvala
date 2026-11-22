import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFrontmatter, renderMarkdown, escapeHtml } from '../src/markdown.js';
import { buildSearchDocs, searchDocs, plainText } from '../src/search.js';

test('parseFrontmatter reads key/value pairs and returns the body', () => {
  const { data, body } = parseFrontmatter('---\ntitle: "Hello"\norder: 2\n---\n\nBody here');
  assert.equal(data.title, 'Hello');
  assert.equal(data.order, '2');
  assert.equal(body.trim(), 'Body here');
});

test('parseFrontmatter tolerates missing frontmatter', () => {
  const { data, body } = parseFrontmatter('Just text');
  assert.deepEqual(data, {});
  assert.equal(body, 'Just text');
});

test('escapeHtml neutralises markup', () => {
  assert.equal(escapeHtml('<a href="x">&\'</a>'), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});

test('headings start at h2 because the page already has an h1', () => {
  assert.match(renderMarkdown('# Part one'), /<h2>Part one<\/h2>/);
  assert.match(renderMarkdown('### Deep'), /<h4>Deep<\/h4>/);
});

test('single newlines inside a stanza become line breaks, blank lines split stanzas', () => {
  const html = renderMarkdown('line one\nline two\n\nnext stanza');
  assert.equal(html, '<p>line one<br>\nline two</p>\n<p>next stanza</p>');
});

test('lists, quotes, rules and inline formatting render', () => {
  const html = renderMarkdown('- **bold** item\n- *soft* item\n\n> quoted\n\n---\n\nSee [home](https://example.com).');
  assert.match(html, /<ul><li><strong>bold<\/strong> item<\/li><li><em>soft<\/em> item<\/li><\/ul>/);
  assert.match(html, /<blockquote><p>quoted<\/p><\/blockquote>/);
  assert.match(html, /<hr>/);
  assert.match(html, /<a href="https:\/\/example.com" rel="noopener">home<\/a>/);
});

test('raw HTML in content is escaped, not executed', () => {
  assert.match(renderMarkdown('<script>alert(1)</script>'), /&lt;script&gt;/);
});

test('plainText strips markdown syntax', () => {
  assert.equal(plainText('## Title\n\n- **bold** and *soft*'), 'Title bold and soft');
});

const topics = [
  {
    slug: 'poems',
    title: 'Poems',
    docs: [
      { slug: 'moon', title: 'Moon Song', description: 'Night', body: 'The moon watches the river.' },
      { slug: 'sun', title: 'Sun Song', description: 'Day', body: 'The sun warms the field.' },
    ],
  },
];

test('search matches title and body, ranks title hits first', () => {
  const docs = buildSearchDocs(topics);
  const results = searchDocs(docs, 'song');
  assert.equal(results.length, 2);
  assert.equal(searchDocs(docs, 'river')[0].title, 'Moon Song');
  assert.match(searchDocs(docs, 'river')[0].snippet, /river/);
});

test('multi-word search requires every term', () => {
  const docs = buildSearchDocs(topics);
  assert.equal(searchDocs(docs, 'moon river').length, 1);
  assert.equal(searchDocs(docs, 'moon field').length, 0);
});

test('empty query returns nothing', () => {
  assert.deepEqual(searchDocs(buildSearchDocs(topics), '   '), []);
});
