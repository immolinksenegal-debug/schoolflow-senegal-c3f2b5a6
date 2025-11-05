import { useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStudents } from "@/hooks/useStudents";
import { useCertificates } from "@/hooks/useCertificates";
import jsPDF from 'jspdf';
import { useSchool } from "@/hooks/useSchool";

interface CertificateGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType?: string;
}

const documentTypes = [
  { 
    id: "scolarite",
    name: "Certificat de scolarité", 
    icon: "📜",
  },
  { 
    id: "inscription",
    name: "Attestation d'inscription", 
    icon: "📋",
  },
  { 
    id: "paiement",
    name: "Reçu de paiement", 
    icon: "🧾",
  },
  { 
    id: "notes",
    name: "Relevé de notes", 
    icon: "📊",
  },
  { 
    id: "presence",
    name: "Attestation de présence", 
    icon: "✅",
  },
  { 
    id: "bonne_conduite",
    name: "Certificat de bonne conduite", 
    icon: "🏆",
  },
];

export const CertificateGenerator = ({ open, onOpenChange, selectedType: initialType }: CertificateGeneratorProps) => {
  const [selectedType, setSelectedType] = useState(initialType || "");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [signatory, setSignatory] = useState("director");
  const [period, setPeriod] = useState("");

  const { students } = useStudents();
  const { school } = useSchool();
  const { createCertificate } = useCertificates();

  const handleGenerate = async () => {
    if (!selectedStudent || !selectedType) {
      return;
    }

    const student = students?.find(s => s.id === selectedStudent);
    if (!student) return;

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(school?.name || 'EduKash', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(school?.address || '', pageWidth / 2, 35, { align: 'center' });
    doc.text(`Tél: ${school?.phone || ''} | Email: ${school?.email || ''}`, pageWidth / 2, 42, { align: 'center' });

    // Document title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    const docType = documentTypes.find(d => d.id === selectedType);
    doc.text(docType?.name || '', pageWidth / 2, 70, { align: 'center' });

    // Content based on type
    doc.setFontSize(12);
    let yPos = 90;

    if (selectedType === 'scolarite') {
      doc.text(`Le Directeur de ${school?.name || 'l\'établissement'},`, 20, yPos);
      yPos += 15;
      doc.text(`Certifie que l'élève:`, 20, yPos);
      yPos += 10;
      doc.setFont(undefined, 'bold');
      doc.text(`${student.full_name}`, 40, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 10;
      doc.text(`Matricule: ${student.matricule}`, 40, yPos);
      yPos += 10;
      doc.text(`Né(e) le: ${new Date(student.date_of_birth).toLocaleDateString('fr-FR')}`, 40, yPos);
      yPos += 15;
      doc.text(`Est régulièrement inscrit(e) et suit assidûment les cours de la classe de ${student.class}`, 20, yPos);
      yPos += 10;
      doc.text(`pour l'année scolaire ${academicYear}.`, 20, yPos);
    } else if (selectedType === 'inscription') {
      doc.text(`Le Directeur de ${school?.name || 'l\'établissement'} atteste que:`, 20, yPos);
      yPos += 15;
      doc.setFont(undefined, 'bold');
      doc.text(`${student.full_name}`, 40, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 10;
      doc.text(`Matricule: ${student.matricule}`, 40, yPos);
      yPos += 15;
      doc.text(`Est dûment inscrit(e) en classe de ${student.class}`, 20, yPos);
      yPos += 10;
      doc.text(`pour l'année scolaire ${academicYear}.`, 20, yPos);
    } else if (selectedType === 'bonne_conduite') {
      doc.text(`Je soussigné, Directeur de ${school?.name || 'l\'établissement'},`, 20, yPos);
      yPos += 15;
      doc.text(`Atteste que l'élève:`, 20, yPos);
      yPos += 10;
      doc.setFont(undefined, 'bold');
      doc.text(`${student.full_name}`, 40, yPos);
      doc.setFont(undefined, 'normal');
      yPos += 10;
      doc.text(`Matricule: ${student.matricule} - Classe: ${student.class}`, 40, yPos);
      yPos += 15;
      doc.text(`A fait preuve d'une conduite exemplaire et d'une grande assiduité`, 20, yPos);
      yPos += 10;
      doc.text(`tout au long de l'année scolaire ${academicYear}.`, 20, yPos);
    }

    // Footer
    yPos = pageHeight - 60;
    doc.text(`Fait à ${school?.address || ''}, le ${new Date(issueDate).toLocaleDateString('fr-FR')}`, 20, yPos);
    yPos += 15;
    doc.text(`Le ${signatory === 'director' ? 'Directeur' : signatory === 'principal' ? 'Proviseur' : 'Secrétaire Général'}`, pageWidth - 60, yPos);
    
    // Signature placeholder
    yPos += 15;
    doc.text('_____________________', pageWidth - 70, yPos);

    // Save PDF
    const pdfName = `${docType?.name}_${student.matricule}_${Date.now()}.pdf`;
    doc.save(pdfName);

    // Save to database
    await createCertificate.mutateAsync({
      student_id: selectedStudent,
      document_type: selectedType,
      academic_year: academicYear,
      issue_date: issueDate,
      signatory,
      metadata: { period },
    });

    onOpenChange(false);
    setSelectedStudent("");
    setSelectedType("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Rechercher un élève..." />
              </SelectTrigger>
              <SelectContent>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.matricule} - {student.full_name} ({student.class})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Année scolaire</Label>
              <Input value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Date d'émission</Label>
              <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
          </div>
          {selectedType === "notes" && (
            <div className="space-y-2">
              <Label>Période/Trimestre</Label>
              <Select value={period} onValueChange={setPeriod}>
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
            <Select value={signatory} onValueChange={setSignatory}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            className="bg-gradient-primary hover:opacity-90 gap-2"
            onClick={handleGenerate}
            disabled={!selectedStudent || !selectedType || createCertificate.isPending}
          >
            <FileText className="h-4 w-4" />
            {createCertificate.isPending ? "Génération..." : "Générer le document PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
