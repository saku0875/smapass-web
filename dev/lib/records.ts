// 記録データから画面に出す値を計算する
import { GAP_DAYS, HIGH_TEMP_C } from "./format";
import type { RecordData } from "./types";

const DAY_MS = 86400000;

export function findGaps(records: RecordData[]) {
  const gaps: { from: string; to: string; days: number }[] = [];
  for (let i = 1; i < records.length; i++) {
    const days = Math.round((Date.parse(records[i].recordedAt) - Date.parse(records[i - 1].recordedAt)) / DAY_MS);
    if (days >= GAP_DAYS) gaps.push({ from: records[i - 1].recordedAt, to: records[i].recordedAt, days });
  }
  return gaps;
}

export function recordPeriodDays(records: RecordData[]) {
  if (records.length < 2) return 0;
  return Math.round((Date.parse(records.at(-1)!.recordedAt) - Date.parse(records[0].recordedAt)) / DAY_MS);
}

export function countHighTemp(records: RecordData[]) {
  return records.filter((r) => r.batteryTempC > HIGH_TEMP_C).length;
}

/** 記録開始時から最新までの推定最大電荷の変化（%、小数1桁） */
export function estimatedMaxChangePct(records: RecordData[]) {
  if (records.length < 2) return 0;
  const first = records[0].estimatedMaxMah;
  return Math.round(((records.at(-1)!.estimatedMaxMah - first) / first) * 1000) / 10;
}

/** OSのバージョンが変わった記録だけを並べる */
export function osHistory(records: RecordData[]) {
  return records.filter(
    (r, i) => i === 0 || r.androidVersion !== records[i - 1].androidVersion || r.sdkInt !== records[i - 1].sdkInt,
  );
}

/** 1週間あたりの起動回数。記録の間隔が空いても比べられるよう、間隔の日数で割る */
export function bootsPerWeek(records: RecordData[]) {
  return records.slice(1).map((r, i) => {
    const days = (Date.parse(r.recordedAt) - Date.parse(records[i].recordedAt)) / DAY_MS;
    return { recordedAt: r.recordedAt, perWeek: Math.round(((r.bootCount - records[i].bootCount) / days) * 7 * 10) / 10 };
  });
}
