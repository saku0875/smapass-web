export default function CertificateNotFound() {
  return (
    <section className="section" style={{ gap: 20 }}>
      <h1>証明書が見つかりません</h1>
      <p>URLが途中で切れているか、書き換わっている可能性があります。</p>
      <ul className="small muted" style={{ margin: 0, paddingLeft: 20 }}>
        <li>URLをコピーして開いた場合は、最後まで貼り付けられているか確かめてください</li>
        <li>出品ページのリンクやQRコードから、もう一度開いてください</li>
      </ul>
    </section>
  );
}
