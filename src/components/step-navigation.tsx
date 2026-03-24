"use client";

import { useWizard } from "@/lib/wizard-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepNavigationProps {
  showPrev?: boolean;
  showNext?: boolean;
  nextLabel?: string;
  prevLabel?: string;
}

export function StepNavigation({
  showPrev = true,
  showNext = true,
  nextLabel = "Suivant",
  prevLabel = "Précédent",
}: StepNavigationProps) {
  const { goNext, goPrev, currentStep, stepIndex, totalSteps } = useWizard();

  const isFirst = currentStep === "situation-personnelle";

  return (
    <div className="mt-10">
      <Separator />
      <div className="flex items-center justify-between pt-5">
        {showPrev && !isFirst ? (
          <Button variant="outline" size="lg" onClick={goPrev} className="gap-2">
            <ArrowLeft className="size-4" />
            {prevLabel}
          </Button>
        ) : (
          <div />
        )}

        {showNext && (
          <Button size="lg" onClick={goNext} className="gap-2">
            {nextLabel}
            <ArrowRight className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
