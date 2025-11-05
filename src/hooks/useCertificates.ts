import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "./useProfile";
import { toast } from "sonner";

export interface Certificate {
  id: string;
  school_id: string;
  student_id: string;
  document_type: string;
  academic_year: string;
  issue_date: string;
  signatory: string;
  metadata: any;
  pdf_url?: string;
  status: 'generated' | 'pending';
  created_by: string;
  created_at: string;
  students?: {
    full_name: string;
    matricule: string;
    class: string;
  };
}

export interface CreateCertificateData {
  student_id: string;
  document_type: string;
  academic_year: string;
  issue_date: string;
  signatory: string;
  metadata?: any;
}

export const useCertificates = () => {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const { data: certificates, isLoading, error } = useQuery({
    queryKey: ["certificates", profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) throw new Error("No school ID");

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          students!certificates_student_id_fkey (
            full_name,
            matricule,
            class
          )
        `)
        .eq("school_id", profile.school_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Certificate[];
    },
    enabled: !!profile?.school_id,
  });

  const { data: stats } = useQuery({
    queryKey: ["certificate-stats", profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) throw new Error("No school ID");

      const { data, error } = await supabase
        .from("certificates")
        .select("status, created_at")
        .eq("school_id", profile.school_id);

      if (error) throw error;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const typedData = data as unknown as Array<{ status: string; created_at: string }>;

      const totalGenerated = typedData?.filter(c => c.status === 'generated').length || 0;
      const pending = typedData?.filter(c => c.status === 'pending').length || 0;
      const thisMonth = typedData?.filter(c => {
        const certDate = new Date(c.created_at);
        return certDate.getMonth() === currentMonth && certDate.getFullYear() === currentYear;
      }).length || 0;

      return {
        totalGenerated,
        pending,
        thisMonth,
      };
    },
    enabled: !!profile?.school_id,
  });

  const createCertificate = useMutation({
    mutationFn: async (data: CreateCertificateData) => {
      if (!profile?.school_id || !profile?.user_id) {
        throw new Error("Missing profile information");
      }

      const { data: certificate, error } = await supabase
        .from("certificates")
        .insert({
          school_id: profile.school_id,
          student_id: data.student_id,
          document_type: data.document_type,
          academic_year: data.academic_year,
          issue_date: data.issue_date,
          signatory: data.signatory,
          metadata: data.metadata || {},
          status: 'generated',
          created_by: profile.user_id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return certificate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificate-stats"] });
      toast.success("Certificat généré avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la génération: " + error.message);
    },
  });

  const deleteCertificate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("certificates")
        .delete()
        .eq("id", id) as any;

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      queryClient.invalidateQueries({ queryKey: ["certificate-stats"] });
      toast.success("Certificat supprimé");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  return {
    certificates,
    stats,
    isLoading,
    error,
    createCertificate,
    deleteCertificate,
  };
};
