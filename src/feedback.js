// Reader feedback. Messages are stored in the LIBRARY KV namespace under
// "feedback:<inverted-timestamp>-<id>" so a prefix list returns newest first.
// Validation returns i18n keys for errors; the page translates them.

export const FEEDBACK_TYPES = ['bug', 'content', 'idea', 'other'];
export const FEEDBACK_LIMITS = { name: 80, email: 120, message: 2000 };
const PREFIX = 'feedback:';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value) {
  return String(value ?? '').replace(/\r\n?/g, '\n').trim();
}

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

export async function saveFeedback(env, record) {
  const order = String(9999999999999 - Date.now()).padStart(13, '0');
  const id = crypto.randomUUID().slice(0, 8);
  await env.LIBRARY.put(PREFIX + order + '-' + id, JSON.stringify(record));
}

export async function listFeedback(env, limit = 100) {
  if (!env || !env.LIBRARY) return [];
  const page = await env.LIBRARY.list({ prefix: PREFIX, limit });
  const records = await Promise.all(page.keys.map((key) => env.LIBRARY.get(key.name, 'json')));
  return records.filter(Boolean);
}
