import { test } from 'node:test';
import assert from 'node:assert/strict';
import { saveFeedback, listFeedback } from '../src/feedback.js';

// KV stand-in that counts operations, so the test can check that feedback never lists keys.
function fakeKV() {
  const store = new Map();
  const ops = { get: 0, put: 0, list: 0 };
  return {
    ops,
    async get(key, type) {
      ops.get++;
      const value = store.get(key);
      return value === undefined ? null : type === 'json' ? JSON.parse(value) : value;
    },
    async put(key, value) {
      ops.put++;
      store.set(key, value);
    },
    async list() {
      ops.list++;
      return { keys: [], list_complete: true };
    },
  };
}

test('feedback uses one key: saving is one get and one put, reading is one get, no lists', async () => {
  const kv = fakeKV();
  const env = { LIBRARY: kv };
  await saveFeedback(env, { message: 'first', createdAt: '2026-11-23T00:00:00Z' });
  await saveFeedback(env, { message: 'second', createdAt: '2026-11-23T00:01:00Z' });
  assert.equal(kv.ops.list, 0);
  assert.equal(kv.ops.put, 2);
  const records = await listFeedback(env);
  assert.deepEqual(records.map((r) => r.message), ['second', 'first']);
  assert.equal(kv.ops.list, 0);
});

test('with no KV binding, feedback reads as empty', async () => {
  assert.deepEqual(await listFeedback({}), []);
});
