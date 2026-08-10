import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState, Fragment } from "react";
import type { ReactNode } from "react";

import {
  UploadCloud,
  FileText,
  CheckCircle2,
  HeartPulse,
  Activity,
  AlertTriangle,
  Sparkles,
  Check,
  TrendingUp,
  Droplet,
  Utensils,
  Dumbbell,
  Moon,
  Brain,
  Sun,
  Pill,
  Download,
  ShieldAlert,
  Siren,
  ChevronDown,
  ChevronUp,
  FileWarning,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CircularProgressbar,
  buildStyles,
} from "react-circular-progressbar";

import "react-circular-progressbar/dist/styles.css";

import { api } from "@/lib/api";
import { toast } from "sonner";
import jsPDF from "jspdf";

export const Route = createFileRoute("/app/upload")({
  component: UploadPage,
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Status = "idle" | "uploading" | "done";
type ParamStatus = "normal" | "attention" | "unknown";

/** Backend shape isn't fully trusted, so every field stays unknown until normalized. */
interface MedicalReport {
  extracted_text?: string;
  health_score?: unknown;
  risk_level?: unknown;
  overall_status?: unknown;
  medical_summary?: unknown;
  blood_values?: unknown;
  analysis?: unknown;
  enriched_report?: unknown;
  recommendations?: unknown;
  possible_conditions?: unknown;
  critical_alerts?: unknown;
  health_trend?: unknown;
  [key: string]: unknown;
}

interface NormalizedCondition {
  label: string;
  description?: string;
}

interface NormalizedAlert {
  title: string;
  message?: string;
  severity?: string;
}

interface EnrichedSection {
  title: string;
  content: string;
}

interface TrendPoint {
  label: string;
  value?: string;
}

type SummaryBlock =
  | { type: "heading"; level: 1 | 2; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; lines: string[] };

// ---------------------------------------------------------------------------
// Generic guards + primitives
// ---------------------------------------------------------------------------

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const asRecord = (value: unknown): Record<string, unknown> =>
  isRecord(value) ? value : {};

const findByKeyInsensitive = (
  record: Record<string, unknown>,
  key: string
): unknown => {
  if (key in record) return record[key];
  const lower = key.toLowerCase();
  const match = Object.keys(record).find((k) => k.toLowerCase() === lower);
  return match ? record[match] : undefined;
};

// ---------------------------------------------------------------------------
// Core helpers (required by spec)
// ---------------------------------------------------------------------------

/** Coerces any unknown value into a trimmed, safe display string. Never returns "[object Object]". */
const safeText = (value: unknown, fallback = "N/A"): string => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : fallback;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return fallback;
};

const formatLabel = (text: string): string => {
  return text
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

/** Safely turns any backend value (string, number, array, nested object) into display text. */
const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return safeText(value);
  }
  if (Array.isArray(value)) {
    const parts = value.map(formatValue).filter((v) => v && v !== "N/A");
    return parts.length > 0 ? parts.join(", ") : "N/A";
  }
  if (isRecord(value)) {
    if ("value" in value) return formatValue(value.value);
    const primitive = Object.values(value).find(
      (v) => typeof v === "string" || typeof v === "number"
    );
    if (primitive !== undefined) return formatValue(primitive);
    return "N/A";
  }
  return "N/A";
};

/** Clamps and safely parses the health score from string/number/missing input. */
const getHealthScore = (raw: unknown): number => {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return Math.max(0, Math.min(100, Math.round(raw)));
  }
  if (typeof raw === "string") {
    const parsed = parseFloat(raw);
    if (!Number.isNaN(parsed)) return Math.max(0, Math.min(100, Math.round(parsed)));
  }
  return 0;
};

const extractStatusText = (value: unknown): string | undefined => {
  if (isRecord(value) && typeof value.status === "string") return value.status;
  return undefined;
};

