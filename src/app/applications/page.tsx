"use client";

import { ProductIcon } from "@/components/product-icon";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoading } from "@/hooks/use-loading";
import {
  ExternalLink,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";

interface AppCard {
  name: string;
  description: string;
  gradient: [string, string];
  solidGlow?: string;
  subscribed?: boolean;
  action?: { label: string; variant: "default" | "outline" };
}

const essentialApps: AppCard[] = [
  {
    name: "Big",
    description: "Bilans patrimoniaux puissants pour un conseil expert et à forte valeur ajoutée.",
    gradient: ["#2C42DD", "#5B6EF5"],
    subscribed: true,
    action: { label: "Ouvrir", variant: "default" },
  },
  {
    name: "O2S",
    description: "Le CRM patrimonial pour piloter, centraliser et performer au quotidien.",
    gradient: ["#1B998B", "#4ECDC4"],
    subscribed: true,
    action: { label: "Ouvrir", variant: "default" },
  },
  {
    name: "Fidnet",
    description: "Des contenus experts pour fiabiliser et accélérer chaque recommandation.",
    gradient: ["#F99E29", "#FBD37F"],
    action: { label: "Demander une démo", variant: "outline" },
  },
];

const requestApps: AppCard[] = [
  {
    name: "Feefty",
    description: "Investissement en produits structurés sur-mesure",
    gradient: ["#13D1E7", "#13D1E7"],
    solidGlow: "#12CEE7",
  },
  {
    name: "Clickimpôts",
    description: "Logiciel de calcul et déclaration fiscale",
    gradient: ["#D41653", "#F852A2"],
  },
  {
    name: "Quantix",
    description: "Simulateurs digitaux patrimoniaux",
    gradient: ["#0C1E4C", "#4E4CAA"],
  },
  {
    name: "Moneypitch",
    description: "Renforcez la relation client",
    gradient: ["#300B51", "#873BAB"],
  },
  {
    name: "VIC",
    description: "Solution de crédit omnicanale",
    gradient: ["#20CE80", "#79FFC3"],
  },
  {
    name: "Genese",
    description: "Logiciel de calcul et déclaration fiscale",
    gradient: ["#F99E29", "#FBD37F"],
  },
  {
    name: "REP",
    description: "Conformité simplifiée, contrôle centralisé",
    gradient: ["#0C2B4C", "#4C84AA"],
  },
];

function EssentialCard({ app }: { app: AppCard }) {
  return (
    <Card className="flex-1 justify-between gap-3" style={{ padding: "20px" }}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <ProductIcon
            gradientStart={app.gradient[0]}
            gradientEnd={app.gradient[1]}
            solidGlow={app.solidGlow}
            size={32}
          />
          <span className="flex-1 text-lg font-semibold text-foreground">
            {app.name}
          </span>
          {app.subscribed && (
            <Badge
              variant="secondary"
              className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            >
              <CheckCircle2 className="size-3" />
              Souscrit
            </Badge>
          )}
          {!app.subscribed && !app.action?.label.includes("Know") && (
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          )}
        </div>
        <p className="line-clamp-2 text-sm" style={{ color: "rgba(0, 0, 17, 0.53)" }}>{app.description}</p>
      </div>
      {app.action && (
        <div className="mt-4 flex justify-end">
          {app.action.variant === "default" ? (
            <Button
              className="gap-1.5 bg-[#0052CC] text-white transition-all hover:bg-[#0052CC]/90"
            >
              <ExternalLink className="size-4" />
              {app.action.label}
            </Button>
          ) : (
            <Button variant="outline" className="gap-1.5">
              <ExternalLink className="size-4" />
              {app.action.label}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

function RequestCard({ app }: { app: AppCard }) {
  return (
    <Card className="relative gap-2" style={{ padding: "20px" }}>
      <div className="flex items-center gap-2">
        <ProductIcon
          gradientStart={app.gradient[0]}
          gradientEnd={app.gradient[1]}
          solidGlow={app.solidGlow}
          size={28}
        />
        <span className="flex-1 text-base font-semibold text-foreground">
          {app.name}
        </span>
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
      <p className="truncate text-sm text-muted-foreground">{app.description}</p>
    </Card>
  );
}

export default function ApplicationsPage() {
  const loading = useLoading();

  if (loading) {
    return (
      <AppLayout title={<Skeleton className="h-6 w-32" />}>
        <div className="mb-10">
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="p-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-8 rounded-lg" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="ml-auto h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-end pt-2">
                  <Skeleton className="h-8 w-20 rounded-md" />
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <Skeleton className="h-6 w-56 mb-4" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="p-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-7 rounded-lg" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="ml-auto size-6 rounded-md" />
                </div>
                <Skeleton className="h-4 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Applications">
          {/* Harvest's essential */}
          <section className="mb-10">
            <h2 className="mb-4 text-[18px] font-semibold text-foreground">
              Les essentiels Harvest
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {essentialApps.map((app) => (
                <EssentialCard key={app.name} app={app} />
              ))}
            </div>
          </section>

          {/* Available by request */}
          <section>
            <h2 className="mb-4 text-[18px] font-semibold text-foreground">
              Disponibles sur demande
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {requestApps.map((app) => (
                <RequestCard key={app.name} app={app} />
              ))}
            </div>
          </section>

          {/* Nos agents (hidden) */}
          <section className="mt-10 hidden">
            <h2 className="mb-4 text-[18px] font-semibold text-foreground">
              Nos agents
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {/* Velocity */}
              <div className="group overflow-hidden rounded-xl border border-border">
                <div className="flex h-28 items-center justify-center bg-zinc-950 relative">
                  <svg width="80" height="68" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 90 L70 60 L110 90" stroke="#33ee87" strokeWidth="1" opacity="0.2" />
                    <path d="M30 80 L70 50 L110 80" stroke="#33ee87" strokeWidth="1" opacity="0.3" />
                    <path d="M30 70 L70 40 L110 70" stroke="#33ee87" strokeWidth="1" opacity="0.4" />
                    <path d="M30 60 L70 30 L110 60" stroke="#33ee87" strokeWidth="1" opacity="0.5" />
                    <path d="M30 50 L70 20 L110 50" stroke="#33ee87" strokeWidth="1" opacity="0.7" />
                    <path d="M30 40 L70 10 L110 40" stroke="#33ee87" strokeWidth="1" opacity="0.9" />
                    <path d="M65 10 L70 2 L75 10" stroke="#33ee87" strokeWidth="1.5" fill="none" />
                    <line x1="15" y1="55" x2="40" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                    <line x1="10" y1="65" x2="35" y2="65" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    <line x1="100" y1="55" x2="125" y2="55" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                    <line x1="105" y1="65" x2="130" y2="65" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                  </svg>
                </div>
                <div className="p-5">
                  <img src="/velocity-logo.png" alt="Velocity" className="h-5 w-auto max-w-[100px] object-contain invert dark:invert-0" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Accélère l&apos;onboarding et réduit les frictions administratives.
                  </p>
                </div>
              </div>

              {/* Clarity */}
              <div className="group overflow-hidden rounded-xl border border-border">
                <div className="flex h-28 items-center justify-center bg-zinc-950 relative">
                  <svg width="80" height="68" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="70,10 115,30 115,70 70,90 25,70 25,30" stroke="#33ee87" strokeWidth="0.5" opacity="0.2" />
                    <polygon points="70,20 105,36 105,64 70,80 35,64 35,36" stroke="#33ee87" strokeWidth="0.7" opacity="0.35" />
                    <polygon points="70,30 95,42 95,58 70,70 45,58 45,42" stroke="#33ee87" strokeWidth="0.8" opacity="0.5" />
                    <polygon points="70,40 85,48 85,52 70,60 55,52 55,48" stroke="#33ee87" strokeWidth="1" opacity="0.7" />
                    <circle cx="70" cy="50" r="2" fill="#33ee87" opacity="0.9" />
                    <line x1="70" y1="10" x2="70" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                    <line x1="25" y1="30" x2="115" y2="70" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                    <line x1="25" y1="70" x2="115" y2="30" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                    <circle cx="70" cy="10" r="1.5" stroke="#33ee87" strokeWidth="0.5" fill="none" opacity="0.4" />
                    <circle cx="115" cy="30" r="1.5" stroke="#33ee87" strokeWidth="0.5" fill="none" opacity="0.4" />
                    <circle cx="25" cy="30" r="1.5" stroke="#33ee87" strokeWidth="0.5" fill="none" opacity="0.4" />
                  </svg>
                </div>
                <div className="p-5">
                  <img src="/clarity-logo.png" alt="Clarity" className="h-5 w-auto max-w-[100px] object-contain invert dark:invert-0" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Renforce la qualité du diagnostic et des recommandations patrimoniales.
                  </p>
                </div>
              </div>

              {/* Momentum */}
              <div className="group overflow-hidden rounded-xl border border-border">
                <div className="flex h-28 items-center justify-center bg-zinc-950 relative">
                  <svg width="80" height="68" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M70 100 L20 72 L20 58 L70 86 Z" stroke="#33ee87" strokeWidth="0.7" opacity="0.25" fill="none" />
                    <path d="M70 100 L120 72 L120 58 L70 86 Z" stroke="#33ee87" strokeWidth="0.7" opacity="0.25" fill="none" />
                    <path d="M70 86 L20 58 L70 30 L120 58 Z" stroke="#33ee87" strokeWidth="0.7" opacity="0.25" fill="none" />
                    <path d="M70 80 L30 56 L30 44 L70 68 Z" stroke="#33ee87" strokeWidth="0.8" opacity="0.45" fill="none" />
                    <path d="M70 80 L110 56 L110 44 L70 68 Z" stroke="#33ee87" strokeWidth="0.8" opacity="0.45" fill="none" />
                    <path d="M70 68 L30 44 L70 20 L110 44 Z" stroke="#33ee87" strokeWidth="0.8" opacity="0.45" fill="none" />
                    <path d="M70 58 L42 42 L42 32 L70 48 Z" stroke="#33ee87" strokeWidth="1" opacity="0.7" fill="none" />
                    <path d="M70 58 L98 42 L98 32 L70 48 Z" stroke="#33ee87" strokeWidth="1" opacity="0.7" fill="none" />
                    <path d="M70 48 L42 32 L70 16 L98 32 Z" stroke="#33ee87" strokeWidth="1" opacity="0.7" fill="none" />
                    <circle cx="70" cy="16" r="1.5" fill="#33ee87" opacity="0.9" />
                    <line x1="125" y1="95" x2="125" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                    <path d="M122 24 L125 18 L128 24" stroke="#33ee87" strokeWidth="0.8" fill="none" opacity="0.5" />
                  </svg>
                </div>
                <div className="p-5">
                  <img src="/momentum-logo.png" alt="Momentum" className="h-5 w-auto max-w-[100px] object-contain invert dark:invert-0" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Suivi proactif et détection d&apos;opportunités pour stimuler la croissance.
                  </p>
                </div>
              </div>
            </div>
          </section>
    </AppLayout>
  );
}
