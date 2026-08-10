import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  /** Fills the viewport height, for whole-page load failures. */
  fullScreen?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 text-center ${
        fullScreen ? "h-screen" : "py-14"
      }`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw className="mr-2 h-3.5 w-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}