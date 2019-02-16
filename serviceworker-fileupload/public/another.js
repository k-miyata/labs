/**
 * Copyright (c) 2019 Kazuhiro Miyata
 * This document is released under the MIT license.
 */

import registerSW from '/lib/registerSW.js';
import objToDl from '/lib/objToDl.js';


/**
 * Register the Service Worker
 */

async function register() {
  const serviceWorker = await registerSW();

  const p = document.createElement('p');
  p.textContent = 'Service Worker registration successful.';
  const c = document.getElementById('response');
  c.textContent = null;
  c.appendChild(p);

  // アップロード完了通知を Service Worker から受け取ります。
  serviceWorker.addEventListener('message', event => {
    const { command, params } = event.data;
    switch (command) {
      case 'uploaded':
        const c = document.getElementById('response');
        c.textContent = null;
        c.appendChild(objToDl(params));
        break;
      default:
        throw new RangeError('command not found');
    }
  });
}


/**
 * Add event listeners
 */

window.addEventListener('load', register);
