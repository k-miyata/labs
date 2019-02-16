/**
 * Copyright (c) 2019 Kazuhiro Miyata
 * This document is released under the MIT license.
 */


/**
 * Function registerSW
 *
 * Service Worker を登録します。
 */

export default function () {
  return navigator.serviceWorker.register('/sw.js')
    .then(() => {
      // 既にコントロールされた状態なら処理を完了します。
      if (navigator.serviceWorker.controller) {
        return navigator.serviceWorker;
      }

      // 初回登録時はまだコントロールされていないため、
      // コントロールされた状態になるまで待ちます。
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          resolve(navigator.serviceWorker);
        });
      });
    });
};
