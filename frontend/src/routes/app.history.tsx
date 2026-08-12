import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import {
  FileText,
  Search,
  ArrowRight,
} from "lucide-react";

import { api } from "@/lib/api";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/app/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api
      .getHistory()
      .then((data) => {
        console.log("History Data:", data);
        setHistory(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to load history");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Search
  const filteredReports = history.filter((report) =>
    report.file_name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.max(
    1,
    Math.ceil(filteredReports.length / pageSize)
  );

  const startIndex = (currentPage - 1) * pageSize;

  const paginatedReports = filteredReports.slice(
    startIndex,
    startIndex + pageSize
  );

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading History...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">
          Report History
        </h1>

        <p className="text-muted-foreground mt-1">
          View all uploaded medical reports.
        </p>
      </div>

      {/* SEARCH */}
      <Card className="card-premium">
        <CardContent className="p-4">

          <div className="relative">

            <Search
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                h-4
                w-4
                text-muted-foreground
              "
            />

            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
            />

          </div>

        </CardContent>
      </Card>

      {/* REPORTS */}

      {filteredReports.length === 0 ? (

        <Card className="card-premium">

          <CardContent className="p-16 text-center">

            <FileText
              className="
                h-14
                w-14
                mx-auto
                text-muted-foreground
              "
            />

            <h3 className="mt-4 text-xl font-semibold">
              No Reports Found
            </h3>

          </CardContent>

        </Card>

      ) : (

        <div className="space-y-4">

          {paginatedReports.map((report) => (

            <Card
              key={report.id}
              className="card-premium"
            >

              <CardContent className="p-5">

                <div className="flex justify-between">

                  <div>

                    <div className="flex items-center gap-2">

                      <FileText
                        className="h-5 w-5 text-brand"
                      />

                      <h2 className="font-semibold text-lg">
                        {report.file_name}
                      </h2>

                    </div>

                    <p className="text-sm text-muted-foreground mt-2">
                      Uploaded:{" "}
                      {report.created_at}
                    </p>

                  </div>

                  <div className="text-right">

                    <div className="text-3xl font-bold">
                      {report.health_score}
                    </div>

                    <p className="text-xs">
                      Health Score
                    </p>

                  </div>

                </div>

                <div className="flex justify-between items-center mt-5">

                  <div className="flex gap-3">

                    <Badge>
                      {report.overall_status}
                    </Badge>

                    <Badge variant="outline">
                      {report.risk_level} Risk
                    </Badge>

                  </div>

                  <Button asChild>

                    <Link
                      to="/app/report/$id"
                      params={{
                        id: report.id.toString(),
                      }}
                    >

                      View Details

                      <ArrowRight
                        className="ml-2 h-4 w-4"
                      />

                    </Link>

                  </Button>

                </div>

              </CardContent>

            </Card>

          ))}

        </div>

      )}

      {/* PAGINATION */}

      {filteredReports.length > 0 && (

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-6">

          {/* PAGE SIZE */}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <span>
              Show
            </span>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 rounded-md border bg-background px-3"
            >

              <option value={10}>
                10
              </option>

              <option value={20}>
                20
              </option>

              <option value={50}>
                50
              </option>

            </select>

            <span>
              reports
            </span>

          </div>

          {/* PREVIOUS / NEXT */}

          <div className="flex items-center gap-3">

            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(
                  (page) => page - 1
                )
              }
            >
              Previous
            </Button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              disabled={
                currentPage === totalPages
              }
              onClick={() =>
                setCurrentPage(
                  (page) => page + 1
                )
              }
            >
              Next
            </Button>

          </div>

        </div>

      )}

    </div>
  );
}