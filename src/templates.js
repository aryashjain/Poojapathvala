import { escapeHtml, renderMarkdown } from './markdown.js';
import { t, loc, minutes, textCount, formatDate } from './i18n.js';

const e = escapeHtml;

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
  'चालीसा, chalisa, स्तोत्र, stotra, मंत्र, mantra, पवित्र ग्रंथ, sacred texts, Poojapaathwala';

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
    '<script src="/assets/theme.js"></script>\n' +
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
    '<link rel="stylesheet" href="/assets/site.css">\n' +
    extraCss.map((href) => '<link rel="stylesheet" href="' + e(href) + '">\n').join('') +
    (jsonLd ? '<script type="application/ld+json">' + safeJson(jsonLd) + '</script>\n' : '') +
    '</head>\n<body>\n' +
    '<header class="site-header"><div class="' + wrap + ' header-inner">' +
    '<a class="brand" href="/" lang="' + lang + '">' +
    '<span class="brand-mark"><img src="/mark.png" width="512" height="512" alt=""></span>' +
    '<span class="brand-name">' + e(brand) + '</span></a>' +
    (showLangToggle ? langToggle(lang, path) : '') +
    searchForm(lang, 'header') +
    '</div></header>\n' +
    '<main class="' + wrap + '">\n' + body + '\n</main>\n' +
    '<footer class="site-footer"><div class="' + wrap + '">' +
    '<span>' + e(brand) + ' · ' + e(t(lang, 'tagline')) + '</span>' +
    '<span><a href="/sitemap.xml">' + e(t(lang, 'sitemap')) + '</a> · <a href="/feedback">' + e(t(lang, 'feedbackLink')) + '</a> · <a href="/admin">' + e(t(lang, 'addTexts')) + '</a></span>' +
    '</div></footer>\n' +
    '<script src="/assets/app.js" defer></script>\n' +
    extraJs.map((src) => '<script src="' + e(src) + '" defer></script>\n').join('') +
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
        alternateName: ['Poojapaathwala', 'पूजापाठवाला'],
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
        name: 'Poojapaathwala',
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
