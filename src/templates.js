import { escapeHtml, renderMarkdown } from './markdown.js';
import { t, loc, minutes, textCount, formatDate } from './i18n.js';
import { isPending } from './status.js';
import { CARDS, SPREADS, SUIT_LABELS } from './tarot-data.js';
import { TOPICS } from './tarot-topics.js';
import { ASSET_VERSION } from './version.js';
import { activeAffiliates, AFFILIATES } from './affiliates.js';

// Shopping links for pooja and aarti texts. Shown only when affiliates are enabled.
function affiliateBox(lang, doc) {
  const tags = doc.tags || [];
  const items = activeAffiliates();
  if (!items.length || !(tags.includes('pooja') || tags.includes('aarti'))) return '';
  return (
    '<aside class="shop" aria-labelledby="shop-title">' +
    '<h2 id="shop-title">Pooja samagri</h2><ul>' +
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
    '<meta property="og:site_name" content="' + e(brand) + '">\n' +
    '<meta property="og:locale" content="' + (lang === 'hi' ? 'hi_IN' : 'en_US') + '">\n' +
    '<meta property="og:type" content="' + type + '">\n' +
    '<meta property="og:title" content="' + e(title) + '">\n' +
    '<meta property="og:description" content="' + e(description) + '">\n' +
    '<meta property="og:url" content="' + e(url) + '">\n' +
    '<meta property="og:image" content="' + e(origin + '/og.png') + '">\n' +
    '<meta name="twitter:image" content="' + e(origin + '/og.png') + '">\n' +
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
    '<span class="brand-mark"><img src="/mark.png" width="512" height="512" alt=""></span>' +
    '<span class="brand-name">' + e(brand) + '</span></a>' +
    (showLangToggle ? langToggle(lang, path) : '') +
    searchForm(lang, 'header') +
    '</div></header>\n' +
    '<main class="' + wrap + '">\n' + body + '\n' + (path.startsWith('/tarot') ? TAROT_NOTE : '') + '</main>\n' +
    '<footer class="site-footer"><div class="' + wrap + '">' +
    '<span>' + e(brand) + ' · ' + e(t(lang, 'tagline')) + '</span>' +
    '<span><a href="/sitemap.xml">' + e(t(lang, 'sitemap')) + '</a> · <a href="/feedback">' + e(t(lang, 'feedbackLink')) + '</a> · <a href="/admin">' + e(t(lang, 'addTexts')) + '</a></span>' +
    '</div></footer>\n' +
    '<script src="/assets/app.js?v=' + ASSET_VERSION + '" defer></script>\n' +
    extraJs.map((src) => '<script src="' + e(src) + '?v=' + ASSET_VERSION + '" defer></script>\n').join('') +
    '<script src="https://quge5.com/88/tag.min.js" data-zone="314751" async data-cfasync="false"></script>\n' +
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
    '<p><a class="tarot-cta" href="/tarot">🔮 Tarot reader · टैरो रीडर</a></p>' +
    '</section>' +
    '<section class="topics" aria-label="' + e(t(lang, 'collectionsAria')) + '">' +
    (cards || '<p>' + e(t(lang, 'noCollections')) + '</p>') +
    '</section>' +
    featuredList;

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
    pager +
    relatedSection(lang, related);

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
    title:
      titleName(lang, doc.title, doc.hindiTitle) +
      ' · ' +
      titleName(lang, topic.title, topic.titleHi) +
      ' · ' +
      t(lang, 'brandName'),
    description: description || doc.title + ' · ' + topic.title,
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
    ],
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
    '<header class="page-head tarot-head"><p class="eyebrow">Tarot reader</p><h1>Draw your cards</h1>' +
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
    '<script type="application/json" id="tarot-data">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';

  return layout({
    lang: TAROT_LANG,
    origin,
    path: '/tarot',
    title: 'Tarot Reader: Free Card Draw, Yes or No, Love and Career · Poojapathvala',
    description: 'Free online tarot reader. Draw a daily card, a three-card spread, a yes or no answer, or a love or career spread, with upright and reversed meanings.',
    body,
    showLangToggle: false,
    extraCss: ['/assets/tarot.css'],
    extraJs: ['/assets/tarot.js'],
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
    '<section class="library" aria-label="All cards"><div class="deck-row">' + libraryDeck() + '</div></section>';

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
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: card.name + ' tarot meaning',
      description: card.upright,
      mainEntityOfPage: origin + path,
    },
  });
}
