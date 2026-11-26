import { escapeHtml, renderMarkdown } from './markdown.js';
import { t, loc, minutes, textCount, formatDate } from './i18n.js';
import { isPending } from './status.js';
import { CARDS, SPREADS, SUIT_LABELS } from './tarot-data.js';
import { TOPICS } from './tarot-topics.js';
import { DEEP } from './tarot-deep.js';
import { ASSET_VERSION } from './version.js';
import { activeAffiliates, AFFILIATES } from './affiliates.js';
import { moonInfo } from './moon.js';
import { GITA_VERSES, EMOTIONS, verseById } from './geeta.js';

// A small, fixed 300x250 ad box. The slot is filled by app.js.
function adBox() {
  return '<aside class="ad-box" aria-label="Advertisement"><ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-1842686497509208" data-ad-slot="1476188914"></ins></aside>';
}

// Shopping links for pooja and aarti texts. Shown only when affiliates are enabled.
function affiliateBox(lang, doc) {
  const tags = doc.tags || [];
  const items = activeAffiliates();
  if (!items.length) return '';
  return shopBox('Pooja samagri', items);
}

function tarotShopBox() {
  const items = activeAffiliates('tarot');
  return items.length ? shopBox('Tarot shop', items) : '';
}

function shopBox(heading, items) {
  return (
    '<aside class="shop" aria-labelledby="shop-title">' +
    '<h2 id="shop-title">' + e(heading) + '</h2><ul>' +
    items.map((item) => '<li><a href="' + e(item.url) + '" rel="sponsored nofollow noopener" target="_blank">' + e(item.label) + '</a></li>').join('') +
    '</ul><p class="disclosure">' + e(AFFILIATES.disclosure) + '</p></aside>'
  );
}

const e = escapeHtml;

// Shown at the bottom of every tarot page.
const TAROT_NOTE = '<p class="tarot-note">Not a guide, just a sign from a deck of cards. We take no responsibility for what you decide.</p>';

// Page titles carry both names in Hindi mode, e.g. "हिंदू आरती संग्रह (Hindu Aartis)",
// so searches in either language match the page.
function titleName(lang, en, hi) {
  if (lang === 'hi' && hi && en && en !== hi) return hi + ' (' + en + ')';
  return loc(lang, en, hi);
}

const SITE_TAGLINE_EN = 'Sacred texts, aartis, pooja, stotras and poetry, clean and easy to share.';

// Keywords meta on every page. Aarti and pooja lead, in Hindi and English.
const SITE_KEYWORDS =
  'आरती, aarti, हिंदू आरती, hindu aarti, आरती संग्रह, aarti sangrah, ' +
  'पूजा, pooja, पूजा विधि, pooja vidhi, puja vidhi, नित्य पूजा, daily puja, ' +
  'चालीसा, chalisa, स्तोत्र, stotra, मंत्र, mantra, पवित्र ग्रंथ, sacred texts, Poojapathvala';

function safeJson(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function searchForm(lang, variant, query = '') {
  const id = 'q-' + variant;
  const size = variant === 'home' ? ' search-home' : '';
  return (
    '<form class="search' + size + '" role="search" action="/search" method="get" data-search-form' +
    ' data-no-match="' + e(t(lang, 'panelNone')) + '"' +
    ' data-see-all="' + e(t(lang, 'seeAll')) + '">' +
    '<label class="visually-hidden" for="' + id + '">' + e(t(lang, 'searchLabel')) + '</label>' +
    '<input id="' + id + '" type="search" name="q" value="' + e(query) + '" ' +
    'placeholder="' + e(t(lang, 'searchPlaceholder')) + '" autocomplete="off" required>' +
    '<button type="submit">' + e(t(lang, 'searchButton')) + '</button>' +
    '<div class="search-panel" data-search-panel hidden></div>' +
    '</form>'
  );
}

function langToggle(lang, path) {
  const other = lang === 'hi' ? 'en' : 'hi';
  return (
    '<a class="lang-toggle" href="/lang/' + other + '?next=' + encodeURIComponent(path) + '"' +
    ' lang="' + other + '" hreflang="' + other + '" aria-label="' + e(t(lang, 'langToggleAria')) + '">' +
    e(t(lang, 'langToggle')) +
    '</a>'
  );
}

// One column of footer links.
// Every tool on the site. The navbar and the index page both read this list.
export const TOOLS = [
  { path: '/', en: 'Texts', hi: 'ग्रंथ', desc: 'The library of chalisas, aartis, stotras, mantras and pooja vidhi.' },
  { path: '/tarot', en: 'Tarot', hi: 'टैरो', desc: 'Draw cards, a yes or no answer, and a positive card for the day.' },
  { path: '/mantra-counter', en: 'Mala', hi: 'माला', desc: 'A 108-bead japa counter with a chanting timer.' },
  { path: '/zen', en: 'Zen', hi: 'ज़ेन', desc: 'Release a worry into stardust, draw in sand, and breathe with the light.' },
  { path: '/geeta-says', en: 'Geeta Says', hi: 'गीता कहती है', desc: 'A Bhagavad Gita verse for what is weighing on you, and a one-minute reset.' },
  { path: '/ritual/release', en: 'Burn your worry', hi: 'चिंता जलाएँ', desc: 'Write a worry, hold the flame, and watch it burn.' },
  { path: '/moon', en: 'Moon', hi: 'चंद्र', desc: 'Today\'s moon phase, the next full moon, and the moon on your birth date.' },
  { path: '/sleep', en: 'Sleep', hi: 'नींद', desc: 'A bedtime wind-down with breathing, a timer and night sounds.' },
];

// The navbar: Index first, then the tools. The current page is marked.
function siteNav(lang, path) {
  const items = [['/index', loc(lang, 'Index', 'सूची')], ['/', loc(lang, 'Texts', 'ग्रंथ')]].concat(
    TOOLS.filter((tool) => tool.path !== '/').map((tool) => [tool.path, loc(lang, tool.en, tool.hi)]));
  return '<nav class="site-nav" aria-label="' + e(loc(lang, 'Tools', 'उपकरण')) + '"><div class="site-nav-inner">' +
    items.map(([href, label]) => {
      const current = href === path || (href === '/' && path === '/');
      return '<a href="' + e(href) + '"' + (current ? ' aria-current="page"' : '') + '>' + e(label) + '</a>';
    }).join('') + '</div></nav>';
}

// A quiet link to Geeta Says for pages where someone may be stuck.
export function geetaPill() {
  return '<p class="zen-pill-wrap"><a class="zen-pill" href="/geeta-says">Feeling stuck? Ask Geeta Says →</a></p>';
}

function footerGroup(title, links) {
  return (
    '<nav class="sf-col" aria-label="' + e(title) + '"><h2>' + e(title) + '</h2><ul>' +
    links.map(([href, label]) => '<li><a href="' + e(href) + '">' + e(label) + '</a></li>').join('') +
    '</ul></nav>'
  );
}

function layout({
  lang = 'hi',
  origin,
  path,
  title,
  description,
  body,
  type = 'website',
  jsonLd,
  noindex = false,
  wide = false,
  showLangToggle = true,
  extraCss = [],
  extraJs = [],
}) {
  const url = origin + path;
  const wrap = wide ? 'wrap wide' : 'wrap';
  const brand = t(lang, 'brandName');
  return (
    '<!doctype html>\n<html lang="' + lang + '">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<script src="/assets/theme.js?v=' + ASSET_VERSION + '"></script>\n' +
    '<title>' + e(title) + '</title>\n' +
    '<meta name="description" content="' + e(description) + '">\n' +
    '<meta name="keywords" content="' + e(SITE_KEYWORDS) + '">\n' +
    '<link rel="canonical" href="' + e(url) + '">\n' +
    (noindex ? '<meta name="robots" content="noindex">\n' : '') +
    '<meta property="og:site_name" content="Poojapathvala">\n' +
    '<meta property="og:locale" content="' + (lang === 'hi' ? 'hi_IN' : 'en_US') + '">\n' +
    '<meta property="og:type" content="' + type + '">\n' +
    '<meta property="og:title" content="' + e(title) + '">\n' +
    '<meta property="og:description" content="' + e(description) + '">\n' +
    '<meta property="og:url" content="' + e(url) + '">\n' +
    '<meta property="og:image" content="' + e(origin + '/og.png') + '">\n' +
    '<meta name="twitter:image" content="' + e(origin + '/og.png') + '">\n' +
    '<meta name="p:domain_verify" content="a0fef6de6c6aef3d453139c11fd8b807">\n' +
    '<link rel="icon" type="image/png" sizes="32x32" href="/favicon.png">\n' +
    '<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">\n' +
    '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n' +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    '<meta name="theme-color" content="#fbfaf6">\n' +
    '<link rel="stylesheet" href="/assets/site.css?v=' + ASSET_VERSION + '">\n' +
    extraCss.map((href) => '<link rel="stylesheet" href="' + e(href) + '?v=' + ASSET_VERSION + '">\n').join('') +
    (jsonLd ? '<script type="application/ld+json">' + safeJson(jsonLd) + '</script>\n' : '') +
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1842686497509208" crossorigin="anonymous"></script>\n' +
    '</head>\n<body>\n' +
    '<header class="site-header"><div class="' + wrap + ' header-inner">' +
    '<a class="brand" href="/" lang="' + lang + '">' +
    '<span class="brand-mark"><img src="/mark-96.png" width="96" height="96" alt=""></span>' +
    '<span class="brand-name">' + e(brand) + '</span></a>' +
    (showLangToggle ? langToggle(lang, path) : '') +
    searchForm(lang, 'header') +
    '</div></header>\n' +
    siteNav(lang, path) +
    '<main class="' + wrap + '">\n' + body + '\n' + (path.startsWith('/tarot') ? tarotShopBox() + TAROT_NOTE : '') + '</main>\n' +
    '<footer class="site-footer"><div class="' + wrap + ' sf-grid">' +
    '<div class="sf-brand"><span class="sf-name">' + e(brand) + '</span><p>' + e(t(lang, 'tagline')) + '</p></div>' +
    footerGroup(loc(lang, 'Explore', 'खोजें'), [
      ['/tarot', loc(lang, 'Tarot reader', 'टैरो रीडर')],
      ['/mantra-counter', loc(lang, 'Mantra counter', 'मंत्र काउंटर')],
      ['/ritual/release', loc(lang, 'Burn your worry', 'चिंता जलाएँ')],
      ['/moon', loc(lang, 'Moon phase', 'चंद्र चरण')],
      ['/sleep', loc(lang, 'Bedtime wind-down', 'सोने से पहले')],
    ]) +
    footerGroup(loc(lang, 'About', 'परिचय'), [
      ['/about', loc(lang, 'About us', 'हमारे बारे में')],
      ['/contact', loc(lang, 'Contact', 'संपर्क')],
      ['/privacy', loc(lang, 'Privacy', 'गोपनीयता')],
      ['/sitemap.xml', t(lang, 'sitemap')],
    ]) +
    footerGroup(loc(lang, 'Help us', 'सहायता करें'), [
      ['/feedback', t(lang, 'feedbackLink')],
      ['/admin', t(lang, 'addTexts')],
    ]) +
    '</div><div class="' + wrap + ' sf-bottom"><span>© ' + new Date().getFullYear() + ' ' + e(brand) + '</span>' +
    '<span>' + e(loc(lang, 'Hindi and English', 'हिंदी और अंग्रेज़ी')) + '</span></div></footer>\n' +
    '<script src="/assets/posthog.js" defer></script>\n' +
    '<script src="/assets/app.js?v=' + ASSET_VERSION + '" defer></script>\n' +
    extraJs.map((src) => '<script src="' + e(src) + '?v=' + ASSET_VERSION + '" defer></script>\n').join('') +
    '</body>\n</html>\n'
  );
}

// One row in a text list. The active language leads; the other one sits underneath.
function docItem(lang, topic, doc, note) {
  const main = loc(lang, doc.title, doc.hindiTitle);
  const mainLang = lang === 'hi' && doc.hindiTitle ? 'hi' : 'en';
  const alt = lang === 'hi' ? (doc.hindiTitle ? doc.title : '') : doc.hindiTitle || '';
  const altLang = lang === 'hi' ? 'en' : 'hi';
  return (
    '<li><a href="/t/' + e(topic.slug) + '/' + e(doc.slug) + '">' +
    '<span class="doc-title" lang="' + mainLang + '">' + e(main) + '</span>' +
    (alt ? '<span class="doc-hindi" lang="' + altLang + '">' + e(alt) + '</span>' : '') +
    (note ? '<span class="doc-desc">' + e(note) + '</span>' : '') +
    '</a></li>'
  );
}

function featuredDocs(topics) {
  return topics.flatMap((topic) => topic.docs.filter((doc) => doc.featured).map((doc) => ({ topic, doc })));
}

function docNote(lang, topic, doc) {
  return loc(lang, doc.description, doc.descriptionHi) || minutes(lang, doc.readingTime);
}

// Homepage: draw one positive tarot card. Only cards with a positive tone are offered.
function homeDrawSection(lang, hidden = false) {
  const positive = CARDS.filter((c) => c.tone === 'p').map((c) => ({
    id: c.id,
    name: c.name,
    upright: c.upright,
    sub: c.arcana === 'major' ? SUIT_LABELS.major : SUIT_LABELS[c.suit],
    number: c.number,
  }));
  const data = JSON.stringify(positive).replace(/</g, '\\u003c');
  return (
    '<section class="hc" aria-labelledby="hc-title"' + (hidden ? ' hidden' : '') + '><h2 id="hc-title" class="hc-title">' +
    e(loc(lang, 'Draw one positive card today', 'आज एक सकारात्मक कार्ड खींचें')) + '</h2>' +
    '<button id="hc-draw" class="tarot-cta hc-btn" type="button">✨ ' + e(loc(lang, 'Draw a positive tarot card', 'सकारात्मक टैरो कार्ड खींचें')) + '</button>' +
    '<div id="hc-result" class="hc-result" aria-live="polite" hidden></div>' +
    '<script type="application/json" id="hc-data">' + data + '</script>' +
    '</section>'
  );
}

export function homePage({ lang, origin, topics }) {
  const cards = topics
    .map(
      (topic) =>
        '<a class="topic-card" href="/t/' + e(topic.slug) + '">' +
        '<span class="topic-count">' + e(textCount(lang, topic.docs.length)) + '</span>' +
        '<h2 lang="' + (lang === 'hi' && topic.titleHi ? 'hi' : 'en') + '">' + e(loc(lang, topic.title, topic.titleHi)) + '</h2>' +
        (loc(lang, topic.description, topic.descriptionHi)
          ? '<p>' + e(loc(lang, topic.description, topic.descriptionHi)) + '</p>'
          : '') +
        '</a>',
    )
    .join('');

  const featured = featuredDocs(topics);
  const featuredList = featured.length
    ? '<section class="featured" aria-labelledby="featured-title">' +
      '<h2 id="featured-title">' + e(t(lang, 'featured')) + '</h2>' +
      '<ol class="doc-list">' +
      featured
        .map(({ topic, doc }) => {
          const topicName = loc(lang, topic.title, topic.titleHi);
          const reading = minutes(lang, doc.readingTime);
          return docItem(lang, topic, doc, topicName + (reading ? ' · ' + reading : ''));
        })
        .join('') +
      '</ol></section>'
    : '';

  const body =
    '<section class="hero">' +
    '<p class="eyebrow">' + e(t(lang, 'homeEyebrow')) + '</p>' +
    '<h1>' + e(t(lang, 'tagline')) + '</h1>' +
    '<p class="lede">' + e(t(lang, 'homeLede')) + '</p>' +
    searchForm(lang, 'home') +
    '<p><a class="tarot-cta" href="/tarot">🔮 Tarot reader · टैरो रीडर</a> <a class="tarot-cta" href="/mantra-counter">📿 Mantra counter · मंत्र काउंटर</a> <a class="tarot-cta" href="/ritual/release">🔥 Burn your worry · चिंता जलाएँ</a> <a class="tarot-cta" href="/zen">🪷 Zen space · ज़ेन स्पेस</a></p>' +
    '<p class="kind-links">' + kindLinks(lang, topics) + '</p>' +
    '</section>' +
    '<section class="topics" aria-label="' + e(t(lang, 'collectionsAria')) + '">' +
    (cards || '<p>' + e(t(lang, 'noCollections')) + '</p>') +
    '</section>' +
    featuredList +
    adBox();

  return layout({
    lang,
    origin,
    path: '/',
    title:
      t(lang, 'brandName') +
      ' · ' +
      (lang === 'hi' ? 'आरती, पूजा, स्तोत्र, मंत्र (Aarti, Pooja, Stotra, Mantra)' : 'Aarti, Pooja, Stotra, Mantra'),
    description: t(lang, 'homeDescription'),
    body,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: t(lang, 'brandName'),
        alternateName: ['Poojapathvala', 'पूजापाठवाला'],
        url: origin + '/',
        inLanguage: ['hi', 'en'],
        potentialAction: {
          '@type': 'SearchAction',
          target: origin + '/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Poojapathvala',
        url: origin + '/',
        logo: origin + '/logo.png',
      },
    ],
  });
}

