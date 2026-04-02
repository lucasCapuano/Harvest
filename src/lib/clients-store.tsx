"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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
  CategoryItem,
} from "./types";

export interface FormState {
  situationPersonnelle: SituationPersonnelle;
  compositionFamiliale: CompositionFamiliale;
  enfants: Enfant[];
  actifsImmobilier: ActifsImmobilier;
  actifsEpargne: ActifsEpargne;
  actifsProfessionnels: ActifsProfessionnels;
  passifs: Passifs;
  revenus: Revenus;
  charges: Charges;
}

export interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: "Particulier" | "Professionnel";
  status: "Actif" | "Prospect" | "Inactif";
  formData: FormState;
}

/* ── Patrimoine helpers (exported) ──────────────────────── */

function sumCategoryField(items: { [key: string]: string | undefined }[], field: string): number {
  return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
}

export function computePatrimoineNet(fd: FormState): number {
  const totalImmobilier =
    sumCategoryField(fd.actifsImmobilier.biensUsage, "valeur") +
    sumCategoryField(fd.actifsImmobilier.immobilierRapport, "valeur") +
    sumCategoryField(fd.actifsImmobilier.immobilierDefiscalisant, "valeur");
  const totalEpargne =
    sumCategoryField(fd.actifsEpargne.disponibilites, "valeur") +
    sumCategoryField(fd.actifsEpargne.assuranceVie, "valeur") +
    sumCategoryField(fd.actifsEpargne.epargneRetraite, "valeur") +
    sumCategoryField(fd.actifsEpargne.produitsDefiscalisation, "valeur");
  const biensPro =
    sumCategoryField(fd.actifsProfessionnels.biensProfessionnels, "valeur") +
    sumCategoryField(fd.actifsProfessionnels.placementsFonciers, "valeur");
  const totalPassifs =
    sumCategoryField(fd.passifs.pretImmobilier, "montant") +
    sumCategoryField(fd.passifs.pretProfessionnel, "montant") +
    sumCategoryField(fd.passifs.autresPrets, "montant");
  return totalImmobilier + totalEpargne + biensPro - totalPassifs;
}

export function formatPatrimoine(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    const rounded = Math.round(m * 10) / 10;
    return rounded.toLocaleString("fr-FR") + "m €";
  }
  return n.toLocaleString("fr-FR") + " €";
}

