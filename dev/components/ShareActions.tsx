"use client";

import { useState } from "react";

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  async function copy(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      setCopied(null);
      window.prompt("コピーしてください", text);
    }
  }
  return { copied, copy };
}

export function SaveCardButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false);

  // スマホは共有シートから写真に保存してもらう。使えないブラウザではダウンロードする
  async function save() {
    setBusy(true);
    const src = `/c/${id}/card.png`;
    const filename = `certificate-${id}.png`;
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // 共有シートを閉じた場合など。何もしない
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" className="button primary" onClick={save} disabled={busy}>
      {busy ? "準備中…" : "画像を保存"}
    </button>
  );
}

export function CopyField({ label, text, multiline = false }: { label: string; text: string; multiline?: boolean }) {
  const { copied, copy } = useCopy();
  return (
    <div className="section" style={{ gap: 8 }}>
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h3>{label}</h3>
        <button type="button" className="button" onClick={() => copy(label, text)}>
          {copied === label ? "コピーしました" : "コピー"}
        </button>
      </div>
      <pre
        className="mono box small break"
        style={{ margin: 0, whiteSpace: multiline ? "pre-wrap" : "normal", background: "var(--soft)" }}
      >
        {text}
      </pre>
    </div>
  );
}