export function topicPage({ lang, origin, topic }) {
  const name = loc(lang, topic.title, topic.titleHi);
  const description = loc(lang, topic.description, topic.descriptionHi);
  const list = topic.docs.map((doc) => docItem(lang, topic, doc, docNote(lang, topic, doc))).join('');

  const body =
    '<nav class="crumbs" aria-label="' + e(t(lang, 'breadcrumb')) + '"><a href="/">' + e(t(lang, 'home')) + '</a><span>/</span>' +
    e(name) + '</nav>' +
    '<header class="page-head"><h1>' + e(name) + '</h1>' +
    (description ? '<p class="lede">' + e(description) + '</p>' : '') +
    '</header>' +
    (topic.intro ? '<div class="prose">' + renderMarkdown(topic.intro) + '</div>' : '') +
    '<ol class="doc-list">' + (list || '<li class="empty">' + e(t(lang, 'noTexts')) + '</li>') + '</ol>';

  return layout({
    lang,
    origin,
    path: '/t/' + topic.slug,
    title: titleName(lang, topic.title, topic.titleHi) + ' · ' + t(lang, 'brandName'),
    description: description || t(lang, 'topicDescription', { name: name }),
    body,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: topic.title,
        description: topic.description,
        url: origin + '/t/' + topic.slug,
        hasPart: topic.docs.map((doc) => ({
          '@type': 'CreativeWork',
          name: doc.title,
          url: origin + '/t/' + topic.slug + '/' + doc.slug,
        })),
      },
      breadcrumbs(origin, [
        { name: 'Home', path: '/' },
        { name: topic.title, path: '/t/' + topic.slug },
      ]),
    ],
  });
}

// FAQPage markup. Every question and answer must also appear on the page.
function faqPage(items) {
  const entries = items.filter(([q, a]) => q && a);
  if (!entries.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

function breadcrumbs(origin, items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: origin + item.path,
    })),
  };
}

function readerBar(lang, shareUrl, shareText) {
  const whatsapp = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + shareUrl);
  return (
    '<div class="reader-bar" role="toolbar" aria-label="' + e(t(lang, 'readerLabel')) + '"' +
    ' data-copied="' + e(t(lang, 'copied')) + '"' +
    ' data-copy-failed="' + e(t(lang, 'copyFailed')) + '"' +
    ' data-copy-unsupported="' + e(t(lang, 'copyUnsupported')) + '">' +
    '<div class="reader-group" role="group" aria-label="' + e(t(lang, 'sizeGroup')) + '">' +
    '<button type="button" data-size-step="-1" aria-label="' + e(t(lang, 'sizeSmaller')) + '">A−</button>' +
    '<button type="button" data-size-step="1" aria-label="' + e(t(lang, 'sizeLarger')) + '">A+</button>' +
    '</div>' +
    '<div class="reader-group" role="group" aria-label="' + e(t(lang, 'modeGroup')) + '">' +
    '<button type="button" data-theme-set="light" aria-pressed="true">' + e(t(lang, 'modeLight')) + '</button>' +
    '<button type="button" data-theme-set="sepia" aria-pressed="false">' + e(t(lang, 'modeSepia')) + '</button>' +
    '<button type="button" data-theme-set="dark" aria-pressed="false">' + e(t(lang, 'modeDark')) + '</button>' +
    '</div>' +
    '<span class="spacer"></span>' +
    '<div class="reader-group" role="group" aria-label="' + e(t(lang, 'shareGroup')) + '">' +
    '<a class="chip" href="' + e(whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a>' +
    '<button type="button" data-copy-url>' + e(t(lang, 'copyLink')) + '</button>' +
    '<button type="button" data-print>' + e(t(lang, 'printText')) + '</button>' +
    '</div>' +
    '</div>'
  );
}

// Links to other texts that share tags with this one.
function relatedSection(lang, related) {
  if (!related.length) return '';
  return (
    '<section class="related" aria-labelledby="related-title">' +
    '<h2 id="related-title">' + e(t(lang, 'relatedTitle')) + '</h2>' +
    '<ol class="doc-list">' +
    related.map(({ topic, doc }) => docItem(lang, topic, doc, docNote(lang, topic, doc))).join('') +
    '</ol></section>'
  );
}

// Search intent per kind of text, taken from the tags on each text.
const KIND_SEO = [
  ['chalisa', 'Chalisa lyrics in Hindi with meaning'],
  ['aarti', 'Aarti lyrics in Hindi'],
  ['mantra', 'Mantra meaning and benefits'],
  ['pooja', 'Pooja vidhi step by step'],
  ['stotra', 'Stotra in Hindi with meaning'],
];

function seoKind(doc) {
  const tags = doc.tags || [];
  const hit = KIND_SEO.find(([tag]) => tags.includes(tag));
  return hit ? hit[1] : '';
}

function pageTitle(lang, doc, topic) {
  const kind = seoKind(doc);
  const name = titleName(lang, doc.title, doc.hindiTitle);
  const brand = t(lang, 'brandName');
  return kind ? name + ' · ' + kind + ' · ' + brand : name + ' · ' + titleName(lang, topic.title, topic.titleHi) + ' · ' + brand;
}

function pageDescription(lang, doc) {
  const base = loc(lang, doc.description, doc.descriptionHi) || doc.title;
  const kind = seoKind(doc);
  return kind ? base + ' ' + kind + ' on Poojapathvala.' : base;
}

