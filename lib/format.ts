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

/** 熱的余裕がこの値に達すると性能制限がかかる目安（Androidの getThermalHeadroom に合わせた仮の値） */
export const THERMAL_LIMIT = 1.0;

/** 値が不明（null）のときの表示 */
export const UNKNOWN = "不明";

/**
 * バイト数を GB で表す。RAM・ストレージは端末が返す値が公称値より少し小さいことが多いので、
 * 1 GB = 1024^3 バイトで小数1桁に丸める（整数ならそのまま）
 */
export function formatBytesGb(bytes: number | null) {
  if (bytes == null) return UNKNOWN;
  const gb = Math.round((bytes / 1024 ** 3) * 10) / 10;
  return `${Number.isInteger(gb) ? gb : gb.toFixed(1)} GB`;
}

/** 数値に単位を付ける。null は「不明」 */
export function withUnit(value: number | null, unit: string, digits?: number) {
  if (value == null) return UNKNOWN;
  return `${digits == null ? value.toLocaleString("ja-JP") : value.toFixed(digits)}${unit}`;
}

/** 記録期間を短く書く。例：2026/04〜10、2025/11〜2026/03、2026/09 */
export function formatMonthRange(fromIso: string, toIso: string) {
  const [from, to] = [formatDate(fromIso).slice(0, 7), formatDate(toIso).slice(0, 7)];
  if (from === to) return from;
  return from.slice(0, 4) === to.slice(0, 4) ? `${from}〜${to.slice(5)}` : `${from}〜${to}`;
}
