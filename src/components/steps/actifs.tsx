"use client";

import { useState, useCallback } from "react";
import { useWizard } from "@/lib/wizard-context";
import { AccordionCategory, type FieldConfig, type RowData } from "@/components/accordion-category";
import { StepNavigation } from "@/components/step-navigation";
import { StepHeader } from "@/components/step-header";

let nextId = 1;
function genId() {
  return String(nextId++);
}

function useCategoryRows(initial?: RowData[]) {
  const [rows, setRows] = useState<RowData[]>(() => initial ?? [{ id: genId() }]);

  const add = useCallback(() => {
    setRows((prev) => [...prev, { id: genId() }]);
  }, []);

  const remove = useCallback((id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const update = useCallback((id: string, key: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [key]: value } : r))
    );
  }, []);

  return { rows, add, remove, update };
}

/* ── Field configs per category ─────────────────────────── */

const NATURE_IMMOBILIER = ["Résidence principale", "Résidence secondaire", "Autre bien d'usage"];
const NATURE_RAPPORT = ["Nu", "Meublé", "Parts de SCI", "Parts de SCPI"];
const DISPOSITIF_DEFISCALISANT = ["Pinel", "Denormandie", "Malraux", "Monuments historiques"];
const NATURE_DISPONIBILITES = ["Compte courant", "Livret A", "PEL", "Compte titres", "PEA"];
const NATURE_ASSURANCE_VIE = ["Assurance vie", "Contrat de capitalisation", "Prévoyance"];
const NATURE_EPARGNE_RETRAITE = ["PER individuel", "PER entreprise", "Madelin", "PERP"];
const NATURE_DEFISCALISATION = ["FIP", "FCPI", "SOFICA", "Girardin"];
const NATURE_BIENS_PRO = ["Fonds de commerce", "Parts sociales", "Brevet / Licence", "Matériel"];
const NATURE_FONCIER = ["Forêt", "GFV", "GFA", "Autres"];

const fieldsBasic = (options: string[]): FieldConfig[] => [
  { key: "nature", label: "Nature", type: "select", options, className: "w-40" },
  { key: "libelle", label: "Libellé", type: "text", placeholder: "", className: "flex-1" },
  { key: "valeur", label: "Valeur estimée", type: "number", suffix: "€", className: "w-40" },
];

const fieldsWithDate = (options: string[], valueLabel: string, dateLabel: string): FieldConfig[] => [
  { key: "nature", label: options.length > 0 ? "Nature" : "Dispositif", type: "select", options, className: "w-40" },
  { key: "libelle", label: "Libellé", type: "text", placeholder: "", className: "flex-1" },
  { key: "valeur", label: valueLabel, type: "number", suffix: "€", className: "w-36" },
  { key: "date", label: dateLabel, type: "date", className: "w-36" },
];

const fieldsDefiscalisant: FieldConfig[] = [
  { key: "dispositif", label: "Dispositif", type: "select", options: DISPOSITIF_DEFISCALISANT, className: "w-40" },
  { key: "libelle", label: "Libellé", type: "text", placeholder: "", className: "flex-1" },
  { key: "valeur", label: "Valeur d'acquisition", type: "number", suffix: "€", className: "w-36" },
  { key: "date", label: "Date d'acquisition", type: "date", className: "w-36" },
];

/* ── Sub-step components ────────────────────────────────── */

export function ActifsImmobilierStep() {
  const biensUsage = useCategoryRows([
    { id: "a1", nature: "Résidence principale", libelle: "Appartement Paris 16e", valeur: "650 000" },
    { id: "a2", nature: "Résidence secondaire", libelle: "Maison Deauville", valeur: "380 000" },
  ]);
  const immoRapport = useCategoryRows([
    { id: "a3", nature: "Meublé", libelle: "Studio Lyon 3e", valeur: "185 000" },
  ]);
  const immoDefiscalisant = useCategoryRows([
    { id: "a4", dispositif: "Pinel", libelle: "T2 Bordeaux Euratlantique", valeur: "210 000", date: "15/03/2020" },
  ]);

  return (
    <div>
      <StepHeader
        title="Immobilier et autres biens d'usage"
        description="Ajoutez les biens immobiliers du patrimoine."
      />
      <div className="space-y-4">
        <AccordionCategory
          title="Biens d'usage"
          subtitle="Résidences principale, secondaire et autres biens d'usage"
          fields={fieldsBasic(NATURE_IMMOBILIER)}
          rows={biensUsage.rows}
          onAdd={biensUsage.add}
          onRemove={biensUsage.remove}
          onUpdate={biensUsage.update}
        />
        <AccordionCategory
          title="Immobilier de rapport"
          subtitle="nu et meublé, parts de SCI & SCPI"
          fields={fieldsBasic(NATURE_RAPPORT)}
          rows={immoRapport.rows}
          onAdd={immoRapport.add}
          onRemove={immoRapport.remove}
          onUpdate={immoRapport.update}
        />
        <AccordionCategory
          title="Immobilier défiscalisant"
          subtitle="Pinel, Denormandie..."
          infoText="Pour les dispositifs soumis à une durée d'engagement, la durée retenue correspond à la durée maximale prévue par le dispositif."
          fields={fieldsDefiscalisant}
          rows={immoDefiscalisant.rows}
          onAdd={immoDefiscalisant.add}
          onRemove={immoDefiscalisant.remove}
          onUpdate={immoDefiscalisant.update}
        />
      </div>
      <StepNavigation />
    </div>
  );
}

