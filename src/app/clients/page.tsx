"use client";

import { useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoading } from "@/hooks/use-loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Plus,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  FileText,
  Upload,
  Mic,
  Loader2,
  CheckCircle2,
  File,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useClients, type Client, computePatrimoineNet, formatPatrimoine } from "@/lib/clients-store";

function statusColor(status: Client["status"]) {
  switch (status) {
    case "Actif":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "Prospect":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "Inactif":
      return "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400";
  }
}

function ClientActions({ client }: { client: Client }) {
  const { updateClient, deleteClient } = useClients();
  const [editOpen, setEditOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [editData, setEditData] = useState({
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
  });

  const handleEdit = () => {
    setEditData({
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
    });
    setPopoverOpen(false);
    setEditOpen(true);
  };

  const handleSave = () => {
    updateClient(client.id, editData);
    setEditOpen(false);
  };

  const handleDelete = () => {
    setPopoverOpen(false);
    deleteClient(client.id);
  };

  return (
    <>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger
          render={
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="size-4" />
            </Button>
          }
        />
        <PopoverContent align="end" className="w-36 p-1 gap-0">
          <button
            onClick={handleEdit}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors"
          >
            <Pencil className="size-3.5" />
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="size-3.5" />
            Supprimer
          </button>
        </PopoverContent>
      </Popover>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le client</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`fn-${client.id}`}>Prénom</Label>
                <Input
                  id={`fn-${client.id}`}
                  value={editData.firstName}
                  onChange={(e) => setEditData((d) => ({ ...d, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`ln-${client.id}`}>Nom</Label>
                <Input
                  id={`ln-${client.id}`}
                  value={editData.lastName}
                  onChange={(e) => setEditData((d) => ({ ...d, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`em-${client.id}`}>Email</Label>
              <Input
                id={`em-${client.id}`}
                type="email"
                value={editData.email}
                onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`ph-${client.id}`}>Téléphone</Label>
              <Input
                id={`ph-${client.id}`}
                type="tel"
                value={editData.phone}
                onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button className="bg-[#0052CC] text-white transition-all hover:bg-[#0052CC]/90" onClick={handleSave}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ClientCard({ client, onClick }: { client: Client; onClick: () => void }) {
  return (
    <Card className="gap-4 p-5 cursor-pointer transition-colors hover:bg-muted/30" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
            {client.firstName[0]}
            {client.lastName[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {client.firstName} {client.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{client.type}</p>
          </div>
        </div>
        <ClientActions client={client} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Mail className="size-3" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Phone className="size-3" />
          {client.phone}
        </div>
      </div>

      <div className="flex items-center justify-between border-t pt-3">
        <Badge variant="secondary" className={statusColor(client.status)}>
          {client.status}
        </Badge>
        <span className="text-sm font-semibold text-foreground">
          {formatPatrimoine(computePatrimoineNet(client.formData))}
        </span>
      </div>
    </Card>
  );
}

export default function ClientsPage() {
  const loading = useLoading();
  const [view, setView] = useState<"table" | "cards">("table");
  const [newClientOpen, setNewClientOpen] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [transcriptFile, setTranscriptFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { clients } = useClients();
  const router = useRouter();

  // Data table state
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "email" | "patrimoine" | "status" | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    let list = [...clients];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      list.sort((a, b) => {
        let cmp = 0;
        switch (sortKey) {
          case "name":
            cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            break;
          case "email":
            cmp = a.email.localeCompare(b.email);
            break;
          case "status":
            cmp = a.status.localeCompare(b.status);
            break;
          case "patrimoine":
            cmp = computePatrimoineNet(a.formData) - computePatrimoineNet(b.formData);
            break;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [clients, search, sortKey, sortDir]);

  if (loading) {
    return (
      <AppLayout title={<Skeleton className="h-6 w-24" />}>
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="p-4 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
            </Card>
          ))}
        </div>
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-9 w-64 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-md" />
            <Skeleton className="h-7 w-32 rounded-md" />
          </div>
        </div>
        <Card className="overflow-hidden">
          <div className="border-b px-4 py-3 flex gap-4">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-4 flex-1" />
            ))}
          </div>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 border-b px-4 py-4">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </Card>
      </AppLayout>
    );
  }


  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ col }: { col: typeof sortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 size-3" />;
    return sortDir === "asc" ? <ArrowUp className="ml-1 size-3" /> : <ArrowDown className="ml-1 size-3" />;
  };



  const allSelected = filtered.length > 0 && filtered.every((c) => selectedIds.has(c.id));
  const someSelected = filtered.some((c) => selectedIds.has(c.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((c) => next.add(c.id));
        return next;
      });
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setTranscriptFile(file);
  };

  const handleAnalyze = () => {
    if (!transcriptFile) return;
    setAnalyzing(true);
    // Store file name in sessionStorage so the form page can read it
    sessionStorage.setItem("transcriptMode", "true");
    setTimeout(() => {
      setAnalyzing(false);
      setAnalysisDone(true);
      setTimeout(() => {
        setTranscriptOpen(false);
        setTranscriptFile(null);
        setAnalysisDone(false);
        router.push("/?mode=transcript");
      }, 800);
    }, 2500);
  };

  const openTranscriptFlow = () => {
    setNewClientOpen(false);
    setTranscriptFile(null);
    setAnalyzing(false);
    setAnalysisDone(false);
    setTranscriptOpen(true);
  };

  return (
    <AppLayout title="Clients">
      {/* Stats */}
      <div className="mb-6 flex gap-4">
        <Card className="flex-1 gap-1 p-4">
          <p className="text-xs text-muted-foreground">Total clients</p>
          <p className="text-2xl font-semibold text-foreground">{clients.length}</p>
        </Card>
        <Card className="flex-1 gap-1 p-4">
          <p className="text-xs text-muted-foreground">Actifs</p>
          <p className="text-2xl font-semibold text-foreground">
            {clients.filter((c) => c.status === "Actif").length}
          </p>
        </Card>
        <Card className="flex-1 gap-1 p-4">
          <p className="text-xs text-muted-foreground">Prospects</p>
          <p className="text-2xl font-semibold text-foreground">
            {clients.filter((c) => c.status === "Prospect").length}
          </p>
        </Card>
        <Card className="flex-1 gap-1 p-4">
          <p className="text-xs text-muted-foreground">Patrimoine total</p>
          <p className="text-2xl font-semibold text-foreground">
            {formatPatrimoine(clients.reduce((sum, c) => sum + computePatrimoineNet(c.formData), 0))}
          </p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filtrer les clients..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
            />
          </div>

        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
            <button
              onClick={() => setView("table")}
              className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                view === "table"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-4" />
            </button>
            <button
              onClick={() => setView("cards")}
              className={`inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                view === "cards"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>
          <button
            onClick={() => setNewClientOpen(true)}
            className="inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 rounded-[min(var(--radius-md),12px)] bg-[#0052CC] px-2.5 text-[0.8rem] font-medium text-white transition-all hover:bg-[#0052CC]/90"
          >
            <Plus className="size-3.5" />
            Nouveau client
          </button>
        </div>
      </div>

      {/* New Client Dialog */}
      <Dialog open={newClientOpen} onOpenChange={setNewClientOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau client</DialogTitle>
            <DialogDescription>
              Choisissez comment créer le dossier client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <button
              onClick={() => { setNewClientOpen(false); router.push("/"); }}
              className="flex items-start gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#0052CC]/10 text-[#0052CC]">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Remplir manuellement</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Saisissez les informations du client étape par étape.
                </p>
              </div>
            </button>
            <button
              onClick={openTranscriptFlow}
              className="flex items-start gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                <Upload className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Importer un transcript</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Importez le compte-rendu d&apos;un rendez-vous pour pré-remplir le formulaire automatiquement.
                </p>
              </div>
            </button>
            <button
              onClick={() => { setNewClientOpen(false); router.push("/?mode=live"); }}
              className="flex items-start gap-4 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                <Mic className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Rendez-vous en direct</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lancez un entretien exploratoire en direct. L&apos;IA analyse la conversation et remplit le dossier en temps réel.
                </p>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Table View */}
      {view === "table" && (
        <div className="min-h-0 flex-1 space-y-4">
          <Card className="overflow-hidden py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10 pl-4 align-middle">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                      onChange={toggleAll}
                      className="size-4 rounded border-input accent-primary align-middle"
                    />
                  </TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("name")} className="inline-flex items-center font-medium">
                      Client <SortIcon col="name" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("email")} className="inline-flex items-center font-medium">
                      Email <SortIcon col="email" />
                    </button>
                  </TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <button onClick={() => toggleSort("status")} className="inline-flex items-center font-medium">
                      Statut <SortIcon col="status" />
                    </button>
                  </TableHead>
                  <TableHead className="text-right">
                    <button onClick={() => toggleSort("patrimoine")} className="inline-flex items-center font-medium ml-auto">
                      Patrimoine <SortIcon col="patrimoine" />
                    </button>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Aucun client trouvé.
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((client) => (
                  <TableRow
                    key={client.id}
                    data-state={selectedIds.has(client.id) ? "selected" : undefined}
                    className="cursor-pointer"
                    onClick={() => router.push(`/clients/${client.id}`)}
                  >
                    <TableCell className="pl-4 align-middle" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(client.id)}
                        onChange={() => toggleOne(client.id)}
                        className="size-4 rounded border-input accent-primary align-middle"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                          {client.firstName[0]}
                          {client.lastName[0]}
                        </div>
                        <span className="font-medium">
                          {client.firstName} {client.lastName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.email}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.phone}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {client.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={statusColor(client.status)}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatPatrimoine(computePatrimoineNet(client.formData))}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <ClientActions client={client} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>


        </div>
      )}

      {/* Card Grid View */}
      {view === "cards" && (
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} onClick={() => router.push(`/clients/${client.id}`)} />
          ))}
          </div>
        </div>
      )}

      {/* Transcript Upload Dialog */}
      <Dialog open={transcriptOpen} onOpenChange={(open) => { if (!analyzing) setTranscriptOpen(open); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importer un transcript</DialogTitle>
            <DialogDescription>
              Sélectionnez le fichier du compte-rendu de rendez-vous (.txt, .doc, .docx).
            </DialogDescription>
          </DialogHeader>

          {!analyzing && !analysisDone && (
            <div className="space-y-4 py-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-[#0052CC]/50 hover:bg-muted/50"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                  <Upload className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {transcriptFile ? transcriptFile.name : "Cliquez pour sélectionner un fichier"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formats acceptés : .txt, .doc, .docx, .pdf
                  </p>
                </div>
              </button>

              {transcriptFile && (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <File className="size-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{transcriptFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(transcriptFile.size / 1024).toFixed(1)} Ko
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setTranscriptOpen(false)}>Annuler</Button>
                <Button
                  className="bg-[#0052CC] text-white transition-all hover:bg-[#0052CC]/90"
                  disabled={!transcriptFile}
                  onClick={handleAnalyze}
                >
                  Analyser le document
                </Button>
              </DialogFooter>
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="size-8 animate-spin text-[#0052CC]" />
              <div className="text-center">
                <p className="text-sm font-medium">Analyse en cours…</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Extraction des informations du transcript
                </p>
              </div>
            </div>
          )}

          {analysisDone && (
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle2 className="size-8 text-green-500" />
              <div className="text-center">
                <p className="text-sm font-medium">Analyse terminée</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Redirection vers le formulaire pré-rempli…
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
