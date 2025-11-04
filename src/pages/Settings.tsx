import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolSettings } from "@/components/settings/SchoolSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Shield, Palette, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect } from "react";

const Settings = () => {
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const { theme, setTheme } = useTheme();

  // Sync theme with preferences
  useEffect(() => {
    if (preferences?.dark_mode && theme !== "dark") {
      setTheme("dark");
    } else if (preferences && !preferences.dark_mode && theme === "dark") {
      setTheme("light");
    }
  }, [preferences?.dark_mode]);

  const handlePreferenceChange = (key: string, value: boolean) => {
    if (key === "dark_mode") {
      setTheme(value ? "dark" : "light");
    }
    updatePreferences.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
          <p className="text-muted-foreground">
            Gérez les paramètres de votre établissement et votre profil
          </p>
        </div>

        <Tabs defaultValue="school" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="school">École</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
          </TabsList>

          <TabsContent value="school" className="space-y-4 mt-6">
            <SchoolSettings />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4 mt-6">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>Notifications</CardTitle>
                </div>
                <CardDescription>
                  Configurez vos préférences de notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications par email
                    </p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={preferences?.email_notifications ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange("email_notifications", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="payment-alerts">Alertes de paiement</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications pour les retards de paiement
                    </p>
                  </div>
                  <Switch 
                    id="payment-alerts" 
                    checked={preferences?.payment_alerts ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange("payment_alerts", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enrollment-alerts">Alertes d'inscription</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications pour les nouvelles inscriptions
                    </p>
                  </div>
                  <Switch 
                    id="enrollment-alerts" 
                    checked={preferences?.enrollment_alerts ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange("enrollment_alerts", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>Apparence</CardTitle>
                </div>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Mode sombre</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer le thème sombre
                    </p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={preferences?.dark_mode ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange("dark_mode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="compact-view">Vue compacte</Label>
                    <p className="text-sm text-muted-foreground">
                      Affichage plus dense des tableaux
                    </p>
                  </div>
                  <Switch 
                    id="compact-view" 
                    checked={preferences?.compact_view ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange("compact_view", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Sécurité</CardTitle>
                </div>
                <CardDescription>
                  Gérez la sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Sécurité renforcée pour votre compte
                    </p>
                  </div>
                  <Switch 
                    id="two-factor" 
                    checked={preferences?.two_factor_enabled ?? false}
                    onCheckedChange={(checked) => handlePreferenceChange("two_factor_enabled", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="session-timeout">Déconnexion automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Déconnexion après 30 minutes d'inactivité
                    </p>
                  </div>
                  <Switch 
                    id="session-timeout" 
                    checked={preferences?.session_timeout ?? true}
                    onCheckedChange={(checked) => handlePreferenceChange("session_timeout", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
