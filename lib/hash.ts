// 記録データのハッシュ計算。RFC 8785（JCS）で正規化してSHA-256を取る（features/verification.md）
// ブラウザ検証では Back の canonical_payload をそのまま sha256Hex にかける。canonicalJson はテストベクタの確認に使う。

import canonicalize from "canonicalize";

export function canonicalJson(value: unknown): string {
  const result = canonicalize(value);
  if (result === undefined) throw new Error("正規化できない値です");
  return result;
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashRecord(value: unknown): Promise<string> {
  return sha256Hex(canonicalJson(value));
}