export function docPage({ lang, origin, topic, doc, prev, next, related = [] }) {
  const path = '/t/' + topic.slug + '/' + doc.slug;
  const url = origin + path;
  const main = loc(lang, doc.title, doc.hindiTitle);
  const mainLang = lang === 'hi' && doc.hindiTitle ? 'hi' : 'en';
  const alt = lang === 'hi' ? (doc.hindiTitle ? doc.title : '') : doc.hindiTitle || '';
  const altLang = lang === 'hi' ? 'en' : 'hi';
  const topicName = loc(lang, topic.title, topic.titleHi);
  const description = docNote(lang, topic, doc);

  const pager =
    '<nav class="pager" aria-label="' + e(t(lang, 'moreInCollection')) + '">' +
    (prev
      ? '<a class="prev" href="/t/' + e(topic.slug) + '/' + e(prev.slug) + '"><span>' + e(t(lang, 'prev')) + '</span>' +
        e(loc(lang, prev.title, prev.hindiTitle)) + '</a>'
      : '<span></span>') +
    (next
      ? '<a class="next" href="/t/' + e(topic.slug) + '/' + e(next.slug) + '"><span>' + e(t(lang, 'next')) + '</span>' +
        e(loc(lang, next.title, next.hindiTitle)) + '</a>'
      : '<span></span>') +
    '</nav>';

  const reading = minutes(lang, doc.readingTime);
  const meta = [
    doc.author ? '<span>' + e(doc.author) + '</span>' : '',
    reading ? '<span>' + e(reading) + '</span>' : '',
    doc.date ? '<span><time datetime="' + e(doc.date) + '">' + e(formatDate(lang, doc.date)) + '</time></span>' : '',
  ].join('');

  const body =
    '<nav class="crumbs" aria-label="' + e(t(lang, 'breadcrumb')) + '"><a href="/">' + e(t(lang, 'home')) + '</a><span>/</span>' +
    '<a href="/t/' + e(topic.slug) + '">' + e(topicName) + '</a></nav>' +
    '<article class="article">' +
    '<header class="page-head">' +
    '<p class="eyebrow">' + e(topicName) + '</p>' +
    '<h1 lang="' + mainLang + '">' + e(main) + '</h1>' +
    (alt ? '<p class="hindi-title" lang="' + altLang + '">' + e(alt) + '</p>' : '') +
    (description ? '<p class="deck">' + e(description) + '</p>' : '') +
    (meta ? '<p class="byline">' + meta + '</p>' : '') +
    '</header>' +
    readerBar(lang, url, main) +
    '<div class="prose">' + renderMarkdown(lang === 'en' && doc.bodyEn ? doc.bodyEn : doc.body) + '</div>' +
    '</article>' +
    affiliateBox(lang, doc) +
    (doc.tags && doc.tags.includes('aarti') ? geetaPill() : '') +
    pager +
    relatedSection(lang, related) +
    adBox();

  const article = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: doc.title,
    description: doc.description || undefined,
    datePublished: doc.date || undefined,
    author: doc.author ? { '@type': 'Person', name: doc.author } : undefined,
    inLanguage: doc.hindiTitle ? ['hi', 'en'] : 'en',
    mainEntityOfPage: url,
    isPartOf: { '@type': 'CreativeWorkSeries', name: topic.title, url: origin + '/t/' + topic.slug },
  };

  return layout({
    lang,
    origin,
    path,
    title: pageTitle(lang, doc, topic),
    description: pageDescription(lang, doc),
    body,
    type: 'article',
    noindex: isPending(doc),
    jsonLd: [
      article,
      breadcrumbs(origin, [
        { name: 'Home', path: '/' },
        { name: topic.title, path: '/t/' + topic.slug },
        { name: doc.title, path },
      ]),
      doc.tags && doc.tags.includes('aarti')
        ? faqPage([
            ['What is the ' + doc.title + '?', doc.description],
            ['Is the ' + doc.title + ' written in Hindi?', doc.hindiTitle ? 'Yes. The lyrics are in Hindi, in Devanagari script.' : ''],
          ])
        : null,
    ].filter(Boolean),
  });
}

export function searchPage({ lang, origin, query, results }) {
  let summary;
  if (!query) summary = t(lang, 'searchPrompt');
  else if (results.length === 0) summary = t(lang, 'searchNone', { q: query });
  else if (results.length === 1) summary = t(lang, 'matchOne', { q: query });
  else summary = t(lang, 'matchMany', { q: query, n: results.length });

  const list = results
    .map(
      (result) =>
        '<li><a href="' + e(result.url) + '">' +
        '<span class="doc-title">' + e(result.title) + '</span>' +
        '<span class="doc-desc">' + e(result.topic) + '</span>' +
        '<span class="snippet">' + e(result.snippet) + '</span>' +
        '</a></li>',
    )
    .join('');

  const body =
    '<header class="page-head"><h1>' + e(t(lang, 'searchTitle')) + '</h1>' +
    '<p class="lede">' + e(summary) + '</p></header>' +
    searchForm(lang, 'page', query) +
    '<ol class="doc-list results">' + list + '</ol>';

  return layout({
    lang,
    origin,
    path: '/search',
    title: (query ? query + ' · ' : '') + t(lang, 'searchTitle') + ' · ' + t(lang, 'brandName'),
    description: t(lang, 'searchPrompt'),
    body,
    noindex: true,
  });
}

export function notFoundPage({ lang, origin }) {
  const body =
    '<header class="page-head"><h1>' + e(t(lang, 'notFoundTitle')) + '</h1>' +
    '<p class="lede">' + e(t(lang, 'notFoundLede')) + ' <a href="/">' +
    e(t(lang, 'returnHome', { name: t(lang, 'brandName') })) + '</a>.</p></header>';
  return layout({
    lang,
    origin,
    path: '/404',
    title: t(lang, 'notFoundTitle') + ' · ' + t(lang, 'brandName'),
    description: t(lang, 'notFoundLede'),
    body,
    noindex: true,
  });
}

export function adminNoticePage({ origin, title, message }) {
  const body =
    '<header class="page-head"><h1>' + e(title) + '</h1>' +
    '<p class="lede">' + e(message) + '</p></header>';
  return layout({
    lang: ADMIN_LANG,
    origin,
    path: '/admin',
    title: title + ' · ' + t(ADMIN_LANG, 'brandName'),
    description: 'Admin.',
    body,
    noindex: true,
    showLangToggle: false,
  });
}

// ---- feedback -------------------------------------------------------------

const FEEDBACK_TYPE_KEYS = { bug: 'typeBug', content: 'typeContent', idea: 'typeIdea', other: 'typeOther' };

function feedbackField(lang, name, labelKey, type, values, errors, required = false) {
  const error = errors[name];
  return (
    '<div class="field' + (error ? ' has-error' : '') + '">' +
    '<label for="fb-' + name + '">' + e(t(lang, labelKey)) + (required ? ' <span class="req" aria-hidden="true">*</span>' : '') + '</label>' +
    '<input id="fb-' + name + '" name="' + name + '" type="' + type + '" maxlength="120"' +
    (required ? ' required' : '') +
    ' value="' + e(values[name] || '') + '"' + (error ? ' aria-invalid="true"' : '') + '>' +
    (error ? '<p class="field-error">' + e(t(lang, error)) + '</p>' : '') +
    '</div>'
  );
}

export function feedbackPage({ lang, origin, enabled = true, sent = false, values = {}, errors = {} }) {
  const title = t(lang, 'feedbackTitle');
  const head =
    '<header class="page-head"><h1>' + e(title) + '</h1>' +
    '<p class="lede">' + e(t(lang, 'feedbackLede')) + '</p></header>';

  let body;
  if (!enabled) {
    body = head + '<div class="empty-state">' + e(t(lang, 'feedbackDisabled')) + '</div>';
  } else if (sent) {
    body =
      head +
      '<div class="alert-ok" role="status">' + e(t(lang, 'feedbackThanks')) + '</div>' +
      '<p><a href="/">' + e(t(lang, 'home')) + '</a></p>';
  } else {
    const summary = Object.values(errors);
    const errorBox = summary.length
      ? '<div class="alert" role="alert"><ul>' + summary.map((key) => '<li>' + e(t(lang, key)) + '</li>').join('') + '</ul></div>'
      : '';
    const typeOptions = Object.entries(FEEDBACK_TYPE_KEYS)
      .map(([value, key]) => '<option value="' + value + '"' + (values.type === value ? ' selected' : '') + '>' + e(t(lang, key)) + '</option>')
      .join('');
    const message = values.message || '';
    body =
      head +
      '<section class="panel">' +
      errorBox +
      '<form method="post" action="/feedback" class="form">' +
      feedbackField(lang, 'name', 'feedbackName', 'text', values, errors) +
      feedbackField(lang, 'email', 'feedbackEmail', 'email', values, errors, true) +
      '<div class="field"><p class="hint">' + e(t(lang, 'feedbackEmailHint')) + '</p></div>' +
      '<div class="field"><label for="fb-type">' + e(t(lang, 'feedbackType')) + '</label>' +
      '<select id="fb-type" name="type">' + typeOptions + '</select></div>' +
      '<div class="field' + (errors.message ? ' has-error' : '') + '">' +
      '<label for="fb-message">' + e(t(lang, 'feedbackMessage')) + ' <span class="req" aria-hidden="true">*</span></label>' +
      '<textarea id="fb-message" name="message" rows="6" maxlength="2000" required>' + e(message) + '</textarea>' +
      (errors.message ? '<p class="field-error">' + e(t(lang, errors.message)) + '</p>' : '') +
      '</div>' +
      '<div class="hp" aria-hidden="true"><label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label></div>' +
      '<button class="btn" type="submit">' + e(t(lang, 'feedbackSubmit')) + '</button>' +
      '</form>' +
      '</section>';
  }

  return layout({
    lang,
    origin,
    path: '/feedback',
    title: title + ' · ' + t(lang, 'brandName'),
    description: t(lang, 'feedbackLede'),
    noindex: true,
    body,
    extraCss: ['/assets/admin.css'],
  });
}

function feedbackCard(record) {
  const who = [record.name, record.email].filter(Boolean).join(' · ') || 'Anonymous';
  const when = record.createdAt ? record.createdAt.slice(0, 16).replace('T', ' ') : '';
  const label = { bug: 'Mistake or bug', content: 'Correction to a text', idea: 'New idea', other: 'Other' }[record.type] || 'Other';
  return (
    '<article class="collection-card feedback-card">' +
    '<span class="count">' + e(label) + (when ? ' · ' + e(when) : '') + '</span>' +
    '<p class="feedback-message">' + e(record.message) + '</p>' +
    '<p class="muted">' + e(who) + '</p>' +
    '</article>'
  );
}

function feedbackSection(feedback) {
  return (
    '<section class="collections" aria-labelledby="feedback-title">' +
    '<div class="collections-head"><h2 id="feedback-title">Feedback (' + feedback.length + ')</h2></div>' +
    (feedback.length
      ? '<div class="collection-grid">' + feedback.map(feedbackCard).join('') + '</div>'
      : '<div class="empty-state">No feedback yet.</div>') +
    '</section>'
  );
}
// ---- admin (always English) -----------------------------------------------

const ADMIN_LANG = 'en';

export function adminPage({ origin, feedback = [] }) {
  const body =
    '<header class="admin-top">' +
    '<div><p class="eyebrow">Admin</p><h1>Reader feedback</h1>' +
    '<p class="lede">Messages sent from the feedback page, newest first.</p></div>' +
    '<dl class="stats"><div class="stat"><dt>Messages</dt><dd>' + feedback.length + '</dd></div></dl>' +
    '</header>' +
    feedbackSection(feedback) +
    '<section class="panel"><p class="muted">Texts are not added here. Add a Markdown file under content/ and push; the site rebuilds from the repository.</p></section>';

  return layout({
    lang: ADMIN_LANG,
    origin,
    path: '/admin',
    title: 'Feedback · ' + t(ADMIN_LANG, 'brandName'),
    description: 'Reader feedback.',
    body,
    noindex: true,
    wide: true,
    showLangToggle: false,
    extraCss: ['/assets/admin.css'],
  });
}

// ---- tarot ----------------------------------------------------------------

const TAROT_LANG = 'en';
const SUIT_GLYPH = { major: '✦', wands: '🔥', cups: '🌊', swords: '⚔', pentacles: '✺' };
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];

function cardNumber(card) {
  if (card.arcana === 'major') return ROMAN[card.number];
  const rank = { 1: 'Ace', 11: 'Page', 12: 'Knight', 13: 'Queen', 14: 'King' };
  return rank[card.number] || String(card.number);
}

