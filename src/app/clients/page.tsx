"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  MoreHorizontal,
  Mail,
  Phone,
  Plus,
  LayoutGrid,
  List,
} from "lucide-react";

interface Client {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: "Particulier" | "Professionnel";
  status: "Actif" | "Prospect" | "Inactif";
  patrimoine: string;
}

const clients: Client[] = [
  {
    id: 1,
    firstName: "Jean-Pierre",
    lastName: "Dupont",
    email: "jp.dupont@email.fr",
    phone: "06 12 34 56 78",
    type: "Particulier",
    status: "Actif",
    patrimoine: "1 250 000 €",
  },
  {
    id: 2,
    firstName: "Marie",
    lastName: "Laurent",
    email: "m.laurent@email.fr",
    phone: "06 23 45 67 89",
    type: "Particulier",
    status: "Actif",
    patrimoine: "890 000 €",
  },
  {
    id: 3,
    firstName: "Philippe",
    lastName: "Martin",
    email: "p.martin@entreprise.fr",
    phone: "06 34 56 78 90",
    type: "Professionnel",
    status: "Actif",
    patrimoine: "3 400 000 €",
  },
  {
    id: 4,
    firstName: "Sophie",
    lastName: "Bernard",
    email: "s.bernard@email.fr",
    phone: "06 45 67 89 01",
    type: "Particulier",
    status: "Prospect",
    patrimoine: "520 000 €",
  },
  {
    id: 5,
    firstName: "Antoine",
    lastName: "Moreau",
    email: "a.moreau@cabinet.fr",
    phone: "06 56 78 90 12",
    type: "Professionnel",
    status: "Actif",
    patrimoine: "2 100 000 €",
  },
  {
    id: 6,
    firstName: "Claire",
    lastName: "Petit",
    email: "c.petit@email.fr",
    phone: "06 67 89 01 23",
    type: "Particulier",
    status: "Inactif",
    patrimoine: "310 000 €",
  },
  {
    id: 7,
    firstName: "François",
    lastName: "Robert",
    email: "f.robert@email.fr",
    phone: "06 78 90 12 34",
    type: "Particulier",
    status: "Actif",
    patrimoine: "1 780 000 €",
  },
  {
    id: 8,
    firstName: "Isabelle",
    lastName: "Durand",
    email: "i.durand@groupe.fr",
    phone: "06 89 01 23 45",
    type: "Professionnel",
    status: "Prospect",
    patrimoine: "4 500 000 €",
  },
  {
    id: 9,
    firstName: "Nicolas",
    lastName: "Leroy",
    email: "n.leroy@email.fr",
    phone: "06 90 12 34 56",
    type: "Particulier",
    status: "Actif",
    patrimoine: "670 000 €",
  },
  {
    id: 10,
    firstName: "Catherine",
    lastName: "Roux",
    email: "c.roux@email.fr",
    phone: "06 01 23 45 67",
    type: "Particulier",
    status: "Actif",
    patrimoine: "950 000 €",
  },
  {
    id: 11,
    firstName: "Éric",
    lastName: "Girard",
    email: "e.girard@entreprise.fr",
    phone: "06 11 22 33 44",
    type: "Professionnel",
    status: "Actif",
    patrimoine: "5 200 000 €",
  },
  {
    id: 12,
    firstName: "Valérie",
    lastName: "Lefebvre",
    email: "v.lefebvre@email.fr",
    phone: "06 55 66 77 88",
    type: "Particulier",
    status: "Prospect",
    patrimoine: "420 000 €",
  },
];

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

function ClientCard({ client }: { client: Client }) {
  return (
    <Card className="gap-4 p-5">
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
        <Button variant="ghost" size="icon-sm">
          <MoreHorizontal className="size-4" />
        </Button>
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
          {client.patrimoine}
        </span>
      </div>
    </Card>
  );
}

export default function ClientsPage() {
  const [view, setView] = useState<"table" | "cards">("table");

  return (
    <AppLayout title="Clients">
      {/* Toolbar */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Rechercher un client..." className="pl-9" />
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
          <Link
            href="/"
            className="inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 rounded-[min(var(--radius-md),12px)] bg-[#0052CC] px-2.5 text-[0.8rem] font-medium text-white shadow-md shadow-[#0052CC]/30 transition-all hover:bg-[#0052CC]/90 hover:shadow-lg hover:shadow-[#0052CC]/40"
          >
            <Plus className="size-3.5" />
            Nouveau client
          </Link>
        </div>
      </div>

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
          <p className="text-2xl font-semibold text-foreground">21,99 M€</p>
        </Card>
      </div>

      {/* Table View */}
      {view === "table" && (
        <Card className="px-4 py-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Patrimoine</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
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
                    {client.patrimoine}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Card Grid View */}
      {view === "cards" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}
