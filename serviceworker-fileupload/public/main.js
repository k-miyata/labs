/**
 * Copyright (c) 2019 Kazuhiro Miyata
 * This document is released under the MIT license.
 */

import registerSW from '/lib/registerSW.js';
import fetchFile from '/lib/fetchFile.js';
import objToDl from '/lib/objToDl.js';


/**
 * Register the Service Worker
 */

async function register() {
  await registerSW();

  const p = document.createElement('p');
  p.textContent = 'Service Worker registration successful.';
  const c = document.getElementById('response');
  c.textContent = null;
  c.appendChild(p);
  document.getElementById('upload-sw').removeAttribute('disabled');
}


/**
 * Check notification permission
 */

function checkNotificationPermission() {
  const status = document.getElementById('status');
  status.textContent = null;

  if (Notification.permission === 'denied') {
    const p = document.createElement('p');
    p.textContent = 'Notifications are denied by this browser.';
    status.appendChild(p);
  }

  const c = document.getElementById('notify');
  c.removeAttribute('disabled');
}


/**
 * Upload a file
 */

async function upload(_, withSW = false) {
  const file = document.getElementById('file').files[0];
  const query = new URLSearchParams({ name: file.name }).toString();

  let data;

  if (withSW) {
    // Service Worker を使ってアップロードします。
    data = await new Promise(resolve => {
      const ch = new MessageChannel();
      ch.port1.addEventListener('message', event => resolve(event.data));
      ch.port1.start();
      navigator.serviceWorker.controller.postMessage({
        command: 'upload',
        params: {
          file,
          query,
          isNotificationGranted: document.getElementById('notify').checked
        }
      }, [ch.port2]);
    });
  } else {
    // Service Worker を使わずにアップロードします。
    data = await fetchFile(file, query);
  }

  const c = document.getElementById('response');
  c.textContent = null;
  c.appendChild(objToDl(data));
}


/**
 * Toggle notification setting
 */

function toggleNotification() {
  // この時点でクリックによるチェックボックス切り替えが発生するため、
  // 反転させてクリック前の状態に戻します。
  this.checked = !this.checked;

  if (this.checked) {
    this.checked = false;
    return;
  }

  const status = document.getElementById('status');
  status.textContent = null;
  const p = document.createElement('p');

  if (Notification.permission === 'denied') {
    p.textContent = 'Notifications are denied by this browser.';
    status.appendChild(p);
  } else if (Notification.permission === 'granted') {
    this.checked = true;
    p.textContent = 'Notifications are ready.';
  } else {
    this.checked = true;
    this.disabled = true;
    Notification.requestPermission(permission => {
      if (permission === 'denied') {
        this.checked = false;
        p.textContent = 'Notifications are denied by this browser.';
        status.appendChild(p);
      } else {
        p.textContent = 'Notifications are ready.';
        status.appendChild(p);
        new Notification('This is a nofitication from the app', {
          body: 'Notify you when file upload with Service Worker is complete'
        });
      }
      this.disabled = false;
    });
  }
}


/**
 * Add event listeners
 */

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('upload').addEventListener('click', upload);
  document.getElementById('upload-sw').addEventListener('click', event => {
    upload(event, true);
  });
  document.getElementById('notify').addEventListener('click', toggleNotification);
});

window.addEventListener('load', register);
window.addEventListener('load', checkNotificationPermission);
