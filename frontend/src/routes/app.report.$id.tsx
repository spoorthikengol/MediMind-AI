import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ReactMarkdown from "react-markdown";
import MedicalCard from "@/components/MedicalCard";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/app/report/$id")({
  component: ReportPage,
});

function ReportPage() {


  const { id } = Route.useParams();

  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {

    console.log("Opening report ID:", id);

    api.getReportDetails(Number(id))
      .then((data) => {

  console.log(data);

  setReport(data);

})
      .catch(async (err) => {

  console.error("Report Error:", err);

  alert(err.message);

  setError(err.message);

});

  }, [id]);


  if (error) {
    return (
      <div className="p-8 text-red-500">
        {error}
      </div>
    );
  }


  if (!report) {
    return (
      <div className="p-8">
        Loading report...
      </div>
    );
  }


  return (

    <div className="space-y-6">


      <h1 className="text-4xl font-bold">
        Medical Report
      </h1>


      {/* Report Information */}

      <Card>

        <CardHeader>
          <CardTitle>
            Report Information
          </CardTitle>
        </CardHeader>


        <CardContent className="space-y-3">


          <p>
            <b>Report ID:</b> {report.report_id}
          </p>


          <p>
            <b>Filename:</b> {report.filename}
          </p>


          <p>
            <b>Uploaded:</b> {report.uploaded_at}
          </p>


        </CardContent>

      </Card>



      {/* Health Result */}

      <Card>

        <CardHeader>
          <CardTitle>
            Health Result
          </CardTitle>
        </CardHeader>


        <CardContent>


          <div className="flex gap-3">


            <Badge>
              Score {report.health_score}
            </Badge>


            <Badge variant="outline">
              {report.risk_level}
            </Badge>


            <Badge variant="secondary">
              {report.overall_status}
            </Badge>


          </div>


        </CardContent>

      </Card>



      {/* Medical Summary */}

      <Card className="card-premium">
  <CardHeader>
    <CardTitle>
      🤖 AI Medical Summary
    </CardTitle>
  </CardHeader>

  <CardContent>

    <div className="max-w-[720px]">

      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h3
              className="mt-6 mb-2 border-b border-white/10 pb-2 text-lg font-semibold text-foreground first:mt-0"
              {...props}
            />
          ),
          h2: ({ ...props }) => (
            <h4
              className="mt-5 mb-2 text-base font-semibold text-foreground"
              {...props}
            />
          ),
          h3: ({ ...props }) => (
            <h5
              className="mt-4 mb-1.5 text-[15px] font-semibold text-foreground"
              {...props}
            />
          ),
          p: ({ ...props }) => (
            <p
              className="mb-3 text-[15px] leading-[1.8] text-muted-foreground"
              {...props}
            />
          ),
          ul: ({ ...props }) => (
            <ul
              className="mb-3 ml-5 list-disc space-y-1.5 text-[15px] leading-[1.8] text-muted-foreground"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="mb-3 ml-5 list-decimal space-y-1.5 text-[15px] leading-[1.8] text-muted-foreground"
              {...props}
            />
          ),
          li: ({ ...props }) => <li {...props} />,
          strong: ({ ...props }) => (
            <strong className="font-semibold text-foreground" {...props} />
          ),
        }}
      >
        {report.medical_summary}
      </ReactMarkdown>

    </div>

  </CardContent>
</Card>




      {/* Blood Values */}

      <Card>

  <CardHeader>

    <CardTitle>
      Blood Parameters
    </CardTitle>

  </CardHeader>

  <CardContent>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      {Object.entries(report.enriched_report)
  .filter(([_, item]: any) => item.value !== null && item.value !== "")
  .map(

        ([key, item]: any) => (

          <MedicalCard

            key={key}

            name={key}

            value={item.value}

            unit={item.unit}

            normal_range={item.normal_range}

            status={item.status}

            description={item.description}

          />

        )

      )}

    </div>

  </CardContent>

</Card>

{/* AI Analysis */}

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

  {Object.entries(report.analysis)
    .filter(
      ([_, value]) =>
        value !== null &&
        value !== ""
    )
    .map(([key, value]) => (

      <Card
        key={key}
        className="shadow-md border"
      >

        <CardContent className="p-5">

          <div>

            <p className="text-sm text-slate-400">
              {key}
            </p>

            <h2
              className={`text-xl font-bold mt-2
                ${
                  value === "High"
                    ? "text-red-500"
                    : value === "Low"
                    ? "text-blue-500"
                    : value === "Normal"
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
            >
              {String(value)}
            </h2>

          </div>

        </CardContent>

      </Card>

    ))}

</div>



      

      {/* Recommendations */}

<Card className="border-slate-800 bg-slate-900/60">

  <CardHeader>
    <CardTitle className="text-xl text-slate-100">
      Recommendations
    </CardTitle>
  </CardHeader>

  <CardContent>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

      {/* Diet */}
      <Card className="border-slate-800 bg-slate-950/50">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">
            🥗 Diet
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            {(report.recommendations.diet || []).map(
              (item: any, index: number) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Exercise */}
      <Card className="border-slate-800 bg-slate-950/50">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">
            🏃 Exercise
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            {(report.recommendations.exercise || []).map(
              (item: any, index: number) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Hydration */}
      <Card className="border-slate-800 bg-slate-950/50">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">
            💧 Hydration
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            {(report.recommendations.hydration || []).map(
              (item: any, index: number) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Sleep */}
      <Card className="border-slate-800 bg-slate-950/50">
        <CardHeader>
          <CardTitle className="text-base text-slate-200">
            😴 Sleep
          </CardTitle>
        </CardHeader>

        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm text-slate-300">
            {(report.recommendations.sleep || []).map(
              (item: any, index: number) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        </CardContent>
      </Card>

    </div>

  </CardContent>

</Card>





      {/* Download */}

      <Button
        onClick={() =>
          api.downloadReport(report.report_id)
        }
      >

        Download PDF

      </Button>


    </div>

  );
}