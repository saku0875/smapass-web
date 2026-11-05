import Link from "next/link";
import { demoCertificates } from "@/lib/backend";

export default function TopPage() {
  return (
    <>
      <section className="section" style={{ gap: 20 }}>
        <h1>中古スマホの使われ方を、証明書で確かめる</h1>
        <p className="muted">
          出品者のスマホに入れたアプリが、バッテリーや温度を定期的に記録します。
          その記録を証明書にして、記録が改ざんされていないかを買い手のブラウザで確かめられます。
        </p>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>証明書の開き方</h2>
        </div>
        <div className="grid-2">
          <div className="box">
            <h3>リンクを押す</h3>
            <p className="small muted">商品ページや説明文にある証明書のリンクを押すと開きます。</p>
          </div>
          <div className="box">
            <h3>QRコードを読む</h3>
            <p className="small muted">出品画像のQRコードを、別の端末のカメラで読み取ると開きます。</p>
          </div>
        </div>
        <Link href="/about" className="small">
          証明書の読み方を見る →
        </Link>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>デモ用の証明書</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>機種</th>
                <th>見どころ</th>
                <th>出品者向け</th>
              </tr>
            </thead>
            <tbody>
              {demoCertificates.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link href={`/c/${d.id}`}>{d.label}</Link>
                  </td>
                  <td>{d.note}</td>
                  <td>
                    <Link href={`/c/${d.id}/share`}>出品用素材</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
