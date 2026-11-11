import { resolveSiteOrigin } from "./lib/site-origin";

// サーバーの起動時に1回だけ呼ばれる。本番で正規のドメイン（SITE_ORIGIN）が正しく設定されていなければ起動させない。
// next.config.ts では確かめない。`next typegen` も本番ビルドと同じ phase で設定を読むため、型の生成まで止まってしまう
export function register() {
  if (process.env.NODE_ENV === "production") resolveSiteOrigin(process.env.SITE_ORIGIN, true);
}
