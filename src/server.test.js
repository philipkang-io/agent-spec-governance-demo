const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('./server.js');

test('app module loads', () => {
  assert.ok(app, 'express app should be exported');
});

test('GET /version returns { version: "1.0.0" }', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();

  const body = await new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/version`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    }).on('error', reject);
  });

  assert.strictEqual(body.status, 200);
  assert.deepStrictEqual(body.body, { version: '1.0.0' });

  await new Promise((resolve) => server.close(resolve));
});
