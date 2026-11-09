"use client";

import { useState, type FormEvent } from "react";
import { ApiNotFoundError, fetchApi } from "@/lib/api";
import { normalizeDeviceId } from "@/lib/device-id";
import { isValidImei } from "@/lib/imei";
import type { DeviceReference } from "@/lib/types";

type Result =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "invalid"; message: string }
  | { kind: "same" }
  | { kind: "different" }
  | { kind: "not-found" }
  | { kind: "unavailable" };

/**
 * 届いた端末の IMEI を入力し、この証明書の端末と同じかを確かめる（FR-05、decisions/0015）。
 * - IMEI は Web のページ URL やサーバーを通さず、ブラウザから直接 Back の検索 API に送る
 * - 入力欄に name を付けないので、JavaScript なしで送信されても URL に IMEI が載らない
 * - 照合結果を出したら入力欄は空にし、IMEI を画面に残さない（NFR-05）
 */
export function ImeiCheck({ deviceId }: { deviceId: string }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result>({ kind: "idle" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    const imei = value.replace(/[\s-]/g, "");
    if (!isValidImei(imei)) {
      setResult({ kind: "invalid", message: "15桁の数字を、表示されたとおりに入力してください。" });
      return;
    }
    setResult({ kind: "checking" });
    try {
      const { items } = await fetchApi<{ items: DeviceReference[] }>(`/api/devices/search?imeis=${imei}`);
      setValue("");
      const found = items.find((i) => i.imei === imei);
      if (!found) setResult({ kind: "not-found" });
      else setResult({ kind: normalizeDeviceId(found.id) === normalizeDeviceId(deviceId) ? "same" : "different" });
    } catch (err) {
      // 400 は IMEI の形式が Back で受け付けられなかった場合
      if (err instanceof ApiNotFoundError && err.status === 400) {
        setResult({ kind: "invalid", message: "IMEIの形式が正しくありません。" });
      } else {
        setResult({ kind: "unavailable" });
      }
    }
  }

  return (
    <div className="section" style={{ gap: 10 }}>
      <form onSubmit={submit} className="row" style={{ gap: 8 }} autoComplete="off">
        <label htmlFor="imei-check" className="small" style={{ flexBasis: "100%" }}>
          届いた端末のIMEI（15桁）
        </label>
        <input
          id="imei-check"
          inputMode="numeric"
          autoComplete="off"
          maxLength={20}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="input mono"
          style={{ flex: "1 1 180px", width: "auto", minWidth: 0 }}
          placeholder="例：35XXXXXXXXXXXXX"
        />
        <button type="submit" className="button" disabled={result.kind === "checking"}>
          {result.kind === "checking" ? "照合中…" : "照合する"}
        </button>
      </form>
      <div aria-live="polite">
        {result.kind === "invalid" && <p className="small">{result.message}</p>}
        {result.kind === "same" && (
          <p className="status solid">✓ この証明書の端末です</p>
        )}
        {result.kind === "different" && (
          <div className="notice inverted">
            <span className="notice-title">✕ 別の端末の証明書です</span>
            <p className="small">入力したIMEIは、この証明書とは別の端末のものです。出品者に確認してください。</p>
          </div>
        )}
        {result.kind === "not-found" && (
          <div className="notice">
            <span className="notice-title">この証明書の端末とは確認できませんでした</span>
            <p className="small">
              入力したIMEIの公開されている端末は見つかりませんでした。打ち間違いがないか確かめてください。
              非公開に設定された端末も見つからない扱いになります。
            </p>
          </div>
        )}
        {result.kind === "unavailable" && (
          <div className="box">
            <span className="status dashed">？ 照合できず</span>
            <p className="small" style={{ marginTop: 6 }}>
              通信の問題で確認できませんでした。別の端末だと分かったわけではありません。時間をおいて再試行してください。
            </p>
          </div>
        )}
      </div>
      <p className="small muted">
        IMEIは端末ごとの番号です。届いた端末の電話アプリで *#06# と入力すると表示されます。入力したIMEIはこのページには保存しません。
      </p>
    </div>
  );
}
