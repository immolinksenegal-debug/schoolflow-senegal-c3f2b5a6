import { useState, useMemo } from "react";
import { FileText, Download, Plus, Eye, Settings2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import StatCard from "@/components/StatCard";
import { useCertificates } from "@/hooks/useCertificates";
import { CertificateGenerator } from "@/components/certificates/CertificateGenerator";

const Certificates = () => {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const { certificates, stats, deleteCertificate } = useCertificates();

  const statsData = useMemo(() => [
    { 
      title: "Certificats générés", 
      value: stats?.totalGenerated?.toString() || "0", 
      icon: FileText, 
      description: "Total généré" 
    },
    { 
      title: "En attente", 
      value: stats?.pending?.toString() || "0", 
      icon: FileText 
    },
    { 
      title: "Ce mois", 
      value: stats?.thisMonth?.toString() || "0", 
      icon: FileText, 
      trend: { value: 15, isPositive: true } 
    },
  ], [stats]);

  const filteredCertificates = useMemo(() => {
    if (!certificates) return [];
    if (filterType === "all") return certificates;
    return certificates.filter(cert => cert.document_type === filterType);
  }, [certificates, filterType]);

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
    if (status === "generated") {
      return <Badge className="bg-green-50 text-green-700 border-green-200">✓ Généré</Badge>;
    } else {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">⏳ En attente</Badge>;
    }
  };

  const getDocumentTypeName = (type: string) => {
    return documentTypes.find(d => d.id === type)?.name || type;
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
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Générer un document
            </Button>
          </div>
        </div>

        {/* Guide d'utilisation */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Comment générer les certificats ?</h3>
                <p className="text-sm text-muted-foreground">
                  • <strong>Types de documents :</strong> Certificat de scolarité, attestation d&apos;inscription, reçu de paiement, attestation de présence, certificat de bonne conduite.
                </p>
                <p className="text-sm text-muted-foreground">
                  • <strong>Génération rapide :</strong> Cliquez sur le type de document souhaité, sélectionnez l&apos;élève, remplissez les informations et générez le PDF.
                </p>
                <p className="text-sm text-muted-foreground">
                  • <strong>Documents officiels :</strong> Tous les documents sont personnalisés avec le logo et les informations de votre établissement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {statsData.map((stat) => (
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
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {documentTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredCertificates && filteredCertificates.length > 0 ? (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Type de document</TableHead>
                      <TableHead className="font-semibold">Élève</TableHead>
                      <TableHead className="font-semibold">Classe</TableHead>
                      <TableHead className="font-semibold">Date d'émission</TableHead>
                      <TableHead className="font-semibold">Année scolaire</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.map((cert) => (
                      <TableRow key={cert.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">
                          {getDocumentTypeName(cert.document_type)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cert.students?.full_name}</p>
                            <p className="text-xs text-muted-foreground">{cert.students?.matricule}</p>
                          </div>
                        </TableCell>
                        <TableCell>{cert.students?.class}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(cert.issue_date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell className="text-sm">{cert.academic_year}</TableCell>
                        <TableCell>{getStatusBadge(cert.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-1"
                              onClick={() => deleteCertificate.mutate(cert.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun certificat généré pour le moment</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsGenerateDialogOpen(true)}
                >
                  Générer votre premier certificat
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <CertificateGenerator 
          open={isGenerateDialogOpen}
          onOpenChange={setIsGenerateDialogOpen}
          selectedType={selectedType}
        />
      </div>
    </div>
  );
};

export default Certificates;
