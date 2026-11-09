// 端末ID：Back が端末に割り当てるランダムな UUID（decisions/0013）。
// 証明書のURL `/certificates/{id}` に使う。画面には文字として表示しない。
// Back は不正な値と全ゼロの UUID に 400（invalid_id）を返すので、Web でも先に弾く。

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIL_UUID = "00000000-0000-0000-0000-000000000000";

export function isValidDeviceId(id: string): boolean {
  return UUID_PATTERN.test(id) && id !== NIL_UUID;
}

/** Back は小文字で返すので、比べるときは小文字にそろえる */
export function normalizeDeviceId(id: string): string {
  return id.toLowerCase();
}
