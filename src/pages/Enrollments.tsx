import { useState } from "react";
import { UserPlus, RefreshCw, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Enrollments = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const newEnrollments = [
    { id: 1, name: "Ousmane Diallo", class: "Sixième A", date: "20/01/2025", status: "En attente", amount: "150,000 FCFA" },
    { id: 2, name: "Khady Mbaye", class: "Cinquième B", date: "19/01/2025", status: "Validé", amount: "140,000 FCFA" },
    { id: 3, name: "Mamadou Sy", class: "Terminale S", date: "18/01/2025", status: "Documents manquants", amount: "180,000 FCFA" },
  ];

  const reEnrollments = [
    { id: 1, name: "Aminata Diop", prevClass: "Première L", newClass: "Terminale L", date: "15/01/2025", status: "Validé" },
    { id: 2, name: "Moussa Sow", prevClass: "Première S", newClass: "Terminale S", date: "14/01/2025", status: "En attente" },
    { id: 3, name: "Fatou Ndiaye", prevClass: "Seconde A", newClass: "Première S", date: "13/01/2025", status: "Validé" },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "Validé") {
      return <Badge className="bg-green-50 text-green-700 border-green-200">Validé</Badge>;
    } else if (status === "En attente") {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Inscriptions & Réinscriptions</h1>
            <p className="text-muted-foreground">Gestion des nouvelles inscriptions et réinscriptions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Réinscription groupée
            </Button>
            <Button className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2">
              <UserPlus className="h-4 w-4" />
              Nouvelle inscription
            </Button>
          </div>
        </div>

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="new">Nouvelles inscriptions</TabsTrigger>
            <TabsTrigger value="re-enrollment">Réinscriptions</TabsTrigger>
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
                        <TableHead className="font-semibold">Nom de l'élève</TableHead>
                        <TableHead className="font-semibold">Classe demandée</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Montant</TableHead>
                        <TableHead className="font-semibold">Statut</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {newEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{enrollment.name}</TableCell>
                          <TableCell>{enrollment.class}</TableCell>
                          <TableCell>{enrollment.date}</TableCell>
                          <TableCell className="font-semibold text-primary">{enrollment.amount}</TableCell>
                          <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Voir détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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
                        <TableHead className="font-semibold">Nom de l'élève</TableHead>
                        <TableHead className="font-semibold">Classe actuelle</TableHead>
                        <TableHead className="font-semibold">Nouvelle classe</TableHead>
                        <TableHead className="font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Statut</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">{enrollment.name}</TableCell>
                          <TableCell>{enrollment.prevClass}</TableCell>
                          <TableCell className="font-semibold text-primary">{enrollment.newClass}</TableCell>
                          <TableCell>{enrollment.date}</TableCell>
                          <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              Voir détails
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Enrollments;
