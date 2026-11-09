"use client";

import { useCallback, useEffect, useState } from "react";
import { ApiNotFoundError, fetchAllPages } from "@/lib/api";
import type { Page, VerificationRecord } from "@/lib/types";
import { checkRecords, isRowOk, type VerifiedRow } from "@/lib/verify";

export type { VerifiedRow };

export type VerificationState =
  | { phase: "checking" }
  /** 通信エラー・タイムアウト・429・5xx。改ざんが見つかったわけではない */
  | { phase: "unverifiable"; reason: string }
  /** 記録がまだない */
  | { phase: "empty"; checkedAt: Date }
  /** ハッシュか、記録のつながりが合わないものがある */
  | { phase: "mismatch"; rows: VerifiedRow[]; checkedAt: Date }
  /**
   * 記録どうしの整合性は取れているが、チェーンと照合できていない。
   * Back はまだチェーンに記録していない（anchor_state は "unanchored"）ので、「一致」とは表示しない
   */
  | { phase: "unanchored"; rows: VerifiedRow[]; checkedAt: Date; demo: boolean };

/**
 * 1. Back から全ログ（canonical_payload・payload_hash など）を全ページ取得する
 * 2. canonical_payload の文字列をそのまま SHA-256 にかけ、payload_hash と比べる。
 *    JSON を正規化し直したり、API の応答を再シリアライズしたりしない
 * 3. 連番が続いているか、previous_hash が1件前の payload_hash と一致するかを確かめる
 * 4. チェーンとの照合：Back はまだチェーンに記録していないので、照合できずにする。
 *    anchor_state が "confirmed" でもサーバーの保存状態にすぎず、ブラウザで照合した結果ではない
 *
 * 通信の失敗は「不一致」ではなく「照合できず」にする
 */
async function verify(id: string): Promise<VerificationState> {
  let records: VerificationRecord[];
  try {
    records = (
      await fetchAllPages<Page<VerificationRecord>, VerificationRecord>(
        (offset, limit) => `/api/devices/${encodeURIComponent(id)}/records?limit=${limit}&offset=${offset}`,
        (body) => body,
      )
    ).items;
  } catch (e) {
    return {
      phase: "unverifiable",
      reason:
        e instanceof ApiNotFoundError
          ? "記録データが見つかりませんでした。表示した後に非公開に切り替えられた可能性があります。"
          : "記録データを取得できませんでした。",
    };
  }

  const checkedAt = new Date();
  if (records.length === 0) return { phase: "empty", checkedAt };

  const rows = await checkRecords(records);
  if (!rows.every(isRowOk)) return { phase: "mismatch", rows, checkedAt };
  return { phase: "unanchored", rows, checkedAt, demo: rows.some((r) => r.demo) };
}

export function useVerification(id: string) {
  const [state, setState] = useState<VerificationState>({ phase: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState({ phase: "checking" });
    verify(id).then((s) => {
      if (!cancelled) setState(s);
    });
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { state, retry };
}
