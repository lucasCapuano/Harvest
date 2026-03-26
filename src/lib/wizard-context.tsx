"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type {
  StepId,
  ActifsSubStep,
  SituationPersonnelle,
  CompositionFamiliale,
  Enfant,
  ActifsImmobilier,
  ActifsEpargne,
  ActifsProfessionnels,
  Passifs,
  Revenus,
  Charges,
  Step,
} from "./types";

interface FormState {
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

interface WizardContextType {
  currentStep: StepId;
  currentActifsSubStep: ActifsSubStep;
  steps: Step[];
  formData: FormState;
  stepIndex: number;
  totalSteps: number;
  completionPercent: number;
  transcriptMode: boolean;
  liveMode: boolean;
  confidenceScores: Record<string, number>;
  setCurrentStep: (step: StepId) => void;
  setCurrentActifsSubStep: (sub: ActifsSubStep) => void;
  markStepCompleted: (stepId: StepId) => void;
  markActifsSubStepCompleted: (subId: ActifsSubStep) => void;
  updateFormData: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  goNext: () => void;
  goPrev: () => void;
  enableTranscriptMode: (scores: Record<string, number>) => void;
  enableLiveMode: () => void;
  addConfidenceScore: (field: string, score: number) => void;
}

const firstNamesMale = ["Jean-Pierre", "Philippe", "Antoine", "François", "Nicolas", "Éric", "Olivier", "Laurent", "Sébastien", "Christophe", "Marc", "Thierry", "Alexandre", "Julien", "Benoît"];
const firstNamesFemale = ["Marie", "Sophie", "Claire", "Isabelle", "Catherine", "Valérie", "Nathalie", "Sandrine", "Aurélie", "Camille", "Charlotte", "Émilie", "Hélène", "Juliette", "Pauline"];
const lastNames = ["Dupont", "Laurent", "Martin", "Bernard", "Moreau", "Petit", "Robert", "Durand", "Leroy", "Roux", "Girard", "Lefebvre", "Fournier", "Mercier", "Bonnet", "Lambert", "Rousseau", "Marchand", "Caron", "Colin"];
const profCSPs = ["Salarié cadre", "Profession libérale", "Chef d'entreprise", "Fonctionnaire", "Artisan/Commerçant", "Retraité"];
const profLabels: Record<string, string[]> = {
  "Salarié cadre": ["Directeur commercial", "Ingénieur", "Responsable marketing", "Chef de projet", "Directeur financier"],
  "Profession libérale": ["Avocate", "Médecin", "Architecte", "Notaire", "Expert-comptable"],
  "Chef d'entreprise": ["Fondateur SAS", "Gérant SARL", "Dirigeant PME"],
  "Fonctionnaire": ["Professeur agrégé", "Inspecteur des finances", "Magistrat"],
  "Artisan/Commerçant": ["Restaurateur", "Artisan plombier", "Gérant de boutique"],
  "Retraité": ["Ancien cadre dirigeant", "Ancien professeur", "Ancien médecin"],
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPhone(): string {
  const digits = () => String(Math.floor(Math.random() * 90) + 10);
  return `06 ${digits()} ${digits()} ${digits()} ${digits()}`;
}

function randomDate(minYear: number, maxYear: number): string {
  const y = minYear + Math.floor(Math.random() * (maxYear - minYear + 1));
  const m = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
  const d = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function generateRandomFormData(): FormState {
  const civilitePrincipal = Math.random() > 0.5 ? "Monsieur" : "Madame";
  const prenomPrincipal = civilitePrincipal === "Monsieur" ? pick(firstNamesMale) : pick(firstNamesFemale);
  const nomPrincipal = pick(lastNames);
  const cspPrincipal = pick(profCSPs);
  const labelPrincipal = pick(profLabels[cspPrincipal]);

  const civPartenaire = civilitePrincipal === "Monsieur" ? "Madame" : "Monsieur";
  const prenomPartenaire = civPartenaire === "Monsieur" ? pick(firstNamesMale) : pick(firstNamesFemale);
  const cspPartenaire = pick(profCSPs);
  const labelPartenaire = pick(profLabels[cspPartenaire]);

  const nbEnfants = Math.floor(Math.random() * 4);
  const enfants: Enfant[] = Array.from({ length: nbEnfants }, (_, i) => ({
    id: `e${i + 1}`,
    prenom: pick([...firstNamesMale, ...firstNamesFemale]),
    dateNaissance: randomDate(2005, 2020),
    aCharge: true,
  }));

  const initial = prenomPrincipal[0].toLowerCase();

  return {
    situationPersonnelle: {
      civilite: civilitePrincipal,
      nom: nomPrincipal,
      prenom: prenomPrincipal,
      dateNaissance: randomDate(1960, 1990),
      professionCSP: cspPrincipal,
      professionLibelle: labelPrincipal,
      telephone: randomPhone(),
      email: `${initial}.${nomPrincipal.toLowerCase()}@email.fr`,
    },
    compositionFamiliale: {
      situationFamiliale: "Marié(e)",
      partenaire: {
        civilite: civPartenaire,
        nom: nomPrincipal,
        prenom: prenomPartenaire,
        dateNaissance: randomDate(1960, 1990),
        professionCSP: cspPartenaire,
        professionLibelle: labelPartenaire,
      },
    },
    enfants,
    actifsImmobilier: { biensUsage: [], immobilierRapport: [], immobilierDefiscalisant: [] },
    actifsEpargne: { disponibilites: [], assuranceVie: [], epargneRetraite: [], produitsDefiscalisation: [] },
    actifsProfessionnels: { biensProfessionnels: [], placementsFonciers: [] },
    passifs: { pretImmobilier: [], pretProfessionnel: [], autresPrets: [] },
    revenus: { revenusActivites: [], pensionsRetraites: [], revenusMobiliers: [], revenusImmobiliers: [], autresRevenus: [] },
    charges: { chargesGenerales: [], chargesDeductibles: [] },
  };
}

const staticInitialFormData: FormState = {
  situationPersonnelle: {
    civilite: "",
    nom: "",
    prenom: "",
    dateNaissance: "",
    professionCSP: "",
    professionLibelle: "",
    telephone: "",
    email: "",
  },
  compositionFamiliale: {
    situationFamiliale: "",
    partenaire: {
      civilite: "",
      nom: "",
      prenom: "",
      dateNaissance: "",
      professionCSP: "",
      professionLibelle: "",
    },
  },
  enfants: [],
  actifsImmobilier: { biensUsage: [], immobilierRapport: [], immobilierDefiscalisant: [] },
  actifsEpargne: { disponibilites: [], assuranceVie: [], epargneRetraite: [], produitsDefiscalisation: [] },
  actifsProfessionnels: { biensProfessionnels: [], placementsFonciers: [] },
  passifs: { pretImmobilier: [], pretProfessionnel: [], autresPrets: [] },
  revenus: { revenusActivites: [], pensionsRetraites: [], revenusMobiliers: [], revenusImmobiliers: [], autresRevenus: [] },
  charges: { chargesGenerales: [], chargesDeductibles: [] },
};

const defaultSteps: Step[] = [
  { id: "situation-personnelle", label: "Situation personnelle", icon: "user", completed: true },
  { id: "composition-familiale", label: "Composition familiale", icon: "users", completed: true },
  { id: "enfants", label: "Enfants", icon: "baby", completed: true },
  {
    id: "actifs",
    label: "Actifs",
    icon: "wallet",
    completed: true,
    subSteps: [
      { id: "immobilier", label: "Immobilier et autres biens d'usage", completed: true },
      { id: "epargne", label: "Épargne et prévoyance", completed: true },
      { id: "biens-professionnels", label: "Biens professionnels et fonciers", completed: true },
    ],
  },
  { id: "passifs", label: "Passifs", icon: "credit-card", completed: true },
  { id: "revenus", label: "Revenus", icon: "banknote", completed: true },
  { id: "charges", label: "Charges", icon: "receipt", completed: true },
];

const stepOrder: StepId[] = [
  "situation-personnelle",
  "composition-familiale",
  "enfants",
  "actifs",
  "passifs",
  "revenus",
  "charges",
];

const actifsSubStepOrder: ActifsSubStep[] = ["immobilier", "epargne", "biens-professionnels"];

const WizardContext = createContext<WizardContextType | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<StepId>("situation-personnelle");
  const [currentActifsSubStep, setCurrentActifsSubStep] = useState<ActifsSubStep>("immobilier");
  const [steps, setSteps] = useState<Step[]>(defaultSteps);
  const [formData, setFormData] = useState<FormState>(staticInitialFormData);
  const [transcriptMode, setTranscriptMode] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [confidenceScores, setConfidenceScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("mode") === "live") return;
    }
    setFormData(generateRandomFormData());
  }, []);

  const enableTranscriptMode = useCallback((scores: Record<string, number>) => {
    setTranscriptMode(true);
    setConfidenceScores(scores);
  }, []);

  const enableLiveMode = useCallback(() => {
    setLiveMode(true);
    setFormData(staticInitialFormData);
  }, []);

  const addConfidenceScore = useCallback((field: string, score: number) => {
    setConfidenceScores((prev) => ({ ...prev, [field]: score }));
  }, []);

  const stepIndex = stepOrder.indexOf(currentStep) + 1;
  const totalSteps = stepOrder.length;
  const completionPercent = Math.round(
    (steps.filter((s) => s.completed).length / steps.length) * 100
  );

  const markStepCompleted = useCallback((stepId: StepId) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, completed: true } : s))
    );
  }, []);

  const markActifsSubStepCompleted = useCallback((subId: ActifsSubStep) => {
    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === "actifs" && s.subSteps) {
          const newSubs = s.subSteps.map((sub) =>
            sub.id === subId ? { ...sub, completed: true } : sub
          );
          const allDone = newSubs.every((sub) => sub.completed);
          return { ...s, subSteps: newSubs, completed: allDone };
        }
        return s;
      })
    );
  }, []);

  const updateFormData = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const goNext = useCallback(() => {
    markStepCompleted(currentStep);

    if (currentStep === "actifs") {
      markActifsSubStepCompleted(currentActifsSubStep);
      const subIdx = actifsSubStepOrder.indexOf(currentActifsSubStep);
      if (subIdx < actifsSubStepOrder.length - 1) {
        setCurrentActifsSubStep(actifsSubStepOrder[subIdx + 1]);
        return;
      }
    }

    const idx = stepOrder.indexOf(currentStep);
    if (idx < stepOrder.length - 1) {
      const next = stepOrder[idx + 1];
      setCurrentStep(next);
      if (next === "actifs") {
        setCurrentActifsSubStep("immobilier");
      }
    }
  }, [currentStep, currentActifsSubStep, markStepCompleted, markActifsSubStepCompleted]);

  const goPrev = useCallback(() => {
    if (currentStep === "actifs") {
      const subIdx = actifsSubStepOrder.indexOf(currentActifsSubStep);
      if (subIdx > 0) {
        setCurrentActifsSubStep(actifsSubStepOrder[subIdx - 1]);
        return;
      }
    }

    const idx = stepOrder.indexOf(currentStep);
    if (idx > 0) {
      const prev = stepOrder[idx - 1];
      setCurrentStep(prev);
      if (prev === "actifs") {
        setCurrentActifsSubStep("biens-professionnels");
      }
    }
  }, [currentStep, currentActifsSubStep]);

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        currentActifsSubStep,
        steps,
        formData,
        stepIndex,
        totalSteps,
        completionPercent,
        transcriptMode,
        liveMode,
        confidenceScores,
        setCurrentStep,
        setCurrentActifsSubStep,
        markStepCompleted,
        markActifsSubStepCompleted,
        updateFormData,
        goNext,
        goPrev,
        enableTranscriptMode,
        enableLiveMode,
        addConfidenceScore,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error("useWizard must be inside WizardProvider");
  return ctx;
}
