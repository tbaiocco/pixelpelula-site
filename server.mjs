import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const DIST = join(ROOT, 'dist');
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const isInside = (root, path) => {
  const pathFromRoot = relative(root, path);
  return pathFromRoot === '' || (!pathFromRoot.startsWith(`..${sep}`) && pathFromRoot !== '..');
};

export function createServer(root = DIST) {
  const absoluteRoot = resolve(root);

  return createHttpServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }

    let requestPath;
    try {
      requestPath = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch {
      response.writeHead(400).end('Bad request');
      return;
    }

    const requestedFile = resolve(absoluteRoot, `.${requestPath}`);
    if (!isInside(absoluteRoot, requestedFile)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    try {
      const realRoot = await realpath(absoluteRoot);
      let filePath = await realpath(requestedFile);
      if (!isInside(realRoot, filePath)) {
        response.writeHead(403).end('Forbidden');
        return;
      }

      let fileInfo = await stat(filePath);
      if (fileInfo.isDirectory()) {
        filePath = await realpath(join(filePath, 'index.html'));
        if (!isInside(realRoot, filePath)) {
          response.writeHead(403).end('Forbidden');
          return;
        }
        fileInfo = await stat(filePath);
      }
      if (!fileInfo.isFile()) {
        response.writeHead(404).end('Not found');
        return;
      }

      response.writeHead(200, {
        'Content-Length': fileInfo.size,
        'Content-Type': MIME_TYPES[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff'
      });
      if (request.method === 'HEAD') {
        response.end();
        return;
      }

      createReadStream(filePath).on('error', () => response.destroy()).pipe(response);
    } catch (error) {
      const status = error.code === 'ENOENT' || error.code === 'ENOTDIR' ? 404 : 500;
      response.writeHead(status).end(status === 404 ? 'Not found' : 'Internal server error');
    }
  });
}

async function start() {
  try {
    const distInfo = await stat(DIST);
    if (!distInfo.isDirectory()) throw new Error('dist/ is not a directory; run npm run build first.');

    const port = process.env.PORT === undefined ? 3000 : Number(process.env.PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error(`Invalid PORT: ${process.env.PORT}`);
    }

    createServer().listen(port, '0.0.0.0', () => {
      console.log(`Serving dist/ on 0.0.0.0:${port}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await start();
}