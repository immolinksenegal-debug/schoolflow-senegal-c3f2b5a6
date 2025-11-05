import { useState } from "react";
import { UserPlus, RefreshCw, Search, Eye, Check, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import StatCard from "@/components/StatCard";
import { useEnrollments } from "@/hooks/useEnrollments";
import { EnrollmentForm } from "@/components/enrollments/EnrollmentForm";
import { EnrollmentApprovalDialog } from "@/components/enrollments/EnrollmentApprovalDialog";
import { PaymentReceipt } from "@/components/payments/PaymentReceipt";
import { useSchool } from "@/hooks/useSchool";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Enrollments = () => {
  const { enrollments, isLoading, createEnrollment, approveEnrollment } = useEnrollments();
  const { school } = useSchool();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewEnrollmentOpen, setIsNewEnrollmentOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalData, setApprovalData] = useState<any>(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<any>(null);

  const newEnrollments = enrollments.filter(e => e.enrollment_type === 'new');
  const reEnrollments = enrollments.filter(e => e.enrollment_type === 're-enrollment');
  const pendingCount = enrollments.filter(e => e.status === 'pending').length;

  const stats = [
    { title: "Nouvelles inscriptions", value: newEnrollments.length.toString(), icon: UserPlus, description: "Cette année" },
    { title: "Réinscriptions", value: reEnrollments.length.toString(), icon: RefreshCw, description: "Élèves actuels" },
    { title: "En attente", value: pendingCount.toString(), icon: FileText },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">✓ Validé</Badge>;
    } else if (status === "pending") {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300">⏳ En attente</Badge>;
    } else if (status === "documents_missing") {
      return <Badge className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300">📄 Documents manquants</Badge>;
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">✗ Rejeté</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    if (status === "paid") {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">Payé</Badge>;
    } else if (status === "partial") {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300">Partiel</Badge>;
    } else {
      return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300">En attente</Badge>;
    }
  };

  const handleCreateEnrollment = (data: any) => {
    createEnrollment.mutate(data, {
      onSuccess: () => {
        setIsNewEnrollmentOpen(false);
      },
    });
  };

  const handleApprove = (enrollmentId: string) => {
    const enrollment = enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return;

    approveEnrollment.mutate(enrollmentId, {
      onSuccess: (data: any) => {
        if (data.payment_info) {
          setApprovalData({
            student_name: enrollment.students?.full_name || "Élève",
            requested_class: enrollment.requested_class,
            amount_paid: data.payment_info.amount_paid,
            total_amount: data.payment_info.total_amount,
            remaining: data.payment_info.remaining,
          });
          setApprovalDialogOpen(true);
          
          // Ouvrir automatiquement le reçu pour impression si un paiement a été créé
          if (data.created_payment) {
            setReceiptPayment(data.created_payment);
            // Délai pour laisser le temps au dialog d'approbation de se fermer
            setTimeout(() => {
              setReceiptDialogOpen(true);
              // Déclencher l'impression automatique après un court délai
              setTimeout(() => {
                window.print();
              }, 500);
            }, 1500);
          }
        }
      },
    });
  };

  const filteredNewEnrollments = newEnrollments.filter(e => {
    const matchesSearch = e.students?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReEnrollments = reEnrollments.filter(e => {
    const matchesSearch = e.students?.full_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Inscriptions & Réinscriptions</h1>
            <p className="text-muted-foreground">Gestion des nouvelles inscriptions et réinscriptions</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
              onClick={() => setIsNewEnrollmentOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Nouvelle inscription
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new">Nouvelles inscriptions ({filteredNewEnrollments.length})</TabsTrigger>
            <TabsTrigger value="re-enrollment">Réinscriptions ({filteredReEnrollments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une inscription..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Validé</SelectItem>
                      <SelectItem value="documents_missing">Documents manquants</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredNewEnrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune inscription trouvée</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Nom de l'élève</TableHead>
                          <TableHead className="font-semibold">Parent/Tuteur</TableHead>
                          <TableHead className="font-semibold">Classe demandée</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Montant</TableHead>
                          <TableHead className="font-semibold">Paiement</TableHead>
                          <TableHead className="font-semibold">Statut</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredNewEnrollments.map((enrollment) => (
                          <TableRow key={enrollment.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium">{enrollment.students?.full_name}</TableCell>
                            <TableCell className="text-sm">{enrollment.students?.parent_name}</TableCell>
                            <TableCell>{enrollment.requested_class}</TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(enrollment.enrollment_date), "dd MMM yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell className="font-semibold text-primary">
                              {enrollment.enrollment_fee ? `${enrollment.enrollment_fee.toLocaleString()} FCFA` : "-"}
                            </TableCell>
                            <TableCell>{getPaymentBadge(enrollment.payment_status)}</TableCell>
                            <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {enrollment.status === "pending" && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(enrollment.id)}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approuver
                                  </Button>
                                )}
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
          </TabsContent>

          <TabsContent value="re-enrollment" className="space-y-4">
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher une réinscription..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Validé</SelectItem>
                      <SelectItem value="rejected">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredReEnrollments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucune réinscription trouvée</p>
                  </div>
                ) : (
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Matricule</TableHead>
                          <TableHead className="font-semibold">Nom de l'élève</TableHead>
                          <TableHead className="font-semibold">Classe actuelle</TableHead>
                          <TableHead className="font-semibold">Nouvelle classe</TableHead>
                          <TableHead className="font-semibold">Date</TableHead>
                          <TableHead className="font-semibold">Montant</TableHead>
                          <TableHead className="font-semibold">Statut</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredReEnrollments.map((enrollment) => (
                          <TableRow key={enrollment.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium text-primary">{enrollment.students?.matricule}</TableCell>
                            <TableCell className="font-medium">{enrollment.students?.full_name}</TableCell>
                            <TableCell>{enrollment.previous_class || enrollment.students?.class}</TableCell>
                            <TableCell className="font-semibold text-accent">{enrollment.requested_class}</TableCell>
                            <TableCell className="text-sm">
                              {format(new Date(enrollment.enrollment_date), "dd MMM yyyy", { locale: fr })}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {enrollment.enrollment_fee ? `${enrollment.enrollment_fee.toLocaleString()} FCFA` : "-"}
                            </TableCell>
                            <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {enrollment.status === "pending" && (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleApprove(enrollment.id)}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Approuver
                                  </Button>
                                )}
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
          </TabsContent>
        </Tabs>
      </div>

      <EnrollmentForm
        open={isNewEnrollmentOpen}
        onOpenChange={setIsNewEnrollmentOpen}
        onSubmit={handleCreateEnrollment}
        loading={createEnrollment.isPending}
      />

      <EnrollmentApprovalDialog
        open={approvalDialogOpen}
        onOpenChange={setApprovalDialogOpen}
        enrollmentData={approvalData}
      />

      <PaymentReceipt
        open={receiptDialogOpen}
        onOpenChange={setReceiptDialogOpen}
        payment={receiptPayment}
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

export default Enrollments;
