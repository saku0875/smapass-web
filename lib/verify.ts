// ブラウザ検証の判定（features/verification.md）。通信はしない純粋な処理なので、テストから直接呼べる。
import { sha256Hex } from "./hash.ts";
import type { VerificationRecord } from "./types.ts";

export type VerifiedRow = {
  index: number;
  record: VerificationRecord;
  /** canonical_payload の UTF-8 バイト列をこのブラウザで SHA-256 にかけた値 */
  localHash: string;
  /** localHash が保存されている payload_hash と同じか */
  hashMatched: boolean;
  /** 連番が1つ前の続きで、previous_hash が1つ前の payload_hash と同じか */
  linked: boolean;
  /** デモ用の架空の記録（実際の署名ではない） */
  demo: boolean;
};

const DEMO_CANONICALIZATION = "demo-json-sort-v1";
const DEMO_SIGNATURE = "demo-not-a-signature";

export function isDemoRecord(r: VerificationRecord) {
  return r.canonicalization === DEMO_CANONICALIZATION || r.signature_algorithm === DEMO_SIGNATURE;
}

/**
 * 連番の昇順に並んだ全ログを確かめる。
 * - canonical_payload の文字列をそのまま SHA-256 にかけ、payload_hash と比べる。
 *   JSON を正規化し直したり、API の応答を再シリアライズしたりしない
 * - 連番が続いているか、previous_hash が1件前の payload_hash と一致するか。
 *   最初の記録は連番 1・previous_hash が null であること（先頭の記録が消されていないこと）
 */
export async function checkRecords(records: VerificationRecord[]): Promise<VerifiedRow[]> {
  return Promise.all(
    records.map(async (record, index) => {
      const localHash = await sha256Hex(record.canonical_payload);
      const prev = records[index - 1];
      const linked = prev
        ? record.sequence === prev.sequence + 1 && record.previous_hash === prev.payload_hash
        : record.sequence === 1 && record.previous_hash === null;
      return {
        index,
        record,
        localHash,
        hashMatched: localHash === record.payload_hash.toLowerCase(),
        linked,
        demo: isDemoRecord(record),
      };
    }),
  );
}

export const isRowOk = (r: VerifiedRow) => r.hashMatched && r.linked;
