// smapass-back（Go API）の応答の型。正式な定義は smapass-back の docs/openapi.json と
// internal/domain/entity/device.go・records.go。Web 側でフィールドを足したり意味を変えたりしない。
// JSON の snake_case のまま扱い、名前の変換はしない。
//
// 計測値の null は「不明」。0 や false（異常なし）に置き換えない。

/** 端末のスペック。たまにしか変わらない。OS/SDK は最新の状態計測の値が入る */
export type DeviceSpec = {
  manufacturer: string;
  model: string;
  soc: string | null;
  cpu_cores: number | null;
  ram_bytes: number | null;
  storage_bytes: number | null;
  screen_size_inch: number | null;
  screen_density_dpi: number | null;
  os_version: string | null;
  sdk_int: number | null;
  collected_at: string;
};

/** 状態計測1件 */
export type StatusRecord = {
  sequence: number;
  collected_at: string;
  os_version: string;
  sdk_int: number;
  battery_temp_c: number | null;
  battery_cycle_count: number | null;
  /** 計測時点で残っている電荷 */
  battery_charge_mah: number | null;
  /** 満充電したときの推定電荷。バッテリーの劣化の目安 */
  battery_full_charge_mah: number | null;
  /** 累計の起動回数 */
  boot_count: number | null;
  /** 前回の計測から今回までに異常終了があったか */
  had_abnormal_exit: boolean | null;
  /** 熱的余裕（getThermalHeadroom）。1.0 で性能制限に達する目安 */
  thermal_headroom: number | null;
};

export type Page<T> = { items: T[]; total: number; limit: number; offset: number };

/** GET /api/devices/{id}。端末の最新の観測値と全期間の履歴 */
export type DeviceState = {
  /** 端末の UUID。持ち主や鍵が替わっても変わらない */
  id: string;
  /** 登録の状態。データが正しいかどうかとは関係ない */
  registration_status: "active" | "released";
  /** 全ログの件数。スペックのログも含むので history.total と一致しないことがある */
  record_count: number;
  first_collected_at: string | null;
  last_collected_at: string | null;
  spec: DeviceSpec | null;
  /** 最新の状態計測。spec.collected_at とは別の時刻のことがある */
  status: StatusRecord | null;
  /** true なら架空のデータ。false でも「検証済み」という意味ではない */
  is_demo: boolean;
  history: Page<StatusRecord>;
};

/** GET /api/devices/{id}/records の1件。検証用 */
export type VerificationRecord = {
  sequence: number;
  type: "spec" | "status" | "inspection";
  collected_at: string;
  /** 署名対象の JSON 文字列。この UTF-8 バイト列をそのまま SHA-256 にかける */
  canonical_payload: string;
  /** 小文字 hex */
  payload_hash: string;
  previous_hash: string | null;
  signature_base64: string;
  public_key: string;
  signature_algorithm: string;
  canonicalization: string;
  /** サーバーが保存している状態。ブラウザで照合した結果ではない */
  anchor_state: "unanchored" | "pending" | "confirmed" | "failed";
  chain: string | null;
  transaction_hash: string | null;
  merkle_root: string | null;
  leaf_index: number | null;
  merkle_proof: { side: string; hash: string }[];
};

/** GET /api/devices/search の1件。IMEI を含むのはこの応答だけ */
export type DeviceReference = { imei: string; id: string };

export type ApiError = { error: { code: string; message: string } };
