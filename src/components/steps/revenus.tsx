"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useWizard } from "@/lib/wizard-context";
import { AccordionCategory, type FieldConfig, type RowData } from "@/components/accordion-category";
import { StepNavigation } from "@/components/step-navigation";
import { StepHeader } from "@/components/step-header";

let nextId = 200;
function genId() { return String(nextId++); }

function useCategoryRows(initial?: RowData[], liveOverride?: unknown[]) {
  const [rows, setRows] = useState<RowData[]>(() => initial ?? [{ id: genId() }]);
  const liveLen = liveOverride?.length ?? 0;
  const prevLiveLen = useRef(0);

  useEffect(() => {
    if (!liveOverride || liveLen === 0) return;
    if (liveLen !== prevLiveLen.current) {
      prevLiveLen.current = liveLen;
      setRows(liveOverride as RowData[]);
    }
  }, [liveLen, liveOverride]);

  const add = useCallback(() => setRows((p) => [...p, { id: genId() }]), []);
  const remove = useCallback((id: string) => setRows((p) => p.filter((r) => r.id !== id)), []);
  const update = useCallback((id: string, key: string, value: string) => {
    setRows((p) => p.map((r) => (r.id === id ? { ...r, [key]: value } : r)));
  }, []);
  return { rows, add, remove, update };
}

const fields: FieldConfig[] = [
  { key: "nature", label: "Nature", type: "select", options: ["Salaire", "BIC", "BNC", "BA", "Pension", "Rente", "Dividende", "Loyer"], className: "w-40" },
  { key: "libelle", label: "Libellé", type: "text", className: "flex-1" },
  { key: "montant", label: "Montant annuel", type: "number", suffix: "€", className: "w-40" },
];

export function RevenusStep() {
  const { formData, liveMode } = useWizard();
  const ctxRevenus = liveMode ? (formData.revenus as any) : null;

  const activites = useCategoryRows(
    liveMode ? undefined : [
      { id: "r1", nature: "Salaire", libelle: "Salaire JP Dupont - Renault", montant: "78 000" },
      { id: "r2", nature: "BNC", libelle: "Honoraires Cabinet Marie Dupont", montant: "95 000" },
    ],
    ctxRevenus?.revenusActivites
  );
  const pensions = useCategoryRows(
    liveMode ? undefined : [
      { id: "r3", nature: "Pension", libelle: "Pension alimentaire reçue", montant: "4 800" },
    ],
    ctxRevenus?.pensionsRetraites
  );
  const mobiliers = useCategoryRows(
    liveMode ? undefined : [
      { id: "r4", nature: "Dividende", libelle: "Dividendes SCI Familiale", montant: "6 200" },
    ],
    ctxRevenus?.revenusMobiliers
  );
  const immobiliers = useCategoryRows(
    liveMode ? undefined : [
      { id: "r5", nature: "Loyer", libelle: "Loyer Studio Lyon 3e", montant: "9 600" },
    ],
    ctxRevenus?.revenusImmobiliers
  );
  const autres = useCategoryRows(
    liveMode ? undefined : [
      { id: "r6", nature: "Salaire", libelle: "Prime intéressement", montant: "3 500" },
    ],
    ctxRevenus?.autresRevenus
  );

  return (
    <div>
      <StepHeader
        title="Revenus"
        description="Détaillez l'ensemble des sources de revenus du foyer."
      />
      <div className="space-y-4">
        <AccordionCategory title="Revenus d\u2019activités" fields={fields} rows={activites.rows} onAdd={activites.add} onRemove={activites.remove} onUpdate={activites.update} />
        <AccordionCategory title="Pensions, retraites et rentes" fields={fields} rows={pensions.rows} onAdd={pensions.add} onRemove={pensions.remove} onUpdate={pensions.update} />
        <AccordionCategory title="Revenus mobiliers" fields={fields} rows={mobiliers.rows} onAdd={mobiliers.add} onRemove={mobiliers.remove} onUpdate={mobiliers.update} />
        <AccordionCategory title="Revenus immobiliers" fields={fields} rows={immobiliers.rows} onAdd={immobiliers.add} onRemove={immobiliers.remove} onUpdate={immobiliers.update} />
        <AccordionCategory title="Autres revenus" fields={fields} rows={autres.rows} onAdd={autres.add} onRemove={autres.remove} onUpdate={autres.update} />
      </div>
      <StepNavigation />
    </div>
  );
}
