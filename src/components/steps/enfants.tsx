"use client";

import { useWizard } from "@/lib/wizard-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { StepNavigation } from "@/components/step-navigation";
import { StepHeader } from "@/components/step-header";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { Plus, Users, Trash2 } from "lucide-react";
import type { Enfant } from "@/lib/types";

export function EnfantsStep() {
  const { formData, updateFormData } = useWizard();
  const enfants = formData.enfants;

  const addEnfant = () => {
    const newEnfant: Enfant = {
      id: crypto.randomUUID(),
      prenom: "",
      dateNaissance: "",
      aCharge: true,
    };
    updateFormData("enfants", [...enfants, newEnfant]);
  };

  const updateEnfant = (id: string, field: keyof Enfant, value: string | boolean) => {
    updateFormData(
      "enfants",
      enfants.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const removeEnfant = (id: string) => {
    updateFormData(
      "enfants",
      enfants.filter((e) => e.id !== id)
    );
  };

  return (
    <div>
      <StepHeader
        title="Enfants"
        description="Ajoutez les enfants à charge pour compléter le profil familial."
      />

      {enfants.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted mb-4">
              <Users className="size-6 text-muted-foreground" />
            </div>
            <h3 className="text-base font-medium mb-1">Aucun enfant renseigné</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs mb-5">
              Ajoutez les enfants à charge afin de compléter le profil familial du dossier.
            </p>
            <Button onClick={addEnfant} className="gap-2">
              <Plus className="size-4" />
              Ajouter un enfant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enfants.map((enfant, idx) => (
            <Card key={enfant.id}>
              <CardHeader>
                <CardTitle>Enfant {idx + 1}<ConfidenceBadge field="enfants" /></CardTitle>
                <CardAction>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeEnfant(enfant.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prénom</Label>
                    <Input
                      value={enfant.prenom}
                      onChange={(e) =>
                        updateEnfant(enfant.id, "prenom", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date de naissance</Label>
                    <Input
                      type="date"
                      value={enfant.dateNaissance}
                      onChange={(e) =>
                        updateEnfant(enfant.id, "dateNaissance", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={addEnfant} className="gap-2 w-full border-dashed">
            <Plus className="size-4" />
            Ajouter un enfant
          </Button>
        </div>
      )}

      <StepNavigation />
    </div>
  );
}
