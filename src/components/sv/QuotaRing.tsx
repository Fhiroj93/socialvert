export function QuotaRing({
  total,
  completed,
  inProgress,
}: {
  total: number;
  completed: number;
  inProgress: number;
}) {
  const size = 200;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const pComplete = Math.min(completed / total, 1);
  const pProgress = Math.min((completed + inProgress) / total, 1);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--color-muted)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="var(--color-primary)" strokeOpacity={0.35}
          strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${c * pProgress} ${c}`}
        />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="var(--color-success)"
          strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={`${c * pComplete} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-4xl font-bold tracking-tight">{completed}<span className="text-muted-foreground text-2xl">/{total}</span></div>
          <div className="text-xs text-muted-foreground mt-1">videos done</div>
        </div>
      </div>
    </div>
  );
}
