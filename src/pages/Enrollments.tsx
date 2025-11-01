import { useState } from "react";
import { UserPlus, RefreshCw, Search, Filter, Eye, Check, X, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Textarea } from "@/components/ui/textarea";
import StatCard from "@/components/StatCard";

const Enrollments = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewEnrollmentOpen, setIsNewEnrollmentOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);

  const stats = [
    { title: "Nouvelles inscriptions", value: "45", icon: UserPlus, description: "Cette année" },
    { title: "Réinscriptions", value: "312", icon: RefreshCw, description: "Élèves actuels" },
    { title: "En attente", value: "8", icon: FileText },
  ];

  const newEnrollments: any[] = [];

  const reEnrollments: any[] = [];

  const getStatusBadge = (status: string) => {
    if (status === "Validé") {
      return <Badge className="bg-green-50 text-green-700 border-green-200">✓ Validé</Badge>;
    } else if (status === "En attente") {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">⏳ En attente</Badge>;
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200">⚠ {status}</Badge>;
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
            <TabsTrigger value="new">Nouvelles inscriptions ({newEnrollments.length})</TabsTrigger>
            <TabsTrigger value="re-enrollment">Réinscriptions ({reEnrollments.length})</TabsTrigger>
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
                  <Select>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="waiting">En attente</SelectItem>
                      <SelectItem value="validated">Validé</SelectItem>
                      <SelectItem value="missing">Documents manquants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold">Nom de l'élève</TableHead>
                        <TableHead className="font-semibold">Contact</TableHead>
                        <TableHead className="font-semibold">Parent/Tuteur</TableHead>
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
                          <TableCell className="text-sm">{enrollment.phone}</TableCell>
                          <TableCell className="text-sm">{enrollment.parent}</TableCell>
                          <TableCell>{enrollment.class}</TableCell>
                          <TableCell className="text-sm">{enrollment.date}</TableCell>
                          <TableCell className="font-semibold text-primary">{enrollment.amount}</TableCell>
                          <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedEnrollment(enrollment)}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Détails
                              </Button>
                              {enrollment.status === "En attente" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
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
                </div>
              </CardHeader>
              <CardContent>
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
                      {reEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium text-primary">{enrollment.matricule}</TableCell>
                          <TableCell className="font-medium">{enrollment.name}</TableCell>
                          <TableCell>{enrollment.prevClass}</TableCell>
                          <TableCell className="font-semibold text-accent">{enrollment.newClass}</TableCell>
                          <TableCell className="text-sm">{enrollment.date}</TableCell>
                          <TableCell className="font-semibold">{enrollment.amount}</TableCell>
                          <TableCell>{getStatusBadge(enrollment.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Détails
                              </Button>
                              {enrollment.status === "En attente" && (
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <Check className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
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

        {/* Dialog nouvelle inscription */}
        <Dialog open={isNewEnrollmentOpen} onOpenChange={setIsNewEnrollmentOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nouvelle inscription</DialogTitle>
              <DialogDescription>
                Enregistrez les informations du nouvel élève
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom complet *</Label>
                  <Input placeholder="Ex: Ousmane Diallo" />
                </div>
                <div className="space-y-2">
                  <Label>Date de naissance *</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input placeholder="77 123 45 67" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="eleve@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input placeholder="Quartier, Ville" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom du parent/tuteur *</Label>
                  <Input placeholder="M. ou Mme..." />
                </div>
                <div className="space-y-2">
                  <Label>Téléphone parent *</Label>
                  <Input placeholder="77 987 65 43" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Classe demandée *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sixieme">Sixième</SelectItem>
                      <SelectItem value="cinquieme">Cinquième</SelectItem>
                      <SelectItem value="quatrieme">Quatrième</SelectItem>
                      <SelectItem value="troisieme">Troisième</SelectItem>
                      <SelectItem value="seconde">Seconde</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Montant d'inscription</Label>
                  <Input placeholder="150,000 FCFA" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Documents requis</Label>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Upload className="h-4 w-4" />
                    Photo d'identité
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Upload className="h-4 w-4" />
                    Extrait de naissance
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Upload className="h-4 w-4" />
                    Relevé de notes
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Textarea placeholder="Informations complémentaires..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewEnrollmentOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90">
                Enregistrer l'inscription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog détails inscription */}
        <Dialog open={!!selectedEnrollment} onOpenChange={() => setSelectedEnrollment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de l'inscription</DialogTitle>
            </DialogHeader>
            {selectedEnrollment && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Nom complet</p>
                    <p className="font-semibold text-lg">{selectedEnrollment.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Statut</p>
                    {getStatusBadge(selectedEnrollment.status)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Téléphone</p>
                    <p className="font-medium">{selectedEnrollment.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Parent/Tuteur</p>
                    <p className="font-medium">{selectedEnrollment.parent}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Classe</p>
                    <p className="font-medium">{selectedEnrollment.class}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Montant</p>
                    <p className="font-semibold text-primary">{selectedEnrollment.amount}</p>
                  </div>
                </div>
                {selectedEnrollment.documents && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold">Documents fournis</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Photo d'identité</span>
                        {selectedEnrollment.documents.photo ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Extrait de naissance</span>
                        {selectedEnrollment.documents.birth ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">Relevé de notes</span>
                        {selectedEnrollment.documents.transcript ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEnrollment(null)}>
                Fermer
              </Button>
              {selectedEnrollment?.status === "En attente" && (
                <Button className="bg-green-600 hover:bg-green-700">
                  <Check className="h-4 w-4 mr-2" />
                  Valider l'inscription
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Enrollments;
