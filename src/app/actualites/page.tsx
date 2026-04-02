"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoading } from "@/hooks/use-loading";
import { Search, Clock, ChevronRight, Bookmark } from "lucide-react";

interface Article {
  id: number;
  title: string;
  source: string;
  date: string;
  readTime: string;
  category: string;
  excerpt?: string;
  image?: string;
}

const heroMain: Article = {
  id: 1,
  title: "Loi de finances 2026 : les mesures clés pour la gestion de patrimoine",
  source: "Les Échos Patrimoine",
  date: "Il y a 3 heures",
  readTime: "5 min",
  category: "Fiscalité",
  excerpt: "Décryptage des principales dispositions fiscales impactant les stratégies patrimoniales. Nouveaux plafonds PER, évolution du barème IR et aménagements sur les plus-values immobilières.",
  image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
};

const heroSide: Article[] = [
  { id: 2, title: "PER : les nouvelles règles de sortie en capital entrent en vigueur", source: "Agefi Actifs", date: "Il y a 5 heures", readTime: "4 min", category: "Retraite", image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=200&fit=crop" },
  { id: 3, title: "CAC 40 : nouveau record historique porté par le luxe et la tech", source: "BFM Bourse", date: "Il y a 6 heures", readTime: "3 min", category: "Marchés", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop" },
  { id: 4, title: "Assurance-vie : fonds euros, les rendements 2025 dépassent les attentes", source: "Le Revenu", date: "Il y a 8 heures", readTime: "4 min", category: "Assurance-vie", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200&h=200&fit=crop" },
  { id: 5, title: "Transmission : les abattements de donation revalorisés en 2026", source: "Gestion de Fortune", date: "Il y a 10 heures", readTime: "3 min", category: "Transmission", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=200&h=200&fit=crop" },
];

const pourVous: Article[] = [
  { id: 6, title: "Flat tax : vers une hausse du PFU à 33% pour les hauts revenus ?", source: "Capital", date: "Il y a 12 heures", readTime: "3 min", category: "Fiscalité", image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=200&h=200&fit=crop" },
  { id: 7, title: "SCPI : collecte record au T1 2026, quels secteurs privilégier ?", source: "Pierrepapier.fr", date: "Hier", readTime: "4 min", category: "Immobilier", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop" },
  { id: 8, title: "Réglementation MIF 3 : impact sur le conseil en investissement", source: "Option Finance", date: "Hier", readTime: "5 min", category: "Réglementation", image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=200&h=200&fit=crop" },
  { id: 9, title: "Prévoyance TNS : les nouvelles garanties Madelin renforcées", source: "L'Argus de l'Assurance", date: "Hier", readTime: "4 min", category: "Prévoyance", image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop" },
];

const themes = [
  {
    name: "Immobilier",
    articles: [
      { id: 10, title: "Fin du Pinel : quelles alternatives pour la défiscalisation immobilière ?", source: "Investir", date: "24 mars", readTime: "6 min", category: "Immobilier" },
      { id: 11, title: "Crédit immobilier : les taux repassent sous les 3% en mars 2026", source: "Meilleurtaux", date: "22 mars", readTime: "3 min", category: "Immobilier" },
      { id: 12, title: "Location meublée : le nouveau régime fiscal entre en vigueur", source: "PAP", date: "20 mars", readTime: "4 min", category: "Immobilier" },
    ],
  },
  {
    name: "Marchés",
    articles: [
      { id: 13, title: "BCE : nouvelle baisse des taux directeurs attendue en avril", source: "Reuters", date: "25 mars", readTime: "3 min", category: "Marchés" },
      { id: 14, title: "Or : le cours dépasse 2 800 $ l'once, faut-il encore investir ?", source: "BFM Bourse", date: "23 mars", readTime: "4 min", category: "Marchés" },
      { id: 15, title: "Private equity : les performances 2025 en demi-teinte", source: "Option Finance", date: "21 mars", readTime: "5 min", category: "Marchés" },
    ],
  },
  {
    name: "Réglementation",
    articles: [
      { id: 16, title: "DDA : renforcement des obligations de formation continue des CGP", source: "ANACOFI", date: "24 mars", readTime: "4 min", category: "Réglementation" },
      { id: 17, title: "DORA : les nouvelles exigences de résilience numérique pour les CGP", source: "AMF", date: "22 mars", readTime: "5 min", category: "Réglementation" },
      { id: 18, title: "Lutte anti-blanchiment : les seuils de vigilance abaissés", source: "ACPR", date: "19 mars", readTime: "3 min", category: "Réglementation" },
    ],
  },
];

function SmallArticle({ article }: { article: Article }) {
  return (
    <div className="group flex items-start gap-3 cursor-pointer">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-medium text-muted-foreground">{article.source}</span>
        </div>
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
          {article.title}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{article.date}</span>
          <span className="flex items-center gap-0.5">
            <Clock className="size-2.5" />
            {article.readTime}
          </span>
        </div>
      </div>
      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
        {article.image && <img src={article.image} alt="" className="size-full object-cover" />}
      </div>
    </div>
  );
}

function ThemeArticle({ article }: { article: Article }) {
  return (
    <Card className="group cursor-pointer p-3 transition-colors hover:bg-muted/30 h-full">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline" className="text-[10px]">{article.category}</Badge>
        <span className="text-[11px] text-muted-foreground">{article.source}</span>
      </div>
      <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
        {article.title}
      </p>
      <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>{article.date}</span>
        <span className="flex items-center gap-0.5">
          <Clock className="size-2.5" />
          {article.readTime}
        </span>
      </div>
    </Card>
  );
}

export default function ActualitesPage() {
  const loading = useLoading();
  const [search, setSearch] = useState("");

  if (loading) {
    return (
      <AppLayout title={<Skeleton className="h-6 w-28" />}>
        <div className="grid grid-cols-2 gap-6 mb-10">
          <Skeleton className="h-72 rounded-xl" />
          <div className="space-y-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="size-16 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="p-3 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title="Actualités"
      subtitle={
        <div className="relative ml-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            className="h-8 w-44 pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      }
    >
      {/* ── Hero section ── */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[20px] font-semibold text-foreground">Les actualités du mois</h2>
        </div>
        <div className="grid grid-cols-2 gap-6">
          {/* Main featured */}
          <div>
            <Card className="group cursor-pointer overflow-hidden p-0 transition-colors hover:bg-muted/30">
              <div className="h-52 overflow-hidden">
                <img src={heroMain.image} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{heroMain.category}</Badge>
                  <span className="text-xs text-muted-foreground">{heroMain.source}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground leading-snug mb-2">
                  {heroMain.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{heroMain.excerpt}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{heroMain.date}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {heroMain.readTime}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Side articles */}
          <div className="flex flex-col justify-between gap-4">
            {heroSide.map((a) => (
              <SmallArticle key={a.id} article={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Pour vous ── */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[20px] font-semibold text-foreground">Pour vous</h2>
          <span className="text-xs text-muted-foreground">Basé sur vos centres d&apos;intérêt</span>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {pourVous.map((a) => (
            <Card key={a.id} className="group cursor-pointer overflow-hidden p-0 transition-colors hover:bg-muted/30">
              <div className="flex items-stretch">
                <div className="flex-1 min-w-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px]">{a.category}</Badge>
                    <span className="text-[11px] text-muted-foreground">{a.source}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                    {a.title}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{a.date}</span>
                    <span className="flex items-center gap-0.5">
                      <Clock className="size-2.5" />
                      {a.readTime}
                    </span>
                  </div>
                </div>
                <div className="w-24 shrink-0 overflow-hidden">
                  {a.image && <img src={a.image} alt="" className="size-full object-cover" />}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Vos thèmes ── */}
      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[20px] font-semibold text-foreground">Vos thèmes</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-3">
          {themes.map((theme) => (
            <div key={theme.name}>
              <span className="text-sm font-semibold text-foreground">{theme.name}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: Math.max(...themes.map((t) => t.articles.length)) }).map((_, row) => (
            themes.map((theme) => {
              const a = theme.articles[row];
              return a ? <ThemeArticle key={a.id} article={a} /> : <div key={`${theme.name}-${row}`} />;
            })
          ))}
        </div>
      </section>
    </AppLayout>
  );
}
