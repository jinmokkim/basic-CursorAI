import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword } from './password.js';
import { login } from './auth.js';

test('hashPassword and verifyPassword round-trip', () => {
  const stored = hashPassword('password123');
  assert.equal(verifyPassword('password123', stored), true);
  assert.equal(verifyPassword('wrong-password', stored), false);
});

test('login succeeds with valid demo credentials', () => {
  const result = login('alice@example.com', 'password123');
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.match(result.token, /^[A-Za-z0-9_-]+\.[a-f0-9]+$/);
  }
});

test('login rejects invalid email format', () => {
  const result = login('not-an-email', 'password123');
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 400);
  }
});

test('login rejects wrong password', () => {
  const result = login('alice@example.com', 'wrong-password');
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 401);
  }
});

test('login rejects missing credentials', () => {
  const result = login('', '');
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.status, 400);
  }
});
