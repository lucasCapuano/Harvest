"use client";

import { WizardProvider } from "@/lib/wizard-context";
import { Header } from "@/components/header";
import { Sidebar } from "@/components/sidebar";
import { StepContent } from "@/components/step-content";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Home() {
  return (
    <WizardProvider>
      <div className="flex h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <ScrollArea className="flex-1">
            <main className="mx-auto w-full max-w-2xl px-8 py-10">
              <StepContent />
            </main>
          </ScrollArea>
        </div>
      </div>
    </WizardProvider>
  );
}
