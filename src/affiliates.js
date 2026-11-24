// Amazon Associates links.
// Items whose url is still PLACEHOLDER are hidden. Set enabled to false to hide the whole box.
// Amazon requires the disclosure text to stay on any page that shows these links.
export const AFFILIATES = {
  enabled: true,
  disclosure: 'As an Amazon Associate, Poojapathvala earns from qualifying purchases.',
  items: [
    { label: 'Pooja samagri kit (Lakshmi and Ganesh)', url: 'https://link.amazon/B0eHFRAYz' },
    { label: 'Pooja thali for aarti', url: 'https://link.amazon/B0eZddBVs' },
    { label: 'Bhagavad Gita (hardbound)', url: 'https://link.amazon/B06eDAvTH' },
    { label: 'Brass diya', url: 'PLACEHOLDER' },
    { label: 'Agarbatti and dhoop', url: 'PLACEHOLDER' },
    { label: 'Deity idol', url: 'PLACEHOLDER' },
  ],
};

export function activeAffiliates() {
  if (!AFFILIATES.enabled) return [];
  return AFFILIATES.items.filter((item) => item.url && item.url !== 'PLACEHOLDER');
}
