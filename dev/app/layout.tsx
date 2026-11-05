import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "smapass", template: "%s | smapass" },
  description: "中古スマホの使用履歴を証明書にして、記録が改ざんされていないかを確かめられるサービス",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            smapass
            <small>端末の履歴証明書</small>
          </Link>
        </header>
        <main className="main">
          <div className="content">{children}</div>
        </main>
      </body>
    </html>
  );
}
