/**
 * Copyright (c) 2019 Kazuhiro Miyata
 * This document is released under the MIT license.
 */


/**
 * Function fetchFile
 *
 * File オブジェクトとファイル名を受け取りサーバにリクエストします。
 * JSON レスポンスをオブジェクトで返します。
 */

export default function (file, query) {
  return fetch(`/file?${query}`, {
    method: 'POST',
      body: file,
      headers: {
        'Content-Type': 'application/octet-stream'
      }
  })
    .then(res => {
      return res.json();
    });
};
