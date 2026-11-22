// Public feedback page: GET shows the form, POST stores a message and redirects.
import * as view from './templates.js';
import { html, redirect } from './http.js';
import { validateFeedback, saveFeedback } from './feedback.js';

const MAX_FORM_BYTES = 20000;

export async function handleFeedback(request, env, url, origin, lang) {
  if (request.method === 'GET') {
    const sent = url.searchParams.get('sent') === '1';
    return html(view.feedbackPage({ lang, origin, enabled: Boolean(env.LIBRARY), sent }), 200, 'no-store');
  }
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET, POST' } });
  }
  if (!env.LIBRARY) return html(view.feedbackPage({ lang, origin, enabled: false }), 503, 'no-store');

  // Only accept posts that come from this site.
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

  // Honeypot: people never see or fill the "website" field, bots often do.
  // Pretend success so the bot learns nothing.
  if (fields.website) return redirect('/feedback?sent=1');

  const result = validateFeedback(fields);
  if (!result.ok) {
    return html(
      view.feedbackPage({ lang, origin, enabled: true, values: result.values, errors: result.errors }),
      400,
      'no-store',
    );
  }

  await saveFeedback(env, result.value);
  return redirect('/feedback?sent=1');
}
