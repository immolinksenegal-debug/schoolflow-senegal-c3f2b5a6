import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Building2, Mail, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubscriptionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionType: "monthly" | "annual";
  amount: number;
}

export const SubscriptionPaymentDialog = ({
  open,
  onOpenChange,
  subscriptionType,
  amount,
}: SubscriptionPaymentDialogProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    email: "",
    phone: "",
    fullName: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.schoolName || !formData.email || !formData.phone || !formData.fullName) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Implémenter l'appel à l'API Paytech
      // Pour le moment, simuler un traitement
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      toast.success("Redirection vers la page de paiement...");
      
      // Simuler une redirection vers la page de paiement Paytech
      // Dans la vraie implémentation, on appellerait l'edge function
      // qui générerait le lien de paiement Paytech
      
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur lors du traitement du paiement:", error);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  const subscriptionLabel = subscriptionType === "monthly" ? "Mensuel" : "Annuel";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <CreditCard className="h-6 w-6 text-primary" />
            Paiement de l'abonnement
          </DialogTitle>
          <DialogDescription>
            Abonnement {subscriptionLabel} - {amount.toLocaleString()} FCFA
            {subscriptionType === "annual" && " (2 mois offerts)"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Nom de l'établissement *
              </Label>
              <Input
                id="schoolName"
                placeholder="Ex: Lycée Exemple"
                value={formData.schoolName}
                onChange={(e) => handleChange("schoolName", e.target.value)}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet du responsable *</Label>
              <Input
                id="fullName"
                placeholder="Ex: Jean Dupont"
                value={formData.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email de contact *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@etablissement.sn"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Téléphone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+221 77 123 45 67"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
                disabled={isProcessing}
              />
              <p className="text-xs text-muted-foreground">
                Ce numéro sera utilisé pour le paiement Mobile Money
              </p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Récapitulatif</h4>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Formule</span>
              <span className="font-medium">Abonnement {subscriptionLabel}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Montant</span>
              <span className="font-medium">{amount.toLocaleString()} FCFA</span>
            </div>
            {subscriptionType === "annual" && (
              <div className="flex justify-between text-sm text-primary">
                <span>Économie</span>
                <span className="font-medium">50 000 FCFA</span>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isProcessing}
              className="flex-1 gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Payer maintenant
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Paiement sécurisé via Paytech • Orange Money, Wave, Free Money
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
