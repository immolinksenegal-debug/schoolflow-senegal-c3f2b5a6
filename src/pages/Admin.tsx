import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  School, 
  GraduationCap, 
  Settings,
  LogOut,
  BarChart3,
  UserCog
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!roleLoading && !isSuperAdmin) {
      navigate("/dashboard");
    }
  }, [isSuperAdmin, roleLoading, navigate]);

  const { data: stats } = useQuery({
    queryKey: ["adminStats"],
    queryFn: async () => {
      const [schoolsRes, studentsRes, usersRes] = await Promise.all([
        supabase.from("schools").select("*", { count: "exact", head: true }),
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      return {
        totalSchools: schoolsRes.count || 0,
        totalStudents: studentsRes.count || 0,
        totalUsers: usersRes.count || 0,
      };
    },
    enabled: !!user && isSuperAdmin,
  });

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Administration</h1>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Écoles</CardTitle>
              <School className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSchools || 0}</div>
              <p className="text-xs text-muted-foreground">
                Établissements enregistrés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Étudiants</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Étudiants actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Comptes créés
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="schools" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schools">
              <School className="h-4 w-4 mr-2" />
              Écoles
            </TabsTrigger>
            <TabsTrigger value="users">
              <UserCog className="h-4 w-4 mr-2" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              Rapports
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schools">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des écoles</CardTitle>
                <CardDescription>
                  Gérez les établissements scolaires de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fonctionnalité en cours de développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>
                  Gérez les comptes utilisateurs et leurs rôles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fonctionnalité en cours de développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Rapports et statistiques</CardTitle>
                <CardDescription>
                  Consultez les rapports détaillés de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fonctionnalité en cours de développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres système</CardTitle>
                <CardDescription>
                  Configurez les paramètres globaux de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fonctionnalité en cours de développement...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
