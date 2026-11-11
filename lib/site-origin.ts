// 正規のドメイン（Origin）の決め方。QR・カード画像・コピー用URLに載せる。
// リクエストの Host ヘッダーからは決めない。偽の Host で別のドメイン入りのQRを作らせないため。
// Back の CORS_ORIGINS と同じく、設定した値だけを使い、設定が足りなければ拒否する。
// next.config.ts（ビルド・起動時の確認）とページの両方から使うので、ほかのモジュールに依存させない。

/** 開発中の既定値。Back の CORS_ORIGINS の既定値と同じ */
export const DEV_SITE_ORIGIN = "http://localhost:3000";

/**
 * SITE_ORIGIN を確かめて返す。Back の CORS_ORIGINS に入れる値と同じ形
 * （scheme・host・port だけ。末尾の / やパスは付けない）でなければエラーにする。
 * 本番では未設定を許さず、https に限る。
 */
export function resolveSiteOrigin(value: string | undefined, production: boolean): string {
  if (value == null || value === "") {
    if (production) throw new Error("SITE_ORIGIN が設定されていません。本番では正規のドメインを設定してください");
    return DEV_SITE_ORIGIN;
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`SITE_ORIGIN が URL として読めません: ${value}`);
  }
  if (url.origin !== value) {
    throw new Error(`SITE_ORIGIN は scheme・host・port だけにしてください（末尾の / やパスは付けない）: ${value}`);
  }
  if (production && url.protocol !== "https:") {
    throw new Error(`本番の SITE_ORIGIN は https にしてください: ${value}`);
  }
  return value;
}
