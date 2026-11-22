import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadLibrary, saveTopic, saveDoc } from '../src/library.js';

// Minimal KV stand-in that counts operations, so the test can check the quota behaviour.
function fakeKV(initial = {}) {
  const store = new Map(Object.entries(initial));
  const ops = { get: 0, list: 0, put: 0 };
  return {
    ops,
    store,
    async get(key, type) {
      ops.get++;
      const value = store.get(key);
      return value === undefined ? null : type === 'json' ? JSON.parse(value) : value;
    },
    async put(key, value) {
      ops.put++;
      store.set(key, value);
    },
    async list({ prefix }) {
      ops.list++;
      const keys = [...store.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name }));
      return { keys, list_complete: true };
    },
  };
}

test('after the combined value exists, loading the library never lists keys', async () => {
  const kv = fakeKV();
  await loadLibrary({ LIBRARY: kv }); // first load migrates and writes the combined value
  const listsAfterFirst = kv.ops.list;
  await loadLibrary({ LIBRARY: kv });
  await loadLibrary({ LIBRARY: kv });
  assert.equal(kv.ops.list, listsAfterFirst);
});

test('a saved collection and text appear in the library straight away', async () => {
  const kv = fakeKV();
  const env = { LIBRARY: kv };
  await saveTopic(env, { slug: 'night-poems', title: 'Night Poems', description: '', order: 9999, intro: '' });
  await saveDoc(env, 'night-poems', { slug: 'lamp', title: 'Lamp', description: '', order: 1, body: 'Light.' });
  const topics = await loadLibrary(env);
  const night = topics.find((t) => t.slug === 'night-poems');
  assert.ok(night);
  assert.deepEqual(night.docs.map((d) => d.slug), ['lamp']);
});
