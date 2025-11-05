import { useMemo } from "react";
import { TrendingUp, Download, Users, DollarSign, GraduationCap, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatCard from "@/components/StatCard";
import { useStudents } from "@/hooks/useStudents";
import { usePayments } from "@/hooks/usePayments";
import { useClasses } from "@/hooks/useClasses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { useProfile } from "@/hooks/useProfile";
import { useSchool } from "@/hooks/useSchool";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const Reports = () => {
  const { students } = useStudents();
  const { payments, stats: paymentStats } = usePayments();
  const { classes } = useClasses();
  const { enrollments } = useEnrollments();
  const { school } = useSchool();

  // PDF Generation Helper
  const createPDF = (title: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(79, 70, 229); // primary color
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(school?.name || 'EduKash', pageWidth / 2, 30, { align: 'center' });
    
    // Date
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - 15, 50, { align: 'right' });
    
    doc.setTextColor(0, 0, 0);
    
    return doc;
  };

  const handleDownloadFinancial = () => {
    if (!payments || payments.length === 0) {
      toast.error("Aucune donnée de paiement disponible");
      return;
    }
    
    const doc = createPDF('Rapport Financier');
    
    const tableData = payments.map(p => [
      new Date(p.payment_date).toLocaleDateString('fr-FR'),
      p.receipt_number,
      p.students?.full_name || '',
      p.students?.matricule || '',
      `${Number(p.amount).toLocaleString()} FCFA`,
      p.payment_type,
      p.payment_method,
      p.academic_year,
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Reçu', 'Étudiant', 'Matricule', 'Montant', 'Type', 'Méthode', 'Année']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
    });
    
    // Summary
    const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const finalY = (doc as any).lastAutoTable.finalY || 60;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Total des revenus: ${totalRevenue.toLocaleString()} FCFA`, 15, finalY + 15);
    
    doc.save(`rapport_financier_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Rapport financier téléchargé");
  };

  const handleDownloadClasses = () => {
    if (!students || students.length === 0) {
      toast.error("Aucune donnée disponible");
      return;
    }
    
    const doc = createPDF('Rapport par Classe');
    
    const classData = students.reduce((acc: any[], student) => {
      const existingClass = acc.find(c => c[0] === student.class);
      if (existingClass) {
        existingClass[1]++;
        if (student.payment_status === 'paid') existingClass[2]++;
        if (student.payment_status === 'pending') existingClass[3]++;
        if (student.payment_status === 'partial') existingClass[4]++;
      } else {
        acc.push([
          student.class,
          1,
          student.payment_status === 'paid' ? 1 : 0,
          student.payment_status === 'pending' ? 1 : 0,
          student.payment_status === 'partial' ? 1 : 0,
        ]);
      }
      return acc;
    }, []);
    
    autoTable(doc, {
      startY: 60,
      head: [['Classe', 'Total étudiants', 'À jour', 'En retard', 'Partiel']],
      body: classData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });
    
    doc.save(`rapport_classes_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Rapport des classes téléchargé");
  };

  const handleDownloadPaymentStatus = () => {
    if (!students || students.length === 0) {
      toast.error("Aucune donnée disponible");
      return;
    }
    
    const doc = createPDF('Rapport des Paiements');
    
    const tableData = students.map(s => [
      s.matricule,
      s.full_name,
      s.class,
      s.payment_status === 'paid' ? 'À jour' : s.payment_status === 'partial' ? 'Partiel' : 'En retard',
      s.parent_phone,
      s.parent_email || 'N/A',
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [['Matricule', 'Nom complet', 'Classe', 'Statut', 'Tél. parent', 'Email parent']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
    });
    
    doc.save(`rapport_paiements_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Rapport des paiements téléchargé");
  };

  const handleDownloadEnrollments = () => {
    if (!enrollments || enrollments.length === 0) {
      toast.error("Aucune donnée d'inscription disponible");
      return;
    }
    
    const doc = createPDF('Rapport des Inscriptions');
    
    const tableData = enrollments.map(e => [
      new Date(e.enrollment_date).toLocaleDateString('fr-FR'),
      e.enrollment_type === 'new' ? 'Nouvelle' : 'Réinscription',
      e.requested_class,
      e.previous_class || 'N/A',
      e.academic_year,
      e.status === 'pending' ? 'En attente' : e.status === 'approved' ? 'Approuvé' : 'Rejeté',
      e.payment_status === 'paid' ? 'Payé' : 'En attente',
    ]);
    
    autoTable(doc, {
      startY: 60,
      head: [['Date', 'Type', 'Classe demandée', 'Classe préc.', 'Année', 'Statut', 'Paiement']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
    });
    
    doc.save(`rapport_inscriptions_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("Rapport des inscriptions téléchargé");
  };

  const handleExportAll = () => {
    handleDownloadFinancial();
    setTimeout(() => handleDownloadClasses(), 500);
    setTimeout(() => handleDownloadPaymentStatus(), 1000);
    setTimeout(() => handleDownloadEnrollments(), 1500);
    toast.success("Tous les rapports sont en cours de téléchargement");
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const totalStudents = students?.length || 0;
    const activeStudents = students?.filter(s => s.status === 'active').length || 0;
    const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
    const totalClasses = classes?.length || 0;
    const pendingEnrollments = enrollments?.filter(e => e.status === 'pending').length || 0;
    
    return [
      { 
        title: "Étudiants actifs", 
        value: activeStudents.toString(), 
        icon: Users,
        description: `Sur ${totalStudents} étudiants`,
        trend: totalStudents > 0 ? { 
          value: Math.round((activeStudents / totalStudents) * 100), 
          isPositive: true 
        } : undefined
      },
      { 
        title: "Revenus totaux", 
        value: `${totalRevenue.toLocaleString()} FCFA`, 
        icon: DollarSign,
        description: "Total encaissé"
      },
      { 
        title: "Classes", 
        value: totalClasses.toString(), 
        icon: GraduationCap,
        description: "Classes configurées"
      },
      { 
        title: "Inscriptions en attente", 
        value: pendingEnrollments.toString(), 
        icon: TrendingUp,
        description: "À traiter"
      },
    ];
  }, [students, payments, classes, enrollments]);

  // Monthly revenue data
  const monthlyRevenue = useMemo(() => {
    if (!payments) return [];
    
    const monthlyData: { [key: string]: number } = {};
    payments.forEach(payment => {
      const date = new Date(payment.payment_date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + Number(payment.amount);
    });

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return Object.entries(monthlyData)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return {
          name: `${months[parseInt(month) - 1]} ${year}`,
          montant: value,
        };
      })
      .slice(-6)
      .reverse();
  }, [payments]);

  // Class distribution
  const classDistribution = useMemo(() => {
    if (!students) return [];
    
    const classCounts: { [key: string]: number } = {};
    students.forEach(student => {
      classCounts[student.class] = (classCounts[student.class] || 0) + 1;
    });

    return Object.entries(classCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [students]);

  // Payment status distribution
  const paymentStatusData = useMemo(() => {
    if (!students) return [];
    
    const statusCounts: { [key: string]: number } = {};
    students.forEach(student => {
      statusCounts[student.payment_status] = (statusCounts[student.payment_status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name === 'paid' ? 'À jour' : name === 'partial' ? 'Partiel' : 'En retard',
      value,
    }));
  }, [students]);

  const reportTypes = [
    { 
      title: "Rapport financier", 
      description: "Encaissements, retards et prévisions", 
      icon: "💰",
      action: handleDownloadFinancial
    },
    { 
      title: "Rapport par classe", 
      description: "Distribution et statistiques par classe", 
      icon: "📚",
      action: handleDownloadClasses
    },
    { 
      title: "Rapport des paiements", 
      description: "Statuts et historique des paiements", 
      icon: "📊",
      action: handleDownloadPaymentStatus
    },
    { 
      title: "Rapport d'inscriptions", 
      description: "Nouvelles inscriptions et réinscriptions", 
      icon: "📝",
      action: handleDownloadEnrollments
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Rapports & Statistiques</h1>
            <p className="text-muted-foreground">Analyses et indicateurs de performance</p>
          </div>
          <Button 
            className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
            onClick={handleExportAll}
          >
            <Download className="h-4 w-4" />
            Exporter tout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenus mensuels
              </CardTitle>
              <CardDescription>Évolution des revenus sur 6 mois</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                    formatter={(value: number) => `${value.toLocaleString()} FCFA`}
                  />
                  <Bar dataKey="montant" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Distribution par classe
              </CardTitle>
              <CardDescription>Répartition des étudiants</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={classDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {classDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Statut des paiements
            </CardTitle>
            <CardDescription>Répartition des étudiants par statut de paiement</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={paymentStatusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }}
                  formatter={(value: number) => `${value} étudiants`}
                />
                <Bar dataKey="value" fill="hsl(var(--accent))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Rapports disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {reportTypes.map((report) => (
                <Card key={report.title} className="hover:shadow-elegant transition-shadow duration-300 cursor-pointer">
                  <CardContent className="pt-6 space-y-3">
                    <div className="text-4xl mb-2">{report.icon}</div>
                    <h3 className="font-semibold text-foreground">{report.title}</h3>
                    <p className="text-sm text-muted-foreground">{report.description}</p>
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 mt-4"
                      onClick={report.action}
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
