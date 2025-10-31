import { Settings as SettingsIcon, School, DollarSign, Bell, Shield, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const Settings = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de votre établissement</p>
        </div>

        <div className="grid gap-6">
          {/* Informations de l'établissement */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                <CardTitle>Informations de l'établissement</CardTitle>
              </div>
              <CardDescription>Détails et coordonnées de votre école</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="school-name">Nom de l'établissement</Label>
                  <Input id="school-name" placeholder="Lycée Moderne de Dakar" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school-code">Code établissement</Label>
                  <Input id="school-code" placeholder="LMD-2024" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" placeholder="Avenue Cheikh Anta Diop, Dakar" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" placeholder="33 123 45 67" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="contact@lycee.sn" />
                </div>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90">Sauvegarder</Button>
            </CardContent>
          </Card>

          {/* Configuration des tarifs */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Tarifs de scolarité</CardTitle>
              </div>
              <CardDescription>Définir les montants par niveau</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fee-terminale">Terminale (annuel)</Label>
                  <Input id="fee-terminale" placeholder="150,000 FCFA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-premiere">Première (annuel)</Label>
                  <Input id="fee-premiere" placeholder="135,000 FCFA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-seconde">Seconde (annuel)</Label>
                  <Input id="fee-seconde" placeholder="120,000 FCFA" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fee-college">Collège (annuel)</Label>
                  <Input id="fee-college" placeholder="100,000 FCFA" />
                </div>
              </div>
              <Button className="bg-gradient-primary hover:opacity-90">Sauvegarder les tarifs</Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle>Notifications et relances</CardTitle>
              </div>
              <CardDescription>Configuration des alertes automatiques</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Relances automatiques de paiement</Label>
                  <p className="text-sm text-muted-foreground">Envoyer des SMS après 7, 14 et 21 jours</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">Recevoir les alertes importantes par email</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Confirmations WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">Envoyer les reçus via WhatsApp</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Sécurité et accès</CardTitle>
              </div>
              <CardDescription>Gestion des utilisateurs et permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Utilisateurs autorisés</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Administrateur Principal</p>
                      <p className="text-sm text-muted-foreground">admin@lycee.sn</p>
                    </div>
                    <Button variant="outline" size="sm">Gérer</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">Comptable</p>
                      <p className="text-sm text-muted-foreground">comptable@lycee.sn</p>
                    </div>
                    <Button variant="outline" size="sm">Gérer</Button>
                  </div>
                </div>
              </div>
              <Button variant="outline">Ajouter un utilisateur</Button>
            </CardContent>
          </Card>

          {/* Sauvegarde */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                <CardTitle>Sauvegarde des données</CardTitle>
              </div>
              <CardDescription>Protection et archivage de vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sauvegarde automatique quotidienne</Label>
                  <p className="text-sm text-muted-foreground">Dernière sauvegarde : Aujourd'hui à 03:00</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Télécharger la sauvegarde</Button>
                <Button variant="outline">Restaurer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
