import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InsightCard as InsightCardType } from "@/types/insights";

interface InsightsSummaryCardProps {
  summary: string;
  cards: InsightCardType[];
}

export function InsightsSummaryCard({ summary, cards }: InsightsSummaryCardProps) {
  return (
    <Card className="card-premium border-0 shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-brand" />
          AI Health Insights
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-[1.7] text-muted-foreground">{summary}</p>

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((card, i) => (
            <motion.div
              key={card.type}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3.5"
            >
              <span className="text-lg leading-none">{card.icon}</span>
              <div>
                <p className="text-sm font-medium text-foreground">{card.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{card.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}