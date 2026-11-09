# ブラウザでの改ざん検証

証明書の記録データが、保存されたハッシュ・記録どうしのつながり・ブロックチェーンに刻まれたハッシュと一致するかを、ブラウザ自身が確かめる機能。関連要件はFR-08、FR-09、FR-10、NFR-03。ブラウザで行う理由は [decisions/0001](../decisions/0001-verify-in-browser.md)。

## 検証の流れ

1. Back の `GET /api/devices/{id}/records` から全ログを取得する（ページングされるので total まで順に取る）。ブラウザから Back を直接呼ぶ
2. 各ログの `canonical_payload` 文字列の UTF-8 バイト列を、そのまま Web Crypto API で SHA-256 にかけ、`payload_hash`（小文字 hex）と比べる。data を JCS で正規化し直したり、API の応答を再シリアライズしたりしない
3. 連番（`sequence`）が 1 から続いているか、`previous_hash` が1件前の `payload_hash` と一致するかを確かめる（最初の記録は `previous_hash` が null）
4. ブロックチェーンの RPC 経由で、チェーン上に記録されたハッシュを読んで比べる。**Back はまだチェーンに記録していないので、今は行わない**
5. 一致・不一致・照合できずを区別して表示する

実装は `dev/lib/verify.ts`（判定）と `dev/components/useVerification.ts`（取得と状態）。

検証は概要画面と詳細画面の表示後に非同期で走らせ、ページの表示を待たせない（NFR-02）。

## 結果の状態

| 状態 | 条件 | 表示 |
| --- | --- | --- |
| 一致 | 2・3 がすべて合い、すべての記録のハッシュがチェーン上の値と一致 | 概要画面と詳細画面では「一致：改ざんなし」のバッジだけ。一致した記録数と照合日時は検証の詳細画面に出す。**チェーン照合ができるまでは出さない** |
| 不一致 | 2 のハッシュか 3 のつながりが1件でも合わない（チェーン照合ができたら、チェーン上の値と合わない場合も） | 概要画面では信用しないよう伝え、詳細画面ではどの記録が一致しなかったかを示す。/about の説明へ誘導 |
| 照合できず（通信） | APIやRPCの通信失敗、タイムアウト、429・5xx | 再試行ボタン。「不一致」と同じ見た目にしない |
| 照合できず（チェーン未記録） | 2・3 は合ったが、チェーンに記録されていない（`anchor_state` が `unanchored` など） | 「改ざんがないとは確かめられない」と伝える。「一致」とは表示しない |
| 記録なし | ログが0件 | 確かめるものがないと伝える |

- `anchor_state` が `confirmed` でも、サーバーが保存している状態にすぎず、ブラウザで照合した結果ではない。表示は「記録済み（サーバーの記録）」にとどめる
- デモのログ（`canonicalization` が `demo-json-sort-v1`、`signature_algorithm` が `demo-not-a-signature`）は実際の署名として扱わず、「改ざんなし」と表示しない
- 署名（P-256 ECDSA、`signature_base64` は ASN.1 DER）のブラウザでの検証は未実装

## アプリ・Goとの取り決め

ここがずれると、正しいデータでもブラウザ検証が必ず「不一致」になる。3者で一字一句そろえる。

1. ハッシュ対象と正規化方式：アプリが計測ログ（バージョン1 envelope、端末UUID入り）を RFC 8785（JCS）で正規化して署名し、Back はその文字列を `canonical_payload` としてそのまま保存・返却する。ハッシュはその UTF-8 バイト列の SHA-256。Web は正規化をし直さない（決定。smapass-back の docs/verification.md）
2. チェーン：Sepolia と Tapyrus のどちらを使うか、コントラクトアドレス・ABI は未決（smapass-back の docs/verification.md）
3. 記録の粒度：Back の API には `merkle_root`・`leaf_index`・`merkle_proof` があるが、Merkle の方式（leaf の対象、並び順、奇数 leaf、proof の左右）は未決

## テストベクタ

smapass-back の `docs/examples/jcs-vectors.json`・`measurement-vector.json` を正とし、`dev/test/vectors/` に写して `dev/test/hash.test.ts` で読み込む。Back 側が変わったら同じファイルで置き換える。

- JCS のベクタ（負のゼロ、指数表記、Unicode、改行など）が同じ正規化結果になること
- 計測ログのベクタで、`canonical_payload` の SHA-256 が `payload_hash` と一致し、`payload` を JCS で正規化すると `canonical_payload` と同じになること
- 重複キーの拒否は `JSON.parse` の段階で検出できないため、ブラウザでは確かめない（Back の取り込み時に拒否する）

ブラウザ・Go では同じ値になることを確かめた。Kotlin での実行は未確認。正規化やハッシュの方式を変えるときは、テストベクタと本書を同時に更新してアプリ・Go担当に共有する。

## 表示上の注意

- チェーンが決まったら、テストネットであれば明記する
- 「一致」は記録後に改ざんされていないことを示すだけで、計測値の正しさまでは示さない。線引きは [security.md](../security.md) の信頼モデルに合わせる
- 検証の詳細画面（`/certificates/[ID]/verify`）では、記録ごとに連番・ハッシュ・記録時刻・チェーンへの記録状態を出す。チェーンが決まったら、トランザクションハッシュとエクスプローラーへのリンクを足す（FR-09）
- `canonical_payload` をそのままダウンロードでき、第三者が自分で検証できるようにする（FR-10）

## 未決事項

- RPCプロバイダをどこにするか（[architecture.md](../architecture.md)）
- チェーン（Sepolia / Tapyrus）と、記録の粒度・Merkle の方式
- 署名のブラウザでの検証
- 端末情報（IMEIなど）をハッシュの対象にするか。対象にする場合、IMEIの全桁を公開の記録データに入れない方式（[decisions/0011](../decisions/0011-device-data-items.md)）
- OSからの値であることを証明する値（追加予定）の検証方法
