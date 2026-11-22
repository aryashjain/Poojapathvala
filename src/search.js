// Search over the library's documents. Pure functions so they can be tested
// in Node and used by the Worker without any extra dependencies.

export function plainText(markdown) {
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// Every field is searchable in both languages; results show the active language.
export function buildSearchDocs(topics, lang = 'en') {
  return topics.flatMap((topic) =>
    topic.docs.map((doc) => {
      const text = plainText(doc.body);
      const pick = (en, hi) => (lang === 'hi' && hi ? hi : en);
      return {
        title: pick(doc.title, doc.hindiTitle),
        description: pick(doc.description, doc.descriptionHi),
        topic: pick(topic.title, topic.titleHi),
        url: '/t/' + topic.slug + '/' + doc.slug,
        text,
        haystack: [doc.title, doc.hindiTitle, doc.description, doc.descriptionHi, topic.title, topic.titleHi, text, ...(doc.tags || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      };
    }),
  );
}

function countOccurrences(haystack, term) {
  return haystack.split(term).length - 1;
}

function snippetFor(doc, terms) {
  const lower = doc.text.toLowerCase();
  for (const term of terms) {
    const index = lower.indexOf(term);
    if (index >= 0) {
      const start = Math.max(0, index - 60);
      const end = Math.min(doc.text.length, index + term.length + 100);
      return (start > 0 ? '…' : '') + doc.text.slice(start, end) + (end < doc.text.length ? '…' : '');
    }
  }
  return doc.description || doc.text.slice(0, 160);
}

export function searchDocs(docs, query, limit = 20) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  if (terms.length === 0) return [];

  const results = [];
  for (const doc of docs) {
    // Every term must appear somewhere, so multi-word searches narrow results.
    if (!terms.every((term) => doc.haystack.includes(term))) continue;

    const titleLower = doc.title.toLowerCase();
    const titleHits = terms.filter((term) => titleLower.includes(term)).length;
    const bodyHits = terms.reduce((sum, term) => sum + countOccurrences(doc.haystack, term), 0);

    results.push({
      title: doc.title,
      topic: doc.topic,
      url: doc.url,
      snippet: snippetFor(doc, terms),
      score: titleHits * 3 + bodyHits,
    });
  }

  results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return results.slice(0, limit).map(({ score, ...result }) => result);
}
