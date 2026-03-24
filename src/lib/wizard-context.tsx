"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
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
  setCurrentStep: (step: StepId) => void;
  setCurrentActifsSubStep: (sub: ActifsSubStep) => void;
  markStepCompleted: (stepId: StepId) => void;
  markActifsSubStepCompleted: (subId: ActifsSubStep) => void;
  updateFormData: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  goNext: () => void;
  goPrev: () => void;
}

const defaultFormData: FormState = {
  situationPersonnelle: {
    civilite: "Monsieur",
    nom: "Dupont",
    prenom: "Jean-Pierre",
    dateNaissance: "1978-05-14",
    professionCSP: "Salarié cadre",
    professionLibelle: "Directeur commercial",
    telephone: "06 12 34 56 78",
    email: "jp.dupont@email.fr",
  },
  compositionFamiliale: {
    situationFamiliale: "Marié(e)",
    partenaire: {
      civilite: "Madame",
      nom: "Dupont",
      prenom: "Marie",
      dateNaissance: "1980-09-22",
      professionCSP: "Profession libérale",
      professionLibelle: "Avocate",
    },
  },
  enfants: [
    { id: "e1", prenom: "Lucas", dateNaissance: "2008-03-12", aCharge: true },
    { id: "e2", prenom: "Emma", dateNaissance: "2011-07-25", aCharge: true },
  ],
  actifsImmobilier: {
    biensUsage: [],
    immobilierRapport: [],
    immobilierDefiscalisant: [],
  },
  actifsEpargne: {
    disponibilites: [],
    assuranceVie: [],
    epargneRetraite: [],
    produitsDefiscalisation: [],
  },
  actifsProfessionnels: {
    biensProfessionnels: [],
    placementsFonciers: [],
  },
  passifs: {
    pretImmobilier: [],
    pretProfessionnel: [],
    autresPrets: [],
  },
  revenus: {
    revenusActivites: [],
    pensionsRetraites: [],
    revenusMobiliers: [],
    revenusImmobiliers: [],
    autresRevenus: [],
  },
  charges: {
    chargesGenerales: [],
    chargesDeductibles: [],
  },
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
  const [formData, setFormData] = useState<FormState>(defaultFormData);

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
        setCurrentStep,
        setCurrentActifsSubStep,
        markStepCompleted,
        markActifsSubStepCompleted,
        updateFormData,
        goNext,
        goPrev,
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
