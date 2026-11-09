# Webフロント プロトタイプ

docs/ の構成に沿ったプロトタイプ。データは smapass-back（Go API）の公開 API から取る。ブロックチェーンとの照合は Back が未実装のため、まだ行わない。

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
   npm test           # 共通テストベクタ（test/vectors/）、検証の判定、端末ID・IMEIの形式
   npm run build
   ```

## 環境変数

| 名前 | 既定値 | 内容 |
| --- | --- | --- |
| `NEXT_PUBLIC_BACKEND_ORIGIN` | `http://localhost:8080` | Back の URL。サーバー（ページ描画）とブラウザ（検証・IMEI照合）の両方から呼ぶ |
| `SITE_ORIGIN` | アクセスされたホスト | QR・カード画像・コピー用URLに載せる正規のドメイン。本番では固定する |

## デモ端末

IMEI `000000000094821`（28件、`is_demo: true`、署名は無効、アンカーなし、spec は未登録）。端末の UUID は seed を入れるたびに変わるので、検索してから開く。

```bash
curl 'http://localhost:8080/api/devices/search?imeis=000000000094821'
# → http://localhost:3000/certificates/<UUID> を開く
```

概要（`/certificates/<UUID>`）から「詳細を見る」で `/details`、検証結果の「詳しく見る」で `/verify` に移る。出品用素材は `/share`。

## 未実装・差し替え予定

- 評価・出品先・整備記録：Back が未実装。画面では「準備中」と表示し、仮の値で埋めない
- ブロックチェーンとの照合：Back がチェーンに記録するようになったら `lib/verify.ts` と `components/useVerification.ts` に足す。それまで「一致」は出さない
- 署名（ECDSA）のブラウザでの検証：未実装
- 「改ざんあり」「チェーン接続不可」のデモ：Back にないため、モック（`/api/mock/*`）と一緒に削除した。ハッシュ不一致の判定は `test/verify.test.ts` で確かめている
