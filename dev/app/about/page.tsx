import type { Metadata } from "next";
import { HIGH_TEMP_C } from "@/lib/format";

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
          <h2>表示している内容</h2>
        </div>
        <p>
          証明書のページには、端末から最後に届いた記録までの内容と、これまでのすべての記録を表示します。
          新しい記録が届くたびに、同じURLのまま内容が更新されます。リアルタイムの端末の状態ではないので、「最終計測」の日時を確かめてください。
        </p>
        <p className="small muted">
          端末から値が取れなかった項目は「不明」と表示します。異常がなかったという意味ではありません。
          バッテリー・発熱・安定性の評価は準備中です。発熱は{HIGH_TEMP_C}℃を超えた回数を目安として表示しています。
        </p>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>届いた端末か確かめる</h2>
        </div>
        <p>
          届いた端末の電話アプリで *#06# と入力するとIMEI（端末ごとの番号）が表示されます。証明書のページに入力すると、その証明書の端末かどうかを確かめられます。
        </p>
        <p className="small muted">入力したIMEIはページには保存せず、照合にだけ使います。</p>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>改ざんの確かめ方</h2>
        </div>
        <p>
          証明書を開くと、あなたのブラウザが記録データを確かめ、結果を「一致」「不一致」「照合できず」のどれかで表示します。
        </p>
      </section>

      <section className="section w-half" id="mismatch">
        <div className="section-head">
          <h2>検証結果の意味</h2>
        </div>
        <dl className="dl">
          <dt>✓ 一致</dt>
          <dd>記録されてから書き換えられていません。ブロックチェーンとの照合ができるようになってから表示します。</dd>
          <dt>✕ 不一致</dt>
          <dd>
            指紋や記録どうしのつながりが合わない記録があります。記録が後から書き換えられた可能性があるため、この証明書の内容は信用しないでください。
          </dd>
          <dt>？ 照合できず</dt>
          <dd>
            通信の問題で確認できなかった状態です。記録がまだブロックチェーンに記録されていない場合もこの表示になります。改ざんが見つかったわけではありません。
          </dd>
        </dl>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>確かめられること・保証できないこと</h2>
        </div>
        <div className="grid-2">
          <div className="box-strong">
            <h3>今、確かめられる</h3>
            <ul className="small" style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              <li>記録データと、保存されている指紋が合っていること</li>
              <li>記録どうしのつながりに食い違いがないこと</li>
            </ul>
          </div>
          <div className="box">
            <h3>保証できない</h3>
            <ul className="small" style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              <li>記録されてから書き換えられていないこと（ブロックチェーンに記録されるようになるまでは確かめられません）</li>
              <li>計測値そのものが正しいこと（端末やアプリが細工された場合は防げません）</li>
              <li>記録の間隔が空いた期間の使われ方</li>
              <li>いまの端末の状態（表示は最後に届いた記録までです）</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
