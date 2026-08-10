function Pulse({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/[0.04] ${className}`} />;
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading search results">
      {Array.from({ length: 5 }).map((_, i) => (
        <Pulse key={i} className="h-32 w-full" />
      ))}
    </div>
  );
}