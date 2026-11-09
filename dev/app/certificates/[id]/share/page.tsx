import type { Metadata } from "next";
import { CopyField, SaveCardButton } from "@/components/ShareActions";
import { deviceLabel, loadDevice } from "@/lib/certificate-page";
import { formatDateTime } from "@/lib/format";
import { certificateUrl, getOrigin } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "出品用素材" };

export default async function SharePage({ params }: Props) {
  const d = await loadDevice((await params).id);
  const { maker, model } = deviceLabel(d.spec);
  const url = certificateUrl(await getOrigin(), d.id);
  const text = `端末の履歴証明書（${`${maker} ${model}`.trim()}）\n${url}`;

  return (
    <>
      <section className="section">
        <p className="small muted">
          {maker} {model}
        </p>
        <h1>出品用素材</h1>
        <p>カード画像を出品画像の1枚に、URLを説明文に添えてください。</p>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>カード画像</h2>
          <SaveCardButton id={d.id} />
        </div>
        <img
          src={`/certificates/${d.id}/card.png`}
          alt={`${model} の証明書のカード画像（QRコード・機種・最終計測日）`}
          width={1080}
          height={1080}
          style={{ width: "100%", maxWidth: 420, height: "auto", border: "1px solid var(--line)", borderRadius: 6 }}
        />
        <p className="small muted">
          フリマの一覧で小さく表示されても機種が読めるよう、文章は載せていません。
          スマホで「画像を保存」を押すと共有メニューが開くので、「画像を保存」を選んでください。
        </p>
      </section>

      <div className="section w-half" style={{ gap: 36 }}>
        <section className="section">
          <div className="section-head">
            <h2>説明文に添える</h2>
          </div>
          <CopyField label="説明文用テキスト" text={text} multiline />
          <CopyField label="URL" text={url} />
          <p className="small muted">
            このURLのページは、新しい記録が届くたびに最新の内容に更新されます
            {d.last_collected_at && `（いまの最終計測：${formatDateTime(d.last_collected_at)}）`}。
            カード画像に載る最終計測日は、画像を保存した時点のものです。
          </p>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>公開の設定</h2>
          </div>
          <div className="box">
            <p className="small">
              このページが開けているので、いまは公開されています。非公開にすると、買い手がURLやQRコードから開いても「見つからない」と表示されます。公開・非公開はアプリで切り替えてください。
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
