import { useState } from "react";
import { Plus, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Classes = () => {
  const classes = [
    { id: 1, level: "Terminale", name: "Terminale S1", students: 42, teacher: "M. Diop", capacity: 45 },
    { id: 2, level: "Terminale", name: "Terminale S2", students: 38, teacher: "Mme Ndiaye", capacity: 45 },
    { id: 3, level: "Terminale", name: "Terminale L", students: 35, teacher: "M. Fall", capacity: 40 },
    { id: 4, level: "Première", name: "Première S1", students: 44, teacher: "Mme Sarr", capacity: 45 },
    { id: 5, level: "Première", name: "Première S2", students: 41, teacher: "M. Sow", capacity: 45 },
    { id: 6, level: "Première", name: "Première L", students: 33, teacher: "Mme Ba", capacity: 40 },
    { id: 7, level: "Seconde", name: "Seconde A", students: 45, teacher: "M. Gueye", capacity: 45 },
    { id: 8, level: "Seconde", name: "Seconde B", students: 43, teacher: "Mme Dieng", capacity: 45 },
    { id: 9, level: "Troisième", name: "Troisième A", students: 40, teacher: "M. Kane", capacity: 42 },
    { id: 10, level: "Quatrième", name: "Quatrième A", students: 38, teacher: "Mme Cissé", capacity: 42 },
  ];

  const levels = ["Terminale", "Première", "Seconde", "Troisième", "Quatrième"];
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const filteredClasses = selectedLevel
    ? classes.filter((c) => c.level === selectedLevel)
    : classes;

  const levelStats = levels.map((level) => ({
    level,
    count: classes.filter((c) => c.level === level).length,
    students: classes.filter((c) => c.level === level).reduce((sum, c) => sum + c.students, 0),
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des classes</h1>
            <p className="text-muted-foreground">Organisation des niveaux et classes</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle classe
          </Button>
        </div>

        {/* Statistiques par niveau */}
        <div className="grid gap-4 md:grid-cols-5">
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClasses.map((classItem) => {
                const occupancyRate = (classItem.students / classItem.capacity) * 100;
                return (
                  <Card
                    key={classItem.id}
                    className="hover:shadow-elegant transition-shadow duration-300 cursor-pointer"
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
                              ? "bg-red-50 text-red-700 border-red-200"
                              : occupancyRate >= 85
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {occupancyRate.toFixed(0)}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Professeur principal</span>
                        <span className="font-medium text-foreground">{classItem.teacher}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Effectif</span>
                        <span className="font-medium text-foreground">
                          {classItem.students} / {classItem.capacity}
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
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Classes;
