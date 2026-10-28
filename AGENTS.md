# AGENTS.md

リユース電子機器の履歴証明アプリの **Webフロント**（Next.js）のリポジトリ。
アプリ（Kotlin）が記録した端末の使用履歴を「証明書」として表示・検証し、出品者がメルカリなどの出品に添えるQRコード・URL・カード画像を提供する。

## 最初に読むもの

- [docs/README.md](docs/README.md)：目次と、作業別に読む順番
- [docs/requirements.md](docs/requirements.md)：要件（FR/NFR）と受入条件

## 守ること

- 要件は `FR-xx` / `NFR-xx` のIDで参照する。ブランチ名・コミット・PRの説明にIDを書く
- 決定を変えるときは `docs/decisions/` に新しいADRを足し、古いADRのステータスを「置き換え済み」にする。既存ADRの本文は書き換えない
- データの正式な定義はGoバックエンドのスキーマが正。Web側だけでフィールドを足したり意味を変えたりしない（[data-model.md](docs/data-model.md)）
- ハッシュ計算（JSONの正規化とSHA-256）を変えるときは、[features/verification.md](docs/features/verification.md) とテストベクタを同時に更新し、アプリ・バックエンド担当に共有する
- MVPのWebは読み取り専用。書き込み系のAPIやフォームを足さない（出品先の登録はアプリの役割）
- 製造番号は末尾しか表示しない。証明書ページは `noindex` にする
- 検証結果の「不一致」と「照合できず」を混同しない。通信エラーを「不一致」と表示してはいけない

## 開発コマンド

（リポジトリ作成後に追記）
