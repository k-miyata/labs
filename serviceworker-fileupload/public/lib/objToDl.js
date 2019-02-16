/**
 * Copyright (c) 2019 Kazuhiro Miyata
 * This document is released under the MIT license.
 */


/**
 * Function objToDl
 *
 * オブジェクトから定義リストを生成します。
 */

function objToDl(obj) {
  const dl = document.createElement('dl');
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = obj[k];
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    if (v instanceof Object && !(v instanceof Array)) {
      dd.appendChild(objToDl(v, dd));
    } else if (v === null) {
      const i = document.createElement('i');
      i.textContent = 'null';
      dd.appendChild(i);
    } else {
      dd.textContent = v;
    }
    dl.appendChild(dt);
    dl.appendChild(dd);
  }
  return dl;
}

export default objToDl;
