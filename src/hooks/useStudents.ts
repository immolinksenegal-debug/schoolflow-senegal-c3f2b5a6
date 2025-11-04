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

      // Check for duplicate email
      if (studentData.email && studentData.email !== '') {
        const { data: existingEmail } = await supabase
          .from("students")
          .select("id, full_name")
          .eq("school_id", profile.school_id)
          .eq("email", studentData.email)
          .maybeSingle();

        if (existingEmail) {
          throw new Error(`L'email ${studentData.email} est déjà utilisé par ${existingEmail.full_name}`);
        }
      }

      // Check for duplicate phone
      if (studentData.phone && studentData.phone !== '') {
        const { data: existingPhone } = await supabase
          .from("students")
          .select("id, full_name")
          .eq("school_id", profile.school_id)
          .eq("phone", studentData.phone)
          .maybeSingle();

        if (existingPhone) {
          throw new Error(`Le téléphone ${studentData.phone} est déjà utilisé par ${existingPhone.full_name}`);
        }
      }

      // Check for duplicate parent phone
      const { data: existingParentPhone } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("school_id", profile.school_id)
        .eq("parent_phone", studentData.parent_phone)
        .maybeSingle();

      if (existingParentPhone) {
        throw new Error(`Le téléphone du parent ${studentData.parent_phone} est déjà utilisé par ${existingParentPhone.full_name}`);
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

      if (error) {
        // Handle unique constraint violations with friendly messages
        if (error.message.includes('students_email_unique')) {
          throw new Error(`Cet email est déjà utilisé par un autre élève`);
        }
        if (error.message.includes('students_phone_unique')) {
          throw new Error(`Ce numéro de téléphone est déjà utilisé par un autre élève`);
        }
        if (error.message.includes('students_parent_phone_unique')) {
          throw new Error(`Ce numéro de téléphone du parent est déjà utilisé`);
        }
        if (error.message.includes('students_parent_email_unique')) {
          throw new Error(`Cet email du parent est déjà utilisé`);
        }
        throw error;
      }
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

      if (error) {
        // Handle unique constraint violations with friendly messages
        if (error.message.includes('students_email_unique')) {
          throw new Error(`Cet email est déjà utilisé par un autre élève`);
        }
        if (error.message.includes('students_phone_unique')) {
          throw new Error(`Ce numéro de téléphone est déjà utilisé par un autre élève`);
        }
        if (error.message.includes('students_parent_phone_unique')) {
          throw new Error(`Ce numéro de téléphone du parent est déjà utilisé`);
        }
        if (error.message.includes('students_parent_email_unique')) {
          throw new Error(`Cet email du parent est déjà utilisé`);
        }
        throw error;
      }
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
