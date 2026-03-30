/**
 * Transcript parser — maps the LLM extraction response to the app's FormState.
 *
 * The heavy lifting (reading .docx, calling OpenAI) happens server-side in
 * /api/extract-transcript.  This module converts the LLM JSON payload into
 * the exact shape expected by the wizard form.
 */

import type {
  SituationPersonnelle,
  CompositionFamiliale,
  Enfant,
  ActifsImmobilier,
  ActifsEpargne,
  ActifsProfessionnels,
  Passifs,
  Revenus,
  Charges,
  Civilite,
  CategoryItem,
} from "./types";

// ── LLM response types ─────────────────────────────────────────────────────

interface LLMPerson {
  civilite: string | null;
  nom: string | null;
  prenom: string | null;
  dateNaissance: string | null;
  professionCSP: string | null;
  professionLibelle: string | null;
  telephone: string | null;
  email: string | null;
}

interface LLMChild {
  prenom: string | null;
  dateNaissance: string | null;
}

interface LLMAssetRow {
  nature: string | null;
  libelle: string | null;
  valeurEstimee: number | null;
  valeurAcquisition: number | null;
  dateAcquisition: string | null;
  capitauxDeces: number | null;
  dateSouscription: string | null;
}

interface LLMLiabilityRow {
  nature: string | null;
  libelle: string | null;
  capitalRestantDu: number | null;
}

interface LLMIncomeRow {
  nature: string | null;
  libelle: string | null;
  montantAnnuel: number | null;
}

interface LLMChargeRow {
  nature: string | null;
  libelle: string | null;
  montantAnnuel: number | null;
}

