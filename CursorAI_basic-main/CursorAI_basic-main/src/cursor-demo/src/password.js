import { scryptSync, randomBytes, timingSafeEqual } from 'crypto';

const SCRYPT_OPTIONS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
};

const HASH_LENGTH = 64;

/**
 * 비밀번호를 scrypt로 해시한다.
 * @param {string} password - 평문 비밀번호
 * @returns {string} salt:hash 형식의 저장값
 */
export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, HASH_LENGTH, SCRYPT_OPTIONS);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * 평문 비밀번호가 저장된 해시와 일치하는지 검증한다.
 * @param {string} password - 평문 비밀번호
 * @param {string} stored - salt:hash 형식의 저장값
 * @returns {boolean} 일치하면 true
 */
export function verifyPassword(password, stored) {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(password, salt, HASH_LENGTH, SCRYPT_OPTIONS);

  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
