import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateFeedback } from '../src/feedback.js';

test('a normal message is accepted and the type defaults to other', () => {
  const result = validateFeedback({ message: 'Please add the Bhaktamar verses.', email: 'reader@example.com' });
  assert.equal(result.ok, true);
  assert.equal(result.value.type, 'other');
  assert.equal(result.value.email, 'reader@example.com');
});

test('an unknown type falls back to other, a known type is kept', () => {
  assert.equal(validateFeedback({ message: 'Typo here', type: 'hack' }).value.type, 'other');
  assert.equal(validateFeedback({ message: 'Typo here', type: 'content' }).value.type, 'content');
});

test('message is required and must have some substance', () => {
  assert.equal(validateFeedback({ message: '' }).errors.message, 'errMessageRequired');
  assert.equal(validateFeedback({ message: 'hi' }).errors.message, 'errMessageShort');
  assert.equal(validateFeedback({ message: 'x'.repeat(2001) }).errors.message, 'errMessageLong');
});

test('email is mandatory and must look like an email', () => {
  assert.equal(validateFeedback({ message: 'Hello there', email: '' }).errors.email, 'errEmailRequired');
  assert.equal(validateFeedback({ message: 'Hello there', email: 'not-an-email' }).errors.email, 'errEmailInvalid');
  assert.equal(validateFeedback({ message: 'Hello there', email: 'a@b.co' }).ok, true);
});

test('name is capped', () => {
  assert.equal(validateFeedback({ message: 'Hello there', name: 'n'.repeat(81) }).errors.name, 'errNameLong');
});
