# Multiple File Download with the File System Access API

Download each of files and write directly to the user's local device. No zip
compression.

![Demo](demo.gif)

## Motivation

クラウドストレージなど、Webブラウザから複数のファイルをまとめてダウンロードしたり、フォルダごとダウンロードしたりするには、サーバ上でzipファイルを作成し、単一のファイルにする必要があります。ダウンロード前にzipファイルを作成し、ダウンロード後にそのzipファイルを展開するため、その分だけ時間とリソースが必要になります。

ファイルごとに個別にダウンロードできれば、zipファイルを作成する必要はなくなります。これまでも、XMLHttpRequestやFetch APIを利用して、バックグラウンドで複数のファイルをダウンロードすることはできましたが、Blobにする必要があるため、メモリに収まらないような大きなサイズのファイルを扱うことができませんでした。また、ダウンロードするたびにプロンプトが表示されるため、煩わしさもあります。

ここで[File System Access API](https://web.dev/file-system-access/)の出番です。このAPIを使うと、ユーザのローカルデバイスに直接ファイルを書き込んだりフォルダを作成したりできます。これを利用すると、Blobを作成してメモリにためることなく、ストレージにストリームでダウンロードしたデータを流し込むことができます。データを書き込む前にユーザの許可は必要ですが、一度許可すれば、ファイルごとにダウンロードプロンプトが表示されたりすることはありません。

このデモでは、主にFetch API、File System Access API、Streams APIを利用して、複数ファイルのダウンロードを実現しています。

## ToDo

- [ ] Aborting downloads
- [ ] Handling errors

## Supported Browsers

The File System Access API currently works only in Chromium-based browsers.
Please see the [support table](https://caniuse.com/native-filesystem-api) for
more details.

| IE  | Edge | Firefox | Chrome | Safari |
| :-: | :--: | :-----: | :----: | :----: |
| No  | 86+  |   No    |  86+   |   No   |

## Running on Your Device

[Go](https://golang.org/) is required. Compile and run the server:

```sh
go run server.go
```

and access http://localhost:8080/ with Chrome.

## License

See [LICENSE](../LICENSE).
