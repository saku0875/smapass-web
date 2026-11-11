import type { Metadata } from "next";
import Link from "next/link";
import { DemoNotice, GradePending } from "@/components/DemoNotice";
import { ImeiCheck } from "@/components/ImeiCheck";
import { RecordBasis } from "@/components/RecordBasis";
import { VerifyStatus } from "@/components/VerifyStatus";
import { deviceLabel, loadDevice } from "@/lib/certificate-page";
import { formatDate } from "@/lib/format";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const d = await loadDevice((await params).id);
  const { maker, model } = deviceLabel(d.spec);
  const title = `${maker} ${model}`.trim();
  const description = d.last_collected_at ? `最終計測 ${formatDate(d.last_collected_at)}` : "まだ記録がありません";
  return { title, openGraph: { title, description } };
}

// 概要画面（FR-19）。QRコードとURLの飛び先で、スマホに詳しくない人でも結論だけ分かるようにする
export default async function CertificateOverviewPage({ params }: Props) {
  const d = await loadDevice((await params).id);
  const { maker, model } = deviceLabel(d.spec);

  return (
    <>
      <DemoNotice isDemo={d.is_demo} />

      {/* 結論。PCでは「機種」「最終計測と記録期間」「検証結果」を横に並べる */}
      <section className="overview-hero">
        <div className="section" style={{ gap: 14 }}>
          <div>
            {maker && <p className="small muted">{maker}</p>}
            <h1>{model}</h1>
          </div>
        </div>
        <div className="section" style={{ gap: 12 }}>
          <RecordBasis device={d} />
        </div>
        <div>
          <VerifyStatus id={d.id} simple />
        </div>
      </section>

      {/* スマホでは照合→評価の順に縦に並べ、PCでは評価を左、照合を右の同じ段に並べる */}
      <div className="overview-pair">
        <section className="section overview-check">
          <div className="section-head">
            <h2>届いた端末か確かめる</h2>
          </div>
          <div className="box-strong overview-fill">
            <ImeiCheck deviceId={d.id} />
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>評価</h2>
          </div>
          <GradePending fill />
          <Link href="/about#grade" className="small">
            どんな観点で評価するか
          </Link>
        </section>
      </div>

      {/* 次の行動。スマホではボタンを先に出す */}
      <section className="overview-actions">
        <div className="section" style={{ gap: 4 }}>
          <p className="small muted">記録はまだブロックチェーンに記録されていないため、書き換えられていないことはまだ証明できません。</p>
          <Link href="/about" className="small">
            証明書の読み方はこちら
          </Link>
        </div>
        <Link href={`/certificates/${d.id}/details`} className="button primary overview-cta">
          詳細を見る
        </Link>
      </section>
    </>
  );
}
