const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('./server.js');

test('app module loads', () => {
  assert.ok(app, 'express app should be exported');
});

test('GET /version returns { version: "1.0.0" }', (t, done) => {
  const server = http.createServer(app).listen(0, () => {
    const { port } = server.address();
    http.get(`http://localhost:${port}/version`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        assert.strictEqual(res.statusCode, 200);
        assert.deepStrictEqual(JSON.parse(data), { version: '1.0.0' });
        server.close(done);
      });
    });
  });
});
