const { test } = require('node:test');
const assert = require('node:assert');
const app = require('./server.js');

test('app module loads', () => {
  assert.ok(app, 'express app should be exported');
});
