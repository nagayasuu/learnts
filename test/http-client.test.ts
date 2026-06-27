import assert from 'node:assert/strict';
import test from 'node:test';
import { MockAgent } from 'undici';

import { createHttpClient, HttpError } from '../src/http-client.js';

test('GET returns parsed JSON response data', async () => {
  const mockAgent = new MockAgent();
  mockAgent.disableNetConnect();

  try {
    mockAgent
      .get('https://api.example.test')
      .intercept({ method: 'GET', path: '/users?id=1' })
      .reply(200, { id: 1, name: 'Ada' }, { headers: { 'content-type': 'application/json' } });

    const client = createHttpClient({
      baseUrl: 'https://api.example.test',
      dispatcher: mockAgent,
    });

    const response = await client.get<{ id: number; name: string }>('/users', {
      query: { id: 1 },
    });

    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.data, { id: 1, name: 'Ada' });
  } finally {
    await mockAgent.close();
  }
});

test('POST sends a JSON body', async () => {
  const mockAgent = new MockAgent();
  mockAgent.disableNetConnect();

  try {
    mockAgent
      .get('https://api.example.test')
      .intercept({
        method: 'POST',
        path: '/users',
        body: JSON.stringify({ name: 'Grace' }),
      })
      .reply(201, { id: 2, name: 'Grace' }, { headers: { 'content-type': 'application/json' } });

    const client = createHttpClient({
      baseUrl: 'https://api.example.test',
      dispatcher: mockAgent,
    });

    const response = await client.post<{ id: number; name: string }>('/users', { name: 'Grace' });

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.data, { id: 2, name: 'Grace' });
  } finally {
    await mockAgent.close();
  }
});

test('throws HttpError for unsuccessful responses', async () => {
  const mockAgent = new MockAgent();
  mockAgent.disableNetConnect();

  try {
    mockAgent
      .get('https://api.example.test')
      .intercept({ method: 'GET', path: '/missing' })
      .reply(404, 'not found');

    const client = createHttpClient({
      baseUrl: 'https://api.example.test',
      dispatcher: mockAgent,
    });

    await assert.rejects(
      client.get('/missing'),
      (error) => error instanceof HttpError && error.statusCode === 404 && error.responseBody === 'not found',
    );
  } finally {
    await mockAgent.close();
  }
});
