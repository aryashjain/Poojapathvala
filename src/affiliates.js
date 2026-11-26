// Amazon Associates links.
// Items whose url is still PLACEHOLDER are hidden. Set enabled to false to hide every box.
// Amazon requires the disclosure text to stay on any page that shows these links.
export const AFFILIATES = {
  enabled: true,
  disclosure: 'As an Amazon Associate, Poojapathvala earns from qualifying purchases.',
  // Shown on every text page, under "Pooja samagri".
  items: [
    { label: 'Pooja samagri kit (Lakshmi and Ganesh)', url: 'https://link.amazon/B0eHFRAYz' },
    { label: 'Pooja thali for aarti', url: 'https://link.amazon/B0eZddBVs' },
    { label: 'Bhagavad Gita (hardbound)', url: 'https://link.amazon/B06eDAvTH' },
    { label: 'Lakshmi crystal figure', url: 'https://link.amazon/B03ZipQ78' },
    { label: 'Brass diya', url: 'https://link.amazon/B05fOeNaA' },
    { label: 'Agarbatti and dhoop', url: 'PLACEHOLDER' },
    { label: 'Pooja essentials', url: 'https://link.amazon/B02WM6VES' },
  ],
  // Shown on the tarot pages, under "Tarot shop".
  tarot: [
    { label: 'Tarot cards with guidebook for beginners', url: 'https://link.amazon/B0dwr1kR9' },
    { label: 'Shifu Orboot Earth (interactive globe)', url: 'https://link.amazon/B0bJFuN1t' },
  ],
};

export function activeAffiliates(group = 'items') {
  if (!AFFILIATES.enabled) return [];
  return (AFFILIATES[group] || []).filter((item) => item.url && item.url !== 'PLACEHOLDER');
}
