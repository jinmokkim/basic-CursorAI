import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractEmails,
  isValidEmail,
  getValidEmails,
  uniqueValidEmails,
} from './email.js';

const users = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'invalid-email' },
  { name: 'Carol', email: 'carol@test.org' },
];

test('extractEmails returns all emails from users', () => {
  assert.deepEqual(extractEmails(users), [
    'alice@example.com',
    'invalid-email',
    'carol@test.org',
  ]);
});

test('isValidEmail validates email format', () => {
  assert.equal(isValidEmail('alice@example.com'), true);
  assert.equal(isValidEmail('user+tag@example.com'), true);
  assert.equal(isValidEmail('invalid-email'), false);
  assert.equal(isValidEmail(''), false);
  assert.equal(isValidEmail(null), false);
});

test('isValidEmail enforces RFC 3696 length limits', () => {
  const longLocalPart = `${'a'.repeat(64)}@example.com`;
  const tooLongLocalPart = `${'a'.repeat(65)}@example.com`;
  const tooLongAddress = `${'a'.repeat(243)}@example.com`;

  assert.equal(isValidEmail(longLocalPart), true);
  assert.equal(isValidEmail(tooLongLocalPart), false);
  assert.equal(isValidEmail(tooLongAddress), false);
});

test('extractEmails returns empty array for non-array input', () => {
  assert.deepEqual(extractEmails(null), []);
  assert.deepEqual(extractEmails(undefined), []);
});

test('getValidEmails returns only valid emails', () => {
  assert.deepEqual(getValidEmails(users), [
    'alice@example.com',
    'carol@test.org',
  ]);
});

test('uniqueValidEmails removes duplicate valid emails', () => {
  const duplicateUsers = [
    { email: 'alice@example.com' },
    { email: 'alice@example.com' },
    { email: 'carol@test.org' },
    { email: 'invalid-email' },
  ];

  assert.deepEqual(uniqueValidEmails(duplicateUsers), [
    'alice@example.com',
    'carol@test.org',
  ]);
});
