'use strict';

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());
});

async function postProgress(id, loaded, total) {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ id, computable: total > 0, loaded, total });
  });
}

async function fetchAndProgress(request) {
  const id = Date.now() + Math.random();
  postProgress(id, 0, -1);

  const { body, status, statusText, headers } = await fetch(request);
  const reader = body.getReader();
  const contentLength = parseInt(headers.get('content-length') || '-1', 10);
  let readLength = 0;

  const stream = new ReadableStream({
    start: async function (controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        controller.enqueue(value);

        readLength += value.length;
        postProgress(id, readLength, contentLength);
      }

      controller.close();
    }
  });

  return new Response(stream, { status, statusText, headers });
}

self.addEventListener('fetch', function (event) {
  const { pathname, searchParams } = new URL(event.request.url);
  if (pathname.endsWith('/file') && searchParams.get('sw') === '1') {
    event.respondWith(fetchAndProgress(event.request));
  }
});
