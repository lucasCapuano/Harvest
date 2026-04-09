"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClientsProvider } from "@/lib/clients-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <ClientsProvider>
          {children}
        </ClientsProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
