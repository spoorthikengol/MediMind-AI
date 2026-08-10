export type Report = {
  id: string;
  name: string;
  date: string;
  type: string;
  healthScore: number;
  riskLevel: "Low" | "Moderate" | "High";
  summary: string;
  metrics: { name: string; value: number; unit: string; normal: string; status: "normal" | "high" | "low" }[];
};

export const mockReports: Report[] = [
  {
    id: "r-004",
    name: "Complete Blood Panel",
    date: "2026-07-02",
    type: "Blood Test",
    healthScore: 86,
    riskLevel: "Low",
    summary:
      "Overall excellent results. Cholesterol markers improved 12% since last panel. Vitamin D remains slightly below optimal — consider daily supplementation.",
    metrics: [
      { name: "Hemoglobin", value: 14.8, unit: "g/dL", normal: "13.5 – 17.5", status: "normal" },
      { name: "LDL Cholesterol", value: 98, unit: "mg/dL", normal: "< 100", status: "normal" },
      { name: "HDL Cholesterol", value: 62, unit: "mg/dL", normal: "> 40", status: "normal" },
      { name: "Glucose (fasting)", value: 92, unit: "mg/dL", normal: "70 – 99", status: "normal" },
      { name: "Vitamin D", value: 24, unit: "ng/mL", normal: "30 – 100", status: "low" },
      { name: "TSH", value: 2.1, unit: "mIU/L", normal: "0.4 – 4.0", status: "normal" },
    ],
  },
  {
    id: "r-003",
    name: "Lipid Profile",
    date: "2026-04-18",
    type: "Blood Test",
    healthScore: 78,
    riskLevel: "Low",
    summary: "Lipid values within healthy range. Triglycerides trending down.",
    metrics: [
      { name: "Hemoglobin", value: 14.5, unit: "g/dL", normal: "13.5 – 17.5", status: "normal" },
      { name: "LDL Cholesterol", value: 112, unit: "mg/dL", normal: "< 100", status: "high" },
      { name: "HDL Cholesterol", value: 55, unit: "mg/dL", normal: "> 40", status: "normal" },
      { name: "Glucose (fasting)", value: 96, unit: "mg/dL", normal: "70 – 99", status: "normal" },
      { name: "Vitamin D", value: 22, unit: "ng/mL", normal: "30 – 100", status: "low" },
      { name: "TSH", value: 2.4, unit: "mIU/L", normal: "0.4 – 4.0", status: "normal" },
    ],
  },
  {
    id: "r-002",
    name: "Annual Physical",
    date: "2026-01-14",
    type: "General",
    healthScore: 72,
    riskLevel: "Moderate",
    summary: "Blood pressure slightly elevated. Recommend lifestyle adjustments and follow-up in 3 months.",
    metrics: [
      { name: "Hemoglobin", value: 14.1, unit: "g/dL", normal: "13.5 – 17.5", status: "normal" },
      { name: "LDL Cholesterol", value: 128, unit: "mg/dL", normal: "< 100", status: "high" },
      { name: "HDL Cholesterol", value: 48, unit: "mg/dL", normal: "> 40", status: "normal" },
      { name: "Glucose (fasting)", value: 104, unit: "mg/dL", normal: "70 – 99", status: "high" },
      { name: "Vitamin D", value: 19, unit: "ng/mL", normal: "30 – 100", status: "low" },
      { name: "TSH", value: 2.8, unit: "mIU/L", normal: "0.4 – 4.0", status: "normal" },
    ],
  },
  {
    id: "r-001",
    name: "Baseline Screening",
    date: "2025-09-08",
    type: "Screening",
    healthScore: 68,
    riskLevel: "Moderate",
    summary: "Baseline established. Several markers warrant monitoring.",
    metrics: [
      { name: "Hemoglobin", value: 13.9, unit: "g/dL", normal: "13.5 – 17.5", status: "normal" },
      { name: "LDL Cholesterol", value: 134, unit: "mg/dL", normal: "< 100", status: "high" },
      { name: "HDL Cholesterol", value: 44, unit: "mg/dL", normal: "> 40", status: "normal" },
      { name: "Glucose (fasting)", value: 108, unit: "mg/dL", normal: "70 – 99", status: "high" },
      { name: "Vitamin D", value: 17, unit: "ng/mL", normal: "30 – 100", status: "low" },
      { name: "TSH", value: 3.0, unit: "mIU/L", normal: "0.4 – 4.0", status: "normal" },
    ],
  },
];

export const healthTrend = mockReports
  .slice()
  .reverse()
  .map((r) => ({
    date: new Date(r.date).toLocaleDateString("en", { month: "short", year: "2-digit" }),
    score: r.healthScore,
    ldl: r.metrics.find((m) => m.name === "LDL Cholesterol")?.value ?? 0,
    glucose: r.metrics.find((m) => m.name === "Glucose (fasting)")?.value ?? 0,
  }));

export const suggestedQuestions = [
  "What does my latest LDL reading mean?",
  "How can I improve my Vitamin D levels?",
  "Am I at risk for diabetes?",
  "Explain my last report in simple terms",
];