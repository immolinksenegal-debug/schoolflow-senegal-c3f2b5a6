-- Add unique constraint to prevent duplicate monthly payments for same student, month, and academic year
-- This only applies to monthly tuition payments (payment_type = 'monthly_tuition')
CREATE UNIQUE INDEX unique_monthly_payment 
ON payments(student_id, payment_period, academic_year, payment_type)
WHERE payment_type = 'monthly_tuition' AND payment_period IS NOT NULL;