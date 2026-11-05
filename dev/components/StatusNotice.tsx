import Link from "next/link";
import { formatDateTime } from "@/lib/format";
import type { Certificate } from "@/lib/types";

/** 失効・再発行済みの警告。内容より上に出す（FR-07） */
export function StatusNotice({ certificate }: { certificate: Certificate }) {
  if (certificate.status === "reissued") {
    return (
      <div className="notice inverted" role="alert">
        <span className="notice-title">この証明書は再発行されています</span>
        <p className="small">内容は古い時点のものです。最新の証明書を確認してください。</p>
        {certificate.successorId && (
          <Link href={`/c/${certificate.successorId}`} className="small" style={{ color: "inherit" }}>
            新しい証明書を開く →
          </Link>
        )}
      </div>
    );
  }
  if (certificate.status === "revoked") {
    return (
      <div className="notice inverted" role="alert">
        <span className="notice-title">この証明書は失効しています</span>
        <p className="small">
          {certificate.revokedAt && `${formatDateTime(certificate.revokedAt)}に失効しました。`}
          出品の根拠としては使えません。参考として内容を表示しています。
        </p>
      </div>
    );
  }
  return null;
}
