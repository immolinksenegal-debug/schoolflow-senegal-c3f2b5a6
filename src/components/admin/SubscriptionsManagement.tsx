import { useState } from "react";
import { useSubscriptions, type CreateSubscriptionData, type SubscriptionType } from "@/hooks/useSubscriptions";
import { useSchools } from "@/hooks/useSchools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, CreditCard, XCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const SUBSCRIPTION_PRICES = {
  monthly: 25000,
  annual: 300000,
};

export default function SubscriptionsManagement() {
  const { subscriptions, isLoading, createSubscription, cancelSubscription } = useSubscriptions();
  const { schools } = useSchools();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateSubscriptionData>>({
    subscription_type: "monthly",
    payment_method: "cash",
  });

  const handleCreate = async () => {
    if (!formData.school_id || !formData.subscription_type) {
      return;
    }

    const amount = SUBSCRIPTION_PRICES[formData.subscription_type];
    const startDate = new Date();
    const endDate = new Date();

    if (formData.subscription_type === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    await createSubscription.mutateAsync({
      school_id: formData.school_id,
      subscription_type: formData.subscription_type,
      amount,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      payment_method: formData.payment_method,
      transaction_reference: formData.transaction_reference,
      auto_renew: true,
    });

    setIsDialogOpen(false);
    setFormData({
      subscription_type: "monthly",
      payment_method: "cash",
    });
  };

  const handleCancel = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir annuler cet abonnement ?")) {
      await cancelSubscription.mutateAsync(id);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const school = schools.find(s => s.id === sub.school_id);
    return school?.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      pending: "secondary",
      expired: "destructive",
      cancelled: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gestion des Abonnements</CardTitle>
              <CardDescription>
                Gérez les abonnements des établissements (25 000 FCFA/mois - 300 000 FCFA/an)
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel Abonnement
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un Abonnement</DialogTitle>
                  <DialogDescription>
                    Créez un nouvel abonnement pour un établissement
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>École</Label>
                    <Select
                      value={formData.school_id}
                      onValueChange={(value) => setFormData({ ...formData, school_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une école" />
                      </SelectTrigger>
                      <SelectContent>
                        {schools.map((school) => (
                          <SelectItem key={school.id} value={school.id}>
                            {school.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Type d'abonnement</Label>
                    <Select
                      value={formData.subscription_type}
                      onValueChange={(value: SubscriptionType) =>
                        setFormData({ ...formData, subscription_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">
                          Mensuel - 25 000 FCFA
                        </SelectItem>
                        <SelectItem value="annual">
                          Annuel - 300 000 FCFA
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Méthode de paiement</Label>
                    <Select
                      value={formData.payment_method}
                      onValueChange={(value) =>
                        setFormData({ ...formData, payment_method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Espèces</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="bank_transfer">Virement</SelectItem>
                        <SelectItem value="check">Chèque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Référence de transaction (optionnel)</Label>
                    <Input
                      value={formData.transaction_reference || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, transaction_reference: e.target.value })
                      }
                      placeholder="REF-..."
                    />
                  </div>

                  <Button onClick={handleCreate} className="w-full">
                    Créer l'abonnement
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par école..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>École</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Début</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Auto-renouvellement</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => {
                const school = schools.find(s => s.id === subscription.school_id);
                return (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{school?.name || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {subscription.subscription_type === "monthly" ? "Mensuel" : "Annuel"}
                      </Badge>
                    </TableCell>
                    <TableCell>{subscription.amount.toLocaleString()} FCFA</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(subscription.start_date), "dd/MM/yyyy", { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(subscription.end_date), "dd/MM/yyyy", { locale: fr })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                    <TableCell>
                      {subscription.auto_renew ? (
                        <Badge variant="default">Activé</Badge>
                      ) : (
                        <Badge variant="outline">Désactivé</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription.status === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(subscription.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Annuler
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
