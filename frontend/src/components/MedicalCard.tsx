type Props = {
  name: string;
  value: any;
  unit: string;
  normal_range: string;
  status: string;
  description: string;
};

export default function MedicalCard({
  name,
  value,
  unit,
  normal_range,
  status,
  description,
}: Props) {
  const statusColor =
    status === "Normal"
      ? "text-green-500"
      : status === "High"
      ? "text-red-500"
      : status === "Low"
      ? "text-blue-500"
      : "text-yellow-500";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-md">
      {/* Header */}
      <div>
        <h2 className="text-lg font-medium text-slate-400">
          {name}
        </h2>

        <p className={`mt-2 text-lg font-semibold ${statusColor}`}>
          {status}
        </p>
      </div>

      {/* Value */}
      <h1 className="mt-4 text-3xl font-semibold text-slate-100">
        {value} {unit}
      </h1>

      {/* Normal Range */}
      <p className="mt-3 text-sm text-slate-400">
        Normal Range
      </p>

      <p className="mt-1 text-slate-200">
        {normal_range}
      </p>

      {/* Description */}
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}