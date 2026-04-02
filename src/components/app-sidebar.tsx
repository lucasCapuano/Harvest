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
  LogOut,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
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
  { label: "Alertes", icon: AlertTriangle, href: "/alertes" },
  { label: "Actualités", icon: Newspaper, href: "/actualites" },
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
            <SidebarMenu className="gap-1.5">
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
                      className={isActive ? "font-semibold" : "text-[rgb(91,91,100)]"}
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
        <SidebarMenu className="gap-4">
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
          <Separator />
          <SidebarMenuItem>
            <SidebarMenuButton className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="size-4" />
              <span>Se déconnecter</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
