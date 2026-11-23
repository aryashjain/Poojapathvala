// Amazon Associates placeholders.
// 1. Replace each "PLACEHOLDER" with your real Amazon affiliate link.
// 2. Set enabled to true. Nothing is shown while enabled is false or a link is still a placeholder.
// Amazon requires the disclosure text to stay on any page that shows these links.
export const AFFILIATES = {
  enabled: false,
  disclosure: 'As an Amazon Associate, Poojapathvala earns from qualifying purchases.',
  items: [
    { label: 'Brass diya', url: 'PLACEHOLDER' },
    { label: 'Agarbatti and dhoop', url: 'PLACEHOLDER' },
    { label: 'Pooja samagri kit', url: 'PLACEHOLDER' },
    { label: 'Deity idol', url: 'PLACEHOLDER' },
  ],
};

export function activeAffiliates() {
  if (!AFFILIATES.enabled) return [];
  return AFFILIATES.items.filter((item) => item.url && item.url !== 'PLACEHOLDER');
}
