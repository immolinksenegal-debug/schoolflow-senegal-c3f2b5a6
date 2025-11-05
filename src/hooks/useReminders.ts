import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useProfile } from "./useProfile";

export interface ReminderConfiguration {
  id: string;
  school_id: string;
  reminder_type: 'automatic' | 'manual';
  trigger_days: number;
  message_template: string;
  channels: string[];
  is_active: boolean;
  send_to_parent: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReminder {
  id: string;
  school_id: string;
  student_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  message: string;
  channels: string[];
  status: 'pending' | 'sent' | 'failed' | 'cancelled';
  send_to_parent: boolean;
  sent_at?: string;
  error_message?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  students?: {
    full_name: string;
    matricule: string;
    class: string;
  };
}

export interface CreateReminderConfigData {
  reminder_type: 'automatic' | 'manual';
  trigger_days: number;
  message_template: string;
  channels: string[];
  is_active?: boolean;
  send_to_parent?: boolean;
}

export interface CreateScheduledReminderData {
  student_id: string;
  scheduled_date: string;
  scheduled_time?: string;
  message: string;
  channels: string[];
  send_to_parent?: boolean;
}

export const useReminders = () => {
  const queryClient = useQueryClient();
  const { profile } = useProfile();

  // Fetch reminder configurations
  const { data: configurations = [], isLoading: isLoadingConfigs } = useQuery({
    queryKey: ["reminder-configurations", profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];

      const { data, error } = await supabase
        .from("reminder_configurations")
        .select("*")
        .eq("school_id", profile.school_id)
        .order("trigger_days", { ascending: true });

      if (error) throw error;
      return data as ReminderConfiguration[];
    },
    enabled: !!profile?.school_id,
  });

  // Fetch scheduled reminders
  const { data: scheduledReminders = [], isLoading: isLoadingScheduled } = useQuery({
    queryKey: ["scheduled-reminders", profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];

      const { data, error } = await supabase
        .from("scheduled_reminders")
        .select(`
          *,
          students!scheduled_reminders_student_id_fkey (
            full_name,
            matricule,
            class
          )
        `)
        .eq("school_id", profile.school_id)
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      return data as unknown as ScheduledReminder[];
    },
    enabled: !!profile?.school_id,
  });

  // Create reminder configuration
  const createConfiguration = useMutation({
    mutationFn: async (data: CreateReminderConfigData) => {
      if (!profile?.school_id) throw new Error("Aucune école associée");

      const { data: result, error } = await supabase
        .from("reminder_configurations")
        .insert({
          ...data,
          school_id: profile.school_id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-configurations"] });
      toast.success("Configuration de relance créée avec succès");
    },
    onError: (error: any) => {
      console.error("Error creating reminder configuration:", error);
      toast.error(error.message || "Erreur lors de la création");
    },
  });

  // Update reminder configuration
  const updateConfiguration = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateReminderConfigData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("reminder_configurations")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-configurations"] });
      toast.success("Configuration mise à jour avec succès");
    },
    onError: (error: any) => {
      console.error("Error updating reminder configuration:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  // Delete reminder configuration
  const deleteConfiguration = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("reminder_configurations")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminder-configurations"] });
      toast.success("Configuration supprimée avec succès");
    },
    onError: (error: any) => {
      console.error("Error deleting reminder configuration:", error);
      toast.error(error.message || "Erreur lors de la suppression");
    },
  });

  // Create scheduled reminder
  const createScheduledReminder = useMutation({
    mutationFn: async (data: CreateScheduledReminderData) => {
      if (!profile?.school_id) throw new Error("Aucune école associée");

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const { data: result, error } = await supabase
        .from("scheduled_reminders")
        .insert({
          ...data,
          school_id: profile.school_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reminders"] });
      toast.success("Relance planifiée avec succès");
    },
    onError: (error: any) => {
      console.error("Error creating scheduled reminder:", error);
      toast.error(error.message || "Erreur lors de la planification");
    },
  });

  // Update scheduled reminder
  const updateScheduledReminder = useMutation({
    mutationFn: async ({ id, ...data }: Partial<CreateScheduledReminderData> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("scheduled_reminders")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reminders"] });
      toast.success("Relance mise à jour avec succès");
    },
    onError: (error: any) => {
      console.error("Error updating scheduled reminder:", error);
      toast.error(error.message || "Erreur lors de la mise à jour");
    },
  });

  // Cancel scheduled reminder
  const cancelScheduledReminder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("scheduled_reminders")
        .update({ status: 'cancelled' })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-reminders"] });
      toast.success("Relance annulée avec succès");
    },
    onError: (error: any) => {
      console.error("Error cancelling scheduled reminder:", error);
      toast.error(error.message || "Erreur lors de l'annulation");
    },
  });

  return {
    configurations,
    scheduledReminders,
    isLoadingConfigs,
    isLoadingScheduled,
    createConfiguration,
    updateConfiguration,
    deleteConfiguration,
    createScheduledReminder,
    updateScheduledReminder,
    cancelScheduledReminder,
  };
};