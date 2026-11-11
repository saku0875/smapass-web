"use client";

import { formatDateTime, shortHash } from "@/lib/format";
import type { VerificationRecord } from "@/lib/types";
import { isRowOk } from "@/lib/verify";
import { useVerification, type VerifiedRow } from "./useVerification";

function download(row: VerifiedRow, id: string) {
  // Back が返した canonical_payload をそのまま保存する。このファイルのSHA-256が画面のハッシュと一致する（FR-10）
  const blob = new Blob([row.record.canonical_payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${id}-record-${String(row.record.sequence).padStart(4, "0")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

const typeLabels: Record<VerificationRecord["type"], string> = {
  spec: "スペック",
  status: "状態",
  inspection: "点検",
};

/** サーバーが保存している状態。ブラウザで照合した結果ではない */
const anchorLabels: Record<VerificationRecord["anchor_state"], string> = {
  unanchored: "未記録",
  pending: "送信中（サーバーの記録）",
  confirmed: "記録済み（サーバーの記録）",
  failed: "失敗（サーバーの記録）",
};

function rowResult(r: VerifiedRow) {
  if (!r.hashMatched) return "✕ ハッシュ不一致";
  if (!r.linked) return "✕ つながり不一致";
  return "？ チェーン照合できず";
}

export function VerifyDetail({ id }: { id: string }) {
  const { state, retry } = useVerification(id);

  if (state.phase === "checking") {
    return (
      <p className="status dashed" aria-live="polite">
        照合中…
      </p>
    );
  }

  if (state.phase === "unverifiable") {
    return (
      <div className="box section" aria-live="polite">
        <span className="status dashed">？ 照合できず</span>
        <p className="small">{state.reason}改ざんが見つかったわけではありません。</p>
        <div>
          <button type="button" className="button" onClick={retry}>
            再試行
          </button>
        </div>
      </div>
    );
  }

  if (state.phase === "empty") {
    return <p className="box small">まだ記録が届いていないため、確かめる記録がありません。</p>;
  }

  const bad = state.rows.filter((r) => !isRowOk(r)).length;

  return (
    <div className="section" aria-live="polite">
      <div className="row" style={{ justifyContent: "space-between" }}>
        {state.phase === "mismatch" ? (
          <span className="status solid">
            ✕ 不一致（{state.rows.length}件中{bad}件）
          </span>
        ) : (
          <span className="status dashed">？ 照合できず（ブロックチェーン未記録）</span>
        )}
        <button type="button" className="button" onClick={retry}>
          もう一度照合する
        </button>
      </div>
      <p className="small muted">照合日時：{formatDateTime(state.checkedAt.toISOString())}</p>

      {state.phase === "unanchored" && (
        <p className="small">
          {state.rows.length}件すべてで、このブラウザで計算したハッシュが保存されている値と同じで、記録どうしのつながりにも食い違いはありませんでした。
          ただし、記録はまだブロックチェーンに記録されていないため、運営者のサーバーを信用せずに「改ざんなし」とは確かめられません。
          {state.demo && "また、この端末の記録はデモ用の架空のもので、署名も本物ではありません。"}
        </p>
      )}

      <div className="table-wrap">
        <table className="compact">
          <thead>
            <tr>
              <th>連番</th>
              <th>結果</th>
              <th>種別</th>
              <th>計測日時</th>
              <th>ブラウザで計算したハッシュ</th>
              <th>保存されているハッシュ</th>
              <th>ブロックチェーン</th>
              <th>データ</th>
            </tr>
          </thead>
          <tbody>
            {state.rows.map((r) => {
              const ok = r.hashMatched && r.linked;
              return (
                <tr key={r.index} style={ok ? undefined : { background: "#111", color: "#fff" }}>
                  <td>{r.record.sequence}</td>
                  <td>
                    {rowResult(r)}
                    {r.demo && <span className="small">（デモ）</span>}
                  </td>
                  <td>{typeLabels[r.record.type] ?? r.record.type}</td>
                  <td>{formatDateTime(r.record.collected_at)}</td>
                  <td className="mono" title={r.localHash}>
                    {shortHash(r.localHash)}
                  </td>
                  <td className="mono" title={r.record.payload_hash}>
                    {shortHash(r.record.payload_hash)}
                  </td>
                  <td title={r.record.transaction_hash ?? undefined}>
                    {anchorLabels[r.record.anchor_state] ?? r.record.anchor_state}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="button"
                      style={{ padding: "2px 8px", fontSize: "0.78rem", color: "#111" }}
                      onClick={() => download(r, id)}
                    >
                      JSON
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
