// A text is pending while its Hindi or English body still holds a placeholder note.
// Pending texts are not indexed and are left out of the sitemap until they're complete.
const PENDING = /still being added|अभी जोड़ा जा रहा है|remaining verses are still being added|Work in progress/i;

export function isPending(doc) {
  return PENDING.test(doc.body || '');
}
