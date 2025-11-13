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
  schoolId?: string;
}

export const useSchool = () => {
  const queryClient = useQueryClient();

  const { data: school, isLoading, error } = useQuery({
    queryKey: ["school"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        throw new Error("Non authentifié");
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!profile?.school_id) {
        return null;
      }

      const { data, error: schoolError } = await supabase
        .from("schools")
        .select("*")
        .eq("id", profile.school_id)
        .maybeSingle();

      if (schoolError) throw schoolError;
      return data as School | null;
    },
  });

  const updateSchool = useMutation({
    mutationFn: async (updates: UpdateSchoolData & { schoolId?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        throw new Error("Non authentifié");
      }

      let schoolId = updates.schoolId;

      // If no schoolId provided, try to get from profile
      if (!schoolId) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("school_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;
        
        if (!profile?.school_id) {
          throw new Error("Aucune école associée à votre profil");
        }
        
        schoolId = profile.school_id;
      }

      // Remove schoolId from updates before sending to database
      const { schoolId: _, ...schoolUpdates } = updates;

      const { data, error } = await supabase
        .from("schools")
        .update({
          ...schoolUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", schoolId)
        .select()
        .single();

      if (error) {
        console.error("Update error:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["school"] });
      queryClient.setQueryData(["school"], data);
      toast.success("École mise à jour avec succès");
    },
    onError: (error: any) => {
      console.error("Error updating school:", error);
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
