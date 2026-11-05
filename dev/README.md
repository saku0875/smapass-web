# Webフロント プロトタイプ

docs/ の構成に沿ったプロトタイプ。Goバックエンドとチェーン（Sepolia）は模擬で、`app/api/mock/` と `lib/backend.ts` が代わりをしている。

## 動かし方

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # ハッシュのテストベクタと証明書IDの形式の確認
npm run build
```

## デモ用の証明書

トップページの一覧から開ける。証明書はURL（`/c/<証明書ID>`）とQRコードだけで開き、番号の入力はない（docs/decisions/0010）。開くと概要画面が出て、「詳細を見る」で `/c/<証明書ID>/details` に移る。

| 機種 | 見どころ |
| --- | --- |
| Google Pixel 8（発行 10/20） | 一致。出品先と整備記録あり |
| Samsung Galaxy S23 | 13件目をDB上で書き換えた想定 → 不一致 |
| Google Pixel 8（発行 8/31） | 再発行済み → 新しい証明書へ誘導 |
| Sony Xperia 10 V | チェーンに接続できない → 照合できず。記録が途切れた期間あり |
| SHARP AQUOS sense8 | 失効済み。記録期間が短い |

## 本番に向けて差し替えるところ

- `lib/backend.ts`：Go APIの呼び出しに置き換える
- `components/useVerification.ts`：`/api/mock/chain` をSepoliaのRPC読み取り（viem）に置き換える
- `lib/site.ts`：正規のドメインを `SITE_ORIGIN` で固定する
