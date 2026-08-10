import { Card, CardContent } from "@/components/ui/card";

export function ReportCardSkeleton() {
  return (
    <Card className="card-premium border-0 shadow-card">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="w-2/3 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-white/[0.06]" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.06]" />
          </div>
          <div className="h-6 w-14 animate-pulse rounded-full bg-white/[0.06]" />
        </div>
        <div className="flex gap-4">
          <div className="h-8 w-12 animate-pulse rounded bg-white/[0.06]" />
          <div className="h-8 w-16 animate-pulse rounded bg-white/[0.06]" />
        </div>
        <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-8 w-full animate-pulse rounded bg-white/[0.06]" />
      </CardContent>
    </Card>
  );
}

export function ReportCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ReportCardSkeleton key={i} />
      ))}
    </div>
  );
}