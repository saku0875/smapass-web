// ブラウザ検証の判定（FR-08）。test/vectors/demo-records.json は smapass-back の開発 seed（デモ端末）の先頭3件
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkRecords, isRowOk } from "../lib/verify.ts";
import type { VerificationRecord } from "../lib/types.ts";

const records = JSON.parse(
  readFileSync(new URL("./vectors/demo-records.json", import.meta.url), "utf8"),
) as VerificationRecord[];

test("書き換えのない記録は、ハッシュもつながりも合う", async () => {
  const rows = await checkRecords(records);
  assert.equal(rows.every(isRowOk), true);
  assert.equal(rows.every((r) => r.demo), true);
});

test("canonical_payload を1文字変えると、その記録のハッシュが合わなくなる", async () => {
  const tampered = structuredClone(records);
  tampered[1].canonical_payload = tampered[1].canonical_payload.replace('"battery_temp_c":', '"battery_temp_c":1');
  const rows = await checkRecords(tampered);
  assert.deepEqual(
    rows.map((r) => r.hashMatched),
    [true, false, true],
  );
});

test("途中の記録を消すと、つながりが合わなくなる", async () => {
  const rows = await checkRecords([records[0], records[2]]);
  assert.equal(rows[1].linked, false);
});

test("先頭の記録を消すと、つながりが合わなくなる", async () => {
  const rows = await checkRecords(records.slice(1));
  assert.equal(rows[0].linked, false);
});
