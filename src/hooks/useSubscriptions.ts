import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type SubscriptionType = "monthly" | "annual";
export type SubscriptionStatus = "active" | "expired" | "cancelled" | "pending";

export interface Subscription {
  id: string;
  school_id: string;
  subscription_type: SubscriptionType;
  status: SubscriptionStatus;
  amount: number;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
  payment_method: string | null;
  transaction_reference: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionData {
  school_id: string;
  subscription_type: SubscriptionType;
  amount: number;
  start_date: string;
  end_date: string;
  payment_method?: string;
  transaction_reference?: string;
  auto_renew?: boolean;
}

export const useSubscriptions = () => {
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading, error } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Subscription[];
    },
  });

  const createSubscription = useMutation({
    mutationFn: async (subscriptionData: CreateSubscriptionData) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("subscriptions")
        .insert({
          ...subscriptionData,
          status: "active",
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update school subscription status
      await supabase
        .from("schools")
        .update({
          subscription_status: "active",
          subscription_end_date: subscriptionData.end_date,
        })
        .eq("id", subscriptionData.school_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      toast.success("Abonnement créé avec succès");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateSubscription = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateSubscriptionData> }) => {
      const { error } = await supabase
        .from("subscriptions")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Abonnement mis à jour");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "cancelled", auto_renew: false })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast.success("Abonnement annulé");
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  return {
    subscriptions,
    isLoading,
    error,
    createSubscription,
    updateSubscription,
    cancelSubscription,
  };
};
