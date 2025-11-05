import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PaytechSettings {
  id?: string;
  api_key?: string;
  secret_key?: string;
  api_url: string;
  cancel_url?: string;
  success_url?: string;
  ipn_url?: string;
  currency: string;
  env: string;
}

export const usePaytechSettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["paytech-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("paytech_settings")
        .select("*")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data;
    },
  });

  const createOrUpdateSettings = useMutation({
    mutationFn: async (newSettings: Partial<PaytechSettings>) => {
      if (settings?.id) {
        const { data, error } = await supabase
          .from("paytech_settings")
          .update(newSettings)
          .eq("id", settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("paytech_settings")
          .insert(newSettings)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paytech-settings"] });
      toast.success("Paramètres Paytech enregistrés avec succès");
    },
    onError: (error) => {
      console.error("Error saving Paytech settings:", error);
      toast.error("Erreur lors de l'enregistrement des paramètres");
    },
  });

  return {
    settings,
    isLoading,
    createOrUpdateSettings: createOrUpdateSettings.mutate,
    isCreatingOrUpdating: createOrUpdateSettings.isPending,
  };
};