const classifyStatusText = (statusText?: string): ParamStatus => {
  if (!statusText) return "unknown";
  const s = statusText.toLowerCase();
  if (
    s.includes("normal") ||
    s.includes("optimal") ||
    s.includes("good") ||
    s.includes("healthy")
  )
    return "normal";
  if (
    s.includes("high") ||
    s.includes("low") ||
    s.includes("elevated") ||
    s.includes("abnormal") ||
    s.includes("deficient") ||
    s.includes("critical") ||
    s.includes("risk") ||
    s.includes("poor")
  )
    return "attention";
  return "unknown";
};

/** Resolves a parameter's status from its own nested `status` field, falling back to the matching AI analysis entry. */
const getParamStatus = (
  key: string,
  value: unknown,
  analysis: Record<string, unknown>
): ParamStatus => {
  const ownStatus = extractStatusText(value);
  if (ownStatus) return classifyStatusText(ownStatus);

  const analysisValue = findByKeyInsensitive(analysis, key);
  if (analysisValue !== undefined) {
    const nestedStatus = extractStatusText(analysisValue);
    return classifyStatusText(nestedStatus ?? formatValue(analysisValue));
  }

  return "unknown";
};

const getHealthStatus = (score: number): { label: string; color: string } => {
  if (score >= 85) return { label: "Excellent", color: "#16a34a" };
  if (score >= 70) return { label: "Good", color: "#0ea5a5" };
  if (score >= 50) return { label: "Fair", color: "#f59e0b" };
  return { label: "Needs Attention", color: "#ef4444" };
};

const paramStatusStyles: Record<ParamStatus, string> = {
  normal: "border-green-500/30 bg-green-500/5",
  attention: "border-orange-500/30 bg-orange-500/5",
  unknown: "border-border",
};

const paramDotStyles: Record<ParamStatus, string> = {
  normal: "bg-green-500",
  attention: "bg-orange-500",
  unknown: "bg-muted-foreground/40",
};

const getCategoryIcon = (category: string): LucideIcon => {
  const c = category.toLowerCase();
  if (c.includes("diet") || c.includes("nutrition") || c.includes("food"))
    return Utensils;
  if (c.includes("exercise") || c.includes("fitness") || c.includes("activity"))
    return Dumbbell;
  if (c.includes("hydration") || c.includes("water")) return Droplet;
  if (c.includes("sleep") || c.includes("rest")) return Moon;
  if (c.includes("stress") || c.includes("mental")) return Brain;
  if (c.includes("lifestyle") || c.includes("habit")) return Sun;
  if (c.includes("medical") || c.includes("medication") || c.includes("doctor"))
    return Pill;
  return Sparkles;
};

const riskBadgeVariant = (
  riskLevel: unknown
): "default" | "secondary" | "destructive" => {
  const r = formatValue(riskLevel).toLowerCase();
  if (r === "low") return "default";
  if (r === "moderate" || r === "medium") return "secondary";
  return "destructive";
};

// ---------------------------------------------------------------------------
// Normalizers for flexible / nested backend shapes
// ---------------------------------------------------------------------------

const collectStrings = (value: unknown): string[] => {
  if (typeof value === "string" && value.trim().length > 0) return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (isRecord(value)) return Object.values(value).flatMap(collectStrings);
  return [];
};

/** Flattens arrays / nested objects / plain strings into `{ category: string[] }`. */
const normalizeRecommendations = (raw: unknown): Record<string, string[]> => {
  if (!raw) return {};
  if (typeof raw === "string") return { General: [raw] };
  if (Array.isArray(raw)) {
    const items = collectStrings(raw);
    return items.length > 0 ? { General: items } : {};
  }
  if (isRecord(raw)) {
    const result: Record<string, string[]> = {};
    Object.entries(raw).forEach(([category, value]) => {
      const items = collectStrings(value);
      if (items.length > 0) result[category] = items;
    });
    return result;
  }
  return {};
};

