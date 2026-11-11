// 詳細画面の集計（lib/records.ts）。null（不明）を 0 や「異常なし」として数えないこと、
// グラフの表の行数が記録の件数とそろうこと（FR-03、NFR-07）を確かめる。
import { test } from "node:test";
import assert from "node:assert/strict";
import { abnormalExits, bootsPerWeek, countHighTemp, fullChargeChange, maxOf } from "../lib/records.ts";
import type { StatusRecord } from "../lib/types.ts";

const DAY = 86400000;
const START = Date.UTC(2026, 0, 1);

function rec(i: number, over: Partial<StatusRecord> = {}): StatusRecord {
  return {
    sequence: i + 1,
    collected_at: new Date(START + i * DAY).toISOString(),
    os_version: "16",
    sdk_int: 36,
    battery_temp_c: 30,
    battery_cycle_count: 100 + i,
    battery_charge_mah: 3000,
    battery_full_charge_mah: 4400,
    boot_count: 10 + i * 2,
    had_abnormal_exit: false,
    thermal_headroom: 0.3,
    ...over,
  };
}

test("起動回数：100件の記録なら100行を返し、最初の行は計算できない理由を付ける", () => {
  const records = Array.from({ length: 100 }, (_, i) => rec(i));
  const rows = bootsPerWeek(records);
  assert.equal(rows.length, 100);
  assert.equal(rows[0].perWeek, null);
  assert.equal(rows[0].reason, "最初の記録（前回がない）");
  // 1日に2回ずつ増える → 1週間あたり14回
  assert.equal(rows[1].perWeek, 14);
  assert.equal(rows[1].reason, undefined);
});

test("起動回数：不明・同じ時刻・回数が減った区間は null にして理由を付け、行は消さない", () => {
  const records = [
    rec(0),
    rec(1, { boot_count: null }),
    rec(2),
    rec(3, { collected_at: rec(2).collected_at }),
    rec(4, { boot_count: 0 }),
  ];
  const rows = bootsPerWeek(records);
  assert.equal(rows.length, records.length);
  assert.deepEqual(
    rows.map((r) => r.reason),
    ["最初の記録（前回がない）", "起動回数が不明", "起動回数が不明", "前回と同じ時刻", "回数が減った（初期化など）"],
  );
  assert.ok(rows.every((r) => r.perWeek === null));
});

test("高温の回数：温度が不明な記録は母数にも数えない", () => {
  const records = [rec(0, { battery_temp_c: 50 }), rec(1, { battery_temp_c: null }), rec(2, { battery_temp_c: 30 })];
  assert.deepEqual(countHighTemp(records), { count: 1, of: 2 });
});

test("最大値：すべて不明なら null（0 にしない）", () => {
  assert.equal(maxOf([rec(0, { thermal_headroom: null })], "thermal_headroom"), null);
  assert.equal(maxOf([rec(0, { thermal_headroom: 0.2 }), rec(1, { thermal_headroom: 0.7 })], "thermal_headroom"), 0.7);
});

test("満充電容量の変化：不明を飛ばして最初と最新を比べ、値が2件ないときは null", () => {
  const records = [
    rec(0, { battery_full_charge_mah: null }),
    rec(1, { battery_full_charge_mah: 4000 }),
    rec(2, { battery_full_charge_mah: 3800 }),
  ];
  assert.deepEqual(fullChargeChange(records), { first: 4000, latest: 3800, pct: -5 });
  assert.equal(fullChargeChange([rec(0)]), null);
});

test("異常終了：不明は「なし」に数えず、別に数える", () => {
  const records = [rec(0, { had_abnormal_exit: true }), rec(1, { had_abnormal_exit: null }), rec(2)];
  const r = abnormalExits(records);
  assert.equal(r.yes.length, 1);
  assert.equal(r.unknown, 1);
});