/* ── Seeded random helpers ──────────────────────────────── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const firstNamesMale = ["Jean-Pierre", "Philippe", "Antoine", "François", "Nicolas", "Éric", "Olivier", "Laurent", "Sébastien", "Christophe"];
const firstNamesFemale = ["Marie", "Sophie", "Claire", "Isabelle", "Catherine", "Valérie", "Nathalie", "Sandrine", "Aurélie", "Camille"];
const profCSPs = ["Salarié cadre", "Profession libérale", "Chef d'entreprise", "Fonctionnaire", "Artisan/Commerçant", "Retraité"];
const profLabels: Record<string, string[]> = {
  "Salarié cadre": ["Directeur commercial", "Ingénieur", "Responsable marketing", "Chef de projet", "Directeur financier"],
  "Profession libérale": ["Avocate", "Médecin", "Architecte", "Notaire", "Expert-comptable"],
  "Chef d'entreprise": ["Fondateur SAS", "Gérant SARL", "Dirigeant PME"],
  "Fonctionnaire": ["Professeur agrégé", "Inspecteur des finances", "Magistrat"],
  "Artisan/Commerçant": ["Restaurateur", "Artisan plombier", "Gérant de boutique"],
  "Retraité": ["Ancien cadre dirigeant", "Ancien professeur", "Ancien médecin"],
};
const childNames = ["Emma", "Lucas", "Léa", "Hugo", "Chloé", "Louis", "Manon", "Jules", "Camille", "Arthur", "Inès", "Raphaël", "Jade", "Gabriel", "Louise"];
const situationsFamiliales = ["Marié(e)", "Pacsé(e)", "Concubinage", "Célibataire", "Divorcé(e)", "Veuf(ve)"];
const regimesMap: Record<string, string[]> = {
  "Marié(e)": ["Communauté réduite aux acquêts", "Séparation de biens", "Communauté universelle", "Participation aux acquêts"],
  "Pacsé(e)": ["Séparation de biens", "Indivision"],
};

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function roundK(v: number) {
  return Math.round(v / 1000) * 1000;
}

function makeItem(id: string, fields: Record<string, string>): CategoryItem {
  return { id, ...fields };
}

function generateFormData(
  clientId: number,
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
): FormState {
  const r = seededRandom(clientId * 7919);
  const randRange = (min: number, max: number) => roundK(min + r() * (max - min));

  // ── Situation personnelle ──
  const isMale = firstNamesMale.includes(firstName);
  const civilite = isMale ? "Monsieur" : "Madame";
  const csp = pick(profCSPs, r);
  const profLabel = pick(profLabels[csp] || ["Cadre"], r);
  const birthYear = 1960 + Math.floor(r() * 30);
  const birthMonth = String(Math.floor(r() * 12) + 1).padStart(2, "0");
  const birthDay = String(Math.floor(r() * 28) + 1).padStart(2, "0");

  // ── Composition familiale ──
  const situation = pick(situationsFamiliales, r);
  const hasPartner = ["Marié(e)", "Pacsé(e)", "Concubinage"].includes(situation);
  const civPartenaire = civilite === "Monsieur" ? "Madame" : "Monsieur";
  const partnerFirst = civPartenaire === "Monsieur" ? pick(firstNamesMale, r) : pick(firstNamesFemale, r);
  const partnerCsp = pick(profCSPs, r);
  const partnerLabel = pick(profLabels[partnerCsp] || ["Cadre"], r);
  const partnerBY = 1960 + Math.floor(r() * 30);
  const partnerBM = String(Math.floor(r() * 12) + 1).padStart(2, "0");
  const partnerBD = String(Math.floor(r() * 28) + 1).padStart(2, "0");

  // ── Enfants ──
  const nbEnfants = Math.floor(r() * 4);
  const enfants: Enfant[] = Array.from({ length: nbEnfants }, (_, i) => ({
    id: `e${i + 1}`,
    prenom: pick(childNames, r),
    dateNaissance: `${2005 + Math.floor(r() * 18)}-${String(Math.floor(r() * 12) + 1).padStart(2, "0")}-${String(Math.floor(r() * 28) + 1).padStart(2, "0")}`,
    aCharge: true,
  }));

  // ── Actifs Immobilier ──
  const biensUsageVal = randRange(200000, 800000);
  const hasRapport = r() > 0.3;
  const rapportVal = hasRapport ? randRange(50000, 400000) : 0;
  const hasDefisc = r() > 0.5;
  const defiscVal = hasDefisc ? randRange(80000, 250000) : 0;

  const biensUsage: CategoryItem[] = [makeItem("immo1", { nature: "Résidence principale", libelle: "Résidence principale", valeur: String(biensUsageVal) })];
  const immobilierRapport: CategoryItem[] = hasRapport ? [makeItem("immo2", { nature: "Nu", libelle: "Appartement locatif", valeur: String(rapportVal) })] : [];
  const immobilierDefiscalisant: CategoryItem[] = hasDefisc ? [makeItem("immo3", { dispositif: "Pinel", libelle: "Investissement Pinel", valeur: String(defiscVal) })] : [];

  // ── Actifs Épargne ──
  const dispoVal = randRange(15000, 120000);
  const avVal = randRange(50000, 350000);
  const erVal = randRange(20000, 150000);
  const hasDefiscEpargne = r() > 0.6;
  const defiscEpVal = hasDefiscEpargne ? randRange(10000, 80000) : 0;

  const disponibilites: CategoryItem[] = [makeItem("ep1", { nature: "Livret A", libelle: "Livret A", valeur: String(dispoVal) })];
  const assuranceVie: CategoryItem[] = [makeItem("ep2", { nature: "Assurance vie", libelle: "Contrat AV", valeur: String(avVal) })];
  const epargneRetraite: CategoryItem[] = [makeItem("ep3", { nature: "PER individuel", libelle: "PER", valeur: String(erVal) })];
  const produitsDefiscalisation: CategoryItem[] = hasDefiscEpargne ? [makeItem("ep4", { nature: "FIP", libelle: "FIP Innovation", valeur: String(defiscEpVal) })] : [];

  // ── Actifs Professionnels ──
  const hasBiensPro = r() > 0.5;
  const biensProVal = hasBiensPro ? randRange(100000, 500000) : 0;
  const biensProfessionnels: CategoryItem[] = hasBiensPro ? [makeItem("pro1", { nature: "Parts sociales", libelle: "Parts société", valeur: String(biensProVal) })] : [];

  // ── Passifs ──
  const pretImmoVal = randRange(80000, 350000);
  const hasPretPro = r() > 0.5;
  const pretProVal = hasPretPro ? randRange(30000, 150000) : 0;
  const hasAutres = r() > 0.4;
  const autresVal = hasAutres ? randRange(5000, 40000) : 0;

  const pretImmobilier: CategoryItem[] = [makeItem("pas1", { nature: "Prêt amortissable", libelle: "Prêt immobilier RP", montant: String(pretImmoVal) })];
  const pretProfessionnel: CategoryItem[] = hasPretPro ? [makeItem("pas2", { nature: "Prêt amortissable", libelle: "Prêt professionnel", montant: String(pretProVal) })] : [];
  const autresPrets: CategoryItem[] = hasAutres ? [makeItem("pas3", { nature: "Prêt amortissable", libelle: "Crédit consommation", montant: String(autresVal) })] : [];

  // ── Revenus ──
  const revActVal = randRange(35000, 120000);
  const hasPensions = r() > 0.3;
  const pensionsVal = hasPensions ? randRange(10000, 40000) : 0;
  const revMobVal = randRange(2000, 15000);
  const hasRevImmo = rapportVal > 0;
  const revImmoVal = hasRevImmo ? randRange(5000, 25000) : 0;
  const hasAutresRev = r() > 0.6;
  const autresRevVal = hasAutresRev ? randRange(2000, 10000) : 0;

  const revenusActivites: CategoryItem[] = [makeItem("rev1", { nature: "Salaire", libelle: "Revenus d'activité", montant: String(revActVal) })];
  const pensionsRetraites: CategoryItem[] = hasPensions ? [makeItem("rev2", { nature: "Pension", libelle: "Pensions", montant: String(pensionsVal) })] : [];
  const revenusMobiliers: CategoryItem[] = [makeItem("rev3", { nature: "Dividende", libelle: "Revenus mobiliers", montant: String(revMobVal) })];
  const revenusImmobiliers: CategoryItem[] = hasRevImmo ? [makeItem("rev4", { nature: "Loyer", libelle: "Revenus immobiliers", montant: String(revImmoVal) })] : [];
  const autresRevenus: CategoryItem[] = hasAutresRev ? [makeItem("rev5", { nature: "Rente", libelle: "Autres revenus", montant: String(autresRevVal) })] : [];

  // ── Charges ──
  const chargesGenVal = randRange(8000, 35000);
  const chargesDeductVal = randRange(2000, 12000);
  const chargesGenerales: CategoryItem[] = [makeItem("ch1", { nature: "Impôt sur le revenu", libelle: "Charges générales", montant: String(chargesGenVal) })];
  const chargesDeductibles: CategoryItem[] = [makeItem("ch2", { nature: "Pension alimentaire", libelle: "Charges déductibles", montant: String(chargesDeductVal) })];

  return {
    situationPersonnelle: {
      civilite,
      nom: lastName,
      prenom: firstName,
      dateNaissance: `${birthYear}-${birthMonth}-${birthDay}`,
      professionCSP: csp,
      professionLibelle: profLabel,
      telephone: phone,
      email,
    },
    compositionFamiliale: {
      situationFamiliale: situation,
      partenaire: hasPartner ? {
        civilite: civPartenaire as "Monsieur" | "Madame" | "Mademoiselle" | "",
        nom: lastName,
        prenom: partnerFirst,
        dateNaissance: `${partnerBY}-${partnerBM}-${partnerBD}`,
        professionCSP: partnerCsp,
        professionLibelle: partnerLabel,
      } : {
        civilite: "",
        nom: "",
        prenom: "",
        dateNaissance: "",
        professionCSP: "",
        professionLibelle: "",
      },
    },
    enfants,
    actifsImmobilier: { biensUsage, immobilierRapport, immobilierDefiscalisant },
    actifsEpargne: { disponibilites, assuranceVie, epargneRetraite, produitsDefiscalisation },
    actifsProfessionnels: { biensProfessionnels, placementsFonciers: [] },
    passifs: { pretImmobilier, pretProfessionnel, autresPrets },
    revenus: { revenusActivites, pensionsRetraites, revenusMobiliers, revenusImmobiliers, autresRevenus },
    charges: { chargesGenerales, chargesDeductibles },
  };
}

const initialClients: Client[] = [
  { id: 1, firstName: "Jean-Pierre", lastName: "Dupont", email: "jp.dupont@email.fr", phone: "06 12 34 56 78", type: "Particulier", status: "Actif" },
  { id: 2, firstName: "Marie", lastName: "Laurent", email: "m.laurent@email.fr", phone: "06 23 45 67 89", type: "Particulier", status: "Actif" },
  { id: 3, firstName: "Philippe", lastName: "Martin", email: "p.martin@entreprise.fr", phone: "06 34 56 78 90", type: "Professionnel", status: "Actif" },
  { id: 4, firstName: "Sophie", lastName: "Bernard", email: "s.bernard@email.fr", phone: "06 45 67 89 01", type: "Particulier", status: "Prospect" },
  { id: 5, firstName: "Antoine", lastName: "Moreau", email: "a.moreau@cabinet.fr", phone: "06 56 78 90 12", type: "Professionnel", status: "Actif" },
  { id: 6, firstName: "Claire", lastName: "Petit", email: "c.petit@email.fr", phone: "06 67 89 01 23", type: "Particulier", status: "Inactif" },
  { id: 7, firstName: "François", lastName: "Robert", email: "f.robert@email.fr", phone: "06 78 90 12 34", type: "Particulier", status: "Actif" },
  { id: 8, firstName: "Isabelle", lastName: "Durand", email: "i.durand@groupe.fr", phone: "06 89 01 23 45", type: "Professionnel", status: "Prospect" },
  { id: 9, firstName: "Nicolas", lastName: "Leroy", email: "n.leroy@email.fr", phone: "06 90 12 34 56", type: "Particulier", status: "Actif" },
  { id: 10, firstName: "Catherine", lastName: "Roux", email: "c.roux@email.fr", phone: "06 01 23 45 67", type: "Particulier", status: "Actif" },
  { id: 11, firstName: "Éric", lastName: "Girard", email: "e.girard@entreprise.fr", phone: "06 11 22 33 44", type: "Professionnel", status: "Actif" },
  { id: 12, firstName: "Valérie", lastName: "Lefebvre", email: "v.lefebvre@email.fr", phone: "06 55 66 77 88", type: "Particulier", status: "Prospect" },
  { id: 13, firstName: "Henri", lastName: "Beaumont", email: "h.beaumont@email.fr", phone: "06 42 18 73 95", type: "Particulier", status: "Actif" },
].map((c) => ({
  ...c,
  formData: generateFormData(c.id, c.firstName, c.lastName, c.email, c.phone),
})) as Client[];

// Override client 13 (Henri Beaumont) to match sampleClient values
const henriIdx = initialClients.findIndex((c) => c.id === 13);
if (henriIdx !== -1) {
  const fd = initialClients[henriIdx].formData;
  fd.compositionFamiliale.situationFamiliale = "Veuf(ve)";
  fd.compositionFamiliale.partenaire = { civilite: "", nom: "", prenom: "", dateNaissance: "", professionCSP: "", professionLibelle: "" };
  fd.actifsEpargne.disponibilites = [makeItem("ep1", { nature: "Livret A", libelle: "Livret A", valeur: "23000" })];
  fd.actifsEpargne.assuranceVie = [makeItem("ep2", { nature: "Assurance vie", libelle: "Contrat AV", valeur: "216000" })];
  fd.actifsEpargne.epargneRetraite = [makeItem("ep3", { nature: "PER individuel", libelle: "PER", valeur: "34000" })];
  fd.actifsImmobilier.biensUsage = [makeItem("immo1", { nature: "Résidence principale", libelle: "Résidence principale", valeur: "850000" })];
  fd.actifsImmobilier.immobilierRapport = [makeItem("immo2", { nature: "Nu", libelle: "Appartement locatif", valeur: "320000" })];
  fd.passifs.pretImmobilier = [makeItem("pas1", { nature: "Prêt amortissable", libelle: "Prêt immobilier RP", montant: "143000" })];
  fd.revenus.revenusActivites = [makeItem("rev1", { nature: "Salaire", libelle: "Revenus d'activité", montant: "105000" })];
  fd.revenus.revenusImmobiliers = [makeItem("rev4", { nature: "Loyer", libelle: "Revenus immobiliers", montant: "18000" })];
  fd.revenus.revenusMobiliers = [makeItem("rev3", { nature: "Dividende", libelle: "Revenus mobiliers", montant: "8000" })];
  fd.revenus.autresRevenus = [makeItem("rev5", { nature: "Rente", libelle: "Autres revenus", montant: "10000" })];
}

interface ClientsContextType {
  clients: Client[];
  addClient: (client: Omit<Client, "id">) => void;
  updateClient: (id: number, updates: Partial<Omit<Client, "id">>) => void;
  deleteClient: (id: number) => void;
}

const ClientsContext = createContext<ClientsContextType | null>(null);

export function ClientsProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);

  const addClient = useCallback((client: Omit<Client, "id">) => {
    setClients((prev) => {
      const maxId = prev.reduce((max, c) => Math.max(max, c.id), 0);
      return [{ ...client, id: maxId + 1 }, ...prev];
    });
  }, []);

  const updateClient = useCallback((id: number, updates: Partial<Omit<Client, "id">>) => {
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  }, []);

  const deleteClient = useCallback((id: number) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <ClientsContext.Provider value={{ clients, addClient, updateClient, deleteClient }}>
      {children}
    </ClientsContext.Provider>
  );
}

export function useClients() {
  const ctx = useContext(ClientsContext);
  if (!ctx) throw new Error("useClients must be inside ClientsProvider");
  return ctx;
}
