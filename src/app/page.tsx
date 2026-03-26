"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { WizardProvider, useWizard } from "@/lib/wizard-context";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { StepContent } from "@/components/step-content";
import { LiveMeetingPanel } from "@/components/live-meeting-panel";
import { ScrollArea } from "@/components/ui/scroll-area";

function ModeInitializer() {
  const searchParams = useSearchParams();
  const { enableTranscriptMode, enableLiveMode, transcriptMode, liveMode } = useWizard();

  useEffect(() => {
    const mode = searchParams.get("mode");

    if (mode === "transcript" && !transcriptMode) {
      const scores: Record<string, number> = {
        "situationPersonnelle.civilite": 92,
        "situationPersonnelle.nom": 97,
        "situationPersonnelle.prenom": 95,
        "situationPersonnelle.dateNaissance": 78,
        "situationPersonnelle.professionCSP": 85,
        "situationPersonnelle.professionLibelle": 88,
        "situationPersonnelle.telephone": 72,
        "situationPersonnelle.email": 65,
        "compositionFamiliale.situationFamiliale": 90,
        "compositionFamiliale.partenaire.civilite": 88,
        "compositionFamiliale.partenaire.nom": 94,
        "compositionFamiliale.partenaire.prenom": 91,
        "compositionFamiliale.partenaire.dateNaissance": 70,
        "compositionFamiliale.partenaire.professionCSP": 76,
        "compositionFamiliale.partenaire.professionLibelle": 80,
        "enfants": 82,
      };
      enableTranscriptMode(scores);
    }

    if (mode === "live" && !liveMode) {
      enableLiveMode();
    }
  }, [searchParams, enableTranscriptMode, enableLiveMode, transcriptMode, liveMode]);

  return null;
}

function FormLayout() {
  const { liveMode } = useWizard();

  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <ScrollArea className="flex-1">
          <Header />
          <main className="mx-auto w-full max-w-2xl px-8 py-10">
            <StepContent />
          </main>
        </ScrollArea>
        <LiveMeetingPanel />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <WizardProvider>
      <ModeInitializer />
      <FormLayout />
    </WizardProvider>
  );
}
