import { useState } from "react";
import { FileText, Download, Plus, Eye, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/StatCard";

const Certificates = () => {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");

  const stats = [
    { title: "Certificats générés", value: "156", icon: FileText, description: "Cette année" },
    { title: "En attente", value: "8", icon: FileText },
    { title: "Ce mois", value: "23", icon: FileText, trend: { value: 15, isPositive: true } },
  ];

  const certificates = [
    { 
      id: 1, 
      type: "Certificat de scolarité", 
      student: "Aminata Diop", 
      matricule: "MAT001",
      class: "Terminale S", 
      date: "20/01/2025", 
      status: "Généré",
      generatedBy: "Admin Principal",
      fileName: "cert_scolarite_MAT001_2025.pdf"
    },
    { 
      id: 2, 
      type: "Attestation d'inscription", 
      student: "Moussa Sow", 
      matricule: "MAT002",
      class: "Seconde A", 
      date: "19/01/2025", 
      status: "Généré",
      generatedBy: "Admin Principal",
      fileName: "attestation_inscription_MAT002_2025.pdf"
    },
    { 
      id: 3, 
      type: "Certificat de scolarité", 
      student: "Fatou Ndiaye", 
      matricule: "MAT003",
      class: "Première L", 
      date: "18/01/2025", 
      status: "Généré",
      generatedBy: "Secrétariat",
      fileName: "cert_scolarite_MAT003_2025.pdf"
    },
    { 
      id: 4, 
      type: "Relevé de notes", 
      student: "Ibrahima Fall", 
      matricule: "MAT004",
      class: "Troisième", 
      date: "17/01/2025", 
      status: "En attente",
      generatedBy: "-",
      fileName: "-"
    },
  ];

  const documentTypes = [
    { 
      id: "scolarite",
      name: "Certificat de scolarité", 
      description: "Atteste que l'élève est inscrit et suit régulièrement les cours", 
      icon: "📜",
      fields: ["Nom", "Classe", "Année scolaire", "Signature"]
    },
    { 
      id: "inscription",
      name: "Attestation d'inscription", 
      description: "Confirme l'inscription de l'élève pour l'année en cours", 
      icon: "📋",
      fields: ["Nom", "Classe", "Date d'inscription", "Montant"]
    },
    { 
      id: "paiement",
      name: "Reçu de paiement", 
      description: "Justificatif de paiement des frais de scolarité", 
      icon: "🧾",
      fields: ["Nom", "Montant", "Période", "Mode de paiement"]
    },
    { 
      id: "notes",
      name: "Relevé de notes", 
      description: "Document officiel des notes de l'élève", 
      icon: "📊",
      fields: ["Nom", "Classe", "Trimestre", "Matières et notes"]
    },
    { 
      id: "presence",
      name: "Attestation de présence", 
      description: "Confirme la présence régulière de l'élève", 
      icon: "✅",
      fields: ["Nom", "Classe", "Période", "Taux de présence"]
    },
    { 
      id: "bonne_conduite",
      name: "Certificat de bonne conduite", 
      description: "Atteste du bon comportement de l'élève", 
      icon: "🏆",
      fields: ["Nom", "Classe", "Année scolaire", "Observations"]
    },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "Généré") {
      return <Badge className="bg-green-50 text-green-700 border-green-200">✓ Généré</Badge>;
    } else {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">⏳ En attente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Certificats & Documents</h1>
            <p className="text-muted-foreground">Génération et gestion des documents officiels</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Modèles
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Générer un document
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map((docType) => (
            <Card 
              key={docType.id} 
              className="shadow-card hover:shadow-elegant transition-all duration-300 cursor-pointer group"
              onClick={() => {
                setSelectedType(docType.id);
                setIsGenerateDialogOpen(true);
              }}
            >
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="text-4xl group-hover:scale-110 transition-transform">{docType.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="text-lg text-foreground mb-1">{docType.name}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">{docType.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Informations requises:</p>
                  <div className="flex flex-wrap gap-1">
                    {docType.fields.slice(0, 3).map((field, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                    {docType.fields.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{docType.fields.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full gap-2 mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedType(docType.id);
                    setIsGenerateDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Générer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Documents récents</CardTitle>
              <Select>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="scolarite">Certificats</SelectItem>
                  <SelectItem value="attestations">Attestations</SelectItem>
                  <SelectItem value="releves">Relevés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Type de document</TableHead>
                    <TableHead className="font-semibold">Élève</TableHead>
                    <TableHead className="font-semibold">Classe</TableHead>
                    <TableHead className="font-semibold">Date de génération</TableHead>
                    <TableHead className="font-semibold">Généré par</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{cert.type}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{cert.student}</p>
                          <p className="text-xs text-muted-foreground">{cert.matricule}</p>
                        </div>
                      </TableCell>
                      <TableCell>{cert.class}</TableCell>
                      <TableCell className="text-sm">{cert.date}</TableCell>
                      <TableCell className="text-sm">{cert.generatedBy}</TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {cert.status === "Généré" ? (
                            <>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Eye className="h-3 w-3" />
                                Voir
                              </Button>
                              <Button size="sm" variant="outline" className="gap-1">
                                <Download className="h-3 w-3" />
                                PDF
                              </Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline">
                              Générer
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

        {/* Dialog génération document */}
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Générer un document officiel</DialogTitle>
              <DialogDescription>
                Sélectionnez l'élève et les informations nécessaires
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Type de document *</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Élève concerné *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Rechercher un élève..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mat001">MAT001 - Aminata Diop (Terminale S)</SelectItem>
                    <SelectItem value="mat002">MAT002 - Moussa Sow (Seconde A)</SelectItem>
                    <SelectItem value="mat003">MAT003 - Fatou Ndiaye (Première L)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Année scolaire</Label>
                  <Input value="2024-2025" />
                </div>
                <div className="space-y-2">
                  <Label>Date d'émission</Label>
                  <Input type="date" />
                </div>
              </div>
              {selectedType === "notes" && (
                <div className="space-y-2">
                  <Label>Période/Trimestre</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="t1">Trimestre 1</SelectItem>
                      <SelectItem value="t2">Trimestre 2</SelectItem>
                      <SelectItem value="t3">Trimestre 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Signataire</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="director">Directeur</SelectItem>
                    <SelectItem value="principal">Proviseur</SelectItem>
                    <SelectItem value="secretary">Secrétaire Général</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-gradient-primary hover:opacity-90 gap-2">
                <FileText className="h-4 w-4" />
                Générer le document PDF
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Certificates;
