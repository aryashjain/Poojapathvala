// Texts related to a given text: shared tags count most, then the same collection.
export function relatedDocs(topics, topic, doc, limit = 6) {
  const tags = new Set(doc.tags || []);
  const scored = [];
  for (const other of topics) {
    for (const candidate of other.docs) {
      if (other.slug === topic.slug && candidate.slug === doc.slug) continue;
      const shared = (candidate.tags || []).filter((tag) => tags.has(tag)).length;
      const score = shared * 2 + (other.slug === topic.slug ? 1 : 0);
      if (score > 0) scored.push({ topic: other, doc: candidate, score });
    }
  }
  scored.sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));
  return scored.slice(0, limit).map(({ topic: t, doc: d }) => ({ topic: t, doc: d }));
}
