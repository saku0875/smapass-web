"use client";

import { useCallback, useEffect, useState } from "react";
import { canonicalJson, sha256Hex } from "@/lib/hash";
import type { ChainEntry, RecordData, VerificationRecord } from "@/lib/types";

export type VerifiedRow = {
  index: number;
  data: RecordData;
  canonical: string;
  txHash: string;
  localHash: string;
  chain?: ChainEntry;
  matched: boolean;
};

export type VerificationState =
  | { phase: "checking" }
  | { phase: "match"; rows: VerifiedRow[]; checkedAt: Date }
  | { phase: "mismatch"; rows: VerifiedRow[]; checkedAt: Date }
  | { phase: "unverifiable"; reason: string };

const TIMEOUT_MS = 8000;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * 1. 記録データ本体をバックエンドから取る
 * 2. ブラウザで正規化してSHA-256を計算する
 * 3. チェーンに記録されたハッシュを別経路で読む
 * 4. 比べる。通信の失敗は「不一致」ではなく「照合できず」にする
 */
async function verify(id: string): Promise<VerificationState> {
  let records: VerificationRecord[];
  try {
    records = (await fetchJson<{ records: VerificationRecord[] }>(`/api/mock/certificates/${id}/records`)).records;
  } catch {
    return { phase: "unverifiable", reason: "記録データを取得できませんでした。" };
  }

  const hashed = await Promise.all(
    records.map(async (r, index) => {
      const canonical = canonicalJson(r.data);
      return { index, data: r.data, canonical, txHash: r.txHash, localHash: await sha256Hex(canonical) };
    }),
  );

  let entries: Record<string, ChainEntry>;
  try {
    const tx = records.map((r) => r.txHash).join(",");
    entries = (await fetchJson<{ entries: Record<string, ChainEntry> }>(`/api/mock/chain?tx=${tx}`)).entries;
  } catch {
    return { phase: "unverifiable", reason: "ブロックチェーンに接続できませんでした。" };
  }

  const rows: VerifiedRow[] = hashed.map((h) => {
    const chain = entries[h.txHash];
    return { ...h, chain, matched: chain?.hash === h.localHash };
  });
  const checkedAt = new Date();
  return rows.every((r) => r.matched)
    ? { phase: "match", rows, checkedAt }
    : { phase: "mismatch", rows, checkedAt };
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
