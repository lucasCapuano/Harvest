"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import { HarvestLogo } from "@/components/harvest-logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutGrid,
  Users,
  AlertTriangle,
  Newspaper,
  Briefcase,
  Video,
  Bell,
  HelpCircle,
  Sun,
  Moon,
} from "lucide-react";

const navItems = [
  { label: "Applications", icon: LayoutGrid, href: "/applications" },
  { label: "Clients", icon: Users, href: "/clients" },
  { label: "Alertes", icon: AlertTriangle, href: "#" },
  { label: "Actualités", icon: Newspaper, href: "#" },
  { label: "Formations", icon: Briefcase, href: "#" },
  { label: "Webinaires", icon: Video, href: "#" },
];

export function AppLayout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen bg-muted/40">
      {/* Sidebar */}
      <aside className="flex w-[250px] shrink-0 flex-col border-r bg-card">
        <div className="flex flex-1 flex-col gap-8 py-6">
          <div className="px-4">
            <Link href="/applications">
              <HarvestLogo className="h-5 w-auto" />
            </Link>
          </div>

          <nav className="flex flex-col gap-2 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#0052CC] text-white shadow-md shadow-[#0052CC]/25"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              JD
            </div>
            <span className="text-sm font-medium text-foreground">
              John DOE
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <ScrollArea className="flex-1">
        <div className="p-10">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Changer de thème"
              >
                <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="size-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <HelpCircle className="size-4" />
              </Button>
            </div>
          </div>
          {children}
        </div>
      </ScrollArea>
    </div>
  );
}
