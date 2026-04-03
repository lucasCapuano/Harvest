"use client";

import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { cn } from "@/lib/utils";
import { useClients } from "@/lib/clients-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoading } from "@/hooks/use-loading";
import AdvisorCopilot from "@/components/AdvisorCopilot";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label as FormLabel } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Label, Line, LineChart, Pie, PieChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, PolarRadiusAxis, RadialBar, RadialBarChart, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  User,
  Phone,
  Mail,
  Home,
  Landmark,
  Wallet,
  CreditCard,
  Banknote,
  Receipt,
  Users,
  Baby,
  Building2,
  PiggyBank,
  Shield,
  Briefcase,
  Ellipsis,
  Heart,
  Scale,
  ChevronRight,
  Eye,
  MessageSquareText,
  Search,
  BarChart3,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Check,
  Video,
  ListChecks,
  Plus,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

/* ── Derive Synthèse data from client formData ───────────── */

function fmt(n: number) {
  if (Math.abs(n) >= 1_000_000) {
    const m = n / 1_000_000;
    const rounded = Math.round(m * 10) / 10;
    return rounded.toLocaleString("fr-FR") + "m €";
  }
  return n.toLocaleString("fr-FR") + " €";
}

function sumField(items: { [key: string]: string | undefined }[], field: string): number {
  return items.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
}

function deriveClientData(formData: import("@/lib/clients-store").FormState) {
  const fd = formData;

  // ── Personal info ──
  const situation = fd.compositionFamiliale.situationFamiliale || "Célibataire";
  const hasPartner = ["Marié(e)", "Pacsé(e)", "Concubinage"].includes(situation);
  const csp = fd.situationPersonnelle.professionCSP;
  const profession = fd.situationPersonnelle.professionLibelle;

  // Régime matrimonial
  const regimesMap: Record<string, string[]> = {
    "Marié(e)": ["Communauté réduite aux acquêts", "Séparation de biens", "Communauté universelle", "Participation aux acquêts"],
    "Pacsé(e)": ["Séparation de biens", "Indivision"],
  };
  const regimeMatrimonial = regimesMap[situation] ? regimesMap[situation][0] : null;

  // Partner info
  const partnerCsp = hasPartner ? fd.compositionFamiliale.partenaire.professionCSP : null;
  const partnerDob = fd.compositionFamiliale.partenaire.dateNaissance;
  const partnerAge = hasPartner && partnerDob
    ? new Date().getFullYear() - new Date(partnerDob).getFullYear()
    : null;

  // Children
  const nbEnfants = fd.enfants.length;
  const enfantsAges = fd.enfants
    .map((e) => {
      if (!e.dateNaissance) return 0;
      return new Date().getFullYear() - new Date(e.dateNaissance).getFullYear();
    })
    .sort((a, b) => b - a);
  const enfantsNoms = fd.enfants.map((e) => e.prenom || "—");

  // ── Actifs ──
  const biensUsage = sumField(fd.actifsImmobilier.biensUsage, "valeur");
  const immobilierRapport = sumField(fd.actifsImmobilier.immobilierRapport, "valeur");
  const immobilierDefisc = sumField(fd.actifsImmobilier.immobilierDefiscalisant, "valeur");
  const totalImmobilier = biensUsage + immobilierRapport + immobilierDefisc;

  const disponibilites = sumField(fd.actifsEpargne.disponibilites, "valeur");
  const assuranceVie = sumField(fd.actifsEpargne.assuranceVie, "valeur");
  const epargneRetraite = sumField(fd.actifsEpargne.epargneRetraite, "valeur");
  const defiscalisation = sumField(fd.actifsEpargne.produitsDefiscalisation, "valeur");
  const totalEpargne = disponibilites + assuranceVie + epargneRetraite + defiscalisation;

  const biensPro = sumField(fd.actifsProfessionnels.biensProfessionnels, "valeur") +
    sumField(fd.actifsProfessionnels.placementsFonciers, "valeur");
  const totalActifs = totalImmobilier + totalEpargne + biensPro;

  // ── Passifs ──
  const pretImmo = sumField(fd.passifs.pretImmobilier, "montant");
  const pretPro = sumField(fd.passifs.pretProfessionnel, "montant");
  const autresPrets = sumField(fd.passifs.autresPrets, "montant");
  const totalPassifs = pretImmo + pretPro + autresPrets;

  // ── Revenus ──
  const revActivites = sumField(fd.revenus.revenusActivites, "montant");
  const pensions = sumField(fd.revenus.pensionsRetraites, "montant");
  const revMobiliers = sumField(fd.revenus.revenusMobiliers, "montant");
  const revImmobiliers = sumField(fd.revenus.revenusImmobiliers, "montant");
  const autresRevenus = sumField(fd.revenus.autresRevenus, "montant");
  const totalRevenus = revActivites + pensions + revMobiliers + revImmobiliers + autresRevenus;

  // ── Charges ──
  const chargesGen = sumField(fd.charges.chargesGenerales, "montant");
  const chargesDeduct = sumField(fd.charges.chargesDeductibles, "montant");
  const totalCharges = chargesGen + chargesDeduct;

  return {
    situation, hasPartner, nbEnfants, csp, profession,
    regimeMatrimonial, partnerCsp, partnerAge, enfantsAges, enfantsNoms,
    actifs: {
      immobilier: { biensUsage, immobilierRapport, immobilierDefisc, total: totalImmobilier },
      epargne: { disponibilites, assuranceVie, epargneRetraite, defiscalisation, total: totalEpargne },
      professionnel: biensPro,
      total: totalActifs,
    },
    passifs: { pretImmo, pretPro, autresPrets, total: totalPassifs },
    revenus: { revActivites, pensions, revMobiliers, revImmobiliers, autresRevenus, total: totalRevenus },
    charges: { chargesGen, chargesDeduct, total: totalCharges },
    patrimoine: totalActifs - totalPassifs,
  };
}

/* ── Waterfall chart for Revenus & Charges ───────────────── */
const waterfallChartConfig = {
  visible: { label: "Montant" },
  invisible: { label: "" },
} satisfies ChartConfig;

function RevenusWaterfallChart({ data }: { data: ReturnType<typeof deriveClientData> }) {
  const chartData = useMemo(() => {
    // Build waterfall: revenues stack up, charges subtract
    let running = 0;

    const items: { name: string; invisible: number; visible: number; isTotal: boolean; isNegative: boolean }[] = [];

    // Revenue items
    const revItems: [string, number][] = [
      ["Activités", data.revenus.revActivites],
      ...(data.revenus.pensions > 0 ? [["Pensions", data.revenus.pensions] as [string, number]] : []),
      ...(data.revenus.revMobiliers > 0 ? [["Rev. mobiliers", data.revenus.revMobiliers] as [string, number]] : []),
      ...(data.revenus.revImmobiliers > 0 ? [["Rev. immobiliers", data.revenus.revImmobiliers] as [string, number]] : []),
      ...(data.revenus.autresRevenus > 0 ? [["Autres rev.", data.revenus.autresRevenus] as [string, number]] : []),
    ];

    for (const [name, value] of revItems) {
      items.push({ name, invisible: running, visible: value, isTotal: false, isNegative: false });
      running += value;
    }

    // Charge items (negative)
    items.push({ name: "Charges gén.", invisible: running - data.charges.chargesGen, visible: data.charges.chargesGen, isTotal: false, isNegative: true });
    running -= data.charges.chargesGen;

    if (data.charges.chargesDeduct > 0) {
      items.push({ name: "Ch. déductibles", invisible: running - data.charges.chargesDeduct, visible: data.charges.chargesDeduct, isTotal: false, isNegative: true });
      running -= data.charges.chargesDeduct;
    }

    // Net total
    items.push({ name: "Dispo. net", invisible: 0, visible: running, isTotal: true, isNegative: running < 0 });

    return items;
  }, [data]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Receipt className="size-4" />
          Revenus & Charges
        </CardTitle>
        <CardDescription className="text-xs">Disponible net : {fmt(data.revenus.total - data.charges.total)}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pb-2">
        <ChartContainer config={waterfallChartConfig} className="h-[170px] w-full">
          <BarChart
            data={chartData}
            margin={{ left: 0, right: 12, top: 8, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value, name, item) => {
                    const d = item.payload;
                    const sign = d.isNegative ? "- " : "";
                    return sign + fmt(d.visible);
                  }}
                />
              }
            />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Bar dataKey="invisible" stackId="waterfall" fill="transparent" radius={0} />
            <Bar dataKey="visible" stackId="waterfall" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={
                    entry.isNegative
                      ? "lab(55.4814 75.0732 48.8528)"
                      : "oklch(0.723 0.219 149.579)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
          <div className="mt-auto flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: "oklch(0.723 0.219 149.579)" }} />
              <span className="text-muted-foreground">Revenus</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: "lab(55.4814 75.0732 48.8528)" }} />
              <span className="text-muted-foreground">Charges</span>
            </span>
          </div>
      </CardContent>
    </Card>
  );
}

