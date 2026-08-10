import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { AuroraBg } from "@/components/aurora-bg";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !api.isAuthed()) {
      throw redirect({ to: "/login" });
    }
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <SidebarProvider>
      <AuroraBg variant="subtle" />
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/5 bg-background/40 px-4 backdrop-blur-xl">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-5" />
            <div className="flex-1" />
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-health-green animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-health-green" />
              </span>
              All systems normal
            </div>
            <Separator orientation="vertical" className="h-5" />
            <NotificationBell />
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}