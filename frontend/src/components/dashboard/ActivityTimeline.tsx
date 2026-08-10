import { Upload, GitCompare, Bot, Download } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentReportSummary } from "@/types/dashboard";

export type ActivityKind = "upload" | "compare" | "ask" | "download";

export interface ActivityEvent {
  kind: ActivityKind;
  label: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  reports: RecentReportSummary[];
  /**
   * Compare / Ask AI / Download events aren't tracked by any backend
   * endpoint yet, so this component only ever shows real upload
   * events unless you pass additional real events in here once an
   * activity-log API exists.
   */
  extraEvents?: ActivityEvent[];
}

const kindConfig: Record<ActivityKind, { icon: typeof Upload; tone: string }> = {
  upload: { icon: Upload, tone: "bg-brand/10 text-brand" },
  compare: { icon: GitCompare, tone: "bg-violet-500/10 text-violet-400" },
  ask: { icon: Bot, tone: "bg-emerald-500/10 text-emerald-400" },
  download: { icon: Download, tone: "bg-amber-500/10 text-amber-400" },
};

function formatTimestamp(value: string): string {
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityTimeline({ reports, extraEvents = [] }: ActivityTimelineProps) {
  const uploadEvents: ActivityEvent[] = reports.map((r) => ({
    kind: "upload",
    label: `Uploaded ${r.file_name}`,
    timestamp: r.created_at,
  }));

  const events = [...uploadEvents, ...extraEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>

      <CardContent>
        {events.length > 0 ? (
          <ol className="space-y-4">
            {events.slice(0, 8).map((event, i) => {
              const config = kindConfig[event.kind];
              const Icon = config.icon;
              return (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.tone}`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="truncate text-sm text-foreground">{event.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(event.timestamp)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-sm text-muted-foreground">No activity yet.</p>
        )}
      </CardContent>
    </Card>
  );
}