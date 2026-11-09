/** is_demo の端末は架空のデータであることを内容より上に出す */
export function DemoNotice({ isDemo }: { isDemo: boolean }) {
  if (!isDemo) return null;
  return (
    <div className="notice inverted" role="note">
      <span className="notice-title">デモ用の架空のデータです</span>
      <p className="small">実在する端末の記録ではありません。動作を確かめるための表示です。</p>
    </div>
  );
}

/** 評価は Back が算出する予定で、まだ返らない（decisions/0008）。仮の値で埋めない */
export function GradePending({ fill = false }: { fill?: boolean }) {
  return (
    <div className={`box${fill ? " overview-fill" : ""}`}>
      <p style={{ fontWeight: 600 }}>評価は準備中です</p>
      <p className="small muted">
        バッテリー・発熱・安定性の評価は、今後この欄に表示します。それまでは「詳細を見る」から記録の値を確かめてください。
      </p>
    </div>
  );
}
