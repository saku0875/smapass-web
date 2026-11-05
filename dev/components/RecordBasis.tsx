import { formatDate, formatMonthRange } from "@/lib/format";
import { recordPeriodDays } from "@/lib/records";
import type { RecordData } from "@/lib/types";

/** 評価をどこまで信じてよいかの目安として、記録期間・回数・発行日を1行で添える */
export function RecordBasis({ records, issuedAt }: { records: RecordData[]; issuedAt: string }) {
  const periodDays = recordPeriodDays(records);
  return (
    <>
      <p className="small muted">
        {formatMonthRange(records[0].recordedAt, records.at(-1)!.recordedAt)}の{periodDays}日間・
        {records.length}回の記録に基づく評価（{formatDate(issuedAt)}発行）
      </p>
      {periodDays < 60 && (
        <p className="small notice">記録期間が短いため、使われ方の傾向は判断しにくい点に注意してください。</p>
      )}
    </>
  );
}
