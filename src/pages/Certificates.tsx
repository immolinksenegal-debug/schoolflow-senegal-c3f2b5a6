import { FileText, Download, Plus } from "lucide-react";
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
import StatCard from "@/components/StatCard";

const Certificates = () => {
  const stats = [
    { title: "Certificats générés", value: "156", icon: FileText, description: "Cette année" },
    { title: "En attente", value: "8", icon: FileText },
    { title: "Ce mois", value: "23", icon: FileText, trend: { value: 15, isPositive: true } },
  ];

  const certificates = [
    { id: 1, type: "Certificat de scolarité", student: "Aminata Diop", class: "Terminale S", date: "20/01/2025", status: "Généré" },
    { id: 2, type: "Attestation d'inscription", student: "Moussa Sow", class: "Seconde A", date: "19/01/2025", status: "Généré" },
    { id: 3, type: "Certificat de scolarité", student: "Fatou Ndiaye", class: "Première L", date: "18/01/2025", status: "Généré" },
    { id: 4, type: "Relevé de notes", student: "Ibrahima Fall", class: "Troisième", date: "17/01/2025", status: "En attente" },
    { id: 5, type: "Attestation de présence", student: "Aïssatou Ba", class: "Terminale L", date: "16/01/2025", status: "Généré" },
  ];

  const documentTypes = [
    { name: "Certificat de scolarité", description: "Atteste que l'élève est inscrit et suit régulièrement les cours", icon: "📜" },
    { name: "Attestation d'inscription", description: "Confirme l'inscription de l'élève pour l'année en cours", icon: "📋" },
    { name: "Reçu de paiement", description: "Justificatif de paiement des frais de scolarité", icon: "🧾" },
    { name: "Relevé de notes", description: "Document officiel des notes de l'élève", icon: "📊" },
    { name: "Attestation de présence", description: "Confirme la présence régulière de l'élève", icon: "✅" },
  ];

  const getStatusBadge = (status: string) => {
    if (status === "Généré") {
      return <Badge className="bg-green-50 text-green-700 border-green-200">Généré</Badge>;
    } else {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
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
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2">
            <Plus className="h-4 w-4" />
            Générer un document
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documentTypes.map((docType) => (
            <Card key={docType.name} className="shadow-card hover:shadow-elegant transition-shadow duration-300 cursor-pointer">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{docType.icon}</div>
                  <div>
                    <CardTitle className="text-lg text-foreground mb-1">{docType.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{docType.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Générer
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Documents récents</CardTitle>
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
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{cert.type}</TableCell>
                      <TableCell>{cert.student}</TableCell>
                      <TableCell>{cert.class}</TableCell>
                      <TableCell>{cert.date}</TableCell>
                      <TableCell>{getStatusBadge(cert.status)}</TableCell>
                      <TableCell>
                        {cert.status === "Généré" && (
                          <Button size="sm" variant="outline" className="gap-2">
                            <Download className="h-3 w-3" />
                            Télécharger PDF
                          </Button>
                        )}
                        {cert.status === "En attente" && (
                          <Button size="sm" variant="outline">
                            Générer
                          </Button>
                        )}
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

export default Certificates;
