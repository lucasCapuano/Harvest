"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bell, HelpCircle, Sun, Moon } from "lucide-react";

export function AppLayout({
  title,
  subtitle,
  actions,
  titleAction,
  headerTabs,
  hideIcons,
  children,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  titleAction?: React.ReactNode;
  headerTabs?: React.ReactNode;
  hideIcons?: boolean;
  children: React.ReactNode;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="shrink-0 border-b">
          <div className="flex h-16 items-center gap-2 px-6 lg:px-8">
            <div className="flex flex-1 items-center justify-between">
              <div className="flex items-center gap-1.5">
                <SidebarTrigger />
                <h1 className="text-[16px] font-semibold text-foreground">{title}</h1>
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
                    <Button
                      variant="outline"
                      className="inline-flex h-9 items-center gap-1.5 px-3 text-sm font-medium"
                    >
                      <HelpCircle className="size-4" />
                      Aide
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          {headerTabs && (
            <div className="px-6 lg:px-8">
              {headerTabs}
            </div>
          )}
        </header>
        <div className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-[1240px] px-4 pt-6 pb-6 sm:px-6 lg:px-8" style={{ marginTop: "16px" }}>
            {typeof title === "string" && (
              <div className="mb-8 flex items-center justify-between">
                <h2 className="text-[22px] font-semibold text-foreground">{title}</h2>
                {titleAction && <>{titleAction}</>}
              </div>
            )}
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
