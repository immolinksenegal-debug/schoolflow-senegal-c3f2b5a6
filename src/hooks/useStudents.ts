import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Student {
  id: string;
  school_id: string;
  matricule: string;
  full_name: string;
  date_of_birth: string;
  class: string;
  phone?: string;
  email?: string;
  address?: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  avatar_url?: string;
  status: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentData {
  matricule: string;
  full_name: string;
  date_of_birth: string;
  class: string;
  phone?: string;
  email?: string;
  address?: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
}

export const useStudents = () => {
  const queryClient = useQueryClient();

  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ["students"],
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
        .from("students")
        .select("*")
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Student[];
    },
  });

  const createStudent = useMutation({
    mutationFn: async (studentData: CreateStudentData) => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (!profile?.school_id) {
        throw new Error("Aucune école associée");
      }

      const { data, error } = await supabase
        .from("students")
        .insert([
          {
            ...studentData,
            school_id: profile.school_id,
            status: "active",
            payment_status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Élève ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de l'ajout de l'élève");
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateStudentData> }) => {
      const { data: updated, error } = await supabase
        .from("students")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Élève mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Élève supprimé avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  return {
    students,
    isLoading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};
