"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Bell, HelpCircle, Sun, Moon } from "lucide-react";

export function AppLayout({
  title,
  subtitle,
  actions,
  hideIcons,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  hideIcons?: boolean;
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              {subtitle && <>{subtitle}</>}
            </div>
            <div className="flex items-center gap-2">
              {actions && <>{actions}</>}
              {!hideIcons && (
                <>
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
                </>
              )}
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col overflow-hidden p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
