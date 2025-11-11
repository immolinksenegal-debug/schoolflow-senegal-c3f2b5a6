import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "./useProfile";

export interface Enrollment {
  id: string;
  school_id: string;
  student_id?: string;
  enrollment_type: 'new' | 're-enrollment';
  academic_year: string;
  previous_class?: string;
  requested_class: string;
  enrollment_date: string;
  enrollment_fee?: number;
  payment_status: 'pending' | 'partial' | 'paid';
  status: 'pending' | 'approved' | 'rejected' | 'documents_missing';
  documents_submitted: Record<string, boolean>;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  students?: {
    full_name: string;
    phone?: string;
    parent_name: string;
    parent_phone: string;
    matricule: string;
    class: string;
  };
}

export interface CreateEnrollmentData {
  enrollment_type: 'new' | 're-enrollment';
  academic_year: string;
  previous_class?: string;
  requested_class: string;
  enrollment_date?: string;
  enrollment_fee?: number;
  payment_status?: 'pending' | 'partial' | 'paid';
  status?: 'pending' | 'approved' | 'rejected' | 'documents_missing';
  documents_submitted?: Record<string, boolean>;
  notes?: string;
  student_id?: string;
  use_existing_parent?: boolean;
  // New student data if creating new student
  student_data?: {
    full_name: string;
    date_of_birth: string;
    phone?: string;
    email?: string;
    address?: string;
    parent_name: string;
    parent_phone: string;
    parent_email?: string;
    class: string;
  };
}

export interface UpdateEnrollmentData extends Partial<CreateEnrollmentData> {}

