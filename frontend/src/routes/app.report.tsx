import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/app/report")({
  component: ReportLayout,
});

function ReportLayout() {
  return <Outlet />;
} 