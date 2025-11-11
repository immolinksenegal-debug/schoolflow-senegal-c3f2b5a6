import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Send, Phone, Mail, MessageSquare, Download, Calendar, Printer, Search } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import StatCard from "@/components/StatCard";
import { toast } from "sonner";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useSchool } from "@/hooks/useSchool";
import { usePayments } from "@/hooks/usePayments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const MONTHS = [
  { value: 'Janvier', label: 'Janvier' },
  { value: 'Février', label: 'Février' },
  { value: 'Mars', label: 'Mars' },
  { value: 'Avril', label: 'Avril' },
  { value: 'Mai', label: 'Mai' },
  { value: 'Juin', label: 'Juin' },
  { value: 'Juillet', label: 'Juillet' },
  { value: 'Août', label: 'Août' },
  { value: 'Septembre', label: 'Septembre' },
  { value: 'Octobre', label: 'Octobre' },
  { value: 'Novembre', label: 'Novembre' },
  { value: 'Décembre', label: 'Décembre' },
];

const LatePayments = () => {
  const navigate = useNavigate();
  const { students } = useStudents();
  const { classes } = useClasses();
  const { school } = useSchool();
  const { payments } = usePayments();
  const [classFilter, setClassFilter] = useState<string>("");
  const [monthFilter, setMonthFilter] = useState<string>("");
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Calculer les élèves en retard pour un mois spécifique
  const latePayments = useMemo(() => {
    if (!showResults || !classFilter || !monthFilter) return [];

    // Get students from selected class
    const classStudents = students.filter(s => 
      s.class === classFilter && s.status === 'active'
    );

    // Check which students haven't paid for the selected month
    const unpaidStudents = classStudents.filter(student => {
      const studentMonthlyPayments = payments.filter(p => 
        p.student_id === student.id &&
        (p.payment_type === 'monthly_tuition' || p.payment_type === 'tuition') &&
        p.payment_period === monthFilter
      );
      
      return studentMonthlyPayments.length === 0;
    });

    return unpaidStudents.map(student => ({
      id: student.id,
      student: student.full_name,
      matricule: student.matricule,
      class: student.class,
      payment_status: student.payment_status,
      parent_name: student.parent_name,
      parent_phone: student.parent_phone,
      phone: student.phone,
      email: student.email,
    }));
  }, [students, payments, classFilter, monthFilter, showResults]);

  const handleSearch = () => {
    if (!classFilter) {
      toast.error("Veuillez sélectionner une classe");
      return;
    }
    if (!monthFilter) {
      toast.error("Veuillez sélectionner un mois");
      return;
    }
    setShowResults(true);
    setSelectedStudents([]);
  };

  const stats = [
    { 
      title: "Élèves non payés", 
      value: showResults ? latePayments.length.toString() : "-", 
      icon: AlertCircle, 
      description: monthFilter ? `Mois: ${monthFilter}` : "Sélectionnez un mois" 
    },
    { 
      title: "Classe sélectionnée", 
      value: classFilter || "Aucune", 
      icon: AlertCircle,
      description: classFilter ? `${students.filter(s => s.class === classFilter && s.status === 'active').length} élèves total` : "Choisir une classe"
    },
    { 
      title: "Sélectionnés", 
      value: selectedStudents.length.toString(), 
      icon: Send, 
      description: "Pour relance groupée" 
    },
  ];

  const getDaysLateBadge = (days: number) => {
    if (days >= 15) {
      return <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">🔴 {days} jours</Badge>;
    } else if (days >= 7) {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300">⚠️ {days} jours</Badge>;
    } else {
      return <Badge className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300">⏰ {days} jours</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    if (status === "partial") {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300">Partiel</Badge>;
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">En attente</Badge>;
    }
  };

  const toggleStudentSelection = (id: string) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(s => s !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  const selectAll = () => {
    if (selectedStudents.length === latePayments.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(latePayments.map(p => p.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Zone d'impression cachée avec design moderne */}
      <div className="hidden print:block print-area">
        <div className="p-8 bg-white">
          {/* En-tête avec gradient moderne */}
          <div className="relative mb-8 pb-8 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-primary/80 to-primary"></div>
            
            <div className="text-center pt-6">
              {school?.logo_url && (
                <div className="inline-block mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl"></div>
                    <img 
                      src={school.logo_url} 
                      alt={school.name} 
                      className="h-24 mx-auto relative z-10" 
                    />
                  </div>
                </div>
              )}
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                {school?.name || "École"}
              </h1>
              {school?.address && (
                <p className="text-sm text-gray-600 mb-2">{school.address}</p>
              )}
              <div className="flex justify-center gap-6 text-sm text-gray-600">
                {school?.phone && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Tél:</span> {school.phone}
                  </span>
                )}
                {school?.email && (
                  <span className="flex items-center gap-1">
                    <span className="font-medium">Email:</span> {school.email}
                  </span>
                )}
              </div>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
          </div>
          
          {/* Titre et informations du document */}
          <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary/60 rounded-full"></div>
              Liste des élèves en retard de paiement
            </h2>
            
              <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Classe</p>
                <p className="font-semibold text-gray-800">
                  {classFilter || "Non spécifiée"}
                </p>
              </div>
              
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Mois concerné</p>
                <p className="font-semibold text-gray-800">
                  {monthFilter || "Non spécifié"}
                </p>
              </div>
              
              <div className="bg-white rounded-md p-3 border border-gray-200">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Total élèves</p>
                <p className="font-semibold text-gray-800">
                  {latePayments.length} non payés
                </p>
              </div>
            </div>
          </div>

          {/* Tableau moderne */}
          <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-700 text-white">
                  <th className="text-left p-3 font-semibold text-sm">N°</th>
                  <th className="text-left p-3 font-semibold text-sm">Matricule</th>
                  <th className="text-left p-3 font-semibold text-sm">Nom & Prénom</th>
                  <th className="text-left p-3 font-semibold text-sm">Classe</th>
                  <th className="text-left p-3 font-semibold text-sm">Statut</th>
                  <th className="text-left p-3 font-semibold text-sm">Parent/Tuteur</th>
                  <th className="text-left p-3 font-semibold text-sm">Téléphone</th>
                </tr>
              </thead>
              <tbody>
                {latePayments.map((payment, index) => (
                  <tr 
                    key={payment.id} 
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 text-sm text-gray-600">{index + 1}</td>
                    <td className="p-3 text-sm font-mono font-medium text-gray-800">{payment.matricule}</td>
                    <td className="p-3 text-sm font-semibold text-gray-800">{payment.student}</td>
                    <td className="p-3 text-sm">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        {payment.class}
                      </span>
                    </td>
                    <td className="p-3 text-sm">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        payment.payment_status === 'partial' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {payment.payment_status === 'partial' ? 'Partiel' : 'En attente'}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{payment.parent_name}</td>
                    <td className="p-3 text-sm font-medium text-gray-800">{payment.parent_phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pied de page moderne */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Date d'édition</p>
                <p className="font-semibold text-gray-800 text-lg">
                  {format(new Date(), "dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-16">
                  Signature et cachet
                </p>
                <div className="border-t-2 border-gray-400 w-56"></div>
              </div>
            </div>
            
            <div className="mt-8 text-center">
              <div className="inline-block px-4 py-2 bg-gray-100 rounded-md">
                <p className="text-xs text-gray-500">
                  Document généré le {format(new Date(), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interface normale */}
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Retards de paiement</h1>
            <p className="text-muted-foreground">
              Recherchez les élèves qui n'ont pas payé pour un mois spécifique
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handlePrint}
              disabled={!showResults || latePayments.length === 0}
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 gap-2"
              onClick={() => setIsReminderDialogOpen(true)}
              disabled={selectedStudents.length === 0}
            >
              <Send className="h-4 w-4" />
              Relance groupée ({selectedStudents.length})
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Guide d'utilisation */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Guide des retards de paiement</h3>
                <p className="text-sm text-muted-foreground">
                  • <strong>Sélectionner une classe :</strong> Choisissez la classe dont vous voulez vérifier les paiements.
                </p>
                <p className="text-sm text-muted-foreground">
                  • <strong>Sélectionner un mois :</strong> Choisissez le mois de scolarité à vérifier (ex: Janvier, Février, etc.).
                </p>
                <p className="text-sm text-muted-foreground">
                  • <strong>Rechercher :</strong> Cliquez sur le bouton &quot;Rechercher&quot; pour afficher tous les élèves de cette classe qui n&apos;ont pas encore payé ce mois.
                </p>
                <p className="text-sm text-muted-foreground">
                  • <strong>Relance groupée :</strong> Sélectionnez les élèves concernés et envoyez des rappels de paiement par SMS, WhatsApp ou Email.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Rechercher les élèves non payés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Classe *</Label>
                <Select value={classFilter} onValueChange={(value) => {
                  setClassFilter(value);
                  setShowResults(false);
                  setSelectedStudents([]);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une classe" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.name}>
                        {classItem.name} - {classItem.level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Mois concerné *</Label>
                <Select value={monthFilter} onValueChange={(value) => {
                  setMonthFilter(value);
                  setShowResults(false);
                  setSelectedStudents([]);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un mois" />
                  </SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 gap-2"
                  onClick={handleSearch}
                  disabled={!classFilter || !monthFilter}
                >
                  <Search className="h-4 w-4" />
                  Rechercher
                </Button>
              </div>
            </div>

            {classFilter && monthFilter && showResults && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm font-medium">
                  Résultats : <span className="text-primary font-bold">{latePayments.length}</span> élève{latePayments.length > 1 ? 's' : ''} de la classe <span className="font-bold">{classFilter}</span> {latePayments.length > 1 ? 'n\'ont' : 'n\'a'} pas payé le mois de <span className="font-bold">{monthFilter}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {showResults && (
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Élèves non payés pour {monthFilter}</CardTitle>
            </CardHeader>
            <CardContent>
            {latePayments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-foreground font-semibold mb-2">
                  Tous les élèves de {classFilter} ont payé le mois de {monthFilter} ! 🎉
                </p>
                <p className="text-sm text-muted-foreground">
                  Aucun retard de paiement détecté pour cette période
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedStudents.length === latePayments.length && latePayments.length > 0}
                          onCheckedChange={selectAll}
                        />
                      </TableHead>
                      <TableHead className="font-semibold">Élève</TableHead>
                      <TableHead className="font-semibold">Classe</TableHead>
                      <TableHead className="font-semibold">Statut paiement</TableHead>
                      <TableHead className="font-semibold">Parent/Tuteur</TableHead>
                      <TableHead className="font-semibold">Téléphone</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {latePayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(payment.id)}
                            onCheckedChange={() => toggleStudentSelection(payment.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payment.student}</p>
                            <p className="text-xs text-muted-foreground">{payment.matricule}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.class}</Badge>
                        </TableCell>
                        <TableCell>{getPaymentStatusBadge(payment.payment_status)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{payment.parent_name}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="text-sm font-medium">{payment.parent_phone}</p>
                            {payment.phone && (
                              <p className="text-xs text-muted-foreground">Élève: {payment.phone}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="gap-1">
                              <Phone className="h-3 w-3" />
                              SMS
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            </CardContent>
          </Card>
        )}

        {/* Configuration des relances */}
        <Card className="shadow-card bg-gradient-soft border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Configuration des relances automatiques</h3>
                <p className="text-muted-foreground mb-4">
                  Les relances sont envoyées automatiquement selon vos configurations. 
                  Gérez vos paramètres de relances et planifiez des envois spécifiques.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => navigate("/settings")}
                  >
                    Configurer les relances
                  </Button>
                  <Button 
                    variant="outline" 
                    className="gap-2"
                    onClick={() => navigate("/settings")}
                  >
                    <Calendar className="h-4 w-4" />
                    Planifier une relance
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dialog relance groupée */}
        <Dialog open={isReminderDialogOpen} onOpenChange={setIsReminderDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Envoyer une relance groupée</DialogTitle>
              <DialogDescription>
                Relancer {selectedStudents.length} élève{selectedStudents.length > 1 ? 's' : ''} en retard de paiement
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Canal de communication *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir le canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="all">Tous les canaux</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message personnalisé</Label>
                <Textarea 
                  placeholder="Cher parent, nous vous rappelons que le paiement de scolarité de [NOM_ELEVE] pour le mois de [MOIS] d'un montant de [MONTANT] FCFA est en retard depuis [JOURS] jours..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  Variables disponibles : [NOM_ELEVE], [CLASSE], [MONTANT], [MOIS], [JOURS]
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="send-to-parent" defaultChecked />
                <Label htmlFor="send-to-parent" className="text-sm">
                  Envoyer également au numéro du parent/tuteur
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReminderDialogOpen(false)}>
                Annuler
              </Button>
              <Button className="bg-primary hover:bg-primary/90 gap-2 text-white">
                <Send className="h-4 w-4" />
                Envoyer les relances
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LatePayments;
