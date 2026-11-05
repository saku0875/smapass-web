import type { Metadata } from "next";
import Link from "next/link";
import { GradeBadge } from "@/components/GradeBadge";
import { GradeItems } from "@/components/GradeItems";
import { RecordBasis } from "@/components/RecordBasis";
import { StatusNotice } from "@/components/StatusNotice";
import { TrendChart } from "@/components/TrendChart";
import { VerifyStatus } from "@/components/VerifyStatus";
import { loadCertificate } from "@/lib/certificate-page";
import { HIGH_TEMP_C, THERMAL_LIMIT, formatDate, formatDateTime, formatGb } from "@/lib/format";
import {
  bootsPerWeek,
  countHighTemp,
  estimatedMaxChangePct,
  findGaps,
  osHistory,
} from "@/lib/records";
import type { RecordData } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await loadCertificate((await params).id);
  return { title: `${c.device.maker} ${c.device.model} の詳細` };
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

const shortDate = (iso: string) => formatDate(iso).slice(5);

export default async function CertificatePage({ params }: Props) {
  const c = await loadCertificate((await params).id);
  const d = c.device;
  const records = c.records;
  const first = records[0];
  const latest = records.at(-1)!;
  const gaps = findGaps(records);
  const highTemp = countHighTemp(records);
  const maxChange = estimatedMaxChangePct(records);
  const maxTemp = Math.max(...records.map((r) => r.batteryTempC));
  const maxHeadroom = Math.max(...records.map((r) => r.thermalHeadroom));
  const abnormal = records.filter((r) => r.abnormalShutdown);
  const osChanges = osHistory(records);
  const point = (value: (r: RecordData) => number) => records.map((r) => ({ date: shortDate(r.recordedAt), value: value(r) }));

  return (
    <>
      <StatusNotice certificate={c} />

      <Link href={`/c/${c.id}`} className="small">
        ← 概要に戻る
      </Link>

      {/* 結論 */}
      <section className="section w-2of3" style={{ gap: 18 }}>
        <div>
          <p className="small muted">{d.maker}</p>
          <h1>{d.model}</h1>
        </div>
        <div className="row" style={{ gap: 20 }}>
          <GradeBadge grade={c.grade.overall} large />
          <p style={{ flex: "1 1 240px" }}>{c.grade.summary}</p>
        </div>
        <RecordBasis records={records} issuedAt={c.issuedAt} />
        <VerifyStatus id={c.id} />
      </section>

      {/* 出品との照合 */}
      <section className="section w-1of3">
        <SectionHead title="出品との照合" />
        <div className={`${c.listing ? "box-strong" : "box"} section`} style={{ gap: 10 }}>
          {c.listing ? (
            <p className="small">いま開いている出品と同じか確かめてください。違う場合は、他人の証明書が使われている可能性があります。</p>
          ) : (
            <p className="small">出品先は登録されていません。この証明書がどの出品のものかは確かめられません。</p>
          )}
          <dl className="dl">
            {c.listing && (
              <>
                <dt>出品先</dt>
                <dd>{c.listing.marketplace}</dd>
                <dt>商品ID</dt>
                <dd className="mono">{c.listing.itemId}</dd>
              </>
            )}
            <dt>IMEI</dt>
            <dd className="mono">末尾 {d.imeiLast4}</dd>
          </dl>
          <p className="small muted">届いた端末のIMEI（ダイヤルで *#06# と入力すると表示されます）の末尾4桁が一致するかも確かめてください。</p>
        </div>
      </section>

      {/* 端末情報（たまにしか変わらない値） */}
      <section className="section w-1of3">
        <SectionHead title="端末情報">
          <span className="small muted">{formatDate(d.acquiredAt)} 取得</span>
        </SectionHead>
        <div className="table-wrap">
          <table>
            <tbody>
              {[
                ["メーカー", d.maker],
                ["モデル", d.model],
                ["端末名", d.deviceName],
                ["SoC", d.soc],
                ["CPUコア数", `${d.cpuCores}コア`],
                ["RAM", formatGb(d.ramMb / 1024)],
                ["ストレージ", formatGb(d.storageGb)],
                ["画面", `${d.screenSizeInch}インチ・${d.screenDensityDpi} dpi`],
                ["Android", `${latest.androidVersion}（SDK ${latest.sdkInt}）`],
              ].map(([k, v]) => (
                <tr key={k}>
                  <th style={{ width: "36%" }}>{k}</th>
                  <td style={{ whiteSpace: "normal" }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* バッテリー */}
      <section className="section w-1of3">
        <SectionHead title="バッテリー" />
        <div className="grid-3">
          <Stat label="推定最大電荷（最新）" value={`${latest.estimatedMaxMah.toLocaleString()} mAh`} />
          <Stat
            label="記録開始時からの変化"
            value={`${maxChange > 0 ? "+" : ""}${maxChange}%`}
            sub={`${first.estimatedMaxMah.toLocaleString()} mAh から`}
          />
          <Stat label="充放電サイクル" value={`${latest.batteryCycleCount}回`} />
        </div>
        <TrendChart
          title="推定最大電荷"
          unit="mAh"
          points={point((r) => r.estimatedMaxMah)}
          note="満充電したときに蓄えられる量。減るほど劣化しています"
        />
      </section>

      {/* 発熱 */}
      <section className="section w-2of3">
        <SectionHead title="発熱" />
        <div className="grid-3">
          <Stat label="最高温度" value={`${maxTemp}℃`} />
          <Stat label={`${HIGH_TEMP_C}℃を超えた回数`} value={`${highTemp}回`} sub={`${records.length}回の記録のうち`} />
          <Stat label="熱的余裕の最大値" value={maxHeadroom.toFixed(2)} sub={`${THERMAL_LIMIT.toFixed(1)}で性能制限の目安`} />
        </div>
        <div className="charts">
        <TrendChart
          title="バッテリー温度"
          unit="℃"
          points={point((r) => r.batteryTempC)}
          domain={[20, 55]}
          ticks={[20, 30, 40, 50]}
          threshold={{ value: HIGH_TEMP_C, label: `高温の目安 ${HIGH_TEMP_C}℃` }}
        />
        <TrendChart
          title="熱的余裕"
          unit=""
          points={point((r) => r.thermalHeadroom)}
          domain={[0, 1]}
          ticks={[0, 0.25, 0.5, 0.75, 1]}
          threshold={{ value: THERMAL_LIMIT, label: "性能制限の目安" }}
          note="0〜1。1に近いほど熱で性能が制限されやすい状態"
        />
        </div>
      </section>

      {/* 安定性 */}
      <section className="section w-2of3">
        <SectionHead title="安定性" />
        <div className="grid-3">
          <Stat label="累計起動回数" value={`${latest.bootCount}回`} />
          <Stat label="異常終了があった記録" value={`${abnormal.length}回`} sub={`${records.length}回の記録のうち`} />
        </div>
        {abnormal.length > 0 ? (
          <div className="notice">
            <span className="notice-title">異常終了がありました</span>
            <p className="small">
              {abnormal.map((r) => formatDate(r.recordedAt)).join("、")} の記録で、前回の記録以降に異常終了がありました。
            </p>
          </div>
        ) : (
          <p className="small muted">異常終了の記録はありません。</p>
        )}
        <TrendChart
          title="1週間あたりの起動回数"
          unit="回"
          kind="bar"
          points={bootsPerWeek(records).map((b) => ({ date: shortDate(b.recordedAt), value: b.perWeek }))}
          note="前回の記録からの回数を1週間あたりに直した値"
        />
      </section>

      {/* ソフトウェア */}
      <section className="section w-1of3">
        <SectionHead title="OSの更新履歴" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>記録日</th>
                <th>Android</th>
                <th>SDK</th>
              </tr>
            </thead>
            <tbody>
              {osChanges.map((r, i) => (
                <tr key={r.recordedAt}>
                  <td>
                    {formatDate(r.recordedAt)}
                    {i === 0 && <span className="small muted">（記録開始）</span>}
                  </td>
                  <td>{r.androidVersion}</td>
                  <td>{r.sdkInt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 評価の根拠 */}
      <section className="section w-1of3">
        <SectionHead title="評価の根拠" />
        <GradeItems items={c.grade.items} />
      </section>

      {/* 記録の一覧 */}
      <section className="section">
        <SectionHead title="記録の一覧" />
        {gaps.length > 0 ? (
          <div className="notice">
            <span className="notice-title">記録が途切れた期間があります</span>
            {gaps.map((g) => (
              <p key={g.from} className="small">
                {formatDate(g.from)} 〜 {formatDate(g.to)}（{g.days}日間）：この期間の使われ方は分かりません。
              </p>
            ))}
          </div>
        ) : (
          <p className="small muted">記録は途切れずに続いています。</p>
        )}
        <details>
          <summary>すべての記録を表で見る（{records.length}件）</summary>
          <div className="table-wrap" style={{ marginTop: 8, maxHeight: 420, overflowY: "auto" }}>
            <table className="compact">
              <thead>
                <tr>
                  <th>記録日時</th>
                  <th>Android</th>
                  <th>温度</th>
                  <th>充放電サイクル回数</th>
                  <th>残り電荷</th>
                  <th>推定最大電荷</th>
                  <th>起動回数</th>
                  <th>異常終了</th>
                  <th>熱的余裕</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.recordedAt}>
                    <td>{formatDateTime(r.recordedAt)}</td>
                    <td>
                      {r.androidVersion}（{r.sdkInt}）
                    </td>
                    <td>{r.batteryTempC}℃</td>
                    <td>{r.batteryCycleCount}回</td>
                    <td>{r.chargeCounterMah.toLocaleString()} mAh</td>
                    <td>{r.estimatedMaxMah.toLocaleString()} mAh</td>
                    <td>{r.bootCount}</td>
                    <td>{r.abnormalShutdown ? "あり" : "なし"}</td>
                    <td>{r.thermalHeadroom.toFixed(2)}</td>
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
        {c.maintenance.length > 0 ? (
          c.maintenance.map((m) => (
            <div key={m.performedAt} className="box" style={{ borderStyle: "dashed", borderColor: "#111" }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <strong>{m.recorder.name}</strong>
                <span className="tag">{m.recorder.kind}</span>
              </div>
              <p className="small muted">{formatDateTime(m.performedAt)}</p>
              <p style={{ marginTop: 6 }}>{m.content}</p>
            </div>
          ))
        ) : (
          <p className="muted">整備記録はありません。</p>
        )}
        <p className="small muted">
          整備記録は修理業者などの事業者が記録したもので、アプリが自動で取った記録とは別です。
        </p>
      </section>

      {/* 注意事項 */}
      <section className="section w-2of3 md-half">
        <SectionHead title="注意事項" />
        <ul className="small" style={{ margin: 0, paddingLeft: 20 }}>
          <li>証明できるのは「記録されてから書き換えられていないこと」までです。計測値そのものの正しさは保証しません。</li>
          <li>記録が途切れた期間の使われ方は分かりません。</li>
          <li>出品先は出品者の登録によるもので、ブロックチェーンには記録していません。</li>
          <li>端末情報（IMEI・仕様）は、改ざんの確認の対象に含まれていません。</li>
          <li>ブロックチェーンはテストネット（Sepolia）を使っています。</li>
        </ul>
        <Link href="/about" className="small">
          証明書の読み方を見る →
        </Link>
      </section>
    </>
  );
}
