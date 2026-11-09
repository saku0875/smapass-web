# データモデル

フィールドの正式な定義はGoバックエンドのスキーマ（smapass-back の docs/openapi.json、internal/domain/entity/device.go・records.go）が正。Web の型は `dev/lib/types.ts` で、JSON の snake_case のまま扱う。ここにはWebが前提にしている制約と、履歴の扱いの方針だけを書く。

## 端末の状態（`GET /api/devices/{id}`）

| 項目 | 制約・方針 | 関連 |
| --- | --- | --- |
| 端末ID（`id`） | Back が割り当てるランダムな UUID。持ち主や鍵が替わっても変わらない。URLに使い、画面には文字として表示しない | [decisions/0013](decisions/0013-device-uuid-url.md) |
| 登録の状態（`registration_status`） | `active` / `released`。登録の状態で、データが正しいかどうかとは関係ない。画面には出さない | |
| 記録期間・件数（`first_collected_at`、`last_collected_at`、`record_count`） | 新しい記録が届くたびに変わる。`record_count` はスペックのログも含むので、状態計測の件数（`history.total`）と一致しないことがある | [decisions/0014](decisions/0014-show-latest-device-state.md) |
| スペック（`spec`） | メーカー、モデル、端末名、SoC、CPUコア数、RAM・ストレージ（bytes。Web で GB に丸める）、画面サイズ・密度、OS/SDK、計測日時。未取得なら null | [decisions/0011](decisions/0011-device-data-items.md) |
| 最新の状態（`status`） | 最新の状態計測。`spec.collected_at` とは別の時刻のことがある | |
| 履歴（`history`） | 全登録期間の状態計測を連番の昇順で返す。ページングされるので total まで順に取得する | |
| デモ（`is_demo`） | true なら架空のデータ。false でも「検証済み」という意味ではない | |
| IMEI | 表示用の API には含まれない。`/api/devices/search` で UUID を引くためにだけ使う | [decisions/0015](decisions/0015-imei-input-check.md) |
| 評価・欠測判定・整備記録・出品先 | Back は未実装。Web は「準備中」と表示し、仮の値で埋めない | [decisions/0008](decisions/0008-grade-on-backend.md) |

状態計測の値（温度・サイクル・電荷・起動回数・異常終了・熱的余裕）はすべて null になり得る。null は「不明」と表示し、0 や「異常なし」に置き換えない。

## 履歴の方針

- 証明書は発行時点のスナップショットではなく、端末の最新の状態と全期間の履歴を表示する。同じURLの中身は新しい記録が届くたびに更新される（[decisions/0014](decisions/0014-show-latest-device-state.md)）
- 証明書の発行・再発行・失効はない。非公開の端末は公開 API で 404 になり、存在しない端末と区別できない
- 公開・非公開は持ち主がアプリで切り替える。初回登録時と持ち主が替わった直後は非公開。登録が終了した後と、最後のログから72時間たって再登録できる間は公開扱い（smapass-back の docs/api.md）
- 出品先は記録データではないので、ハッシュの対象外でチェーンにも載らない予定。改ざんされていないことの保証は、アプリからしか登録できないこと（本人確認）に頼る（[security.md](security.md)）

## 以前の方針（置き換え済み）

以下は [decisions/0003](decisions/0003-certificate-snapshot.md) のスナップショット方式のときの表。経緯として残す。

### 証明書

| 項目 | 制約・方針 | 関連 |
| --- | --- | --- |
| 証明書ID | URLに含める公開用のID。推測できないランダムな値（案：128ビット、URLで使える英数字と記号の22文字。形式はGoと要相談）。画面には文字として表示しない | [decisions/0010](decisions/0010-url-and-qr-only.md) |
| 状態 | 有効・失効・再発行済みのいずれか。再発行済みは後継の証明書IDを持つ | 下の「履歴の方針」 |
| 発行日時・記録期間・記録回数 | 発行時点で確定し、後から変わらない | [decisions/0003](decisions/0003-certificate-snapshot.md) |
| 端末情報 | IMEI（Webには末尾4桁だけ渡す）、メーカー、モデル、端末名、SoC、CPUコア数、RAM容量、ストレージ容量、画面サイズ、画面密度、取得日時。たまにしか変わらない。今のところハッシュの対象外 | [decisions/0011](decisions/0011-device-data-items.md) |
| 評価 | 総合評価、項目別の評価と説明文。バックエンドが算出して返す | [decisions/0008](decisions/0008-grade-on-backend.md) |
| 記録 | 定期取得する値：記録日時、Android OSバージョン、SDK、バッテリー温度、バッテリーサイクルカウント、残り電荷（mAh）、推定最大電荷（mAh）、累計起動回数、異常終了の有無、熱的余裕（0〜1）。ほかにハッシュ、トランザクションハッシュ。OSからの値であることを証明する値が追加される予定 | [features/verification.md](features/verification.md) |
| 出品先 | フリマ名、商品ID、登録日時。発行後に追加・変更できる唯一の項目 | [decisions/0006](decisions/0006-listing-link.md)、[decisions/0011](decisions/0011-device-data-items.md) |
| 整備記録 | 記録者（事業者名と種別）、日時、内容（修理箇所・使ったパーツ・点検結果など）。事業者向けサイト（別リポジトリ）が書き込み、Webは表示するだけ。項目とハッシュの対象にするかは事業者向けの要件定義とGoで決める | [decisions/0009](decisions/0009-partner-site-separate-repo.md) |

### 履歴の方針（スナップショット方式）

- 証明書は発行時点のスナップショット。発行後に記録や評価は変わらない。内容を更新したいときは再発行して新しいIDを振る
- 失効・再発行しても証明書は消さない。状態を変えて残し、再発行済みなら後継へのリンクを持たせる
- 出品先は記録データではないので、ハッシュの対象外でチェーンにも載らない。改ざんされていないことの保証は、アプリからしか登録できないこと（本人確認）に頼る（[security.md](security.md)）
- 失効の条件（売却完了時、再発行時など）と、誰が失効させるかはアプリ・Goと要相談
