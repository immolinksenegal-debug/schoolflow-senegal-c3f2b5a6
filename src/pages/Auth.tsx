import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { School, LogIn } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const { roles, isLoading: rolesLoading } = useUserRole();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!user || rolesLoading) return;

      // Check if user has a school
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .single();

      // If no roles yet, go to onboarding
      if (!roles || roles.length === 0) {
        navigate("/onboarding");
        return;
      }

      // If no school, go to onboarding
      if (!profile?.school_id) {
        navigate("/onboarding");
        return;
      }

      // Redirect based on role
      if (roles.includes("super_admin")) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    };

    checkUserAndRedirect();
  }, [user, roles, rolesLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn(email, password);
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signUp(email, password, fullName);
    setLoading(false);
  };

  if (rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="p-3 bg-primary/10 rounded-full">
              <School className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Gestion Scolaire</CardTitle>
            <CardDescription className="text-base mt-2">
              Plateforme de gestion pour établissements scolaires
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" className="gap-2">
                <LogIn className="h-4 w-4" />
                Connexion
              </TabsTrigger>
              <TabsTrigger value="signup">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">Profils disponibles :</p>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  <li>• <strong>Super Admin</strong> - Gestion globale de la plateforme</li>
                  <li>• <strong>Admin École</strong> - Gestion de votre établissement</li>
                  <li>• <strong>Enseignant</strong> - Gestion des classes et étudiants</li>
                  <li>• <strong>Étudiant</strong> - Consultation de vos informations</li>
                </ul>
              </div>

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Adresse email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="exemple@ecole.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Connexion en cours..." : "Se connecter"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Créez votre compte pour gérer votre établissement scolaire. 
                  Après inscription, vous pourrez ajouter les informations de votre école.
                </p>
              </div>

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nom complet</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Jean Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Adresse email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="exemple@ecole.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Minimum 6 caractères"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Le mot de passe doit contenir au moins 6 caractères
                  </p>
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Création du compte..." : "Créer mon compte"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
