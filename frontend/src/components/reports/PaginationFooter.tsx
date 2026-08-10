import { ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function PaginationFooter({
  page,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}) {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1
  );

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-4 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{total} reports</span>
        <span>·</span>
        <label htmlFor="page-size" className="sr-only">
          Reports per page
        </label>
        <select
          id="page-size"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-border/60 bg-transparent px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size} className="bg-background text-foreground">
              {size} / page
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pageNumbers.map((n, i) => {
          const prev = pageNumbers[i - 1];
          const showEllipsis = prev !== undefined && n - prev > 1;
          return (
            <span key={n} className="flex items-center gap-1">
              {showEllipsis && <span className="px-1 text-xs text-muted-foreground">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(n)}
                aria-current={n === page ? "page" : undefined}
                className={`h-7 min-w-7 rounded-md px-2 text-xs font-medium transition ${
                  n === page
                    ? "bg-brand text-white"
                    : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                }`}
              >
                {n}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}