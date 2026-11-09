import "server-only";
import { headers } from "next/headers";

/** 本番は固定のドメインにする。プロトタイプではアクセスされたホストを使う */
export async function getOrigin() {
  if (process.env.SITE_ORIGIN) return process.env.SITE_ORIGIN.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** QR・カード画像・コピー用URLに載せる証明書のURL（decisions/0013） */
export function certificateUrl(origin: string, deviceId: string) {
  return `${origin}/certificates/${deviceId}`;
}
