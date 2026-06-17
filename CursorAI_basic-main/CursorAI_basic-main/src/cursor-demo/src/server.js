import http from 'http';
import { login } from './auth.js';

const MAX_BODY_BYTES = 1024;

/**
 * HTTP 요청 본문을 JSON으로 파싱한다.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Record<string, unknown>>}
 */
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';

    req.on('data', (chunk) => {
      data += chunk;
      if (Buffer.byteLength(data) > MAX_BODY_BYTES) {
        reject(new Error('BODY_TOO_LARGE'));
        req.destroy();
      }
    });

    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', reject);
  });
}

/**
 * JSON 응답을 전송한다.
 * @param {import('http').ServerResponse} res
 * @param {number} status
 * @param {Record<string, unknown>} body
 */
function sendJson(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

/**
 * 로그인 API HTTP 서버를 생성한다.
 * @returns {import('http').Server}
 */
export function createServer() {
  return http.createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    if (req.method === 'POST' && url.pathname === '/api/login') {
      try {
        const body = await readJsonBody(req);
        const email = typeof body.email === 'string' ? body.email : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const result = login(email, password);

        if (result.ok) {
          sendJson(res, 200, { token: result.token });
        } else {
          sendJson(res, result.status, { error: result.error });
        }
      } catch (error) {
        if (error instanceof Error && error.message === 'BODY_TOO_LARGE') {
          sendJson(res, 413, { error: '요청 본문이 너무 큽니다.' });
          return;
        }
        if (error instanceof Error && error.message === 'INVALID_JSON') {
          sendJson(res, 400, { error: '잘못된 JSON 형식입니다.' });
          return;
        }
        sendJson(res, 500, { error: '서버 내부 오류가 발생했습니다.' });
      }
      return;
    }

    sendJson(res, 404, { error: '찾을 수 없는 경로입니다.' });
  });
}

/**
 * HTTP 서버를 시작한다.
 * @param {number} [port=3000] - 수신 포트
 * @returns {import('http').Server}
 */
export function startServer(port = 3000) {
  const server = createServer();
  server.listen(port);
  return server;
}
