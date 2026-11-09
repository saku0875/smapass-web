// URLを貼ったときのプレビュー画像（FR-17）
import { renderOgImage } from "@/lib/card";
import { findDevice } from "@/lib/certificate-page";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "端末の履歴証明書";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const device = await findDevice((await params).id);
  if (!device) return new Response("Not Found", { status: 404 });
  return renderOgImage(device);
}
