import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Key, Settings, Link, Info } from "lucide-react";
import { usePaytechSettings } from "@/hooks/usePaytechSettings";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const PaytechSettings = () => {
  const { settings, isLoading, createOrUpdateSettings, isCreatingOrUpdating } = usePaytechSettings();
  
  const [formData, setFormData] = useState({
    api_key: "",
    secret_key: "",
    api_url: "https://paytech.sn/api/payment/request-payment",
    cancel_url: "",
    success_url: "",
    ipn_url: "",
    currency: "XOF",
    env: "test",
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        api_key: settings.api_key || "",
        secret_key: settings.secret_key || "",
        api_url: settings.api_url || "https://paytech.sn/api/payment/request-payment",
        cancel_url: settings.cancel_url || "",
        success_url: settings.success_url || "",
        ipn_url: settings.ipn_url || "",
        currency: settings.currency || "XOF",
        env: settings.env || "test",
      });
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateSettings(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isTestMode = formData.env === "test";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Configuration Paytech</h1>
          <p className="text-muted-foreground">
            Configurez vos paramètres d'intégration Paytech pour les paiements mobile money
          </p>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Paytech est une plateforme de paiement mobile money au Sénégal. Configurez vos clés API pour accepter les paiements Orange Money, Wave, Free Money, etc.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="credentials" className="space-y-4">
          <TabsList>
            <TabsTrigger value="credentials" className="gap-2">
              <Key className="h-4 w-4" />
              Identifiants
            </TabsTrigger>
            <TabsTrigger value="urls" className="gap-2">
              <Link className="h-4 w-4" />
              URLs de callback
            </TabsTrigger>
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              Général
            </TabsTrigger>
          </TabsList>

          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle>Clés API Paytech</CardTitle>
                <CardDescription>
                  Entrez vos clés API Paytech. Vous pouvez les obtenir depuis votre compte Paytech.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="api_key">Clé API *</Label>
                  <Input
                    id="api_key"
                    type="text"
                    placeholder="Votre clé API Paytech"
                    value={formData.api_key}
                    onChange={(e) => handleChange("api_key", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    La clé API publique fournie par Paytech
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secret_key">Clé secrète *</Label>
                  <Input
                    id="secret_key"
                    type="password"
                    placeholder="Votre clé secrète Paytech"
                    value={formData.secret_key}
                    onChange={(e) => handleChange("secret_key", e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    La clé secrète privée fournie par Paytech (gardez-la confidentielle)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="api_url">URL de l'API</Label>
                  <Input
                    id="api_url"
                    type="url"
                    placeholder="https://paytech.sn/api/payment/request-payment"
                    value={formData.api_url}
                    onChange={(e) => handleChange("api_url", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    L'URL de l'API Paytech (par défaut: https://paytech.sn/api/payment/request-payment)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="urls">
            <Card>
              <CardHeader>
                <CardTitle>URLs de callback</CardTitle>
                <CardDescription>
                  Configurez les URLs de retour après paiement et de notification IPN
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="success_url">URL de succès</Label>
                  <Input
                    id="success_url"
                    type="url"
                    placeholder="https://votresite.com/payment/success"
                    value={formData.success_url}
                    onChange={(e) => handleChange("success_url", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL de redirection en cas de paiement réussi
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancel_url">URL d'annulation</Label>
                  <Input
                    id="cancel_url"
                    type="url"
                    placeholder="https://votresite.com/payment/cancel"
                    value={formData.cancel_url}
                    onChange={(e) => handleChange("cancel_url", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL de redirection en cas d'annulation du paiement
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipn_url">URL IPN (Notification)</Label>
                  <Input
                    id="ipn_url"
                    type="url"
                    placeholder="https://votresite.com/api/paytech/ipn"
                    value={formData.ipn_url}
                    onChange={(e) => handleChange("ipn_url", e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    URL pour recevoir les notifications de paiement (IPN - Instant Payment Notification)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configuration de l'environnement et de la devise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="env">Mode de test</Label>
                    <p className="text-xs text-muted-foreground">
                      Activez le mode test pour effectuer des transactions de test
                    </p>
                  </div>
                  <Switch
                    id="env"
                    checked={isTestMode}
                    onCheckedChange={(checked) => handleChange("env", checked ? "test" : "production")}
                  />
                </div>

                {!isTestMode && (
                  <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Vous êtes en mode production. Les transactions seront réelles.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Input
                    id="currency"
                    type="text"
                    value={formData.currency}
                    onChange={(e) => handleChange("currency", e.target.value)}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Devise utilisée pour les transactions (XOF - Franc CFA)
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="submit"
            disabled={isCreatingOrUpdating}
            className="min-w-[200px]"
          >
            {isCreatingOrUpdating ? "Enregistrement..." : "Enregistrer les paramètres"}
          </Button>
        </div>
      </form>
    </div>
  );
};
