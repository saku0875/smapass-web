import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <h1>ページが見つかりません</h1>
      <Link href="/">トップに戻る</Link>
    </section>
  );
}
