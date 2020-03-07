# File Download with Service Workers

Requesting and handling file downloads.

Service Worker を使って、ファイルのダウンロードのリクエストとハンドリングを行います。

## Three ways to download files

ブラウザにファイルをダウンロードするように伝えるには、2020 年 3 月時点では `<a>` 要素や `location.href =` などによってリクエストを行うしかありません。JavaScript を使ってユーザのローカルのストレージにファイルを書き込んだりする API は存在しません。

これを踏まえ、ここではファイルをダウンロードするための 3 つの方法を実装しました。

### The `<a>` element and the `download` attribute

ハイパーリンクによるダウンロードリクエストを行います。

サーバからのレスポンスヘッダに `content-dispotision: attachment` を含めることで、ファイルをダウンロードするようにブラウザに伝えることができます。

さらに `<a>` 要素に `download` 属性を付けることで、フレームの読み込みを行わずにファイルのダウンロードとしてリクエストを行うことができます。

### Ajax (`XMLHttpRequest` + Blob)

`XMLHttpRequest` を使って非同期でダウンロードします。ダウンロードしたものはメモリ（RAM）に保存され、Blob URL を生成して `<a>` 要素を介することでユーザのローカルのストレージにダウンロード（メモリからコピー）します。

ハイパーリンクによる方法と異なり、`load` イベントや `progress` イベントなどで任意の処理を実行することができます。

一方で、ダウンロードしたものがメモリに保存されるという性質上、サイズの大きいファイルをダウンロードすることはできません。端末の性能やブラウザの制限によりますが、今回の場合 1 GB までのファイルはダウンロードできるものの、4 GB のファイルはダウンロードできません。

### The Service Worker (Fetch + Streams)

Service Worker を使ってダウンロードします。Service Worker の `fetch` イベントでブラウザの既定の動作の代わりにファイルをダウンロードするための処理を実装します。Streams API を利用することで、ハイパーリンクによる方法では不可能だったダウンロードの進捗表示などの処理が可能になっています。

`<a>` 要素や `location.href =` によるリクエストであれば、メモリではなくユーザのローカルのストレージに直接ダウンロードされるため、大きいサイズのファイルもダウンロードすることができます。

なお、`download` 属性を付けると `fetch` イベントが発火しないというバグがあるため、通常のリクエストを行います。ただし、サーバからのレスポンスが返ってくる前に連続してリクエストを行うと前のリクエストが取り消されてしまうため、動的に `<iframe>` 要素を生成するようにしています。

### Comparison

| Way                                            | Downloading large files | Handing downloads |
|:-----------------------------------------------|:-----------------------:|:-----------------:|
| The `<a>` element and the `download` attribute |            ✔            |         ✘         |
| Ajax (`XMLHttpRequest` + Blob)                 |            ✘            |         ✔         |
| The Service Worker (Fetch + Streams)           |            ✔            |         ✔         |

## Usage

Go 言語をインストールした環境で `server.go` をコンパイル・実行してください。Web サーバが起動します。

```sh
go run server.go
```

サーバが起動したら、Web ブラウザで http://localhost:8080 にアクセスしてください。

## License

See [LICENSE](../LICENSE).
