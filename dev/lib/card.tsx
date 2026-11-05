// 出品用カード画像とOGP画像のレイアウト（decisions/0007）。
// 文章は載せず、照会に必要な最小限だけにする（NFR-04）。日本語フォントを読み込まずに済むよう英数字だけで描く。

import "server-only";
import { ImageResponse } from "next/og";
import QRCode from "qrcode";
import type { Certificate } from "./types";

const BLACK = "#111111";

async function qrDataUrl(url: string) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 520,
    color: { dark: BLACK, light: "#ffffff" },
  });
}

function issuedDate(iso: string) {
  return iso.slice(0, 10);
}

export async function renderCard(c: Certificate, origin: string) {
  const url = `${origin}/c/${c.id}`;
  // 偽サイトと見分けられるよう、正規のドメインだけを載せる。IDは文字にしない（decisions/0010）
  const domain = new URL(origin).host;
  const qr = await qrDataUrl(url);

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
          padding: 56,
          border: `16px solid ${BLACK}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, letterSpacing: 4 }}>
          <span>DEVICE HISTORY CERTIFICATE</span>
          <span>smapass</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 36 }}>
          <span style={{ fontSize: 34, opacity: 0.6 }}>{c.device.maker}</span>
          <span style={{ fontSize: 88, lineHeight: 1.1 }}>{c.device.model}</span>
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: 32, gap: 56, alignItems: "center" }}>
          <img src={qr} width={500} height={500} alt="" />
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 28 }}>
            <span style={{ fontSize: 34 }}>GRADE</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 240,
                height: 240,
                background: BLACK,
                color: "#ffffff",
                fontSize: 180,
                borderRadius: 16,
              }}
            >
              {c.grade.overall}
            </div>
            <span style={{ fontSize: 30 }}>Issued {issuedDate(c.issuedAt)}</span>
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 34, borderTop: `3px solid ${BLACK}`, paddingTop: 22 }}>{domain}</div>
      </div>
    ),
    { width: 1080, height: 1080 },
  );
}

/** URLを貼ったときのプレビュー（FR-17）。カードと同じ要素を横長に並べる */
export async function renderOgImage(c: Certificate) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#ffffff",
          color: BLACK,
          padding: 64,
          border: `14px solid ${BLACK}`,
          alignItems: "center",
          gap: 56,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 260,
            height: 260,
            background: BLACK,
            color: "#ffffff",
            fontSize: 190,
            fontWeight: 700,
            borderRadius: 16,
          }}
        >
          {c.grade.overall}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ fontSize: 26, letterSpacing: 4 }}>DEVICE HISTORY CERTIFICATE</span>
          <span style={{ fontSize: 30, opacity: 0.6 }}>{c.device.maker}</span>
          <span style={{ fontSize: 64, fontWeight: 700 }}>{c.device.model}</span>
          <span style={{ fontSize: 32 }}>Issued {issuedDate(c.issuedAt)}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
