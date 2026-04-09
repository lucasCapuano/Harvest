"use client";

import { useState } from "react";
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
  X,
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
  const [showInvite, setShowInvite] = useState(true);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className={collapsed ? "flex h-16 items-center justify-center px-2" : "flex h-16 justify-center px-5"}>
        <div className={collapsed ? "hidden" : ""}>
          <Link href="/applications">
            <HarvestLogo className="h-5 w-auto" />
          </Link>
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
                      className={isActive ? "font-semibold text-foreground" : "text-muted-foreground"}
                    >
                        <item.icon className={isActive ? "text-foreground" : "text-muted-foreground"} />
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
