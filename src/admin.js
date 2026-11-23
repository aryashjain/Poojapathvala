// Admin: read-only view of reader feedback. Protected by HTTP Basic auth (ADMIN_PASSWORD).
// Texts are not managed here; they are added to content/ and pushed.
import { listFeedback } from './feedback.js';
import { html } from './http.js';
import * as view from './templates.js';

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
      'www-authenticate': 'Basic realm="Poojapathvala admin", charset="UTF-8"',
      'cache-control': 'no-store',
    },
  });
}

export async function handleAdmin(request, env, url, origin, parts) {
  if (!env.ADMIN_PASSWORD) {
    return html(
      view.adminNoticePage({
        origin,
        title: 'Admin is turned off',
        message: 'This page is not available.',
      }),
      503,
      'no-store',
    );
  }

  const password = passwordFromRequest(request);
  if (password === null || !safeEqual(password, env.ADMIN_PASSWORD)) return authRequired();

  if (parts.length !== 1) return html(view.notFoundPage({ lang: 'en', origin }), 404, 'no-store');
  if (request.method !== 'GET') return new Response('Method Not Allowed', { status: 405, headers: { allow: 'GET' } });

  const feedback = await listFeedback(env);
  return html(view.adminPage({ origin, feedback }), 200, 'no-store');
}
