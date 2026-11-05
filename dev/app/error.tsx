"use client";

// 通信エラーなど。検証の「照合できず」とは別の表示にする
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="section">
      <h1>ページを表示できませんでした</h1>
      <p>通信の問題が起きている可能性があります。時間をおいて再読み込みしてください。</p>
      <div>
        <button type="button" className="button primary" onClick={reset}>
          再読み込み
        </button>
      </div>
    </section>
  );
}