export const useEnrollments = () => {
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  const { data: enrollments = [], isLoading, error } = useQuery({
    queryKey: ["enrollments", profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];

      const { data, error } = await supabase
        .from("enrollments")
        .select(`
          *,
          students (
            full_name,
            phone,
            parent_name,
            parent_phone,
            matricule,
            class
          )
        `)
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Enrollment[];
    },
    enabled: !!profile?.school_id,
  });

  const createEnrollment = useMutation({
    mutationFn: async (enrollmentData: CreateEnrollmentData) => {
      if (!profile?.school_id) {
        throw new Error("Aucune école associée");
      }

      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;

      // If creating new student along with enrollment
      if (enrollmentData.student_data && enrollmentData.enrollment_type === 'new') {
        const { student_data, use_existing_parent, ...enrollment } = enrollmentData;
        
        // Check for duplicate email or phone
        if (student_data.email && student_data.email !== '') {
          const { data: existingEmail } = await supabase
            .from("students")
            .select("id, full_name, matricule")
            .eq("school_id", profile.school_id)
            .eq("email", student_data.email)
            .maybeSingle();

          if (existingEmail) {
            throw new Error(`Un élève avec cet email existe déjà : ${existingEmail.full_name} (${existingEmail.matricule}). Utilisez la réinscription pour cet élève.`);
          }
        }

        if (student_data.phone && student_data.phone !== '') {
          const { data: existingPhone } = await supabase
            .from("students")
            .select("id, full_name, matricule")
            .eq("school_id", profile.school_id)
            .eq("phone", student_data.phone)
            .maybeSingle();

          if (existingPhone) {
            throw new Error(`Un élève avec ce numéro existe déjà : ${existingPhone.full_name} (${existingPhone.matricule}). Utilisez la réinscription pour cet élève.`);
          }
        }
        
        // Generate unique matricule
        const matricule = `STD${Date.now()}`;

        // Préparer les données de l'élève
        const studentInsertData: any = {
          full_name: student_data.full_name,
          date_of_birth: student_data.date_of_birth,
          phone: student_data.phone,
          email: student_data.email,
          address: student_data.address,
          class: student_data.class,
          school_id: profile.school_id,
          matricule,
          status: 'pending',
          payment_status: 'pending',
        };

        // Si c'est un parent existant, on ne duplique pas les infos parent
        // Les données parent_name, parent_phone, parent_email sont déjà dans la BD via un autre élève
        // On les ajoute juste pour référence
        if (!use_existing_parent) {
          // Nouveau parent: on enregistre toutes les infos
          studentInsertData.parent_name = student_data.parent_name;
          studentInsertData.parent_phone = student_data.parent_phone;
          studentInsertData.parent_email = student_data.parent_email;
        } else {
          // Parent existant: on ajoute juste les références (déjà validées comme existantes)
          studentInsertData.parent_name = student_data.parent_name;
          studentInsertData.parent_phone = student_data.parent_phone;
          studentInsertData.parent_email = student_data.parent_email;
        }

        // Create student first
        const { data: newStudent, error: studentError } = await supabase
          .from("students")
          .insert(studentInsertData)
          .select()
          .single();

        if (studentError) {
          // Handle unique constraint violations with friendly messages
          if (studentError.message.includes('students_email_unique')) {
            throw new Error(`Cet email est déjà utilisé par un autre élève`);
          }
          if (studentError.message.includes('students_phone_unique')) {
            throw new Error(`Ce numéro de téléphone est déjà utilisé par un autre élève`);
          }
          if (studentError.message.includes('unique_parent_phone')) {
            throw new Error(`Ce numéro de parent est déjà utilisé. Veuillez sélectionner le parent existant.`);
          }
          if (studentError.message.includes('unique_parent_email')) {
            throw new Error(`Cet email de parent est déjà utilisé. Veuillez sélectionner le parent existant.`);
          }
          throw studentError;
        }

        // Then create enrollment
        const { data, error } = await supabase
          .from("enrollments")
          .insert({
            ...enrollment,
            school_id: profile.school_id,
            student_id: newStudent.id,
            academic_year: academicYear,
            status: 'pending',
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // For re-enrollment or enrollment with existing student
      const { data, error } = await supabase
        .from("enrollments")
        .insert({
          ...enrollmentData,
          school_id: profile.school_id,
          academic_year: enrollmentData.academic_year || academicYear,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Inscription créée avec succès");
    },
    onError: (error: any) => {
      console.error("Error creating enrollment:", error);
      toast.error(error.message || "Erreur lors de la création de l'inscription");
    },
  });

  const updateEnrollment = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateEnrollmentData & { id: string }) => {
      const { data, error } = await supabase
        .from("enrollments")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Inscription mise à jour avec succès");
    },
    onError: (error: any) => {
      console.error("Error updating enrollment:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  const approveEnrollment = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Get enrollment details
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("enrollments")
        .select("*, students(*)")
        .eq("id", id)
        .single();

      if (enrollmentError) throw enrollmentError;
      if (!enrollment) throw new Error("Inscription non trouvée");

      // Get class details to know the total amount
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("registration_fee")
        .eq("school_id", profile?.school_id)
        .eq("name", enrollment.requested_class)
        .limit(1)
        .single();

      if (classError) throw classError;

      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;

      // Update enrollment status
      const { data, error } = await supabase
        .from("enrollments")
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Update student status if enrollment is approved
      if (data.student_id) {
        await supabase
          .from("students")
          .update({
            status: 'active',
            class: data.requested_class,
          })
          .eq("id", data.student_id);
      }

      // Generate payment if enrollment_fee was paid
      if (enrollment.enrollment_fee && enrollment.enrollment_fee > 0 && enrollment.payment_status !== 'pending') {
        // Generate receipt number
        const { data: receiptData, error: receiptError } = await supabase
          .rpc('generate_receipt_number', { p_school_id: profile?.school_id });

        if (receiptError) {
          console.error("Error generating receipt:", receiptError);
          throw receiptError;
        }

        // Create payment record
        const { error: paymentError } = await supabase
          .from("payments")
          .insert({
            school_id: profile?.school_id,
            student_id: data.student_id,
            amount: enrollment.enrollment_fee,
            payment_method: 'cash',
            payment_type: 'registration',
            payment_date: new Date().toISOString().split('T')[0],
            academic_year: academicYear,
            receipt_number: receiptData,
            created_by: user.id,
            notes: `Paiement d'inscription - ${enrollment.enrollment_type === 'new' ? 'Nouvelle inscription' : 'Réinscription'}`,
          });

        if (paymentError) {
          console.error("Error creating payment:", paymentError);
          throw paymentError;
        }
      }

      // Calculate remaining amount
      const totalAmount = classData?.registration_fee || 0;
      const amountPaid = enrollment.enrollment_fee || 0;
      const remaining = totalAmount - amountPaid;

      // Get the created payment for printing
      let createdPayment = null;
      if (enrollment.enrollment_fee && enrollment.enrollment_fee > 0 && enrollment.payment_status !== 'pending') {
        const { data: paymentData } = await supabase
          .from("payments")
          .select(`
            *,
            students (
              full_name,
              matricule,
              class,
              parent_name,
              parent_phone
            )
          `)
          .eq("student_id", data.student_id)
          .eq("payment_type", "registration")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        createdPayment = paymentData;
      }

      return {
        ...data,
        payment_info: {
          amount_paid: amountPaid,
          total_amount: totalAmount,
          remaining: remaining > 0 ? remaining : 0,
        },
        created_payment: createdPayment,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      
      const paymentInfo = data.payment_info;
      if (paymentInfo) {
        if (paymentInfo.amount_paid > 0) {
          toast.success(
            `Inscription approuvée et reçu généré!\nMontant payé: ${paymentInfo.amount_paid.toLocaleString()} FCFA\nRestant: ${paymentInfo.remaining.toLocaleString()} FCFA`,
            { duration: 6000 }
          );
        } else {
          toast.success("Inscription approuvée");
        }
      } else {
        toast.success("Inscription approuvée");
      }
    },
    onError: (error: any) => {
      console.error("Error approving enrollment:", error);
      toast.error(error.message || "Erreur lors de l'approbation");
    },
  });

  const deleteEnrollment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("enrollments")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      toast.success("Inscription supprimée avec succès");
    },
    onError: (error: any) => {
      console.error("Error deleting enrollment:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  return {
    enrollments,
    isLoading,
    error,
    createEnrollment,
    updateEnrollment,
    approveEnrollment,
    deleteEnrollment,
  };
};
