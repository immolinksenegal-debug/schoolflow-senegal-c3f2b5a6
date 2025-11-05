import { Users, DollarSign, AlertCircle, BookOpen, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudents } from "@/hooks/useStudents";
import { usePayments } from "@/hooks/usePayments";
import { useClasses } from "@/hooks/useClasses";
import { useEnrollments } from "@/hooks/useEnrollments";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useMemo } from "react";

const Dashboard = () => {
  const { students } = useStudents();
  const { payments } = usePayments();
  const { classes } = useClasses();
  const { enrollments } = useEnrollments();

  // Calculer les statistiques réelles
  const stats = useMemo(() => {
    const totalStudents = students.length;
    const activeStudents = students.filter(s => s.status === 'active').length;
    
    // Paiements du mois en cours
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyPayments = payments.filter(p => {
      const paymentDate = new Date(p.payment_date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const monthlyTotal = monthlyPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    // Retards de paiement (élèves avec payment_status pending ou partial)
    const latePayments = students.filter(s => 
      s.payment_status === 'pending' || s.payment_status === 'partial'
    ).length;

    // Inscriptions en attente
    const pendingEnrollments = enrollments.filter(e => e.status === 'pending').length;

    return [
      {
        title: "Total Élèves",
        value: totalStudents.toString(),
        icon: Users,
        description: `${activeStudents} actifs`,
        trend: totalStudents > 0 ? { value: Math.round((activeStudents / totalStudents) * 100), isPositive: true } : undefined,
      },
      {
        title: "Encaissements",
        value: `${(monthlyTotal / 1000000).toFixed(1)}M FCFA`,
        icon: DollarSign,
        description: "Ce mois",
        trend: monthlyPayments.length > 0 ? { value: monthlyPayments.length, isPositive: true } : undefined,
      },
      {
        title: "Retards de paiement",
        value: latePayments.toString(),
        icon: AlertCircle,
        description: "À relancer",
        trend: latePayments > 0 ? { value: latePayments, isPositive: false } : undefined,
      },
      {
        title: "Classes actives",
        value: classes.length.toString(),
        icon: BookOpen,
        description: `${pendingEnrollments} inscriptions en attente`,
      },
    ];
  }, [students, payments, classes, enrollments]);

  // Paiements récents (les 5 derniers)
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
      .slice(0, 5);
  }, [payments]);

  // Répartition par classe
  const classDist = useMemo(() => {
    const distribution: { [key: string]: number } = {};
    students.forEach(student => {
      distribution[student.class] = (distribution[student.class] || 0) + 1;
    });
    
    const total = students.length || 1;
    return Object.entries(distribution)
      .map(([level, count]) => ({
        level,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [students]);

  const getPaymentStatusBadge = (status: string) => {
    if (status === "paid") {
      return <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">Payé</Badge>;
    } else if (status === "partial") {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300">Partiel</Badge>;
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">En attente</Badge>;
    }
  };

  const getPaymentTypeBadge = (type: string) => {
    const labels: { [key: string]: string } = {
      registration: "Inscription",
      tuition: "Scolarité",
      monthly: "Mensualité",
      exam: "Examen",
      other: "Autre",
    };
    return <Badge variant="outline" className="text-xs">{labels[type] || type}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Tableau de bord
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {format(new Date(), "EEEE dd MMMM yyyy", { locale: fr })}
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="group hover:scale-105 transition-transform duration-300"
            >
              <StatCard {...stat} />
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-elegant border-0 overflow-hidden">
            <div className="h-2 bg-gradient-primary" />
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Paiements récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucun paiement récent
                  </div>
                ) : (
                  recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 hover:bg-muted/50 p-3 rounded-lg transition-colors"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">
                            {payment.students?.full_name || "Élève"}
                          </p>
                          {getPaymentTypeBadge(payment.payment_type)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="font-medium">{payment.students?.class}</span>
                          <span>•</span>
                          <span>{format(new Date(payment.payment_date), "dd MMM yyyy", { locale: fr })}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2 ml-4">
                        <p className="font-bold text-lg bg-gradient-primary bg-clip-text text-transparent">
                          {Number(payment.amount).toLocaleString()} FCFA
                        </p>
                        <div className="flex items-center gap-2 justify-end">
                          <Badge variant="outline" className="text-xs">
                            {payment.payment_method === 'cash' ? 'Espèces' : 
                             payment.payment_method === 'mobile_money' ? 'Mobile Money' : 
                             payment.payment_method === 'bank_transfer' ? 'Virement' : 
                             payment.payment_method}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant border-0 overflow-hidden">
            <div className="h-2 bg-gradient-accent" />
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Répartition par classe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {classDist.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune donnée disponible
                  </div>
                ) : (
                  classDist.map((item) => (
                    <div key={item.level} className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-primary" />
                          {item.level}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground">{item.count} élèves</span>
                          <Badge variant="outline" className="font-semibold">
                            {item.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-3 rounded-full bg-secondary/50 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-primary transition-all duration-700 ease-out shadow-sm"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
