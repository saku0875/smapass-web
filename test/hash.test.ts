// smapass-back と共有するテストベクタで、正規化とハッシュ計算を確かめる（features/verification.md）。
// test/vectors/ は smapass-back の docs/examples/ の写し。Back 側が変わったら同じファイルで置き換える。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { canonicalJson, sha256Hex } from "../lib/hash.ts";
import { isValidDeviceId } from "../lib/device-id.ts";
import { isValidImei } from "../lib/imei.ts";

const load = (name: string) => JSON.parse(readFileSync(new URL(`./vectors/${name}`, import.meta.url), "utf8"));

const jcs = load("jcs-vectors.json") as { vectors: { input: string; canonical: string }[]; rejected: string[] };
const measurement = load("measurement-vector.json") as { canonical_payload: string; payload: unknown; payload_hash: string };

for (const [i, v] of jcs.vectors.entries()) {
  test(`JCS テストベクタ ${i + 1}`, () => {
    assert.equal(canonicalJson(JSON.parse(v.input)), v.canonical);
  });
}

test("JCS：孤立サロゲートと範囲外の数値は正規化できない", () => {
  assert.throws(() => canonicalJson(JSON.parse(jcs.rejected[1])));
  assert.throws(() => canonicalJson(JSON.parse(jcs.rejected[2])));
});

// 重複キーは JSON.parse の時点で後勝ちになり、ブラウザでは検出できない。
// Web は canonical_payload を解析せずそのままハッシュにかけるので、検証には影響しない
test.todo("JCS：重複キーの拒否（Back の取り込み時に拒否される）");

test("計測ログ：canonical_payload の SHA-256 が payload_hash と一致する", async () => {
  assert.equal(await sha256Hex(measurement.canonical_payload), measurement.payload_hash);
});

test("計測ログ：payload を JCS で正規化すると canonical_payload と同じになる", () => {
  assert.equal(canonicalJson(measurement.payload), measurement.canonical_payload);
});

test("端末IDの形式を確かめる", () => {
  assert.equal(isValidDeviceId("51eb6056-cc46-4b1c-adaa-4c4e34148d60"), true);
  assert.equal(isValidDeviceId("51EB6056-CC46-4B1C-ADAA-4C4E34148D60"), true);
  // 全ゼロの UUID は Back が 400 を返す
  assert.equal(isValidDeviceId("00000000-0000-0000-0000-000000000000"), false);
  // 途中で切れたURL
  assert.equal(isValidDeviceId("51eb6056-cc46-4b1c-adaa-4c4e3414"), false);
  // 旧形式（22文字のID）と IMEI は受け付けない
  assert.equal(isValidDeviceId("SPqGEzGJRVPOZxLdBbSyYg"), false);
  assert.equal(isValidDeviceId("000000000094821"), false);
});

test("IMEI のチェックディジットを確かめる", () => {
  assert.equal(isValidImei("000000000094821"), true);
  assert.equal(isValidImei("000000000094822"), false);
  assert.equal(isValidImei("000000000000000"), false);
  assert.equal(isValidImei("00000000009482"), false);
});