// A card drawn as an original design (not third-party artwork). Reversed cards show the content upside down.
function cardHtml(card, { reversed = false, faceDown = false } = {}) {
  return (
    '<div class="tcard suit-' + card.suit + (faceDown ? '' : ' flipped') + '">' +
    '<div class="tcard-inner">' +
    '<div class="tcard-back" aria-hidden="true"><span>☽ ✦ ☾</span></div>' +
    '<div class="tcard-face' + (reversed ? ' rev' : '') + '"><div class="tcard-content">' +
    '<span class="tcard-num">' + e(cardNumber(card)) + '</span>' +
    '<span class="tcard-glyph" aria-hidden="true">' + SUIT_GLYPH[card.suit] + '</span>' +
    '<span class="tcard-name">' + e(card.name) + '</span>' +
    '</div></div></div></div>'
  );
}

const SUIT_SHORT = { major: 'Major Arcana', wands: 'Wands', cups: 'Cups', swords: 'Swords', pentacles: 'Pentacles' };

// The 78 cards as a row of dark cards; each one links to its meaning page.
function libraryDeck() {
  return CARDS.map(
    (card) =>
      '<a class="lib-card suit-' + card.suit + '" href="/tarot/card/' + e(card.id) + '" aria-label="' + e(card.name) + ' meaning">' +
      '<span class="lib-glyph" aria-hidden="true">' + SUIT_GLYPH[card.suit] + '</span>' +
      '<span class="lib-name">' + e(card.name) + '</span>' +
      '<span class="lib-suit">' + e(SUIT_SHORT[card.suit]) + '</span></a>'
  ).join('');
}

export function tarotReaderPage({ origin }) {
  const data = {
    cards: CARDS.map((c) => ({ id: c.id, name: c.name, suit: c.suit, number: c.number, arcana: c.arcana, tone: c.tone, upright: c.upright, reversed: c.reversed, love: TOPICS[c.id].love, career: TOPICS[c.id].career })),
    spreads: SPREADS,
  };
  const spreadOptions = Object.entries(SPREADS)
    .map(([key, spread]) =>
      '<button type="button" class="spread-option" data-spread="' + key + '" aria-pressed="' + (key === 'three') + '">' +
      '<strong>' + e(spread.label) + '</strong><span>' + e(spread.hint) + '</span></button>'
    )
    .join('');
  const backs = [['1', 'Violet'], ['2', 'Gold'], ['3', 'Teal'], ['4', 'Rose']]
    .map(([n, name]) =>
      '<button type="button" class="swatch swatch-' + n + '" data-back="' + n + '" title="' + name + '" aria-label="' + name + ' card back" aria-pressed="' + (n === '1') + '"></button>'
    )
    .join('');
  const body =
    '<header class="page-head tarot-head"><p class="eyebrow">Tarot reader</p><h1>Free tarot reading online</h1>' +
    '<p class="lede">Four steps: ask your question, choose a spread, pick a card back, then choose your cards from the row.</p></header>' +
    '<section class="tips" aria-labelledby="tips-title"><h2 id="tips-title">Before you begin</h2><ol>' +
    '<li>Take a breath and settle your mind.</li>' +
    '<li>Ask one clear question. Be specific about the situation.</li>' +
    '<li>Keep your focus on that question while you choose.</li>' +
    '<li>Trust the first reading, and read between the lines.</li>' +
    '<li>A challenging card is a lesson, not a verdict.</li>' +
    '</ol></section>' +
    '<section class="reader" aria-label="Tarot reader">' +
    '<div class="step-block">' +
    '<h2 class="step-title"><span class="step-no">1</span> Ask your question</h2>' +
    '<label class="field-help" for="tarot-question">Write one clear question. Leave it empty for a general reading.</label>' +
    '<textarea id="tarot-question" class="question-input" rows="2" maxlength="160" placeholder="For example: Should I accept the new job?"></textarea>' +
    '</div>' +
    '<div class="step-block">' +
    '<h2 class="step-title"><span class="step-no">2</span> Choose a spread</h2>' +
    '<div class="spread-grid" role="group" aria-label="Spread">' + spreadOptions + '</div>' +
    '</div>' +
    '<div class="step-block">' +
    '<h2 class="step-title"><span class="step-no">3</span> Pick a card back</h2>' +
    '<div class="back-chooser" role="group" aria-label="Card back">' + backs + '</div>' +
    '</div>' +
    '<div class="step-block">' +
    '<h2 class="step-title"><span class="step-no">4</span> Shuffle, then choose your cards</h2>' +
    '<div class="reader-actions">' +
    '<button type="button" class="btn btn-ghost" id="tarot-shuffle">Shuffle deck</button>' +
    '<button type="button" class="btn" id="tarot-draw">Deal new cards</button>' +
    '<span class="streak" id="tarot-streak"></span>' +
    '</div>' +
    '<p class="status" id="tarot-status" aria-live="polite">Click Deal new cards to lay out the row.</p>' +
    '<div class="fan" id="tarot-fan" role="group" aria-label="Face-down cards: tap one to choose it"></div>' +
    '<div class="stage" id="tarot-stage"></div>' +
    '<div class="results" id="tarot-results" aria-live="polite"></div>' +
    '</div>' +
    '</section>' +
    '<p class="reader-more"><a class="btn btn-ghost" href="/tarot/cards">Browse all 78 cards and their meanings</a></p>' +
    homeDrawSection(TAROT_LANG) +
    zenPill() +
    adBox() +
    '<script type="application/json" id="tarot-data">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';

  return layout({
    lang: TAROT_LANG,
    origin,
    path: '/tarot',
    title: 'Tarot Reader: Free Card Draw, Yes or No, Love and Career · Poojapathvala',
    description: 'Free online tarot reader. Draw a daily card, a three-card spread, a yes or no answer, or a love or career spread, with upright and reversed meanings.',
    body,
    showLangToggle: false,
    extraCss: ['/assets/tarot.css', '/home-card.css'],
    extraJs: ['/assets/tarot.js', '/home-card.js'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Poojapathvala Tarot Reader',
      url: origin + '/tarot',
      applicationCategory: 'Entertainment',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  });
}

// The full library of cards, with a row of dark card tiles linking to each meaning page.
export function tarotCardsPage({ origin }) {
  const body =
    '<header class="page-head tarot-head"><p class="eyebrow">Tarot</p><h1>The 78 cards</h1>' +
    '<p class="lede">Upright and reversed meanings for every card in the Major and Minor Arcana, with love and career readings.</p>' +
    '<p class="reader-more"><a class="btn btn-ghost" href="/tarot">Back to the reader</a></p></header>' +
    '<section class="library" aria-label="All cards"><div class="deck-row">' + libraryDeck() + '</div></section>' +
    adBox();

  return layout({
    lang: TAROT_LANG,
    origin,
    path: '/tarot/cards',
    title: 'All 78 Tarot Cards: Meanings, Upright and Reversed · Poojapathvala',
    description: 'Meanings of all 78 tarot cards, upright and reversed, with love and career readings.',
    body,
    showLangToggle: false,
    extraCss: ['/assets/tarot.css'],
  });
}

export function tarotCardPage({ origin, card }) {
  const path = '/tarot/card/' + card.id;
  const related = CARDS.filter((other) => other.suit === card.suit && other.id !== card.id).slice(0, 4);
  const relatedList = related
    .map((other) => '<li><a href="/tarot/card/' + e(other.id) + '">' + e(other.name) + '</a></li>')
    .join('');
  const body =
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/tarot">Tarot</a><span>/</span>' + e(card.name) + '</nav>' +
    '<article class="article tarot-card-page">' +
    '<header class="page-head"><p class="eyebrow">' + e(SUIT_LABELS[card.suit]) + '</p><h1>' + e(card.name) + ' meaning</h1>' +
    '<p class="lede">' + e(card.upright) + '</p></header>' +
    '<div class="card-pair">' +
    '<figure>' + cardHtml(card) + '<figcaption>Upright</figcaption></figure>' +
    '<figure>' + cardHtml(card, { reversed: true }) + '<figcaption>Reversed</figcaption></figure>' +
    '</div>' +
    '<section><h2>Upright</h2><p>' + e(card.upright) + '</p></section>' +
    '<section><h2>Reversed</h2><p>' + e(card.reversed) + '</p></section>' +
    '<section><h2>Love</h2><p><strong>Upright:</strong> ' + e(TOPICS[card.id].love[0]) + '</p><p><strong>Reversed:</strong> ' + e(TOPICS[card.id].love[1]) + '</p></section>' +
    '<section><h2>Career and money</h2><p><strong>Upright:</strong> ' + e(TOPICS[card.id].career[0]) + '</p><p><strong>Reversed:</strong> ' + e(TOPICS[card.id].career[1]) + '</p></section>' +
    (DEEP[card.id] ? '<p class="deep-links">Read more: <a href="/tarot/card/' + e(card.id) + '/love">' + e(card.name) + ' love reading</a> · <a href="/tarot/card/' + e(card.id) + '/career">' + e(card.name) + ' career reading</a></p>' : '') +
    '<p><a class="btn" href="/tarot">Draw your own cards</a></p>' +
    '</article>' +
    '<section class="related"><h2>More ' + e(SUIT_LABELS[card.suit]) + '</h2><ul class="card-links">' + relatedList + '</ul></section>';

  return layout({
    lang: TAROT_LANG,
    origin,
    path,
    title: card.name + ' Meaning: Upright and Reversed · Tarot · Poojapathvala',
    description: card.name + ' tarot card. Upright: ' + card.upright + ' Reversed: ' + card.reversed,
    body,
    type: 'article',
    showLangToggle: false,
    extraCss: ['/assets/tarot.css'],
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: card.name + ' tarot meaning',
        description: card.upright,
        mainEntityOfPage: origin + path,
      },
      faqPage([
        ['What does ' + card.name + ' mean upright?', card.upright],
        ['What does ' + card.name + ' mean reversed?', card.reversed],
        ['What does ' + card.name + ' mean in love?', 'Upright: ' + TOPICS[card.id].love[0] + ' Reversed: ' + TOPICS[card.id].love[1]],
        ['What does ' + card.name + ' mean for career and money?', 'Upright: ' + TOPICS[card.id].career[0] + ' Reversed: ' + TOPICS[card.id].career[1]],
      ]),
    ].filter(Boolean),
  });
}

// ---- Static pages: About, Contact, Privacy. Hindi and English from one source. ----
function infoPage({ lang, origin, path, title, lede, sections }) {
  const body =
    '<header class="page-head"><h1>' + e(loc(lang, title[0], title[1])) + '</h1>' +
    '<p class="lede">' + e(loc(lang, lede[0], lede[1])) + '</p></header>' +
    sections
      .map((s) => {
        const paras = (s.paras || []).map((p) => '<p>' + e(loc(lang, p[0], p[1])) + '</p>').join('');
        const items = s.items
          ? '<ul>' + s.items.map((i) => '<li>' + e(loc(lang, i[0], i[1])) + '</li>').join('') + '</ul>'
          : '';
        return '<section class="panel info-section"><h2>' + e(loc(lang, s.h[0], s.h[1])) + '</h2>' + paras + items + '</section>';
      })
      .join('');
  return layout({
    lang,
    origin,
    path,
    title: loc(lang, title[0], title[1]) + ' · ' + t(lang, 'brandName'),
    description: loc(lang, lede[0], lede[1]),
    body,
  });
}

