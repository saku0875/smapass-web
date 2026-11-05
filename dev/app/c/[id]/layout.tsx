import type { Metadata } from "next";

// 証明書ページは検索エンジンに載せない（NFR-05）
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function CertificateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
