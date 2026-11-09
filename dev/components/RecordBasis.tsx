import { formatDateTime, formatMonthRange } from "@/lib/format";
import { periodDays } from "@/lib/records";
import type { DeviceState } from "@/lib/types";

/**
 * 最終計測日時と記録期間・件数（decisions/0014）。
 * 中身は新しい計測が届くたびに更新されるので、いつ時点の情報かを目立つ位置に出す
 */
export function RecordBasis({ device }: { device: DeviceState }) {
  const { first_collected_at: first, last_collected_at: last, record_count: count } = device;

  if (!first || !last) {
    return <p className="small notice">まだ記録が届いていません。</p>;
  }

  const days = periodDays(first, last);
  return (
    <>
      <p style={{ fontWeight: 600 }}>最終計測：{formatDateTime(last)}</p>
      <p className="small muted">
        {formatMonthRange(first, last)}の{days}日間・{count}件の記録。
        リアルタイムの端末の状態ではなく、新しい記録が届くと内容が更新されます。
      </p>
      {days < 60 && (
        <p className="small notice">記録期間が短いため、使われ方の傾向は判断しにくい点に注意してください。</p>
      )}
    </>
  );
}
