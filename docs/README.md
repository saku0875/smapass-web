# Webフロント ドキュメント

ブロックチェーンを活用したリユース機器の履歴証明アプリのうち、Webフロント（Next.js）の設計文書。元になったのは2026-10-28時点の要件定義（案）。

## 目次

| ファイル | 内容 |
| --- | --- |
| [requirements.md](requirements.md) | 目的・ユーザー・スコープ、機能要件（FR）、非機能要件（NFR）、受入条件、スコープ外 |
| [workflow.md](workflow.md) | 出品から購入・受け取りまでの流れ、例外時の流れ |
| [screens.md](screens.md) | 画面一覧、画面遷移、各画面の表示項目 |
| [architecture.md](architecture.md) | 全体構成、技術選定と代案、Webが使うAPI |
| [data-model.md](data-model.md) | Webが前提にしているデータの制約と、失効・再発行など履歴の方針 |
| [security.md](security.md) | 信頼モデル（保証できること・できないこと）、脅威と対策、認証・認可 |
| [features/qr.md](features/qr.md) | 出品用素材（カード画像・QR・コピー用テキスト）、番号入力、フリマ規約上の制約 |
| [features/verification.md](features/verification.md) | ブラウザでの改ざん検証、ハッシュの取り決め |
| [decisions/](decisions/) | 決定事項（ADR）。1つの決定につき1ファイル |

## 作業別の読む順

| やること | 読む順 |
| --- | --- |
| 初めて参加する | requirements → workflow → screens |
| 証明書詳細を作る | screens → requirements（FR-01〜FR-10、FR-18） → data-model → architecture |
| 出品用素材・カード画像・番号入力を作る | features/qr → screens → requirements（FR-11、FR-12、FR-16、FR-17） |
| ブラウザ検証を作る | features/verification → architecture → security |
| ブックマークを作る | requirements（FR-13〜FR-15） → decisions/0002 → data-model |
| アプリ・Go担当と調整する | architecture（API） → data-model → features/verification → decisions |
| 決定を確認・変更する | decisions/ の該当ファイル（変更は新しいADRを足す） |

## 決定事項

いずれも2026-10-28時点では提案中。チームで決めたらステータスを更新する。

| 番号 | 決定 | ステータス |
| --- | --- | --- |
| [0001](decisions/0001-verify-in-browser.md) | 改ざん検証はブラウザで行う | 提案中 |
| [0002](decisions/0002-bookmark-in-browser.md) | ブックマークはMVPではブラウザに保存する | 提案中 |
| [0003](decisions/0003-certificate-snapshot.md) | 証明書は発行時点のスナップショットにする | 提案中 |
| [0004](decisions/0004-marketplace-policy.md) | フリマ規約への対応：各フリマに持ち帰って相談する | 提案中 |
| [0005](decisions/0005-certificate-number-format.md) | 証明書番号は手入力できる短い番号にする | 提案中 |
| [0006](decisions/0006-listing-link.md) | 出品先を証明書に登録して表示する | 提案中 |
| [0007](decisions/0007-card-image-on-web.md) | 出品用カード画像はWebで生成する | 提案中 |
| [0008](decisions/0008-grade-on-backend.md) | 評価はバックエンドで算出する | 提案中 |
| [0009](decisions/0009-partner-site-separate-repo.md) | 事業者向けサイトは別リポジトリにし、整備記録の表示はこのリポジトリで行う | 提案中 |

## MVPの実装順

バックエンドの完成を待たず、モックデータで証明書詳細から作り始める。

1. 証明書詳細をモックデータで作る（FR-01〜FR-03）
2. カード画像と出品用素材ページを作る（FR-11）。デモの見せ場なので早めに
3. ハッシュ計算をテストベクタで固め、ブラウザ検証を作る（FR-08）
4. Go APIとつなぎ、モックを本物に差し替える
5. 番号入力とブックマーク（FR-16、FR-13、FR-14）
6. Should項目（出品先の表示、検証の詳細、失効表示、コピー用テキストなど）

## 今回は作っていない文書

- `auth.md`：MVPはログインなしのため、認証・認可の方針は [security.md](security.md) にまとめた。[0002](decisions/0002-bookmark-in-browser.md) で案B（アカウント）を採る場合に新設する
- `ops/`（デプロイ・運用・バックアップ）：ホスティングが未定のため。決まったら追加する

## 用語

| 用語 | 意味 |
| --- | --- |
| 証明書 | ある時点までの端末の記録と評価をまとめたもの。発行後は内容が変わらない |
| 証明書番号 | 証明書を開くための公開用の短い番号。URLは `/c/[番号]` |
| 出品用素材 | 出品者が出品に添えるカード画像・URL・コピー用テキスト一式 |
| カード画像 | QR・証明書番号・機種・評価を載せた正方形の画像 |
| 出品先 | 出品者がアプリから登録した、証明書を使っている出品（フリマ名と商品ID） |
| 照合できず | 通信障害などで検証が完了しなかった状態。「不一致」とは別物 |
