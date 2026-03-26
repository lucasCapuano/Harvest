"use client";

interface RadarChartProps {
  scores: Record<string, number>;
  size?: number;
}

export function RadarChart({ scores, size = 280 }: RadarChartProps) {
  const labels = Object.keys(scores);
  const values = Object.values(scores);
  const n = labels.length;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;

  const angleStep = (2 * Math.PI) / n;
  // start from top (−π/2)
  const startAngle = -Math.PI / 2;

  function polarToXY(index: number, r: number) {
    const angle = startAngle + index * angleStep;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  // Grid levels (20, 40, 60, 80, 100)
  const levels = [20, 40, 60, 80, 100];

  // Data polygon
  const dataPoints = values.map((v, i) => {
    const r = (v / 100) * maxR;
    return polarToXY(i, r);
  });
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid polygons */}
        {levels.map((level) => {
          const r = (level / 100) * maxR;
          const pts = Array.from({ length: n }, (_, i) => {
            const p = polarToXY(i, r);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="currentColor"
              className="text-border"
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {Array.from({ length: n }, (_, i) => {
          const p = polarToXY(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="currentColor"
              className="text-border"
              strokeWidth={1}
            />
          );
        })}

        {/* Data fill */}
        <path d={dataPath} fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary))" strokeWidth={2} />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3} fill="hsl(var(--primary))" />
        ))}
      </svg>

      {/* Labels positioned outside */}
      {labels.map((label, i) => {
        const p = polarToXY(i, maxR + 24);
        return (
          <span
            key={label}
            className="absolute text-xs text-muted-foreground whitespace-nowrap"
            style={{
              left: p.x,
              top: p.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
