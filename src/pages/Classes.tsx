import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, BookOpen, Pencil, Trash2, UserCog, DollarSign, Search, Grid, Table as TableIcon, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useClasses, CreateClassData, Class } from "@/hooks/useClasses";
import { ClassForm } from "@/components/classes/ClassForm";
import { useStudents } from "@/hooks/useStudents";
import { usePayments } from "@/hooks/usePayments";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Classes = () => {
  const navigate = useNavigate();
  const { classes, isLoading, createClass, updateClass, deleteClass } = useClasses();
  const { students } = useStudents();
  const { payments } = usePayments();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState<string | null>(null);

  const levels = ["Terminale", "Première", "Seconde", "Troisième", "Quatrième", "Cinquième", "Sixième"];

  // Calculate student count per class
  const getStudentCount = (className: string) => {
    return students.filter(s => s.class === className).length;
  };

  // Calculate total payments per class
  const getClassPayments = (className: string) => {
    const classStudents = students.filter(s => s.class === className);
    const studentIds = classStudents.map(s => s.id);
    return payments
      .filter(p => studentIds.includes(p.student_id))
      .reduce((sum, p) => sum + Number(p.amount), 0);
  };

  // Enhanced class data with statistics
  const enrichedClasses = useMemo(() => {
    return classes.map((classItem) => {
      const studentCount = getStudentCount(classItem.name);
      const totalPayments = getClassPayments(classItem.name);
      const occupancyRate = (studentCount / classItem.capacity) * 100;
      const expectedRevenue = studentCount * (Number(classItem.registration_fee || 0) + Number(classItem.annual_tuition || 0));
      
      return {
        ...classItem,
        studentCount,
        totalPayments,
        occupancyRate,
        expectedRevenue,
      };
    });
  }, [classes, students, payments]);

  const filteredClasses = enrichedClasses.filter((c) => {
    const matchesLevel = selectedLevel ? c.level === selectedLevel : true;
    const matchesSearch = searchQuery
      ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.teacher_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.room_number?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesLevel && matchesSearch;
  });

  const levelStats = useMemo(() => {
    return levels.map((level) => {
      const levelClasses = enrichedClasses.filter((c) => c.level === level);
      const totalStudents = levelClasses.reduce((sum, c) => sum + c.studentCount, 0);
      const totalRevenue = levelClasses.reduce((sum, c) => sum + c.totalPayments, 0);
      const totalCapacity = levelClasses.reduce((sum, c) => sum + c.capacity, 0);
      return {
        level,
        count: levelClasses.length,
        students: totalStudents,
        revenue: totalRevenue,
        capacity: totalCapacity,
      };
    });
  }, [enrichedClasses]);

  const totalStats = useMemo(() => {
    return {
      totalClasses: classes.length,
      totalStudents: enrichedClasses.reduce((sum, c) => sum + c.studentCount, 0),
      totalCapacity: enrichedClasses.reduce((sum, c) => sum + c.capacity, 0),
      totalRevenue: enrichedClasses.reduce((sum, c) => sum + c.totalPayments, 0),
      totalExpected: enrichedClasses.reduce((sum, c) => sum + c.expectedRevenue, 0),
    };
  }, [enrichedClasses]);

  const handleCreateClass = (data: CreateClassData) => {
    createClass.mutate(data, {
      onSuccess: () => {
        setFormOpen(false);
      },
    });
  };

  const handleUpdateClass = (data: CreateClassData) => {
    if (!editingClass) return;
    updateClass.mutate(
      { id: editingClass.id, ...data },
      {
        onSuccess: () => {
          setFormOpen(false);
          setEditingClass(undefined);
        },
      }
    );
  };

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem);
    setFormOpen(true);
  };

  const handleDeleteClick = (classId: string) => {
    setClassToDelete(classId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (classToDelete) {
      deleteClass.mutate(classToDelete, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setClassToDelete(null);
        },
      });
    }
  };

  const handleFormOpenChange = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingClass(undefined);
    }
  };

  const handleShowStudents = (className: string) => {
    setSelectedClassForStudents(className);
    setStudentsDialogOpen(true);
  };

  const classStudents = useMemo(() => {
    if (!selectedClassForStudents) return [];
    return students.filter(s => s.class === selectedClassForStudents);
  }, [selectedClassForStudents, students]);

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
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des classes</h1>
            <p className="text-muted-foreground">
              {totalStats.totalClasses} classes • {totalStats.totalStudents} élèves • {totalStats.totalCapacity} places
            </p>
          </div>
          <Button
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle classe
          </Button>
        </div>

        {/* Global Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalStats.totalClasses}</div>
              <p className="text-xs text-muted-foreground mt-1">Sur tous les niveaux</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Élèves inscrits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Taux d'occupation: {((totalStats.totalStudents / totalStats.totalCapacity) * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenus collectés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {totalStats.totalRevenue.toLocaleString()} F
              </div>
              <p className="text-xs text-muted-foreground mt-1">Paiements reçus</p>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Revenus attendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {totalStats.totalExpected.toLocaleString()} F
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recouvrement: {totalStats.totalExpected > 0 ? ((totalStats.totalRevenue / totalStats.totalExpected) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistiques par niveau */}
        <div className="grid gap-3 md:grid-cols-4 lg:grid-cols-7">
          {levelStats.map((stat) => (
            <Card
              key={stat.level}
              className={`shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer ${
                selectedLevel === stat.level ? "ring-2 ring-primary bg-accent/5" : ""
              }`}
              onClick={() => setSelectedLevel(selectedLevel === stat.level ? null : stat.level)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  {stat.level}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-primary" />
                  <span className="text-xl font-bold text-foreground">{stat.count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 text-accent" />
                  <span className="text-sm font-semibold text-foreground">{stat.students}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.revenue.toLocaleString()} F
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters and Search */}
        <Card className="shadow-card">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, professeur ou salle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedLevel || "all"} onValueChange={(value) => setSelectedLevel(value === "all" ? null : value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Tous les niveaux" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les niveaux</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "table" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Classes List/Table */}
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-foreground">
                  {selectedLevel ? `Classes de ${selectedLevel}` : "Liste des classes"}
                </CardTitle>
                <CardDescription>
                  {filteredClasses.length} classe{filteredClasses.length > 1 ? "s" : ""} trouvée{filteredClasses.length > 1 ? "s" : ""}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedLevel ? "Aucune classe ne correspond à vos critères" : "Aucune classe créée"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer une classe
                </Button>
              </div>
            ) : viewMode === "table" ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Classe</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>Professeur</TableHead>
                      <TableHead>Salle</TableHead>
                      <TableHead className="text-center">Effectif</TableHead>
                      <TableHead className="text-center">Occupation</TableHead>
                      <TableHead className="text-right">Frais inscription</TableHead>
                      <TableHead className="text-right">Scolarité annuelle</TableHead>
                      <TableHead className="text-right">Revenus collectés</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClasses.map((classItem) => (
                      <TableRow key={classItem.id} className="hover:bg-accent/5">
                        <TableCell className="font-medium">{classItem.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{classItem.level}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {classItem.teacher_name || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {classItem.room_number || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-medium">{classItem.studentCount}</span>
                            <span className="text-xs text-muted-foreground">/ {classItem.capacity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge
                              variant="outline"
                              className={
                                classItem.occupancyRate >= 95
                                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"
                                  : classItem.occupancyRate >= 85
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300"
                                  : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
                              }
                            >
                              {classItem.occupancyRate.toFixed(0)}%
                            </Badge>
                            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  classItem.occupancyRate >= 95
                                    ? "bg-red-500"
                                    : classItem.occupancyRate >= 85
                                    ? "bg-yellow-500"
                                    : "bg-gradient-primary"
                                }`}
                                style={{ width: `${Math.min(classItem.occupancyRate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(classItem.registration_fee || 0).toLocaleString()} F
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {Number(classItem.annual_tuition || 0).toLocaleString()} F
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {classItem.totalPayments.toLocaleString()} F
                            </span>
                            <span className="text-xs text-muted-foreground">
                              / {classItem.expectedRevenue.toLocaleString()} F
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => navigate(`/students?class=${encodeURIComponent(classItem.name)}`)}
                              title="Élèves"
                            >
                              <Users className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleShowStudents(classItem.name)}
                              title="Paiements"
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(classItem)}
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(classItem.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClasses.map((classItem) => (
                  <Card
                    key={classItem.id}
                    className="hover:shadow-elegant transition-shadow duration-300"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-foreground">
                          {classItem.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={
                            classItem.occupancyRate >= 95
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"
                              : classItem.occupancyRate >= 85
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300"
                              : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
                          }
                        >
                          {classItem.occupancyRate.toFixed(0)}%
                        </Badge>
                      </div>
                      <Badge variant="outline" className="w-fit">{classItem.level}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {classItem.teacher_name && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Professeur</span>
                          <span className="font-medium text-foreground">{classItem.teacher_name}</span>
                        </div>
                      )}
                      {classItem.room_number && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Salle</span>
                          <span className="font-medium text-foreground">{classItem.room_number}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Effectif</span>
                        <span className="font-medium text-foreground">
                          {classItem.studentCount} / {classItem.capacity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Revenus</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {classItem.totalPayments.toLocaleString()} F
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            classItem.occupancyRate >= 95
                              ? "bg-red-500"
                              : classItem.occupancyRate >= 85
                              ? "bg-yellow-500"
                              : "bg-gradient-primary"
                          }`}
                          style={{ width: `${Math.min(classItem.occupancyRate, 100)}%` }}
                        />
                      </div>
                      <div className="space-y-2 pt-2">
                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 bg-primary hover:bg-primary/90"
                            onClick={() => navigate(`/students?class=${encodeURIComponent(classItem.name)}`)}
                          >
                            <UserCog className="h-4 w-4 mr-1" />
                            Élèves
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1 bg-gradient-primary hover:opacity-90"
                            onClick={() => handleShowStudents(classItem.name)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Paiements
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleEdit(classItem)}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(classItem.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ClassForm
        open={formOpen}
        onOpenChange={handleFormOpenChange}
        onSubmit={editingClass ? handleUpdateClass : handleCreateClass}
        classData={editingClass}
        loading={createClass.isPending || updateClass.isPending}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette classe ? Cette action est irréversible.
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

      <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Élèves de {selectedClassForStudents}</DialogTitle>
            <DialogDescription>
              {classStudents.length} élève{classStudents.length > 1 ? "s" : ""} inscrit{classStudents.length > 1 ? "s" : ""} dans cette classe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {classStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Aucun élève inscrit dans cette classe</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {classStudents.map((student) => {
                  const studentPayments = payments.filter(p => p.student_id === student.id);
                  const totalPaid = studentPayments.reduce((sum, p) => sum + Number(p.amount), 0);
                  
                  return (
                    <Card key={student.id} className="hover:shadow-elegant transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-semibold text-lg text-foreground">{student.full_name}</h3>
                                <p className="text-sm text-muted-foreground">Matricule: {student.matricule}</p>
                              </div>
                              <Badge 
                                variant="outline"
                                className={
                                  student.payment_status === "paid"
                                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
                                    : student.payment_status === "partial"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300"
                                    : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"
                                }
                              >
                                {student.payment_status === "paid" ? "À jour" : student.payment_status === "partial" ? "Partiel" : "En attente"}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="h-4 w-4" />
                                <span>{student.parent_phone}</span>
                              </div>
                              {student.parent_email && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Mail className="h-4 w-4" />
                                  <span>{student.parent_email}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{student.parent_name}</span>
                              </div>
                              {student.address && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate">{student.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="md:w-48 flex flex-col gap-2">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Payé:</span>
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                  {totalPaid.toLocaleString()} F
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Paiements:</span>
                                <span className="font-medium text-foreground">{studentPayments.length}</span>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setStudentsDialogOpen(false);
                                navigate(`/students?id=${student.id}`);
                              }}
                            >
                              Voir détails
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Classes;