export function aboutPage({ lang, origin }) {
  return infoPage({
    lang,
    origin,
    path: '/about',
    title: ['About us', 'हमारे बारे में'],
    lede: ['Poojapathvala is a free digital library of pooja texts, chalisas, aartis, stotras and mantras, written out in Hindi with an English toggle.', 'पूजापाठवाला पूजा-पाठ के ग्रंथों की एक मुफ़्त डिजिटल लाइब्रेरी है: चालीसा, आरती, स्तोत्र, मंत्र और पूजा-विधि, हिंदी में, अंग्रेज़ी अनुवाद के विकल्प के साथ।'],
    sections: [
      {
        h: [['What you will find', 'यहाँ क्या मिलेगा']],
        paras: [
          [
            'The texts are grouped by tradition (Hindu and Jain) and by kind: chalisa, aarti, stotra, mantra and pooja vidhi. Each text can be read, enlarged, printed or shared.',
            'पाठ परंपरा (हिंदू और जैन) और प्रकार (चालीसा, आरती, स्तोत्र, मंत्र और पूजा-विधि) के अनुसार सजाए गए हैं। हर पाठ पढ़ा, बड़ा करके देखा, छापा या साझा किया जा सकता है।',
          ],
          [
            'Texts are published as they come from their sources. Where a text has known variants or is still being completed, the page says so.',
            'पाठ उनके स्रोत के अनुसार प्रकाशित किए जाते हैं। जिस पाठ के कई रूप प्रचलित हैं या जो अभी पूरा हो रहा है, उस पर इसका उल्लेख होता है।',
          ],
        ],
      },
      {
        h: [['The tarot section', 'टैरो भाग']],
        paras: [
          [
            'The tarot reader is for reflection only. It is not a guide, just a sign from a deck of cards, and we take no responsibility for decisions made with it.',
            'टैरो भाग केवल चिंतन के लिए है। यह कोई मार्गदर्शन नहीं, बस ताश के पत्तों का एक संकेत है, और इससे लिए गए निर्णयों की ज़िम्मेदारी हम नहीं लेते।',
          ],
        ],
      },
      {
        h: [['How the site is supported', 'साइट कैसे चलती है']],
        paras: [
          [
            'The site shows small advertisements, provided by Google AdSense, and links to products on Amazon. When you buy through an Amazon link we may earn a small commission at no extra cost to you. Amazon is a participant in the Amazon Associates Programme.',
            'साइट पर Google AdSense के छोटे विज्ञापन दिखते हैं और Amazon के उत्पादों के लिंक हैं। Amazon के लिंक से खरीदारी होने पर हमें थोड़ा कमीशन मिल सकता है, आपको इसके लिए कोई अतिरिक्त शुल्क नहीं देना होता। हम Amazon Associates Programme में भागीदार हैं।',
          ],
        ],
      },
    ],
  });
}

export function contactPage({ lang, origin }) {
  return infoPage({
    lang,
    origin,
    path: '/contact',
    title: ['Contact us', 'संपर्क करें'],
    lede: ['Found a mistake, want a text added, or have a question? Use the feedback form.', 'कोई गलती मिली, कोई पाठ जोड़ने का अनुरोध है, या कोई प्रश्न है? फ़ीडबैक फ़ॉर्म का उपयोग करें।'],
    sections: [
      {
        h: [['How to reach us', 'हम तक कैसे पहुँचें']],
        paras: [
          [
            'Use the feedback form to send corrections, suggestions or requests for new texts. We read every message. If you want a reply, leave your email in the form.',
            'सुधार, सुझाव या नए पाठ के अनुरोध के लिए फ़ीडबैक फ़ॉर्म भरें। हर संदेश पढ़ा जाता है। उत्तर चाहिए तो फ़ॉर्म में अपना ईमेल लिखें।',
          ],
        ],
      },
      {
        h: [['Removing your details', 'अपनी जानकारी हटवाना']],
        paras: [
          [
            'To ask us to delete a feedback message that contains your details, send a note through the same form. See the privacy policy for what is stored.',
            'यदि आप अपना कोई फ़ीडबैक संदेश हटवाना चाहते हैं जिसमें आपकी जानकारी है, तो उसी फ़ॉर्म से अनुरोध भेजें। क्या संग्रहीत होता है, यह गोपनीयता नीति में है।',
          ],
        ],
      },
    ],
  });
}

export function privacyPage({ lang, origin }) {
  return infoPage({
    lang,
    origin,
    path: '/privacy',
    title: ['Privacy policy', 'गोपनीयता नीति'],
    lede: ['This page explains what Poojapathvala stores, what third parties receive, and how to ask us to remove your details.', 'यह पृष्ठ बताता है कि पूजापाठवाला क्या संग्रहीत करता है, कौन-सी तीसरी पार्टी क्या पाती है, और अपनी जानकारी हटवाने के लिए क्या करें।'],
    sections: [
      {
        h: [['What we store on our side', 'हमारी ओर से क्या संग्रहीत होता है']],
        items: [
          [
            'Feedback form: the name, email (optional), type and message you submit, so we can read and act on them. They are kept until we remove them.',
            'फ़ीडबैक फ़ॉर्म: आपके द्वारा भेजे गए नाम, ईमेल (वैकल्पिक), प्रकार और संदेश, ताकि हम उन्हें पढ़ और उन पर कार्रवाई कर सकें। हटाए जाने तक ये रखे जाते हैं।',
          ],
          [
            'Language choice: a cookie named pp-lang remembers whether you chose Hindi or English. It holds no personal details.',
            'भाषा का चुनाव: pp-lang नाम की एक कुकी याद रखती है कि आपने हिंदी या अंग्रेज़ी चुनी है। इसमें कोई व्यक्तिगत जानकारी नहीं है।',
          ],
          [
            'Tarot streak: your daily tarot count is stored only in your browser (local storage). We cannot see it, and clearing your browser data removes it.',
            'टैरो लगातार दिन: आपके रोज़ाना टैरो की गिनती केवल आपके ब्राउज़र (लोकल स्टोरेज) में रहती है। हम इसे नहीं देखते, और ब्राउज़र का डेटा साफ़ करने पर यह हट जाती है।',
          ],
        ],
      },
      {
        h: [['Analytics and errors', 'विश्लेषण और त्रुटियाँ']],
        paras: [
          [
            'We use PostHog to see which pages are visited and how the site is used. PostHog may record your browser details, approximate location and page visits. Server errors are reported to PostHog so we can fix them.',
            'हम PostHog का उपयोग करते हैं ताकि देखा जा सके कि कौन-से पृष्ठ देखे जाते हैं और साइट कैसे इस्तेमाल होती है। PostHog आपके ब्राउज़र की जानकारी, अनुमानित स्थान और पृष्ठ-भ्रमण दर्ज कर सकता है। सर्वर की त्रुटियाँ PostHog को भेजी जाती हैं ताकि हम उन्हें ठीक कर सकें।',
          ],
        ],
      },
      {
        h: [['Ads and affiliate links', 'विज्ञापन और एफ़िलिएट लिंक']],
        paras: [
          [
            'Google AdSense shows ads on text pages. Google and its partners may use cookies to show ads based on your past visits. You can control ad personalisation in your Google account settings, and learn more in Google’s ads privacy pages.',
            'Google AdSense पाठ-पृष्ठों पर विज्ञापन दिखाता है। Google और उसके साझेदार आपकी पिछली यात्राओं के आधार पर विज्ञापन दिखाने के लिए कुकीज़ का उपयोग कर सकते हैं। विज्ञापन-वैयक्तिकरण आपके Google खाते की सेटिंग में बदला जा सकता है।',
          ],
          [
            'Amazon links are sponsored. When you click one, Amazon may set its own cookies. We do not receive your personal details from Amazon.',
            'Amazon के लिंक प्रायोजित हैं। लिंक पर क्लिक करने पर Amazon अपनी कुकीज़ सेट कर सकता है। हमें Amazon से आपकी व्यक्तिगत जानकारी नहीं मिलती।',
          ],
        ],
      },
      {
        h: [['Hosting', 'होस्टिंग']],
        paras: [
          [
            'The site is hosted on Cloudflare, which handles the requests you make to load pages.',
            'साइट Cloudflare पर होस्ट है, जो पृष्ठ लोड करने के अनुरोधों को संभालता है।',
          ],
        ],
      },
      {
        h: [['Your choices', 'आपके विकल्प']],
        paras: [
          [
            'You can clear cookies and local storage in your browser at any time. To ask us to delete a feedback message, send a note through the feedback form. If the way we use data changes, we will update this page.',
            'आप अपने ब्राउज़र में कुकीज़ और लोकल स्टोरेज कभी भी साफ़ कर सकते हैं। फ़ीडबैक संदेश हटवाने के लिए फ़ीडबैक फ़ॉर्म से अनुरोध भेजें। डेटा के उपयोग का तरीका बदलने पर हम इस पृष्ठ को अपडेट करेंगे।',
          ],
        ],
      },
    ],
  });
}

// ---- Keyword landing pages: one per kind or deity. A page lists the published texts that match. ----
// A text matches when it has one of the tags, or one of the words appears in its English or Hindi title.
function matcher(tags, words) {
  return (doc) => {
    if ((doc.tags || []).some((tag) => tags.includes(tag))) return true;
    const en = (doc.title || '').toLowerCase();
    const hi = doc.hindiTitle || '';
    return words.some((w) => en.includes(w[0].toLowerCase()) || hi.includes(w[1]));
  };
}

const KIND_PAGES = {
  chalisa: {
    match: matcher(['chalisa'], [['chalisa', 'चालीसा']]),
    title: ['Chalisa Lyrics in Hindi', 'हिंदी में चालीसा'],
    lede: [
      'Read chalisa lyrics in Hindi: Hanuman, Shiv, Durga, Ganesh, Lakshmi, Shani and more.',
      'हिंदी में चालीसा पाठ पढ़ें: हनुमान, शिव, दुर्गा, गणेश, लक्ष्मी, शनि और अन्य।',
    ],
  },
  aarti: {
    match: matcher(['aarti'], [['aarti', 'आरती']]),
    title: ['Aarti Lyrics in Hindi', 'हिंदी में आरती'],
    lede: [
      'Read aarti lyrics in Hindi for daily pooja: Ganesh, Shiv, Durga, Hanuman, Lakshmi, Krishna, Ram and more.',
      'दैनिक पूजा के लिए हिंदी में आरती पढ़ें: गणेश, शिव, दुर्गा, हनुमान, लक्ष्मी, कृष्ण, राम और अन्य।',
    ],
  },
  stotra: {
    match: matcher(['stotra', 'stotram', 'stuti'], [['stotra', 'स्तोत्र'], ['stotram', 'स्तोत्रम']]),
    title: ['Stotra in Hindi', 'हिंदी में स्तोत्र'],
    lede: [
      'Read stotras in Hindi with the Sanskrit text: Bajrang Baan, Shiv Tandav, Aditya Hridaya, Bhaktamar and more.',
      'संस्कृत पाठ सहित हिंदी में स्तोत्र पढ़ें: बजरंग बाण, शिव तांडव, आदित्य हृदय, भक्तामर और अन्य।',
    ],
  },
  mantra: {
    match: matcher(['mantra'], [['mantra', 'मंत्र']]),
    title: ['Mantra Lyrics in Hindi', 'हिंदी में मंत्र'],
    lede: [
      'Read mantras with their Hindi text: Gayatri, Mahamrityunjaya and more.',
      'हिंदी पाठ सहित मंत्र पढ़ें: गायत्री, महामृत्युंजय और अन्य।',
    ],
  },
  puja: {
    match: matcher(['vidhi', 'samagri'], [['puja', 'पूजा'], ['vidhi', 'विधि'], ['pooja', 'पूजा']]),
    title: ['Puja Vidhi in Hindi', 'हिंदी में पूजा विधि'],
    lede: [
      'Puja vidhi in Hindi, step by step: daily puja, Ganesh, Lakshmi, Shiv, Durga and more.',
      'हिंदी में चरण-दर-चरण पूजा विधि: नित्य पूजा, गणेश, लक्ष्मी, शिव, दुर्गा और अन्य।',
    ],
  },
  hanuman: {
    match: matcher(['hanuman'], [['hanuman', 'हनुमान']]),
    title: ['Hanuman Chalisa, Aarti and Stotra in Hindi', 'हनुमान चालीसा, आरती और स्तोत्र'],
    lede: [
      'Hanuman chalisa, aarti, bajrang baan and more, in Hindi.',
      'हनुमान चालीसा, आरती, बजरंग बाण और अन्य, हिंदी में।',
    ],
  },
  shiv: {
    match: matcher(['shiv'], [['shiv', 'शिव']]),
    title: ['Shiv Chalisa, Aarti and Stotra in Hindi', 'शिव चालीसा, आरती और स्तोत्र'],
    lede: [
      'Shiv chalisa, shiv aarti, lingashtakam, shiv tandav and more, in Hindi.',
      'शिव चालीसा, शिव आरती, लिंगाष्टकम, शिव तांडव और अन्य, हिंदी में।',
    ],
  },
  durga: {
    match: matcher(['durga', 'devi'], [['durga', 'दुर्गा']]),
    title: ['Durga Chalisa, Aarti and Stotra in Hindi', 'दुर्गा चालीसा, आरती और स्तोत्र'],
    lede: [
      'Durga chalisa, durga aarti, durga stotram and more, in Hindi.',
      'दुर्गा चालीसा, दुर्गा आरती, दुर्गा स्तोत्रम और अन्य, हिंदी में।',
    ],
  },
  ganesh: {
    match: matcher([], [['ganesh', 'गणेश']]),
    title: ['Ganesh Chalisa, Aarti and Puja in Hindi', 'गणेश चालीसा, आरती और पूजा'],
    lede: [
      'Ganesh chalisa, ganesh aarti and ganesh puja vidhi, in Hindi.',
      'गणेश चालीसा, गणेश आरती और गणेश पूजा विधि, हिंदी में।',
    ],
  },
  lakshmi: {
    match: matcher(['lakshmi'], [['lakshmi', 'लक्ष्मी']]),
    title: ['Lakshmi Chalisa, Aarti and Puja in Hindi', 'लक्ष्मी चालीसा, आरती और पूजा'],
    lede: [
      'Lakshmi chalisa, lakshmi aarti and lakshmi puja vidhi, in Hindi.',
      'लक्ष्मी चालीसा, लक्ष्मी आरती और लक्ष्मी पूजा विधि, हिंदी में।',
    ],
  },
  mahavir: {
    match: matcher(['mahavir'], [['mahavir', 'महावीर']]),
    title: ['Mahavir Chalisa and Aarti in Hindi', 'महावीर चालीसा और आरती'],
    lede: [
      'Mahavir chalisa and mahavir swami aarti, in Hindi, for Jain worship.',
      'जैन पूजा के लिए महावीर चालीसा और महावीर स्वामी आरती, हिंदी में।',
    ],
  },
};

