import { useState } from "react";
import { DollarSign, Plus, Search, Download, Receipt, Pencil, Trash2 } from "lucide-react";
import { useSchool } from "@/hooks/useSchool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatCard from "@/components/StatCard";
import { usePayments, CreatePaymentData, Payment } from "@/hooks/usePayments";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { PaymentReceipt } from "@/components/payments/PaymentReceipt";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Payments = () => {
  const { payments, stats, isLoading, createPayment, updatePayment, deletePayment } = usePayments();
  const { school } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<string | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Payment | null>(null);

  const statsData = [
    { 
      title: "Encaissements du mois", 
      value: `${(stats?.monthlyTotal || 0).toLocaleString()} FCFA`, 
      icon: DollarSign, 
      description: format(new Date(), "MMMM yyyy", { locale: fr }) 
    },
    { 
      title: "Paiements en attente", 
      value: stats?.pendingCount?.toString() || "0", 
      icon: DollarSign, 
      description: "Élèves concernés" 
    },
    { 
      title: "Total paiements", 
      value: payments.length.toString(), 
      icon: Receipt 
    },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.students?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.receipt_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.students?.matricule.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter;
    const matchesType = typeFilter === "all" || payment.payment_type === typeFilter;

    return matchesSearch && matchesMethod && matchesType;
  });

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: "Espèces",
      mobile_money: "Mobile Money",
      bank_transfer: "Virement",
      check: "Chèque",
      other: "Autre",
    };
    return labels[method] || method;
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tuition: "Scolarité",
      registration: "Inscription",
      exam: "Examens",
      transport: "Transport",
      canteen: "Cantine",
      uniform: "Uniforme",
      books: "Manuels",
      other: "Autre",
    };
    return labels[type] || type;
  };

  const handleCreatePayment = (data: CreatePaymentData) => {
    createPayment.mutate(data, {
      onSuccess: (newPayment) => {
        setIsFormOpen(false);
        setCurrentReceipt(newPayment as Payment);
        setReceiptOpen(true);
      },
    });
  };

  const handleUpdatePayment = (data: CreatePaymentData) => {
    if (!editingPayment) return;
    updatePayment.mutate(
      { id: editingPayment.id, ...data },
      {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingPayment(undefined);
        },
      }
    );
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (paymentId: string) => {
    setPaymentToDelete(paymentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (paymentToDelete) {
      deletePayment.mutate(paymentToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPaymentToDelete(null);
        },
      });
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsFormOpen(open);
    if (!open) {
      setEditingPayment(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des paiements</h1>
            <p className="text-muted-foreground">Suivi des encaissements et paiements de scolarité</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
              onClick={() => setIsFormOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Nouveau paiement
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {statsData.map((stat) => (
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
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Méthode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes méthodes</SelectItem>
                  <SelectItem value="cash">Espèces</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                  <SelectItem value="bank_transfer">Virement</SelectItem>
                  <SelectItem value="check">Chèque</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="tuition">Scolarité</SelectItem>
                  <SelectItem value="registration">Inscription</SelectItem>
                  <SelectItem value="exam">Examens</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucun paiement trouvé</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Enregistrer le premier paiement
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">N° Reçu</TableHead>
                      <TableHead className="font-semibold">Élève</TableHead>
                      <TableHead className="font-semibold">Classe</TableHead>
                      <TableHead className="font-semibold">Montant</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Période</TableHead>
                      <TableHead className="font-semibold">Méthode</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium text-primary">{payment.receipt_number}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.students?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{payment.students?.matricule}</p>
                          </div>
                        </TableCell>
                        <TableCell>{payment.students?.class}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {payment.amount.toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getTypeLabel(payment.payment_type)}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{payment.payment_period || "-"}</TableCell>
                        <TableCell className="text-sm">{getMethodLabel(payment.payment_method)}</TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(payment.payment_date), "dd MMM yyyy", { locale: fr })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(payment)}
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Modifier
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(payment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PaymentForm
        open={isFormOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={editingPayment ? handleUpdatePayment : handleCreatePayment}
        paymentData={editingPayment}
        loading={createPayment.isPending || updatePayment.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PaymentReceipt
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        payment={currentReceipt}
        schoolInfo={{
          name: school?.name || "",
          address: school?.address,
          phone: school?.phone,
          email: school?.email,
          logo_url: school?.logo_url,
        }}
      />
    </div>
  );
};

export default Payments;
