"use client";

import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWizard } from "@/lib/wizard-context";
import { useClients } from "@/lib/clients-store";
import { Save, Sun, Moon } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { formData } = useWizard();
  const { addClient } = useClients();
  const router = useRouter();

  const handleCreateClient = () => {
    const sp = formData.situationPersonnelle;
    const isPro = ["Chef d'entreprise", "Profession libérale", "Artisan/Commerçant"].includes(sp.professionCSP);
    addClient({
      firstName: sp.prenom,
      lastName: sp.nom,
      email: sp.email,
      phone: sp.telephone,
      type: isPro ? "Professionnel" : "Particulier",
      status: "Actif",
      formData,
    });
    router.push("/clients");
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-end border-b bg-card px-6">
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
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => router.push("/clients")}>
          Abandonner
        </Button>
        <Button size="sm" className="bg-[#0052CC] text-white transition-all hover:bg-[#0052CC]/90" onClick={handleCreateClient}>
          Créer le dossier
        </Button>
      </div>
    </header>
  );
}