export const KIND_PAGE_KEYS = Object.keys(KIND_PAGES);

// Published texts that match a landing page. Pending texts are never listed.
export function kindItems(kind, topics) {
  const def = KIND_PAGES[kind];
  if (!def) return [];
  const items = [];
  for (const topic of topics) {
    for (const doc of topic.docs) {
      if (!isPending(doc) && def.match(doc)) items.push({ topic, doc });
    }
  }
  return items;
}

// Pages with at least one text; used by the sitemap and the homepage.
export function liveKindKeys(topics) {
  return KIND_PAGE_KEYS.filter((kind) => kindItems(kind, topics).length > 0);
}

export function kindLinks(lang, topics) {
  return liveKindKeys(topics)
    .map((kind) => '<a href="/' + kind + '">' + e(loc(lang, KIND_PAGES[kind].title[0], KIND_PAGES[kind].title[1])) + '</a>')
    .join(' · ');
}

export function kindPage({ lang, origin, kind, topics }) {
  const def = KIND_PAGES[kind];
  if (!def) return null;
  const items = kindItems(kind, topics);
  const name = loc(lang, def.title[0], def.title[1]);
  const lede = loc(lang, def.lede[0], def.lede[1]);
  const list = items.map(({ topic, doc }) => docItem(lang, topic, doc, docNote(lang, topic, doc))).join('');

  const body =
    '<nav class="crumbs" aria-label="' + e(t(lang, 'breadcrumb')) + '"><a href="/">' + e(t(lang, 'home')) + '</a><span>/</span>' +
    e(name) + '</nav>' +
    '<header class="page-head"><h1>' + e(name) + '</h1><p class="lede">' + e(lede) + '</p></header>' +
    '<ol class="doc-list">' + (list || '<li class="empty">' + e(t(lang, 'noTexts')) + '</li>') + '</ol>';

  return layout({
    lang,
    origin,
    path: '/' + kind,
    title: name + ' · ' + t(lang, 'brandName'),
    description: lede,
    body,
    noindex: items.length === 0,
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: def.title[0],
        description: def.lede[0],
        url: origin + '/' + kind,
        itemListElement: items.map(({ topic, doc }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: origin + '/t/' + topic.slug + '/' + doc.slug,
          name: doc.title,
        })),
      },
      breadcrumbs(origin, [
        { name: 'Home', path: '/' },
        { name: def.title[0], path: '/' + kind },
      ]),
    ],
  });
}

// Longer love and career pages for the cards in DEEP.
export function tarotTopicPage({ origin, card, topic }) {
  const deep = DEEP[card.id] && DEEP[card.id][topic];
  if (!deep) return null;
  const label = topic === 'love' ? 'in love' : 'for career and money';
  const name = card.name + ' ' + (topic === 'love' ? 'love meaning' : 'career meaning');
  const path = '/tarot/card/' + card.id + '/' + topic;
  const body =
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/tarot">Tarot</a><span>/</span>' +
    '<a href="/tarot/card/' + e(card.id) + '">' + e(card.name) + '</a><span>/</span>' + (topic === 'love' ? 'Love' : 'Career') + '</nav>' +
    '<article class="article tarot-card-page">' +
    '<header class="page-head"><p class="eyebrow">' + e(SUIT_LABELS[card.suit]) + '</p><h1>' + e(card.name) + ' ' + e(label) + '</h1>' +
    '<p class="lede">' + e(card.name) + ' ' + e(label) + ': upright and reversed readings.</p></header>' +
    '<section><h2>Upright</h2>' + deep.upright.map((p) => '<p>' + e(p) + '</p>').join('') + '</section>' +
    '<section><h2>Reversed</h2>' + deep.reversed.map((p) => '<p>' + e(p) + '</p>').join('') + '</section>' +
    '<p><a class="btn btn-ghost" href="/tarot/card/' + e(card.id) + '">Back to ' + e(card.name) + '</a> <a class="btn" href="/tarot">Draw your own cards</a></p>' +
    '</article>';
  return layout({
    lang: TAROT_LANG,
    origin,
    path,
    title: name + ': Upright and Reversed · Tarot · Poojapathvala',
    description: card.name + ' ' + label + '. ' + deep.upright[0].slice(0, 140),
    body,
    type: 'article',
    showLangToggle: false,
    extraCss: ['/assets/tarot.css'],
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: name,
      description: deep.upright[0],
      mainEntityOfPage: origin + path,
    },
  });
}

export const DEEP_TOPIC_PATHS = Object.keys(DEEP).flatMap((id) => Object.keys(DEEP[id]).map((topic) => '/tarot/card/' + id + '/' + topic));

// Mantra counter: a 108-bead mala and timed chant mode. Logic lives in /mantra-counter.js.
export function mantraCounterPage({ origin, topics }) {
  const list = [];
  for (const topic of topics) {
    for (const doc of topic.docs) {
      if (isPending(doc) || !doc.tags) continue;
      if (doc.tags.includes('mantra') || doc.tags.includes('navkar')) list.push({ title: doc.title, body: doc.body || '' });
    }
  }
  const options = list.map((item, i) => '<option value="' + i + '">' + e(item.title) + '</option>').join('');
  const data = JSON.stringify(list).replace(/</g, '\\u003c');
  const items = activeAffiliates('items');
  const body =
    '<div class="mc-app" id="mc-app">' +
    '<header class="mc-hero"><p class="eyebrow">Japa · जप</p><h1>Mantra counter</h1>' +
    '<p class="lede">A 108-bead mala and a chanting timer. Your count stays on this device.</p></header>' +
    '<div class="mc-grid">' +
    '<section class="mc-card" aria-labelledby="mc-h-mantra"><h2 id="mc-h-mantra">Your mantra</h2>' +
    '<div class="mc-field"><label for="mc-select">Choose from the library</label><select id="mc-select"><option value="">Write your own</option>' + options + '</select></div>' +
    '<div class="mc-field"><label for="mc-text">Mantra text</label><textarea id="mc-text" rows="4" placeholder="Type or paste a mantra"></textarea></div>' +
    '<div id="mc-shimmer" class="mc-shimmer mc-empty" aria-live="polite"></div>' +
    '<div class="mc-settings">' +
    '<div class="mc-field"><label for="mc-secs">Seconds per chant</label><input type="number" id="mc-secs" min="1" max="120" value="6"></div>' +
    '<div class="mc-field"><label for="mc-total">Total chants</label><input type="number" id="mc-total" min="1" max="10000" value="108"></div>' +
    '<label class="mc-switch"><input type="checkbox" id="mc-sound" checked> Bell sound</label>' +
    '</div></section>' +
    '<section class="mc-card mc-counter" aria-labelledby="mc-h-counter"><h2 id="mc-h-counter">Counter</h2>' +
    '<div class="mc-clock" id="mc-clock" aria-label="Current time">--:--:--</div>' +
    '<div class="mc-ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="54" class="mc-track"/><circle id="mc-ring" cx="60" cy="60" r="54" class="mc-bar"/></svg>' +
    '<button id="mc-bead" type="button" class="mc-bead" aria-label="Count one chant"><span id="mc-count">0</span><small id="mc-of">chants</small></button></div>' +
    '<p id="mc-timer-state" class="mc-timer-state" aria-live="polite">Timer paused</p>' +
    '<p id="mc-msg" class="mc-msg" aria-live="polite"></p>' +
    '<div class="mc-actions">' +
    '<button id="mc-auto" class="mc-btn" type="button" aria-pressed="false">Start timer</button>' +
    '<button id="mc-reset" class="mc-btn ghost" type="button">Reset</button>' +
    '<button id="mc-focus-btn" class="mc-btn ghost" type="button" aria-pressed="false">Focus mode</button>' +
    '</div>' +
    '<div id="mc-beads" class="mc-beads" aria-hidden="true"></div>' +
    '<p id="mc-malas" class="mc-malas">Your first mala starts here</p>' +
    '</section></div>' +
    '<div class="mc-grid">' +
    '<section class="mc-card" aria-labelledby="mc-h-stats"><h2 id="mc-h-stats">Your japa</h2>' +
    '<div class="mc-stat-row"><div class="mc-stat"><strong id="mc-today">0</strong><span>Today</span></div>' +
    '<div class="mc-stat"><strong id="mc-streak">0</strong><span>Day streak</span></div></div>' +
    '<div id="mc-week" class="mc-week" aria-label="Japa count for the last 7 days"></div></section>' +
    '<section class="mc-card" aria-labelledby="mc-h-keys"><h2 id="mc-h-keys">Keyboard</h2>' +
    '<dl class="mc-keys"><dt><kbd>Space</kbd></dt><dd>Count one chant</dd>' +
    '<dt><kbd>T</kbd></dt><dd>Start or pause the timer</dd>' +
    '<dt><kbd>R</kbd></dt><dd>Reset the counter</dd>' +
    '<dt><kbd>F</kbd></dt><dd>Focus mode, only the counter</dd>' +
    '<dt><kbd>Esc</kbd></dt><dd>Leave focus mode</dd></dl>' +
    '<p class="hint">On phones, the bead gives a short vibration.</p></section>' +
    '</div>' +
    zenPill() + geetaPill() +
    (items.length ? shopBox('Japa and puja essentials', items) : '') +
    '<script type="application/json" id="mc-data">' + data + '</script>' +
    '</div>';
  return layout({
    lang: 'en',
    origin,
    path: '/mantra-counter',
    title: 'Online Mantra Counter and 108 Bead Japa Mala · Poojapathvala',
    description: 'Free online japa counter with a 108-bead mala, a chanting timer and focus mode. Choose a mantra from the library or type your own.',
    body,
    showLangToggle: false,
    extraCss: ['/mantra-counter.css'],
    extraJs: ['/mantra-counter.js'],
  });
}

