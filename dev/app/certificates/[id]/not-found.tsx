export default function CertificateNotFound() {
  return (
    <section className="section" style={{ gap: 20 }}>
      <h1>この証明書は見つからないか、非公開に設定されています</h1>
      <p>URLが途中で切れているか、書き換わっている可能性があります。出品者が証明書を非公開にしている場合も、この表示になります。</p>
      <ul className="small muted" style={{ margin: 0, paddingLeft: 20 }}>
        <li>URLをコピーして開いた場合は、最後まで貼り付けられているか確かめてください</li>
        <li>出品ページのリンクやQRコードから、もう一度開いてください</li>
        <li>それでも開けない場合は、出品者に確認してください</li>
      </ul>
    </section>
  );
}
