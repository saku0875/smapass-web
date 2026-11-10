"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { UNKNOWN } from "@/lib/format";

/** value が null の点はグラフに描かず、表には reason（なければ「不明」）を出す */
type Point = { date: string; value: number | null; reason?: string };

const axisTick = { fontSize: 11, fill: "#6b6b6b" };

/** 推移グラフ。同じ値の表を折りたたみで付ける（NFR-07） */
export function TrendChart({
  title,
  unit,
  points,
  domain,
  threshold,
  kind = "line",
  note,
  ticks,
}: {
  title: string;
  unit: string;
  points: Point[];
  domain?: [number, number];
  threshold?: { value: number; label: string };
  kind?: "line" | "bar";
  note?: string;
  ticks?: number[];
}) {
  const children = [
    <CartesianGrid key="grid" stroke="#e2e2e2" vertical={false} />,
    <XAxis key="x" dataKey="date" tick={axisTick} tickLine={false} axisLine={{ stroke: "#111" }} minTickGap={24} />,
    <YAxis
      key="y"
      domain={domain ?? (kind === "bar" ? [0, "auto"] : ["auto", "auto"])}
      ticks={ticks}
      allowDecimals={kind === "line"}
      tick={axisTick}
      tickLine={false}
      axisLine={false}
      unit={unit}
    />,
    <Tooltip
      key="tooltip"
      formatter={(v) => [`${v}${unit}`, title]}
      cursor={{ fill: "#f5f5f5" }}
      contentStyle={{ border: "1px solid #111", borderRadius: 6, fontSize: 12 }}
    />,
    threshold && (
      <ReferenceLine
        key="threshold"
        y={threshold.value}
        stroke="#111"
        strokeDasharray="4 4"
        label={{ value: threshold.label, position: "insideTopRight", fontSize: 11, fill: "#111" }}
      />
    ),
  ];

  return (
    <figure style={{ margin: 0 }} className="section">
      <figcaption className="small" style={{ fontWeight: 600 }}>
        {title}
        {note && <span className="muted" style={{ fontWeight: 400 }}>（{note}）</span>}
      </figcaption>
      <div style={{ width: "100%", height: 200 }}>
        <ResponsiveContainer>
          {kind === "bar" ? (
            <BarChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
              {children}
              <Bar dataKey="value" fill="#111" isAnimationActive={false} />
            </BarChart>
          ) : (
            <LineChart data={points} margin={{ top: 8, right: 12, bottom: 0, left: 8 }}>
              {children}
              <Line type="linear" dataKey="value" connectNulls stroke="#111" strokeWidth={2} dot={{ r: 2, fill: "#111" }} isAnimationActive={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
      <details>
        <summary>数値で見る</summary>
        <div className="table-wrap" style={{ marginTop: 8, maxHeight: 240, overflowY: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>記録日</th>
                <th>{title}</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p, i) => (
                <tr key={i}>
                  <td>{p.date}</td>
                  <td>{p.value == null ? <span className="muted">{p.reason ?? UNKNOWN}</span> : `${p.value}${unit}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