/* ── Multiple line chart for Actifs/Passifs evolution ──── */
const evolutionChartConfig = {
  actifs: { label: "Total Actifs", color: "var(--chart-1)" },
  passifs: { label: "Total Passifs", color: "var(--muted-foreground)" },
} satisfies ChartConfig;

function chartSeededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function EvolutionLineChart({ data }: { data: ReturnType<typeof deriveClientData> }) {
  const chartData = useMemo(() => {
    const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
    const baseActifs = data.actifs.total;
    const basePassifs = data.passifs.total;
    const r = chartSeededRandom(baseActifs + basePassifs);
    return months.map((month, i) => {
      const factor = 0.80 + (i / 11) * 0.20;
      const jitterA = 1 + (r() - 0.5) * 0.06;
      const jitterP = 1 + (r() - 0.5) * 0.04;
      return {
        month,
        actifs: Math.round(baseActifs * factor * jitterA),
        passifs: Math.round(basePassifs * (1.15 - (i / 11) * 0.15) * jitterP),
      };
    });
  }, [data]);

  return (
    <Card className="flex flex-col w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="size-4" />
          Évolution Actifs / Passifs
        </CardTitle>
        <CardDescription className="text-xs">12 derniers mois</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={evolutionChartConfig} className="h-[200px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="actifs"
              type="monotone"
              stroke="var(--color-actifs)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="passifs"
              type="monotone"
              stroke="var(--color-passifs)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

/* ── Pie chart config ────────────────────────────────────── */
const patrimoineChartConfig = {
  value: { label: "Montant" },
  immobilier: { label: "Immobilier", color: "var(--chart-1)" },
  epargne: { label: "Épargne", color: "var(--chart-3)" },
  professionnel: { label: "Professionnel", color: "var(--chart-5)" },
} satisfies ChartConfig;

function PatrimoinePieChart({ data }: { data: ReturnType<typeof deriveClientData> }) {
  const chartData = useMemo(() => {
    const items = [
      { name: "immobilier", value: data.actifs.immobilier.total, fill: "var(--chart-1)" },
      { name: "epargne", value: data.actifs.epargne.total, fill: "var(--chart-3)" },
    ];
    if (data.actifs.professionnel > 0) {
      items.push({ name: "professionnel", value: data.actifs.professionnel, fill: "var(--chart-5)" });
    }
    return items;
  }, [data]);

  const totalPatrimoine = data.patrimoine;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Landmark className="size-4" />
          Répartition du patrimoine
        </CardTitle>
        <CardDescription className="text-xs">Patrimoine net : {fmt(totalPatrimoine)}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center pb-0">
        <ChartContainer
          config={patrimoineChartConfig}
          className="mx-auto aspect-square h-full max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {fmt(data.actifs.total)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs"
                        >
                          Total actifs
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 pb-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-chart-1" />
          Immobilier ({Math.round((data.actifs.immobilier.total / data.actifs.total) * 100)}%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-chart-3" />
          Épargne ({Math.round((data.actifs.epargne.total / data.actifs.total) * 100)}%)
        </span>
        {data.actifs.professionnel > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-chart-5" />
            Pro. ({Math.round((data.actifs.professionnel / data.actifs.total) * 100)}%)
          </span>
        )}
      </div>
    </Card>
  );
}

/* ── Wealth diagnostic scoring ───────────────────────────── */

function clamp(v: number) { return Math.max(0, Math.min(100, Math.round(v))); }

function ageFromDate(d: string | undefined): number | null {
  if (!d) return null;
  return new Date().getFullYear() - new Date(d).getFullYear();
}

interface DiagnosticInputs {
  hasPartner: boolean;
  childrenCount: number;
  dependentChildrenCount: number;
  totalAssets: number;
  totalDebt: number;
  netWorth: number;
  totalFinancialAssets: number;
  totalInsuranceAssets: number;
  totalRetirementAssets: number;
  totalDefiscalisationAssets: number;
  hasLifeInsurance: boolean;
  hasRetirementSavings: boolean;
  hasDefiscalisationProducts: boolean;
  hasRentalProperty: boolean;
  hasMainResidence: boolean;
  hasSecondaryResidence: boolean;
  hasLiquidity: boolean;
  totalActivityIncome: number;
  totalPropertyIncome: number;
  totalFinancialIncome: number;
  totalIncome: number;
  totalCharges: number;
}

function buildInputs(form: import("@/lib/clients-store").FormState): DiagnosticInputs {
  const fd = form;
  const situation = fd.compositionFamiliale.situationFamiliale || "";
  const hasPartner = ["Marié(e)", "Pacsé(e)", "Concubinage"].includes(situation);

  const sf = sumField;
  const totalImmobilier = sf(fd.actifsImmobilier.biensUsage, "valeur") +
    sf(fd.actifsImmobilier.immobilierRapport, "valeur") +
    sf(fd.actifsImmobilier.immobilierDefiscalisant, "valeur");
  const disponibilites = sf(fd.actifsEpargne.disponibilites, "valeur");
  const assuranceVie = sf(fd.actifsEpargne.assuranceVie, "valeur");
  const epargneRetraite = sf(fd.actifsEpargne.epargneRetraite, "valeur");
  const defiscalisation = sf(fd.actifsEpargne.produitsDefiscalisation, "valeur");
  const totalEpargne = disponibilites + assuranceVie + epargneRetraite + defiscalisation;
  const biensPro = sf(fd.actifsProfessionnels.biensProfessionnels, "valeur") +
    sf(fd.actifsProfessionnels.placementsFonciers, "valeur");
  const totalAssets = totalImmobilier + totalEpargne + biensPro;

  const totalDebt = sf(fd.passifs.pretImmobilier, "montant") +
    sf(fd.passifs.pretProfessionnel, "montant") +
    sf(fd.passifs.autresPrets, "montant");

  const totalActivityIncome = sf(fd.revenus.revenusActivites, "montant") +
    sf(fd.revenus.pensionsRetraites, "montant");
  const totalPropertyIncome = sf(fd.revenus.revenusImmobiliers, "montant");
  const totalFinancialIncome = sf(fd.revenus.revenusMobiliers, "montant");
  const autresRev = sf(fd.revenus.autresRevenus, "montant");
  const totalIncome = totalActivityIncome + totalPropertyIncome + totalFinancialIncome + autresRev;
  const totalCharges = sf(fd.charges.chargesGenerales, "montant") +
    sf(fd.charges.chargesDeductibles, "montant");

  return {
    hasPartner,
    childrenCount: fd.enfants.length,
    dependentChildrenCount: fd.enfants.filter((e) => e.aCharge).length,
    totalAssets,
    totalDebt,
    netWorth: totalAssets - totalDebt,
    totalFinancialAssets: totalEpargne,
    totalInsuranceAssets: assuranceVie,
    totalRetirementAssets: epargneRetraite,
    totalDefiscalisationAssets: defiscalisation,
    hasLifeInsurance: fd.actifsEpargne.assuranceVie.length > 0,
    hasRetirementSavings: fd.actifsEpargne.epargneRetraite.length > 0,
    hasDefiscalisationProducts: fd.actifsEpargne.produitsDefiscalisation.length > 0,
    hasRentalProperty: fd.actifsImmobilier.immobilierRapport.length > 0,
    hasMainResidence: fd.actifsImmobilier.biensUsage.length > 0,
    hasSecondaryResidence: fd.actifsImmobilier.biensUsage.length > 1,
    hasLiquidity: disponibilites > 0,
    totalActivityIncome,
    totalPropertyIncome,
    totalFinancialIncome,
    totalIncome,
    totalCharges,
  };
}

function scoreComposition(form: import("@/lib/clients-store").FormState): number {
  let score = 0;
  const sp = form.situationPersonnelle;
  const cf = form.compositionFamiliale;
  const partner = cf.partenaire;
  const children = form.enfants;

  if (sp.civilite && sp.nom && sp.prenom && sp.dateNaissance) score += 20;
  if (sp.professionCSP || sp.professionLibelle) score += 10;
  if (sp.telephone && sp.email) score += 10;
  if (cf.situationFamiliale) score += 15;

  const partnerCore = partner.civilite && partner.nom && partner.prenom && partner.dateNaissance;
  if (partnerCore) score += 20;
  if (partner.professionCSP || partner.professionLibelle) score += 10;

  if (children.length > 0) {
    score += 10;
    const completeChildren = children.filter(
      (c) => c.prenom && c.dateNaissance && typeof c.aCharge === "boolean"
    ).length;
    score += Math.min(15, completeChildren * 7.5);
  }
  return clamp(score);
}

function scoreRevenus(inputs: DiagnosticInputs): number {
  const { totalIncome, totalCharges, totalActivityIncome, totalPropertyIncome, totalFinancialIncome } = inputs;
  if (totalIncome <= 0) return 0;

  const chargeRate = totalCharges / totalIncome;
  const savingsCapacity = totalIncome - totalCharges;

  let diversificationScore = 0;
  if (totalActivityIncome > 0) diversificationScore += 20;
  if (totalPropertyIncome > 0) diversificationScore += 15;
  if (totalFinancialIncome > 0) diversificationScore += 10;

  let volumeScore = 0;
  if (totalIncome >= 120000) volumeScore = 30;
  else if (totalIncome >= 80000) volumeScore = 24;
  else if (totalIncome >= 50000) volumeScore = 18;
  else if (totalIncome >= 30000) volumeScore = 12;
  else volumeScore = 6;

  let balanceScore = 0;
  if (chargeRate <= 0.30) balanceScore = 25;
  else if (chargeRate <= 0.45) balanceScore = 20;
  else if (chargeRate <= 0.60) balanceScore = 12;
  else balanceScore = 5;

  let capacityScore = 0;
  if (savingsCapacity >= 50000) capacityScore = 15;
  else if (savingsCapacity >= 25000) capacityScore = 12;
  else if (savingsCapacity >= 10000) capacityScore = 8;
  else if (savingsCapacity > 0) capacityScore = 4;

  return clamp(diversificationScore + volumeScore + balanceScore + capacityScore);
}

function scoreFiscalite(inputs: DiagnosticInputs): number {
  let score = 0;
  if (inputs.hasLifeInsurance) score += 20;
  if (inputs.hasRetirementSavings) score += 20;
  if (inputs.hasDefiscalisationProducts) score += 15;
  if (inputs.totalFinancialAssets >= 100000) score += 10;
  if (inputs.hasRentalProperty) score += 10;
  if (inputs.totalPropertyIncome > 0) score += 10;
  if (inputs.totalActivityIncome >= 80000) score += 10;
  if (inputs.totalDefiscalisationAssets >= 5000) score += 5;
  return clamp(score);
}

function scoreRetraite(form: import("@/lib/clients-store").FormState, inputs: DiagnosticInputs): number {
  const age = ageFromDate(form.situationPersonnelle.dateNaissance) ?? 0;
  let score = 0;
  if (inputs.hasRetirementSavings) score += 30;
  if (inputs.hasLifeInsurance) score += 20;
  if (inputs.hasRentalProperty) score += 15;
  if (inputs.totalRetirementAssets >= 50000) score += 10;
  if (inputs.totalInsuranceAssets >= 100000) score += 10;
  if (inputs.netWorth >= 500000) score += 10;
  if (age >= 50) score += 5;
  return clamp(score);
}

function scoreTransmission(form: import("@/lib/clients-store").FormState, inputs: DiagnosticInputs): number {
  let score = 0;
  if (inputs.hasPartner) score += 20;
  if (inputs.childrenCount > 0) score += 20;
  if (inputs.totalAssets >= 300000) score += 15;
  if (inputs.totalAssets >= 700000) score += 10;
  if (inputs.hasLifeInsurance) score += 20;
  if (inputs.hasMainResidence) score += 5;
  if (inputs.hasSecondaryResidence || inputs.hasRentalProperty) score += 5;
  if (inputs.totalFinancialAssets >= 100000) score += 5;
  return clamp(score);
}

function scorePrevoyance(inputs: DiagnosticInputs): number {
  let score = 0;
  if (inputs.hasPartner) score += 10;
  if (inputs.dependentChildrenCount >= 1) score += 15;
  if (inputs.dependentChildrenCount >= 2) score += 10;
  if (inputs.totalDebt > 0) score += 10;
  if (inputs.totalDebt >= 200000) score += 10;
  if (inputs.hasLifeInsurance) score += 15;
  if (inputs.totalInsuranceAssets >= 100000) score += 15;
  if (inputs.hasLiquidity) score += 5;
  return clamp(score);
}

function buildWealthDiagnostic(form: import("@/lib/clients-store").FormState) {
  const inputs = buildInputs(form);

  const maturity = {
    Prévoyance: scorePrevoyance(inputs),
    Transmission: scoreTransmission(form, inputs),
    Fiscalité: scoreFiscalite(inputs),
    Composition: scoreComposition(form),
    Revenus: scoreRevenus(inputs),
    Retraite: scoreRetraite(form, inputs),
  };

  const globalScore = Math.round(
    Object.values(maturity).reduce((a, b) => a + b, 0) / Object.values(maturity).length
  );

  return { maturity, globalScore };
}

/* ── Category analysis items builder ─────────────────────── */

interface AnalysisItem {
  title: string;
  priority: "haute" | "moyenne" | "basse";
  status: "À revoir" | "Alerte" | "Opportunité" | "Conforme" | "Insuffisant" | "Sans couvert";
  metric: string;
  metricLabel: string;
  description: string;
  cta: string;
}

interface CategoryAnalysis {
  category: string;
  score: number;
  items: AnalysisItem[];
}

function statusStyle(s: AnalysisItem["status"]) {
  switch (s) {
    case "À revoir": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    case "Alerte": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "Opportunité": return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";
    case "Conforme": return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
    case "Insuffisant": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    case "Sans couvert": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
  }
}

function priorityStyle(p: AnalysisItem["priority"]) {
  switch (p) {
    case "haute": return "border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20";
    case "moyenne": return "border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20";
    case "basse": return "border border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/20";
  }
}

function priorityBadge(p: AnalysisItem["priority"]) {
  switch (p) {
    case "haute": return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
    case "moyenne": return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400";
    case "basse": return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
  }
}

function buildCategoryAnalysis(
  form: import("@/lib/clients-store").FormState,
  data: ReturnType<typeof deriveClientData>,
  diagnostic: { maturity: Record<string, number>; globalScore: number }
): CategoryAnalysis[] {
  const inputs = buildInputs(form);
  const categories: CategoryAnalysis[] = [];

  // Transmission
  {
    const items: AnalysisItem[] = [];
    if (inputs.hasLifeInsurance) {
      items.push({
        title: "Clause bénéficiaire",
        priority: inputs.totalInsuranceAssets < 100000 ? "haute" : "moyenne",
        status: inputs.totalInsuranceAssets < 100000 ? "À revoir" : "Conforme",
        metric: fmt(inputs.totalInsuranceAssets),
        metricLabel: "Encours assurance-vie",
        description: inputs.totalInsuranceAssets < 100000
          ? "Vos contrats d'assurance-vie nécessitent une révision des clauses bénéficiaires."
          : "Vos clauses bénéficiaires sont cohérentes avec votre situation familiale.",
        cta: "Optimiser la transmission",
      });
    } else {
      items.push({
        title: "Assurance-vie",
        priority: "haute",
        status: "À revoir",
        metric: "0 €",
        metricLabel: "Aucun contrat",
        description: "Aucune assurance-vie détectée. Cet outil est essentiel pour optimiser la transmission.",
        cta: "Ouvrir une assurance-vie",
      });
    }
    if (inputs.childrenCount > 0) {
      items.push({
        title: "Donation anticipée",
        priority: "moyenne",
        status: inputs.netWorth > 300000 ? "Opportunité" : "Conforme",
        metric: fmt(inputs.netWorth),
        metricLabel: "Patrimoine net transmissible",
        description: inputs.netWorth > 300000
          ? "Les abattements fiscaux sont disponibles. Une donation peut réduire les droits de succession."
          : "Votre patrimoine est en deçà des seuils d'optimisation fiscale.",
        cta: "Étudier les donations",
      });
    }
    categories.push({ category: "Transmission", score: diagnostic.maturity["Transmission"] ?? 0, items });
  }

  // Fiscalité
  {
    const tmi = inputs.totalIncome > 0 ? Math.round((inputs.totalCharges / inputs.totalIncome) * 100) : 0;
    const items: AnalysisItem[] = [{
      title: "Pression fiscale",
      priority: !inputs.hasDefiscalisationProducts ? "haute" : "moyenne",
      status: !inputs.hasDefiscalisationProducts ? "Alerte" : "Conforme",
      metric: fmt(inputs.totalCharges) + "/an",
      metricLabel: "Charges fiscales estimées",
      description: !inputs.hasDefiscalisationProducts
        ? `Votre taux marginal d'imposition est de ${tmi} %. Des dispositifs de réduction existent.`
        : "Vous disposez déjà de produits de défiscalisation en portefeuille.",
      cta: "Explorer les leviers fiscaux",
    }];
    categories.push({ category: "Fiscalité", score: diagnostic.maturity["Fiscalité"] ?? 0, items });
  }

  // Composition
  {
    const items: AnalysisItem[] = [];
    const immoRate = inputs.totalAssets > 0 ? Math.round((data.actifs.immobilier.total / inputs.totalAssets) * 100) : 0;
    items.push({
      title: "Diversification",
      priority: immoRate > 70 ? "haute" : "basse",
      status: immoRate > 70 ? "À revoir" : "Conforme",
      metric: `-${immoRate} %`,
      metricLabel: "Exposition immobilière à réduire",
      description: immoRate > 70
        ? `Plus de ${immoRate} % de votre patrimoine est concentré en immobilier, exposant à un risque de liquidité.`
        : "Votre patrimoine est correctement diversifié entre les différentes classes d'actifs.",
      cta: "Rééquilibrer l'allocation",
    });
    const monthsCovered = inputs.totalCharges > 0 ? Math.round((data.actifs.epargne.disponibilites / (inputs.totalCharges / 12))) : 0;
    items.push({
      title: "Épargne disponible",
      priority: monthsCovered < 3 ? "moyenne" : "basse",
      status: monthsCovered < 3 ? "Alerte" : "Conforme",
      metric: fmt(data.actifs.epargne.disponibilites),
      metricLabel: "Épargne de précaution",
      description: monthsCovered < 3
        ? `Votre épargne de précaution couvre ${monthsCovered} mois de charges, un niveau faible.`
        : `Votre épargne de précaution couvre ${monthsCovered} mois de charges, un niveau sain.`,
      cta: "Voir le détail",
    });
    categories.push({ category: "Composition", score: diagnostic.maturity["Composition"] ?? 0, items });
  }

  // Revenus
  {
    const savingsRate = inputs.totalIncome > 0 ? Math.round(((inputs.totalIncome - inputs.totalCharges) / inputs.totalIncome) * 100) : 0;
    const items: AnalysisItem[] = [{
      title: "Taux d'épargne",
      priority: savingsRate < 10 ? "haute" : "basse",
      status: savingsRate < 10 ? "Alerte" : "Conforme",
      metric: fmt(Math.round((inputs.totalIncome - inputs.totalCharges) / 12)) + "/mois",
      metricLabel: "Capacité d'investissement",
      description: `Votre capacité d'épargne mensuelle représente ${savingsRate} % de vos revenus nets${savingsRate >= 15 ? ", un bon ratio." : ", à optimiser."}`,
      cta: "Optimiser le placement",
    }];
    categories.push({ category: "Revenus", score: diagnostic.maturity["Revenus"] ?? 0, items });
  }

  // Retraite
  {
    const age = ageFromDate(form.situationPersonnelle.dateNaissance) ?? 0;
    const retirementGap = Math.max(0, Math.round(inputs.totalActivityIncome * 0.55 / 12));
    const items: AnalysisItem[] = [{
      title: "Gap retraite",
      priority: !inputs.hasRetirementSavings ? "haute" : "moyenne",
      status: !inputs.hasRetirementSavings ? "Insuffisant" : "Opportunité",
      metric: fmt(retirementGap) + "/mois",
      metricLabel: "Revenus manquants estimés",
      description: !inputs.hasRetirementSavings
        ? "Une baisse de revenus de 45 % est estimée au départ en retraite sans complément."
        : `Votre épargne retraite de ${fmt(inputs.totalRetirementAssets)} complétera partiellement vos revenus.`,
      cta: "Simuler la retraite",
    }];
    categories.push({ category: "Retraite", score: diagnostic.maturity["Retraite"] ?? 0, items });
  }

  // Prévoyance
  {
    const capitalNeeded = inputs.totalActivityIncome * 5;
    const items: AnalysisItem[] = [{
      title: "Couverture décès",
      priority: inputs.totalInsuranceAssets < capitalNeeded ? "haute" : "basse",
      status: inputs.totalInsuranceAssets < capitalNeeded ? "Sans couvert" : "Conforme",
      metric: fmt(Math.max(0, capitalNeeded - inputs.totalInsuranceAssets)),
      metricLabel: "Capital manquant",
      description: inputs.totalInsuranceAssets < capitalNeeded
        ? `En cas de décès, le capital garanti ne couvrirait que ${Math.round(inputs.totalInsuranceAssets / (inputs.totalCharges / 12))} mois de charges familiales.`
        : "Le capital décès couvre les besoins de votre famille sur une durée satisfaisante.",
      cta: "Renforcer la prévoyance",
    }];
    categories.push({ category: "Prévoyance", score: diagnostic.maturity["Prévoyance"] ?? 0, items });
  }

  return categories;
}

function scoreColor(v: number) {
  if (v >= 70) return "bg-green-500";
  if (v >= 50) return "bg-amber-400";
  return "bg-red-400";
}

function scoreBg(v: number) {
  if (v >= 70) return "bg-green-500/20";
  if (v >= 50) return "bg-amber-400/20";
  return "bg-red-400/20";
}

/* ── Tag color mapping ───────────────────────────────────── */
const tagColors: Record<string, string> = {
  Transmission: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Fiscalité: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400",
  Composition: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  Revenus: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Retraite: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Prévoyance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
};

/* ── Remarques data ──────────────────────────────────────── */
interface Remarque {
  title: string;
  description: string;
  done: boolean;
  assignee: string;
}

function buildRemarques(cats: CategoryAnalysis[]): Remarque[] {
  return cats.flatMap((cat) =>
    cat.items.map((item, i) => ({
      title: `${cat.category} — ${item.title}`,
      description: item.description,
      done: item.status === "Conforme",
      assignee: "Conseiller",
    }))
  );
}

/* ── DiagnostiqueContent component ───────────────────────── */
function DiagnostiqueContent({ categoryAnalysis }: { categoryAnalysis: CategoryAnalysis[] }) {
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const globalScore = Math.round(categoryAnalysis.reduce((s, c) => s + c.score, 0) / categoryAnalysis.length);
  const criticalItems = categoryAnalysis.flatMap((c) => c.items.filter((i) => i.priority === "haute").map((i) => ({ ...i, category: c.category })));
  const opportunityItems = categoryAnalysis.flatMap((c) => c.items.filter((i) => i.status === "Opportunité").map((i) => ({ ...i, category: c.category })));

  const globalStatus = globalScore >= 70 ? "Sain" : globalScore >= 50 ? "À surveiller" : "Critique";
  const globalStatusColor = globalScore >= 70 ? "text-green-500" : globalScore >= 50 ? "text-amber-500" : "text-red-500";
  const globalStatusBg = globalScore >= 70 ? "bg-green-500/10 border-green-500/20" : globalScore >= 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

  const insights = [
    { label: "Concentration immobilière élevée", description: "Le patrimoine est surexposé à l'immobilier, réduisant la liquidité globale.", severity: "attention" as const },
    { label: "Liquidité solide mais sous-exploitée", description: "L'épargne disponible pourrait être mieux orientée vers des supports performants.", severity: "opportunité" as const },
    { label: "Endettement acceptable", description: "Le ratio d'endettement reste dans les normes mais réduit la flexibilité d'investissement.", severity: "neutre" as const },
    { label: "Préparation retraite en retard", description: "L'effort d'épargne retraite est insuffisant par rapport à l'objectif de maintien du niveau de vie.", severity: "attention" as const },
    { label: "Enveloppes fiscales sous-utilisées", description: "Les plafonds PER et les abattements de donation ne sont pas pleinement exploités.", severity: "opportunité" as const },
  ];

  const insightColor = (s: "attention" | "opportunité" | "neutre") => {
    switch (s) {
      case "attention": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "opportunité": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "neutre": return "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
    }
  };

  return (
    <div className="space-y-12">
      {/* ── Top summary banner ── */}
      <Card className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Vue d&apos;ensemble</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Évaluation globale de la situation patrimoniale du client. Dernière mise à jour : 01/04/2026.
            </p>
          </div>
          <div className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${globalStatusBg}`}>
            <span className={`text-2xl font-bold ${globalStatusColor}`}>{globalScore}</span>
            <div>
              <p className={`text-sm font-semibold ${globalStatusColor}`}>{globalStatus}</p>
              <p className="text-[10px] text-muted-foreground">/ 100</p>
            </div>
          </div>
        </div>

        {/* Score bars per category */}
        <div className="grid grid-cols-6 gap-4">
          {categoryAnalysis.map((cat) => (
            <div key={cat.category}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground">{cat.category}</span>
                <span className="text-xs font-bold text-foreground">{cat.score}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all ${cat.score >= 70 ? "bg-green-500" : cat.score >= 50 ? "bg-amber-400" : "bg-red-400"}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Diagnostic cards grid ── */}
      <div>
        <h4 className="text-base font-semibold text-foreground">Constats par domaine</h4>
        <p className="text-sm text-muted-foreground mb-6">Choisissez les constats à intégrer au rapport afin de structurer la restitution du diagnostic.</p>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setActiveCat(null)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              activeCat === null ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            Tout
          </button>
          {categoryAnalysis.map((cat) => (
            <button
              key={cat.category}
              onClick={() => setActiveCat(cat.category)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                activeCat === cat.category ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.category}
              <span className="ml-1.5 text-[10px] opacity-60">{cat.items.length}</span>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3" style={{ gap: "16px" }}>
          {categoryAnalysis
            .filter((cat) => !activeCat || cat.category === activeCat)
            .flatMap((cat) =>
            cat.items.map((item) => (
              <Card key={item.title} className="p-4 gap-0">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCheckedItems((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.title)) next.delete(item.title);
                        else next.add(item.title);
                        return next;
                      });
                    }}
                    className={cn(
                      "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      checkedItems.has(item.title)
                        ? "border-[#0052CC] bg-[#0052CC] text-white"
                        : "border-muted-foreground/30 hover:border-muted-foreground/60"
                    )}
                  >
                    {checkedItems.has(item.title) && <Check className="size-3" />}
                  </button>
                  <div>
                    <h5 className="text-sm font-semibold text-foreground mb-1.5">{item.title}</h5>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const objectifsData = [
  {
    title: "Organiser la transmission du patrimoine",
    description:
      "L\u2019absence de clause bénéficiaire personnalisée et les abattements de donation disponibles révèlent un potentiel d\u2019optimisation successorale important.",
    questions: [
      { text: "À qui souhaitez-vous transmettre votre patrimoine en priorité ?", hint: "Identifier les bénéficiaires permet de calibrer les abattements et d\u2019optimiser la clause bénéficiaire." },
      { text: "Avez-vous déjà réalisé des donations à vos enfants ou à d\u2019autres proches ?", hint: "Les donations antérieures impactent les abattements restants (renouvellement tous les 15 ans)." },
      { text: "Y a-t-il des biens spécifiques que vous souhaitez attribuer à une personne en particulier ?", hint: "Les legs spécifiques nécessitent un traitement testamentaire adapté et peuvent modifier la répartition fiscale." },
      { text: "Êtes-vous marié sous quel régime matrimonial ?", hint: "Le régime matrimonial détermine la masse successorale et les droits du conjoint survivant." },
    ],
  },
  {
    title: "Réduire la pression fiscale",
    description:
      "Avec un TMI à 41%, plusieurs leviers de défiscalisation sont activables pour réduire significativement l\u2019impôt sur le revenu.",
    questions: [
      { text: "Utilisez-vous actuellement des dispositifs de défiscalisation ?", hint: "Pinel, FCPI, FIP, Girardin… chaque dispositif a ses plafonds et conditions spécifiques." },
      { text: "Avez-vous optimisé vos versements sur un PER ?", hint: "Les versements PER sont déductibles du revenu imposable dans la limite du plafond disponible." },
      { text: "Connaissez-vous votre taux marginal d\u2019imposition actuel ?", hint: "Le TMI conditionne l\u2019efficacité des stratégies de défiscalisation envisageables." },
      { text: "Avez-vous envisagé un investissement en immobilier locatif avec avantage fiscal ?", hint: "L\u2019immobilier locatif offre des réductions d\u2019impôt mais implique un engagement de durée." },
    ],
  },
  {
    title: "Rééquilibrer l\u2019allocation patrimoniale",
    description:
      "La surexposition immobilière (70%) crée un risque de liquidité. Une diversification vers des actifs financiers améliorerait la résilience du patrimoine.",
    questions: [
      { text: "Quelle part de votre patrimoine est investie en immobilier aujourd\u2019hui ?", hint: "Une concentration supérieure à 60% expose à un risque de liquidité en cas de besoin urgent." },
      { text: "Disposez-vous d\u2019une épargne de précaution suffisante ?", hint: "L\u2019épargne de précaution recommandée couvre 3 à 6 mois de charges courantes." },
      { text: "Seriez-vous ouvert à diversifier vers des placements financiers ?", hint: "Assurance-vie, PEA et comptes-titres offrent liquidité et diversification sectorielle." },
      { text: "Avez-vous des projets de cession immobilière à court ou moyen terme ?", hint: "Une cession planifiée peut libérer des liquidités pour rééquilibrer l\u2019allocation." },
    ],
  },
  {
    title: "Préparer la retraite et combler le gap de revenus",
    description:
      "La baisse estimée de 45% des revenus à la retraite nécessite une stratégie de capitalisation anticipée pour maintenir le niveau de vie.",
    questions: [
      { text: "Avez-vous estimé vos revenus prévisionnels à la retraite ?", hint: "Le relevé de situation individuelle (RIS) permet d\u2019évaluer les droits acquis." },
      { text: "Disposez-vous d\u2019un Plan Épargne Retraite (PER) ?", hint: "Le PER offre un avantage fiscal à l\u2019entrée et une sortie flexible en capital ou rente." },
      { text: "À quel âge envisagez-vous de partir à la retraite ?", hint: "L\u2019âge de départ impacte directement le montant de la pension et la durée de capitalisation." },
      { text: "Quel niveau de revenus mensuels souhaitez-vous maintenir ?", hint: "Définir un objectif de revenus permet de calibrer l\u2019effort d\u2019épargne nécessaire." },
    ],
  },
  {
    title: "Renforcer la couverture prévoyance",
    description:
      "Le capital décès actuel ne couvre que 2 ans de charges familiales, bien en deçà des 5 ans recommandés. Un complément est indispensable.",
    questions: [
      { text: "Connaissez-vous le montant de votre capital décès actuel ?", hint: "Cumulez les garanties professionnelles et personnelles pour évaluer la couverture totale." },
      { text: "Disposez-vous d\u2019une garantie incapacité/invalidité complémentaire ?", hint: "La couverture employeur seule est souvent insuffisante pour maintenir le niveau de vie." },
      { text: "Vos proches seraient-ils financièrement protégés en cas de décès ?", hint: "Le capital décès doit couvrir au minimum 3 à 5 ans de charges familiales." },
      { text: "Avez-vous revu vos contrats depuis votre dernier changement de situation ?", hint: "Mariage, naissance, achat immobilier… chaque événement nécessite une mise à jour." },
    ],
  },
];

function ObjectifsContent({ addOpen, setAddOpen }: { addOpen: boolean; setAddOpen: (v: boolean) => void }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [checkedQuestions, setCheckedQuestions] = useState<Set<string>>(new Set());
  const [customObjectives, setCustomObjectives] = useState<{ title: string; description: string }[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const allObjectives = [...objectifsData, ...customObjectives.map((o) => ({ ...o, questions: [] }))];

  const totalObjectives = allObjectives.length;
  const totalQuestions = objectifsData.reduce((sum, o) => sum + o.questions.length, 0);
  const completedQuestions = checkedQuestions.size;

  const isObjectiveComplete = (i: number) => {
    const obj = allObjectives[i];
    if (!obj.questions.length) return checkedQuestions.has(`custom-${i}`);
    return obj.questions.every((_, j) => checkedQuestions.has(`${i}-${j}`));
  };

  const completedObjectives = allObjectives.filter((_, i) => isObjectiveComplete(i)).length;
  const progressPercent = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  const toggleObjective = (i: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const obj = allObjectives[i];
    if (!obj.questions.length) {
      setCheckedQuestions((prev) => {
        const next = new Set(prev);
        const key = `custom-${i}`;
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
      });
      return;
    }
    const allChecked = isObjectiveComplete(i);
    setCheckedQuestions((prev) => {
      const next = new Set(prev);
      obj.questions.forEach((_, j) => {
        const key = `${i}-${j}`;
        if (allChecked) next.delete(key); else next.add(key);
      });
      return next;
    });
  };

  const toggleQuestion = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    setCustomObjectives((prev) => [...prev, { title: newTitle.trim(), description: newDesc.trim() }]);
    setNewTitle("");
    setNewDesc("");
    setAddOpen(false);
  };

  return (
    <TabsContent value="objectifs" className="mt-6 space-y-4">
      <div className="mb-6">
        <h3 className="text-[18px] font-semibold text-foreground">Objectifs du client</h3>
        <p className="text-sm text-muted-foreground">Vue d&apos;ensemble des priorités patrimoniales identifiées pour orienter la stratégie de recommandation. Choisissez les objectifs clients à intégrer au rapport.</p>
      </div>

      {/* Add objective dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un objectif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <FormLabel htmlFor="obj-title">Titre</FormLabel>
              <Input id="obj-title" placeholder="Ex : Optimiser la fiscalité des revenus" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <FormLabel htmlFor="obj-desc">Description</FormLabel>
              <Input id="obj-desc" placeholder="Décrivez l'objectif en quelques mots..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Annuler</Button>
            <Button className="bg-[#0052CC] text-white hover:bg-[#0052CC]/90" onClick={handleAdd} disabled={!newTitle.trim()}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {allObjectives.map((obj, i) => {
        const isOpen = openIndex === i;
        const objChecked = isObjectiveComplete(i);
        const hasQuestions = obj.questions.length > 0;
        const qCheckedCount = hasQuestions ? obj.questions.filter((_, j) => checkedQuestions.has(`${i}-${j}`)).length : 0;
        return (
          <Card
            key={i}
            className={cn("transition-colors hover:bg-muted/30", hasQuestions ? "cursor-pointer" : "")}
            onClick={() => hasQuestions && setOpenIndex(isOpen ? null : i)}
          >
            <div className="flex items-start gap-4 p-3">
              <button
                type="button"
                onClick={(e) => toggleObjective(i, e)}
                className={cn(
                  "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  objChecked
                    ? "border-[#0052CC] bg-[#0052CC] text-white"
                    : "border-muted-foreground/30 hover:border-muted-foreground/60"
                )}
              >
                {objChecked && <Check className="size-3" />}
              </button>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-foreground">{obj.title}</span>
                <p className="mt-1 text-sm text-muted-foreground">{obj.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {hasQuestions && <span className="text-xs text-muted-foreground">{qCheckedCount}/{obj.questions.length}</span>}
                {hasQuestions && (isOpen ? (
                  <ChevronUp className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ))}
              </div>
            </div>
            {isOpen && (
              <div className="border-t px-5 pb-5 pt-4" onClick={(e) => e.stopPropagation()}>
                <div className="mb-4 flex items-center gap-2">
                  <Search className="size-3.5 text-[#33ee87]" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Questions de découverte ({qCheckedCount}/{obj.questions.length})
                  </span>
                </div>
                <div className="space-y-0 divide-y rounded-lg border">
                  {obj.questions.map((q, j) => {
                    const qKey = `${i}-${j}`;
                    const qChecked = checkedQuestions.has(qKey);
                    return (
                      <div key={j} className="flex items-start gap-4 px-5 py-4">
                        <button
                          type="button"
                          onClick={(e) => toggleQuestion(qKey, e)}
                          className={cn(
                            "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            qChecked
                              ? "border-[#0052CC] bg-[#0052CC] text-white"
                              : "border-muted-foreground/20 hover:border-muted-foreground/50"
                          )}
                        >
                          {qChecked && <Check className="size-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{q.text}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <ArrowRight className="size-3 text-[#33ee87]" />
                            <span className="italic">{q.hint}</span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </TabsContent>
  );
}

interface Preconisation {
  id: number;
  title: string;
  description: string;
  priority: "Haute" | "Moyenne" | "Basse";
  status: "À valider" | "Recommandée" | "En cours";
  metric: string;
  metricLabel: string;
  details: string[];
}

interface PrecoGroup {
  objective: string;
  description: string;
  preconisations: Preconisation[];
}

const precoData: PrecoGroup[] = [
  {
    objective: "Organiser la transmission du patrimoine",
    description: "Optimiser la succession et anticiper les donations pour réduire la pression fiscale.",
    preconisations: [
      { id: 1, title: "Rédaction d'une clause bénéficiaire sur mesure", priority: "Haute", status: "À valider", description: "Personnaliser les clauses bénéficiaires des contrats d'assurance-vie pour adapter la transmission aux objectifs familiaux et optimiser la répartition successorale.", metric: "84 000 €", metricLabel: "Économie estimée", details: ["12 mois · Fiscalité successorale", "Contrats AV concernés : 3"] },
      { id: 2, title: "Donation en nue-propriété aux enfants", priority: "Haute", status: "Recommandée", description: "Utiliser le démembrement de propriété pour transmettre la nue-propriété du bien, en conservant l'usufruit et en bénéficiant des abattements.", metric: "100 000 €", metricLabel: "Abattement disponible", details: ["6 mois · Transmission anticipée"] },
      { id: 3, title: "Pacte Dutreil pour les actifs professionnels", priority: "Moyenne", status: "À valider", description: "Si le client détient des parts d'entreprise, le pacte Dutreil permet une exonération de 75% des droits de mutation.", metric: "75 %", metricLabel: "Exonération possible", details: ["24 mois · Engagement de conservation"] },
    ],
  },
  {
    objective: "Réduire la pression fiscale",
    description: "Activer les dispositifs de défiscalisation pour optimiser la charge fiscale annuelle.",
    preconisations: [
      { id: 4, title: "Versements PER avec rattrapage des plafonds", priority: "Haute", status: "Recommandée", description: "Maximiser les versements sur le Plan Épargne Retraite en utilisant les plafonds non consommés des 3 dernières années.", metric: "14 910 €", metricLabel: "Économie fiscale estimée", details: ["Immédiat · Plafond disponible : 42 600 €"] },
      { id: 5, title: "Investissement en déficit foncier", priority: "Moyenne", status: "À valider", description: "Acquisition d'un bien ancien avec travaux pour créer du déficit foncier imputable sur le revenu global.", metric: "10 700 €", metricLabel: "Réduction fiscale sur 5 ans", details: ["12 mois · Travaux éligibles"] },
      { id: 6, title: "Souscription au capital de PME (IR-PME)", priority: "Basse", status: "À valider", description: "Investir dans des PME éligibles pour bénéficier d'une réduction d'impôt de 25% du montant investi.", metric: "2 500 €", metricLabel: "Réduction IR estimée", details: ["6 mois · Blocage 5 ans minimum"] },
    ],
  },
  {
    objective: "Rééquilibrer l'allocation patrimoniale",
    description: "Diversifier le patrimoine et réduire la surexposition immobilière (70%) pour améliorer la liquidité.",
    preconisations: [
      { id: 7, title: "Ouverture d'un contrat d'assurance-vie multisupport", priority: "Haute", status: "Recommandée", description: "Placer l'épargne disponible sur un contrat multisupport diversifié avec une allocation équilibrée entre fonds euros et UC.", metric: "50 000 €", metricLabel: "Versement initial recommandé", details: ["Immédiat · Profil équilibré"] },
      { id: 8, title: "Arbitrage vers un PEA pour les productions", priority: "Moyenne", status: "À valider", description: "Ouvrir un PEA pour bénéficier de l'exonération fiscale après 5 ans sur les plus-values et dividendes européens.", metric: "20 000 €", metricLabel: "Capital recommandé à terme", details: ["Immédiat · Horizon 5 ans+"] },
    ],
  },
  {
    objective: "Combler le gap retraite",
    description: "Préparer la baisse de 45% des revenus à la retraite par une stratégie de capitalisation anticipée.",
    preconisations: [
      { id: 9, title: "Stratégie PER + assurance-vie combinée", priority: "Haute", status: "Recommandée", description: "Combiner un PER pour la déduction fiscale immédiate et une assurance-vie pour la flexibilité de sortie en capital ou rente.", metric: "1 100 €/mois", metricLabel: "Effort d'épargne mensuel", details: ["Long terme · Sortie mixte capital/rente"] },
      { id: 10, title: "Investissement locatif en LMNP", priority: "Moyenne", status: "À valider", description: "Acquérir un bien en location meublée non professionnelle pour générer des revenus complémentaires à la retraite avec une fiscalité avantageuse.", metric: "800 €/mois", metricLabel: "Revenus nets estimés", details: ["12 mois · Amortissement comptable"] },
    ],
  },
  {
    objective: "Renforcer la couverture prévoyance",
    description: "Combler le déficit de couverture décès (2 ans vs 5 ans recommandés) et protéger la famille.",
    preconisations: [
      { id: 11, title: "Prévoyance décès complémentaire", priority: "Haute", status: "Recommandée", description: "Souscrire un contrat de prévoyance décès complémentaire pour porter le capital garanti de 70 000 € à 180 000 €.", metric: "110 000 €", metricLabel: "Capital décès additionnel", details: ["Immédiat · ~45 €/mois"] },
      { id: 12, title: "Garantie incapacité-invalidité", priority: "Haute", status: "Recommandée", description: "Ajouter une garantie maintien de revenu en cas d'arrêt de travail prolongé ou d'invalidité.", metric: "3 000 €/mois", metricLabel: "Rente mensuelle en cas d'invalidité", details: ["Immédiat · Franchise 90 jours"] },
    ],
  },
];

function priorityColor(p: Preconisation["priority"]) {
  switch (p) {
    case "Haute": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "Moyenne": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "Basse": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
}

function statusColor(s: Preconisation["status"]) {
  switch (s) {
    case "Recommandée": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "À valider": return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    case "En cours": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
  }
}

function PreconisationsContent() {
  const totalPrecos = precoData.reduce((sum, g) => sum + g.preconisations.length, 0);
  const recommendedCount = precoData.reduce((sum, g) => sum + g.preconisations.filter((p) => p.status === "Recommandée").length, 0);

  return (
    <TabsContent value="preconisations" className="mt-3 space-y-8">
      {/* Grouped preconisations */}
      {precoData.map((group, gi) => (
        <div key={gi}>
          {/* Group header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-[#33ee87]/15 text-[#33ee87]">
                <CheckCircle2 className="size-4" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">{group.objective}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">{group.preconisations.length} action{group.preconisations.length > 1 ? "s" : ""}</Badge>
          </div>

          {/* Preconisation items */}
          <div className="space-y-3">
            {group.preconisations.map((preco, pi) => (
              <Card key={preco.id} className="px-6 py-5">
                <div className="flex items-start gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                    {String(pi + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">{preco.title}</span>
                      <Badge className={`text-[10px] ${priorityColor(preco.priority)}`}>{preco.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{preco.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </TabsContent>
  );
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const loading = useLoading();
  const { id } = use(params);
  const { clients } = useClients();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [addObjectifOpen, setAddObjectifOpen] = useState(false);
  const client = clients.find((c) => c.id === Number(id));

  if (loading) {
    return (
      <AppLayout title={<Skeleton className="h-6 w-48" />}>
        <div className="w-full space-y-6 pb-8">
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-28 rounded-md" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="px-5 py-4 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-7 w-24" />
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="p-5 space-y-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-7 w-24" />
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-1.5 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-1.5 w-1/2 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i} className="px-5 py-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="mt-2 h-7 w-24" />
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!client) {
    return (
      <AppLayout title="Client introuvable">
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Ce client n&apos;existe pas.</p>
          <Button variant="outline" onClick={() => router.push("/clients")}>
            Retour à la liste
          </Button>
        </div>
      </AppLayout>
    );
  }

  const displayName = `${client.firstName} ${client.lastName}`;
  const advisorName = "Sophie Martin, CGP";
  const diagDate = "23 mars 2026";
  const data = deriveClientData(client.formData);
  const diagnostic = buildWealthDiagnostic(client.formData);
  const advisorClient = {
    netWorth: data.patrimoine,
    totalAssets: data.actifs.total,
    totalLiabilities: data.passifs.total,
    annualIncome: data.revenus.total,
    realEstateAssets: data.actifs.immobilier.total,
    cash: data.actifs.epargne.disponibilites,
    lifeInsurance: data.actifs.epargne.assuranceVie,
    retirementSavings: data.actifs.epargne.epargneRetraite,
    occupation: data.profession,
    employmentStatus: data.csp,
    maritalStatus: data.situation,
    childrenCount: data.nbEnfants,
    wealthScore: diagnostic.globalScore,
  };
  const categoryAnalysis = buildCategoryAnalysis(client.formData, data, diagnostic);

  return (
    <AppLayout
      title={
        <span className="flex items-center gap-2">
          <Link href="/clients" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          {displayName}
        </span>
      }
      subtitle={
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <Separator orientation="vertical" className="!h-3" />
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            Ajouté le {diagDate}
          </span>
          <Separator orientation="vertical" className="!h-3" />
          <span className="flex items-center gap-1">
            <Phone className="size-3" />
            {client.phone}
          </span>
          <Separator orientation="vertical" className="!h-3" />
          <span className="flex items-center gap-1">
            <Mail className="size-3" />
            {client.email}
          </span>
          <Separator orientation="vertical" className="!h-3" />
          <span className="flex items-center gap-1">
            <User className="size-3" />
            {advisorName}
          </span>
        </div>
      }
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline">Modifier</Button>
          <Button variant="outline" size="icon">
            <Ellipsis className="size-4" />
          </Button>
        </div>
      }
      hideIcons
    >
      <div className="w-full space-y-8 pb-8">
        {/* ── Tabs ────────────────────────────────────────────── */}
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="gap-2">
              <TabsTrigger value="overview">Synthèse</TabsTrigger>
              <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
              <TabsTrigger value="diagnostique">Diagnostique</TabsTrigger>
              <TabsTrigger value="preconisations">Préconisations</TabsTrigger>
            </TabsList>
            {activeTab === "objectifs" && (
              <Button size="sm" className="bg-[#0052CC] text-white hover:bg-[#0052CC]/90" onClick={() => setAddObjectifOpen(true)}>
                <Plus className="size-3.5 mr-1" />
                Ajouter
              </Button>
            )}
          </div>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="mb-6">
              <h3 className="text-[18px] font-semibold text-foreground">Synthèse patrimoniale</h3>
              <p className="text-sm text-muted-foreground">Vue d&apos;ensemble du patrimoine et du profil client.</p>
            </div>
            {/* ── KPI row ──────────────────────────── */}
            <div className="grid grid-cols-4 gap-4">
              <Card className="px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Wallet className="size-3.5" />
                  Total Actifs
                </div>
                <p className="mt-1 text-2xl font-bold">{fmt(data.actifs.total)}</p>
              </Card>
              <Card className="px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <CreditCard className="size-3.5" />
                  Total Passifs
                </div>
                <p className="mt-1 text-2xl font-bold">{fmt(data.passifs.total)}</p>
              </Card>
              <Card className="px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Landmark className="size-3.5" />
                  Patrimoine net
                </div>
                <p className="mt-1 text-2xl font-bold">{fmt(data.patrimoine)}</p>
              </Card>
              <Card className="px-5 py-4">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Banknote className="size-3.5" />
                  Revenus annuels
                </div>
                <p className="mt-1 text-2xl font-bold">{fmt(data.revenus.total)}</p>
              </Card>
            </div>

            {/* ── Row 2: Répartition | Actifs immobiliers | Épargne | Radar ── */}
            <div className="grid grid-cols-4 items-stretch gap-4">
              {/* Répartition du patrimoine */}
              <PatrimoinePieChart data={data} />

              {/* Actifs immobiliers */}
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Home className="size-3.5" />
                    Actifs immobiliers
                  </div>
                  <p className="mt-2 text-2xl font-bold">{fmt(data.actifs.immobilier.total)}</p>
                </CardHeader>
                <CardContent className="text-sm" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Biens d&apos;usage</span>
                      <span className="font-medium">{fmt(data.actifs.immobilier.biensUsage)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-chart-1" style={{ width: `${data.actifs.immobilier.total > 0 ? (data.actifs.immobilier.biensUsage / data.actifs.immobilier.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Immobilier de rapport</span>
                      <span className="font-medium">{fmt(data.actifs.immobilier.immobilierRapport)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-chart-2" style={{ width: `${data.actifs.immobilier.total > 0 ? (data.actifs.immobilier.immobilierRapport / data.actifs.immobilier.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Défiscalisant</span>
                      <span className="font-medium">{fmt(data.actifs.immobilier.immobilierDefisc)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-chart-3" style={{ width: `${data.actifs.immobilier.total > 0 ? (data.actifs.immobilier.immobilierDefisc / data.actifs.immobilier.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Épargne & Prévoyance */}
              <Card>
                <CardHeader className="pb-0">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <PiggyBank className="size-3.5" />
                    Épargne & Prévoyance
                  </div>
                  <p className="mt-2 text-2xl font-bold">{fmt(data.actifs.epargne.total)}</p>
                </CardHeader>
                <CardContent className="text-sm" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Disponibilités</span>
                      <span className="font-medium">{fmt(data.actifs.epargne.disponibilites)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-chart-1" style={{ width: `${data.actifs.epargne.total > 0 ? (data.actifs.epargne.disponibilites / data.actifs.epargne.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assurance-vie</span>
                      <span className="font-medium">{fmt(data.actifs.epargne.assuranceVie)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-chart-2" style={{ width: `${data.actifs.epargne.total > 0 ? (data.actifs.epargne.assuranceVie / data.actifs.epargne.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Épargne retraite</span>
                      <span className="font-medium">{fmt(data.actifs.epargne.epargneRetraite)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-chart-3" style={{ width: `${data.actifs.epargne.total > 0 ? (data.actifs.epargne.epargneRetraite / data.actifs.epargne.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Défiscalisation</span>
                      <span className="font-medium">{fmt(data.actifs.epargne.defiscalisation)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-chart-4" style={{ width: `${data.actifs.epargne.total > 0 ? (data.actifs.epargne.defiscalisation / data.actifs.epargne.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Radar client */}
              <Card className="flex flex-col">
                <CardHeader className="items-center pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="size-4" />
                    Radar client
                  </CardTitle>
                  <CardDescription className="text-xs text-center">Évaluation multidimensionnelle de la maturité patrimoniale du client.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                  <ChartContainer
                    config={{
                      score: { label: "Score", color: "var(--chart-1)" },
                    } satisfies ChartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                  >
                    <RadarChart data={Object.entries(diagnostic.maturity).map(([subject, score]) => ({ subject, score }))} outerRadius="65%">
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                      />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarGrid radialLines={false} />
                      <Radar
                        dataKey="score"
                        fill="var(--color-score)"
                        fillOpacity={0.15}
                        stroke="var(--color-score)"
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ChartContainer>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-2.5 rounded-full bg-chart-1" />
                    État du patrimoine
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ── Row 3: Passifs | Revenus | Situation+Composition | Score ── */}
            <div className="grid grid-cols-4 items-stretch gap-4">
              {/* Passifs */}
              <Card className="flex flex-col">
                <CardHeader className="pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Shield className="size-4" />
                    Passifs
                  </CardTitle>
                  <CardDescription className="text-xs">{fmt(data.passifs.total)}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col items-center justify-center pb-2">
                  <ChartContainer
                    config={{
                      pretImmo: { label: "Prêt immobilier", color: "var(--chart-1)" },
                      pretPro: { label: "Prêt professionnel", color: "var(--chart-3)" },
                      autresPrets: { label: "Autres prêts", color: "var(--chart-5)" },
                    } satisfies ChartConfig}
                    className="mx-auto h-[160px] w-full"
                  >
                    <RadialBarChart
                      data={[{
                        pretImmo: data.passifs.pretImmo,
                        pretPro: data.passifs.pretPro,
                        autresPrets: data.passifs.autresPrets,
                      }]}
                      endAngle={180}
                      innerRadius={80}
                      outerRadius={110}
                      cy="70%"
                    >
                      <RadialBar dataKey="autresPrets" fill="var(--chart-5)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2" />
                      <RadialBar dataKey="pretPro" fill="var(--chart-3)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2" />
                      <RadialBar dataKey="pretImmo" fill="var(--chart-1)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2" />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) - 16}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {fmt(data.passifs.total)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 4}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    Total passifs
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
                  <div className="mt-auto flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: "var(--chart-1)" }} />
                      <span className="text-muted-foreground">Prêt immobilier</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: "var(--chart-3)" }} />
                      <span className="text-muted-foreground">Prêt professionnel</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: "var(--chart-5)" }} />
                      <span className="text-muted-foreground">Autres prêts</span>
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Revenus & Charges */}
              <RevenusWaterfallChart data={data} />

              {/* Situation personnelle + Composition familiale */}
              <div className="flex flex-col gap-4">
                <Card className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <User className="size-4" />
                    Situation personnelle
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CSP</span>
                      <span className="font-medium">{data.csp}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profession</span>
                      <span className="font-medium">{data.profession}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Situation</span>
                      <span className="font-medium">{data.situation}</span>
                    </div>
                  </div>
                </Card>

                <Card className="flex-1 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Users className="size-4" />
                    Composition familiale
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Partenaire</span>
                      <span className="font-medium">{data.hasPartner ? "Oui" : "Non"}</span>
                    </div>
                    {data.regimeMatrimonial && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Régime</span>
                          <span className="font-medium text-right">{data.regimeMatrimonial}</span>
                        </div>
                      </>
                    )}
                    {data.partnerCsp && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CSP conjoint</span>
                          <span className="font-medium">{data.partnerCsp}</span>
                        </div>
                      </>
                    )}
                    {data.partnerAge && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Âge conjoint</span>
                          <span className="font-medium">{data.partnerAge} ans</span>
                        </div>
                      </>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enfants</span>
                      <div className="flex items-center gap-1.5">
                        {data.nbEnfants > 0 ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="cursor-default">
                                <Baby className="size-3.5 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                {data.enfantsNoms.map((nom, i) => (
                                  <span key={i}>{nom} ({data.enfantsAges[i]} ans){i < data.enfantsNoms.length - 1 ? ", " : ""}</span>
                                ))}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Baby className="size-3.5 text-muted-foreground" />
                        )}
                        <span className="font-medium">{data.nbEnfants}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Score patrimonial */}
              <Card className="flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between pb-0">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="size-4" />
                    Score patrimonial
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={
                      diagnostic.globalScore >= 70
                        ? "border-green-500/30 bg-green-500/10 text-green-500"
                        : diagnostic.globalScore >= 50
                          ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                          : "border-red-500/30 bg-red-500/10 text-red-500"
                    }
                  >
                    {diagnostic.globalScore >= 70 ? "Patrimoine sain" : diagnostic.globalScore >= 50 ? "À optimiser" : "Actions urgentes"}
                  </Badge>
                </CardHeader>
                <p className="px-4 text-xs text-muted-foreground mt-1">Indicateur global de santé patrimoniale basé sur 6 critères clés.</p>
                <CardContent className="flex flex-1 flex-col justify-center pb-4 pt-6">
                  {/* Score number */}
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold text-foreground">{diagnostic.globalScore}</span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>

                  {/* Bullet chart */}
                  <div className="relative h-6 w-full rounded-md overflow-hidden">
                    {/* Background zones: red | amber | green */}
                    <div className="absolute inset-0 flex">
                      <div className="h-full bg-red-200 dark:bg-red-900/40" style={{ width: "33%" }} />
                      <div className="h-full bg-amber-200 dark:bg-amber-900/40" style={{ width: "34%" }} />
                      <div className="h-full bg-green-200 dark:bg-green-900/40" style={{ width: "33%" }} />
                    </div>
                    {/* Score bar */}
                    <div
                      className={`absolute top-1 bottom-1 left-0 rounded-sm ${
                        diagnostic.globalScore >= 70 ? "bg-green-500" : diagnostic.globalScore >= 50 ? "bg-amber-500" : "bg-red-500"
                      }`}
                      style={{ width: `${diagnostic.globalScore}%` }}
                    />
                    {/* Target marker at 70 */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/40" style={{ left: "70%" }} />
                  </div>

                  {/* Labels */}
                  <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                    <span>Critique</span>
                    <span>À optimiser</span>
                    <span>Sain</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Row 4: Analyse prioritaire (neutral cards) ──── */}
            <div className="grid grid-cols-4 gap-4">
              {categoryAnalysis
                .flatMap((cat) => cat.items.map((item) => ({ ...item, category: cat.category })))
                .slice(0, 4)
                .map((item) => (
                  <Card key={item.title} className="flex flex-col justify-between px-5 py-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{item.category}</span>
                        <Badge variant="outline" className={cn("text-[10px]", statusStyle(item.status))}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-4 border-t pt-3">
                      <p className="text-2xl font-bold">{item.metric}</p>
                      <p className="text-xs text-muted-foreground">{item.metricLabel}</p>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <ObjectifsContent addOpen={addObjectifOpen} setAddOpen={setAddObjectifOpen} />

          <TabsContent value="diagnostique" className="mt-6">
            <div className="mb-6">
              <h3 className="text-[18px] font-semibold text-foreground">Diagnostic patrimonial du client</h3>
              <p className="text-sm text-muted-foreground">Évaluation globale de la situation patrimoniale du client, avec scoring par domaine et points d&apos;attention identifiés.</p>
            </div>
            <DiagnostiqueContent categoryAnalysis={categoryAnalysis} />
          </TabsContent>

          <PreconisationsContent />
        </Tabs>

        <AdvisorCopilot client={advisorClient} />
      </div>
    </AppLayout>
  );
}
