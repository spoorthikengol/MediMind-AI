function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.04] ${className}`} />;
}

export function ComparisonSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6" aria-busy="true" aria-label="Loading comparison">
      <Pulse className="h-40 w-full" />
      <div className="grid gap-3 sm:grid-cols-3">
        <Pulse className="h-20" />
        <Pulse className="h-20" />
        <Pulse className="h-20" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Pulse className="h-40" />
        <Pulse className="h-40" />
      </div>
      <Pulse className="h-64 w-full" />
      <Pulse className="h-80 w-full" />
    </div>
  );
}