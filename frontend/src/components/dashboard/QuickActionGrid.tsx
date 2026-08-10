import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Upload, GitCompare, History, Bot, Stethoscope } from "lucide-react";
import { motion } from "framer-motion";

interface QuickAction {
  to: string;
  icon: LucideIcon;
  label: string;
}

const actions: QuickAction[] = [
  { to: "/app/upload", icon: Upload, label: "Upload Report" },
  { to: "/app/comparison", icon: GitCompare, label: "Compare Reports" },
  { to: "/app/history", icon: History, label: "History" },
  { to: "/app/assistant", icon: Bot, label: "Ask AI" },
  { to: "/app/doctor", icon: Stethoscope, label: "Doctor Dashboard" },
];

export function QuickActionGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <Link
              to={action.to}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-5 text-center transition-colors hover:border-brand/40 hover:bg-brand/5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-foreground">
                {action.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}