import { Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";

export interface TimelinePoint {
  id: number;
  created_at: string;
  health_score: number;
}

function formatShortDate(value: string): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const CHART_HEIGHT = 100;
const CHART_TOP_PAD = 24;
const POINT_GAP = 120;

export function HealthScoreTimeline({
  reports,
  onSelect,
  selectedIds = [],
}: {
  reports: TimelinePoint[];
  /** Called with a report id when its point is clicked/activated. */
  onSelect?: (id: number) => void;
  /** Ids to visually mark as selected (e.g. [aId, bId]). */
  selectedIds?: (number | null)[];
}) {
  if (reports.length < 2) {
    return (
      <Card className="card-premium border-0 shadow-card">
        <CardContent className="p-5">
          <EmptyState
            icon={Activity}
            title="Not enough reports for a timeline"
            description="Upload another report to see your health progression."
          />
        </CardContent>
      </Card>
    );
  }

  const points = [...reports].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const scores = points.map((p) => p.health_score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  const width = Math.max(points.length - 1, 1) * POINT_GAP + 40;

  const coords = points.map((point, i) => ({
    ...point,
    x: 20 + i * POINT_GAP,
    y: CHART_TOP_PAD + (1 - (point.health_score - min) / range) * CHART_HEIGHT,
  }));

  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");

  return (
    <Card className="card-premium border-0 shadow-card">
      <CardContent className="p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
            <Activity className="h-3.5 w-3.5" /> Health Score Timeline
          </div>
          {onSelect && (
            <span className="text-[11px] text-muted-foreground">Click any two points to compare them</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${width} ${CHART_HEIGHT + CHART_TOP_PAD + 50}`}
            className="h-40 w-full"
            style={{ minWidth: width }}
            role="img"
            aria-label="Health score over time"
          >
            <polyline points={linePoints} fill="none" stroke="currentColor" strokeWidth="2" className="text-brand/50" />
            {coords.map((c, i) => {
              const isCurrent = i === coords.length - 1;
              const isSelected = selectedIds.includes(c.id);
              const baseFill = isCurrent ? "fill-brand" : "fill-white/40";

              return (
                <g key={c.id}>
                  {isSelected && (
                    <circle cx={c.x} cy={c.y} r={10} className="fill-none stroke-brand" strokeWidth="2" />
                  )}
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={isCurrent ? 6 : 4}
                    className={`${baseFill} ${onSelect ? "cursor-pointer focus:outline-none" : ""}`}
                    onClick={onSelect ? () => onSelect(c.id) : undefined}
                    onKeyDown={
                      onSelect
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") onSelect(c.id);
                          }
                        : undefined
                    }
                    role={onSelect ? "button" : undefined}
                    tabIndex={onSelect ? 0 : undefined}
                    aria-label={
                      onSelect
                        ? `Select report from ${formatShortDate(c.created_at)}, health score ${c.health_score}`
                        : undefined
                    }
                  />
                  <text x={c.x} y={c.y - 16} textAnchor="middle" className="fill-foreground text-[13px] font-semibold">
                    {c.health_score}
                  </text>
                  <text
                    x={c.x}
                    y={CHART_TOP_PAD + CHART_HEIGHT + 22}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[11px]"
                  >
                    {isCurrent ? "Current" : formatShortDate(c.created_at)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}