import "server-only";
import { notFound } from "next/navigation";
import { ApiNotFoundError } from "./api";
import { getDeviceState, InvalidDeviceIdError } from "./backend";

/**
 * URL の ID で端末の状態を取る。
 * - ID の形式が不正、または Back が 400/404（存在しない・非公開）→ not-found ページ（HTTP 404）
 * - 429・5xx・通信エラー → そのまま投げて error.tsx（「一時的に取得できません」）にする
 */
export async function loadDevice(id: string) {
  try {
    return await getDeviceState(id);
  } catch (e) {
    if (e instanceof InvalidDeviceIdError || e instanceof ApiNotFoundError) notFound();
    throw e;
  }
}

/** カード画像・OGP画像用。見つからなければ undefined、通信エラーは投げる */
export async function findDevice(id: string) {
  try {
    return await getDeviceState(id);
  } catch (e) {
    if (e instanceof InvalidDeviceIdError || e instanceof ApiNotFoundError) return undefined;
    throw e;
  }
}

/** 画面に出す機種名。spec が未取得なら仮の名前にする */
export function deviceLabel(spec: { manufacturer: string; model: string } | null) {
  return spec ? { maker: spec.manufacturer, model: spec.model } : { maker: "", model: "機種情報なし" };
}
