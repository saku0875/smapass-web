// Goバックエンドと Sepolia の代わり。本番ではここをAPI呼び出しとチェーンの読み取りに差し替える。

import "server-only";
import { mockCertificates } from "./mock-data";
import { hashRecord, sha256Hex } from "./hash";
import type { Certificate, ChainEntry, VerificationRecord } from "./types";

function find(id: string) {
  return mockCertificates.find((c) => c.id === id);
}

export function getCertificate(id: string): Certificate | undefined {
  const found = find(id);
  if (!found) return undefined;
  const { originalRecords: _o, chainUnavailable: _c, ...certificate } = found;
  return certificate;
}

async function txHashOf(id: string, index: number) {
  return `0x${await sha256Hex(`tx:${id}:${index}`)}`;
}

export async function getVerificationRecords(id: string): Promise<VerificationRecord[] | undefined> {
  const c = find(id);
  if (!c) return undefined;
  return Promise.all(c.records.map(async (data, i) => ({ data, txHash: await txHashOf(id, i) })));
}

// 模擬チェーン：アプリが記録した元の値のハッシュを、トランザクションごとに持つ
let chainPromise: Promise<Map<string, ChainEntry & { unavailable: boolean }>> | undefined;

function chain() {
  chainPromise ??= (async () => {
    const map = new Map<string, ChainEntry & { unavailable: boolean }>();
    for (const c of mockCertificates) {
      for (const [i, record] of c.originalRecords.entries()) {
        const blockTimestamp = new Date(Date.parse(record.recordedAt) + 40_000).toISOString();
        map.set(await txHashOf(c.id, i), {
          hash: await hashRecord(record),
          blockTimestamp,
          unavailable: Boolean(c.chainUnavailable),
        });
      }
    }
    return map;
  })();
  return chainPromise;
}

export class ChainUnavailableError extends Error {}

/** 見つからないトランザクションは結果に含めない */
export async function readChain(txHashes: string[]): Promise<Record<string, ChainEntry>> {
  const map = await chain();
  const result: Record<string, ChainEntry> = {};
  for (const tx of txHashes) {
    const entry = map.get(tx);
    if (!entry) continue;
    if (entry.unavailable) throw new ChainUnavailableError("RPCに接続できません");
    result[tx] = { hash: entry.hash, blockTimestamp: entry.blockTimestamp };
  }
  return result;
}

export const demoCertificates = mockCertificates.map((c) => ({
  id: c.id,
  label: `${c.device.maker} ${c.device.model}`,
  note:
    c.status === "reissued"
      ? "再発行済み"
      : c.status === "revoked"
        ? "失効済み"
        : c.chainUnavailable
          ? "照合できず（通信エラー）"
          : c.records.some((r, i) => r !== c.originalRecords[i])
            ? "改ざんあり（不一致）"
            : "一致",
}));
