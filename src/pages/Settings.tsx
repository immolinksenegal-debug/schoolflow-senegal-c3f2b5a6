import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchoolSettings } from "@/components/settings/SchoolSettings";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Shield, Palette, Loader2, Check, Settings as SettingsIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePreferences } from "@/hooks/usePreferences";
import { useTheme } from "@/components/ThemeProvider";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const Settings = () => {
  const { preferences, isLoading, updatePreferences } = usePreferences();
  const { theme, setTheme } = useTheme();
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Sync theme with preferences
  useEffect(() => {
    if (preferences?.dark_mode && theme !== "dark") {
      setTheme("dark");
    } else if (preferences && !preferences.dark_mode && theme === "dark") {
      setTheme("light");
    }
  }, [preferences?.dark_mode]);

  const handlePreferenceChange = async (key: string, value: boolean) => {
    setSavingKey(key);
    
    if (key === "dark_mode") {
      setTheme(value ? "dark" : "light");
    }
    
    try {
      await updatePreferences.mutateAsync({ [key]: value });
    } finally {
      setTimeout(() => setSavingKey(null), 1000);
    }
  };

  const handleLanguageChange = async (value: string) => {
    toast.info("Changement de langue - fonctionnalité à venir");
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
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="email-notifications">Notifications par email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications par email
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingKey === "email_notifications" && (
                      <Check className="h-4 w-4 text-green-500 animate-in fade-in" />
                    )}
                    <Switch 
                      id="email-notifications" 
                      checked={preferences?.email_notifications ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange("email_notifications", checked)}
                      disabled={updatePreferences.isPending}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="payment-alerts">Alertes de paiement</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications pour les retards de paiement
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingKey === "payment_alerts" && (
                      <Check className="h-4 w-4 text-green-500 animate-in fade-in" />
                    )}
                    <Switch 
                      id="payment-alerts" 
                      checked={preferences?.payment_alerts ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange("payment_alerts", checked)}
                      disabled={updatePreferences.isPending}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="enrollment-alerts">Alertes d'inscription</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications pour les nouvelles inscriptions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingKey === "enrollment_alerts" && (
                      <Check className="h-4 w-4 text-green-500 animate-in fade-in" />
                    )}
                    <Switch 
                      id="enrollment-alerts" 
                      checked={preferences?.enrollment_alerts ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange("enrollment_alerts", checked)}
                      disabled={updatePreferences.isPending}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5 text-primary" />
                  <CardTitle>Général</CardTitle>
                </div>
                <CardDescription>
                  Paramètres généraux de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select defaultValue="fr" onValueChange={handleLanguageChange}>
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="wo">Wolof</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choisissez la langue de l'interface
                  </p>
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
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="dark-mode">Mode sombre</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer le thème sombre
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingKey === "dark_mode" && (
                      <Check className="h-4 w-4 text-green-500 animate-in fade-in" />
                    )}
                    <Switch 
                      id="dark-mode" 
                      checked={preferences?.dark_mode ?? false}
                      onCheckedChange={(checked) => handlePreferenceChange("dark_mode", checked)}
                      disabled={updatePreferences.isPending}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="compact-view">Vue compacte</Label>
                    <p className="text-sm text-muted-foreground">
                      Affichage plus dense des tableaux
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingKey === "compact_view" && (
                      <Check className="h-4 w-4 text-green-500 animate-in fade-in" />
                    )}
                    <Switch 
                      id="compact-view" 
                      checked={preferences?.compact_view ?? false}
                      onCheckedChange={(checked) => handlePreferenceChange("compact_view", checked)}
                      disabled={updatePreferences.isPending}
                    />
                  </div>
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
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="two-factor">Authentification à deux facteurs</Label>
                    <p className="text-sm text-muted-foreground">
                      Sécurité renforcée pour votre compte
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingKey === "two_factor_enabled" && (
                      <Check className="h-4 w-4 text-green-500 animate-in fade-in" />
                    )}
                    <Switch 
                      id="two-factor" 
                      checked={preferences?.two_factor_enabled ?? false}
                      onCheckedChange={(checked) => handlePreferenceChange("two_factor_enabled", checked)}
                      disabled={updatePreferences.isPending}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="session-timeout">Déconnexion automatique</Label>
                    <p className="text-sm text-muted-foreground">
                      Déconnexion après 30 minutes d'inactivité
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {savingKey === "session_timeout" && (
                      <Check className="h-4 w-4 text-green-500 animate-in fade-in" />
                    )}
                    <Switch 
                      id="session-timeout" 
                      checked={preferences?.session_timeout ?? true}
                      onCheckedChange={(checked) => handlePreferenceChange("session_timeout", checked)}
                      disabled={updatePreferences.isPending}
                    />
                  </div>
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
