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
  actifs: { label: "Total Actifs", color: "oklch(var(--viz))" },
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
  immobilier: { label: "Immobilier", color: "oklch(var(--viz))" },
  epargne: { label: "Épargne", color: "oklch(var(--viz) / 0.5)" },
  professionnel: { label: "Professionnel", color: "oklch(var(--viz) / 0.2)" },
} satisfies ChartConfig;

function PatrimoinePieChart({ data }: { data: ReturnType<typeof deriveClientData> }) {
  const chartData = useMemo(() => {
    const items = [
      { name: "immobilier", value: data.actifs.immobilier.total, fill: "oklch(var(--viz))" },
      { name: "epargne", value: data.actifs.epargne.total, fill: "oklch(var(--viz) / 0.5)" },
    ];
    if (data.actifs.professionnel > 0) {
      items.push({ name: "professionnel", value: data.actifs.professionnel, fill: "oklch(var(--viz) / 0.2)" });
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
          <span className="size-2.5 rounded-full bg-viz" />
          Immobilier ({Math.round((data.actifs.immobilier.total / data.actifs.total) * 100)}%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-viz/50" />
          Épargne ({Math.round((data.actifs.epargne.total / data.actifs.total) * 100)}%)
        </span>
        {data.actifs.professionnel > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-viz/20" />
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const allObjectives = categoryAnalysis
    .filter((c) => !selectedCat || c.category === selectedCat)
    .flatMap((cat) =>
      cat.items.map((item) => ({ ...item, category: cat.category }))
    )
    .filter((item) =>
      !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const remarques = buildRemarques(categoryAnalysis);

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* ── Left: Objectifs card ── */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3 className="size-4" />
                Objectifs du diagnostic
              </CardTitle>
              <CardDescription className="text-xs">
                Mis à jour le {new Date().toLocaleDateString("fr-FR")}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-xs">
              <Plus className="mr-1 size-3" />
              Ajouter
            </Button>
          </div>

          {/* Search + filter bar */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex flex-1 items-center overflow-hidden rounded-lg border">
              <Select
                value={selectedCat ?? "__all__"}
                onValueChange={(v) => setSelectedCat(v === "__all__" ? null : v)}
              >
                <SelectTrigger className="w-[160px] rounded-none border-0 border-r bg-muted text-xs font-medium">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Toutes catégories</SelectItem>
                  {categoryAnalysis.map((cat) => (
                    <SelectItem key={cat.category} value={cat.category}>
                      {cat.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher"
                  className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <Button size="icon" className="shrink-0">
              <Search className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4 overflow-y-auto">
          {allObjectives.map((item) => (
            <div key={item.title} className="rounded-lg border p-5 space-y-3">
              {/* Title row: title + tag + status + menu */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-foreground">{item.title}</p>
                  <Badge
                    className={cn(
                      "gap-1 text-[11px]",
                      tagColors[item.category] ?? "bg-muted text-muted-foreground"
                    )}
                  >
                    <BookOpen className="size-3" />
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-[11px]">
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                    {item.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="size-7 shrink-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </div>
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              {/* Bottom pill */}
              <div className="flex items-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-0.5 text-xs text-foreground">
                  <Video className="size-3.5" />
                  {item.metricLabel} — {item.metric}
                </span>
              </div>
            </div>
          ))}
          {allObjectives.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">Aucun objectif trouvé</p>
          )}
        </CardContent>
      </Card>

      {/* ── Right: Remarques pour rapport ── */}
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <ListChecks className="size-4" />
              Remarques pour rapport
            </CardTitle>
            <Button variant="ghost" size="icon" className="size-7">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-3 overflow-y-auto">
          {remarques.map((r, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg bg-muted/50 p-4">
              {/* Check circle */}
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full",
                  r.done
                    ? "bg-green-600 text-white"
                    : "border-2 border-muted-foreground/30"
                )}
              >
                {r.done && <Check className="size-3" />}
              </div>
              {/* Title + description */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                <p className="text-sm text-muted-foreground truncate">{r.description}</p>
              </div>
              {/* Assignee badge */}
              <Badge variant="outline" className="shrink-0 gap-1 text-[11px]">
                {r.assignee}
                <ChevronDown className="size-3" />
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { clients } = useClients();
  const router = useRouter();
  const client = clients.find((c) => c.id === Number(id));

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
  const categoryAnalysis = buildCategoryAnalysis(client.formData, data, diagnostic);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    >
      <div className="w-full space-y-8 pb-8">
        {/* ── Tabs ────────────────────────────────────────────── */}
        <Tabs defaultValue="overview">
          <div className="flex items-center justify-between">
            <TabsList className="gap-2">
              <TabsTrigger value="overview">Synthèse</TabsTrigger>
              <TabsTrigger value="objectifs">Objectifs</TabsTrigger>
              <TabsTrigger value="diagnostique">Diagnostique</TabsTrigger>
              <TabsTrigger value="preconisations">Préconisations</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Ellipsis className="size-4" />
              </Button>
              <Button>Modifier</Button>
            </div>
          </div>

          <TabsContent value="overview" className="mt-6 space-y-6">
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
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Home className="size-3.5" />
                    Actifs immobiliers
                  </div>
                  <p className="mt-3 text-2xl font-bold">{fmt(data.actifs.immobilier.total)}</p>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biens d&apos;usage</span>
                    <span className="font-medium">{fmt(data.actifs.immobilier.biensUsage)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz" style={{ width: `${data.actifs.immobilier.total > 0 ? (data.actifs.immobilier.biensUsage / data.actifs.immobilier.total) * 100 : 0}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Immobilier de rapport</span>
                    <span className="font-medium">{fmt(data.actifs.immobilier.immobilierRapport)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz/60" style={{ width: `${data.actifs.immobilier.total > 0 ? (data.actifs.immobilier.immobilierRapport / data.actifs.immobilier.total) * 100 : 0}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Défiscalisant</span>
                    <span className="font-medium">{fmt(data.actifs.immobilier.immobilierDefisc)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz/30" style={{ width: `${data.actifs.immobilier.total > 0 ? (data.actifs.immobilier.immobilierDefisc / data.actifs.immobilier.total) * 100 : 0}%` }} />
                  </div>
                </CardContent>
              </Card>

              {/* Épargne & Prévoyance */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <PiggyBank className="size-3.5" />
                    Épargne & Prévoyance
                  </div>
                  <p className="mt-3 text-2xl font-bold">{fmt(data.actifs.epargne.total)}</p>
                </CardHeader>
                <CardContent className="space-y-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disponibilités</span>
                    <span className="font-medium">{fmt(data.actifs.epargne.disponibilites)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz" style={{ width: `${data.actifs.epargne.total > 0 ? (data.actifs.epargne.disponibilites / data.actifs.epargne.total) * 100 : 0}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assurance-vie</span>
                    <span className="font-medium">{fmt(data.actifs.epargne.assuranceVie)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz/70" style={{ width: `${data.actifs.epargne.total > 0 ? (data.actifs.epargne.assuranceVie / data.actifs.epargne.total) * 100 : 0}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Épargne retraite</span>
                    <span className="font-medium">{fmt(data.actifs.epargne.epargneRetraite)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz/45" style={{ width: `${data.actifs.epargne.total > 0 ? (data.actifs.epargne.epargneRetraite / data.actifs.epargne.total) * 100 : 0}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Défiscalisation</span>
                    <span className="font-medium">{fmt(data.actifs.epargne.defiscalisation)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz/20" style={{ width: `${data.actifs.epargne.total > 0 ? (data.actifs.epargne.defiscalisation / data.actifs.epargne.total) * 100 : 0}%` }} />
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
                </CardHeader>
                <CardContent className="flex-1 pb-2">
                  <ChartContainer
                    config={{
                      score: { label: "Score", color: "var(--primary)" },
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
                    <span className="size-2.5 rounded-full bg-primary" />
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
                      pretImmo: { label: "Prêt immobilier", color: "oklch(var(--viz))" },
                      pretPro: { label: "Prêt professionnel", color: "oklch(var(--viz) / 0.5)" },
                      autresPrets: { label: "Autres prêts", color: "oklch(var(--viz) / 0.2)" },
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
                      <RadialBar dataKey="autresPrets" fill="oklch(var(--viz) / 0.2)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2" />
                      <RadialBar dataKey="pretPro" fill="oklch(var(--viz) / 0.5)" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2" />
                      <RadialBar dataKey="pretImmo" fill="oklch(var(--viz))" stackId="a" cornerRadius={5} className="stroke-transparent stroke-2" />
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
                      <span className="size-2.5 rounded-full" style={{ background: "oklch(var(--viz))" }} />
                      <span className="text-muted-foreground">Prêt immobilier</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: "oklch(var(--viz) / 0.5)" }} />
                      <span className="text-muted-foreground">Prêt professionnel</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full" style={{ background: "oklch(var(--viz) / 0.2)" }} />
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
                <CardContent className="flex flex-1 flex-col items-center justify-center pb-4">
                  <ChartContainer
                    config={{
                      score: { label: "Score", color: diagnostic.globalScore >= 70 ? "oklch(0.723 0.191 142.7)" : diagnostic.globalScore >= 50 ? "oklch(0.795 0.184 86.047)" : "oklch(0.637 0.237 25.331)" },
                    } satisfies ChartConfig}
                    className="mx-auto aspect-square w-full max-w-[150px]"
                  >
                    <RadialBarChart
                      data={[{ browser: "score", visitors: diagnostic.globalScore, fill: "var(--color-score)" }]}
                      startAngle={0}
                      endAngle={Math.round((diagnostic.globalScore / 100) * 360)}
                      innerRadius={55}
                      outerRadius={70}
                    >
                      <PolarGrid
                        gridType="circle"
                        radialLines={false}
                        stroke="none"
                        className="first:fill-muted last:fill-background"
                        polarRadius={[70, 55]}
                      />
                      <RadialBar dataKey="visitors" cornerRadius={10} />
                      <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-2xl font-bold"
                                  >
                                    {diagnostic.globalScore}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 20}
                                    className="fill-muted-foreground text-xs"
                                  >
                                    / 100
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </PolarRadiusAxis>
                    </RadialBarChart>
                  </ChartContainer>
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

          <TabsContent value="objectifs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs</CardTitle>
                <CardDescription>
                  Définissez et suivez les objectifs patrimoniaux du client.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="diagnostique" className="mt-6">
            <DiagnostiqueContent categoryAnalysis={categoryAnalysis} />
          </TabsContent>

          <TabsContent value="preconisations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Préconisations</CardTitle>
                <CardDescription>
                  Retrouvez les recommandations personnalisées pour optimiser votre patrimoine.
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
