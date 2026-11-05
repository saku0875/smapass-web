// 模擬データ。Goバックエンドとチェーンができるまでの代わり。
// 証明書ごとに「アプリが記録した元の値」を作り、チェーンにはその値のハッシュを刻んだことにする。

import type { Certificate, RecordData } from "./types";

type Profile = {
  seed: number;
  start: string;
  weeks: number;
  /** 記録が途切れた週（0始まり） */
  skipWeeks?: number[];
  maxMahStart: number;
  maxMahEnd: number;
  tempBase: number;
  spikeWeeks?: number[];
  cyclesStart: number;
  bootsStart: number;
  abnormalWeeks?: number[];
  /** OSの更新。fromWeek 以降はこのバージョン */
  os: { fromWeek: number; androidVersion: string; sdkInt: number }[];
};

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (v: number, digits: number) => Math.round(v * 10 ** digits) / 10 ** digits;

function generateRecords(p: Profile): RecordData[] {
  const rand = mulberry32(p.seed);
  const records: RecordData[] = [];
  let cycles = p.cyclesStart;
  let boots = p.bootsStart;
  const startMs = Date.parse(p.start);
  for (let w = 0; w < p.weeks; w++) {
    // 途切れた週も乱数は消費し、記録期間が同じなら同じ値になるようにする
    const [r1, r2, r3, r4] = [rand(), rand(), rand(), rand()];
    const abnormal = p.abnormalWeeks?.includes(w) ?? false;
    cycles += 3 + Math.floor(r1 * 4);
    boots += 1 + Math.floor(r2 * 3) + (abnormal ? 2 : 0);
    if (p.skipWeeks?.includes(w)) continue;
    const progress = p.weeks > 1 ? w / (p.weeks - 1) : 0;
    const estimatedMaxMah = Math.round(p.maxMahStart - (p.maxMahStart - p.maxMahEnd) * progress - r3 * 15);
    const temp = round(p.tempBase + r4 * 6 + (p.spikeWeeks?.includes(w) ? 13 : 0), 1);
    const os = p.os.findLast((o) => o.fromWeek <= w)!;
    records.push({
      recordedAt: new Date(startMs + w * 7 * 86400000).toISOString().replace(".000Z", "Z"),
      androidVersion: os.androidVersion,
      sdkInt: os.sdkInt,
      batteryTempC: temp,
      batteryCycleCount: cycles,
      chargeCounterMah: Math.round(estimatedMaxMah * (0.2 + r2 * 0.75)),
      estimatedMaxMah,
      bootCount: boots,
      abnormalShutdown: abnormal,
      thermalHeadroom: round(Math.min(1, Math.max(0, (temp - 25) / 24)), 2),
    });
  }
  return records;
}

const pixelProfile: Profile = {
  seed: 8,
  start: "2026-04-06T00:00:00Z",
  weeks: 28,
  maxMahStart: 4490,
  maxMahEnd: 4385,
  tempBase: 31,
  spikeWeeks: [14],
  cyclesStart: 40,
  bootsStart: 18,
  os: [
    { fromWeek: 0, androidVersion: "15", sdkInt: 35 },
    { fromWeek: 10, androidVersion: "16", sdkInt: 36 },
  ],
};

const pixelDevice = {
  imeiLast4: "4821",
  maker: "Google",
  model: "Pixel 8",
  deviceName: "shiba",
  soc: "Google Tensor G3",
  cpuCores: 9,
  ramMb: 8192,
  storageGb: 128,
  screenSizeInch: 6.2,
  screenDensityDpi: 428,
  acquiredAt: "2026-04-06T00:00:00Z",
};

type MockCertificate = Certificate & {
  /** アプリが記録した元の値（チェーンのハッシュはこちらから作る） */
  originalRecords: RecordData[];
  /** 模擬チェーンを通信エラーにする */
  chainUnavailable?: boolean;
};

