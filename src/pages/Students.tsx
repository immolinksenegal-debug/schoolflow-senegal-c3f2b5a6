import { useState } from "react";
import { Search, UserPlus, Filter, Download, Eye, Edit, Trash2, MoreHorizontal } from "lucide-react";
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
import { useStudents } from "@/hooks/useStudents";
import { StudentForm } from "@/components/StudentForm";
import type { Database } from "@/integrations/supabase/types";

type Student = Database['public']['Tables']['students']['Row'];

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

  const { students, isLoading, createStudent, updateStudent, deleteStudent } = useStudents();

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

  const getPaymentBadge = (status: string) => {
    const badges = {
      up_to_date: { label: "À jour", className: "bg-green-50 text-green-700 border-green-200" },
      partial: { label: "Partiel", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      late: { label: "En retard", className: "bg-red-50 text-red-700 border-red-200" },
      pending: { label: "En attente", className: "bg-gray-50 text-gray-700 border-gray-200" },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    return <Badge variant="outline" className={badge.className}>{badge.label}</Badge>;
  };

  const handleCreateStudent = (data: any) => {
    createStudent.mutate(
      {
        ...data,
        status: 'active',
        payment_status: 'pending',
      },
      {
        onSuccess: () => {
          setIsAddDialogOpen(false);
        },
      }
    );
  };

  const handleUpdateStudent = (data: any) => {
    if (!selectedStudent) return;
    updateStudent.mutate(
      { id: selectedStudent.id, updates: data },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedStudent(null);
        },
      }
    );
  };

  const handleDeleteStudent = () => {
    if (!studentToDelete) return;
    deleteStudent.mutate(studentToDelete, {
      onSuccess: () => {
        setStudentToDelete(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des élèves</h1>
            <p className="text-muted-foreground">
              {filteredStudents.length} élève{filteredStudents.length > 1 ? 's' : ''} 
              {students.length !== filteredStudents.length && ` · ${students.length} au total`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Nouvel élève
            </Button>
          </div>
        </div>

        <Card className="shadow-card">
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
                  <SelectItem value="up_to_date">À jour</SelectItem>
                  <SelectItem value="partial">Partiel</SelectItem>
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
                {searchQuery || classFilter !== "all" || paymentFilter !== "all" 
                  ? "Aucun élève trouvé avec ces critères" 
                  : "Aucun élève enregistré. Ajoutez votre premier élève !"}
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
                      <TableHead className="font-semibold">Parent</TableHead>
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
                              <AvatarImage src={student.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {getInitials(student.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{student.full_name}</p>
                              <p className="text-xs text-muted-foreground">{student.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-primary">{student.matricule}</TableCell>
                        <TableCell>{student.class}</TableCell>
                        <TableCell className="text-sm">{student.phone || '-'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-medium">{student.parent_name}</p>
                            <p className="text-muted-foreground">{student.parent_phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPaymentBadge(student.payment_status)}
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
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(student);
                                setIsEditDialogOpen(true);
                              }}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setStudentToDelete(student.id);
                                }}
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
              onSubmit={handleCreateStudent}
              isLoading={createStudent.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Dialog pour modifier un élève */}
        <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setSelectedStudent(null);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier l'élève</DialogTitle>
              <DialogDescription>
                Mettez à jour les informations de l'élève
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <StudentForm 
                onSubmit={handleUpdateStudent}
                defaultValues={{
                  matricule: selectedStudent.matricule,
                  full_name: selectedStudent.full_name,
                  date_of_birth: selectedStudent.date_of_birth,
                  class: selectedStudent.class,
                  phone: selectedStudent.phone || "",
                  email: selectedStudent.email || "",
                  address: selectedStudent.address || "",
                  parent_name: selectedStudent.parent_name,
                  parent_phone: selectedStudent.parent_phone,
                  parent_email: selectedStudent.parent_email || "",
                }}
                isLoading={updateStudent.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog pour voir les détails */}
        <Dialog open={!!selectedStudent && !isEditDialogOpen} onOpenChange={(open) => {
          if (!open) setSelectedStudent(null);
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Profil de l'élève</DialogTitle>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedStudent.avatar_url || undefined} />
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
                    <p className="text-sm text-muted-foreground">Statut de paiement</p>
                    {getPaymentBadge(selectedStudent.payment_status)}
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
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Informations parent/tuteur</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nom</p>
                      <p className="font-medium">{selectedStudent.parent_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Téléphone</p>
                      <p className="font-medium">{selectedStudent.parent_phone}</p>
                    </div>
                    {selectedStudent.parent_email && (
                      <div className="space-y-1 col-span-2">
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedStudent.parent_email}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Alert Dialog pour confirmer la suppression */}
        <AlertDialog open={!!studentToDelete} onOpenChange={(open) => {
          if (!open) setStudentToDelete(null);
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteStudent}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Students;