import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "./useProfile";

export interface Payment {
  id: string;
  school_id: string;
  student_id: string;
  receipt_number: string;
  amount: number;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'check' | 'other';
  payment_type: 'tuition' | 'registration' | 'exam' | 'transport' | 'canteen' | 'uniform' | 'books' | 'other';
  payment_period?: string;
  academic_year: string;
  payment_date: string;
  transaction_reference?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  students?: {
    id: string;
    full_name: string;
    matricule: string;
    class: string;
    parent_name: string;
    parent_phone: string;
  };
}

export interface CreatePaymentData {
  student_id: string;
  amount: number;
  payment_method: 'cash' | 'mobile_money' | 'bank_transfer' | 'check' | 'other';
  payment_type: 'tuition' | 'registration' | 'exam' | 'transport' | 'canteen' | 'uniform' | 'books' | 'other';
  payment_period?: string;
  payment_date?: string;
  transaction_reference?: string;
  notes?: string;
}

export interface UpdatePaymentData extends Partial<CreatePaymentData> {}

export const usePayments = () => {
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ["payments", profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];

      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          students (
            id,
            full_name,
            matricule,
            class,
            parent_name,
            parent_phone
          )
        `)
        .eq("school_id", profile.school_id)
        .order("payment_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!profile?.school_id,
  });

  const { data: stats } = useQuery({
    queryKey: ["payment-stats", profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return null;

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      // Get last day of current month
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();

      // Total encaissements du mois
      const { data: monthPayments } = await supabase
        .from("payments")
        .select("amount")
        .eq("school_id", profile.school_id)
        .gte("payment_date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
        .lte("payment_date", `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`);

      const monthlyTotal = monthPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Élèves avec paiements en attente (calculé via les enrollments)
      const { data: pendingStudents } = await supabase
        .from("students")
        .select("id")
        .eq("school_id", profile.school_id)
        .eq("payment_status", "pending");

      return {
        monthlyTotal,
        pendingCount: pendingStudents?.length || 0,
      };
    },
    enabled: !!profile?.school_id,
  });

  const createPayment = useMutation({
    mutationFn: async (paymentData: CreatePaymentData) => {
      if (!profile?.school_id) {
        throw new Error("Aucune école associée");
      }

      const { data: user } = await supabase.auth.getUser();
      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;

      // Generate receipt number
      const { data: receiptNum, error: receiptError } = await supabase
        .rpc('generate_receipt_number', { p_school_id: profile.school_id });

      if (receiptError) throw receiptError;

      const { data, error } = await supabase
        .from("payments")
        .insert({
          ...paymentData,
          school_id: profile.school_id,
          receipt_number: receiptNum,
          academic_year: academicYear,
          created_by: user.user?.id,
        })
        .select(`
          *,
          students (
            id,
            full_name,
            matricule,
            class,
            parent_name,
            parent_phone
          )
        `)
        .single();

      if (error) throw error;

      // Update student payment status based on total payments
      const { data: studentPayments } = await supabase
        .from("payments")
        .select("amount")
        .eq("student_id", paymentData.student_id);

      const totalPaid = studentPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // You might want to compare with expected amount per student
      // For now, just update to paid if they've made a payment
      await supabase
        .from("students")
        .update({ payment_status: totalPaid > 0 ? 'partial' : 'pending' })
        .eq("id", paymentData.student_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Paiement enregistré avec succès");
    },
    onError: (error: any) => {
      console.error("Error creating payment:", error);
      toast.error(error.message || "Erreur lors de l'enregistrement du paiement");
    },
  });

  const updatePayment = useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePaymentData & { id: string }) => {
      const { data, error } = await supabase
        .from("payments")
        .update(updates)
        .eq("id", id)
        .select(`
          *,
          students (
            id,
            full_name,
            matricule,
            class,
            parent_name,
            parent_phone
          )
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      toast.success("Paiement mis à jour avec succès");
    },
    onError: (error: any) => {
      console.error("Error updating payment:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const deletePayment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("payments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["payment-stats"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Paiement supprimé avec succès");
    },
    onError: (error: any) => {
      console.error("Error deleting payment:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  return {
    payments,
    stats,
    isLoading,
    error,
    createPayment,
    updatePayment,
    deletePayment,
  };
};