/** Normalizes possible_conditions whether it's a string, array of strings/objects, or a map. */
const normalizeConditions = (raw: unknown): NormalizedCondition[] => {
  if (!raw) return [];
  if (typeof raw === "string") return [{ label: raw }];

  if (Array.isArray(raw)) {
    return raw.flatMap((item): NormalizedCondition[] => {
      if (typeof item === "string") return [{ label: item }];
      if (isRecord(item)) {
        const label =
          (typeof item.name === "string" && item.name) ||
          (typeof item.condition === "string" && item.condition) ||
          (typeof item.label === "string" && item.label) ||
          formatValue(item);
        const description =
          (typeof item.description === "string" && item.description) ||
          (typeof item.details === "string" && item.details) ||
          undefined;
        return [{ label, description }];
      }
      return [];
    });
  }

  if (isRecord(raw)) {
    return Object.entries(raw).map(([key, value]) => ({
      label: formatLabel(key),
      description: formatValue(value),
    }));
  }

  return [];
};

/** Normalizes critical_alerts whether it's a string, array, or a map. */
const normalizeAlerts = (raw: unknown): NormalizedAlert[] => {
  if (!raw) return [];
  if (typeof raw === "string") return [{ title: raw }];

  if (Array.isArray(raw)) {
    return raw.flatMap((item): NormalizedAlert[] => {
      if (typeof item === "string") return [{ title: item }];
      if (isRecord(item)) {
        const title =
          (typeof item.title === "string" && item.title) ||
          (typeof item.message === "string" && item.message) ||
          formatValue(item);
        const message =
          typeof item.message === "string" && item.message !== title
            ? item.message
            : undefined;
        const severity =
          (typeof item.severity === "string" && item.severity) ||
          (typeof item.level === "string" && item.level) ||
          undefined;
        return [{ title, message, severity }];
      }
      return [];
    });
  }

  if (isRecord(raw)) {
    return Object.entries(raw).map(([key, value]) => ({
      title: formatLabel(key),
      message: formatValue(value),
    }));
  }

  return [];
};

const alertSeverityStyles = (severity?: string): string => {
  const s = severity?.toLowerCase() ?? "";
  if (s.includes("high") || s.includes("critical") || s.includes("severe")) {
    return "border-red-500/30 bg-red-500/10 text-red-600";
  }
  return "border-orange-500/30 bg-orange-500/10 text-orange-600";
};

/** Converts enriched_report (arbitrary nested JSON) into readable title/content sections instead of raw JSON. */
const normalizeEnrichedReport = (raw: unknown): EnrichedSection[] => {
  if (!raw) return [];
  if (typeof raw === "string") return [{ title: "Details", content: raw }];

  if (Array.isArray(raw)) {
    const items = collectStrings(raw);
    return items.length > 0 ? [{ title: "Details", content: items.join(" ") }] : [];
  }

  if (isRecord(raw)) {
    return Object.entries(raw)
      .map(([key, value]) => {
        let content: string;
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          content = safeText(value);
        } else {
          const joined = collectStrings(value).join(" ");
          content = joined.length > 0 ? joined : formatValue(value);
        }
        return { title: formatLabel(key), content };
      })
      .filter((section) => section.content && section.content !== "N/A");
  }

  return [];
};

/** Normalizes health_trend into either a plain description or a series of timeline points. */
const normalizeHealthTrend = (raw: unknown): TrendPoint[] | string => {
  if (!raw) return "";
  if (typeof raw === "string") return raw;

  if (Array.isArray(raw)) {
    const points: TrendPoint[] = [];
    raw.forEach((item, index) => {
      if (typeof item === "string") {
        points.push({ label: item });
        return;
      }
      if (isRecord(item)) {
        const label =
          (typeof item.date === "string" && item.date) ||
          (typeof item.label === "string" && item.label) ||
          (typeof item.period === "string" && item.period) ||
          `Update ${index + 1}`;
        const rawValue = item.value ?? item.score ?? item.status;
        const value = formatValue(rawValue);
        points.push({ label, value: value !== "N/A" ? value : undefined });
      }
    });
    return points;
  }

  if (isRecord(raw)) {
    return Object.entries(raw).map(([key, value]) => ({
      label: formatLabel(key),
      value: formatValue(value),
    }));
  }

  return "";
};

