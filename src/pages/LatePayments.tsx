import { AlertCircle, Send, Phone, Mail } from "lucide-react";
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

const LatePayments = () => {
  const stats = [
    { title: "Total en retard", value: "23", icon: AlertCircle, description: "Élèves concernés" },
    { title: "Montant total dû", value: "3.2M FCFA", icon: AlertCircle },
    { title: "Relances envoyées", value: "15", icon: Send, description: "Ce mois" },
  ];

  const latePayments = [
    { id: 1, student: "Ibrahima Fall", class: "Troisième", amount: "100,000 FCFA", dueDate: "10/01/2025", daysLate: 10, phone: "77 456 78 90", lastReminder: "15/01/2025" },
    { id: 2, student: "Khadija Thiam", class: "Seconde B", amount: "120,000 FCFA", dueDate: "05/01/2025", daysLate: 15, phone: "76 234 56 78", lastReminder: "12/01/2025" },
    { id: 3, student: "Mamadou Sy", class: "Première S", amount: "135,000 FCFA", dueDate: "08/01/2025", daysLate: 12, phone: "78 345 67 89", lastReminder: "14/01/2025" },
    { id: 4, student: "Coumba Diop", class: "Terminale L", amount: "150,000 FCFA", dueDate: "03/01/2025", daysLate: 17, phone: "77 567 89 01", lastReminder: "10/01/2025" },
  ];

  const getDaysLateBadge = (days: number) => {
    if (days >= 15) {
      return <Badge className="bg-red-50 text-red-700 border-red-200">{days} jours</Badge>;
    } else if (days >= 7) {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">{days} jours</Badge>;
    } else {
      return <Badge className="bg-orange-50 text-orange-700 border-orange-200">{days} jours</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Retards de paiement</h1>
            <p className="text-muted-foreground">Suivi et relances automatiques</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2">
            <Send className="h-4 w-4" />
            Relance groupée
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Élèves en retard de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Élève</TableHead>
                    <TableHead className="font-semibold">Classe</TableHead>
                    <TableHead className="font-semibold">Montant dû</TableHead>
                    <TableHead className="font-semibold">Date limite</TableHead>
                    <TableHead className="font-semibold">Retard</TableHead>
                    <TableHead className="font-semibold">Téléphone</TableHead>
                    <TableHead className="font-semibold">Dernière relance</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latePayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{payment.student}</TableCell>
                      <TableCell>{payment.class}</TableCell>
                      <TableCell className="font-semibold text-red-600">{payment.amount}</TableCell>
                      <TableCell>{payment.dueDate}</TableCell>
                      <TableCell>{getDaysLateBadge(payment.daysLate)}</TableCell>
                      <TableCell>{payment.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.lastReminder}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Phone className="h-3 w-3" />
                            SMS
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Mail className="h-3 w-3" />
                            Email
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
                <Button variant="outline">
                  Configurer les relances
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LatePayments;
