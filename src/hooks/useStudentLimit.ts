import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudentLimitInfo {
  current_count: number;
  max_limit: number;
  plan: "free" | "monthly" | "annual";
  can_add: boolean;
  remaining: number;
  is_unlimited?: boolean;
}

export const useStudentLimit = (schoolId?: string) => {
  return useQuery({
    queryKey: ["student-limit", schoolId],
    queryFn: async () => {
      if (!schoolId) return null;

      const { data, error } = await supabase.rpc("check_student_limit", {
        _school_id: schoolId,
      });

      if (error) throw error;
      
      if (!data) return null;
      
      // Type assertion pour les données JSON retournées par la fonction
      const limitInfo = data as any;
      
      const isUnlimited = Number(limitInfo.max_limit) === -1;
      
      return {
        current_count: Number(limitInfo.current_count),
        max_limit: Number(limitInfo.max_limit),
        plan: limitInfo.plan as "free" | "monthly" | "annual",
        can_add: Boolean(limitInfo.can_add),
        remaining: Number(limitInfo.remaining),
        is_unlimited: isUnlimited,
      };
    },
    enabled: !!schoolId,
  });
};
