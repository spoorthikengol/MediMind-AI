import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ComparisonHighlight } from "@/types/comparison";

interface ComparisonHighlightsProps {
  highlights: ComparisonHighlight[];
}

export function ComparisonHighlights({ highlights }: ComparisonHighlightsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Highlights</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {highlights.map((highlight, i) => (
            <motion.div
              key={highlight.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${
                highlight.is_placeholder
                  ? "border-white/5 bg-white/[0.01] opacity-70"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20"
              }`}
            >
              <span className="text-xl leading-none">{highlight.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{highlight.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {highlight.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}