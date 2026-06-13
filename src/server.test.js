const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('./server.js');

test('app module loads', () => {
  assert.ok(app, 'express app should be exported');
});

test('GET /health returns { status: "ok" }', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const body = await new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(data) }));
    }).on('error', reject);
  });

  assert.strictEqual(body.statusCode, 200);
  assert.deepStrictEqual(body.body, { status: 'ok' });

  await new Promise((resolve, reject) => server.close((err) => err ? reject(err) : resolve()));
});
