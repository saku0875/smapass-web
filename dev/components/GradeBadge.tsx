import { gradeLabels } from "@/lib/format";
import type { Grade } from "@/lib/types";

/** 評価は色ではなく文字で表す（NFR-07） */
export function GradeBadge({ grade, large = false }: { grade: Grade; large?: boolean }) {
  return (
    <span className={`grade${large ? " large" : ""}`}>
      <span className="grade-letter" aria-hidden="true">
        {grade}
      </span>
      <span>
        {large && <span className="small muted" style={{ display: "block" }}>総合評価</span>}
        <span style={{ fontWeight: 600 }}>
          {grade}：{gradeLabels[grade]}
        </span>
      </span>
    </span>
  );
}
