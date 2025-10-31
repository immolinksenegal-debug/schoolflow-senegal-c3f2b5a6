import { useState } from "react";
import { Search, UserPlus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const students = [
    { id: "MAT001", name: "Aminata Diop", class: "Terminale S", status: "Actif", payment: "À jour", phone: "77 123 45 67" },
    { id: "MAT002", name: "Moussa Sow", class: "Seconde A", status: "Actif", payment: "Partiel", phone: "76 234 56 78" },
    { id: "MAT003", name: "Fatou Ndiaye", class: "Première L", status: "Actif", payment: "À jour", phone: "78 345 67 89" },
    { id: "MAT004", name: "Ibrahima Fall", class: "Troisième", status: "Actif", payment: "En retard", phone: "77 456 78 90" },
    { id: "MAT005", name: "Aïssatou Ba", class: "Terminale L", status: "Actif", payment: "À jour", phone: "76 567 89 01" },
    { id: "MAT006", name: "Cheikh Dieng", class: "Première S", status: "Actif", payment: "À jour", phone: "78 678 90 12" },
    { id: "MAT007", name: "Mariama Sarr", class: "Seconde B", status: "Actif", payment: "Partiel", phone: "77 789 01 23" },
    { id: "MAT008", name: "Omar Gueye", class: "Quatrième", status: "Actif", payment: "En retard", phone: "76 890 12 34" },
  ];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Gestion des élèves</h1>
            <p className="text-muted-foreground">Liste complète des élèves inscrits</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <UserPlus className="mr-2 h-4 w-4" />
            Nouvel élève
          </Button>
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
                    <TableHead className="font-semibold">Matricule</TableHead>
                    <TableHead className="font-semibold">Nom complet</TableHead>
                    <TableHead className="font-semibold">Classe</TableHead>
                    <TableHead className="font-semibold">Téléphone</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Paiement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <TableCell className="font-medium text-primary">{student.id}</TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            student.payment === "À jour"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : student.payment === "Partiel"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-red-50 text-red-700 border-red-200"
                          }
                        >
                          {student.payment}
                        </Badge>
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

export default Students;
