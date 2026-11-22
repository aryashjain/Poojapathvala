// Admin UI: create a collection (step 1), add a text to one (step 2), and read feedback.
// Protected by HTTP Basic auth using the ADMIN_PASSWORD secret.
import { loadLibrary, validateTopic, validateDoc, saveTopic, saveDoc } from './library.js';
import { listFeedback } from './feedback.js';
import { html, redirect } from './http.js';
import * as view from './templates.js';

const MAX_FORM_BYTES = 300000;

function passwordFromRequest(request) {
  const match = (request.headers.get('authorization') || '').match(/^Basic\s+(.+)$/i);
  if (!match) return null;
  try {
    const bytes = Uint8Array.from(atob(match[1]), (char) => char.charCodeAt(0));
    const decoded = new TextDecoder().decode(bytes);
    const separator = decoded.indexOf(':');
    return separator === -1 ? null : decoded.slice(separator + 1);
  } catch {
    return null;
  }
}

function safeEqual(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

function authRequired() {
  return new Response('Authentication required', {
    status: 401,
    headers: {
      'www-authenticate': 'Basic realm="TextBase admin", charset="UTF-8"',
      'cache-control': 'no-store',
    },
  });
}

function emptyState(values = {}) {
  return { values, errors: {} };
}

export async function handleAdmin(request, env, url, origin, parts) {
  if (!env.ADMIN_PASSWORD) {
    return html(
      view.adminNoticePage({
        origin,
        title: 'Adding texts is turned off',
        message: 'Set the ADMIN_PASSWORD secret to enable the admin page.',
      }),
      503,
      'no-store',
    );
  }
  if (!env.LIBRARY) {
    return html(
      view.adminNoticePage({
        origin,
        title: 'Storage is not set up',
        message: 'Bind a KV namespace called LIBRARY. See docs/CONTENT.md.',
      }),
      503,
      'no-store',
    );
  }

  const password = passwordFromRequest(request);
  if (password === null || !safeEqual(password, env.ADMIN_PASSWORD)) return authRequired();

  if (parts.length === 1) {
    if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET' } });
    const topics = await loadLibrary(env);
    const feedback = await listFeedback(env);
    const topicSlug = url.searchParams.get('topic') || '';
    return html(
      view.adminPage({
        origin,
        topics,
        feedback,
        topicState: emptyState(),
        textState: emptyState({ topic: topicSlug }),
      }),
      200,
      'no-store',
    );
  }

  const isCreate = parts.length === 2 && (parts[1] === 'topics' || parts[1] === 'texts');
  if (!isCreate) return html(view.notFoundPage({ lang: 'en', origin }), 404, 'no-store');
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { allow: 'POST' } });

  // Browsers send the Origin header on cross-site form posts; reject anything not from this site.
  if (request.headers.get('origin') !== origin) return new Response('Forbidden', { status: 403 });
  if (Number(request.headers.get('content-length') || 0) > MAX_FORM_BYTES) {
    return new Response('Form too large', { status: 413 });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return new Response('Bad request', { status: 400 });
  }
  const fields = Object.fromEntries([...form.entries()].filter(([, value]) => typeof value === 'string'));

  const topics = await loadLibrary(env);
  const feedback = await listFeedback(env);

  if (parts[1] === 'topics') {
    const result = validateTopic(fields, topics.map((topic) => topic.slug));
    if (!result.ok) {
      return html(
        view.adminPage({
          origin,
          topics,
          feedback,
          topicState: { values: result.values, errors: result.errors },
          textState: emptyState({ topic: fields.topic || '' }),
        }),
        400,
        'no-store',
      );
    }
    await saveTopic(env, result.value);
    return redirect('/t/' + result.value.slug);
  }

  // parts[1] === 'texts'
  const topicSlug = clean(fields.topic);
  const topic = topics.find((item) => item.slug === topicSlug);
  const result = topic
    ? validateDoc(fields, topic.docs.map((doc) => doc.slug))
    : { ok: false, errors: {}, values: {}, value: null };
  if (!topic) result.errors.topic = 'Choose the collection this text belongs to.';

  if (!result.ok) {
    return html(
      view.adminPage({
        origin,
        topics,
        feedback,
        topicState: emptyState(),
        textState: { values: { ...result.values, topic: topicSlug }, errors: result.errors },
      }),
      400,
      'no-store',
    );
  }

  await saveDoc(env, topic.slug, result.value);
  return redirect('/t/' + topic.slug + '/' + result.value.slug);
}

function clean(value) {
  return String(value ?? '').trim();
}
