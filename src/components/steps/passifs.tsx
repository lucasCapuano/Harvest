"use client";

import { useState, useCallback } from "react";
import { AccordionCategory, type FieldConfig, type RowData } from "@/components/accordion-category";
import { StepNavigation } from "@/components/step-navigation";
import { StepHeader } from "@/components/step-header";

let nextId = 100;
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
  { key: "nature", label: "Nature", type: "select", options: ["Prêt amortissable", "Prêt in fine", "Crédit-bail"], className: "w-40" },
  { key: "libelle", label: "Libellé", type: "text", className: "flex-1" },
  { key: "montant", label: "Capital restant dû", type: "number", suffix: "€", className: "w-40" },
];

export function PassifsStep() {
  const pretImmo = useCategoryRows([
    { id: "p1", nature: "Prêt amortissable", libelle: "Crédit Appartement Paris", montant: "320 000" },
    { id: "p2", nature: "Prêt amortissable", libelle: "Crédit Maison Deauville", montant: "145 000" },
  ]);
  const pretPro = useCategoryRows([
    { id: "p3", nature: "Crédit-bail", libelle: "Leasing véhicule société", montant: "18 500" },
  ]);
  const autresPrets = useCategoryRows([
    { id: "p4", nature: "Prêt amortissable", libelle: "Prêt travaux cuisine", montant: "8 000" },
  ]);

  return (
    <div>
      <StepHeader
        title="Passifs"
        description="Listez les emprunts et dettes en cours."
      />
      <div className="space-y-4">
        <AccordionCategory title="Prêt immobilier" fields={fields} rows={pretImmo.rows} onAdd={pretImmo.add} onRemove={pretImmo.remove} onUpdate={pretImmo.update} />
        <AccordionCategory title="Prêt professionnel" fields={fields} rows={pretPro.rows} onAdd={pretPro.add} onRemove={pretPro.remove} onUpdate={pretPro.update} />
        <AccordionCategory title="Autres prêts" fields={fields} rows={autresPrets.rows} onAdd={autresPrets.add} onRemove={autresPrets.remove} onUpdate={autresPrets.update} />
      </div>
      <StepNavigation />
    </div>
  );
}
