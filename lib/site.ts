import "server-only";
import { resolveSiteOrigin } from "./site-origin";

/** 正規のドメイン。SITE_ORIGIN だけから決める（lib/site-origin.ts） */
export function getOrigin() {
  return resolveSiteOrigin(process.env.SITE_ORIGIN, process.env.NODE_ENV === "production");
}

/** QR・カード画像・コピー用URLに載せる証明書のURL（decisions/0013） */
export function certificateUrl(origin: string, deviceId: string) {
  return `${origin}/certificates/${deviceId}`;
}
