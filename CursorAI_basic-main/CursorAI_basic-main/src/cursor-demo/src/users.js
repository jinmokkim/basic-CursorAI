import { hashPassword } from './password.js';

/** @type {Map<string, { email: string, passwordHash: string, name: string }>} */
const users = new Map();

/**
 * 데모용 사용자 계정을 초기화한다.
 */
function initDemoUsers() {
  if (users.size > 0) return;

  users.set('alice@example.com', {
    email: 'alice@example.com',
    passwordHash: hashPassword('password123'),
    name: 'Alice',
  });
}

/**
 * 이메일로 사용자를 조회한다.
 * @param {string} email - 조회할 이메일
 * @returns {{ email: string, passwordHash: string, name: string } | undefined}
 */
export function findUserByEmail(email) {
  initDemoUsers();
  return users.get(email.toLowerCase());
}
