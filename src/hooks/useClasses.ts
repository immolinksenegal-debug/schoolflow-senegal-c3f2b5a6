import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "./useProfile";

export interface Class {
  id: string;
  school_id: string;
  name: string;
  level: string;
  academic_year: string;
  capacity: number;
  teacher_name?: string;
  room_number?: string;
  schedule?: string;
  registration_fee?: number;
  monthly_tuition?: number;
  annual_tuition?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClassData {
  name: string;
  level: string;
  academic_year: string;
  capacity: number;
  teacher_name?: string;
  room_number?: string;
  schedule?: string;
  registration_fee?: number;
  monthly_tuition?: number;
  annual_tuition?: number;
}

export interface UpdateClassData extends Partial<CreateClassData> {}

export const useClasses = () => {
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  const { data: classes = [], isLoading, error } = useQuery({
    queryKey: ["classes", profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];

      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("school_id", profile.school_id)
        .order("level", { ascending: false })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as Class[];
    },
    enabled: !!profile?.school_id,
  });

  const createClass = useMutation({
    mutationFn: async (classData: CreateClassData) => {
      if (!profile?.school_id) {
        throw new Error("Aucune école associée");
      }

      const { data, error } = await supabase
        .from("classes")
        .insert({
          ...classData,
          school_id: profile.school_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classe créée avec succès");
    },
    onError: (error: any) => {
      console.error("Error creating class:", error);
      if (error.message?.includes('unique_class_per_year')) {
        toast.error("Une classe avec ce nom existe déjà pour cette année académique");
      } else {
        toast.error(error.message || "Erreur lors de la création de la classe");
      }
    },
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateClassData & { id: string }) => {
      const { data, error } = await supabase
        .from("classes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classe mise à jour avec succès");
    },
    onError: (error: any) => {
      console.error("Error updating class:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Classe supprimée avec succès");
    },
    onError: (error: any) => {
      console.error("Error deleting class:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  return {
    classes,
    isLoading,
    error,
    createClass,
    updateClass,
    deleteClass,
  };
};