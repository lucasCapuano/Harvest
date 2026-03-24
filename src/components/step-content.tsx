"use client";

import { useWizard } from "@/lib/wizard-context";
import { SituationPersonnelleStep } from "@/components/steps/situation-personnelle";
import { CompositionFamilialeStep } from "@/components/steps/composition-familiale";
import { EnfantsStep } from "@/components/steps/enfants";
import { ActifsStep } from "@/components/steps/actifs";
import { PassifsStep } from "@/components/steps/passifs";
import { RevenusStep } from "@/components/steps/revenus";
import { ChargesStep } from "@/components/steps/charges";

export function StepContent() {
  const { currentStep } = useWizard();

  switch (currentStep) {
    case "situation-personnelle":
      return <SituationPersonnelleStep />;
    case "composition-familiale":
      return <CompositionFamilialeStep />;
    case "enfants":
      return <EnfantsStep />;
    case "actifs":
      return <ActifsStep />;
    case "passifs":
      return <PassifsStep />;
    case "revenus":
      return <RevenusStep />;
    case "charges":
      return <ChargesStep />;
    default:
      return <SituationPersonnelleStep />;
  }
}
