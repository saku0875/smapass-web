// 出品用カード画像（FR-11）
import { renderCard } from "@/lib/card";
import { findDevice } from "@/lib/certificate-page";
import { getOrigin } from "@/lib/site";

export async function GET(_request: Request, ctx: RouteContext<"/certificates/[id]/card.png">) {
  const { id } = await ctx.params;
  const device = await findDevice(id);
  if (!device) return new Response("Not Found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  const res = await renderCard(device, await getOrigin());
  // 中身は記録が届くたびに変わるので、長くキャッシュさせない
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("X-Robots-Tag", "noindex");
  return res;
}
