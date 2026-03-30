"use client";

import { useWizard } from "@/lib/wizard-context";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import type { StepId, ActifsSubStep } from "@/lib/types";
import {
  User,
  Users,
  Baby,
  Wallet,
  CreditCard,
  Banknote,
  Receipt,
  Check,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  user: User,
  users: Users,
  baby: Baby,
  wallet: Wallet,
  "credit-card": CreditCard,
  banknote: Banknote,
  receipt: Receipt,
};

export function Sidebar() {
  const {
    currentStep,
    currentActifsSubStep,
    steps,
    completionPercent,
    setCurrentStep,
    setCurrentActifsSubStep,
  } = useWizard();

  const currentIdx = steps.findIndex((s) => s.id === currentStep);
  const isActifsExpanded =
    currentStep === "actifs" || steps.find((s) => s.id === "actifs")?.completed;

  return (
    <aside className="flex w-[260px] shrink-0 flex-col border-r bg-card">
      {/* Progress header */}
      <div className="px-5 pt-6 pb-5">
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
          Nouveau dossier
        </p>
        <div className="flex items-end justify-between mb-2">
          <span className="text-2xl font-bold tabular-nums leading-none">
            {completionPercent}
            <span className="text-sm font-medium text-muted-foreground">%</span>
          </span>
          <span className="text-[11px] text-muted-foreground">
            {steps.filter((s) => s.completed).length}/{steps.length} étapes
          </span>
        </div>
        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <Separator />

      {/* Step list — vertical timeline */}
      <nav className="flex-1 overflow-y-auto py-4 px-4">
        <ol className="relative">
          {steps.map((step, idx) => {
            const Icon = iconMap[step.icon];
            const isActive = currentStep === step.id;
            const isCompleted = step.completed;
            const isPast = idx < currentIdx;
            const isLast = idx === steps.length - 1;

            return (
              <li key={step.id} className="relative pb-4">
                {/* Connector line */}
                {!isLast && (
                  <div
                    className={cn(
                      "absolute left-[23px] top-[38px] w-px",
                      step.id === "actifs" && isActifsExpanded
                        ? "h-[calc(100%-22px)]"
                        : "h-[calc(100%-22px)]",
                      isPast || isCompleted
                        ? "bg-foreground/15"
                        : "bg-border"
                    )}
                  />
                )}

                <button
                  onClick={() => setCurrentStep(step.id as StepId)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-md px-2 py-2 text-[13px] transition-colors",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {/* Step indicator */}
                  <div
                    className={cn(
                      "relative z-10 flex size-[30px] shrink-0 items-center justify-center rounded-full border-2 transition-all",
                      isActive &&
                        "border-foreground bg-foreground text-background shadow-[0_0_0_3px] shadow-foreground/15",
                      isCompleted &&
                        !isActive &&
                        "border-foreground/40 bg-foreground/10 text-foreground",
                      !isActive &&
                        !isCompleted &&
                        "border-border bg-card text-muted-foreground group-hover:border-muted-foreground/50"
                    )}
                  >
                    {isCompleted && !isActive ? (
                      <Check className="size-3.5" strokeWidth={2.5} />
                    ) : (
                      <Icon className="size-3.5" />
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "flex-1 text-left truncate transition-colors",
                      isActive && "font-semibold"
                    )}
                  >
                    {step.label}
                  </span>
                </button>

                {/* Sub-steps for Actifs */}
                {step.id === "actifs" && step.subSteps && isActifsExpanded && (
                  <div className="relative ml-[23px] border-l border-border pl-5 pb-1 flex flex-col">
                    {step.subSteps.map((sub) => {
                      const isSubActive =
                        currentStep === "actifs" &&
                        currentActifsSubStep === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            setCurrentStep("actifs");
                            setCurrentActifsSubStep(sub.id as ActifsSubStep);
                          }}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-xs transition-colors",
                            isSubActive
                              ? "text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <div
                            className={cn(
                              "size-1.5 shrink-0 rounded-full transition-colors",
                              isSubActive && "bg-foreground",
                              !isSubActive && sub.completed && "bg-foreground/40",
                              !isSubActive &&
                                !sub.completed &&
                                "bg-muted-foreground/30"
                            )}
                          />
                          <span className="truncate">{sub.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
