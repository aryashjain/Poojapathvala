// Reader feedback: the only data stored in KV. All messages live under one key, newest
// first, capped at MAX_STORED. Reading is one get; saving is one get and one put.
// Two saves at the exact same moment can overwrite each other; at this volume that is acceptable.

export const FEEDBACK_TYPES = ['bug', 'content', 'idea', 'other'];
export const FEEDBACK_LIMITS = { name: 80, email: 120, message: 2000 };
const KEY = 'feedback';
const MAX_STORED = 500;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) {
  return String(value ?? '').replace(/\r\n?/g, '\n').trim();
}

// Errors are i18n keys; the page translates them.
export function validateFeedback(fields) {
  const values = {
    name: clean(fields.name),
    email: clean(fields.email),
    type: clean(fields.type),
    message: clean(fields.message),
  };
  if (!FEEDBACK_TYPES.includes(values.type)) values.type = 'other';

  const errors = {};
  if (values.name.length > FEEDBACK_LIMITS.name) errors.name = 'errNameLong';
  if (!values.email) errors.email = 'errEmailRequired';
  else if (values.email.length > FEEDBACK_LIMITS.email || !EMAIL.test(values.email)) {
    errors.email = 'errEmailInvalid';
  }
  if (!values.message) errors.message = 'errMessageRequired';
  else if (values.message.length < 5) errors.message = 'errMessageShort';
  else if (values.message.length > FEEDBACK_LIMITS.message) errors.message = 'errMessageLong';

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values,
    value: { ...values, createdAt: new Date().toISOString() },
  };
}

export async function listFeedback(env) {
  if (!env || !env.LIBRARY) return [];
  const stored = await env.LIBRARY.get(KEY, 'json');
  return Array.isArray(stored) ? stored : [];
}

export async function saveFeedback(env, record) {
  const current = await listFeedback(env);
  await env.LIBRARY.put(KEY, JSON.stringify([record, ...current].slice(0, MAX_STORED)));
}
