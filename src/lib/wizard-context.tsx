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
  importFormData: (data: Partial<FormState>, scores: Record<string, number>) => void;
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

  const importFormData = useCallback((data: Partial<FormState>, scores: Record<string, number>) => {
    // Start from clean slate, then overlay imported data
    setFormData(() => {
      const base = JSON.parse(JSON.stringify(staticInitialFormData)) as FormState;
      return { ...base, ...data };
    });
    setLiveMode(true);
    setTranscriptMode(true);
    setConfidenceScores((prev) => ({ ...prev, ...scores }));
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
        importFormData,
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
