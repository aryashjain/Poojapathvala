// Library = repo content (content/, built into the Worker) + collections and texts
// added through the admin UI, stored as one value under "library" in the LIBRARY KV namespace.
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

// All admin-added content lives in one KV value, so a page view costs at most one
// read, and that is cached in memory. Listing KV keys on every request exhausted
// the free-tier list quota.
const LIBRARY_KEY = 'library';
const CACHE_MS = 5 * 60 * 1000;
let cache = { at: 0, data: null };

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

// Reads the stored value. If it doesn't exist yet, migrates the older one-key-per-record
// layout once, then writes the combined value so later reads never list keys again.
async function readRecords(kv) {
  const stored = await kv.get(LIBRARY_KEY, 'json');
  if (stored) return stored;

  const records = { topics: [], docs: [] };
  const topicKeys = await listKeys(kv, 'topic:');
  const docKeys = await listKeys(kv, 'doc:');
  for (const key of topicKeys) {
    const record = await kv.get(key, 'json');
    if (record) records.topics.push(record);
  }
  for (const key of docKeys) {
    const record = await kv.get(key, 'json');
    if (record) records.docs.push(record);
  }
  await kv.put(LIBRARY_KEY, JSON.stringify(records));
  return records;
}

async function cachedRecords(kv) {
  if (cache.data && Date.now() - cache.at < CACHE_MS) return cache.data;
  const data = await readRecords(kv);
  cache = { at: Date.now(), data };
  return data;
}

function invalidateCache() {
  cache = { at: 0, data: null };
}

export async function loadLibrary(env) {
  const topics = REPO_TOPICS.map((topic) => ({ ...topic, docs: [...topic.docs] }));

  if (env && env.LIBRARY) {
    // If KV is unavailable (quota exceeded, outage), serve the repo content rather than failing.
    let records = { topics: [], docs: [] };
    try {
      records = await cachedRecords(env.LIBRARY);
    } catch (error) {
      console.error('[library] KV unavailable, serving repo content only:', error && error.message);
    }

    for (const record of records.topics) {
      if (!topics.some((topic) => topic.slug === record.slug)) {
        topics.push({ ...record, intro: record.intro || '', docs: [] });
      }
    }

    for (const record of records.docs) {
      const topic = topics.find((item) => item.slug === record.topic);
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

async function updateRecords(kv, change) {
  const records = await readRecords(kv);
  change(records);
  await kv.put(LIBRARY_KEY, JSON.stringify(records));
  invalidateCache();
}

export async function saveTopic(env, topic) {
  await updateRecords(env.LIBRARY, (records) => {
    records.topics = records.topics.filter((item) => item.slug !== topic.slug);
    records.topics.push(topic);
  });
}

export async function saveDoc(env, topicSlug, doc) {
  const record = { ...doc, topic: topicSlug };
  await updateRecords(env.LIBRARY, (records) => {
    records.docs = records.docs.filter((item) => !(item.topic === topicSlug && item.slug === doc.slug));
    records.docs.push(record);
  });
}
