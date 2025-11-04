import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface UserPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  payment_alerts: boolean;
  enrollment_alerts: boolean;
  dark_mode: boolean;
  compact_view: boolean;
  two_factor_enabled: boolean;
  session_timeout: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdatePreferencesData {
  email_notifications?: boolean;
  payment_alerts?: boolean;
  enrollment_alerts?: boolean;
  dark_mode?: boolean;
  compact_view?: boolean;
  two_factor_enabled?: boolean;
  session_timeout?: boolean;
}

export const usePreferences = () => {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading, error } = useQuery({
    queryKey: ["preferences"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.id) {
        throw new Error("Non authentifié");
      }

      // Try to get existing preferences
      let { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.user.id)
        .maybeSingle();

      // If no preferences exist, create default ones
      if (!data && !error) {
        const { data: newPrefs, error: insertError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: user.user.id,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newPrefs;
      }

      if (error) throw error;
      return data as UserPreferences;
    },
  });

  const updatePreferences = useMutation({
    mutationFn: async (updates: UpdatePreferencesData) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.id) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase
        .from("user_preferences")
        .update(updates)
        .eq("user_id", user.user.id)
        .select()
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        throw new Error("Préférences non trouvées");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preferences"] });
      toast.success("Préférences mises à jour");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences,
  };
};
