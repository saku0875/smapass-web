// 模擬Sepolia RPC：トランザクションに記録されたハッシュと時刻を返す。
// 本番ではブラウザからRPCプロバイダを直接読む（decisions/0001）。
import { ChainUnavailableError, readChain } from "@/lib/backend";

export async function GET(request: Request) {
  const txs = new URL(request.url).searchParams.get("tx")?.split(",").filter(Boolean) ?? [];
  // 実際のRPCに近い待ち時間を入れる
  await new Promise((r) => setTimeout(r, 700));
  try {
    return Response.json({ entries: await readChain(txs) });
  } catch (e) {
    if (e instanceof ChainUnavailableError) return Response.json({ error: "unavailable" }, { status: 503 });
    throw e;
  }
}
