import type { Metadata } from "next";
import { HIGH_TEMP_C, gradeLabels } from "@/lib/format";

export const metadata: Metadata = { title: "証明書の読み方" };

export default function AboutPage() {
  return (
    <>
      <section className="section">
        <h1>証明書の読み方</h1>
        <p>
          この証明書は、出品者のスマホに入れたアプリが定期的に記録した端末の状態（バッテリー・温度・起動回数など）をまとめたものです。
          証明書は、出品ページのリンクや出品画像のQRコードから開きます。開いたページのドメインが、カード画像に載っているドメインと同じか確かめてください。
        </p>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>評価の見方</h2>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>評価</th>
                <th>意味</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(gradeLabels).map(([g, label]) => (
                <tr key={g}>
                  <td>
                    <strong>{g}</strong>
                  </td>
                  <td>{label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small muted">
          評価はバッテリー・発熱・安定性の項目ごとにつけ、理由を文章で示しています。発熱は{HIGH_TEMP_C}
          ℃を超えた回数を目安にしています。評価の基準は運営者が決めたもので、ブロックチェーンで保証するものではありません。
        </p>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>改ざんの確かめ方</h2>
        </div>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>アプリは記録を取るたびに、その記録から「指紋」（ハッシュ）を作り、書き換えのできない公開の台帳（ブロックチェーン）に刻みます。</li>
          <li>証明書を開くと、あなたのブラウザが記録データから指紋を作り直します。</li>
          <li>台帳に刻まれた指紋と比べます。記録が1文字でも変わっていれば、指紋はまったく別の値になります。</li>
        </ol>
        <p className="small muted">
          運営者のサーバーに「大丈夫」と言わせるのではなく、あなたのブラウザで確かめるので、運営者を信用しなくても確認できます。
        </p>
      </section>

      <section className="section w-half" id="mismatch">
        <div className="section-head">
          <h2>検証結果の意味</h2>
        </div>
        <dl className="dl">
          <dt>✓ 一致</dt>
          <dd>記録されてから書き換えられていません。</dd>
          <dt>✕ 不一致</dt>
          <dd>
            台帳の指紋と合わない記録があります。記録が後から書き換えられた可能性があるため、この証明書の内容は信用しないでください。
          </dd>
          <dt>？ 照合できず</dt>
          <dd>通信の問題で確認できなかった状態です。改ざんが見つかったわけではありません。時間をおいて再試行してください。</dd>
        </dl>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>保証できること・できないこと</h2>
        </div>
        <div className="grid-2">
          <div className="box-strong">
            <h3>保証できる</h3>
            <ul className="small" style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              <li>記録されてから、記録データが書き換えられていないこと</li>
            </ul>
          </div>
          <div className="box">
            <h3>保証できない</h3>
            <ul className="small" style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              <li>計測値そのものが正しいこと（端末やアプリが細工された場合は防げません）</li>
              <li>記録が途切れていた期間の使われ方</li>
              <li>出品先（出品者の登録です）</li>
              <li>端末情報（IMEI・仕様）。改ざんの確認の対象に含まれていません</li>
              <li>評価の基準そのもの</li>
            </ul>
          </div>
        </div>
        <p className="small muted">
          ブロックチェーンはテストネット（Sepolia）を使っています。
        </p>
      </section>
    </>
  );
}
