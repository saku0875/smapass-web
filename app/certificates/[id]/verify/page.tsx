import type { Metadata } from "next";
import Link from "next/link";
import { VerifyDetail } from "@/components/VerifyDetail";
import { deviceLabel, loadDevice } from "@/lib/certificate-page";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "検証の詳細" };

export default async function VerifyPage({ params }: Props) {
  const d = await loadDevice((await params).id);
  const { maker, model } = deviceLabel(d.spec);

  return (
    <>
      <section className="section">
        <p className="small muted">
          {maker} {model}
        </p>
        <h1>検証の詳細</h1>
        <p>
          記録ごとに、このブラウザで計算したハッシュ（記録の指紋）と、サーバーに保存されているハッシュを並べています。
          1文字でも書き換えられていれば、ハッシュはまったく別の値になります。各記録は1つ前の記録のハッシュを含むので、途中の記録を消したり差し替えたりしても分かります。
        </p>
        <p className="small muted">
          ブロックチェーンとの照合はまだできません。記録がまだブロックチェーンに記録されていないためで、それまでは「改ざんなし」とは表示しません。
        </p>
      </section>

      <VerifyDetail id={d.id} />

      <section className="section">
        <div className="section-head">
          <h2>自分で確かめるには</h2>
        </div>
        <ol className="small" style={{ margin: 0, paddingLeft: 20 }}>
          <li>各行の「JSON」から、署名の対象になった記録データ（canonical_payload）をそのまま保存します。</li>
          <li>保存したファイルのSHA-256を計算すると、「ブラウザで計算したハッシュ」と同じ値になります。</li>
        </ol>
        <Link href={`/certificates/${d.id}/details`} className="small">
          ← 詳細に戻る
        </Link>
      </section>
    </>
  );
}
