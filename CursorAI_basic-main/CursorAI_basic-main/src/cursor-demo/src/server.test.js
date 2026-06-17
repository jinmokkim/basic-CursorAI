import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from './server.js';

/**
 * 사용 가능한 포트를 찾아 서버를 시작한다.
 * @returns {Promise<{ server: import('http').Server, baseUrl: string }>}
 */
function startTestServer() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('서버 주소를 확인할 수 없습니다.'));
        return;
      }
      resolve({ server, baseUrl: `http://127.0.0.1:${address.port}` });
    });
  });
}

/**
 * 로그인 API에 POST 요청을 보낸다.
 * @param {string} baseUrl
 * @param {Record<string, string>} body
 * @returns {Promise<{ status: number, body: Record<string, unknown> }>}
 */
async function postLogin(baseUrl, body) {
  const response = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}

test('POST /api/login returns token for valid credentials', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const { status, body } = await postLogin(baseUrl, {
    email: 'alice@example.com',
    password: 'password123',
  });

  assert.equal(status, 200);
  assert.equal(typeof body.token, 'string');
});

test('POST /api/login returns 401 for invalid credentials', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const { status, body } = await postLogin(baseUrl, {
    email: 'alice@example.com',
    password: 'wrong-password',
  });

  assert.equal(status, 401);
  assert.equal(body.error, '이메일 또는 비밀번호가 올바르지 않습니다.');
});

test('POST /api/login returns 400 for invalid JSON body fields', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const { status, body } = await postLogin(baseUrl, {
    email: 'invalid-email',
    password: 'password123',
  });

  assert.equal(status, 400);
  assert.equal(body.error, '유효하지 않은 이메일 형식입니다.');
});

test('unknown route returns 404', async (t) => {
  const { server, baseUrl } = await startTestServer();
  t.after(() => server.close());

  const response = await fetch(`${baseUrl}/api/unknown`);
  assert.equal(response.status, 404);
});
