import { Users, DollarSign, AlertCircle, BookOpen } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Élèves",
      value: "1,234",
      icon: Users,
      description: "Inscrits cette année",
      trend: { value: 12, isPositive: true },
    },
    {
      title: "Encaissements",
      value: "45M FCFA",
      icon: DollarSign,
      description: "Ce mois",
      trend: { value: 8, isPositive: true },
    },
    {
      title: "Retards de paiement",
      value: "23",
      icon: AlertCircle,
      description: "À relancer",
      trend: { value: 5, isPositive: false },
    },
    {
      title: "Classes actives",
      value: "28",
      icon: BookOpen,
      description: "Tous niveaux",
    },
  ];

  const recentPayments: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre établissement</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Paiements récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.map((payment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{payment.student}</p>
                      <p className="text-sm text-muted-foreground">{payment.class}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-semibold text-foreground">{payment.amount}</p>
                      <p
                        className={`text-xs ${
                          payment.status === "Payé"
                            ? "text-green-600"
                            : payment.status === "Partiel"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {payment.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Répartition par classe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { level: "Terminale", count: 245, percentage: 20 },
                  { level: "Première", count: 312, percentage: 25 },
                  { level: "Seconde", count: 289, percentage: 23 },
                  { level: "Troisième", count: 198, percentage: 16 },
                  { level: "Quatrième", count: 190, percentage: 16 },
                ].map((item) => (
                  <div key={item.level} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.level}</span>
                      <span className="text-muted-foreground">{item.count} élèves</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-gradient-primary transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
