import type { Metadata } from "next";
import Link from "next/link";
import { GradeBadge } from "@/components/GradeBadge";
import { GradeItems } from "@/components/GradeItems";
import { RecordBasis } from "@/components/RecordBasis";
import { StatusNotice } from "@/components/StatusNotice";
import { VerifyStatus } from "@/components/VerifyStatus";
import { loadCertificate } from "@/lib/certificate-page";
import { formatDate } from "@/lib/format";
import { findGaps } from "@/lib/records";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await loadCertificate((await params).id);
  const title = `${c.device.maker} ${c.device.model}（総合評価 ${c.grade.overall}）`;
  return { title, openGraph: { title, description: c.grade.summary } };
}

// 概要画面（FR-19）。QRコードとURLの飛び先で、スマホに詳しくない人でも結論だけ分かるようにする
export default async function CertificateOverviewPage({ params }: Props) {
  const c = await loadCertificate((await params).id);
  const gaps = findGaps(c.records);

  return (
    <>
      <StatusNotice certificate={c} />

      <section className="section w-half" style={{ gap: 18 }}>
        <div>
          <p className="small muted">{c.device.maker}</p>
          <h1>{c.device.model}</h1>
        </div>
        <GradeBadge grade={c.grade.overall} large />
        <p className="lead">{c.grade.summary}</p>
        <RecordBasis records={c.records} issuedAt={c.issuedAt} />
        {gaps.map((g) => (
          <p key={g.from} className="small notice">
            {formatDate(g.from)} 〜 {formatDate(g.to)}（{g.days}日間）は記録が途切れており、この間の使われ方は分かりません。
          </p>
        ))}
        <VerifyStatus id={c.id} simple />
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>この出品の端末か確かめる</h2>
        </div>
        <div className={`${c.listing ? "box-strong" : "box"} section`} style={{ gap: 10 }}>
          {c.listing ? (
            <p>いま見ている出品と同じか確かめてください。違う場合は、他人の証明書が使われている可能性があります。</p>
          ) : (
            <p>出品先は登録されていません。どの出品の証明書かは確かめられません。</p>
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
            <dd className="mono">末尾 {c.device.imeiLast4}</dd>
          </dl>
          <p className="small muted">IMEIは端末ごとの番号です。届いたら、電話アプリで *#06# と入力して末尾4桁を比べてください。</p>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>評価の内訳</h2>
        </div>
        <GradeItems items={c.grade.items} columns />
      </section>

      <section className="section" style={{ alignItems: "center", textAlign: "center" }}>
        <Link href={`/c/${c.id}/details`} className="button primary overview-cta">
          詳細を見る
        </Link>
        <p className="small muted">証明できるのは、記録されてから書き換えられていないことまでです。</p>
        <Link href="/about">証明書の読み方はこちら</Link>
      </section>
    </>
  );
}
