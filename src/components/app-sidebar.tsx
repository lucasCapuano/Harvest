"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HarvestLogo } from "@/components/harvest-logo";
import {
  Blocks,
  UserRound,
  Bell,
  Globe,
  GraduationCap,
  Play,
  Send,
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
  { label: "Applications", icon: Blocks, href: "/applications" },
  { label: "Clients", icon: UserRound, href: "/clients" },
  { label: "Alertes", icon: Bell, href: "/alertes" },
  { label: "Actualités", icon: Globe, href: "/actualites" },
  { label: "Formations", icon: GraduationCap, href: "#" },
  { label: "Webinaires", icon: Play, href: "#" },
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
                      className={isActive ? "font-semibold text-[#1C1C1D] dark:text-foreground" : "text-[#5B5B64] dark:text-[rgb(91,91,100)]"}
                    >
                        <item.icon className={isActive ? "text-[rgb(28,28,29)]" : "text-[rgb(120,120,129)]"} />
                        <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-xl border bg-white dark:bg-card p-4 mx-2 mb-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-muted mb-3">
            <Send className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Inviter un collaborateur</p>
          <p className="text-xs text-muted-foreground mt-1">Partagez l&apos;accès avec votre équipe pour collaborer ensemble.</p>
        </div>
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
