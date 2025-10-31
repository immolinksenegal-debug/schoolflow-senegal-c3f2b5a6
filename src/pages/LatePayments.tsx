import { useState } from "react";
import { AlertCircle, Send, Phone, Mail, MessageSquare, Download, Calendar } from "lucide-react";
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

const LatePayments = () => {
  const [periodFilter, setPeriodFilter] = useState("all");
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);

  const stats = [
    { title: "Total en retard", value: "23", icon: AlertCircle, description: "Élèves concernés" },
    { title: "Montant total dû", value: "3.2M FCFA", icon: AlertCircle },
    { title: "Relances envoyées", value: "15", icon: Send, description: "Ce mois" },
  ];

  const latePayments = [
    { 
      id: 1, 
      student: "Ibrahima Fall", 
      matricule: "MAT004",
      class: "Troisième", 
      amount: "100,000 FCFA", 
      dueDate: "10/01/2025", 
      daysLate: 10, 
      phone: "77 456 78 90",
      email: "ibrahima.fall@email.com",
      parent: "M. Fall",
      parentPhone: "77 654 32 10",
      lastReminder: "15/01/2025",
      reminderCount: 2
    },
    { 
      id: 2, 
      student: "Khadija Thiam", 
      matricule: "MAT010",
      class: "Seconde B", 
      amount: "120,000 FCFA", 
      dueDate: "05/01/2025", 
      daysLate: 15, 
      phone: "76 234 56 78",
      email: "khadija.thiam@email.com",
      parent: "Mme Thiam",
      parentPhone: "76 876 54 32",
      lastReminder: "12/01/2025",
      reminderCount: 3
    },
    { 
      id: 3, 
      student: "Mamadou Sy", 
      matricule: "MAT011",
      class: "Première S", 
      amount: "135,000 FCFA", 
      dueDate: "08/01/2025", 
      daysLate: 12, 
      phone: "78 345 67 89",
      email: "mamadou.sy@email.com",
      parent: "M. Sy",
      parentPhone: "78 765 43 21",
      lastReminder: "14/01/2025",
      reminderCount: 2
    },
    { 
      id: 4, 
      student: "Coumba Diop", 
      matricule: "MAT012",
      class: "Terminale L", 
      amount: "150,000 FCFA", 
      dueDate: "03/01/2025", 
      daysLate: 17, 
      phone: "77 567 89 01",
      email: "coumba.diop@email.com",
      parent: "Mme Diop",
      parentPhone: "77 210 98 76",
      lastReminder: "10/01/2025",
      reminderCount: 4
    },
  ];

  const getDaysLateBadge = (days: number) => {
    if (days >= 15) {
      return <Badge className="bg-red-50 text-red-700 border-red-200">🔴 {days} jours</Badge>;
    } else if (days >= 7) {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">⚠️ {days} jours</Badge>;
    } else {
      return <Badge className="bg-orange-50 text-orange-700 border-orange-200">⏰ {days} jours</Badge>;
    }
  };

  const toggleStudentSelection = (id: number) => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Retards de paiement</h1>
            <p className="text-muted-foreground">
              {selectedStudents.length > 0 
                ? `${selectedStudents.length} élève${selectedStudents.length > 1 ? 's' : ''} sélectionné${selectedStudents.length > 1 ? 's' : ''}`
                : "Suivi et relances automatiques"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Exporter
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Élèves en retard de paiement</CardTitle>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-[200px]">
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
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={selectedStudents.length === latePayments.length}
                        onCheckedChange={selectAll}
                      />
                    </TableHead>
                    <TableHead className="font-semibold">Élève</TableHead>
                    <TableHead className="font-semibold">Classe</TableHead>
                    <TableHead className="font-semibold">Montant dû</TableHead>
                    <TableHead className="font-semibold">Date limite</TableHead>
                    <TableHead className="font-semibold">Retard</TableHead>
                    <TableHead className="font-semibold">Relances</TableHead>
                    <TableHead className="font-semibold">Dernière relance</TableHead>
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
                      <TableCell>{payment.class}</TableCell>
                      <TableCell className="font-semibold text-red-600">{payment.amount}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>{getDaysLateBadge(payment.daysLate)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {payment.reminderCount}x
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{payment.lastReminder}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Phone className="h-3 w-3" />
                            SMS
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <MessageSquare className="h-3 w-3" />
                            WhatsApp
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
