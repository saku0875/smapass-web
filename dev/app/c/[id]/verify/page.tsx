import type { Metadata } from "next";
import Link from "next/link";
import { VerifyDetail } from "@/components/VerifyDetail";
import { loadCertificate } from "@/lib/certificate-page";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "検証の詳細" };

export default async function VerifyPage({ params }: Props) {
  const c = await loadCertificate((await params).id);

  return (
    <>
      <section className="section">
        <p className="small muted">{c.device.maker} {c.device.model}</p>
        <h1>検証の詳細</h1>
        <p>
          記録ごとに、このブラウザで計算したハッシュ（記録の指紋）と、ブロックチェーンに刻まれたハッシュを並べています。
          1文字でも書き換えられていれば、ハッシュはまったく別の値になります。
        </p>
      </section>

      <VerifyDetail id={c.id} />

      <section className="section">
        <div className="section-head">
          <h2>自分で確かめるには</h2>
        </div>
        <ol className="small" style={{ margin: 0, paddingLeft: 20 }}>
          <li>各行の「JSON」から、正規化済みの記録データを保存します。</li>
          <li>保存したファイルのSHA-256を計算すると、「ブラウザで計算したハッシュ」と同じ値になります。</li>
          <li>トランザクションのリンクから、Etherscan（Sepolia）でチェーン上の値を確かめます。</li>
        </ol>
        <Link href={`/c/${c.id}/details`} className="small">
          ← 詳細に戻る
        </Link>
      </section>
    </>
  );
}
