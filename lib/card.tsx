// 出品用カード画像とOGP画像のレイアウト（decisions/0007）。
// 文章は載せず、照会に必要な最小限だけにする（NFR-04）。日本語フォントを読み込まずに済むよう英数字だけで描く。
// ページの中身は新しい記録が届くたびに更新されるので、発行日ではなく最終計測日を載せる（decisions/0014）。
// 評価は Back が返すようになったら載せる（decisions/0008）。

import "server-only";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import { certificateUrl } from "./site";
import type { DeviceState } from "./types";

const BLACK = "#111111";

async function qrDataUrl(url: string) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 520,
    color: { dark: BLACK, light: "#ffffff" },
  });
}

/** 日本時間の日付（YYYY-MM-DD）。カードでは区切りを sep にする */
function jstDate(iso: string, sep = "-") {
  return new Date(Date.parse(iso) + 9 * 3600_000).toISOString().slice(0, 10).replaceAll("-", sep);
}

function labels(d: DeviceState) {
  return {
    maker: d.spec?.manufacturer ?? "",
    model: d.spec?.model ?? "Unknown model",
    measured: d.last_collected_at ? `Last measured ${jstDate(d.last_collected_at)}` : "No records yet",
  };
}

export async function renderCard(d: DeviceState, origin: string) {
  const url = certificateUrl(origin, d.id);
  // 偽サイトと見分けられるよう、正規のドメインだけを載せる。IDは文字にしない（decisions/0010、0013）
  const domain = new URL(origin).host;
  const qr = await qrDataUrl(url);
  const { maker, model } = labels(d);

  // 最終計測日。カードは保存した時点の値になる（decisions/0014）。評価の欄は Back が返すまで置かない（FR-02）
  const measuredDate = d.last_collected_at ? jstDate(d.last_collected_at, ".") : null;
  const mono = { letterSpacing: 4 } as const;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          color: BLACK,
          padding: "64px 72px",
          border: `4px solid ${BLACK}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 32 }}>
          <span style={mono}>DEVICE HISTORY CERTIFICATE</span>
          <span style={{ fontWeight: 700 }}>smapass</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
          <span style={{ fontSize: 40, color: "#6b6b6b" }}>{maker}</span>
          <span style={{ fontSize: 104, fontWeight: 700, lineHeight: 1.1 }}>{model}</span>
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: 40, gap: 64, alignItems: "center" }}>
          <img src={qr} width={480} height={480} alt="" />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 16 }}>
            <span style={{ ...mono, fontSize: 32 }}>LAST MEASURED</span>
            <span style={{ ...mono, fontSize: 56 }}>{measuredDate ?? "No records yet"}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 34, borderTop: `3px solid ${BLACK}`, paddingTop: 24, ...mono }}>
          {domain}
        </div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}

/** URLを貼ったときのプレビュー（FR-17）。カードと同じ要素を横長に並べる */
export async function renderOgImage(d: DeviceState) {
  const { maker, model, measured } = labels(d);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#ffffff",
          color: BLACK,
          padding: 72,
          border: `14px solid ${BLACK}`,
          gap: 16,
        }}
      >
        <span style={{ fontSize: 28, letterSpacing: 4 }}>DEVICE HISTORY CERTIFICATE</span>
        <span style={{ fontSize: 34, opacity: 0.6 }}>{maker}</span>
        <span style={{ fontSize: 80, fontWeight: 700 }}>{model}</span>
        <span style={{ fontSize: 36 }}>{measured}</span>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
