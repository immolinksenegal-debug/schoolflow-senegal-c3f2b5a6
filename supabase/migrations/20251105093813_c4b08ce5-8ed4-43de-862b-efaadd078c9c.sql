-- Add foreign key constraints for reminder tables
ALTER TABLE public.scheduled_reminders
ADD CONSTRAINT scheduled_reminders_student_id_fkey
FOREIGN KEY (student_id) REFERENCES public.students(id) ON DELETE CASCADE;