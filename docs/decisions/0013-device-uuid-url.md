# 0013 証明書のURLを端末のUUIDにし、`/certificates/{id}` で開く

- ステータス：提案中
- 日付：2026-11-07
- 関連：FR-01、FR-11、FR-12、FR-17、NFR-06、[data-model.md](../data-model.md)、[features/qr.md](../features/qr.md)
- 置き換え：[0010](0010-url-and-qr-only.md)のうち「証明書IDは22文字のランダムな値にする」の部分と、URL `/c/[ID]`

## 背景

[0010](0010-url-and-qr-only.md)では、URLに含める証明書IDを「128ビットのランダム値を22文字で表したもの（形式はGoと決める）」とし、パスを `/c/[ID]` にした。

smapass-back（develop 6a8a590）は、証明書ごとのIDを持たず、端末ごとにランダムな UUID を割り当てる方式にした。UUID は持ち主や鍵が替わっても変わらず、公開 API（`/api/devices/{id}`、`/api/devices/{id}/records`）はこの UUID で引く。Web のページ URL・QR の遷移先は `/certificates/{id}` を想定している（smapass-back の docs/api.md、docs/screen-data.md）。

## 選択肢

- A：Web だけで22文字の ID を作り、UUID と対応づける
- B：端末の UUID をそのまま URL に使い、パスを `/certificates/{id}` にする

## 決定（案）

Bを採る。

- URL は `{SITE_ORIGIN}/certificates/{UUID}`。QR・カード画像・コピー用 URL・OGP はすべてこの URL を使う
- Web は UUID の形式（ハイフン付きの36文字）を先に確かめ、不正な値と全ゼロの UUID は Back を呼ばずに not-found にする。Back も同じ値に 400（invalid_id）を返す
- IMEI を詳細のパスに渡しても受け付けない
- UUID は画面に文字として表示しない（[0010](0010-url-and-qr-only.md)の方針を引き継ぐ）

## 理由

- 対応表を Web に持つと、Web だけでフィールドを足すことになる（AGENTS.md：データの正式な定義は Back のスキーマが正）
- ランダムな UUID（122ビット）は推測できない長さで、総当たり対策の考え方は [0010](0010-url-and-qr-only.md)と変わらない

## 影響

- `/c/[ID]` のルートはなくす。モックの証明書 ID は本番で使われていないので、転送は設けない
- 同じ端末の URL は、持ち主が替わっても同じになる。出品ごとに URL を変えることはできない（[0014](0014-show-latest-device-state.md)）
- UUID はアクセス権ではない。公開・非公開は Back が判定し、非公開の端末は 404 になる（存在しない端末と区別できない）
- 総当たり対策として、Back の公開 API のレート制限（IP ごとに 10 req/s）を前提にする（NFR-06）
