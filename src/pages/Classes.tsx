import { useState, useMemo } from "react";
import { Plus, Users, BookOpen, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useClasses, Class } from "@/hooks/useClasses";
import { useStudents } from "@/hooks/useStudents";
import { ClassForm } from "@/components/classes/ClassForm";
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>();
  const [deletingClass, setDeletingClass] = useState<Class | undefined>();

  const levels = ["Terminale", "Première", "Seconde", "Troisième", "Quatrième", "Cinquième", "Sixième"];
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  // Calculate students per class
  const classesWithStudents = useMemo(() => {
    return classes.map(classItem => {
      const studentCount = students.filter(s => s.class === classItem.name).length;
      return { ...classItem, studentCount };
    });
  }, [classes, students]);

  const filteredClasses = selectedLevel
    ? classesWithStudents.filter((c) => c.level === selectedLevel)
    : classesWithStudents;

  const levelStats = levels.map((level) => ({
    level,
    count: classesWithStudents.filter((c) => c.level === level).length,
    students: classesWithStudents
      .filter((c) => c.level === level)
      .reduce((sum, c) => sum + c.studentCount, 0),
  }));

  const handleCreateClass = async (data: any) => {
    await createClass.mutateAsync(data);
    setIsFormOpen(false);
  };

  const handleUpdateClass = async (data: any) => {
    if (!editingClass) return;
    await updateClass.mutateAsync({ id: editingClass.id, ...data });
    setEditingClass(undefined);
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    await deleteClass.mutateAsync(deletingClass.id);
    setDeletingClass(undefined);
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
            onClick={() => setIsFormOpen(true)}
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
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aucune classe trouvée</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsFormOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Créer votre première classe
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredClasses.map((classItem) => {
                  const occupancyRate = classItem.capacity > 0 
                    ? (classItem.studentCount / classItem.capacity) * 100 
                    : 0;
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
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : occupancyRate >= 85
                                ? "bg-accent/10 text-accent-foreground border-accent/20"
                                : "bg-primary/10 text-primary border-primary/20"
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
                            {classItem.studentCount} / {classItem.capacity}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              occupancyRate >= 95
                                ? "bg-destructive"
                                : occupancyRate >= 85
                                ? "bg-accent"
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
                            onClick={() => setEditingClass(classItem)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeletingClass(classItem)}
                          >
                            <Trash2 className="h-3 w-3" />
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
        open={isFormOpen || !!editingClass}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingClass(undefined);
        }}
        onSubmit={editingClass ? handleUpdateClass : handleCreateClass}
        initialData={editingClass}
        isLoading={createClass.isPending || updateClass.isPending}
      />

      <AlertDialog open={!!deletingClass} onOpenChange={() => setDeletingClass(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la classe "{deletingClass?.name}" ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
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
