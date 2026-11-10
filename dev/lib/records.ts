// 状態計測の履歴（history.items）から画面に出す値を計算する。
// 計測値は null（不明）になり得る。null は 0 や「異常なし」として数えず、計算から外す。
import { HIGH_TEMP_C } from "./format";
import type { StatusRecord } from "./types";

const DAY_MS = 86400000;

type NumericKey = {
  [K in keyof StatusRecord]: StatusRecord[K] extends number | null ? (null extends StatusRecord[K] ? K : never) : never;
}[keyof StatusRecord];

/** 値が分かっている計測だけを、値と組にして返す */
export function known<K extends NumericKey>(records: StatusRecord[], key: K) {
  return records.flatMap((r) => (r[key] == null ? [] : [{ record: r, value: r[key] as number }]));
}

export function maxOf(records: StatusRecord[], key: NumericKey): number | null {
  const values = known(records, key).map((v) => v.value);
  return values.length > 0 ? Math.max(...values) : null;
}

export function periodDays(fromIso: string, toIso: string) {
  return Math.round((Date.parse(toIso) - Date.parse(fromIso)) / DAY_MS);
}

/**
 * 計測の間隔が最も空いたところ。欠測かどうかのしきい値はまだ決まっていないので、
 * 「途切れた」とは判定せず、事実として間隔だけを出す
 */
export function longestInterval(records: StatusRecord[]) {
  let longest: { from: string; to: string; days: number } | undefined;
  for (let i = 1; i < records.length; i++) {
    const days = (Date.parse(records[i].collected_at) - Date.parse(records[i - 1].collected_at)) / DAY_MS;
    if (!longest || days > longest.days) {
      longest = { from: records[i - 1].collected_at, to: records[i].collected_at, days };
    }
  }
  return longest && { ...longest, days: Math.round(longest.days * 10) / 10 };
}

/** 温度が分かっている計測のうち、高温の目安を超えた回数 */
export function countHighTemp(records: StatusRecord[]) {
  const temps = known(records, "battery_temp_c");
  return { count: temps.filter((t) => t.value > HIGH_TEMP_C).length, of: temps.length };
}

/** 最初と最新の推定最大電荷の変化（%、小数1桁）。値が2件以上ないときは null */
export function fullChargeChange(records: StatusRecord[]) {
  const values = known(records, "battery_full_charge_mah");
  if (values.length < 2) return null;
  const first = values[0].value;
  const latest = values.at(-1)!.value;
  return { first, latest, pct: Math.round(((latest - first) / first) * 1000) / 10 };
}

/** OSのバージョンが変わった計測だけを並べる */
export function osHistory(records: StatusRecord[]) {
  return records.filter(
    (r, i) => i === 0 || r.os_version !== records[i - 1].os_version || r.sdk_int !== records[i - 1].sdk_int,
  );
}

/** 異常終了の有無ごとの件数。null（不明）は別に数える */
export function abnormalExits(records: StatusRecord[]) {
  return {
    yes: records.filter((r) => r.had_abnormal_exit === true),
    unknown: records.filter((r) => r.had_abnormal_exit == null).length,
  };
}

/**
 * 1週間あたりの起動回数。計測の間隔が空いても比べられるよう、間隔の日数で割る。
 * 前回の記録との差から出すので、記録の件数とそろうよう1件ごとに返し、
 * 計算できない記録（最初の記録、前後どちらかの起動回数が不明、時刻が同じ、回数が減った＝初期化など）は
 * perWeek を null にして理由を付ける
 */
export function bootsPerWeek(records: StatusRecord[]) {
  return records.map((r, i): { collected_at: string; perWeek: number | null; reason?: string } => {
    const at = r.collected_at;
    if (i === 0) return { collected_at: at, perWeek: null, reason: "最初の記録（前回がない）" };
    const prev = records[i - 1];
    if (r.boot_count == null || prev.boot_count == null) return { collected_at: at, perWeek: null, reason: "起動回数が不明" };
    const days = (Date.parse(r.collected_at) - Date.parse(prev.collected_at)) / DAY_MS;
    const diff = r.boot_count - prev.boot_count;
    if (days <= 0) return { collected_at: at, perWeek: null, reason: "前回と同じ時刻" };
    if (diff < 0) return { collected_at: at, perWeek: null, reason: "回数が減った（初期化など）" };
    return { collected_at: at, perWeek: Math.round((diff / days) * 7 * 10) / 10 };
  });
}
