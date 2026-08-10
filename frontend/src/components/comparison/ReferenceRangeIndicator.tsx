interface ReferenceRangeIndicatorProps {
  referenceRange: string | null;
  previousValue: number;
  currentValue: number;
}

/**
 * Parses a "low - high" numeric range (the format produced by the
 * enrichment engine, e.g. "0.6 - 1.2") and renders a small visual bar
 * with markers for the previous and current values.
 *
 * Some older reports store descriptive, non-numeric ranges (e.g.
 * "Typically <20 mg/dL"), or have no range at all. In those cases
 * this honestly falls back to plain text instead of guessing at a
 * bar position it can't actually compute.
 */
function parseNumericRange(range: string): { low: number; high: number } | null {
  const match = range.match(/^\s*([\d.]+)\s*-\s*([\d.]+)\s*$/);
  if (!match) return null;

  const low = parseFloat(match[1]);
  const high = parseFloat(match[2]);

  if (Number.isNaN(low) || Number.isNaN(high) || low >= high) return null;

  return { low, high };
}

function positionPercent(value: number, low: number, high: number): number {
  // Give 20% padding on each side so values outside the range are
  // still visible on the bar instead of clipping at the edge.
  const span = high - low;
  const padded = span * 0.2;
  const min = low - padded;
  const max = high + padded;

  const pct = ((value - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function ReferenceRangeIndicator({
  referenceRange,
  previousValue,
  currentValue,
}: ReferenceRangeIndicatorProps) {
  if (!referenceRange) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const parsed = parseNumericRange(referenceRange);

  if (!parsed) {
    return <span className="text-xs text-muted-foreground">{referenceRange}</span>;
  }

  const { low, high } = parsed;
  const normalStart = positionPercent(low, low, high);
  const normalEnd = positionPercent(high, low, high);
  const prevPos = positionPercent(previousValue, low, high);
  const currPos = positionPercent(currentValue, low, high);

  return (
    <div className="w-full min-w-[140px]">
      <div className="relative h-1.5 rounded-full bg-white/10">
        <div
          className="absolute h-1.5 rounded-full bg-emerald-500/30"
          style={{ left: `${normalStart}%`, width: `${normalEnd - normalStart}%` }}
        />
        <div
          className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/50"
          style={{ left: `${prevPos}%` }}
          title={`Previous: ${previousValue}`}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-brand"
          style={{ left: `${currPos}%` }}
          title={`Current: ${currentValue}`}
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">{referenceRange}</p>
    </div>
  );
}