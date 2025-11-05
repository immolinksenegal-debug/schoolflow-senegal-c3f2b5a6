import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Mail, 
  Lock,
  Server,
  AlertCircle,
  Save,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const SystemSettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Paramètres généraux
    platformName: "EduKash",
    maintenanceMode: false,
    allowNewSchools: true,
    maxStudentsPerSchool: 10000,
    
    // Paramètres d'authentification
    requireEmailVerification: false,
    enableTwoFactor: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    
    // Paramètres de sécurité
    enableRateLimiting: true,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    systemAlerts: true,
  });

  // Récupérer les informations système
  const { data: systemInfo } = useQuery({
    queryKey: ["systemInfo"],
    queryFn: async () => {
      const [schoolsRes, usersRes, paymentsRes] = await Promise.all([
        supabase.from("schools").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("*", { count: "exact", head: true }),
      ]);

      return {
        totalSchools: schoolsRes.count || 0,
        totalUsers: usersRes.count || 0,
        totalPayments: paymentsRes.count || 0,
        version: "1.0.0",
        uptime: "99.9%",
      };
    },
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simuler la sauvegarde des paramètres
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Paramètres enregistrés avec succès");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    toast.info("Paramètres réinitialisés");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Paramètres système
          </h2>
          <p className="text-muted-foreground">
            Configuration globale de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réinitialiser
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      {/* Informations système */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
            <Server className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo?.version}</div>
            <p className="text-xs text-muted-foreground">Actuelle</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disponibilité</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemInfo?.uptime}</div>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>

        <Card className="border-secondary/20 bg-gradient-to-br from-secondary/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Écoles</CardTitle>
            <Database className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo?.totalSchools}</div>
            <p className="text-xs text-muted-foreground">Actives</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
            <Shield className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Inscrits</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paiements</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemInfo?.totalPayments}</div>
            <p className="text-xs text-muted-foreground">Enregistrés</p>
          </CardContent>
        </Card>
      </div>

      {/* Onglets de paramètres */}
      <Card className="shadow-xl">
        <CardContent className="pt-6">
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general" className="gap-2">
                <Settings className="h-4 w-4" />
                Général
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-2">
                <Shield className="h-4 w-4" />
                Sécurité
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-2">
                <Server className="h-4 w-4" />
                Maintenance
              </TabsTrigger>
            </TabsList>

            {/* Paramètres généraux */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuration générale</CardTitle>
                  <CardDescription>
                    Paramètres de base de la plateforme
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Nom de la plateforme</Label>
                    <Input
                      id="platform-name"
                      value={settings.platformName}
                      onChange={(e) => setSettings({...settings, platformName: e.target.value})}
                      placeholder="EduKash"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="maintenance">Mode maintenance</Label>
                      <p className="text-sm text-muted-foreground">
                        Désactive l'accès à la plateforme pour maintenance
                      </p>
                    </div>
                    <Switch
                      id="maintenance"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-schools">Autoriser nouvelles écoles</Label>
                      <p className="text-sm text-muted-foreground">
                        Permet aux nouvelles écoles de s'inscrire
                      </p>
                    </div>
                    <Switch
                      id="new-schools"
                      checked={settings.allowNewSchools}
                      onCheckedChange={(checked) => setSettings({...settings, allowNewSchools: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="max-students">Limite d'élèves par école</Label>
                    <Input
                      id="max-students"
                      type="number"
                      value={settings.maxStudentsPerSchool}
                      onChange={(e) => setSettings({...settings, maxStudentsPerSchool: parseInt(e.target.value)})}
                    />
                    <p className="text-sm text-muted-foreground">
                      Nombre maximum d'élèves qu'une école peut gérer
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Paramètres de sécurité */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Authentification
                  </CardTitle>
                  <CardDescription>
                    Configuration de l'authentification des utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-verification">Vérification email</Label>
                      <p className="text-sm text-muted-foreground">
                        Requiert la vérification de l'email à l'inscription
                      </p>
                    </div>
                    <Switch
                      id="email-verification"
                      checked={settings.requireEmailVerification}
                      onCheckedChange={(checked) => setSettings({...settings, requireEmailVerification: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                      <p className="text-sm text-muted-foreground">
                        Active l'authentification 2FA pour tous les utilisateurs
                      </p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={settings.enableTwoFactor}
                      onCheckedChange={(checked) => setSettings({...settings, enableTwoFactor: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Expiration de session (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="password-length">Longueur minimale du mot de passe</Label>
                    <Input
                      id="password-length"
                      type="number"
                      value={settings.passwordMinLength}
                      onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Protection
                  </CardTitle>
                  <CardDescription>
                    Paramètres de protection contre les attaques
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="rate-limiting">Limitation de taux</Label>
                      <p className="text-sm text-muted-foreground">
                        Protège contre les attaques par force brute
                      </p>
                    </div>
                    <Switch
                      id="rate-limiting"
                      checked={settings.enableRateLimiting}
                      onCheckedChange={(checked) => setSettings({...settings, enableRateLimiting: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Tentatives de connexion maximum</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      value={settings.maxLoginAttempts}
                      onChange={(e) => setSettings({...settings, maxLoginAttempts: parseInt(e.target.value)})}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="lockout">Durée de blocage (minutes)</Label>
                    <Input
                      id="lockout"
                      type="number"
                      value={settings.lockoutDuration}
                      onChange={(e) => setSettings({...settings, lockoutDuration: parseInt(e.target.value)})}
                    />
                    <p className="text-sm text-muted-foreground">
                      Durée pendant laquelle un compte est bloqué après trop de tentatives
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Paramètres de notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Canaux de notification
                  </CardTitle>
                  <CardDescription>
                    Activez ou désactivez les canaux de notification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notif">Notifications email</Label>
                      <p className="text-sm text-muted-foreground">
                        Envoyer des notifications par email
                      </p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notif">Notifications SMS</Label>
                      <p className="text-sm text-muted-foreground">
                        Envoyer des notifications par SMS
                      </p>
                    </div>
                    <Switch
                      id="sms-notif"
                      checked={settings.smsNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, smsNotifications: checked})}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="system-alerts">Alertes système</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir les alertes système importantes
                      </p>
                    </div>
                    <Switch
                      id="system-alerts"
                      checked={settings.systemAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, systemAlerts: checked})}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Maintenance */}
            <TabsContent value="maintenance" className="space-y-6">
              <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                    Actions de maintenance
                  </CardTitle>
                  <CardDescription>
                    Opérations de maintenance et optimisation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div>
                        <p className="font-medium">Nettoyer le cache</p>
                        <p className="text-sm text-muted-foreground">
                          Supprime les données en cache pour libérer de l'espace
                        </p>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Nettoyer
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div>
                        <p className="font-medium">Optimiser la base de données</p>
                        <p className="text-sm text-muted-foreground">
                          Réorganise et optimise les tables de la base de données
                        </p>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Database className="h-4 w-4" />
                        Optimiser
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-background">
                      <div>
                        <p className="font-medium">Sauvegarder maintenant</p>
                        <p className="text-sm text-muted-foreground">
                          Crée une sauvegarde manuelle de la base de données
                        </p>
                      </div>
                      <Button variant="outline" className="gap-2">
                        <Save className="h-4 w-4" />
                        Sauvegarder
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-background">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Sauvegardes automatiques
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Fréquence</span>
                      <Badge variant="secondary">Quotidienne</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Rétention</span>
                      <Badge variant="secondary">30 jours</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Dernière sauvegarde</span>
                      <Badge variant="outline">Aujourd'hui 03:00</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Statut</span>
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
