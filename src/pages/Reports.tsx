import { TrendingUp, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/StatCard";

const Reports = () => {
  const stats = [
    { title: "Taux de réussite", value: "87%", icon: TrendingUp, trend: { value: 5, isPositive: true } },
    { title: "Taux de réinscription", value: "92%", icon: TrendingUp, trend: { value: 3, isPositive: true } },
    { title: "Présence moyenne", value: "94%", icon: TrendingUp },
  ];

  const monthlyRevenue = [
    { month: "Janvier", amount: "45M FCFA", percentage: 95 },
    { month: "Décembre", amount: "42M FCFA", percentage: 88 },
    { month: "Novembre", amount: "43M FCFA", percentage: 90 },
    { month: "Octobre", amount: "44M FCFA", percentage: 92 },
  ];

  const classPerformance = [
    { class: "Terminale S", average: 14.5, students: 85, color: "bg-blue-500" },
    { class: "Terminale L", average: 13.8, students: 70, color: "bg-purple-500" },
    { class: "Première S", average: 13.2, students: 86, color: "bg-green-500" },
    { class: "Première L", average: 12.9, students: 67, color: "bg-yellow-500" },
    { class: "Seconde", average: 12.5, students: 88, color: "bg-pink-500" },
  ];

  const reportTypes = [
    { title: "Rapport financier", description: "Encaissements, retards et prévisions", icon: "💰" },
    { title: "Rapport académique", description: "Notes, moyennes et performances", icon: "📚" },
    { title: "Rapport de fréquentation", description: "Présences et absences par classe", icon: "📊" },
    { title: "Rapport d'inscriptions", description: "Nouvelles inscriptions et réinscriptions", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Rapports & Statistiques</h1>
            <p className="text-muted-foreground">Analyses et indicateurs de performance</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90 transition-opacity gap-2">
            <Download className="h-4 w-4" />
            Exporter tout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground">Revenus mensuels</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                Période
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyRevenue.map((item) => (
                  <div key={item.month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">{item.month}</span>
                      <span className="font-semibold text-primary">{item.amount}</span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
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

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-foreground">Performance par classe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classPerformance.map((item) => (
                  <div key={item.class} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium text-foreground">{item.class}</span>
                        <span className="text-muted-foreground ml-2">({item.students} élèves)</span>
                      </div>
                      <span className="font-semibold text-accent">{item.average}/20</span>
                    </div>
                    <div className="h-3 rounded-full bg-secondary overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${(item.average / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

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
                    <Button variant="outline" className="w-full gap-2 mt-4">
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
