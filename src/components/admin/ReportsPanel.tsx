import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Users, GraduationCap } from "lucide-react";

export const ReportsPanel = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      const [schoolsRes, studentsRes, paymentsRes, classesRes, usersRes] = await Promise.all([
        supabase.from("schools").select("*", { count: "exact" }),
        supabase.from("students").select("*", { count: "exact" }),
        supabase.from("payments").select("amount"),
        supabase.from("classes").select("*", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }),
      ]);

      const totalPayments = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalSchools: schoolsRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalPayments,
        totalClasses: classesRes.count || 0,
        totalUsers: usersRes.count || 0,
        activeSchools: schoolsRes.data?.filter(s => s.is_active).length || 0,
      };
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Chargement des statistiques...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Vue d'ensemble de la plateforme
          </CardTitle>
          <CardDescription>
            Statistiques globales de tous les établissements
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles actives</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeSchools}</div>
            <p className="text-xs text-muted-foreground">
              Sur {stats?.totalSchools} établissements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Tous établissements confondus
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalPayments.toLocaleString()} FCFA
            </div>
            <p className="text-xs text-muted-foreground">
              Paiements enregistrés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              Classes configurées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Comptes créés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'utilisation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalSchools > 0 
                ? Math.round((stats.activeSchools / stats.totalSchools) * 100) 
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Écoles actives
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
