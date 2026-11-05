"use client";

import { formatDateTime, shortHash } from "@/lib/format";
import { useVerification, type VerifiedRow } from "./useVerification";

const ETHERSCAN = "https://sepolia.etherscan.io/tx/";

function download(row: VerifiedRow, id: string) {
  // 正規化済みJSONをそのまま保存する。このファイルのSHA-256が画面のハッシュと一致する（FR-10）
  const blob = new Blob([row.canonical], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${id}-record-${String(row.index + 1).padStart(3, "0")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function VerifyDetail({ id }: { id: string }) {
  const { state, retry } = useVerification(id);

  if (state.phase === "checking") {
    return <p className="status dashed" aria-live="polite">照合中…</p>;
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

  const bad = state.rows.filter((r) => !r.matched).length;

  return (
    <div className="section" aria-live="polite">
      <div className="row" style={{ justifyContent: "space-between" }}>
        {state.phase === "match" ? (
          <span className="status solid">✓ 一致（{state.rows.length}件すべて）</span>
        ) : (
          <span className="status solid">✕ 不一致（{state.rows.length}件中{bad}件）</span>
        )}
        <button type="button" className="button" onClick={retry}>
          もう一度照合する
        </button>
      </div>
      <p className="small muted">照合日時：{formatDateTime(state.checkedAt.toISOString())}</p>

      <div className="table-wrap">
        <table className="compact">
          <thead>
            <tr>
              <th>#</th>
              <th>結果</th>
              <th>記録時刻</th>
              <th>ブラウザで計算したハッシュ</th>
              <th>チェーン上のハッシュ</th>
              <th>トランザクション</th>
              <th>データ</th>
            </tr>
          </thead>
          <tbody>
            {state.rows.map((r) => (
              <tr key={r.index} style={r.matched ? undefined : { background: "#111", color: "#fff" }}>
                <td>{r.index + 1}</td>
                <td>{r.matched ? "✓ 一致" : "✕ 不一致"}</td>
                <td>{formatDateTime(r.data.recordedAt)}</td>
                <td className="mono" title={r.localHash}>
                  {shortHash(r.localHash)}
                </td>
                <td className="mono" title={r.chain?.hash}>
                  {r.chain ? shortHash(r.chain.hash) : "記録なし"}
                </td>
                <td className="mono">
                  <a href={`${ETHERSCAN}${r.txHash}`} target="_blank" rel="noreferrer" title={r.txHash}>
                    {shortHash(r.txHash)}
                  </a>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
