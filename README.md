# smapass-web

リユース電子機器の履歴証明アプリの Web フロント（Next.js）。データは smapass-back（Go API）の公開 API から取る。設計は [docs/](docs/README.md)。

`dev/` は試験用のプロトタイプ。本番のコードはこのリポジトリのルートに置く。

## 動かし方

1. smapass-back を起動してデモデータを入れる（smapass-back のディレクトリで）

   ```bash
   cp .env.example .env   # CORS_ORIGINS に http://localhost:3000 が入っていること（末尾の / なし）
   docker compose up -d --build --wait app && make seed
   ```

2. Web を起動する

   ```bash
   npm install
   npm run dev        # http://localhost:3000
   npm test           # 共通テストベクタ、検証の判定、集計、端末ID・IMEI・SITE_ORIGIN の形式
   npm run typecheck  # 先に npx next typegen（または npm run dev / build）でルートの型を作る
   npm run build
   ```

## 環境変数

| 名前 | 既定値 | 内容 |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_ORIGIN` | `http://localhost:8080` | Back の URL。サーバー（ページ描画）とブラウザ（検証・IMEI照合）の両方から呼ぶ |
| `SITE_ORIGIN` | 開発中は `http://localhost:3000`。本番は必須 | QR・カード画像・コピー用URLに載せる正規のドメイン。Back の `CORS_ORIGINS` に入れる値と同じにする（scheme・host・port だけ、末尾の / なし）。本番は https に限る |

`SITE_ORIGIN` はリクエストの Host ヘッダーからは決めない。本番で未設定・不正な値のときは、起動時（`instrumentation.ts`）にエラーになり、すべてのリクエストが失敗する。`next build` は未設定でも通る。

## デモ端末

IMEI `000000000094821`（`is_demo: true`、署名は無効、アンカーなし、spec は未登録）。端末の UUID は seed を入れるたびに変わるので、検索してから開く。

```bash
curl 'http://localhost:8080/api/devices/search?imeis=000000000094821'
# → http://localhost:3000/certificates/<UUID> を開く
```

## 未実装

- 評価・出品先・整備記録：Back が未実装。画面では「準備中」と表示し、仮の値で埋めない
- ブロックチェーンとの照合：Back がチェーンに記録するようになったら `lib/verify.ts` と `components/useVerification.ts` に足す。それまで「一致」は出さない
- 署名（ECDSA）のブラウザでの検証
