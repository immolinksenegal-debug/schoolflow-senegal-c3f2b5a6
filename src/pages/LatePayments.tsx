import { useState, useMemo } from "react";
import { AlertCircle, Send, Phone, Mail, MessageSquare, Download, Calendar, Printer } from "lucide-react";
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
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useSchool } from "@/hooks/useSchool";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const LatePayments = () => {
  const { students } = useStudents();
  const { classes } = useClasses();
  const { school } = useSchool();
  const [periodFilter, setPeriodFilter] = useState("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Calculer les élèves en retard de paiement
  const latePayments = useMemo(() => {
    return students
      .filter(student => 
        student.payment_status === 'pending' || student.payment_status === 'partial'
      )
      .map(student => ({
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
  }, [students]);

  // Filtrer par classe
  const filteredPayments = useMemo(() => {
    if (classFilter === "all") return latePayments;
    return latePayments.filter(payment => payment.class === classFilter);
  }, [latePayments, classFilter]);

  const stats = [
    { 
      title: "Total en retard", 
      value: latePayments.length.toString(), 
      icon: AlertCircle, 
      description: "Élèves concernés" 
    },
    { 
      title: "Classes concernées", 
      value: new Set(latePayments.map(p => p.class)).size.toString(), 
      icon: AlertCircle 
    },
    { 
      title: "Filtre actif", 
      value: classFilter === "all" ? "Toutes" : "1 classe", 
      icon: Send, 
      description: filteredPayments.length + " élèves affichés" 
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
    if (selectedStudents.length === filteredPayments.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredPayments.map(p => p.id));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Zone d'impression cachée */}
      <div className="hidden print:block print-area">
        <div className="p-8">
          <div className="text-center mb-8 border-b-2 border-primary pb-6">
            {school?.logo_url && (
              <img src={school.logo_url} alt={school.name} className="h-20 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold text-primary mb-2">{school?.name || "École"}</h1>
            {school?.address && <p className="text-sm text-muted-foreground">{school.address}</p>}
            <div className="flex justify-center gap-4 text-sm text-muted-foreground mt-2">
              {school?.phone && <span>Tél: {school.phone}</span>}
              {school?.email && <span>Email: {school.email}</span>}
            </div>
          </div>
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Liste des élèves en retard de paiement
            </h2>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {classFilter === "all" 
                  ? "Toutes les classes" 
                  : `Classe: ${classFilter}`}
              </span>
              <span>Date: {format(new Date(), "dd/MM/yyyy", { locale: fr })}</span>
            </div>
            <p className="text-sm font-semibold mt-2">
              Total: {filteredPayments.length} élève{filteredPayments.length > 1 ? 's' : ''} en retard
            </p>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-primary">
                <th className="text-left p-2 font-semibold">N°</th>
                <th className="text-left p-2 font-semibold">Matricule</th>
                <th className="text-left p-2 font-semibold">Nom & Prénom</th>
                <th className="text-left p-2 font-semibold">Classe</th>
                <th className="text-left p-2 font-semibold">Statut</th>
                <th className="text-left p-2 font-semibold">Parent/Tuteur</th>
                <th className="text-left p-2 font-semibold">Téléphone</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <tr key={payment.id} className="border-b border-border">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2 font-medium">{payment.matricule}</td>
                  <td className="p-2 font-medium">{payment.student}</td>
                  <td className="p-2">{payment.class}</td>
                  <td className="p-2">
                    {payment.payment_status === 'partial' ? 'Partiel' : 'En attente'}
                  </td>
                  <td className="p-2">{payment.parent_name}</td>
                  <td className="p-2">{payment.parent_phone}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-12 pt-6 border-t border-border">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date d'édition:</p>
                <p className="font-medium">{format(new Date(), "dd MMMM yyyy", { locale: fr })}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Signature</p>
                <div className="border-t border-foreground w-48 mt-12"></div>
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
              {selectedStudents.length > 0 
                ? `${selectedStudents.length} élève${selectedStudents.length > 1 ? 's' : ''} sélectionné${selectedStudents.length > 1 ? 's' : ''}`
                : `${filteredPayments.length} élève${filteredPayments.length > 1 ? 's' : ''} en retard`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handlePrint}
              disabled={filteredPayments.length === 0}
            >
              <Printer className="h-4 w-4" />
              Imprimer
            </Button>
            <Button 
              className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2"
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

        <Card className="shadow-card">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-foreground">Élèves en retard de paiement</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={classFilter} onValueChange={setClassFilter}>
                  <SelectTrigger className="w-full sm:w-[220px]">
                    <SelectValue placeholder="Filtrer par classe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les classes</SelectItem>
                    {classes.map((classItem) => {
                      const classLateCount = latePayments.filter(p => p.class === classItem.name).length;
                      return (
                        <SelectItem key={classItem.id} value={classItem.name}>
                          {classItem.name} ({classLateCount})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Filtrer par retard" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les retards</SelectItem>
                    <SelectItem value="critical">Critique (&gt;15j)</SelectItem>
                    <SelectItem value="warning">Attention (7-15j)</SelectItem>
                    <SelectItem value="recent">Récent (&lt;7j)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  {classFilter === "all" 
                    ? "Aucun élève en retard de paiement" 
                    : `Aucun élève en retard dans la classe ${classFilter}`}
                </p>
                <p className="text-sm text-muted-foreground">
                  Tous les paiements sont à jour ! 🎉
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12">
                        <Checkbox 
                          checked={selectedStudents.length === filteredPayments.length && filteredPayments.length > 0}
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
                    {filteredPayments.map((payment) => (
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

        <Card className="shadow-card bg-gradient-soft border-accent/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-accent/10 p-3">
                <AlertCircle className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">Configuration des relances automatiques</h3>
                <p className="text-muted-foreground mb-4">
                  Les relances sont envoyées automatiquement après 7, 14 et 21 jours de retard. 
                  Vous pouvez personnaliser les messages et la fréquence dans les paramètres.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline">
                    Configurer les relances
                  </Button>
                  <Button variant="outline" className="gap-2">
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
              <Button className="bg-gradient-primary hover:opacity-90 gap-2">
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
