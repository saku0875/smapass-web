// Goバックエンドが返す想定の型（仮）。正式な定義はGoのスキーマに合わせる。

export type Grade = "A" | "B" | "C" | "D";

export type CertificateStatus = "valid" | "revoked" | "reissued";

/** 端末そのもののデータ。たまにしか変わらない */
export type DeviceInfo = {
  /** IMEIの末尾4桁。全桁はWebに渡さない（NFR-05） */
  imeiLast4: string;
  maker: string;
  model: string;
  /** 端末名（Build.DEVICE のような製品コード名を想定） */
  deviceName: string;
  soc: string;
  cpuCores: number;
  ramMb: number;
  storageGb: number;
  screenSizeInch: number;
  screenDensityDpi: number;
  /** 最後に取得した日時 */
  acquiredAt: string;
};

/** 定期取得する記録1件分。ハッシュの対象 */
export type RecordData = {
  recordedAt: string;
  androidVersion: string;
  sdkInt: number;
  batteryTempC: number;
  batteryCycleCount: number;
  /** 記録時点で残っている電荷 */
  chargeCounterMah: number;
  /** 満充電したときの推定電荷。バッテリーの劣化の目安 */
  estimatedMaxMah: number;
  /** 累計の起動回数 */
  bootCount: number;
  /** 前回の記録から今回までに異常終了があったか */
  abnormalShutdown: boolean;
  /** 熱的余裕（0〜1）。向きはアプリ担当に要確認。ここでは1.0で性能制限に達する値として扱う */
  thermalHeadroom: number;
};

export type GradeItem = {
  label: string;
  grade: Grade;
  reason: string;
};

export type Listing = {
  marketplace: string;
  itemId: string;
  registeredAt: string;
};

export type MaintenanceRecord = {
  recorder: { name: string; kind: string };
  performedAt: string;
  content: string;
};

export type Certificate = {
  id: string;
  status: CertificateStatus;
  successorId?: string;
  revokedAt?: string;
  issuedAt: string;
  device: DeviceInfo;
  grade: { overall: Grade; summary: string; items: GradeItem[] };
  records: RecordData[];
  listing?: Listing;
  maintenance: MaintenanceRecord[];
};

/** 検証用：記録データ本体とトランザクションハッシュ */
export type VerificationRecord = {
  data: RecordData;
  txHash: string;
};

/** チェーン上に記録された値（模擬） */
export type ChainEntry = {
  hash: string;
  blockTimestamp: string;
};
