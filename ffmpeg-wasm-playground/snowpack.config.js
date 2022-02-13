const fs = require("fs");
const path = require("path");

/**
 * The Snowpack configuration. See the documentation for details:
 * https://www.snowpack.dev/reference/configuration.
 *
 * @type {import("snowpack").SnowpackUserConfig}
 */
module.exports = {
  mount: {
    public: "/",
    src: "/",
  },
  plugins: ["@snowpack/plugin-svelte"],
  devOptions: {
    port: parseInt(process.env.PORT || "8080", 10),
  },
  routes: [
    {
      match: "routes",
      src: ".*",
      dest: (req, res) => {
        // Default headers. See https://github.com/withastro/snowpack/blob/c44d86f73ac7b74507d4d5554ccb96e8b7dc5294/snowpack/src/commands/dev.ts#L133-L137.
        res.setHeader("Accept-Ranges", "bytes");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Vary", "Accept-Encoding");

        // Make `index.html` cross-origin isolated to enable `SharedArrayBuffer`
        // used in ffmpeg.wasm.
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

        return fs.createReadStream(path.join("public", "index.html")).pipe(res);
      },
    },
  ],
};
