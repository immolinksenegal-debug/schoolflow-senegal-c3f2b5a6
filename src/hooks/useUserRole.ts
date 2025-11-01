import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "school_admin" | "teacher" | "student";

export const useUserRole = () => {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["userRoles"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.user.id);

      if (error) throw error;
      return (data || []).map(r => r.role as AppRole);
    },
  });

  const hasRole = (role: AppRole) => {
    return roles?.includes(role) || false;
  };

  const isSuperAdmin = hasRole("super_admin");
  const isSchoolAdmin = hasRole("school_admin");
  const isTeacher = hasRole("teacher");
  const isStudent = hasRole("student");

  return {
    roles: roles || [],
    hasRole,
    isSuperAdmin,
    isSchoolAdmin,
    isTeacher,
    isStudent,
    isLoading,
  };
};
