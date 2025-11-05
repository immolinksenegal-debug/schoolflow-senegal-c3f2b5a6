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

    // Generate PDF with modern design
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Modern gradient header
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 60, 'F');
    
    // Decorative accent bar
    doc.setFillColor(147, 51, 234);
    doc.rect(0, 60, pageWidth, 3, 'F');
    
    // Add logo with circular border if available
    if (school?.logo_url) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = school.logo_url;
        });
        // White circle background for logo
        doc.setFillColor(255, 255, 255);
        doc.circle(30, 30, 18, 'F');
        doc.addImage(img, 'PNG', 15, 15, 30, 30);
      } catch (error) {
        console.error('Error loading logo:', error);
      }
    }
    
    // School name with elegant typography
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.setFont(undefined, 'bold');
    doc.text(school?.name || 'EduKash', pageWidth / 2, 28, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(school?.address || '', pageWidth / 2, 38, { align: 'center' });
    doc.setFontSize(9);
    doc.text(`Tél: ${school?.phone || ''} | Email: ${school?.email || ''}`, pageWidth / 2, 48, { align: 'center' });

    // Decorative border
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.rect(margin, 75, pageWidth - (margin * 2), pageHeight - 95, 'S');
    
    // Inner decorative elements
    doc.setDrawColor(147, 51, 234);
    doc.setLineWidth(0.3);
    doc.line(margin + 5, 80, pageWidth - margin - 5, 80);
    doc.line(margin + 5, pageHeight - 20, pageWidth - margin - 5, pageHeight - 20);

    // Document title with elegant styling
    doc.setTextColor(79, 70, 229);
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    const docType = documentTypes.find(d => d.id === selectedType);
    doc.text(docType?.name.toUpperCase() || '', pageWidth / 2, 95, { align: 'center' });
    
    // Decorative underline
    doc.setDrawColor(147, 51, 234);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 40, 98, pageWidth / 2 + 40, 98);

    // Content section
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    let yPos = 115;

    const contentMargin = margin + 10;
    
    if (selectedType === 'scolarite') {
      doc.text(`Le Directeur de ${school?.name || "l'établissement"},`, contentMargin, yPos);
      yPos += 12;
      doc.text(`Certifie que l'élève:`, contentMargin, yPos);
      yPos += 10;
      
      // Student info box
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(contentMargin, yPos, pageWidth - (contentMargin * 2), 35, 3, 3, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(contentMargin, yPos, pageWidth - (contentMargin * 2), 35, 3, 3, 'S');
      
      yPos += 10;
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text(student.full_name, contentMargin + 5, yPos);
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPos += 8;
      doc.text(`Matricule: ${student.matricule}`, contentMargin + 5, yPos);
      yPos += 6;
      doc.text(`Né(e) le: ${new Date(student.date_of_birth).toLocaleDateString('fr-FR')}`, contentMargin + 5, yPos);
      
      yPos += 20;
      doc.setFontSize(11);
      doc.text(`Est régulièrement inscrit(e) et suit assidûment les cours de la classe de`, contentMargin, yPos);
      yPos += 7;
      doc.setFont(undefined, 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(student.class, contentMargin, yPos);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(` pour l'année scolaire ${academicYear}.`, contentMargin + 30, yPos);
      
    } else if (selectedType === 'inscription') {
      doc.text(`Le Directeur de ${school?.name || "l'établissement"} atteste que:`, contentMargin, yPos);
      yPos += 12;
      
      // Student info box
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(contentMargin, yPos, pageWidth - (contentMargin * 2), 28, 3, 3, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(contentMargin, yPos, pageWidth - (contentMargin * 2), 28, 3, 3, 'S');
      
      yPos += 10;
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text(student.full_name, contentMargin + 5, yPos);
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPos += 8;
      doc.text(`Matricule: ${student.matricule}`, contentMargin + 5, yPos);
      
      yPos += 18;
      doc.setFontSize(11);
      doc.text(`Est dûment inscrit(e) en classe de `, contentMargin, yPos);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(79, 70, 229);
      doc.text(student.class, contentMargin + 65, yPos);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      yPos += 7;
      doc.text(`pour l'année scolaire ${academicYear}.`, contentMargin, yPos);
      
    } else if (selectedType === 'bonne_conduite') {
      doc.text(`Je soussigné, Directeur de ${school?.name || "l'établissement"},`, contentMargin, yPos);
      yPos += 12;
      doc.text(`Atteste que l'élève:`, contentMargin, yPos);
      yPos += 10;
      
      // Student info box
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(contentMargin, yPos, pageWidth - (contentMargin * 2), 28, 3, 3, 'F');
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(contentMargin, yPos, pageWidth - (contentMargin * 2), 28, 3, 3, 'S');
      
      yPos += 10;
      doc.setTextColor(79, 70, 229);
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text(student.full_name, contentMargin + 5, yPos);
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      yPos += 8;
      doc.text(`Matricule: ${student.matricule} - Classe: ${student.class}`, contentMargin + 5, yPos);
      
      yPos += 18;
      doc.setFontSize(11);
      doc.text(`A fait preuve d'une conduite exemplaire et d'une grande assiduité`, contentMargin, yPos);
      yPos += 7;
      doc.text(`tout au long de l'année scolaire ${academicYear}.`, contentMargin, yPos);
    }

    // Professional footer section
    yPos = pageHeight - 50;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(margin + 5, yPos - 5, pageWidth - margin - 5, yPos - 5);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fait à ${school?.address || ''}, le ${new Date(issueDate).toLocaleDateString('fr-FR')}`, contentMargin, yPos);
    
    // Signature section with professional styling
    yPos += 15;
    const signatoryTitle = signatory === 'director' ? 'Le Directeur' : signatory === 'principal' ? 'Le Proviseur' : 'Le Secrétaire Général';
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text(signatoryTitle, pageWidth - 70, yPos);
    
    // Elegant signature line
    yPos += 8;
    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.5);
    doc.line(pageWidth - 75, yPos, pageWidth - 25, yPos);

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