export function ActifsEpargneStep() {
  const disponibilites = useCategoryRows([
    { id: "a5", nature: "Compte courant", libelle: "CCP Société Générale", valeur: "12 500" },
    { id: "a6", nature: "Livret A", libelle: "Livret A BNP", valeur: "22 950" },
    { id: "a7", nature: "PEA", libelle: "PEA Boursorama", valeur: "45 000" },
  ]);
  const assuranceVie = useCategoryRows([
    { id: "a8", nature: "Assurance vie", libelle: "Generali Épargne", valeur: "150 000", date: "10/06/2012" },
  ]);
  const epargneRetraite = useCategoryRows([
    { id: "a9", nature: "PER individuel", libelle: "PER Swisslife", valeur: "35 000", date: "01/09/2019" },
  ]);
  const produitsDef = useCategoryRows([
    { id: "a10", nature: "FCPI", libelle: "FCPI Innovation 2023", valeur: "10 000", date: "15/12/2023" },
  ]);

  return (
    <div>
      <StepHeader
        title="Épargne et Prévoyance"
        description="Décrivez les produits d'épargne, assurance vie et retraite."
      />
      <div className="space-y-4">
        <AccordionCategory
          title="Disponibilités et valeurs mobilières"
          fields={fieldsBasic(NATURE_DISPONIBILITES)}
          rows={disponibilites.rows}
          onAdd={disponibilites.add}
          onRemove={disponibilites.remove}
          onUpdate={disponibilites.update}
        />
        <AccordionCategory
          title="Assurance vie et prévoyance"
          fields={fieldsWithDate(NATURE_ASSURANCE_VIE, "Capitaux décès", "Date de souscription")}
          rows={assuranceVie.rows}
          onAdd={assuranceVie.add}
          onRemove={assuranceVie.remove}
          onUpdate={assuranceVie.update}
        />
        <AccordionCategory
          title="Épargne retraite"
          fields={fieldsWithDate(NATURE_EPARGNE_RETRAITE, "Valeur estimée", "Date de souscription")}
          rows={epargneRetraite.rows}
          onAdd={epargneRetraite.add}
          onRemove={epargneRetraite.remove}
          onUpdate={epargneRetraite.update}
        />
        <AccordionCategory
          title="Produits de défiscalisation"
          fields={fieldsWithDate(NATURE_DEFISCALISATION, "Valeur d'acquisition", "Date d'acquisition")}
          rows={produitsDef.rows}
          onAdd={produitsDef.add}
          onRemove={produitsDef.remove}
          onUpdate={produitsDef.update}
        />
      </div>
      <StepNavigation />
    </div>
  );
}

export function ActifsProfessionnelsStep() {
  const biensPro = useCategoryRows([
    { id: "a11", nature: "Parts sociales", libelle: "SCI Familiale Dupont", valeur: "120 000" },
  ]);
  const fonciers = useCategoryRows([
    { id: "a12", nature: "GFV", libelle: "GFV Vignobles de Bordeaux", valeur: "25 000" },
  ]);

  return (
    <div>
      <StepHeader
        title="Biens professionnels et fonciers"
        description="Ajoutez les actifs professionnels et placements fonciers."
      />
      <div className="space-y-4">
        <AccordionCategory
          title="Biens professionnels"
          fields={fieldsBasic(NATURE_BIENS_PRO)}
          rows={biensPro.rows}
          onAdd={biensPro.add}
          onRemove={biensPro.remove}
          onUpdate={biensPro.update}
        />
        <AccordionCategory
          title="Placements fonciers et divers"
          fields={fieldsBasic(NATURE_FONCIER)}
          rows={fonciers.rows}
          onAdd={fonciers.add}
          onRemove={fonciers.remove}
          onUpdate={fonciers.update}
        />
      </div>
      <StepNavigation />
    </div>
  );
}

export function ActifsStep() {
  const { currentActifsSubStep } = useWizard();

  switch (currentActifsSubStep) {
    case "immobilier":
      return <ActifsImmobilierStep />;
    case "epargne":
      return <ActifsEpargneStep />;
    case "biens-professionnels":
      return <ActifsProfessionnelsStep />;
    default:
      return <ActifsImmobilierStep />;
  }
}
