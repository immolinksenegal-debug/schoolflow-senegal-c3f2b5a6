import { useState } from "react";
import { DollarSign, Plus, Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatCard from "@/components/StatCard";

const Payments = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    { title: "Encaissements du mois", value: "45M FCFA", icon: DollarSign, trend: { value: 12, isPositive: true } },
    { title: "Paiements en attente", value: "23", icon: DollarSign },
    { title: "Montant en attente", value: "3.2M FCFA", icon: DollarSign },
  ];

  const payments = [
    { id: "REC001", student: "Aminata Diop", class: "Terminale S", amount: "150,000 FCFA", type: "Mensuel", date: "20/01/2025", method: "Espèces", status: "Payé" },
    { id: "REC002", student: "Moussa Sow", class: "Seconde A", amount: "120,000 FCFA", type: "Mensuel", date: "19/01/2025", method: "Mobile Money", status: "Payé" },
    { id: "REC003", student: "Fatou Ndiaye", class: "Première L", amount: "135,000 FCFA", type: "Trimestriel", date: "18/01/2025", method: "Virement", status: "Payé" },
    { id: "REC004", student: "Ibrahima Fall", class: "Troisième", amount: "100,000 FCFA", type: "Mensuel", date: "17/01/2025", method: "Espèces", status: "Partiel" },
    { id: "REC005", student: "Aïssatou Ba", class: "Terminale L", amount: "150,000 FCFA", type: "Mensuel", date: "16/01/2025", method: "Mobile Money", status: "Payé" },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "Payé") {
      return <Badge className="bg-green-50 text-green-700 border-green-200">Payé</Badge>;
    } else if (status === "Partiel") {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Partiel</Badge>;
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200">En retard</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des paiements</h1>
            <p className="text-muted-foreground">Suivi des encaissements et paiements</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2">
              <Plus className="h-4 w-4" />
              Nouveau paiement
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, matricule ou reçu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtrer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">N° Reçu</TableHead>
                    <TableHead className="font-semibold">Élève</TableHead>
                    <TableHead className="font-semibold">Classe</TableHead>
                    <TableHead className="font-semibold">Montant</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Méthode</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium text-primary">{payment.id}</TableCell>
                      <TableCell className="font-medium">{payment.student}</TableCell>
                      <TableCell>{payment.class}</TableCell>
                      <TableCell className="font-semibold">{payment.amount}</TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Reçu PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payments;
