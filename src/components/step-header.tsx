"use client";

import { useWizard } from "@/lib/wizard-context";

interface StepHeaderProps {
  title: string;
  description: string;
}

export function StepHeader({ title, description }: StepHeaderProps) {
  const { stepIndex, totalSteps } = useWizard();

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <span className="text-xs tabular-nums text-muted-foreground">
          Étape {stepIndex} sur {totalSteps}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
