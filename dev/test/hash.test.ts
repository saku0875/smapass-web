// docs/features/verification.md のテストベクタで、正規化とハッシュ計算を確かめる
import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalJson, sha256Hex } from "../lib/hash.ts";
import { isValidId } from "../lib/certificate-id.ts";

const vectors = [
  {
    name: "最小の記録",
    input: { recordedAt: "2026-10-01T00:00:00Z", batteryCycleCount: 120 },
    canonical: '{"batteryCycleCount":120,"recordedAt":"2026-10-01T00:00:00Z"}',
    sha256: "fa32067d529aa8b9d464b7107bcc75724b74fcecd3d87b890a30ea423e4e8c8c",
  },
];

for (const v of vectors) {
  test(`テストベクタ：${v.name}`, async () => {
    const canonical = canonicalJson(v.input);
    assert.equal(canonical, v.canonical);
    assert.equal(await sha256Hex(canonical), v.sha256);
  });
}

test("証明書IDの形式を確かめる", () => {
  assert.equal(isValidId("SPqGEzGJRVPOZxLdBbSyYg"), true);
  assert.equal(isValidId("_zkOgpzmKkdaiLP5gKkENw"), true);
  // 途中で切れたURL
  assert.equal(isValidId("SPqGEzGJRVPOZxLdBb"), false);
  // 旧形式の証明書番号は受け付けない
  assert.equal(isValidId("7K3QM-9TX2P"), false);
  assert.equal(isValidId("SPqGEzGJRVPOZxLdBbSy/g"), false);
});
