# ffmpeg-wasm-playground

A playground of [ffmpeg.wasm](https://github.com/ffmpegwasm/ffmpeg.wasm).

## Usage with Docker

First, install the dependencies:

```sh
docker compose run --rm node npm install
```

Then, start the HTTP server:

```sh
docker compose run --rm --service-ports node npm start
```

Finally, access http://localhost:8080/ from your browser supporting WebAssembly.

If you want to change the port number, set the environment variable `PORT` in
your own `.env` file, for example:

```sh
PORT=3000 # You can now access http://localhost:3000/.
```

## License

See [LICENSE](../LICENSE).
