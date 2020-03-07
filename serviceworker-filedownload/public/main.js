'use strict';

class Status {
  constructor(elementId) {
    this.el = document.createElement('pre');
    this.show('—');
    document.getElementById(elementId).appendChild(this.el);
  }

  show(message) {
    this.el.textContent = `Status: ${message}`;
    return this;
  }

  remove() {
    setTimeout(() => this.el.remove(), 2000);
  }
}

async function clickAllLinks() {
  const status = new Status('link-status');
  status.show('preparing...');

  const aEls = document.getElementsByClassName('link');
  await Promise.all(
    Array.from(aEls).map(
      (el, i) => (
        new Promise(function (resolve) {
          setTimeout(function () {
            status.show(`preparing... (${i + 1}/${aEls.length})`);
            el.click();
            resolve();
          }, i * 250)
        })
      )
    )
  );

  status.show('completed').remove();
}

function downloadWithAjax(size) {
  const status = new Status('ajax-status');
  status.show('preparing...');

  const xhr = new XMLHttpRequest();
  xhr.open('GET', `/file?size=${size}`, true);
  xhr.responseType = 'blob';

  xhr.onprogress = function ({ lengthComputable, loaded, total }) {
    if (lengthComputable) {
      status.show(`downloading... (${Math.floor(loaded / total * 100)}%)`);
    } else {
      const unit = loaded === 1 ? 'byte' : 'bytes';
      status.show(`downloading... (${loaded} ${unit} received)`);
    }
  }

  xhr.onload = function () {
    const aEl = document.createElement('a');
    const url = URL.createObjectURL(xhr.response);
    aEl.href = url;
    const r = xhr
      .getResponseHeader('content-disposition')
      .match(/filename=\"(.+)\"/);
    aEl.download = r ? r[1] : '';
    aEl.click();
    URL.revokeObjectURL(url);
    status.show('completed').remove();
  }

  xhr.onerror = function () {
    const msg =
      String.fromCharCode.apply(null, new Uint8Array(xhr.response)) ||
      xhr.statusText ||
      'network error';
    status.show(msg);
  }

  xhr.send();
  status.show('downloading...');
}

function downloadWithServiceWorker(size) {
  const iframeEl = document.createElement('iframe');
  iframeEl.src = `/file?size=${size}&sw=1`;
  iframeEl.addEventListener('load', function () {
    iframeEl.remove();
  });
  iframeEl.style = 'display: none;';
  document.body.appendChild(iframeEl);
}

function handleLinkAllClick() {
  clickAllLinks();
}

function handleAjaxClick(event) {
  downloadWithAjax(event.currentTarget.dataset.size);
}

function handleAjaxAllClick() {
  const ajaxEls = document.getElementsByClassName('ajax');
  for (const el of ajaxEls) {
    downloadWithAjax(el.dataset.size);
  }
}

function handleSwClick(event) {
  downloadWithServiceWorker(event.currentTarget.dataset.size);
}

function handleSwAllClick() {
  const swEls = document.getElementsByClassName('sw');
  for (const el of swEls) {
    downloadWithServiceWorker(el.dataset.size);
  }
}

function addEventListeners() {
  const linkAllEl = document.getElementById('link-all');
  linkAllEl.addEventListener('click', handleLinkAllClick);

  const ajaxEls = document.getElementsByClassName('ajax');
  for (const el of ajaxEls) {
    el.addEventListener('click', handleAjaxClick);
  }

  const ajaxAllEl = document.getElementById('ajax-all');
  ajaxAllEl.addEventListener('click', handleAjaxAllClick);

  const swEls = document.getElementsByClassName('sw');
  for (const el of swEls) {
    el.addEventListener('click', handleSwClick);
  }

  const swAllEl = document.getElementById('sw-all');
  swAllEl.addEventListener('click', handleSwAllClick);
}

const eventStatuses = new Map();

function handleMessageFromServiceWorker(event) {
  const { id, computable, loaded, total } = event.data;

  const status = eventStatuses.get(id) || new Status('sw-status');

  if (computable) {
    status.show(`downloading... (${Math.floor(loaded / total * 100)}%)`);
  } else if (!loaded) {
    status.show('downloading...');
  } else {
    const unit = loaded === 1 ? 'byte' : 'bytes';
    status.show(`downloading... (${loaded} ${unit} received)`);
  }

  if (loaded === total) {
    status.show('completed').remove();
    eventStatuses.delete(id);
  } else {
    eventStatuses.set(id, status);
  }
}

async function registerServiceWorker() {
  await navigator.serviceWorker.register('/sw.js');

  if (!navigator.serviceWorker.controller) {
    await new Promise(function (resolve) {
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        resolve();
      });
    });
  }

  navigator.serviceWorker.addEventListener(
    'message',
    handleMessageFromServiceWorker
  );

  console.log('Service Worker ready');
}

function main() {
  if (document.readyState !== 'loading') {
    addEventListeners();
  } else {
    document.addEventListener('DOMContentLoaded', addEventListeners);
  }

  window.addEventListener('load', registerServiceWorker);
}

main();
