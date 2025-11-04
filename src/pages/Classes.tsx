import { useState } from "react";
import { Plus, Users, BookOpen, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClasses, CreateClassData, Class } from "@/hooks/useClasses";
import { ClassForm } from "@/components/classes/ClassForm";
import { useStudents } from "@/hooks/useStudents";
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

const Classes = () => {
  const { classes, isLoading, createClass, updateClass, deleteClass } = useClasses();
  const { students } = useStudents();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  const levels = ["Terminale", "Première", "Seconde", "Troisième", "Quatrième", "Cinquième", "Sixième"];

  const filteredClasses = selectedLevel
    ? classes.filter((c) => c.level === selectedLevel)
    : classes;

  // Calculate student count per class
  const getStudentCount = (className: string) => {
    return students.filter(s => s.class === className).length;
  };

  const levelStats = levels.map((level) => {
    const levelClasses = classes.filter((c) => c.level === level);
    const totalStudents = levelClasses.reduce((sum, c) => sum + getStudentCount(c.name), 0);
    return {
      level,
      count: levelClasses.length,
      students: totalStudents,
    };
  });

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des classes</h1>
            <p className="text-muted-foreground">Organisation des niveaux et classes</p>
          </div>
          <Button
            className="bg-gradient-primary hover:opacity-90 transition-opacity"
            onClick={() => setFormOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle classe
          </Button>
        </div>

        {/* Statistiques par niveau */}
        <div className="grid gap-4 md:grid-cols-5 lg:grid-cols-7">
          {levelStats.map((stat) => (
            <Card
              key={stat.level}
              className={`shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer ${
                selectedLevel === stat.level ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedLevel(selectedLevel === stat.level ? null : stat.level)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.level}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="text-2xl font-bold text-foreground">{stat.count}</span>
                    <span className="text-sm text-muted-foreground">classes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    <span className="text-lg font-semibold text-foreground">{stat.students}</span>
                    <span className="text-xs text-muted-foreground">élèves</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Liste des classes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">
              {selectedLevel ? `Classes de ${selectedLevel}` : "Toutes les classes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredClasses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune classe trouvée</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer la première classe
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClasses.map((classItem) => {
                  const studentCount = getStudentCount(classItem.name);
                  const occupancyRate = (studentCount / classItem.capacity) * 100;
                  return (
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
                              occupancyRate >= 95
                                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300"
                                : occupancyRate >= 85
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300"
                                : "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300"
                            }
                          >
                            {occupancyRate.toFixed(0)}%
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {classItem.teacher_name && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Professeur principal</span>
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
                            {studentCount} / {classItem.capacity}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              occupancyRate >= 95
                                ? "bg-red-500"
                                : occupancyRate >= 85
                                ? "bg-yellow-500"
                                : "bg-gradient-primary"
                            }`}
                            style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
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
                      </CardContent>
                    </Card>
                  );
                })}
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
    </div>
  );
};

export default Classes;
