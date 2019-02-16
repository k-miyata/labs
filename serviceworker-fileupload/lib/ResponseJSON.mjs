/**
 * Copyright (c) 2019 Kazuhiro Miyata
 * This document is released under the MIT license.
 */


/**
 * Class ResponseJSON
 *
 * 一貫性のある構成のレスポンスを生成します。
 */

export default class {
  constructor(data = null, errorMessage = null) {
    if (errorMessage) {
      this.status = 'error';
    } else {
      this.status = 'ok';
    }
    this.data = data;
    this.error = {
      message: errorMessage
    };
  }
};