function build(
  base: Omit<Certificate, "records">,
  profile: Profile,
  options: { tamper?: { index: number; patch: Partial<RecordData> }; chainUnavailable?: boolean } = {},
): MockCertificate {
  const originalRecords = generateRecords(profile);
  // 運営者のDBにある値。改ざんのデモでは1件だけ書き換える
  const records = originalRecords.map((r, i) =>
    options.tamper?.index === i ? { ...r, ...options.tamper.patch } : r,
  );
  return { ...base, records, originalRecords, chainUnavailable: options.chainUnavailable };
}

export const mockCertificates: MockCertificate[] = [
  build(
    {
      id: "SPqGEzGJRVPOZxLdBbSyYg",
      status: "valid",
      issuedAt: "2026-10-20T09:12:00Z",
      device: pixelDevice,
      grade: {
        overall: "A",
        summary: "バッテリーの劣化が少なく、高温になった回数もわずかです。異常終了の記録はありません。",
        items: [
          { label: "バッテリー", grade: "A", reason: "バッテリーの容量は、記録を始めたときから2〜3%の低下にとどまっています。" },
          { label: "発熱", grade: "A", reason: "45℃を超えたのは記録期間中1回だけです。" },
          { label: "安定性", grade: "A", reason: "異常終了の記録はなく、起動回数も標準的です。" },
        ],
      },
      listing: {
        marketplace: "メルカリ",
        itemId: "m48213960572",
        registeredAt: "2026-10-21T02:40:00Z",
      },
      maintenance: [
        {
          recorder: { name: "スマホ修理ラボ 渋谷店", kind: "修理業者" },
          performedAt: "2026-07-15T05:30:00Z",
          content: "バッテリーの点検。膨張・端子の腐食なし。画面保護フィルムを交換。",
        },
      ],
    },
    pixelProfile,
  ),
  build(
    {
      id: "2htmuMRKi2QEOdTVudtc0Q",
      status: "valid",
      issuedAt: "2026-10-25T11:03:00Z",
      device: {
        imeiLast4: "7302",
        maker: "Samsung",
        model: "Galaxy S23",
        deviceName: "dm1q",
        soc: "Snapdragon 8 Gen 2",
        cpuCores: 8,
        ramMb: 8192,
        storageGb: 256,
        screenSizeInch: 6.1,
        screenDensityDpi: 425,
        acquiredAt: "2026-03-23T00:00:00Z",
      },
      grade: {
        overall: "B",
        summary: "使用期間なりの劣化があります。発熱は標準的で、異常終了が1回あります。",
        items: [
          { label: "バッテリー", grade: "B", reason: "バッテリーの容量は、記録を始めたときから3〜4%低下しています。" },
          { label: "発熱", grade: "B", reason: "45℃を超えたのは記録期間中2回です。" },
          { label: "安定性", grade: "B", reason: "異常終了が1回あります。" },
        ],
      },
      maintenance: [],
    },
    {
      seed: 23,
      start: "2026-03-23T00:00:00Z",
      weeks: 30,
      maxMahStart: 3780,
      maxMahEnd: 3650,
      tempBase: 32,
      spikeWeeks: [9, 21],
      cyclesStart: 210,
      bootsStart: 64,
      abnormalWeeks: [7],
      os: [
        { fromWeek: 0, androidVersion: "15", sdkInt: 35 },
        { fromWeek: 18, androidVersion: "16", sdkInt: 36 },
      ],
    },
    // デモ用：13件目の推定最大電荷をDB上で良く見せるよう書き換えた想定
    { tamper: { index: 12, patch: { estimatedMaxMah: 3890 } } },
  ),
  build(
    {
      id: "OZVUS0zg_Q2pPeKzWxQxzQ",
      status: "reissued",
      successorId: "SPqGEzGJRVPOZxLdBbSyYg",
      issuedAt: "2026-08-31T08:00:00Z",
      device: pixelDevice,
      grade: {
        overall: "A",
        summary: "バッテリーの劣化が少なく、高温になった回数もわずかです。異常終了の記録はありません。",
        items: [
          { label: "バッテリー", grade: "A", reason: "バッテリーの容量は、記録を始めたときから2%程度の低下にとどまっています。" },
          { label: "発熱", grade: "A", reason: "45℃を超えたのは記録期間中1回だけです。" },
          { label: "安定性", grade: "A", reason: "異常終了の記録はありません。" },
        ],
      },
      maintenance: [],
    },
    { ...pixelProfile, weeks: 21, maxMahEnd: 4410 },
  ),
  build(
    {
      id: "fkKel6VWX37jJI8amNPEkw",
      status: "valid",
      issuedAt: "2026-10-18T13:45:00Z",
      device: {
        imeiLast4: "0937",
        maker: "Sony",
        model: "Xperia 10 V",
        deviceName: "PDX235",
        soc: "Snapdragon 695",
        cpuCores: 8,
        ramMb: 8192,
        storageGb: 128,
        screenSizeInch: 6.1,
        screenDensityDpi: 449,
        acquiredAt: "2026-04-27T00:00:00Z",
      },
      grade: {
        overall: "C",
        summary: "バッテリーの劣化がやや進み、高温になった回数と異常終了が多めです。",
        items: [
          { label: "バッテリー", grade: "C", reason: "バッテリーの容量は、記録を始めたときから5〜6%低下しています。" },
          { label: "発熱", grade: "C", reason: "45℃を超えたのは記録期間中5回で、熱くなりやすい傾向があります。" },
          { label: "安定性", grade: "C", reason: "異常終了が3回あります。記録が途切れた期間もあります。" },
        ],
      },
      listing: {
        marketplace: "Yahoo!フリマ",
        itemId: "z519370284",
        registeredAt: "2026-10-19T00:10:00Z",
      },
      maintenance: [],
    },
    {
      seed: 10,
      start: "2026-04-27T00:00:00Z",
      weeks: 25,
      skipWeeks: [8, 9, 10, 11, 12],
      maxMahStart: 4600,
      maxMahEnd: 4350,
      tempBase: 35,
      spikeWeeks: [2, 5, 15, 19, 23],
      cyclesStart: 380,
      bootsStart: 140,
      abnormalWeeks: [3, 16, 22],
      os: [
        { fromWeek: 0, androidVersion: "14", sdkInt: 34 },
        { fromWeek: 14, androidVersion: "15", sdkInt: 35 },
      ],
    },
    // デモ用：チェーンへの問い合わせが失敗する
    { chainUnavailable: true },
  ),
  build(
    {
      id: "_zkOgpzmKkdaiLP5gKkENw",
      status: "revoked",
      revokedAt: "2026-10-10T04:00:00Z",
      issuedAt: "2026-09-28T10:20:00Z",
      device: {
        imeiLast4: "5516",
        maker: "SHARP",
        model: "AQUOS sense8",
        deviceName: "SH-54D",
        soc: "Snapdragon 6 Gen 1",
        cpuCores: 8,
        ramMb: 6144,
        storageGb: 128,
        screenSizeInch: 6.1,
        screenDensityDpi: 411,
        acquiredAt: "2026-09-14T00:00:00Z",
      },
      grade: {
        overall: "B",
        summary: "記録期間が短いため、評価の確かさは限られます。",
        items: [
          { label: "バッテリー", grade: "B", reason: "記録期間が短く、バッテリーの変化は判断できません。" },
          { label: "発熱", grade: "A", reason: "45℃を超えた記録はありません。" },
          { label: "安定性", grade: "B", reason: "記録が3回しかありません。" },
        ],
      },
      maintenance: [],
    },
    {
      seed: 6,
      start: "2026-09-14T00:00:00Z",
      weeks: 3,
      maxMahStart: 4720,
      maxMahEnd: 4715,
      tempBase: 30,
      cyclesStart: 150,
      bootsStart: 40,
      os: [{ fromWeek: 0, androidVersion: "15", sdkInt: 35 }],
    },
  ),
];