// Burn your worry: a ritual page. The text is never stored or sent. Logic lives in /ritual.js.
// The reflections below are original, paraphrased in the Stoic spirit; the Gita line is BG 2.47.
const RITUAL_REFLECTIONS = [
  { text: 'You cannot control every event. You can choose how you respond to it.', source: 'Stoic reflection' },
  { text: 'Think about what you can act on today. Let the rest wait its turn.', source: 'Stoic reflection' },
  { text: 'Most of what we fear has not happened yet. Come back to this moment.', source: 'Stoic reflection' },
  { text: 'A thought is not a fact. Notice it, then let it pass like smoke.', source: 'Stoic reflection' },
  { text: 'Ask yourself whether this will matter in a year. If not, set it down.', source: 'Stoic reflection' },
  { text: 'Do the next right thing. Then do the one after that.', source: 'Stoic reflection' },
  { text: 'Breathe in, and name one thing you can do. Breathe out, and release the rest.', source: 'Ritual reflection' },
  { text: 'Regret is a memory with a verdict attached. Learn from the memory, and let go of the verdict.', source: 'Ritual reflection' },
  { text: 'What is needed now is calm attention, not a perfect answer.', source: 'Ritual reflection' },
  { text: 'You have got through every hard day so far. This one can be carried too.', source: 'Ritual reflection' },
  { text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन॥', source: 'Bhagavad Gita 2.47: You have a right to your action, never to its fruits.' },
];

export function ritualPage({ origin, lang = 'en' }) {
  const data = JSON.stringify(RITUAL_REFLECTIONS).replace(/</g, '\\u003c');
  const body =
    '<div class="rt-app">' +
    '<header class="page-head"><p class="eyebrow">Ritual</p><h1>Burn your worry</h1>' +
    '<p class="lede">Write what is on your mind, then hold the flame until the card burns. Your words are never stored or sent.</p></header>' +
    '<div class="rt-stage">' +
    '<div class="rt-card" id="rt-card"><label class="sr-only" for="rt-text">What is weighing on you</label>' +
    '<textarea id="rt-text" maxlength="600" placeholder="Write the worry, the loop or the regret here…"></textarea></div>' +
    '<canvas id="rt-fire" aria-hidden="true"></canvas></div>' +
    '<div class="rt-actions"><button id="rt-burn" class="rt-flame" type="button" aria-describedby="rt-status">Hold to burn</button>' +
    '<button id="rt-reset" class="rt-reset" type="button" hidden>Write again</button></div>' +
    '<p id="rt-status" class="rt-status" aria-live="polite">Write what is on your mind.</p>' +
    '<section id="rt-reveal" class="rt-reveal" hidden><p id="rt-quote" class="rt-quote"></p><p id="rt-source" class="rt-source"></p>' +
    '<p><a class="tarot-cta" href="/tarot">Draw a tarot card</a></p></section>' +
    homeDrawSection(lang, true) +
    '<p class="rt-note">Privacy: the text stays in this browser tab. It is not stored, not sent, and is cleared when the card burns. Hold space or enter on the keyboard to burn.</p>' +
    '<script type="application/json" id="rt-data">' + data + '</script>' +
    '</div>';
  return layout({
    lang: 'en',
    origin,
    path: '/ritual/release',
    title: 'Burn Your Worry: A Private Release Ritual · Poojapathvala',
    description: 'Write a worry, then hold the flame to burn it away. Nothing you write is stored or sent. A short reflection follows.',
    body,
    showLangToggle: false,
    extraCss: ['/ritual.css', '/home-card.css'],
    extraJs: ['/ritual.js', '/home-card.js'],
  });
}

// The Zen Space: a standalone page. Logic lives in /zen.js; styles in /zen.css.
export function zenPage({ origin }) {
  const title = 'The Zen Space: Release a Thought, Breathe and Draw in Sand · Poojapathvala';
  const description = 'A calm online space: write a worry and watch it dissolve into stardust, blow out a candle, breathe with the light, and draw in gold sand or silk. Free, and nothing is stored.';
  return '<!DOCTYPE html>\n<html lang="en">\n<head>\n' +
    '<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '<title>' + e(title) + '</title>\n' +
    '<meta name="description" content="' + e(description) + '">\n' +
    '<link rel="canonical" href="' + e(origin + '/zen') + '">\n' +
    '<meta name="robots" content="index, follow">\n<meta name="theme-color" content="#07081a">\n' +
    '<meta property="og:type" content="website">\n<meta property="og:site_name" content="Poojapathvala">\n' +
    '<meta property="og:title" content="' + e(title) + '">\n<meta property="og:description" content="' + e(description) + '">\n' +
    '<meta property="og:url" content="' + e(origin + '/zen') + '">\n<meta property="og:image" content="' + e(origin + '/og.png') + '">\n' +
    '<link rel="stylesheet" href="/zen.css?v=' + ASSET_VERSION + '">\n</head>\n<body>\n' +
    '<canvas id="zen-canvas" aria-hidden="true"></canvas>\n' +
    '<header class="zen-head"><a class="zen-brand" href="/">Poojapathvala</a><p>The Zen Space — Breathe, Pour, Let Go</p><a class="zen-ask" href="/geeta-says">Feeling stuck? Ask Geeta Says →</a></header>\n' +
    '<section class="zen-release"><h1>Write a thought or burden to release…</h1>' +
    '<label class="sr-only" for="zen-thought">A thought or burden to release</label>' +
    '<input id="zen-thought" type="text" autocomplete="off" maxlength="120" placeholder="For example: overthinking about the future">' +
    '<p class="zen-steps"><b>1</b> Write &nbsp;·&nbsp; <b>2</b> Press Enter &nbsp;·&nbsp; <b>3</b> Breathe with the light</p></section>\n' +
    '<div class="zen-preset" id="zen-preset" hidden><p id="zen-preset-msg"></p><button type="button" id="zen-begin">Begin with sound</button></div>\n' +
    '<p id="zen-in" class="zen-breath on">Breathe in · 4 seconds</p>\n' +
    '<p id="zen-out" class="zen-breath">Breathe out · 6 seconds</p>\n' +
    '<footer class="zen-dock">' +
    '<section class="zen-panel" id="zen-panel-draw" aria-labelledby="zen-h-draw"><h2 id="zen-h-draw">Draw</h2><div class="zen-row">' +
    '<button type="button" data-brush="sand" aria-pressed="true">Gold sand</button>' +
    '<button type="button" data-brush="silk" aria-pressed="false">Silk flow</button></div>' +
    '<div class="zen-row"><button type="button" id="zen-sweep">Sweep to night sky</button><button type="button" id="zen-capture" aria-label="Save this moment as an image">Save image</button></div>' +
    '<p class="zen-note">Everything you draw fades. That is the point.</p></section>' +
    '<section class="zen-panel" id="zen-panel-candle" aria-labelledby="zen-h-candle"><h2 id="zen-h-candle">Candle</h2><div class="zen-row">' +
    '<button type="button" id="zen-candle" aria-pressed="false">Blow it out</button>' +
    '<button type="button" id="zen-mic" aria-pressed="false">Blow with microphone</button></div>' +
    '<p class="zen-note" id="zen-mic-status" aria-live="polite">Click the flame, or blow with the microphone on.</p></section>' +
    '<section class="zen-panel" id="zen-panel-breathe" aria-labelledby="zen-h-breathe"><h2 id="zen-h-breathe">Breathing sound</h2><div class="zen-row">' +
    '<button type="button" id="zen-bilateral" aria-pressed="false">Off</button></div>' +
    '<p class="zen-note">Headphones give the full effect. The sound moves left and right with the light.</p></section>' +
    '<section class="zen-panel" id="zen-panel-sound" aria-labelledby="zen-h-sound"><h2 id="zen-h-sound">Soundscape</h2><div class="zen-row">' +
    '<button type="button" id="zen-bowl">Strike singing bowl</button></div>' +
    '<label class="zen-slider"><span>Rain</span><input type="range" id="zen-rain" min="0" max="100" value="0" aria-label="Rain volume"></label>' +
    '<label class="zen-slider"><span>River</span><input type="range" id="zen-river" min="0" max="100" value="0" aria-label="River volume"></label>' +
    '<label class="zen-slider"><span>Tanpura</span><input type="range" id="zen-drone" min="0" max="100" value="0" aria-label="Tanpura drone volume"></label></section>' +
    '</footer>\n' +
    '<script src="/zen.js?v=' + ASSET_VERSION + '" defer></script>\n</body>\n</html>\n';
}

// A quiet link to the Zen Space, placed inside the page body.
export function zenPill() {
  return '<p class="zen-pill-wrap"><a class="zen-pill" href="/zen">Overwhelmed? Take 60 seconds in the Zen Space →</a></p>';
}

// ---- /moon: today's moon, and the moon on a birth date ----
const MOON_PHASE_HELP = [
  ['New Moon', 'The moon is between us and the sun. Dark sky, a time many people use to set intentions.'],
  ['Waxing Crescent', 'A thin light appears on the right. Good for beginnings and small steps.'],
  ['First Quarter', 'Half of the moon is lit. A time for decisions and action.'],
  ['Waxing Gibbous', 'More than half is lit and growing. A time for refining and preparing.'],
  ['Full Moon', 'The whole face is lit. Many people mark this time with gratitude and reflection.'],
  ['Waning Gibbous', 'Still bright, now shrinking. A time to share and give thanks.'],
  ['Last Quarter', 'Half is lit again. A time to let go of what no longer serves you.'],
  ['Waning Crescent', 'A thin sliver before the new moon. A quiet time for rest.'],
];

// A simple moon disc drawn in SVG: the lit part is bounded by a half circle and the terminator.
function moonSvg(illumination, waxing) {
  const k = Math.max(0, Math.min(1, illumination / 100));
  const R = 80, cx = 100, cy = 100;
  let lit;
  if (k >= 0.995) lit = '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="#f6e7b8"/>';
  else if (k <= 0.005) lit = '';
  else {
    const rx = (R * Math.abs(1 - 2 * k)).toFixed(2);
    const gib = k > 0.5;
    let d;
    if (waxing) {
      // lit on the right: outer arc on the right, terminator back up the middle
      d = 'M' + cx + ',' + (cy - R) + ' A' + R + ',' + R + ' 0 0 1 ' + cx + ',' + (cy + R) +
        ' A' + rx + ',' + R + ' 0 0 ' + (gib ? 1 : 0) + ' ' + cx + ',' + (cy - R) + ' Z';
    } else {
      d = 'M' + cx + ',' + (cy - R) + ' A' + R + ',' + R + ' 0 0 0 ' + cx + ',' + (cy + R) +
        ' A' + rx + ',' + R + ' 0 0 ' + (gib ? 0 : 1) + ' ' + cx + ',' + (cy - R) + ' Z';
    }
    lit = '<path d="' + d + '" fill="#f6e7b8"/>';
  }
  return '<svg class="moon-disc" viewBox="0 0 200 200" role="img" aria-label="Moon, ' + illumination + ' percent lit" width="200" height="200">' +
    '<circle cx="100" cy="100" r="80" fill="#1d2038" stroke="#3a3f63" stroke-width="2"/>' + lit + '</svg>';
}

function moonDate(ms) {
  return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(ms));
}

