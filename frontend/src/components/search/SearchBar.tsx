import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <motion.div
      className="relative"
      whileFocus={{ scale: 1.005 }}
    >
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search reports by filename or summary..."
        aria-label="Search reports"
        className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-11 text-sm text-foreground placeholder:text-muted-foreground transition-shadow focus:border-brand/40 focus:shadow-[0_0_0_3px_hsl(var(--brand)/0.15)] focus:outline-none"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </motion.div>
  );
}