import { gradeLabels } from "@/lib/format";
import type { GradeItem } from "@/lib/types";

/** 項目別の評価と理由（FR-02） */
export function GradeItems({ items, columns = false }: { items: GradeItem[]; columns?: boolean }) {
  return (
    <div className={columns ? "grade-items-columns" : "section"} style={columns ? undefined : { gap: 10 }}>
      {items.map((item) => (
        <div key={item.label} className="box row" style={{ alignItems: "flex-start", flexWrap: "nowrap", gap: 14 }}>
          <span className="grade-letter" aria-hidden="true" style={{ flexShrink: 0, width: "2.2em", height: "2.2em" }}>
            {item.grade}
          </span>
          <div>
            <p style={{ fontWeight: 600 }}>
              {item.label}：{item.grade}（{gradeLabels[item.grade]}）
            </p>
            <p className="small">{item.reason}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
