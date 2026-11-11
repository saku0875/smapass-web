// Back の公開 API（認証なし・読み取り専用）を呼ぶ。サーバーとブラウザの両方で使う。
// 書き込み API（/api/auth/*、logs、visibility など）はアプリ専用なので、ここには置かない。

import type { Page } from "./types";

/** 開発時は http://localhost:8080。ブラウザからも直接呼ぶので NEXT_PUBLIC_ にする */
export const BACKEND_ORIGIN = (process.env.NEXT_PUBLIC_BACKEND_ORIGIN ?? "http://localhost:8080").replace(/\/$/, "");

const TIMEOUT_MS = 8000;

/** ページングの上限（Back の limit は 1〜500） */
export const PAGE_LIMIT = 500;

/**
 * 400・404 は「見つからない（存在しない・非公開・URLが不正）」。
 * それ以外（429・500・503・通信エラー・タイムアウト）は「一時的に取得できない」で、
 * 「不一致」や「存在しない」と混同しない。
 */
export class ApiNotFoundError extends Error {
  constructor(readonly status: number) {
    super(`not found (${status})`);
  }
}

export class ApiUnavailableError extends Error {
  constructor(readonly status?: number) {
    super(status ? `unavailable (${status})` : "unavailable");
  }
}

export async function fetchApi<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_ORIGIN}${path}`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new ApiUnavailableError();
  }
  if (res.status === 400 || res.status === 404) throw new ApiNotFoundError(res.status);
  if (!res.ok) throw new ApiUnavailableError(res.status);
  try {
    return (await res.json()) as T;
  } catch {
    throw new ApiUnavailableError(res.status);
  }
}

/** ページを順に取得して全件をつなげる。取得中に件数が増えても、届いた分で止める */
export async function fetchAllPages<B, T>(
  pathFor: (offset: number, limit: number) => string,
  pageOf: (body: B) => Page<T>,
): Promise<{ first: B; items: T[] }> {
  const items: T[] = [];
  let first: B | undefined;
  for (let offset = 0; ; ) {
    const body = await fetchApi<B>(pathFor(offset, PAGE_LIMIT));
    first ??= body;
    const page = pageOf(body);
    items.push(...page.items);
    offset += page.items.length;
    if (page.items.length === 0 || offset >= page.total) break;
  }
  return { first: first!, items };
}
