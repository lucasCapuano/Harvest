"use client";

import { ProductIcon } from "@/components/product-icon";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    description: "Solution digitale de gestion de patrimoine en SaaS",
    gradient: ["#2C42DD", "#5B6EF5"],
    subscribed: true,
    action: { label: "Ouvrir", variant: "default" },
  },
  {
    name: "O2S",
    description: "Gérez vos activités avec un CRM patrimonial",
    gradient: ["#1B998B", "#4ECDC4"],
    subscribed: true,
    action: { label: "Ouvrir", variant: "default" },
  },
  {
    name: "Fidnet",
    description: "Solution digitale de gestion de patrimoine en SaaS",
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
    <Card className="flex-1 justify-between gap-3 p-6">
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
        <div className="mt-auto flex justify-end">
          {app.action.variant === "default" ? (
            <Button
              size="sm"
              className="gap-1.5 bg-[#0052CC] text-white shadow-md shadow-[#0052CC]/30 transition-all hover:bg-[#0052CC]/90 hover:shadow-lg hover:shadow-[#0052CC]/40"
            >
              <ExternalLink className="size-3.5" />
              {app.action.label}
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="size-3.5" />
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
    <Card className="relative gap-2 p-6">
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
  return (
    <AppLayout title="Applications">
          {/* Harvest's essential */}
          <section className="mb-10">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
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
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Disponibles sur demande
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {requestApps.map((app) => (
                <RequestCard key={app.name} app={app} />
              ))}
            </div>
          </section>
    </AppLayout>
  );
}
