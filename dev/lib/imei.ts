// IMEI は検索（/api/devices/search）にだけ使い、画面・ページURL・Web のサーバーには残さない（NFR-05）

/** 15桁で、末尾のチェックディジット（Luhn）が合うか。Back（entity.NormalizeIMEI）と同じ条件 */
export function isValidImei(value: string) {
  if (!/^\d{15}$/.test(value) || value === "000000000000000") return false;
  let total = 0;
  for (let i = 0; i < 15; i++) {
    let d = Number(value[i]);
    if (i % 2 === 1) {
      d *= 2;
      d = Math.floor(d / 10) + (d % 10);
    }
    total += d;
  }
  return total % 10 === 0;
}
