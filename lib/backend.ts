// サーバー側で Back から端末の状態を取る（証明書ページ・カード画像・OGP画像）
import "server-only";
import { cache } from "react";
import { fetchAllPages } from "./api";
import { isValidDeviceId, normalizeDeviceId } from "./device-id";
import type { DeviceState, StatusRecord } from "./types";

/** 形式が不正な ID では Back を呼ばず、Back と同じく「見つからない」扱いにする */
export class InvalidDeviceIdError extends Error {}

/**
 * 最新のスペック・状態と、全期間の状態計測（history.items）を取る。
 * history はページングされるので total まで順に取得し、1つの配列にまとめて返す。
 * 同じリクエスト内（generateMetadata とページ本体など）では1回だけ取得する。
 */
export const getDeviceState = cache(async (id: string): Promise<DeviceState> => {
  if (!isValidDeviceId(id)) throw new InvalidDeviceIdError(id);
  const deviceId = encodeURIComponent(normalizeDeviceId(id));
  const { first, items } = await fetchAllPages<DeviceState, StatusRecord>(
    (offset, limit) => `/api/devices/${deviceId}?limit=${limit}&offset=${offset}`,
    (body) => body.history,
  );
  return { ...first, history: { items, total: items.length, limit: items.length, offset: 0 } };
});
