// 模擬Go API：ブラウザ検証用に記録データ本体とトランザクションハッシュを返す
import { getVerificationRecords } from "@/lib/backend";
import { isValidId } from "@/lib/certificate-id";

export async function GET(_request: Request, ctx: RouteContext<"/api/mock/certificates/[id]/records">) {
  const { id } = await ctx.params;
  const records = isValidId(id) ? await getVerificationRecords(id) : undefined;
  if (!records) return Response.json({ error: "not_found" }, { status: 404 });
  return Response.json({ records });
}
