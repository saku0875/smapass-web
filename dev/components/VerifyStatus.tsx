"use client";

import Link from "next/link";
import { useVerification } from "./useVerification";

/** 結論欄に出す検証結果。simple は概要画面向けで、件数などを出さず言葉だけで伝える */
export function VerifyStatus({ id, simple = false }: { id: string; simple?: boolean }) {
  const { state, retry } = useVerification(id);

  if (state.phase === "checking") {
    return (
      <div className="row" aria-live="polite">
        <span className="status dashed">照合中…</span>
        <span className="small muted">このブラウザで、記録とブロックチェーン上の記録を照らし合わせています</span>
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

  if (state.phase === "mismatch") {
    const bad = state.rows.filter((r) => !r.matched);
    return (
      <div className="notice inverted" aria-live="polite">
        <span className="notice-title">✕ 不一致：記録が書き換えられた可能性があります</span>
        {simple ? (
          <p className="small">この証明書の内容は信用しないでください。</p>
        ) : (
          <p className="small">
            {state.rows.length}件中{bad.length}件の記録が、ブロックチェーン上の記録と一致しませんでした
            （{bad.map((r) => `${r.index + 1}件目`).join("、")}）。
          </p>
        )}
        <div className="row">
          <Link href={`/c/${id}/verify`} className="small" style={{ color: "inherit" }}>
            どの記録か詳しく見る →
          </Link>
          <Link href="/about#mismatch" className="small" style={{ color: "inherit" }}>
            「不一致」とは →
          </Link>
        </div>
      </div>
    );
  }

  return (
    // 一致のときはバッジだけにする。記録数や照合日時は検証の詳細画面で見せる
    <div className="row" aria-live="polite">
      <span className="status solid">✓ 一致：改ざんなし</span>
      {simple ? (
        <span className="small">記録されてから書き換えられていないことを確かめました</span>
      ) : (
        <Link href={`/c/${id}/verify`} className="small muted">
          詳しく見る
        </Link>
      )}
    </div>
  );
}
