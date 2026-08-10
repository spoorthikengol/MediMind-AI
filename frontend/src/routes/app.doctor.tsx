import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import { api } from "@/lib/api";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";

export const Route = createFileRoute("/app/doctor")({
  component: DoctorPage,
});

const riskBadgeStyles: Record<string, string> = {
  Low: "bg-emerald-500/10 text-emerald-400 border-0",
  Medium: "bg-amber-500/10 text-amber-400 border-0",
  High: "bg-red-500/10 text-red-400 border-0",
};

function DoctorPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");

  const fetchDoctorDashboard = useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .getDoctorDashboard()
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        setError(err?.message || "Unable to load doctor dashboard.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchDoctorDashboard();
  }, [fetchDoctorDashboard]);

  if (loading) {
    return <LoadingState label="Loading doctor dashboard..." fullScreen />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Failed to load doctor dashboard"
        message={error || "Something unexpected happened."}
        onRetry={fetchDoctorDashboard}
        fullScreen
      />
    );
  }

  const filteredPatients = data.patients.filter((patient: any) => {
    const searchMatch =
      patient.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      patient.email.toLowerCase().includes(search.toLowerCase());

    const riskMatch = riskFilter === "All" || patient.risk_level === riskFilter;

    return searchMatch && riskMatch;
  });

  const hasActiveFilter = search.trim() !== "" || riskFilter !== "All";

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
          Doctor Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Monitor and triage your patients' health reports.
        </p>
      </div>

      {/* Statistics */}

      <div className="grid md:grid-cols-4 gap-4">

        <Card>
          <CardHeader>
            <CardTitle>Total Patients</CardTitle>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold">
              {data.total_patients}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Reports</CardTitle>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold">
              {data.total_reports}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Healthy Patients</CardTitle>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold text-emerald-400">
              {data.healthy_patients}
            </h2>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>High Risk</CardTitle>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold text-red-400">
              {data.high_risk_patients}
            </h2>
          </CardContent>
        </Card>

      </div>

      {/* Search & Filter */}

      <Card>

        <CardContent className="pt-6 flex flex-col md:flex-row gap-4">

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="md:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Risks</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

        </CardContent>

      </Card>

      {/* Patient List */}

      <Card>

        <CardHeader>

          <CardTitle>
            Patient Reports
          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-4">

          {filteredPatients.length === 0 ? (

            <EmptyState
              icon={Users}
              title={hasActiveFilter ? "No matching patients" : "No patients yet"}
              description={
                hasActiveFilter
                  ? "Try adjusting your search or risk filter."
                  : "Patients will appear here once they upload reports."
              }
            />

          ) : (

            filteredPatients.map((patient: any) => (

              <div
                key={patient.id}
                className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
              >

                <div>

                  <h3 className="font-semibold">
                    {patient.patient_name}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {patient.email}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Health Score: {patient.health_score}
                  </p>

                </div>

                <div className="flex items-center gap-2">

                  <Badge
                    className={
                      riskBadgeStyles[patient.risk_level] ??
                      "bg-muted text-muted-foreground border-0"
                    }
                  >
                    {patient.risk_level}
                  </Badge>

                  <Button
                    variant="outline"
                    asChild
                  >
                    <Link
                      to="/app/report/$id"
                      params={{
                        id: String(patient.id),
                      }}
                    >
                      View
                    </Link>
                  </Button>

                  <Button
                    onClick={() =>
                      api.downloadReport(patient.id)
                    }
                  >
                    Download
                  </Button>

                </div>

              </div>

            ))

          )}

        </CardContent>

      </Card>

    </div>
  );
}