import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface LoadingStateProps {
  label?: string;
  /** Fills the viewport height, for whole-page loads (e.g. route-level fetches). */
  fullScreen?: boolean;
}

export function LoadingState({
  label = "Loading...",
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "h-screen" : "py-16"
      }`}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-6 w-6 text-brand" aria-hidden="true" />
      </motion.div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}