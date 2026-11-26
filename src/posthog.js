import { createPostHog } from './posthog-server.js';

const missingMessage = (name) =>
  `${name} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${name} is configured`;

export async function captureWorkerException(error, env) {
  try {
    const posthog = createPostHog(env);
    if (!posthog) return;

    const exception = error instanceof Error ? error : new Error(String(error));
    posthog.captureException(exception, 'cloudflare_worker');
    await posthog.shutdown(2000).catch(() => {});
  } catch {}
}

export function posthogBrowserScript(env) {
  const token = typeof env.POSTHOG_PROJECT_TOKEN === 'string' ? env.POSTHOG_PROJECT_TOKEN.trim() : '';
  const host = typeof env.POSTHOG_HOST === 'string' ? env.POSTHOG_HOST.trim() : '';
  const development = env.NODE_ENV !== 'production';

  if (!token || !host) {
    const message = missingMessage(!token ? 'POSTHOG_PROJECT_TOKEN' : 'POSTHOG_HOST');
    if (development) console.warn(message);
    return development ? `setTimeout(() => { throw new Error(${JSON.stringify(message)}); }, 0);` : '';
  }

  const config = JSON.stringify({ token, host }).replace(/</g, '\\u003c');
  return `
    (() => {
      const config = ${config};
      const script = document.createElement('script');
      script.src = config.host.replace('.i.posthog.com', '-assets.i.posthog.com') + '/static/array.js';
      script.async = true;
      script.onload = () => window.posthog?.init(config.token, { api_host: config.host, defaults: '2026-08-30' });
      document.head.appendChild(script);
    })();
  `;
}
