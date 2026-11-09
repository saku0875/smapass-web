"use client";

// 429・5xx・通信エラーなど。「見つからない」や検証の「不一致」とは別の表示にする
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section">
      <h1>一時的に表示できません</h1>
      <p>
        通信の問題が起きているか、サーバーが混み合っている可能性があります。証明書に問題が見つかったわけではありません。時間をおいて再読み込みしてください。
      </p>
      <div>
        <button type="button" className="button primary" onClick={reset}>
          再読み込み
        </button>
      </div>
    </section>
  );
}
