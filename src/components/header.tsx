"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HarvestLogo } from "@/components/harvest-logo";
import { Save, Sun, Moon } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b bg-card px-6">
      {/* Left: Logo */}
      <Link href="/applications">
        <HarvestLogo className="h-5 w-auto" />
      </Link>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Changer de thème"
        >
          <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
          <Save className="size-3" />
          Brouillon sauvegardé
        </Badge>
        <Separator orientation="vertical" className="h-4" />
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          Abandonner
        </Button>
        <Button size="sm" className="bg-[#0052CC] text-white shadow-md shadow-[#0052CC]/30 transition-all hover:bg-[#0052CC]/90 hover:shadow-lg hover:shadow-[#0052CC]/40">
          Créer le dossier
        </Button>
      </div>
    </header>
  );
}
