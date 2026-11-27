// Search over the library's documents. Pure functions so they can be tested
// in Node and used by the Worker without any extra dependencies.

// Spelling groups: the same word typed in English letters (with common spellings) or in Hindi script.
// A query term matches any spelling in its group, so "bhaktambar", "bhaktamar" and "भक्तामर" find the same text.
export const SPELLING_GROUPS = [
  ['bhaktamar', 'bhaktambar', 'bhaktamber', 'bhaktamaar', 'भक्तामर'],
  ['jinvani', 'jinwani', 'jinavani', 'जिनवाणी'],
  ['puja', 'pooja', 'pujaa', 'पूजा'],
  ['pooja vidhi', 'puja vidhi', 'पूजा विधि'],
  ['chalisa', 'chalisha', 'chaleesa', 'चालीसा'],
  ['aarti', 'arti', 'aarati', 'aratee', 'आरती'],
  ['stotra', 'strota', 'stotram', 'stotr', 'स्तोत्र'],
  ['mantra', 'mantr', 'मंत्र', 'मन्त्र'],
  ['navkar', 'namokar', 'namokaar', 'navkaar', 'नवकार', 'णमोकार'],
  ['bhavna', 'bhavana', 'bhawna', 'भावना'],
  ['dhal', 'dhala', 'dhaal', 'ढाल', 'छहढाला', 'chhahdhala', 'chahdhala', 'chhaha dhala'],
  ['tirthankar', 'tirthankara', 'tirthankaar', 'तीर्थंकर'],
  ['adinath', 'aadinath', 'adinatha', 'आदिनाथ'],
  ['parshvanath', 'parsvanath', 'parshwanath', 'पार्श्वनाथ'],
  ['mahavir', 'mahaveer', 'mahavira', 'महावीर'],
  ['shiv', 'shiva', 'shiv ji', 'शिव'],
  ['hanuman', 'hanumaan', 'hanumana', 'हनुमान'],
  ['krishna', 'krsna', 'krisna', 'कृष्ण'],
  ['ganesh', 'ganesha', 'ganes', 'गणेश'],
  ['lakshmi', 'laxmi', 'lakshami', 'लक्ष्मी'],
  ['durga', 'durgaa', 'दुर्गा'],
  ['gita', 'geeta', 'गीता'],
  ['vidhi', 'vidhee', 'विधि'],
  ['shani', 'sani', 'शनि'],
  ['gayatri', 'gayatree', 'गायत्री'],
  ['hindi', 'hindee', 'हिन्दी', 'हिंदी'],
  ['sahasranama', 'sahasranam', 'सहस्रनाम'],
];
const VARIANTS = new Map();
for (const group of SPELLING_GROUPS) {
  for (const spelling of group) VARIANTS.set(spelling.toLowerCase(), group.map((x) => x.toLowerCase()));
}

// Every spelling a query term may match. Unknown terms match only themselves.
export function variantsOf(term) {
  return VARIANTS.get(term) || [term];
}

// Keep letters from any script, digits and spaces; drop punctuation a visitor may type.
export function cleanQuery(query) {
  return query.toLowerCase().replace(/[^\p{L}\p{N}\p{M}\s-]/gu, ' ').replace(/\s+/g, ' ').trim();
}

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
      const text = plainText([doc.body, doc.bodyEn || ''].join('\n'));
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
  const terms = cleanQuery(query).split(/\s+/).filter(Boolean).slice(0, 8);
  if (terms.length === 0) return [];

  const results = [];
  for (const doc of docs) {
    // Every term must appear somewhere, so multi-word searches narrow results.
    if (!terms.every((term) => variantsOf(term).some((v) => doc.haystack.includes(v)))) continue;

    const titleLower = doc.title.toLowerCase();
    const titleHits = terms.filter((term) => variantsOf(term).some((v) => titleLower.includes(v))).length;
    const bodyHits = terms.reduce((sum, term) => sum + Math.max(...variantsOf(term).map((v) => countOccurrences(doc.haystack, v))), 0);

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
