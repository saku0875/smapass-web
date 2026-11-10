import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice, GradePending } from "@/components/DemoNotice";
import { ImeiCheck } from "@/components/ImeiCheck";
import { RecordBasis } from "@/components/RecordBasis";
import { TrendChart } from "@/components/TrendChart";
import { VerifyStatus } from "@/components/VerifyStatus";
import { deviceLabel, loadDevice } from "@/lib/certificate-page";
import {
  HIGH_TEMP_C,
  THERMAL_LIMIT,
  UNKNOWN,
  formatBytesGb,
  formatDate,
  formatDateTime,
  withUnit,
} from "@/lib/format";
import {
  abnormalExits,
  bootsPerWeek,
  countHighTemp,
  fullChargeChange,
  known,
  longestInterval,
  maxOf,
  osHistory,
} from "@/lib/records";
import type { StatusRecord } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await loadDevice((await params).id);
  const { maker, model } = deviceLabel(d.spec);
  return { title: `${maker} ${model} の詳細`.trim() };
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="box">
      <p className="small muted">{label}</p>
      <p style={{ fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3 }}>{value}</p>
      {sub && <p className="small muted">{sub}</p>}
    </div>
  );
}

function SectionHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

/** 項目名と値の2列の仕様表 */
function SpecTable({ rows }: { rows: [string, string][] }) {
  return (
    <div className="table-wrap">
      <table>
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <th style={{ width: "36%" }}>{k}</th>
              <td style={{ whiteSpace: "normal" }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const shortDate = (iso: string) => formatDate(iso).slice(5);
const orUnknown = (v: string | number | null | undefined) => (v == null || v === "" ? UNKNOWN : String(v));
const yesNo = (v: boolean | null) => (v == null ? UNKNOWN : v ? "あり" : "なし");

export default async function CertificateDetailsPage({ params }: Props) {
  const d = await loadDevice((await params).id);
  const { maker, model } = deviceLabel(d.spec);
  const spec = d.spec;
  const latest = d.status;
  const records = d.history.items;
  const highTemp = countHighTemp(records);
  const fullCharge = fullChargeChange(records);
  const maxTemp = maxOf(records, "battery_temp_c");
  const maxHeadroom = maxOf(records, "thermal_headroom");
  const abnormal = abnormalExits(records);
  const osChanges = osHistory(records);
  const interval = longestInterval(records);
  // 表の行数を記録の件数にそろえるため、値が不明な記録も null のまま残す
  const point = (key: Parameters<typeof known>[1]) =>
    records.map((r) => ({ date: shortDate(r.collected_at), value: r[key] as number | null }));

  return (
    <>
      <DemoNotice isDemo={d.is_demo} />

      <Link href={`/certificates/${d.id}`} className="small">
        ← 概要に戻る
      </Link>

      {/* 結論 */}
      <section className="section w-2of3" style={{ gap: 18 }}>
        <div>
          {maker && <p className="small muted">{maker}</p>}
          <h1>{model}</h1>
        </div>
        <RecordBasis device={d} />
        <VerifyStatus id={d.id} />
      </section>

      {/* 届いた端末との照合 */}
      <section className="section w-1of3">
        <SectionHead title="届いた端末か確かめる" />
        <div className="box-strong">
          <ImeiCheck deviceId={d.id} />
        </div>
      </section>

      {/* 計測値の欄は 発熱→バッテリー→安定性→OS→ハードウェア→ディスプレイ の順（docs/screens.md）。
          2段組みの幅でも順番が入れ替わらないよう、広い欄には md-half を付ける */}

      {/* 発熱 */}
      <section className="section w-2of3 md-half">
        <SectionHead title="発熱" />
        <div className="grid-3">
          <Stat label="最高温度" value={withUnit(maxTemp, "℃")} />
          <Stat
            label={`${HIGH_TEMP_C}℃を超えた回数`}
            value={`${highTemp.count}回`}
            sub={`温度が分かる${highTemp.of}回の記録のうち`}
          />
          <Stat
            label="熱的余裕の最大値"
            value={withUnit(maxHeadroom, "", 2)}
            sub={`${THERMAL_LIMIT.toFixed(1)}で性能制限の目安`}
          />
        </div>
        <div className="charts">
          <TrendChart
            title="バッテリー温度"
            unit="℃"
            points={point("battery_temp_c")}
            domain={[20, 55]}
            ticks={[20, 30, 40, 50]}
            threshold={{ value: HIGH_TEMP_C, label: `高温の目安 ${HIGH_TEMP_C}℃` }}
          />
          <TrendChart
            title="熱的余裕"
            unit=""
            points={point("thermal_headroom")}
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            threshold={{ value: THERMAL_LIMIT, label: "性能制限の目安" }}
            note="0〜1。1に近いほど熱で性能が制限されやすい状態"
          />
        </div>
      </section>

      {/* バッテリー */}
      <section className="section w-1of3">
        <SectionHead title="バッテリー">
          {latest && <span className="small muted">{formatDate(latest.collected_at)} 計測</span>}
        </SectionHead>
        <div className="grid-3">
          <Stat label="推定残量（最新）" value={withUnit(latest?.battery_charge_mah ?? null, " mAh")} />
          <Stat
            label="推定満充電容量（最新）"
            value={withUnit(latest?.battery_full_charge_mah ?? null, " mAh")}
            sub={
              fullCharge
                ? `記録開始時（${fullCharge.first.toLocaleString("ja-JP")} mAh）から${fullCharge.pct > 0 ? "+" : ""}${fullCharge.pct}%`
                : undefined
            }
          />
          <Stat label="充電サイクル数" value={withUnit(latest?.battery_cycle_count ?? null, "回")} />
        </div>
        <TrendChart
          title="推定満充電容量"
          unit="mAh"
          points={point("battery_full_charge_mah")}
          note="満充電したときに蓄えられる量。減るほど劣化しています"
        />
      </section>

      {/* 安定性 */}
      <section className="section w-2of3 md-half">
        <SectionHead title="安定性" />
        <div className="grid-3">
          <Stat label="累計起動回数" value={withUnit(latest?.boot_count ?? null, "回")} />
          <Stat
            label="異常終了があった記録"
            value={`${abnormal.yes.length}回`}
            sub={`${records.length}回の記録のうち${abnormal.unknown > 0 ? `（${abnormal.unknown}回は不明）` : ""}`}
          />
        </div>
        {abnormal.yes.length > 0 ? (
          <div className="notice">
            <span className="notice-title">異常終了がありました</span>
            <p className="small">
              {abnormal.yes.map((r) => formatDate(r.collected_at)).join("、")} の記録で、前回の記録以降に異常終了がありました。
            </p>
          </div>
        ) : (
          <p className="small muted">
            {abnormal.unknown > 0 ? "異常終了が分かっている記録はありません。" : "異常終了の記録はありません。"}
          </p>
        )}
        <TrendChart
          title="1週間あたりの起動回数"
          unit="回"
          kind="bar"
          points={bootsPerWeek(records).map((b) => ({ date: shortDate(b.collected_at), value: b.perWeek, reason: b.reason }))}
          note="前回の記録からの回数を1週間あたりに直した値"
        />
      </section>

      {/* OS。最新の値（spec の OS/SDK は最新の状態計測の値）と、変わった記録 */}
      <section className="section w-1of3">
        <SectionHead title="OS" />
        <SpecTable
          rows={[
            ["Androidバージョン", orUnknown(spec?.os_version ?? latest?.os_version)],
            ["APIレベル", orUnknown(spec?.sdk_int ?? latest?.sdk_int)],
          ]}
        />
        <p className="small" style={{ fontWeight: 600 }}>
          更新履歴
        </p>
        {osChanges.length > 0 ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>記録日</th>
                  <th>Androidバージョン</th>
                  <th>APIレベル</th>
                </tr>
              </thead>
              <tbody>
                {osChanges.map((r, i) => (
                  <tr key={r.sequence}>
                    <td>
                      {formatDate(r.collected_at)}
                      {i === 0 && <span className="small muted">（記録開始）</span>}
                    </td>
                    <td>{r.os_version}</td>
                    <td>{r.sdk_int}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="small muted">記録がありません。</p>
        )}
      </section>

      {/* ハードウェア（たまにしか変わらない値） */}
      <section className="section w-1of3">
        <SectionHead title="ハードウェア">
          {spec && <span className="small muted">{formatDate(spec.collected_at)} 取得</span>}
        </SectionHead>
        {spec ? (
          <SpecTable
            rows={[
              ["メーカー", spec.manufacturer],
              ["モデル", spec.model],
              ["端末名", orUnknown(spec.device_name)],
              ["SoC", orUnknown(spec.soc)],
              ["CPUコア数", withUnit(spec.cpu_cores, "コア")],
              ["RAM", formatBytesGb(spec.ram_bytes)],
              ["ストレージ", formatBytesGb(spec.storage_bytes)],
            ]}
          />
        ) : (
          <p className="box small">端末情報はまだ届いていません。</p>
        )}
      </section>

      {/* ディスプレイ */}
      <section className="section w-1of3">
        <SectionHead title="ディスプレイ">
          {spec && <span className="small muted">{formatDate(spec.collected_at)} 取得</span>}
        </SectionHead>
        {spec ? (
          <SpecTable
            rows={[
              ["画面サイズ", withUnit(spec.screen_size_inch, "インチ")],
              ["画面密度", withUnit(spec.screen_density_dpi, " dpi")],
            ]}
          />
        ) : (
          <p className="box small">端末情報はまだ届いていません。</p>
        )}
      </section>

      {/* 評価の根拠 */}
      <section className="section w-1of3">
        <SectionHead title="評価の根拠" />
        <GradePending />
      </section>

      {/* 記録の一覧 */}
      <section className="section">
        <SectionHead title="記録の一覧" />
        {interval && (
          <p className="small muted">
            記録の間隔が最も空いたのは {formatDate(interval.from)} 〜 {formatDate(interval.to)}（{interval.days}日間）です。
            記録が途切れたかどうかの判定はまだ行っていません。
          </p>
        )}
        <details>
          <summary>すべての記録を表で見る（{records.length}件）</summary>
          <div className="table-wrap" style={{ marginTop: 8, maxHeight: 420, overflowY: "auto" }}>
            <table className="compact">
              <thead>
                <tr>
                  <th>連番</th>
                  <th>計測日時</th>
                  <th>温度</th>
                  <th>熱的余裕</th>
                  <th>推定残量</th>
                  <th>推定満充電容量</th>
                  <th>充電サイクル数</th>
                  <th>起動回数</th>
                  <th>異常終了</th>
                  <th>Androidバージョン</th>
                  <th>APIレベル</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r: StatusRecord) => (
                  <tr key={r.sequence}>
                    <td>{r.sequence}</td>
                    <td>{formatDateTime(r.collected_at)}</td>
                    <td>{withUnit(r.battery_temp_c, "℃")}</td>
                    <td>{withUnit(r.thermal_headroom, "", 2)}</td>
                    <td>{withUnit(r.battery_charge_mah, " mAh")}</td>
                    <td>{withUnit(r.battery_full_charge_mah, " mAh")}</td>
                    <td>{withUnit(r.battery_cycle_count, "回")}</td>
                    <td>{orUnknown(r.boot_count)}</td>
                    <td>{yesNo(r.had_abnormal_exit)}</td>
                    <td>{r.os_version}</td>
                    <td>{r.sdk_int}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      {/* 整備記録 */}
      <section className="section w-1of3">
        <SectionHead title="整備記録">
          <span className="tag strong">事業者の記録</span>
        </SectionHead>
        <p className="box small">整備記録の表示は準備中です。</p>
        <p className="small muted">
          整備記録は修理業者などの事業者が記録したもので、アプリが自動で取った記録とは別です。
        </p>
      </section>

      {/* 注意事項 */}
      <section className="section w-2of3 md-half">
        <SectionHead title="注意事項" />
        <ul className="small" style={{ margin: 0, paddingLeft: 20 }}>
          <li>表示しているのは最後に届いた記録までの内容で、リアルタイムの端末の状態ではありません。</li>
          <li>計測値そのものの正しさは保証しません。</li>
          <li>「不明」は端末から値が取れなかった項目です。異常がなかったという意味ではありません。</li>
          <li>記録の間隔が空いた期間の使われ方は分かりません。</li>
          <li>記録はまだブロックチェーンに記録していないため、改ざんがないことはまだ確かめられません。</li>
        </ul>
        <Link href="/about" className="small">
          証明書の読み方を見る →
        </Link>
      </section>
    </>
  );
}
