"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/app-layout";
import { ProductIcon } from "@/components/product-icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoading } from "@/hooks/use-loading";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  ChevronDown,
  Zap,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Category =
  | "Liquidity Event Detected"
  | "Corporate Taxation (SCI)"
  | "Favorable Market Window"
  | "Sanctions List Verification"
  | "Social Contributions"
  | "Family Changes"
  | "Changes in investor profile"
  | "Corporate & Estate Law"
  | "Possible tax optimization"
  | "KYC Update Required";

type Status = "Detected" | "In Progress" | "Resolved";

interface Alert {
  id: number;
  category: Category;
  status: Status;
  title: string;
  source: string;
  date: string;
  avatars: number;
}

const categoryColors: Record<Category, string> = {
  "Liquidity Event Detected": "",
  "Corporate Taxation (SCI)": "",
  "Favorable Market Window": "",
  "Sanctions List Verification": "",
  "Social Contributions": "",
  "Family Changes": "",
  "Changes in investor profile": "",
  "Corporate & Estate Law": "",
  "Possible tax optimization": "",
  "KYC Update Required": "",
};

const statusDot: Record<Status, string> = {
  Detected: "bg-red-500",
  "In Progress": "bg-amber-500",
  Resolved: "bg-green-500",
};

const sourceGradients: Record<string, { start: string; end: string }> = {
  Big: { start: "#2C42DD", end: "#5B6EF5" },
  O2S: { start: "#1B998B", end: "#4ECDC4" },
  Fidnet: { start: "#F99E29", end: "#FBD37F" },
};

function SourceBadge({ source }: { source: string }) {
  const g = sourceGradients[source];
  return (
    <span className="inline-flex items-center gap-1">
      {g && <ProductIcon gradientStart={g.start} gradientEnd={g.end} size={14} />}
      <span className="text-xs font-semibold">{source}</span>
    </span>
  );
}

const alertsData: Alert[] = [
  { id: 1, category: "Liquidity Event Detected", status: "Detected", title: "New Capital Available for Allocation", source: "Big", date: "2 days ago", avatars: 2 },
  { id: 2, category: "Corporate Taxation (SCI)", status: "Detected", title: "SCI Commercial Revenue Tolerance Update", source: "Fidnet", date: "8 days ago", avatars: 2 },
  { id: 3, category: "Favorable Market Window", status: "Resolved", title: "SCI Commercial Revenue Tolerance Update", source: "O2S", date: "12 days ago", avatars: 3 },
  { id: 4, category: "Sanctions List Verification", status: "Detected", title: "Sanctions Screening Review Required", source: "O2S", date: "12 days ago", avatars: 2 },
  { id: 5, category: "Social Contributions", status: "In Progress", title: "2026 Social Contribution Reform", source: "Fidnet", date: "2 weeks ago", avatars: 2 },
  { id: 6, category: "Family Changes", status: "In Progress", title: "Birth of a second child", source: "O2S", date: "2 weeks ago", avatars: 2 },
  { id: 7, category: "Changes in investor profile", status: "Resolved", title: "Portfolio No Longer Aligned with Updated Profile", source: "O2S", date: "1 month ago", avatars: 2 },
  { id: 8, category: "Corporate & Estate Law", status: "Resolved", title: "Furnished Rental Regulation Update 2026", source: "Fidnet", date: "1 month ago", avatars: 3 },
  { id: 9, category: "Possible tax optimization", status: "In Progress", title: "Year-End Tax Optimization Opportunity", source: "Big", date: "1 month ago", avatars: 2 },
  { id: 10, category: "KYC Update Required", status: "In Progress", title: "KYC Review Overdue, Update Required", source: "O2S", date: "1 month ago", avatars: 3 },
  { id: 11, category: "Corporate & Estate Law", status: "Detected", title: "Donation Rules Update, Social Shares Restriction", source: "Fidnet", date: "2 month ago", avatars: 2 },
  { id: 12, category: "Family Changes", status: "Resolved", title: "Career Transition Detected", source: "Big", date: "2 month ago", avatars: 3 },
];

function AvatarGroup({ count }: { count: number }) {
  const initials = ["JD", "ML", "PM", "SB", "LM"];
  const shown = Math.min(count, 2);
  const extra = count - shown;
  return (
    <div className="flex items-center -space-x-2">
      {initials.slice(0, shown).map((init, i) => (
        <div
          key={i}
          className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold"
        >
          {init}
        </div>
      ))}
      {extra > 0 && (
        <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-semibold text-muted-foreground">
          +{extra}
        </div>
      )}
    </div>
  );
}

const allStatuses: Status[] = ["Detected", "In Progress", "Resolved"];

