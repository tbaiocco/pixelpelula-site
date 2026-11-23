import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from '../server.mjs';

let tempRoot;
let server;
let baseUrl;

before(async () => {
  tempRoot = await mkdtemp(join(tmpdir(), 'pixelpelula-server-'));
  const siteRoot = join(tempRoot, 'dist');
  await mkdir(join(siteRoot, 'pt'), { recursive: true });
  await mkdir(join(siteRoot, 'en'), { recursive: true });
  await mkdir(join(siteRoot, 'es'), { recursive: true });
  await mkdir(join(siteRoot, 'assets'), { recursive: true });
  await writeFile(join(siteRoot, 'index.html'), 'root page');
  await writeFile(join(siteRoot, 'pt', 'index.html'), 'pt page');
  await writeFile(join(siteRoot, 'en', 'index.html'), 'en page');
  await writeFile(join(siteRoot, 'es', 'index.html'), 'es page');
  await writeFile(join(siteRoot, 'assets', 'favicon.svg'), '<svg></svg>');
  await writeFile(join(tempRoot, 'secret.txt'), 'outside dist');

  server = createServer(siteRoot);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  if (tempRoot) await rm(tempRoot, { recursive: true, force: true });
});

test('serves root and language index pages', async () => {
  for (const [route, content] of [['/', 'root page'], ['/pt/', 'pt page'], ['/en/', 'en page'], ['/es/', 'es page']]) {
    const response = await fetch(new URL(route, baseUrl));
    assert.equal(response.status, 200);
    assert.equal(await response.text(), content);
  }
});

test('serves static assets with their MIME type', async () => {
  const response = await fetch(new URL('/assets/favicon.svg', baseUrl));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /image\/svg\+xml/);
});

test('rejects paths that escape the static root', async () => {
  const response = await fetch(new URL('/%2e%2e%2fsecret.txt', baseUrl));
  assert.equal(response.status, 403);
  assert.notEqual(await response.text(), 'outside dist');
});