// ---------------------------------------------------------------------------
// Lightweight markdown-ish text rendering (no dangerouslySetInnerHTML)
// ---------------------------------------------------------------------------

const parseSummaryBlocks = (text: string): SummaryBlock[] => {
  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: SummaryBlock[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push({ type: "paragraph", lines: paragraphBuffer });
      paragraphBuffer = [];
    }
  };

  rawLines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (line === "") {
      flushParagraph();
      return;
    }
    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "heading", level: 2, text: line.slice(3).trim() });
      return;
    }
    if (line.startsWith("# ")) {
      flushParagraph();
      blocks.push({ type: "heading", level: 1, text: line.slice(2).trim() });
      return;
    }
    if (line.startsWith("- ") || line.startsWith("* ")) {
      flushParagraph();
      const item = line.slice(2).trim();
      const last = blocks[blocks.length - 1];
      if (last && last.type === "list") {
        last.items.push(item);
      } else {
        blocks.push({ type: "list", items: [item] });
      }
      return;
    }

    paragraphBuffer.push(line);
  });

  flushParagraph();
  return blocks;
};

/** Approximate visual line count, used to decide whether to collapse the summary. */
const countVisualLines = (blocks: SummaryBlock[]): number =>
  blocks.reduce((total, block) => {
    if (block.type === "heading") return total + 1;
    if (block.type === "list") return total + block.items.length;
    return total + block.lines.length;
  }, 0);

const renderInlineMarkdown = (text: string): ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const UPLOAD_STEPS = [
  "Uploading report",
  "Extracting medical data",
  "Analyzing blood parameters",
  "Generating AI insights",
  "Creating health report",
];

const SUMMARY_CHAR_LIMIT = 420;

// ---------------------------------------------------------------------------
// PDF export
// ---------------------------------------------------------------------------

const generatePdf = (report: MedicalReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 45;

  const checkPageBreak = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }
  };

  const addSectionTitle = (title: string) => {
    checkPageBreak(14);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(title, margin, y);
    y += 6;
    doc.setDrawColor(210);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  doc.setFillColor(13, 100, 100);
  doc.rect(0, 0, pageWidth, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MediMind AI - Medical Report", margin, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, 26);
  doc.setTextColor(20, 20, 20);

  addSectionTitle("Overview");
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Health Score: ${getHealthScore(report.health_score)}/100`, margin, y);
  y += 7;
  doc.text(`Risk Level: ${formatValue(report.risk_level)}`, margin, y);
  y += 7;
  doc.text(`Overall Status: ${formatValue(report.overall_status)}`, margin, y);
  y += 10;

  const summaryText = formatValue(report.medical_summary);
  if (summaryText !== "N/A") {
    addSectionTitle("AI Medical Summary");
    doc.setFontSize(10.5);
    const lines = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
    checkPageBreak(lines.length * 5.5);
    doc.text(lines, margin, y);
    y += lines.length * 5.5 + 8;
  }

  const bloodValues = asRecord(report.blood_values);
  if (Object.keys(bloodValues).length > 0) {
    addSectionTitle("Blood Parameters");
    doc.setFontSize(10.5);
    Object.entries(bloodValues).forEach(([key, value]) => {
      checkPageBreak(6.5);
      doc.text(`${formatLabel(key)}: ${formatValue(value)}`, margin, y);
      y += 6.5;
    });
    y += 4;
  }

  const analysis = asRecord(report.analysis);
  if (Object.keys(analysis).length > 0) {
    addSectionTitle("AI Blood Analysis");
    doc.setFontSize(10.5);
    Object.entries(analysis).forEach(([key, value]) => {
      checkPageBreak(6.5);
      doc.text(`${formatLabel(key)}: ${formatValue(value)}`, margin, y);
      y += 6.5;
    });
    y += 4;
  }

  const recommendations = normalizeRecommendations(report.recommendations);
  if (Object.keys(recommendations).length > 0) {
    addSectionTitle("AI Recommendations");
    Object.entries(recommendations).forEach(([category, items]) => {
      checkPageBreak(8);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(formatLabel(category), margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10.5);
      items.forEach((item) => {
        const lines = doc.splitTextToSize(`- ${item}`, pageWidth - margin * 2 - 4);
        checkPageBreak(lines.length * 5.5);
        doc.text(lines, margin + 4, y);
        y += lines.length * 5.5;
      });
      y += 4;
    });
  }

  const conditions = normalizeConditions(report.possible_conditions);
  if (conditions.length > 0) {
    addSectionTitle("Possible Conditions");
    doc.setFontSize(10.5);
    const lines = doc.splitTextToSize(
      conditions.map((c) => c.label).join(", "),
      pageWidth - margin * 2
    );
    checkPageBreak(lines.length * 5.5);
    doc.text(lines, margin, y);
    y += lines.length * 5.5 + 8;
  }

  checkPageBreak(16);
  doc.setFontSize(8.5);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "This report contains AI-generated insights only and is not a medical diagnosis. Please consult a licensed physician.",
    margin,
    pageHeight - 12,
    { maxWidth: pageWidth - margin * 2 }
  );

  doc.save("MediMind_Report.pdf");
};

// ---------------------------------------------------------------------------
// Small presentational components
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  iconClass,
  label,
  children,
}: {
  icon: LucideIcon;
  iconClass: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Card className="border-white/10 bg-card/70 backdrop-blur-md transition-shadow hover:shadow-lg">
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconClass}`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {children}
      </CardContent>
    </Card>
  );
}