export interface LLMExtractionPayload {
  situationPersonnelle: { client: LLMPerson };
  compositionFamiliale: {
    situationFamiliale: string | null;
    partenaire: LLMPerson;
  };
  enfants: LLMChild[];
  actifs: {
    immobilierEtAutresBiensUsage: LLMAssetRow[];
    immobilierRapport: LLMAssetRow[];
    immobilierDefiscalisant: LLMAssetRow[];
    disponibilitesEtValeursMobilieres: LLMAssetRow[];
    assuranceVieEtPrevoyance: LLMAssetRow[];
    epargneRetraite: LLMAssetRow[];
    produitsDefiscalisation: LLMAssetRow[];
    biensProfessionnels: LLMAssetRow[];
    placementsFonciersEtDivers: LLMAssetRow[];
  };
  passifs: {
    pretImmobilier: LLMLiabilityRow[];
    pretProfessionnel: LLMLiabilityRow[];
    autresPrets: LLMLiabilityRow[];
  };
  revenus: {
    revenusActivites: LLMIncomeRow[];
    pensionsRetraitesEtRentes: LLMIncomeRow[];
    revenusMobilers: LLMIncomeRow[];
    revenusImmobiliers: LLMIncomeRow[];
    autresRevenus: LLMIncomeRow[];
  };
  charges: {
    chargesGeneralesEtFiscales: LLMChargeRow[];
    chargesDeductibles: LLMChargeRow[];
  };
  extractionMeta: {
    transcriptLanguage: string | null;
    summary: string;
    missingFields: string[];
    assumptions: string[];
  };
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const str = (v: string | null | undefined): string => v ?? "";
const num = (v: number | null | undefined): string =>
  v != null ? String(v) : "";

/** DD/MM/YYYY → YYYY-MM-DD (ISO) for date inputs */
function toISO(d: string | null): string {
  if (!d) return "";
  const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  return d;
}

function mapCivilite(v: string | null): Civilite {
  if (v === "Monsieur" || v === "Madame" || v === "Mademoiselle") return v;
  return "";
}

let _id = 0;
function uid(): string {
  _id++;
  return `llm${_id}`;
}

// ── Mappers ─────────────────────────────────────────────────────────────────

function mapPerson(p: LLMPerson): SituationPersonnelle {
  return {
    civilite: mapCivilite(p.civilite),
    nom: str(p.nom),
    prenom: str(p.prenom),
    dateNaissance: toISO(p.dateNaissance),
    professionCSP: str(p.professionCSP),
    professionLibelle: str(p.professionLibelle),
    telephone: str(p.telephone),
    email: str(p.email),
  };
}

function mapPartner(p: LLMPerson) {
  return {
    civilite: mapCivilite(p.civilite),
    nom: str(p.nom),
    prenom: str(p.prenom),
    dateNaissance: toISO(p.dateNaissance),
    professionCSP: str(p.professionCSP),
    professionLibelle: str(p.professionLibelle),
  };
}

function mapChildren(children: LLMChild[]): Enfant[] {
  return children.map((c) => ({
    id: uid(),
    prenom: str(c.prenom),
    dateNaissance: toISO(c.dateNaissance),
    aCharge: true,
  }));
}

function mapAssetsBasic(rows: LLMAssetRow[]): CategoryItem[] {
  return rows.map((r) => ({
    id: uid(),
    nature: str(r.nature) || undefined,
    libelle: str(r.libelle) || undefined,
    valeur: num(r.valeurEstimee) || num(r.valeurAcquisition) || undefined,
  }));
}

function mapAssurance(rows: LLMAssetRow[]): CategoryItem[] {
  return rows.map((r) => ({
    id: uid(),
    nature: str(r.nature) || undefined,
    libelle: str(r.libelle) || undefined,
    valeur: num(r.capitauxDeces) || num(r.valeurEstimee) || undefined,
    date: str(r.dateSouscription) || undefined,
  }));
}

function mapEpargneRetraite(rows: LLMAssetRow[]): CategoryItem[] {
  return rows.map((r) => ({
    id: uid(),
    nature: str(r.nature) || undefined,
    libelle: str(r.libelle) || undefined,
    valeur: num(r.valeurEstimee) || undefined,
    date: str(r.dateSouscription) || undefined,
  }));
}

function mapDefiscalisation(rows: LLMAssetRow[]): CategoryItem[] {
  return rows.map((r) => ({
    id: uid(),
    nature: str(r.nature) || undefined,
    libelle: str(r.libelle) || undefined,
    valeur: num(r.valeurAcquisition) || num(r.valeurEstimee) || undefined,
    date: str(r.dateAcquisition) || undefined,
  }));
}

function mapImmoDefiscalisant(rows: LLMAssetRow[]): CategoryItem[] {
  return rows.map((r) => ({
    id: uid(),
    dispositif: str(r.nature) || undefined,
    libelle: str(r.libelle) || undefined,
    valeur: num(r.valeurAcquisition) || num(r.valeurEstimee) || undefined,
    date: str(r.dateAcquisition) || undefined,
  }));
}

function mapLiabilities(rows: LLMLiabilityRow[]): CategoryItem[] {
  return rows.map((r) => ({
    id: uid(),
    nature: str(r.nature) || undefined,
    libelle: str(r.libelle) || undefined,
    montant: num(r.capitalRestantDu) || undefined,
  }));
}

function mapIncome(rows: LLMIncomeRow[]): CategoryItem[] {
  return rows.map((r) => ({
    id: uid(),
    nature: str(r.nature) || undefined,
    libelle: str(r.libelle) || undefined,
    montant: num(r.montantAnnuel) || undefined,
  }));
}

function mapCharges(rows: LLMChargeRow[]): CategoryItem[] {
  return rows.map((r) => ({
    id: uid(),
    nature: str(r.nature) || undefined,
    libelle: str(r.libelle) || undefined,
    montant: num(r.montantAnnuel) || undefined,
  }));
}

// ── Main export ─────────────────────────────────────────────────────────────

export interface ExtractionResult {
  formData: {
    situationPersonnelle: SituationPersonnelle;
    compositionFamiliale: CompositionFamiliale;
    enfants: Enfant[];
    actifsImmobilier: ActifsImmobilier;
    actifsEpargne: ActifsEpargne;
    actifsProfessionnels: ActifsProfessionnels;
    passifs: Passifs;
    revenus: Revenus;
    charges: Charges;
  };
  meta: LLMExtractionPayload["extractionMeta"];
  matchedFields: string[];
}

export function mapLLMToFormState(payload: LLMExtractionPayload): ExtractionResult {
  _id = 0;

  const matchedFields: string[] = [];

  const sp = payload.situationPersonnelle.client;
  if (sp.nom || sp.prenom) matchedFields.push("situationPersonnelle");
  if (payload.compositionFamiliale.situationFamiliale) matchedFields.push("compositionFamiliale");
  if (payload.enfants.length > 0) matchedFields.push("enfants");

  const a = payload.actifs;
  if (
    a.immobilierEtAutresBiensUsage.length || a.immobilierRapport.length ||
    a.immobilierDefiscalisant.length || a.disponibilitesEtValeursMobilieres.length ||
    a.assuranceVieEtPrevoyance.length || a.epargneRetraite.length ||
    a.produitsDefiscalisation.length || a.biensProfessionnels.length ||
    a.placementsFonciersEtDivers.length
  ) matchedFields.push("actifs");

  const p = payload.passifs;
  if (p.pretImmobilier.length || p.pretProfessionnel.length || p.autresPrets.length)
    matchedFields.push("passifs");

  const r = payload.revenus;
  if (
    r.revenusActivites.length || r.pensionsRetraitesEtRentes.length ||
    r.revenusMobilers.length || r.revenusImmobiliers.length || r.autresRevenus.length
  ) matchedFields.push("revenus");

  const ch = payload.charges;
  if (ch.chargesGeneralesEtFiscales.length || ch.chargesDeductibles.length)
    matchedFields.push("charges");

  return {
    formData: {
      situationPersonnelle: mapPerson(payload.situationPersonnelle.client),
      compositionFamiliale: {
        situationFamiliale: str(payload.compositionFamiliale.situationFamiliale),
        partenaire: mapPartner(payload.compositionFamiliale.partenaire),
      },
      enfants: mapChildren(payload.enfants),
      actifsImmobilier: {
        biensUsage: mapAssetsBasic(a.immobilierEtAutresBiensUsage),
        immobilierRapport: mapAssetsBasic(a.immobilierRapport),
        immobilierDefiscalisant: mapImmoDefiscalisant(a.immobilierDefiscalisant),
      },
      actifsEpargne: {
        disponibilites: mapAssetsBasic(a.disponibilitesEtValeursMobilieres),
        assuranceVie: mapAssurance(a.assuranceVieEtPrevoyance),
        epargneRetraite: mapEpargneRetraite(a.epargneRetraite),
        produitsDefiscalisation: mapDefiscalisation(a.produitsDefiscalisation),
      },
      actifsProfessionnels: {
        biensProfessionnels: mapAssetsBasic(a.biensProfessionnels),
        placementsFonciers: mapAssetsBasic(a.placementsFonciersEtDivers),
      },
      passifs: {
        pretImmobilier: mapLiabilities(p.pretImmobilier),
        pretProfessionnel: mapLiabilities(p.pretProfessionnel),
        autresPrets: mapLiabilities(p.autresPrets),
      },
      revenus: {
        revenusActivites: mapIncome(r.revenusActivites),
        pensionsRetraites: mapIncome(r.pensionsRetraitesEtRentes),
        revenusMobiliers: mapIncome(r.revenusMobilers),
        revenusImmobiliers: mapIncome(r.revenusImmobiliers),
        autresRevenus: mapIncome(r.autresRevenus),
      },
      charges: {
        chargesGenerales: mapCharges(ch.chargesGeneralesEtFiscales),
        chargesDeductibles: mapCharges(ch.chargesDeductibles),
      },
    },
    meta: payload.extractionMeta,
    matchedFields,
  };
}
