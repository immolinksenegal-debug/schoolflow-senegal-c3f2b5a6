import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  school_id?: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileData {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
}

export const useProfile = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.id) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      if (error) throw error;
      return data as Profile;
    },
  });

  const { data: userEmail } = useQuery({
    queryKey: ["userEmail"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user?.email || "";
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: UpdateProfileData) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.id) {
        throw new Error("Non authentifié");
      }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user.user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  return {
    profile,
    userEmail,
    isLoading,
    error,
    updateProfile,
  };
};
