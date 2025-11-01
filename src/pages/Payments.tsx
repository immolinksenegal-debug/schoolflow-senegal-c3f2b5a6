import { useState } from "react";
import { DollarSign, Plus, Search, Filter, Download, Eye, Receipt, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const stats = [
    { title: "Encaissements du mois", value: "45M FCFA", icon: DollarSign, trend: { value: 12, isPositive: true }, description: "Janvier 2025" },
    { title: "Paiements en attente", value: "23", icon: DollarSign, description: "Élèves concernés" },
    { title: "Montant en attente", value: "3.2M FCFA", icon: DollarSign },
  ];

  const payments: any[] = [];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = 
      payment.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.matricule.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === "Payé") {
      return <Badge className="bg-green-50 text-green-700 border-green-200">✓ Payé</Badge>;
    } else if (status === "Partiel") {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">⚠ Partiel</Badge>;
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200">✗ En retard</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des paiements</h1>
            <p className="text-muted-foreground">Suivi des encaissements et paiements de scolarité</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
              onClick={() => setIsAddPaymentOpen(true)}
            >
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
                  placeholder="Rechercher par nom, matricule ou n° reçu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="Payé">Payé</SelectItem>
                  <SelectItem value="Partiel">Partiel</SelectItem>
                  <SelectItem value="En retard">En retard</SelectItem>
                </SelectContent>
              </Select>
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
                    <TableHead className="font-semibold">Montant payé</TableHead>
                    <TableHead className="font-semibold">Reste à payer</TableHead>
                    <TableHead className="font-semibold">Période</TableHead>
                    <TableHead className="font-semibold">Méthode</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow 
                      key={payment.id} 
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPayment(payment)}
                    >
                      <TableCell className="font-medium text-primary">{payment.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.student}</p>
                          <p className="text-xs text-muted-foreground">{payment.matricule}</p>
                        </div>
                      </TableCell>
                      <TableCell>{payment.class}</TableCell>
                      <TableCell className="font-semibold">{payment.amount}</TableCell>
                      <TableCell className={payment.remainingBalance === "0 FCFA" ? "text-green-600" : "text-red-600"}>
                        {payment.remainingBalance}
                      </TableCell>
                      <TableCell className="text-sm">{payment.period}</TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell className="text-sm">{payment.date}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="gap-1"
                        >
                          <Receipt className="h-3 w-3" />
                          Reçu
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog nouveau paiement */}
        <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enregistrer un paiement</DialogTitle>
              <DialogDescription>
                Saisir les informations du paiement de scolarité
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Élève *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Rechercher un élève..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mat001">MAT001 - Aminata Diop (Terminale S)</SelectItem>
                    <SelectItem value="mat002">MAT002 - Moussa Sow (Seconde A)</SelectItem>
                    <SelectItem value="mat003">MAT003 - Fatou Ndiaye (Première L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Montant du paiement *</Label>
                  <Input placeholder="Ex: 150,000" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <Input value="FCFA" disabled />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Méthode de paiement *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="mobile">Mobile Money</SelectItem>
                      <SelectItem value="bank">Virement bancaire</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type de paiement *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                      <SelectItem value="quarterly">Trimestriel</SelectItem>
                      <SelectItem value="annual">Annuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date du paiement *</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Période concernée</Label>
                  <Input placeholder="Ex: Janvier 2025" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Référence de transaction (optionnel)</Label>
                <Input placeholder="Ex: TRX123456789" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90">
                Enregistrer et générer le reçu
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog détails paiement */}
        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails du paiement</DialogTitle>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">N° de reçu</p>
                    <p className="font-bold text-lg text-primary">{selectedPayment.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    {getStatusBadge(selectedPayment.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Élève</p>
                    <p className="font-medium">{selectedPayment.student}</p>
                    <p className="text-xs text-muted-foreground">{selectedPayment.matricule}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Classe</p>
                    <p className="font-medium">{selectedPayment.class}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Montant payé</p>
                    <p className="font-bold text-lg text-green-600">{selectedPayment.amount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Reste à payer</p>
                    <p className={`font-bold text-lg ${selectedPayment.remainingBalance === "0 FCFA" ? "text-green-600" : "text-red-600"}`}>
                      {selectedPayment.remainingBalance}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Méthode de paiement</p>
                    <p className="font-medium">{selectedPayment.method}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{selectedPayment.date}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Période</p>
                    <p className="font-medium">{selectedPayment.period} · {selectedPayment.type}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPayment(null)}>
                Fermer
              </Button>
              <Button className="gap-2">
                <Receipt className="h-4 w-4" />
                Télécharger le reçu PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Payments;
