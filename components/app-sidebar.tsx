"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Tags,
  Gamepad2,
  LayoutDashboard,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Work Orders",
    url: "/dashboard/work-orders",
    icon: Wrench,
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: Users,
  },
  {
    title: "Devices",
    url: "/dashboard/devices",
    icon: Gamepad2,
  },
  { title: "Pricing", url: "/dashboard/pricing", icon: Tags },
];

const toolItems = [
  {
    title: "Controller Tools",
    url: "/dashboard/tools/controller",
  },
  {
    title: "UART Terminal",
    url: "/dashboard/tools/uart",
  },
  {
    title: "Multimeter",
    url: "/dashboard/tools/multimeter",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isToolsPage = pathname.startsWith("/dashboard/tools");

  const [toolsOpen, setToolsOpen] = useState(isToolsPage);

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-3">
          <div className="text-lg font-semibold tracking-tight">
            Repair Admin
          </div>

          <div className="text-xs text-muted-foreground">
            Technician Dashboard
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={
                      pathname === item.url ||
                      (item.url !== "/dashboard" &&
                        pathname.startsWith(item.url + "/"))
                    }
                    render={<Link href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Tools"
                  onClick={() => setToolsOpen((open) => !open)}
                >
                  <Wrench />
                  <span>Tools</span>

                  <ChevronRight
                    className={`ml-auto transition-transform ${
                      toolsOpen ? "rotate-90" : ""
                    }`}
                  />
                </SidebarMenuButton>

                {toolsOpen && (
                  <div className="ml-7 mt-1 space-y-1 border-l pl-3">
                    {toolItems.map((tool) => (
                      <SidebarMenuButton
                        key={tool.title}
                        size="sm"
                        render={<Link href={tool.url} />}
                      >
                        <span>{tool.title}</span>
                      </SidebarMenuButton>
                    ))}
                  </div>
                )}
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Settings"
                  render={<Link href="/dashboard/settings" />}
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 py-2">
          <div className="text-xs text-muted-foreground">Repair Admin</div>

          <div className="text-xs text-muted-foreground/60">v0.1</div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
