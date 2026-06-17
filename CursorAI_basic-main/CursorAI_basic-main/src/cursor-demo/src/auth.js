import { createHmac, randomBytes } from 'crypto';
import { isValidEmail } from './validator.js';
import { verifyPassword } from './password.js';
import { findUserByEmail } from './users.js';

/**
 * 토큰 서명에 사용할 시크릿을 반환한다.
 * @returns {string}
 */
function getAuthSecret() {
  return process.env.AUTH_SECRET ?? 'dev-only-change-in-production';
}

/**
 * 로그인 성공 시 사용할 액세스 토큰을 생성한다.
 * @param {string} email - 인증된 사용자 이메일
 * @returns {string} base64url.payload.signature 형식 토큰
 */
export function createAccessToken(email) {
  const payload = `${email}:${Date.now()}:${randomBytes(16).toString('hex')}`;
  const signature = createHmac('sha256', getAuthSecret())
    .update(payload)
    .digest('hex');
  return `${Buffer.from(payload).toString('base64url')}.${signature}`;
}

/**
 * 이메일과 비밀번호로 로그인을 시도한다.
 * @param {string} email - 사용자 이메일
 * @param {string} password - 평문 비밀번호
 * @returns {{ ok: true, status: 200, token: string } | { ok: false, status: number, error: string }}
 */
export function login(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { ok: false, status: 400, error: '이메일과 비밀번호는 필수입니다.' };
  }

  if (!email || !password) {
    return { ok: false, status: 400, error: '이메일과 비밀번호는 필수입니다.' };
  }

  if (!isValidEmail(email)) {
    return { ok: false, status: 400, error: '유효하지 않은 이메일 형식입니다.' };
  }

  const user = findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, status: 401, error: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  return { ok: true, status: 200, token: createAccessToken(user.email) };
}
