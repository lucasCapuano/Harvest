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

const SITUATION_OPTIONS = [
  "Célibataire",
  "Marié(e)",
  "Pacsé(e)",
  "Divorcé(e)",
  "Veuf(ve)",
  "Concubinage",
];

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

export function CompositionFamilialeStep() {
  const { formData, updateFormData } = useWizard();
  const data = formData.compositionFamiliale;

  const updateSituation = (value: string | null) => {
    if (value) updateFormData("compositionFamiliale", { ...data, situationFamiliale: value });
  };

  const updatePartenaire = (field: string, value: string) => {
    updateFormData("compositionFamiliale", {
      ...data,
      partenaire: { ...data.partenaire, [field]: value },
    });
  };

  const showPartner = ["Marié(e)", "Pacsé(e)", "Concubinage"].includes(
    data.situationFamiliale
  );

  return (
    <div>
      <StepHeader
        title="Composition familiale"
        description="Décrivez la situation familiale et les informations du partenaire le cas échéant."
      />

      <Card>
        <CardHeader>
          <CardTitle>Situation familiale</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Situation familiale</Label>
            <Select value={data.situationFamiliale} onValueChange={updateSituation}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="À renseigner" />
              </SelectTrigger>
              <SelectContent>
                {SITUATION_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {showPartner && (
        <>
          <Separator className="my-6" />
          <Card>
            <CardHeader>
              <CardTitle>Partenaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Civilité */}
              <div className="space-y-2">
                <Label>Civilité</Label>
                <ToggleGroup variant="outline" spacing={2}>
                  {CIVILITE_OPTIONS.map((opt) => (
                    <ToggleGroupItem
                      key={opt}
                      pressed={data.partenaire.civilite === opt}
                      onPressedChange={(pressed) => {
                        updatePartenaire("civilite", pressed ? opt : "");
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
                  <Label>Nom</Label>
                  <Input
                    value={data.partenaire.nom}
                    onChange={(e) => updatePartenaire("nom", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prénom</Label>
                  <Input
                    value={data.partenaire.prenom}
                    onChange={(e) => updatePartenaire("prenom", e.target.value)}
                  />
                </div>
              </div>

              {/* Date de naissance */}
              <div className="space-y-2">
                <Label>Date de naissance</Label>
                <Input
                  type="date"
                  value={data.partenaire.dateNaissance}
                  onChange={(e) => updatePartenaire("dateNaissance", e.target.value)}
                  className="w-60"
                  placeholder="jj / mm / aaaa"
                />
              </div>

              {/* Profession */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Profession (CSP)</Label>
                  <Select
                    value={data.partenaire.professionCSP}
                    onValueChange={(v) => { if (v) updatePartenaire("professionCSP", v); }}
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
                  <Label>Profession (libellé)</Label>
                  <Input
                    value={data.partenaire.professionLibelle}
                    onChange={(e) =>
                      updatePartenaire("professionLibelle", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <StepNavigation />
    </div>
  );
}
