import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Student = Database['public']['Tables']['students']['Row'];
type StudentInsert = Database['public']['Tables']['students']['Insert'];
type StudentUpdate = Database['public']['Tables']['students']['Update'];

export const useStudents = () => {
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Student[];
    },
  });

  const createStudent = useMutation({
    mutationFn: async (student: Omit<StudentInsert, 'school_id'>) => {
      // Get user's school_id from profile
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('school_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.school_id) {
        throw new Error('No school associated with user');
      }

      const { data, error } = await supabase
        .from('students')
        .insert({ ...student, school_id: profile.school_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Élève ajouté avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de l\'ajout de l\'élève');
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: StudentUpdate }) => {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Élève modifié avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la modification');
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Élève supprimé avec succès');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    },
  });

  return {
    students,
    isLoading,
    createStudent,
    updateStudent,
    deleteStudent,
  };
};