function StatusSelector({ status, onChange }: { status: Status; onChange: (s: Status) => void }) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            className="flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted"
            onClick={(e) => e.stopPropagation()}
          >
            <span className={`size-2 rounded-full ${statusDot[status]}`} />
            <span className="text-xs text-muted-foreground">{status}</span>
            <ChevronDown className="size-3 text-muted-foreground" />
          </button>
        }
      />
      <PopoverContent align="start" className="w-40 p-1 gap-0">
        {allStatuses.map((s) => (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onChange(s); }}
            className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted ${
              s === status ? "bg-muted/50 font-medium" : ""
            }`}
          >
            <span className={`size-2 rounded-full ${statusDot[s]}`} />
            {s}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

function AlertCard({ alert, onStatusChange }: { alert: Alert; onStatusChange: (s: Status) => void }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-xs font-medium">
          {alert.category}
        </Badge>
        <StatusSelector status={alert.status} onChange={onStatusChange} />
      </div>
      <p className="text-sm font-semibold text-foreground leading-snug">{alert.title}</p>
      <div className="mt-auto flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <SourceBadge source={alert.source} /> · {alert.date}
        </p>
        <AvatarGroup count={alert.avatars} />
      </div>
    </Card>
  );
}

type FilterTab = "all" | "Detected" | "In Progress" | "Resolved";

export default function AlertesPage() {
  const loading = useLoading();
  const [filter, setFilter] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [alerts, setAlerts] = useState<Alert[]>(alertsData);

  const updateStatus = (id: number, status: Status) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const filtered = useMemo(() => {
    let list = [...alerts];
    if (filter !== "all") list = list.filter((a) => a.status === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, search, alerts]);

  if (loading) {
    return (
      <AppLayout title="Alertes">
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-7 w-14" />
            </Card>
          ))}
        </div>
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-8 w-28 rounded-md" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-48 rounded-md" />
            <div className="flex items-center rounded-lg border bg-muted/50 p-0.5 gap-0.5">
              <Skeleton className="size-7 rounded-md" />
              <Skeleton className="size-7 rounded-md" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-36 rounded-full" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center justify-between pt-1">
                <Skeleton className="h-3 w-28" />
                <div className="flex -space-x-2">
                  <Skeleton className="size-7 rounded-full" />
                  <Skeleton className="size-7 rounded-full" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AppLayout>
    );
  }

  const openCount = alerts.filter((a) => a.status !== "Resolved").length;
  const olderThan7 = alerts.filter((a) => {
    const d = a.date;
    return d.includes("week") || d.includes("month");
  }).length;
  const resolvedCount = alerts.filter((a) => a.status === "Resolved").length;
  const completedRate = Math.round((resolvedCount / alerts.length) * 100);

  const detectedCount = alerts.filter((a) => a.status === "Detected").length;
  const inProgressCount = alerts.filter((a) => a.status === "In Progress").length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: `All (${alerts.length})` },
    { key: "Detected", label: `Detected (${detectedCount})` },
    { key: "In Progress", label: `In Progress (${inProgressCount})` },
    { key: "Resolved", label: `Resolved (${resolvedCount})` },
  ];

  return (
    <AppLayout title="Alertes">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Card className="flex items-start justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Open alerts</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{openCount}</p>
          </div>
        </Card>
        <Card className="flex items-start justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Alerts older than 7 days</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{olderThan7}</p>
          </div>
        </Card>
        <Card className="flex items-start justify-between p-4">
          <div>
            <p className="text-xs text-muted-foreground">Completed rate</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-foreground">{completedRate}%</span>
              <span className="text-sm font-medium text-green-500">+8%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="w-48 pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
            <button
              onClick={() => setView("grid")}
              className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                view === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                view === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-fr">
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onStatusChange={(s) => updateStatus(alert.id, s)} />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              Aucune alerte trouvée.
            </p>
          )}
        </div>
      )}

      {/* Table View */}
      {view === "list" && (
        <Card className="overflow-hidden py-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4 align-middle">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-input accent-primary align-middle"
                  />
                </TableHead>
                <TableHead>Alerte</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Assignés</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    Aucune alerte trouvée.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((alert) => (
                <TableRow key={alert.id} className="cursor-pointer">
                  <TableCell className="pl-4 align-middle" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="size-4 rounded border-input accent-primary align-middle"
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{alert.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-medium">
                      {alert.category}
                    </Badge>
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <StatusSelector status={alert.status} onChange={(s) => updateStatus(alert.id, s)} />
                  </TableCell>
                  <TableCell><SourceBadge source={alert.source} /></TableCell>
                  <TableCell className="text-muted-foreground">{alert.date}</TableCell>
                  <TableCell>
                    <AvatarGroup count={alert.avatars} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </AppLayout>
  );
}
