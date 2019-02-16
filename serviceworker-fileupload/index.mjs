/**
 * Copyright (c) 2019 Kazuhiro Miyata
 * This document is released under the MIT license.
 */

// Node modules
import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import fs from 'fs';

// Application libraries
import ResponseJSON from './lib/ResponseJSON';


/**
 * Initialize
 */

dotenv.config();
const UP_ROOT = '/tmp/uploads';

const app = express();
app.use(bodyParser.raw({
  type: 'application/octet-stream',
  limit: '10gb'
}));
app.use(morgan('dev'));


/**
 * Routes
 */

// GET /{a static file in /public}
app.use(express.static('public'));

// POST /file?name={file name}
app.post('/file', (req, res) => {
  const buf = req.body;
  const { name } = req.query;

  // Prepare the upload directory.
  const dir = `${UP_ROOT}/${new Date().toISOString()}`;
  fs.mkdir(dir, { recursive: true }, err => {
    if (err) {
      console.error(err);
      res.status(500).json(new ResponseJSON(null, err.message));
    }

    // Write a uploaded file in the directory.
    const path = `${dir}/${name}`;
    fs.writeFile(path, buf, err => {
      if (err) {
        console.error(err);
        res.status(500).json(new ResponseJSON(null, err.message));
      }

      // Return file information of the file.
      const { size, mtime } = fs.statSync(path);
      res.status(201).json(new ResponseJSON({ name, size, mtime }));
    });
  });
});


/**
 * Start the server
 */

const server = app.listen(process.env.PORT, () => {
  const { address, port } = server.address();
  console.log('Listening at http://%s:%s', address, port);
});
