import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface School {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateSchoolData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
}

export const useSchool = () => {
  const queryClient = useQueryClient();

  const { data: school, isLoading, error } = useQuery({
    queryKey: ["school"],
    queryFn: async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (!profile?.school_id) {
        throw new Error("Aucune école associée à votre profil");
      }

      const { data, error } = await supabase
        .from("schools")
        .select("*")
        .eq("id", profile.school_id)
        .single();

      if (error) throw error;
      return data as School;
    },
  });

  const updateSchool = useMutation({
    mutationFn: async (updates: UpdateSchoolData) => {
      if (!school?.id) {
        throw new Error("Aucune école à mettre à jour");
      }

      const { data, error } = await supabase
        .from("schools")
        .update(updates)
        .eq("id", school.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school"] });
      toast.success("École mise à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  return {
    school,
    isLoading,
    error,
    updateSchool,
  };
};