function ParameterCard({
  paramKey,
  value,
  status,
}: {
  paramKey: string;
  value: unknown;
  status: ParamStatus;
}) {
  return (
    <div
      className={`rounded-xl border p-5 text-center transition-colors ${paramStatusStyles[status]}`}
    >
      <div className="flex items-center justify-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${paramDotStyles[status]}`} />
        <p className="text-sm text-muted-foreground">{formatLabel(paramKey)}</p>
      </div>
      <h2 className="mt-2 text-2xl font-bold tracking-tight">
        {formatValue(value)}
      </h2>
      {status !== "unknown" && (
        <Badge
          className="mt-2"
          variant={status === "attention" ? "destructive" : "default"}
        >
          {status === "attention" ? "Needs Attention" : "Normal"}
        </Badge>
      )}
    </div>
  );
}

function ExpandableSummary({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const blocks = parseSummaryBlocks(text);
  const isLong = countVisualLines(blocks) > 9;

  return (
    <div className="relative max-w-[680px]">
      <div
        className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
          !expanded && isLong ? "max-h-[280px]" : "max-h-[4000px]"
        }`}
      >
        {blocks.map((block, i) => {
          if (block.type === "heading") {
            return (
              <h4
                key={i}
                className={`${
                  block.level === 1 ? "text-[17px]" : "text-[15px]"
                } mt-6 border-b border-white/10 pb-2 font-semibold text-foreground first:mt-0`}
              >
                {renderInlineMarkdown(block.text)}
              </h4>
            );
          }

          if (block.type === "list") {
            return (
              <ul key={i} className="mt-3 space-y-2">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex gap-2.5 text-[15px] leading-[1.8] text-muted-foreground sm:text-base"
                  >
                    <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                    <span className="break-words">{renderInlineMarkdown(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }

          return (
            <p
              key={i}
              className="mt-3 whitespace-pre-line break-words text-[15px] leading-[1.8] text-muted-foreground first:mt-0 sm:text-base"
            >
              {block.lines.map((line, j) => (
                <Fragment key={j}>
                  {renderInlineMarkdown(line)}
                  {j < block.lines.length - 1 && <br />}
                </Fragment>
              ))}
            </p>
          );
        })}
      </div>

      {!expanded && isLong && (
        <div className="pointer-events-none absolute inset-x-0 bottom-9 h-14 bg-gradient-to-t from-card to-transparent" />
      )}

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="relative mt-3 flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:text-brand/80"
        >
          {expanded ? "Read Less" : "Read More"}
          {expanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      )}
    </div>
  );
}
// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [report, setReport] = useState<MedicalReport | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") {
      toast.error("Invalid file type. Only PDF reports are supported.");
      return;
    }

    setFile(f);
    setStatus("uploading");
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 95) {
          clearInterval(timer);
          return old;
        }
        return old + 5;
      });
    }, 80);

    api
      .uploadReport(f)
      .then((data: MedicalReport) => {
        clearInterval(timer);

        setProgress(100);
        setStatus("done");
        setReport(data);

        localStorage.setItem("latest_report", data.extracted_text || "");
        localStorage.setItem("latest_analysis", JSON.stringify(data));

        toast.success("Medical report analyzed successfully.");
      })
      .catch((err: unknown) => {
        clearInterval(timer);
        setStatus("idle");
        setProgress(0);

        const message =
          err instanceof Error
            ? err.message
            : "Something went wrong while uploading your report. Please check your connection and try again.";
        toast.error(message);
      });
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setDragOver(false);
    setReport(null);

    localStorage.removeItem("latest_report");
    localStorage.removeItem("latest_analysis");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const downloadReport = () => {
    if (!report) return;
    generatePdf(report);
  };

  const healthScore = getHealthScore(report?.health_score);
  const healthStatus = getHealthStatus(healthScore);
  const activeStepIndex = Math.min(Math.floor(progress / 20), UPLOAD_STEPS.length - 1);

  const bloodValues = asRecord(report?.blood_values);
  const analysis = asRecord(report?.analysis);
  const enrichedSections = normalizeEnrichedReport(report?.enriched_report);
  const recommendations = normalizeRecommendations(report?.recommendations);
  const conditions = normalizeConditions(report?.possible_conditions);
  const alerts = normalizeAlerts(report?.critical_alerts);
  const summaryText = formatValue(report?.medical_summary);
  const healthTrend = normalizeHealthTrend(report?.health_trend);
  const hasTrendPoints = Array.isArray(healthTrend) && healthTrend.length > 0;
  const trendText = typeof healthTrend === "string" ? healthTrend : "";

  return (
    <div className="container mx-auto max-w-6xl p-4 sm:p-8">
      <Card className="border-white/10 bg-card/70 shadow-sm backdrop-blur-md">
        <CardContent className="p-5 sm:p-8">
          {/* Upload Screen */}
          {status === "idle" && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const f = e.dataTransfer.files[0];
                if (f) handleFile(f);
              }}
              onClick={() => inputRef.current?.click()}
              className={`cursor-pointer rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 sm:p-16 ${
                dragOver
                  ? "border-brand bg-brand/10 scale-[1.02]"
                  : "border-white/20 hover:border-brand hover:bg-brand/5"
              }`}
            >
              <input
                ref={inputRef}
                hidden
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full gradient-brand text-white shadow-lg shadow-brand/20 transition-transform duration-300 hover:scale-105">
                <UploadCloud className="h-12 w-12" />
              </div>

              <h2 className="mt-6 text-xl font-bold sm:text-2xl">
                Drag & Drop your Medical Report
              </h2>

              <p className="mt-3 text-muted-foreground">
                Upload CBC, Blood Test or Laboratory Reports (PDF)
              </p>

              <Button
                type="button"
                className="mt-8"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
              >
                Browse PDF
              </Button>

              <p className="mt-6 text-xs text-muted-foreground/70">
                Your report is analyzed securely and never shared without your
                consent.
              </p>
            </div>
          )}

          {/* Upload Processing Screen */}
          {status === "uploading" && file && (
            <div className="py-10 text-center sm:py-12">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand/10">
                <FileText className="h-12 w-12 animate-pulse text-brand" />
              </div>

              <h2 className="mt-6 text-xl font-bold sm:text-2xl">
                Analyzing Your Report...
              </h2>

              <p className="mt-2 truncate text-muted-foreground">{file.name}</p>

              <div className="mx-auto mt-8 max-w-md">
                <Progress value={progress} />
                <div className="mt-2 text-right text-sm font-semibold text-brand">
                  {progress}%
                </div>
              </div>

              <div className="mx-auto mt-8 flex max-w-sm flex-col gap-3 text-left">
                {UPLOAD_STEPS.map((step, index) => {
                  const isDone = index < activeStepIndex || progress === 100;
                  const isActive = index === activeStepIndex && progress < 100;
                  return (
                    <div key={step} className="flex items-center gap-3">
                      {isDone ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-500" />
                      ) : (
                        <span
                          className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                            isActive
                              ? "animate-pulse border-brand"
                              : "border-muted-foreground/30"
                          }`}
                        />
                      )}
                      <span
                        className={`text-sm ${
                          isDone || isActive
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {status === "done" && report && (
            <div className="space-y-8">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>

                <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
                  Analysis Complete
                </h2>

                <p className="mt-2 text-muted-foreground">
                  Your medical report has been analyzed by MediMind AI.
                </p>

                <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground/70">
                  These insights are AI-generated and are not a medical
                  diagnosis. Always confirm findings with a licensed
                  healthcare provider.
                </p>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-5 sm:grid-cols-3">
                <StatCard
                  icon={HeartPulse}
                  iconClass="bg-pink-500/10 text-pink-500"
                  label="Health Score"
                >
                  <div className="mx-auto mt-1 h-32 w-32">
                    <CircularProgressbar
                      value={healthScore}
                      text={`${healthScore}/100`}
                      styles={buildStyles({
                        textSize: "16px",
                        pathColor: healthStatus.color,
                        textColor: healthStatus.color,
                        trailColor: "rgba(148,163,184,0.15)",
                      })}
                    />
                  </div>
                  <Badge
                    className="mt-1"
                    style={{
                      backgroundColor: `${healthStatus.color}1A`,
                      color: healthStatus.color,
                    }}
                  >
                    {healthStatus.label}
                  </Badge>
                </StatCard>

                <StatCard
                  icon={Activity}
                  iconClass="bg-teal-500/10 text-teal-500"
                  label="Overall Status"
                >
                  <Badge className="mt-2 text-sm">
                    {formatValue(report.overall_status)}
                  </Badge>
                </StatCard>

                <StatCard
                  icon={AlertTriangle}
                  iconClass="bg-orange-500/10 text-orange-500"
                  label="Risk Level"
                >
                  <Badge
                    className="mt-2 text-sm"
                    variant={riskBadgeVariant(report.risk_level)}
                  >
                    {formatValue(report.risk_level)}
                  </Badge>
                </StatCard>
              </div>

              {/* Critical Alerts */}
              {alerts.length > 0 && (
                <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-2 font-semibold text-red-600">
                      <Siren className="h-5 w-5" />
                      Critical Alerts
                    </div>
                    <div className="space-y-3">
                      {alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`rounded-xl border p-4 ${alertSeverityStyles(
                            alert.severity
                          )}`}
                        >
                          <p className="font-semibold">{alert.title}</p>
                          {alert.message && (
                            <p className="mt-1 text-sm opacity-90">
                              {alert.message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Medical Summary */}
              <Card className="relative overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-md">
                <CardContent className="p-6 sm:p-8">
                  <div className="mb-5 flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      AI Medical Summary
                    </h3>
                  </div>

                  {summaryText !== "N/A" ? (
                    <ExpandableSummary text={summaryText} />
                  ) : (
                    <p className="text-muted-foreground">
                      No summary available.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* AI Blood Analysis */}
              <Card className="border-white/10 bg-card/70 backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="mb-5 text-xl font-semibold">
                    AI Blood Analysis
                  </h3>

                  {Object.keys(analysis).length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(analysis).map(([key, value]) => {
                        const paramStatus = getParamStatus(key, value, analysis);
                        return (
                          <div
                            key={key}
                            className={`flex items-center justify-between rounded-xl border p-4 ${paramStatusStyles[paramStatus]}`}
                          >
                            <span className="font-medium">
                              {formatLabel(key)}
                            </span>
                            <Badge
                              variant={
                                paramStatus === "attention"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {formatValue(value)}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No AI analysis available.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Enriched Report */}
              {enrichedSections.length > 0 && (
                <Card className="border-white/10 bg-card/70 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-brand" />
                      <h3 className="text-xl font-semibold">
                        Enriched Report
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {enrichedSections.map((section, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/10 p-4"
                        >
                          <p className="text-sm font-semibold text-brand">
                            {section.title}
                          </p>
                          <p className="mt-1.5 leading-7 text-muted-foreground">
                            {section.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Recommendations */}
              <Card className="border-white/10 bg-card/70 backdrop-blur-md">
                <CardContent className="p-6">
                  <h3 className="mb-5 text-xl font-semibold">
                    AI Recommendations
                  </h3>

                  {Object.keys(recommendations).length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(recommendations).map(
                        ([category, items]) => {
                          const CategoryIcon = getCategoryIcon(category);
                          return (
                            <div
                              key={category}
                              className="rounded-xl border border-white/10 p-5 transition-shadow hover:shadow-md"
                            >
                              <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-blue-500">
                                <CategoryIcon className="h-5 w-5" />
                                {formatLabel(category)}
                              </h4>

                              {items.map((item, index) => (
                                <div key={index} className="mb-2 flex gap-3">
                                  <Check className="h-5 w-5 shrink-0 text-green-500" />
                                  <p className="text-sm leading-6">{item}</p>
                                </div>
                              ))}
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No recommendations available.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Possible Conditions */}
              <Card className="border-white/10 bg-card/70 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-orange-500" />
                    <h3 className="text-xl font-semibold">
                      Possible Conditions
                    </h3>
                  </div>

                  {conditions.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2">
                        {conditions.map((condition, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-orange-500/30 bg-orange-500/10 text-orange-600 hover:bg-orange-500/15"
                            title={condition.description}
                          >
                            {condition.label}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-4 text-xs text-muted-foreground/80">
                        These are AI-suggested considerations based on your
                        report, not a diagnosis. Please consult a doctor for
                        confirmation.
                      </p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">
                      No possible conditions detected.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Health Trend */}
              <Card className="border-white/10 bg-card/70 backdrop-blur-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-brand" />
                    <h3 className="text-xl font-semibold">Health Trend</h3>
                  </div>

                  {hasTrendPoints ? (
                    <div className="relative ml-2 space-y-6 border-l border-white/10 pl-6">
                      {(healthTrend as TrendPoint[]).map((point, index) => (
                        <div key={index} className="relative">
                          <span className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border-2 border-brand bg-background" />
                          <p className="text-sm font-semibold">
                            {point.label}
                          </p>
                          {point.value && (
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {point.value}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      {trendText ||
                        "First report uploaded. Future reports will show your health trend."}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg">
                  <Link to="/app/dashboard">View Dashboard</Link>
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={downloadReport}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Medical Report
                </Button>

                <Button variant="outline" size="lg" onClick={reset}>
                  Upload Another Report
                </Button>
              </div>
            </div>
          )}

          {/* Defensive fallback: status is "done" but report failed to parse */}
          {status === "done" && !report && (
            <div className="py-16 text-center">
              <FileWarning className="mx-auto h-12 w-12 text-orange-500" />
              <h2 className="mt-4 text-xl font-bold">
                We couldn&apos;t load this report
              </h2>
              <p className="mt-2 text-muted-foreground">
                Something went wrong while reading the analysis. Please try
                uploading again.
              </p>
              <Button variant="outline" className="mt-6" onClick={reset}>
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default UploadPage;