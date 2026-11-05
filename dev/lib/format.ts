const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const dateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}

export function shortHash(hash: string) {
  return `${hash.slice(0, 8)}…${hash.slice(-4)}`;
}

/** 高温の目安（仮） */
export const HIGH_TEMP_C = 45;

/** 記録の間隔がこれ以上空いたら「途切れた期間」とする（しきい値は要決定） */
export const GAP_DAYS = 14;

export const gradeLabels: Record<string, string> = {
  A: "良好",
  B: "標準",
  C: "注意",
  D: "要確認",
};

/** 熱的余裕がこの値に達すると性能制限がかかる目安（Androidの getThermalHeadroom に合わせた仮の値） */
export const THERMAL_LIMIT = 1.0;

export function formatGb(gb: number) {
  return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
}

/** 記録期間を短く書く。例：2026/04〜10、2025/11〜2026/03、2026/09 */
export function formatMonthRange(fromIso: string, toIso: string) {
  const [from, to] = [formatDate(fromIso).slice(0, 7), formatDate(toIso).slice(0, 7)];
  if (from === to) return from;
  return from.slice(0, 4) === to.slice(0, 4) ? `${from}〜${to.slice(5)}` : `${from}〜${to}`;
}
