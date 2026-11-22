// Library = repo content (content/, built into the Worker) + texts added through
// the admin UI (stored in the LIBRARY KV namespace). KV keys:
//   topic:<topic-slug>            -> topic record
//   doc:<topic-slug>:<doc-slug>   -> text record (includes its topic slug)
import { TOPICS as REPO_TOPICS } from './content.generated.js';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const LIMITS = { title: 120, description: 300, slug: 80, intro: 20000, body: 100000 };
const DEFAULT_ORDER = 9999;

function byOrderThenTitle(a, b) {
  return a.order - b.order || a.title.localeCompare(b.title);
}

export function slugify(text) {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, LIMITS.slug)
    .replace(/-+$/, '');
}

async function listKeys(kv, prefix) {
  const names = [];
  let cursor;
  do {
    const page = await kv.list({ prefix, cursor });
    for (const key of page.keys) names.push(key.name);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return names;
}

export async function loadLibrary(env) {
  const topics = REPO_TOPICS.map((topic) => ({ ...topic, docs: [...topic.docs] }));

  if (env && env.LIBRARY) {
    const kv = env.LIBRARY;
    const [topicKeys, docKeys] = await Promise.all([listKeys(kv, 'topic:'), listKeys(kv, 'doc:')]);
    const [topicRecords, docRecords] = await Promise.all([
      Promise.all(topicKeys.map((key) => kv.get(key, 'json'))),
      Promise.all(docKeys.map((key) => kv.get(key, 'json'))),
    ]);

    for (const record of topicRecords) {
      if (record && !topics.some((topic) => topic.slug === record.slug)) {
        topics.push({ ...record, intro: record.intro || '', docs: [] });
      }
    }

    for (const record of docRecords) {
      const topic = record && topics.find((item) => item.slug === record.topic);
      if (topic && !topic.docs.some((doc) => doc.slug === record.slug)) topic.docs.push(record);
    }
  }

  for (const topic of topics) topic.docs.sort(byOrderThenTitle);
  return topics.sort(byOrderThenTitle);
}

// ---- validation -----------------------------------------------------------

function clean(value) {
  return String(value ?? '').replace(/\r\n?/g, '\n').trim();
}

function parseOrder(raw, errors) {
  if (!raw) return DEFAULT_ORDER;
  if (!/^\d{1,4}$/.test(raw)) {
    errors.order = 'Order must be a whole number from 0 to 9999.';
    return DEFAULT_ORDER;
  }
  return Number(raw);
}

function isValidDate(raw) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return false;
  const date = new Date(raw + 'T00:00:00Z');
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === raw;
}

function checkTitle(title, errors) {
  if (!title) errors.title = 'Give it a title.';
  else if (title.length > LIMITS.title) errors.title = 'Keep the title under ' + LIMITS.title + ' characters.';
}

function checkLength(value, field, max, errors) {
  if (value.length > max) errors[field] = 'Keep this under ' + max + ' characters.';
}

function checkSlug(raw, title, takenSlugs, errors) {
  if (!raw && !title) return '';
  const slug = raw || slugify(title);
  if (!slug) {
    errors.slug = 'Could not make a web address from this title. Enter one using a–z, 0–9 and hyphens.';
  } else if (!SLUG_PATTERN.test(slug) || slug.length > LIMITS.slug) {
    errors.slug = 'Use lowercase letters, digits and single hyphens (max ' + LIMITS.slug + ' characters).';
  } else if (takenSlugs.includes(slug)) {
    errors.slug = 'That web address is already in use.';
  }
  return slug;
}

export function validateTopic(fields, takenSlugs) {
  const values = {
    title: clean(fields.title),
    slug: clean(fields.slug).toLowerCase(),
    description: clean(fields.description),
    order: clean(fields.order),
    intro: clean(fields.intro),
  };
  const errors = {};
  checkTitle(values.title, errors);
  checkLength(values.description, 'description', LIMITS.description, errors);
  checkLength(values.intro, 'intro', LIMITS.intro, errors);
  const order = parseOrder(values.order, errors);
  const slug = checkSlug(values.slug, values.title, takenSlugs, errors);

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values,
    value: { slug, title: values.title, description: values.description, order, intro: values.intro },
  };
}

export function validateDoc(fields, takenSlugs) {
  const values = {
    title: clean(fields.title),
    slug: clean(fields.slug).toLowerCase(),
    description: clean(fields.description),
    order: clean(fields.order),
    date: clean(fields.date),
    body: clean(fields.body),
  };
  const errors = {};
  checkTitle(values.title, errors);
  checkLength(values.description, 'description', LIMITS.description, errors);
  if (!values.body) errors.body = 'Add the text itself.';
  else checkLength(values.body, 'body', LIMITS.body, errors);
  if (values.date && !isValidDate(values.date)) errors.date = 'Use a real date in the form YYYY-MM-DD.';
  const order = parseOrder(values.order, errors);
  const slug = checkSlug(values.slug, values.title, takenSlugs, errors);

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values,
    value: {
      slug,
      title: values.title,
      description: values.description,
      order,
      date: values.date,
      body: values.body,
    },
  };
}

// ---- storage --------------------------------------------------------------

export async function saveTopic(env, topic) {
  await env.LIBRARY.put('topic:' + topic.slug, JSON.stringify(topic));
}

export async function saveDoc(env, topicSlug, doc) {
  await env.LIBRARY.put('doc:' + topicSlug + ':' + doc.slug, JSON.stringify({ ...doc, topic: topicSlug }));
}
