/**
 * Copyright (c) 2019 Kazuhiro Miyata
 * This document is released under the MIT license.
 */

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', event => {
  event.waitUntil(
    new Promise((resolve, reject) => {
      const { command, params } = event.data;
      switch (command) {
        case 'upload':
          const { file, query, isNotificationGranted } = params;
          fetch(`/file?${query}`, {
            method: 'POST',
              body: file,
              headers: {
                'Content-Type': 'application/octet-stream'
              }
          })
            .then(res => {
              return res.json();
            })
            .then(data => {
              event.ports[0].postMessage(data);
              resolve();

              // クライアントが別ページに移動してもレスポンスを受け取れるように、
              // コントロールしている全クライアントへメッセージを送信します。
              self.clients.matchAll()
                .then(clients => {
                  clients.forEach(c => {
                    c.postMessage({
                      command: 'uploaded',
                      params: data
                    });
                  });
                });

              // 通知が有効な場合は、アップロードが完了したことの通知を実行します。
              // これは、ユーザがこのアプリをバックグラウンドで利用しているときなどに
              // 有効です。
              if (isNotificationGranted) {
                const { name } = data.data;
                self.registration.showNotification('Upload successful', {
                  body: name
                });
              }
            });
          break;
        default:
          reject(new RangeError('command not found'));
      }
    })
  );
});
