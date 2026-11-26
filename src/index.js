import { loadLibrary } from './library.js';
import { buildSearchDocs, searchDocs } from './search.js';
import { CSS, JS, THEME_JS } from './assets.js';
import { ADMIN_CSS, ADMIN_JS } from './admin-assets.js';
import { TAROT_CSS, TAROT_JS } from './tarot-assets.js';
import { CARDS } from './tarot-data.js';
import { handleAdmin } from './admin.js';
import { handleFeedback } from './feedback-route.js';
import { html } from './http.js';
import * as view from './templates.js';
import { escapeHtml } from './markdown.js';
import { LANGS, langFromRequest } from './i18n.js';
import { relatedDocs } from './related.js';
import { isPending } from './status.js';
import { captureWorkerException, posthogBrowserScript } from './posthog.js';

function asset(body, type) {
  return new Response(body, {
    headers: { 'content-type': type, 'cache-control': 'public, max-age=3600' },
  });
}

function json(data) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=60' },
  });
}

function decode(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

// Only same-site paths are allowed as redirect targets after switching language.
function safeNextPath(next) {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.includes('\\')) return '/';
  return next;
}

function sitemap(origin, topics) {
  const entries = [
    { loc: origin + '/' },
    { loc: origin + '/tarot' },
    { loc: origin + '/tarot/cards' },
    { loc: origin + '/about' },
    { loc: origin + '/contact' },
    { loc: origin + '/privacy' },
    ...view.KIND_PAGE_KEYS.map((kind) => ({ loc: origin + '/' + kind })),
  ];
  for (const card of CARDS) entries.push({ loc: origin + '/tarot/card/' + card.id });
  for (const topic of topics) {
    entries.push({ loc: origin + '/t/' + topic.slug });
    for (const doc of topic.docs) if (!isPending(doc)) entries.push({ loc: origin + '/t/' + topic.slug + '/' + doc.slug, lastmod: doc.date });
  }
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    entries
      .map(({ loc, lastmod }) => {
        const date = lastmod && /^\d{4}-\d{2}-\d{2}$/.test(lastmod) ? '<lastmod>' + lastmod + '</lastmod>' : '';
        return '  <url><loc>' + escapeHtml(loc) + '</loc>' + date + '</url>\n';
      })
      .join('') +
    '</urlset>\n'
  );
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
    // One host only: www redirects to the bare domain, so search engines see a single site.
    if (url.hostname.startsWith('www.')) {
      url.hostname = url.hostname.slice(4);
      return new Response(null, { status: 301, headers: { location: url.toString(), 'cache-control': 'public, max-age=86400' } });
    }
    const origin = url.origin;
    const parts = url.pathname.split('/').filter(Boolean).map(decode);

    if (parts[0] === 'admin') {
      return handleAdmin(request, env, url, origin, parts);
    }

    if (parts.length === 1 && parts[0] === 'feedback') {
      return handleFeedback(request, env, url, origin, langFromRequest(request));
    }

    const infoPages = { about: view.aboutPage, contact: view.contactPage, privacy: view.privacyPage };
    if (parts.length === 1 && infoPages[parts[0]] && (request.method === 'GET' || request.method === 'HEAD')) {
      return html(infoPages[parts[0]]({ lang: langFromRequest(request), origin }), 200, 'public, max-age=3600');
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    }

    // Language switch: sets the cookie, then sends the visitor back where they were.
    if (parts.length === 2 && parts[0] === 'lang') {
      if (!LANGS.includes(parts[1])) return new Response('Not found', { status: 404 });
      return new Response(null, {
        status: 303,
        headers: {
          location: safeNextPath(url.searchParams.get('next')),
          'cache-control': 'no-store',
          'set-cookie': 'pp-lang=' + parts[1] + '; Path=/; Max-Age=31536000; SameSite=Lax',
        },
      });
    }

    // Static routes first: they don't need the library, so they never touch KV.
    if (parts.length === 2 && parts[0] === 'assets') {
      if (parts[1] === 'site.css') return asset(CSS, 'text/css; charset=utf-8');
      if (parts[1] === 'posthog.js') {
        return new Response(posthogBrowserScript(env), {
          headers: { 'content-type': 'application/javascript; charset=utf-8', 'cache-control': 'no-store' },
        });
      }
      if (parts[1] === 'theme.js') return asset(THEME_JS, 'application/javascript; charset=utf-8');
      if (parts[1] === 'app.js') return asset(JS, 'application/javascript; charset=utf-8');
      if (parts[1] === 'admin.css') return asset(ADMIN_CSS, 'text/css; charset=utf-8');
      if (parts[1] === 'admin.js') return asset(ADMIN_JS, 'application/javascript; charset=utf-8');
      if (parts[1] === 'tarot.css') return asset(TAROT_CSS, 'text/css; charset=utf-8');
      if (parts[1] === 'tarot.js') return asset(TAROT_JS, 'application/javascript; charset=utf-8');
    }

    // Tarot reader and card pages do not need the library, so they come before it.
    if (parts[0] === 'tarot' && parts.length === 2 && parts[1] === 'cards') {
      return html(view.tarotCardsPage({ origin }));
    }
    if (parts[0] === 'tarot' && parts.length === 1) {
      return html(view.tarotReaderPage({ origin }));
    }
    if (parts[0] === 'tarot' && parts[1] === 'card' && parts.length === 3) {
      const card = CARDS.find((item) => item.id === parts[2]);
      if (card) return html(view.tarotCardPage({ origin, card }));
    }

    if (parts.length === 1 && parts[0] === 'robots.txt') {
      return new Response('User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /lang/\nDisallow: /api/\nDisallow: /feedback\n\nSitemap: ' + origin + '/sitemap.xml\n', {
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
      });
    }

    const lang = langFromRequest(request);
    const topics = loadLibrary();

    if (parts.length === 0) {
      return html(view.homePage({ lang, origin, topics }));
    }

    if (parts.length === 1 && view.KIND_PAGE_KEYS.includes(parts[0])) {
      return html(view.kindPage({ lang, origin, kind: parts[0], topics }));
    }

    if (parts.length === 1 && parts[0] === 'search') {
      const query = url.searchParams.get('q') ?? '';
      const results = searchDocs(buildSearchDocs(topics, lang), query);
      return html(view.searchPage({ lang, origin, query, results }), 200, 'no-cache');
    }

    if (parts.length === 2 && parts[0] === 'api' && parts[1] === 'search') {
      const query = url.searchParams.get('q') ?? '';
      return json({ query, results: searchDocs(buildSearchDocs(topics, lang), query) });
    }

    if (parts.length === 1 && parts[0] === 'sitemap.xml') {
      return new Response(sitemap(origin, topics), {
        headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
      });
    }

    if (parts[0] === 't' && parts.length >= 2 && parts.length <= 3) {
      const topic = topics.find((item) => item.slug === parts[1]);
      if (topic) {
        if (parts.length === 2) {
          return html(view.topicPage({ lang, origin, topic }));
        }

        const docIndex = topic.docs.findIndex((doc) => doc.slug === parts[2]);
        if (docIndex !== -1) {
          return html(
            view.docPage({
              lang,
              origin,
              topic,
              doc: topic.docs[docIndex],
              prev: topic.docs[docIndex - 1],
              next: topic.docs[docIndex + 1],
              related: relatedDocs(topics, topic, topic.docs[docIndex]),
            }),
          );
        }
      }
    }

      return html(view.notFoundPage({ lang, origin }), 404, 'no-store');
    } catch (error) {
      await captureWorkerException(error, env);
      throw error;
    }
  },
};
