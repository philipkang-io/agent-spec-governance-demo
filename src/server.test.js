const { test } = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('./server.js');

// Start the server on an ephemeral port for the test suite.
let server;
let baseUrl;

function setup() {
  return new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
}

function teardown() {
  return new Promise((resolve) => server.close(resolve));
}

async function req(method, path, opts = {}) {
  const { body, token } = opts;
  const headers = { 'Content-Type': 'application/json' };
  if (token !== undefined) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  return { status: res.status, body: json };
}

test('app module loads', () => {
  assert.ok(app, 'express app should be exported');
});

test('GET /contacts — 401 without bearer token', async () => {
  await setup();
  try {
    const { status, body } = await req('GET', '/contacts');
    assert.strictEqual(status, 401);
    assert.ok(typeof body.code === 'number', 'error body should have numeric code');
    assert.ok(typeof body.message === 'string', 'error body should have message string');
  } finally {
    await teardown();
  }
});

test('POST /contacts — 401 without bearer token', async () => {
  await setup();
  try {
    const { status } = await req('POST', '/contacts', {
      body: { name: 'Ada', email: 'ada@example.com' },
    });
    assert.strictEqual(status, 401);
  } finally {
    await teardown();
  }
});

test('POST /contacts — creates contact with spec-compliant fields', async () => {
  await setup();
  try {
    const { status, body } = await req('POST', '/contacts', {
      token: 'test-token',
      body: { name: 'Ada Lovelace', email: 'ada@example.com', phone: '+1-555-0100' },
    });
    assert.strictEqual(status, 201);
    assert.ok(body.id, 'response should include id');
    assert.strictEqual(body.name, 'Ada Lovelace');
    assert.strictEqual(body.email, 'ada@example.com');
    assert.strictEqual(body.phone, '+1-555-0100');
    // Spec does not include customerId — ensure it is absent.
    assert.ok(!('customerId' in body), 'response must not contain customerId');
    assert.ok(!('customer_id' in body), 'response must not contain customer_id');
    assert.ok(!('phoneNumber' in body), 'response must not contain phoneNumber');
    assert.ok(!('emailAddress' in body), 'response must not contain emailAddress');
  } finally {
    await teardown();
  }
});

test('GET /contacts — returns array of contacts', async () => {
  await setup();
  try {
    // Create one first.
    await req('POST', '/contacts', {
      token: 'test-token',
      body: { name: 'Grace Hopper', email: 'grace@example.com' },
    });
    const { status, body } = await req('GET', '/contacts', { token: 'test-token' });
    assert.strictEqual(status, 200);
    assert.ok(Array.isArray(body), 'response should be an array');
    assert.ok(body.length >= 1);
  } finally {
    await teardown();
  }
});

test('GET /contacts/:id — 404 returns Error schema', async () => {
  await setup();
  try {
    const { status, body } = await req('GET', '/contacts/does-not-exist', { token: 'test-token' });
    assert.strictEqual(status, 404);
    assert.ok(typeof body.code === 'number', 'error body should have numeric code');
    assert.ok(typeof body.message === 'string', 'error body should have message string');
  } finally {
    await teardown();
  }
});

test('GET /contacts/:id — returns contact by id', async () => {
  await setup();
  try {
    const { body: created } = await req('POST', '/contacts', {
      token: 'test-token',
      body: { name: 'Alan Turing', email: 'alan@example.com' },
    });
    const { status, body } = await req('GET', `/contacts/${created.id}`, { token: 'test-token' });
    assert.strictEqual(status, 200);
    assert.strictEqual(body.id, created.id);
    assert.strictEqual(body.name, 'Alan Turing');
    assert.strictEqual(body.email, 'alan@example.com');
  } finally {
    await teardown();
  }
});
