"use client";

import { useState } from "react";
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
  X,
  ArrowRight,
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
    <div className="flex flex-1 text-left cursor-pointer">
      <Card className="flex flex-1 flex-col justify-between gap-3 w-full transition-colors hover:bg-muted/50" style={{ padding: "20px" }}>
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
        <p className="line-clamp-2 text-sm text-muted-foreground">{app.description}</p>
      </div>
      {app.action && (
        <div className="mt-4 flex justify-end">
          {app.action.variant === "default" ? (
            <Button
              size="sm"
              className="gap-1.5 bg-primary text-primary-foreground transition-all hover:bg-primary/90"
            >
              <ExternalLink className="size-4" />
              {app.action.label}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="size-4" />
              {app.action.label}
            </Button>
          )}
        </div>
      )}
      </Card>
    </div>
  );
}

function RequestCard({ app }: { app: AppCard }) {
  return (
    <div className="w-full text-left cursor-pointer">
      <Card className="relative w-full gap-2 transition-colors hover:bg-muted/50" style={{ padding: "20px" }}>
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
    </div>
  );
}

export default function ApplicationsPage() {
  const loading = useLoading();
  const [showTemplates, setShowTemplates] = useState(true);

  if (loading) {
    return (
      <AppLayout title="Applications">
        <div className="mb-8">
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
        {/* Nos agents */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-8 w-36 rounded-md" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border">
                <Skeleton className="h-28 rounded-none" />
                <div className="p-6 space-y-2.5">
                  <Skeleton className="h-[18px] w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
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
          <section className="mb-8">
            <h2 className="mb-4 text-[18px] font-semibold text-foreground">
              Les essentiels Harvest
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {essentialApps.map((app) => (
                <EssentialCard key={app.name} app={app} />
              ))}
            </div>
          </section>

          {/* Nos agents (hidden) */}
          <section className="hidden">
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

          {/* Agents section */}
          <h2 className="mt-8 mb-4 text-[18px] font-semibold text-foreground">Nos agents</h2>
          {showTemplates && (
            <section className="rounded-xl border border-border bg-muted/30 p-5">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h4 className="text-base font-semibold text-foreground">Optimiser votre workflow avec nos agents</h4>
                </div>
                <button className="inline-flex items-center text-sm font-medium text-foreground hover:underline">
                  Voir tous les modèles
                  <ArrowRight className="ml-1 size-3.5" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-6 text-left transition-all duration-200 hover:bg-muted/50 cursor-pointer">
                  <div className="flex min-w-0 flex-col gap-2.5">
                    <svg className="h-[18px] w-auto self-start" viewBox="0 0 115 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.4039 21.2945H7.05759L0 0H3.80258L8.73073 15.7883L13.6589 0H17.4615L10.4039 21.2945Z" fill="currentColor"/>
                      <path d="M30.92 13.4764C30.92 14.0543 30.8896 14.5107 30.8287 15.3016H20.3032C20.3944 17.5527 21.8546 18.7695 24.2579 18.7695C25.9006 18.7695 26.874 18.2524 27.4216 17.1573H30.7679C30.342 19.8039 27.665 21.6595 24.2579 21.6595C19.786 21.6595 17.0177 18.8 17.0177 14.2065C17.0177 9.67377 19.8164 6.75339 24.1362 6.75339C28.1821 6.75339 30.92 9.49125 30.92 13.4764ZM20.3032 12.7767H27.665C27.6346 10.5864 26.3569 9.36957 24.0753 9.36957C21.733 9.36957 20.3336 10.7689 20.3032 12.7767Z" fill="currentColor"/>
                      <path d="M37.4405 21.2945H34.1246V0H37.4405V21.2945Z" fill="currentColor"/>
                      <path d="M48.1188 21.6595C43.4341 21.6595 40.6353 18.3741 40.6353 14.2065C40.6353 10.0388 43.4341 6.75339 48.1188 6.75339C52.8036 6.75339 55.6023 10.0388 55.6023 14.2065C55.6023 18.3741 52.8036 21.6595 48.1188 21.6595ZM48.1188 18.7087C50.7959 18.7087 52.2865 16.7922 52.2865 14.2065C52.2865 11.6207 50.7959 9.70419 48.1188 9.70419C45.4418 9.70419 43.9512 11.6207 43.9512 14.2065C43.9512 16.7922 45.4418 18.7087 48.1188 18.7087Z" fill="currentColor"/>
                      <path d="M65.0719 21.6595C60.6609 21.6595 58.0143 18.6174 58.0143 14.2065C58.0143 9.79545 60.6609 6.75339 65.0719 6.75339C69.0266 6.75339 71.4907 8.91325 71.7949 12.1683H68.479C68.114 10.556 67.0797 9.70419 65.0719 9.70419C62.7295 9.70419 61.3302 11.3165 61.3302 14.2065C61.3302 17.0964 62.7295 18.7087 65.0719 18.7087C67.0797 18.7087 68.114 17.8874 68.479 16.3967H71.7949C71.4907 19.5605 69.0266 21.6595 65.0719 21.6595Z" fill="currentColor"/>
                      <path d="M76.6451 5.08025C75.1849 5.08025 74.181 3.98511 74.181 2.61618C74.181 1.24725 75.1849 0.152103 76.6451 0.152103C78.1053 0.152103 79.1092 1.24725 79.1092 2.61618C79.1092 3.98511 78.1053 5.08025 76.6451 5.08025ZM78.2878 21.2945H75.0024V7.11844H78.2878V21.2945Z" fill="currentColor"/>
                      <path d="M88.9669 18.4958C89.484 18.4958 90.3054 18.4349 90.64 18.3741V21.2945C90.1229 21.3857 89.1494 21.477 88.176 21.477C86.5637 21.477 83.5824 21.264 83.5824 16.488V9.88671H81.1792V7.11844H83.5824V2.82912H86.8983V7.11844H90.1533V9.88671H86.8983V15.7275C86.8983 18.1916 87.6588 18.4958 88.9669 18.4958Z" fill="currentColor"/>
                      <path d="M103.332 14.4498V7.11844H114.253V14.2369V21.3553C114.253 23.576 105.978 25.2491 104.792 26.4051C103.636 27.4699 101.993 28.0479 99.9856 28.0479C97.8866 28.0479 96.2439 27.5307 95.1183 26.5877C94.1144 25.7055 93.5668 24.4582 93.5364 22.9068H96.8827C97.0348 24.4582 97.7953 25.31 99.9248 25.31C101.902 25.31 103.332 24.1236 103.332 21.1119V19.3171C102.45 20.8382 100.868 21.6595 98.7688 21.6595C95.2704 21.6595 93.5364 19.165 93.5364 15.7579V7.11844H96.8523V15.0582C96.8523 17.1573 97.5519 18.7391 99.9248 18.7391C102.237 18.7391 103.332 16.8835 103.332 14.4498Z" fill="currentColor"/>
                    </svg>
                    <p className="line-clamp-2 text-left text-sm font-normal text-muted-foreground">Accélère l&apos;onboarding et réduit les frictions administratives.</p>
                  </div>
                </div>
                <div className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-6 text-left transition-all duration-200 hover:bg-muted/50 cursor-pointer">
                  <div className="flex min-w-0 flex-col gap-2.5">
                    <svg className="h-[18px] w-auto self-start" viewBox="0 0 101 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.1259 22.4352C4.15692 22.4352 0 17.7586 0 11.2176C0 4.67654 4.15692 0 11.1259 0C17.025 0 20.8457 3.33165 21.4876 7.85536H17.6364C16.9639 4.95163 14.7021 3.14826 11.1564 3.14826C6.41878 3.14826 3.69844 6.32708 3.69844 11.2176C3.69844 16.1081 6.41878 19.2869 11.1564 19.2869C14.7021 19.2869 16.9639 17.4835 17.6364 14.5798H21.4876C20.8457 19.1035 17.025 22.4352 11.1259 22.4352Z" fill="currentColor"/>
                      <path d="M28.042 21.9155H24.7104V0.519614H28.042V21.9155Z" fill="currentColor"/>
                      <path d="M38.2517 22.2823C33.6668 22.2823 31.2521 18.9812 31.2521 14.7938C31.2521 10.6063 33.9114 7.30518 38.3434 7.30518C40.2384 7.30518 41.9501 8.16102 42.8365 9.5976V7.67197H46.1376V21.9155H42.8365V19.9899C41.9501 21.4265 39.9939 22.2823 38.2517 22.2823ZM38.7407 19.3175C41.5833 19.3175 42.9588 17.239 42.9588 14.7938C42.9588 12.3485 41.5833 10.27 38.7407 10.27C36.1426 10.27 34.5838 12.1957 34.5838 14.7938C34.5838 17.3918 36.1426 19.3175 38.7407 19.3175Z" fill="currentColor"/>
                      <path d="M53.7422 21.9155H50.4106V7.67197H53.7422V10.4229C54.2618 8.40554 55.9735 7.48857 57.5324 7.48857C58.052 7.48857 58.4799 7.51914 58.8467 7.61084V10.6674C58.3271 10.6063 58.052 10.6063 57.5324 10.6063C55.1788 10.6063 53.7422 12.3791 53.7422 15.619V21.9155Z" fill="currentColor"/>
                      <path d="M63.2546 5.62407C61.7874 5.62407 60.7788 4.52371 60.7788 3.14826C60.7788 1.7728 61.7874 0.672442 63.2546 0.672442C64.7217 0.672442 65.7304 1.7728 65.7304 3.14826C65.7304 4.52371 64.7217 5.62407 63.2546 5.62407ZM64.9051 21.9155H61.604V7.67197H64.9051V21.9155Z" fill="currentColor"/>
                      <path d="M75.6351 19.1035C76.1547 19.1035 76.98 19.0424 77.3162 18.9812V21.9155C76.7966 22.0072 75.8185 22.0989 74.8404 22.0989C73.2204 22.0989 70.225 21.885 70.225 17.0862V10.4534H67.8103V7.67197H70.225V3.36222H73.5566V7.67197H76.8271V10.4534H73.5566V16.322C73.5566 18.7979 74.3208 19.1035 75.6351 19.1035Z" fill="currentColor"/>
                      <path d="M90.0685 15.0383V7.67197L100.864 7.63846V21.9432C100.864 24.1745 92.7277 25.8891 91.5357 27.0506C90.3742 28.1204 88.7236 28.7011 86.7063 28.7011C84.5973 28.7011 82.9467 28.1815 81.8158 27.234C80.8071 26.3476 80.2569 25.0944 80.2264 23.5355H83.5886C83.7414 25.0944 84.5056 25.9502 86.6451 25.9502C88.6319 25.9502 90.0685 24.7581 90.0685 21.7322V19.9288C89.1821 21.4571 87.5927 22.2823 85.4837 22.2823C81.9686 22.2823 80.2264 19.776 80.2264 16.3526V7.67197H83.558V15.6496C83.558 17.7586 84.261 19.348 86.6451 19.348C88.9681 19.348 90.0685 17.4835 90.0685 15.0383Z" fill="currentColor"/>
                    </svg>
                    <p className="line-clamp-2 text-left text-sm font-normal text-muted-foreground">Renforce la qualité du diagnostic et des recommandations patrimoniales.</p>
                  </div>
                </div>
                <div className="flex w-full items-start gap-3 rounded-2xl border border-border bg-card p-6 text-left transition-all duration-200 hover:bg-muted/50 cursor-pointer">
                  <div className="flex min-w-0 flex-col gap-2.5">
                    <svg className="h-3.5 w-auto self-start" viewBox="0 0 158 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.35895 21.3752H0V0H3.35895L10.199 16.3673L17.0085 0H20.3675V21.3752H17.0085V7.23702L11.512 21.3752H8.85542L3.35895 7.08434V21.3752Z" fill="currentColor"/>
                      <path d="M31.2499 21.7416C26.5474 21.7416 23.7381 18.4437 23.7381 14.2603C23.7381 10.0769 26.5474 6.77898 31.2499 6.77898C35.9525 6.77898 38.7618 10.0769 38.7618 14.2603C38.7618 18.4437 35.9525 21.7416 31.2499 21.7416ZM31.2499 18.7796C33.9371 18.7796 35.4334 16.8558 35.4334 14.2603C35.4334 11.6647 33.9371 9.74096 31.2499 9.74096C28.5628 9.74096 27.0665 11.6647 27.0665 14.2603C27.0665 16.8558 28.5628 18.7796 31.2499 18.7796Z" fill="currentColor"/>
                      <path d="M45.2819 21.3752H41.9535V7.14541H45.2819V9.13024C45.8926 7.8172 47.3889 6.77898 49.2516 6.77898C51.8471 6.77898 53.1297 7.90881 53.7404 9.31346C54.4122 7.87827 56.0916 6.77898 58.107 6.77898C62.382 6.77898 63.237 9.71043 63.237 12.3671V21.3752H59.9086V13.0083C59.9086 10.657 58.9926 9.61882 57.252 9.61882C55.5725 9.61882 54.2595 10.4433 54.2595 13.8328V21.3752H50.9311V12.9778C50.9311 10.6265 50.0761 9.61882 48.3355 9.61882C46.656 9.61882 45.2819 10.4433 45.2819 13.8328V21.3752Z" fill="currentColor"/>
                      <path d="M80.2465 13.5274C80.2465 14.1076 80.216 14.5656 80.1549 15.3596H69.5895C69.6811 17.6192 71.1468 18.8407 73.5591 18.8407C75.2081 18.8407 76.1852 18.3216 76.7349 17.2223H80.0938C79.6663 19.8789 76.9792 21.7416 73.5591 21.7416C69.0704 21.7416 66.2916 18.8712 66.2916 14.2603C66.2916 9.71043 69.1009 6.77898 73.437 6.77898C77.4983 6.77898 80.2465 9.52721 80.2465 13.5274ZM69.5895 12.8251H76.9792C76.9486 10.6265 75.6661 9.40507 73.3759 9.40507C71.0247 9.40507 69.62 10.8097 69.5895 12.8251Z" fill="currentColor"/>
                      <path d="M86.7917 21.3752H83.4633V7.14541H86.7917V9.13024C87.6772 7.60345 89.3262 6.77898 91.4332 6.77898C94.8532 6.77898 96.6243 8.70274 96.6243 12.4281V21.3752H93.2959V13.9549C93.2959 10.9319 92.5019 9.61882 90.1812 9.61882C88.0131 9.61882 86.7917 11.054 86.7917 13.558V21.3752Z" fill="currentColor"/>
                      <path d="M106.785 18.5658C107.304 18.5658 108.128 18.5048 108.464 18.4437V21.3752C107.945 21.4668 106.968 21.5584 105.991 21.5584C104.372 21.5584 101.38 21.3446 101.38 16.5505V9.92418H98.9674V7.14541H101.38V2.83984H104.708V7.14541H107.976V9.92418H104.708V15.7871C104.708 18.2605 105.472 18.5658 106.785 18.5658Z" fill="currentColor"/>
                      <path d="M116.654 21.7416C113.54 21.7416 111.371 19.9094 111.371 16.0924V7.14541H114.7V15.268C114.7 17.5582 115.433 18.9017 117.601 18.9017C120.135 18.9017 121.051 17.2223 121.051 15.1764V7.14541H124.38V21.3752H121.051V19.3903C120.196 20.9171 118.7 21.7416 116.654 21.7416Z" fill="currentColor"/>
                      <path d="M131.969 21.3752H128.641V7.14541H131.969V9.13024C132.58 7.8172 134.076 6.77898 135.939 6.77898C138.535 6.77898 139.817 7.90881 140.428 9.31346C141.1 7.87827 142.779 6.77898 144.794 6.77898C149.069 6.77898 157.479 9.71043 157.479 12.3671V21.3752H146.596V13.0083C146.596 10.657 145.68 9.61882 143.939 9.61882C142.26 9.61882 140.947 10.4433 140.947 13.8328V21.3752H137.619V12.9778C137.619 10.6265 136.764 9.61882 135.023 9.61882C133.343 9.61882 131.969 10.4433 131.969 13.8328V21.3752Z" fill="currentColor"/>
                    </svg>
                    <p className="line-clamp-2 text-left text-sm font-normal text-muted-foreground">Suivi proactif et détection d&apos;opportunités pour stimuler la croissance.</p>
                  </div>
                </div>
              </div>

            </section>
          )}

          {/* Available by request */}
          <section className="mt-8">
            <h2 className="mb-4 text-[18px] font-semibold text-foreground">
              Disponibles sur demande
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {requestApps.map((app) => (
                <RequestCard key={app.name} app={app} />
              ))}
            </div>
          </section>
    </AppLayout>
  );
}
