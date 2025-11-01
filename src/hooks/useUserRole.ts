import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student';

export const useUserRole = () => {
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map(r => r.role as UserRole);
    },
  });

  const hasRole = (role: UserRole) => {
    return userRoles?.includes(role) || false;
  };

  const isSuperAdmin = hasRole('super_admin');
  const isSchoolAdmin = hasRole('school_admin');
  const isTeacher = hasRole('teacher');
  const isStudent = hasRole('student');

  return {
    userRoles: userRoles || [],
    isLoading,
    hasRole,
    isSuperAdmin,
    isSchoolAdmin,
    isTeacher,
    isStudent,
  };
};