export function moonPage({ origin, now, birth }) {
  const today = moonInfo(now);
  let birthBlock = '';
  if (birth) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birth);
    const ms = m ? Date.UTC(+m[1], +m[2] - 1, +m[3], 12, 0) : NaN;
    if (!m || Number.isNaN(ms) || ms > now) {
      birthBlock = '<p class="moon-error" role="alert">Please enter a valid past date.</p>';
    } else {
      const b = moonInfo(ms);
      birthBlock =
        '<section class="moon-card" aria-labelledby="moon-birth-title"><h2 id="moon-birth-title">The moon on ' + e(moonDate(ms)) + '</h2>' +
        '<div class="moon-row">' + moonSvg(b.illumination, b.waxing) +
        '<div><p class="moon-name">' + e(b.name) + '</p><p>' + b.illumination + '% lit · ' + b.age + ' days into the cycle</p></div></div>' +
        '<p class="moon-note">Phase only. Your moon sign (rashi) needs a full astronomy calculation, which this page does not do.</p></section>';
    }
  }
  const help = MOON_PHASE_HELP.map(([n, d]) => '<li><strong>' + e(n) + '</strong> — ' + e(d) + '</li>').join('');
  const body =
    '<header class="page-head"><p class="eyebrow">Moon</p><h1>Moon phase today</h1>' +
    '<p class="lede">The moon phase right now, the date of the next full moon, and the moon on any birth date.</p></header>' +
    '<section class="moon-card moon-today" aria-labelledby="moon-today-title"><h2 id="moon-today-title">Today</h2>' +
    '<div class="moon-row">' + moonSvg(today.illumination, today.waxing) +
    '<div><p class="moon-name">' + e(today.name) + '</p><p>' + today.illumination + '% lit · ' + today.age + ' days into the cycle</p>' +
    '<p>Next full moon: <strong>' + e(moonDate(today.nextFullMs)) + '</strong></p></div></div>' +
    '<p class="moon-note">Calculated from the average lunar cycle. It can differ from the exact moment by about a day.</p></section>' +
    '<section class="moon-card" aria-labelledby="moon-birth-form-title"><h2 id="moon-birth-form-title">Find the moon on your birth date</h2>' +
    '<form method="get" action="/moon" class="moon-form"><label for="moon-birth">Birth date</label>' +
    '<input id="moon-birth" name="birth" type="date" required value="' + e(birth || '') + '" max="' + e(new Date(now).toISOString().slice(0, 10)) + '">' +
    '<button type="submit" class="moon-btn">Show my birth moon</button></form></section>' +
    birthBlock +
    '<section class="moon-card" aria-labelledby="moon-phases-title"><h2 id="moon-phases-title">The eight phases</h2><ul class="moon-list">' + help + '</ul></section>' +
    '<p class="moon-links"><a href="/sleep">Wind down for sleep</a> · <a href="/zen">The Zen Space</a> · <a href="/">Poojapathvala</a></p>';
  return layout({
    lang: 'en',
    origin,
    path: '/moon',
    title: 'Moon Phase Today and Birth Moon Calculator · Poojapathvala',
    description: 'Today\'s moon phase, illumination and the next full moon, plus the moon phase on any birth date. Calculated from the average lunar cycle.',
    body,
    showLangToggle: false,
    extraCss: ['/moon.css'],
  });
}

// ---- /sleep: a bedtime wind-down with a breathing guide, a timer and a checklist ----
export function sleepPage({ origin }) {
  const body =
    '<header class="page-head"><p class="eyebrow">Sleep</p><h1>Bedtime wind-down</h1>' +
    '<p class="lede">Slow your breath, lower the lights, and let the timer bring you to rest.</p></header>' +
    '<section class="sleep-card" aria-labelledby="sleep-breath-title"><h2 id="sleep-breath-title">Breathe with the circle</h2>' +
    '<div class="sleep-stage"><div class="sleep-circle" id="sleep-circle" aria-hidden="true"></div></div>' +
    '<p class="sleep-cue" id="sleep-cue" aria-live="polite">Breathe in for 4</p>' +
    '<div class="sleep-row"><button type="button" class="sleep-btn" id="sleep-breath-btn" aria-pressed="false">Start breathing</button></div>' +
    '<p class="sleep-note">4 counts in, 7 held, 8 out. Repeat as long as you like.</p></section>' +
    '<section class="sleep-card" aria-labelledby="sleep-timer-title"><h2 id="sleep-timer-title">Wind-down timer</h2>' +
    '<div class="sleep-row" role="group" aria-label="Choose minutes">' +
    '<button type="button" class="sleep-btn" data-min="10" aria-pressed="false">10 min</button>' +
    '<button type="button" class="sleep-btn" data-min="20" aria-pressed="true">20 min</button>' +
    '<button type="button" class="sleep-btn" data-min="30" aria-pressed="false">30 min</button></div>' +
    '<p class="sleep-clock" id="sleep-clock" aria-live="polite">20:00</p>' +
    '<div class="sleep-row"><button type="button" class="sleep-btn sleep-primary" id="sleep-timer-btn">Start timer</button></div>' +
    '<label class="sleep-slider"><span>Night sounds</span><select id="sleep-sound" class="sleep-select" aria-label="Night sound">' +
    '<option value="none">None</option><option value="rain">Soft rain</option><option value="river">River</option></select></label>' +
    '<p class="sleep-note">The sound fades out over the last minute of the timer.</p></section>' +
    '<section class="sleep-card" aria-labelledby="sleep-list-title"><h2 id="sleep-list-title">Before you sleep</h2>' +
    '<ul class="sleep-check">' +
    ['Put the phone face down or across the room', 'Dim the lights', 'Drink a glass of water', 'Write down tomorrow\'s first task', 'Set the room a little cooler'].map((item, i) =>
      '<li><label><input type="checkbox" data-check="' + i + '"> ' + e(item) + '</label></li>').join('') +
    '</ul><p class="sleep-note">Your ticks stay on this device.</p></section>' +
    '<p class="sleep-links"><a href="/moon">See tonight\'s moon</a> · <a href="/zen">The Zen Space</a></p>';
  return layout({
    lang: 'en',
    origin,
    path: '/sleep',
    title: 'Bedtime Wind-Down: Breathing, Timer and Night Sounds · Poojapathvala',
    description: 'A calm bedtime wind-down with a 4-7-8 breathing guide, a sleep timer, soft night sounds and a before-sleep checklist. Free, nothing is stored.',
    body,
    showLangToggle: false,
    extraCss: ['/sleep.css'],
    extraJs: ['/sleep.js'],
  });
}

// ---- Geeta Says ||: the tool, and one page per emotion ----
function verseData() {
  return JSON.stringify(GITA_VERSES.map((v) => ({
    id: v.id, keywords: v.keywords, ref: v.ref, sanskrit: v.sanskrit, translit: v.translit,
    translation: v.translation, reflection: v.reflection, mantraLine: v.mantraLine, microAction: v.microAction,
  }))).replace(/</g, '\\u003c');
}

export function geetaSaysPage({ origin, emotion }) {
  const emo = emotion ? EMOTIONS[emotion] : null;
  const shown = emo ? verseById(emo.verse) : null;
  const title = emo ? emo.title + ': a Bhagavad Gita verse and a one-minute reset · Geeta Says ||' : 'Geeta Says || · Bhagavad Gita verse and a one-minute reset';
  const description = emo ? emo.lede : 'Share what is weighing on you and receive a Bhagavad Gita verse, then follow a one-minute reset. Nothing you write is stored.';
  const path = emo ? '/geeta-says/' + emotion : '/geeta-says';
  const presets = ['I cannot stop overthinking the future and results', 'I am afraid of failing and starting over', 'I feel lost, weak, and full of self-doubt', 'I am hurt and angry about how someone treated me', 'I am grieving a loss and struggling with change', 'I keep comparing my path and timeline to others'];
  const chips = presets.map((p) => '<button type="button" class="gs-chip" data-preset="' + e(p) + '">' + e(p.length > 34 ? p.slice(0, 34) + '…' : p) + '</button>').join('');
  const resultStatic = shown ? '<span class="gs-badge" id="gs-ref">' + e(shown.ref) + '</span>' : '<span class="gs-badge" id="gs-ref">Bhagavad Gita</span>';
  const body =
    '<div class="gs-wrap">' +
    '<header class="page-head"><p class="eyebrow">Geeta Says ||</p><h1>' + e(emo ? emo.title : 'What is weighing on you?') + '</h1>' +
    '<p class="lede">' + e(description) + '</p></header>' +
    '<section class="gs-card" id="gs-input-stage"' + (emo ? ' hidden' : '') + '>' +
    '<label for="gs-input" class="gs-label">Write what is on your mind</label>' +
    '<textarea id="gs-input" class="gs-textarea" maxlength="500" placeholder="For example: I cannot stop worrying about my results"></textarea>' +
    '<p class="gs-note-privacy">Your words stay in this browser. They are wiped as soon as you continue.</p>' +
    '<div class="gs-chips">' + chips + '</div>' +
    '<button type="button" class="gs-primary" id="gs-seek">Seek clarity and begin the 1-minute reset</button></section>' +
    '<section class="gs-card" id="gs-result" data-verse="' + (shown ? e(shown.id) : '') + '"' + (emo ? '' : ' hidden') + '>' +
    resultStatic +
    '<p class="gs-sanskrit" id="gs-sanskrit">' + e(shown ? shown.sanskrit : '') + '</p>' +
    '<p class="gs-translit" id="gs-translit">' + e(shown ? shown.translit : '') + '</p>' +
    '<p class="gs-translation" id="gs-translation">“' + e(shown ? shown.translation : '') + '”</p>' +
    '<div class="gs-reflection" id="gs-reflection">' + e(shown ? shown.reflection : '') + '</div>' +
    '<div class="gs-path-head"><span class="gs-step">1-minute pathway to stillness</span><span class="gs-timer" id="gs-timer">01:00</span></div>' +
    '<div class="gs-stage" id="gs-path"><p class="gs-step">Step 1 of 3 · Slow the breath</p><p class="gs-cue">Press start to begin the one-minute reset.</p></div>' +
    '<div class="gs-actions"><button type="button" class="gs-primary" id="gs-start"' + (emo ? '' : ' hidden') + '>Start the 1-minute reset</button></div>' +
    '<div class="gs-actions"><button type="button" class="gs-secondary" id="gs-export">Save verse card (PNG)</button>' +
    '<button type="button" class="gs-secondary" id="gs-release">Release another worry</button></div></section>' +
    '<p class="gs-cross">Overwhelmed more broadly? Try <a href="/zen">the Zen Space</a> or <a href="/sleep">the bedtime wind-down</a>.</p>' +
    '<script type="application/json" id="gs-data">' + verseData() + '</script>' +
    '</div>';
  return layout({
    lang: 'en',
    origin,
    path,
    title,
    description,
    body,
    showLangToggle: false,
    extraCss: ['/geeta-says.css'],
    extraJs: ['/geeta-says.js'],
  });
}

// The index: every tool on the site, in one place.
export function indexPage({ origin }) {
  const cards = TOOLS.map((tool) =>
    '<a class="tool-card" href="' + e(tool.path) + '"><strong>' + e(tool.en) + ' · ' + e(tool.hi) + '</strong><span>' + e(tool.desc) + '</span></a>'
  ).join('');
  const body =
    '<header class="page-head"><p class="eyebrow">Index</p><h1>Everything on Poojapathvala</h1>' +
    '<p class="lede">The library and the calm tools in one place.</p></header>' +
    '<section aria-labelledby="index-tools"><h2 id="index-tools" class="sr-only">Tools</h2><div class="gs-index-grid">' + cards + '</div></section>' +
    '<p class="gs-cross">Looking for a text? Start with <a href="/">the library</a>, or browse <a href="/chalisa">chalisas</a>, <a href="/aarti">aartis</a>, <a href="/stotra">stotras</a>, <a href="/mantra">mantras</a> and <a href="/puja">puja vidhi</a>.</p>';
  return layout({
    lang: 'en',
    origin,
    path: '/index',
    title: 'Index · Poojapathvala',
    description: 'Every page on Poojapathvala: the devotional library, tarot, mala counter, Zen Space, Geeta Says, moon phase and bedtime wind-down.',
    body,
    showLangToggle: false,
    extraCss: ['/geeta-says.css'],
  });
}
