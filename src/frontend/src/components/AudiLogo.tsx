export function AudiRings({
  size = 40,
  className = "",
}: { size?: number; className?: string }) {
  const r = size * 0.22;
  const spacing = size * 0.38;
  const cx1 = r + 2;
  const cx2 = cx1 + spacing;
  const cx3 = cx2 + spacing;
  const cx4 = cx3 + spacing;
  const cy = r + 2;
  const width = cx4 + r + 2;
  const height = cy * 2;
  const cxArr = [cx1, cx2, cx3, cx4];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width * (size / height)}
      height={size}
      className={className}
      role="img"
      aria-label="Audi four rings logo"
    >
      <title>Audi four rings logo</title>
      {cxArr.map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="white"
          strokeWidth="2.5"
        />
      ))}
    </svg>
  );
}
