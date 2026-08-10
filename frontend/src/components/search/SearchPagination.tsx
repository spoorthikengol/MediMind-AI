import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchPaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: 10 | 20 | 50 | 100) => void;
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}

export function SearchPagination({
  page,
  totalPages,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: SearchPaginationProps) {
  if (total === 0) return null;

  const pages = buildPageList(page, totalPages);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-4 sm:flex-row">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Showing {total} report{total === 1 ? "" : "s"}</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v) as 10 | 20 | 50 | 100)}>
          <SelectTrigger className="h-7 w-20 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 50, 100].map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}/page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted-foreground">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                p === page
                  ? "bg-brand text-white"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {p}
            </button>
          )
        )}

        <Button
          variant="ghost"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}