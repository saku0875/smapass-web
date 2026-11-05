// 出品用カード画像（FR-11）
import { getCertificate } from "@/lib/backend";
import { renderCard } from "@/lib/card";
import { isValidId } from "@/lib/certificate-id";
import { getOrigin } from "@/lib/site";

export async function GET(_request: Request, ctx: RouteContext<"/c/[id]/card.png">) {
  const { id } = await ctx.params;
  const certificate = isValidId(id) ? getCertificate(id) : undefined;
  if (!certificate) return new Response("Not Found", { status: 404 });
  return renderCard(certificate, await getOrigin());
}
