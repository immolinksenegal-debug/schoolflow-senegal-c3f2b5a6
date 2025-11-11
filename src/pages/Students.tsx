import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, UserPlus, Download, Eye, Edit, Trash2, MoreHorizontal, Printer, DollarSign, FileText, CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudents, Student } from "@/hooks/useStudents";
import { StudentForm } from "@/components/students/StudentForm";
import { useSchool } from "@/hooks/useSchool";
import { useClasses } from "@/hooks/useClasses";
import { usePayments } from "@/hooks/usePayments";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { PaymentReceipt } from "@/components/payments/PaymentReceipt";
import { useStudentLimit } from "@/hooks/useStudentLimit";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";

const Students = () => {
  const [searchParams] = useSearchParams();
  const classParam = searchParams.get("class");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState(classParam || "all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [payingStudent, setPayingStudent] = useState<Student | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastPayment, setLastPayment] = useState<any>(null);

  const { students, isLoading, createStudent, updateStudent, deleteStudent } = useStudents();
  const { school } = useSchool();
  const { classes } = useClasses();
  const { payments, createPayment } = usePayments();
  const { data: limitInfo } = useStudentLimit(school?.id);

  useEffect(() => {
    if (classParam) {
      setClassFilter(classParam);
    }
  }, [classParam]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch = 
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matricule.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = classFilter === "all" || student.class.includes(classFilter);
    const matchesPayment = paymentFilter === "all" || student.payment_status === paymentFilter;

    return matchesSearch && matchesClass && matchesPayment;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPaymentStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      paid: "À jour",
      partial: "Partiel",
      pending: "En attente",
      late: "En retard"
    };
    return labels[status] || status;
  };

  const handleCreate = (data: any) => {
    // Vérifier la limite d'étudiants
    if (limitInfo && !limitInfo.can_add) {
      toast.error(
        "Limite d'inscriptions atteinte",
        {
          description: `Vous avez atteint la limite de ${limitInfo.max_limit} inscriptions de votre forfait gratuit. Veuillez souscrire à un abonnement pour continuer.`,
          duration: 5000,
        }
      );
      setIsAddDialogOpen(false);
      return;
    }

    createStudent.mutate(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
      },
    });
  };

  const handleUpdate = (data: any) => {
    if (editingStudent) {
      updateStudent.mutate(
        { id: editingStudent.id, updates: data },
        {
          onSuccess: () => {
            setEditingStudent(null);
          },
        }
      );
    }
  };

  const handleDelete = () => {
    if (studentToDelete) {
      deleteStudent.mutate(studentToDelete.id, {
        onSuccess: () => {
          setStudentToDelete(null);
          setSelectedStudent(null);
        },
      });
    }
  };

  const handlePrintList = () => {
    window.print();
  };

  const handlePayment = (data: any) => {
    createPayment.mutate(data, {
      onSuccess: (payment) => {
        setPayingStudent(null);
        setLastPayment(payment);
        setShowReceipt(true);
      },
    });
  };

  // Calculate financial info for selected student
  const studentFinancialInfo = useMemo(() => {
    if (!selectedStudent) return null;

    const studentClass = classes.find(c => c.name === selectedStudent.class);
    const studentPayments = payments.filter(p => p.student_id === selectedStudent.id);
    
    const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const annualFee = Number(studentClass?.annual_tuition || 0);
    const registrationFee = Number(studentClass?.registration_fee || 0);
    const totalDue = annualFee + registrationFee;
    const balance = totalDue - totalPaid;

    return {
      totalPaid,
      annualFee,
      registrationFee,
      totalDue,
      balance,
      payments: studentPayments,
    };
  }, [selectedStudent, classes, payments]);


  return (
    <>
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print-area, .print-area * {
              visibility: visible;
            }
            .print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            @page {
              margin: 1cm;
            }
          }
        `}
      </style>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
          {/* Alert pour la limite d'inscriptions */}
          {limitInfo && limitInfo.plan === "free" && limitInfo.remaining <= 5 && (
            <Alert variant={limitInfo.remaining === 0 ? "destructive" : "default"} className="no-print">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>
                {limitInfo.remaining === 0 
                  ? "Limite d'inscriptions atteinte !" 
                  : "Attention : Limite proche"}
              </AlertTitle>
              <AlertDescription>
                {limitInfo.remaining === 0 
                  ? `Vous avez atteint la limite de ${limitInfo.max_limit} inscriptions de votre forfait gratuit. Souscrivez à un abonnement pour continuer à ajouter des élèves.`
                  : `Il vous reste ${limitInfo.remaining} inscription${limitInfo.remaining > 1 ? 's' : ''} disponible${limitInfo.remaining > 1 ? 's' : ''} sur ${limitInfo.max_limit} (Forfait gratuit).`}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 no-print">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des élèves</h1>
              <p className="text-muted-foreground">
                {filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''} · {students.length} au total
                {limitInfo && limitInfo.plan === "free" && (
                  <span className="ml-2 text-xs">
                    ({limitInfo.current_count}/{limitInfo.max_limit} inscriptions utilisées)
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {classFilter !== "all" && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handlePrintList}
                >
                  <Printer className="h-4 w-4" />
                  Imprimer la liste
                </Button>
              )}
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Exporter
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 gap-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4" />
                Nouvel élève
              </Button>
            </div>
          </div>

          {/* Guide d'utilisation */}
          <Card className="bg-primary/5 border-primary/20 no-print">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground">Comment utiliser cette page ?</h3>
                  <p className="text-sm text-muted-foreground">
                    • <strong>Consulter les élèves :</strong> Utilisez les filtres (classe, statut de paiement) et la barre de recherche pour trouver rapidement un élève.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • <strong>Payer :</strong> Cliquez sur le bouton "Payer" à côté du nom de l&apos;élève pour enregistrer un paiement rapidement.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • <strong>Imprimer une liste :</strong> Sélectionnez une classe, puis cliquez sur "Imprimer la liste" pour obtenir un document imprimable.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    • <strong>Note importante :</strong> Les élèves sont créés automatiquement lors de l&apos;approbation des inscriptions. Vous n&apos;avez normalement pas besoin d&apos;ajouter un élève manuellement.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>


        {/* Print Header - Only visible when printing */}
        <div className="print-area hidden print:block mb-8">
          <div className="text-center mb-6 pb-4 border-b-2">
            {school?.logo_url && (
              <img 
                src={school.logo_url} 
                alt="Logo" 
                className="h-16 mx-auto mb-4 object-contain"
              />
            )}
            <h1 className="text-2xl font-bold mb-2">{school?.name}</h1>
            {school?.address && <p className="text-sm">{school.address}</p>}
            <div className="flex justify-center gap-4 text-sm mt-1">
              {school?.phone && <span>Tél: {school.phone}</span>}
              {school?.email && <span>Email: {school.email}</span>}
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-4">
            LISTE DES ÉLÈVES - {classFilter !== "all" ? classFilter : "TOUTES LES CLASSES"}
          </h2>
          <p className="text-center text-sm mb-6">
            Date d'impression: {new Date().toLocaleDateString('fr-FR')} | Total: {filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''}
          </p>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="text-left py-2 px-2">N°</th>
                <th className="text-left py-2 px-2">Matricule</th>
                <th className="text-left py-2 px-2">Nom complet</th>
                <th className="text-left py-2 px-2">Classe</th>
                <th className="text-left py-2 px-2">Contact</th>
                <th className="text-left py-2 px-2">Parent/Tuteur</th>
                <th className="text-left py-2 px-2">Statut paiement</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.id} className="border-b">
                  <td className="py-2 px-2">{index + 1}</td>
                  <td className="py-2 px-2 font-mono text-sm">{student.matricule}</td>
                  <td className="py-2 px-2 font-medium">{student.full_name}</td>
                  <td className="py-2 px-2">{student.class}</td>
                  <td className="py-2 px-2 text-sm">{student.phone || '-'}</td>
                  <td className="py-2 px-2 text-sm">{student.parent_name}</td>
                  <td className="py-2 px-2 text-sm">{getPaymentStatusLabel(student.payment_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="mt-8 pt-4 border-t flex justify-between text-sm">
            <div>
              <p>Signature du responsable:</p>
              <div className="mt-8 border-t border-black w-48"></div>
            </div>
            <div className="text-right">
              <p>Cachet de l'établissement</p>
            </div>
          </div>
        </div>

        <Card className="shadow-card no-print">
          <CardHeader>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, matricule ou classe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Classe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les classes</SelectItem>
                  <SelectItem value="Terminale">Terminale</SelectItem>
                  <SelectItem value="Première">Première</SelectItem>
                  <SelectItem value="Seconde">Seconde</SelectItem>
                  <SelectItem value="Troisième">Troisième</SelectItem>
                  <SelectItem value="Quatrième">Quatrième</SelectItem>
                </SelectContent>
              </Select>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="paid">À jour</SelectItem>
                  <SelectItem value="partial">Partiel</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="late">En retard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Chargement...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {students.length === 0 ? "Aucun élève enregistré" : "Aucun résultat"}
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Élève</TableHead>
                      <TableHead className="font-semibold">Matricule</TableHead>
                      <TableHead className="font-semibold">Classe</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Paiement</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className="hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedStudent(student)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={student.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(student.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{student.full_name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-primary">{student.matricule}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell className="text-sm">{student.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {student.status === 'active' ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              student.payment_status === "paid"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : student.payment_status === "partial"
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }
                          >
                            {getPaymentStatusLabel(student.payment_status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setSelectedStudent(student)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir le profil
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => setPayingStudent(student)}
                                className="text-green-600 font-medium"
                              >
                                <Wallet className="mr-2 h-4 w-4" />
                                Procéder au paiement
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setEditingStudent(student)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => setStudentToDelete(student)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog pour ajouter un élève */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouvel élève</DialogTitle>
              <DialogDescription>
                Remplissez les informations de l'élève pour l'inscrire
              </DialogDescription>
            </DialogHeader>
            <StudentForm 
              onSubmit={handleCreate} 
              isLoading={createStudent.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog pour modifier un élève */}
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'élève</DialogTitle>
              <DialogDescription>
                Modifiez les informations de l'élève
              </DialogDescription>
            </DialogHeader>
            {editingStudent && (
              <StudentForm 
                onSubmit={handleUpdate}
                defaultValues={{
                  matricule: editingStudent.matricule,
                  full_name: editingStudent.full_name,
                  date_of_birth: editingStudent.date_of_birth,
                  class: editingStudent.class,
                  phone: editingStudent.phone || "",
                  email: editingStudent.email || "",
                  address: editingStudent.address || "",
                  parent_name: editingStudent.parent_name,
                  parent_phone: editingStudent.parent_phone,
                  parent_email: editingStudent.parent_email || "",
                }}
                isLoading={updateStudent.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog pour voir les détails */}
        <Dialog open={!!selectedStudent && !editingStudent} onOpenChange={() => setSelectedStudent(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>Profil de l'élève</DialogTitle>
                <Button
                  onClick={() => {
                    if (selectedStudent) {
                      setPayingStudent(selectedStudent);
                      setSelectedStudent(null);
                    }
                  }}
                  className="bg-primary hover:bg-primary/90 gap-2"
                  size="sm"
                >
                  <Wallet className="h-4 w-4" />
                  Effectuer un paiement
                </Button>
              </div>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedStudent.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-2xl">
                      {getInitials(selectedStudent.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{selectedStudent.full_name}</h3>
                    <p className="text-muted-foreground">{selectedStudent.class} · {selectedStudent.matricule}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Date de naissance</p>
                    <p className="font-medium">{new Date(selectedStudent.date_of_birth).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    <Badge className="bg-green-50 text-green-700 border-green-200">
                      {selectedStudent.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{selectedStudent.phone || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedStudent.email || '-'}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Adresse</p>
                    <p className="font-medium">{selectedStudent.address || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Parent/Tuteur</p>
                    <p className="font-medium">{selectedStudent.parent_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Téléphone parent</p>
                    <p className="font-medium">{selectedStudent.parent_phone}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Email parent</p>
                    <p className="font-medium">{selectedStudent.parent_email || '-'}</p>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Situation Financière
                  </h4>
                  
                  <div className="grid gap-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Frais d'inscription</p>
                        <p className="text-lg font-semibold">{studentFinancialInfo?.registrationFee.toLocaleString() || 0} FCFA</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Scolarité annuelle</p>
                        <p className="text-lg font-semibold">{studentFinancialInfo?.annualFee.toLocaleString() || 0} FCFA</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total à payer</p>
                        <p className="text-xl font-bold text-primary">{studentFinancialInfo?.totalDue.toLocaleString() || 0} FCFA</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total payé</p>
                        <p className="text-xl font-bold text-green-600">{studentFinancialInfo?.totalPaid.toLocaleString() || 0} FCFA</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${
                      (studentFinancialInfo?.balance || 0) > 0 
                        ? 'bg-red-50 dark:bg-red-950' 
                        : 'bg-green-50 dark:bg-green-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Solde restant</p>
                          <p className={`text-2xl font-bold ${
                            (studentFinancialInfo?.balance || 0) > 0 
                              ? 'text-red-700 dark:text-red-300' 
                              : 'text-green-700 dark:text-green-300'
                          }`}>
                            {studentFinancialInfo?.balance.toLocaleString() || 0} FCFA
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            selectedStudent.payment_status === "paid"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : selectedStudent.payment_status === "partial"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {getPaymentStatusLabel(selectedStudent.payment_status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Payment History */}
                  {studentFinancialInfo && studentFinancialInfo.payments.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Historique des paiements ({studentFinancialInfo.payments.length})
                      </h5>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {studentFinancialInfo.payments
                          .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
                          .map((payment) => {
                            const paymentTypeLabels: Record<string, string> = {
                              monthly_tuition: 'Scolarité mensuelle',
                              tuition: 'Scolarité',
                              registration: 'Inscription',
                              exam: 'Examens',
                              transport: 'Transport',
                              canteen: 'Cantine',
                              uniform: 'Uniforme',
                              books: 'Manuels',
                              other: 'Autre'
                            };
                            return (
                              <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg text-sm hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium">{payment.receipt_number}</p>
                                      <Badge variant="outline" className="text-xs">
                                        {paymentTypeLabels[payment.payment_type] || payment.payment_type}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(payment.payment_date).toLocaleDateString('fr-FR', { 
                                        day: '2-digit', 
                                        month: 'long', 
                                        year: 'numeric' 
                                      })}
                                      {payment.payment_period && ` • ${payment.payment_period}`}
                                    </p>
                                  </div>
                                </div>
                                <p className="font-semibold text-green-600">{Number(payment.amount).toLocaleString()} FCFA</p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {/* Message si aucun paiement */}
                  {studentFinancialInfo && studentFinancialInfo.payments.length === 0 && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
                      <CreditCard className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Aucun paiement enregistré</p>
                      <Button
                        onClick={() => {
                          if (selectedStudent) {
                            setPayingStudent(selectedStudent);
                            setSelectedStudent(null);
                          }
                        }}
                        className="mt-3 bg-primary hover:bg-primary/90 gap-2"
                        size="sm"
                      >
                        <Wallet className="h-4 w-4" />
                        Enregistrer le premier paiement
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog pour procéder au paiement */}
        {payingStudent && (
          <PaymentForm
            open={!!payingStudent}
            onOpenChange={() => setPayingStudent(null)}
            onSubmit={handlePayment}
            loading={createPayment.isPending}
            paymentData={{
              student_id: payingStudent.id,
              amount: classes.find(c => c.name === payingStudent.class)?.monthly_tuition || 0,
              payment_method: 'cash',
              payment_type: 'tuition',
              payment_date: new Date().toISOString().split('T')[0],
              payment_period: '',
              transaction_reference: '',
              notes: '',
              students: {
                full_name: payingStudent.full_name,
                matricule: payingStudent.matricule,
                class: payingStudent.class,
              },
            } as any}
          />
        )}

        {/* Reçu de paiement */}
        {lastPayment && (
          <PaymentReceipt
            open={showReceipt}
            onOpenChange={setShowReceipt}
            payment={lastPayment}
            schoolInfo={{
              name: school?.name || '',
              address: school?.address || '',
              phone: school?.phone || '',
              email: school?.email || '',
              logo_url: school?.logo_url || '',
            }}
          />
        )}

        {/* Confirmation de suppression */}
        <AlertDialog open={!!studentToDelete} onOpenChange={() => setStudentToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. L'élève {studentToDelete?.full_name} sera définitivement supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </>
  );
};

export default Students;
