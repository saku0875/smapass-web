// URLを貼ったときのプレビュー画像（FR-17）
import { getCertificate } from "@/lib/backend";
import { renderOgImage } from "@/lib/card";
import { isValidId } from "@/lib/certificate-id";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "端末の履歴証明書";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certificate = isValidId(id) ? getCertificate(id) : undefined;
  if (!certificate) return new Response("Not Found", { status: 404 });
  return renderOgImage(certificate);
}
