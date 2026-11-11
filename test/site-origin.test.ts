// 正規のドメイン（SITE_ORIGIN）の確認。Back の CORS_ORIGINS と同じ形だけを受け付ける
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEV_SITE_ORIGIN, resolveSiteOrigin } from "../lib/site-origin.ts";

test("開発中は未設定なら localhost:3000、本番は未設定ならエラー", () => {
  assert.equal(resolveSiteOrigin(undefined, false), DEV_SITE_ORIGIN);
  assert.equal(resolveSiteOrigin("", false), DEV_SITE_ORIGIN);
  assert.throws(() => resolveSiteOrigin(undefined, true));
  assert.throws(() => resolveSiteOrigin("", true));
});

test("scheme・host・port だけを受け付ける", () => {
  assert.equal(resolveSiteOrigin("https://smapass.example", true), "https://smapass.example");
  assert.equal(resolveSiteOrigin("http://localhost:3000", false), "http://localhost:3000");
  assert.throws(() => resolveSiteOrigin("https://smapass.example/", true));
  assert.throws(() => resolveSiteOrigin("https://smapass.example/certificates", true));
  assert.throws(() => resolveSiteOrigin("smapass.example", false));
});

test("本番は https に限る", () => {
  assert.throws(() => resolveSiteOrigin("http://smapass.example", true));
});
