"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HarvestLogo } from "@/components/harvest-logo";
import {
  LayoutGrid,
  Users,
  AlertTriangle,
  Newspaper,
  Briefcase,
  Video,
} from "lucide-react";
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Applications", icon: LayoutGrid, href: "/applications" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Alertes", icon: AlertTriangle, href: "#" },
  { label: "Actualités", icon: Newspaper, href: "#" },
  { label: "Formations", icon: Briefcase, href: "#" },
  { label: "Webinaires", icon: Video, href: "#" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={collapsed ? "p-2" : "p-4"}>
        <div className={collapsed ? "flex justify-center" : "flex items-center justify-between"}>
          <div className={collapsed ? "hidden" : ""}>
            <Link href="/applications">
              <HarvestLogo className="h-5 w-auto" />
            </Link>
          </div>
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "#" && pathname.startsWith(item.href + "/"));
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={isActive}
                      tooltip={item.label}
                    >
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                JD
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">John DOE</span>
                <span className="truncate text-xs text-muted-foreground">john@harvest.fr</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
