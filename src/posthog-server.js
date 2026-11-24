import { PostHog } from 'posthog-node';

const missingMessage = (name) =>
  `${name} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${name} is configured`;

export function createPostHog(env) {
  const token = typeof env.POSTHOG_PROJECT_TOKEN === 'string' ? env.POSTHOG_PROJECT_TOKEN.trim() : '';
  const host = typeof env.POSTHOG_HOST === 'string' ? env.POSTHOG_HOST.trim() : '';

  if (!token || !host) {
    if (env.NODE_ENV !== 'production') console.warn(missingMessage(!token ? 'POSTHOG_PROJECT_TOKEN' : 'POSTHOG_HOST'));
    return null;
  }

  return new PostHog(token, {
    host,
    enableExceptionAutocapture: true,
    logs: { serviceName: 'poojapathvala-worker' },
    flushAt: 1,
    flushInterval: 0,
    requestTimeout: 2000,
    fetchRetryCount: 0,
  });
}
