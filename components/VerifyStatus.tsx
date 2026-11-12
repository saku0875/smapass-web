"use client";

import Link from "next/link";
import { formatDateTime, shortHash } from "@/lib/format";
import { isRowOk } from "@/lib/verify";
import { typeLabels } from "./VerifyDetail";
import { useVerification } from "./useVerification";

/** 結論欄に出す検証結果。simple は概要画面向けで、件数などを出さず言葉だけで伝える */
export function VerifyStatus({ id, simple = false }: { id: string; simple?: boolean }) {
  const { state, retry } = useVerification(id);
  const detailLink = (
    <Link href={`/certificates/${id}/verify`} className="small muted">
      詳しく見る
    </Link>
  );

  if (state.phase === "checking") {
    return (
      <div className="row" aria-live="polite">
        <span className="status dashed">照合中…</span>
        <span className="small muted">このブラウザで、記録データを確かめています</span>
      </div>
    );
  }

  if (state.phase === "unverifiable") {
    return (
      <div className="box" aria-live="polite">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="status dashed">？ 照合できず</span>
          <button type="button" className="button" onClick={retry}>
            再試行
          </button>
        </div>
        <p className="small" style={{ marginTop: 6 }}>
          {state.reason}
          通信の問題で確認できなかっただけで、改ざんが見つかったわけではありません。
        </p>
      </div>
    );
  }

  if (state.phase === "empty") {
    return (
      <div className="row" aria-live="polite">
        <span className="status dashed">記録なし</span>
        <span className="small muted">まだ記録が届いていないため、確かめるものがありません</span>
      </div>
    );
  }

  if (state.phase === "mismatch") {
    const bad = state.rows.filter((r) => !isRowOk(r));
    return (
      <div className="notice inverted" aria-live="polite">
        <span className="notice-title">✕ 不一致：記録が書き換えられた可能性があります</span>
        {simple ? (
          <p className="small">この証明書の内容は信用しないでください。</p>
        ) : (
          <p className="small">
            {state.rows.length}件中{bad.length}件の記録で、ハッシュか記録どうしのつながりが合いませんでした
            （{bad.map((r) => `${r.record.sequence}番`).join("、")}）。
          </p>
        )}
        <div className="row">
          <Link href={`/certificates/${id}/verify`} className="small" style={{ color: "inherit" }}>
            どの記録か詳しく見る →
          </Link>
          <Link href="/about#mismatch" className="small" style={{ color: "inherit" }}>
            「不一致」とは →
          </Link>
        </div>
      </div>
    );
  }

  // 記録どうしの整合性は取れた。ブロックチェーンへの保存は30分ごとなので、最新の記録はまだ未記録のことが多い。
  // そのため、記録済み（サーバーの記録）の中で最新のものを出す。ブラウザでチェーンと照合した結果ではないので「一致」「改ざんなし」とは言わない
  const latest = state.rows
    .filter((r) => r.record.anchor_state === "confirmed")
    .reduce<(typeof state.rows)[number] | undefined>(
      (a, r) => (!a || r.record.sequence > a.record.sequence ? r : a),
      undefined,
    );

  return (
    <div className="box" aria-live="polite">
      {latest ? (
        <div className="table-wrap">
          <table className="compact">
            <tbody>
              <tr>
                <td>{typeLabels[latest.record.type] ?? latest.record.type}</td>
                <td>{formatDateTime(latest.record.collected_at)}</td>
                <td className="mono" title={latest.localHash}>
                  {shortHash(latest.localHash)}
                </td>
                <td className="mono" title={latest.record.payload_hash}>
                  {shortHash(latest.record.payload_hash)}
                </td>
                <td title={latest.record.transaction_hash ?? undefined}>記録済み</td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <p className="small">ブロックチェーンには未記録です（30分ごとに記録されます）。</p>
      )}
      <div style={{ marginTop: 6 }}>{detailLink}</div>
    </div>
  );
}
