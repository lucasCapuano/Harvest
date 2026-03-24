"use client";

import { useWizard } from "@/lib/wizard-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepNavigation } from "@/components/step-navigation";
import { StepHeader } from "@/components/step-header";
import type { Civilite } from "@/lib/types";

const CSP_OPTIONS = [
  "Salarié Article 36",
  "Salarié cadre",
  "Salarié non cadre",
  "Fonctionnaire",
  "Profession libérale",
  "Commerçant / Artisan",
  "Agriculteur",
  "Retraité",
  "Sans activité",
];

const CIVILITE_OPTIONS: Civilite[] = ["Monsieur", "Madame", "Mademoiselle"];

export function SituationPersonnelleStep() {
  const { formData, updateFormData } = useWizard();
  const data = formData.situationPersonnelle;

  const update = (field: string, value: string) => {
    updateFormData("situationPersonnelle", { ...data, [field]: value });
  };

  return (
    <div>
      <StepHeader
        title="Situation personnelle"
        description="Renseignez les informations d'état civil et les coordonnées du client."
      />

      <Card>
        <CardHeader>
          <CardTitle>État civil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Civilité */}
          <div className="space-y-2">
            <Label>Civilité</Label>
            <ToggleGroup variant="outline" spacing={2}>
              {CIVILITE_OPTIONS.map((opt) => (
                <ToggleGroupItem
                  key={opt}
                  pressed={data.civilite === opt}
                  onPressedChange={(pressed) => {
                    update("civilite", pressed ? opt : "");
                  }}
                >
                  {opt}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Nom / Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={data.nom}
                onChange={(e) => update("nom", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={data.prenom}
                onChange={(e) => update("prenom", e.target.value)}
              />
            </div>
          </div>

          {/* Date de naissance */}
          <div className="space-y-2">
            <Label htmlFor="dateNaissance">Date de naissance</Label>
            <Input
              id="dateNaissance"
              type="date"
              value={data.dateNaissance}
              onChange={(e) => update("dateNaissance", e.target.value)}
              className="w-60"
            />
          </div>

          {/* Profession */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Profession (CSP)</Label>
              <Select
                value={data.professionCSP}
                onValueChange={(v) => { if (v) update("professionCSP", v); }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="À renseigner" />
                </SelectTrigger>
                <SelectContent>
                  {CSP_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="professionLibelle">Profession (libellé)</Label>
              <Input
                id="professionLibelle"
                value={data.professionLibelle}
                onChange={(e) => update("professionLibelle", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* Coordonnées */}
      <Card>
        <CardHeader>
          <CardTitle>Coordonnées</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                value={data.telephone}
                onChange={(e) => update("telephone", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Champ optionnel</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Champ optionnel</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <StepNavigation showPrev={false} />
    </div>
  );
}
