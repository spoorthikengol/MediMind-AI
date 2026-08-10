import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Upload,
  History,
  GitCompareArrows,
  Bot,
  User,
  LogOut,
  Activity,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { Logo } from "./logo";
import { api } from "@/lib/api";
import { toast } from "sonner";

const items = [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Upload Report",
    url: "/app/upload",
    icon: Upload,
  },
  {
    title: "History",
    url: "/app/history",
    icon: History,
  },
  {
    title: "Comparison",
    url: "/app/comparison",
    icon: GitCompareArrows,
  },
  {
    title: "AI Assistant",
    url: "/app/assistant",
    icon: Bot,
  },
  {
    title: "Doctor Dashboard",
    url: "/app/doctor",
    icon: Activity,
  },
  {
    title: "Profile",
    url: "/app/profile",
    icon: User,
  },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                    >
                      <Link
                        to={item.url}
                        className="flex items-center gap-3"
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => {
                api.logout();
                toast.success("Signed out");
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}