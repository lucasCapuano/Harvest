"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { useClients } from "@/lib/clients-store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadarChart } from "@/components/radar-chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, Cell, Label, Line, LineChart, Pie, PieChart, PolarRadiusAxis, RadialBar, RadialBarChart, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Sparkles,
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
} from "lucide-react";

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
        <ChartContainer config={evolutionChartConfig}>
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

  return (
    <AppLayout
      title={displayName}
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
              <TabsTrigger value="sensibilisation">Sensibilisation</TabsTrigger>
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

            {/* ── Main content: info cards | line chart | pie chart ── */}
            <div className="grid grid-cols-4 items-stretch gap-4">
              {/* ── Column 1: 2 stacked compact cards ──── */}
              <div className="flex flex-col gap-4">
                {/* Situation personnelle */}
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
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <Badge variant="outline" className="text-xs">{client.type}</Badge>
                    </div>
                  </div>
                </Card>

                {/* Composition familiale */}
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
                    {data.nbEnfants > 0 && (
                      <>
                        <Separator />
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Âges</span>
                          <span className="font-medium">{data.enfantsAges.join(", ")} ans</span>
                        </div>
                      </>
                    )}
                  </div>
                </Card>
              </div>

              {/* ── Column 2: Interactive line chart ── */}
              <div className="col-span-2 flex">
                <EvolutionLineChart data={data} />
              </div>

              {/* ── Column 3: Donut pie chart ── */}
              <PatrimoinePieChart data={data} />
            </div>

            {/* ── Actifs, Passifs & Revenus breakdown ──────────── */}
            <div className="grid grid-cols-4 items-stretch gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Home className="size-4" />
                    Actifs immobiliers
                  </CardTitle>
                  <CardDescription className="text-xs">{fmt(data.actifs.immobilier.total)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Biens d&apos;usage</span>
                    <span className="font-medium">{fmt(data.actifs.immobilier.biensUsage)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz" style={{ width: `${(data.actifs.immobilier.biensUsage / data.actifs.immobilier.total) * 100}%` }} />
                  </div>
                  {data.actifs.immobilier.immobilierRapport > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Immobilier de rapport</span>
                        <span className="font-medium">{fmt(data.actifs.immobilier.immobilierRapport)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-viz/60" style={{ width: `${(data.actifs.immobilier.immobilierRapport / data.actifs.immobilier.total) * 100}%` }} />
                      </div>
                    </>
                  )}
                  {data.actifs.immobilier.immobilierDefisc > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Défiscalisant</span>
                        <span className="font-medium">{fmt(data.actifs.immobilier.immobilierDefisc)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-viz/30" style={{ width: `${(data.actifs.immobilier.immobilierDefisc / data.actifs.immobilier.total) * 100}%` }} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <PiggyBank className="size-4" />
                    Épargne & Prévoyance
                  </CardTitle>
                  <CardDescription className="text-xs">{fmt(data.actifs.epargne.total)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Disponibilités</span>
                    <span className="font-medium">{fmt(data.actifs.epargne.disponibilites)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz" style={{ width: `${(data.actifs.epargne.disponibilites / data.actifs.epargne.total) * 100}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assurance-vie</span>
                    <span className="font-medium">{fmt(data.actifs.epargne.assuranceVie)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz/70" style={{ width: `${(data.actifs.epargne.assuranceVie / data.actifs.epargne.total) * 100}%` }} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Épargne retraite</span>
                    <span className="font-medium">{fmt(data.actifs.epargne.epargneRetraite)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-viz/45" style={{ width: `${(data.actifs.epargne.epargneRetraite / data.actifs.epargne.total) * 100}%` }} />
                  </div>
                  {data.actifs.epargne.defiscalisation > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Défiscalisation</span>
                        <span className="font-medium">{fmt(data.actifs.epargne.defiscalisation)}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-viz/20" style={{ width: `${(data.actifs.epargne.defiscalisation / data.actifs.epargne.total) * 100}%` }} />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

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
                    className="mx-auto aspect-square w-full max-w-[220px]"
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

              <RevenusWaterfallChart data={data} />
            </div>
          </TabsContent>

          <TabsContent value="sensibilisation" className="mt-6 space-y-8">

        {/* ── Diagnostic patrimonial ─────────────────────────── */}
        <Card className="px-0 py-0 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* Left: Radar Chart */}
            <div className="flex items-center justify-center p-8">
              <RadarChart scores={diagnostic.maturity} size={280} />
            </div>

            {/* Right: Scores */}
            <div className="p-8 space-y-5">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#0052CC]">
                    Vue d&apos;ensemble
                  </p>
                  <Badge className="gap-1 bg-muted text-muted-foreground border-transparent text-[11px]">
                    <Sparkles className="size-3" />
                    Modélisation IA
                  </Badge>
                </div>
                <h2 className="text-lg font-bold">Diagnostic patrimonial</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Score calculé par intelligence artificielle à partir de vos données patrimoniales.
                  Plus la surface est large, meilleure est votre situation.
                </p>
              </div>

              {/* Global score */}
              <div className="flex items-center gap-4 rounded-lg bg-muted/60 px-4 py-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="size-4 text-muted-foreground" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{diagnostic.globalScore}</span>
                  <span className="text-sm text-muted-foreground">/100</span>
                </div>
                <span className="ml-1 text-sm text-muted-foreground">Score IA global</span>
              </div>

              {/* Individual scores */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {Object.entries(diagnostic.maturity).map(([label, value]) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className={`h-2.5 rounded-full ${scoreBg(value)}`} style={{ width: "80px" }}>
                      <div
                        className={`h-full rounded-full ${scoreColor(value)}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="ml-auto text-sm font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

          </TabsContent>

          <TabsContent value="diagnostique" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Diagnostique</CardTitle>
                <CardDescription>
                  Découvrez les enjeux patrimoniaux clés et les risques identifiés pour votre situation.
                </CardDescription>
              </CardHeader>
            </Card>
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
