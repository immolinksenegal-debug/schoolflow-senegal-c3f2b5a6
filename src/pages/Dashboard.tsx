import { Users, DollarSign, AlertCircle, BookOpen, TrendingUp, TrendingDown, Calendar, Info, CheckCircle2 } from "lucide-react";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in relative z-10">
        {/* Header avec design moderne */}
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-gray-200/50 dark:border-slate-800/50 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mb-1">
                  Tableau de bord
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(), "EEEE dd MMMM yyyy", { locale: fr })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Guide de démarrage */}
        <Card className="shadow-lg border-0 overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 backdrop-blur-xl">
          <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <Info className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg">Guide de démarrage - Procédure normale</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Pour une gestion efficace de votre établissement, suivez ces étapes dans l'ordre :
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="bg-white/80 dark:bg-slate-900/50 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      Créer les classes
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Définissez les niveaux, capacités et frais de scolarité
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/50 p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-800/50 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      Faire les inscriptions
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Les élèves sont créés automatiquement lors de l'inscription
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/50 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50 space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      Gérer les paiements
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Enregistrez les paiements et générez les reçus
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/50 p-4 rounded-xl border border-yellow-200/50 dark:border-yellow-800/50 mt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-foreground text-sm">
                    Réinscriptions annuelles
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Pour chaque nouvelle année scolaire, utilisez la section "Inscriptions" pour réinscrire les anciens élèves dans leurs nouvelles classes et enregistrer les nouveaux frais de scolarité.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <Card className="shadow-xl border-0 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary" />
            <CardHeader className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-gray-100 dark:border-slate-800">
              <CardTitle className="text-foreground flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg">Paiements récents</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {recentPayments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                    <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Aucun paiement récent</p>
                  </div>
                ) : (
                  recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-900 hover:from-slate-100 hover:to-gray-100 dark:hover:from-slate-700 dark:hover:to-slate-800 p-4 rounded-xl transition-all duration-300 border border-gray-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {payment.students?.full_name?.charAt(0) || "E"}
                          </div>
                          <p className="font-semibold text-foreground">
                            {payment.students?.full_name || "Élève"}
                          </p>
                          {getPaymentTypeBadge(payment.payment_type)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground ml-10">
                          <span className="font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{payment.students?.class}</span>
                          <span>•</span>
                          <span>{format(new Date(payment.payment_date), "dd MMM yyyy", { locale: fr })}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-2 ml-4">
                        <p className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                          {Number(payment.amount).toLocaleString()} FCFA
                        </p>
                        <Badge variant="outline" className="text-xs bg-white dark:bg-slate-800">
                          {payment.payment_method === 'cash' ? '💵 Espèces' : 
                           payment.payment_method === 'mobile_money' ? '📱 Mobile Money' : 
                           payment.payment_method === 'bank_transfer' ? '🏦 Virement' : 
                           payment.payment_method}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
            <div className="h-1 bg-gradient-to-r from-accent via-secondary to-accent" />
            <CardHeader className="bg-gradient-to-br from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b border-gray-100 dark:border-slate-800">
              <CardTitle className="text-foreground flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-secondary rounded-lg flex items-center justify-center shadow-md">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg">Répartition par classe</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-5">
                {classDist.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50/50 dark:bg-slate-800/50 rounded-xl">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Aucune donnée disponible</p>
                  </div>
                ) : (
                  classDist.map((item, index) => (
                    <div key={item.level} className="space-y-3 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-900 p-4 rounded-xl border border-gray-200/50 dark:border-slate-700/50">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-foreground flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-md">
                            {index + 1}
                          </div>
                          {item.level}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-medium">
                            {item.count} élèves
                          </span>
                          <Badge variant="outline" className="font-bold bg-white dark:bg-slate-800">
                            {item.percentage}%
                          </Badge>
                        </div>
                      </div>
                      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-700 ease-out shadow-sm relative"
                          style={{ width: `${item.percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
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
