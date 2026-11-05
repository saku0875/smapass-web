import type { Metadata } from "next";
import { CopyField, SaveCardButton } from "@/components/ShareActions";
import { loadCertificate } from "@/lib/certificate-page";
import { getOrigin } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "出品用素材" };

export default async function SharePage({ params }: Props) {
  const c = await loadCertificate((await params).id);
  const url = `${await getOrigin()}/c/${c.id}`;
  const text = `端末状態証明書（${c.device.maker} ${c.device.model}）\n${url}`;

  return (
    <>
      <section className="section">
        <p className="small muted">
          {c.device.maker} {c.device.model}
        </p>
        <h1>出品用素材</h1>
        <p>カード画像を出品画像の1枚に、URLを説明文に添えてください。</p>
      </section>

      <section className="section w-half">
        <div className="section-head">
          <h2>カード画像</h2>
          <SaveCardButton id={c.id} />
        </div>
        <img
          src={`/c/${c.id}/card.png`}
          alt={`${c.device.model} の証明書のカード画像（QRコード・機種・評価）`}
          width={1080}
          height={1080}
          style={{ width: "100%", maxWidth: 420, height: "auto", border: "1px solid var(--line)", borderRadius: 6 }}
        />
        <p className="small muted">
          フリマの一覧で小さく表示されても機種と評価が読めるよう、文章は載せていません。
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
      </section>

      <section className="section">
        <div className="section-head">
          <h2>出品先の登録状況</h2>
        </div>
        {c.listing ? (
          <dl className="dl box">
            <dt>出品先</dt>
            <dd>{c.listing.marketplace}</dd>
            <dt>商品ID</dt>
            <dd className="mono">{c.listing.itemId}</dd>
          </dl>
        ) : (
          <div className="box">
            <p>まだ登録されていません。</p>
            <p className="small muted">
              出品後にアプリから登録できます。登録すると証明書に出品先が表示され、他人に証明書を使い回されるのを防げます。
            </p>
          </div>
        )}
      </section>
      </div>
    </>
  );
}
