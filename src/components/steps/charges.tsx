"use client";

import { useState, useCallback } from "react";
import { AccordionCategory, type FieldConfig, type RowData } from "@/components/accordion-category";
import { StepNavigation } from "@/components/step-navigation";
import { StepHeader } from "@/components/step-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { CheckCircle2, ArrowLeft } from "lucide-react";

let nextId = 300;
function genId() { return String(nextId++); }

function useCategoryRows(initial?: RowData[]) {
  const [rows, setRows] = useState<RowData[]>(() => initial ?? [{ id: genId() }]);
  const add = useCallback(() => setRows((p) => [...p, { id: genId() }]), []);
  const remove = useCallback((id: string) => setRows((p) => p.filter((r) => r.id !== id)), []);
  const update = useCallback((id: string, key: string, value: string) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }, []);
  return { rows, add, remove, update };
}

const fields: FieldConfig[] = [
  { key: "nature", label: "Nature", type: "select", options: ["Impôt sur le revenu", "Taxe foncière", "Taxe d'habitation", "Pension alimentaire", "Autre"], className: "w-40" },
  { key: "libelle", label: "Libellé", type: "text", className: "flex-1" },
  { key: "montant", label: "Montant annuel", type: "number", suffix: "€", className: "w-40" },
];

export function ChargesStep() {
  const generales = useCategoryRows([
    { id: "c1", nature: "Impôt sur le revenu", libelle: "IR 2025", montant: "18 500" },
    { id: "c2", nature: "Taxe foncière", libelle: "TF Appartement Paris", montant: "2 800" },
    { id: "c3", nature: "Taxe foncière", libelle: "TF Maison Deauville", montant: "1 600" },
  ]);
  const deductibles = useCategoryRows([
    { id: "c4", nature: "Pension alimentaire", libelle: "Pension ex-conjoint", montant: "7 200" },
  ]);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div>
      <StepHeader
        title="Charges"
        description="Renseignez les charges fixes et les dépenses déductibles."
      />
      <div className="space-y-4">
        <AccordionCategory title="Charges générales et fiscales" fields={fields} rows={generales.rows} onAdd={generales.add} onRemove={generales.remove} onUpdate={generales.update} />
        <AccordionCategory title="Charges déductibles du revenu ou de l\u2019impôt" fields={fields} rows={deductibles.rows} onAdd={deductibles.add} onRemove={deductibles.remove} onUpdate={deductibles.update} />
      </div>

      <StepNavigation showNext={false} />

      {/* CTA — Ajouter le KYC */}
      <div className="mt-6 flex justify-end">
        <Button size="lg" onClick={() => setShowConfirm(true)}>
          Ajouter le KYC dans Harvest
        </Button>
      </div>

      {/* Confirmation modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="size-6 text-primary" />
              </div>
              <DialogTitle>KYC créé avec succès</DialogTitle>
              <DialogDescription>
                Le dossier KYC a bien été ajouté dans Harvest. Vous pouvez le retrouver dans la liste des dossiers clients.
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="size-4" />
                  Retour
                </Button>
              }
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
