export const SECURITY_HEADERS = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'content-security-policy':
    "default-src 'self'; style-src 'self'; script-src 'self' https://quge5.com https://pagead2.googlesyndication.com https://www.googletagservices.com https://securepubads.g.doubleclick.net; connect-src 'self' https://quge5.com https://*.googlesyndication.com https://*.doubleclick.net; img-src 'self' data: https:; base-uri 'none'; form-action 'self'; frame-src https://*.googlesyndication.com https://*.doubleclick.net; frame-ancestors 'none'",
};

export function html(body, status = 200, cache = 'public, max-age=300') {
  return new Response(body, {
    status,
    // Pages differ by language cookie, so caches must key on it.
    headers: {
      ...SECURITY_HEADERS,
      'content-type': 'text/html; charset=utf-8',
      'cache-control': cache,
      vary: 'Cookie',
    },
  });
}

export function redirect(location) {
  return new Response(null, {
    status: 303,
    headers: { location, 'cache-control': 'no-store' },
  });
}
