import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Download, TrendingUp, Users, GraduationCap, DollarSign } from "lucide-react";
import { toast } from "sonner";

const COLORS = ['hsl(142 76% 36%)', 'hsl(48 96% 53%)', 'hsl(0 84% 60%)'];

export const ReportsPanel = () => {
  const [selectedSchool, setSelectedSchool] = useState<string>("all");

  const { data: schools = [] } = useQuery({
    queryKey: ["reportSchools"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schools")
        .select("id, name")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats, isLoading } = useQuery({
    queryKey: ["platformStats", selectedSchool],
    queryFn: async () => {
      let studentsQuery = supabase.from("students").select("*", { count: "exact" });
      let paymentsQuery = supabase.from("payments").select("amount, payment_date, school_id");
      let enrollmentsQuery = supabase.from("enrollments").select("*", { count: "exact" });
      let classesQuery = supabase.from("classes").select("*", { count: "exact" });

      if (selectedSchool !== "all") {
        studentsQuery = studentsQuery.eq("school_id", selectedSchool);
        paymentsQuery = paymentsQuery.eq("school_id", selectedSchool);
        enrollmentsQuery = enrollmentsQuery.eq("school_id", selectedSchool);
        classesQuery = classesQuery.eq("school_id", selectedSchool);
      }

      const [studentsRes, paymentsRes, enrollmentsRes, classesRes, schoolsRes] = await Promise.all([
        studentsQuery,
        paymentsQuery,
        enrollmentsQuery,
        classesQuery,
        supabase.from("schools").select("*", { count: "exact" }),
      ]);

      const totalPayments = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      const paymentsBySchool: Record<string, number> = {};
      paymentsRes.data?.forEach((payment) => {
        const schoolId = payment.school_id;
        paymentsBySchool[schoolId] = (paymentsBySchool[schoolId] || 0) + Number(payment.amount);
      });

      const monthlyData = paymentsRes.data?.reduce((acc: any[], payment) => {
        const month = new Date(payment.payment_date).toLocaleDateString('fr-FR', { month: 'short' });
        const existing = acc.find(item => item.month === month);
        
        if (existing) {
          existing.montant += Number(payment.amount);
        } else {
          acc.push({ month, montant: Number(payment.amount) });
        }
        
        return acc;
      }, []) || [];

      return {
        totalSchools: schoolsRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalPayments,
        totalEnrollments: enrollmentsRes.count || 0,
        totalClasses: classesRes.count || 0,
        activeSchools: schoolsRes.data?.filter(s => s.is_active).length || 0,
        paymentsBySchool,
        monthlyData,
      };
    },
  });

  const schoolsChartData = schools.map((school) => ({
    name: school.name,
    montant: stats?.paymentsBySchool[school.id] || 0,
  }));

  const handleExportReport = () => {
    toast.success("Export du rapport en cours...");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rapports et analyses</h2>
          <p className="text-muted-foreground">Statistiques détaillées de la plateforme</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedSchool} onValueChange={setSelectedSchool}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Toutes les écoles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les écoles</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total inscrits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalPayments / 1000000).toFixed(1)}M FCFA</div>
            <p className="text-xs text-muted-foreground">Total encaissé</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">Total inscriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClasses}</div>
            <p className="text-xs text-muted-foreground">Classes actives</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenus par établissement</CardTitle>
            <CardDescription>Répartition des paiements collectés</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={schoolsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Bar dataKey="montant" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Évolution mensuelle</CardTitle>
            <CardDescription>Encaissements par mois</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} FCFA`} />
                <Line type="monotone" dataKey="montant" stroke={COLORS[1]} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
