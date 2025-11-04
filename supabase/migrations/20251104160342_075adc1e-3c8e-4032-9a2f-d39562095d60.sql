-- Drop the existing function
DROP FUNCTION IF EXISTS public.generate_receipt_number(UUID);

-- Create improved function with proper locking to prevent duplicates
CREATE OR REPLACE FUNCTION public.generate_receipt_number(p_school_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  receipt_num TEXT;
  counter INTEGER;
  year_suffix TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Loop to handle potential race conditions
  LOOP
    -- Use row-level locking to prevent race conditions
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 6) AS INTEGER)), 0) + 1 INTO counter
    FROM public.payments
    WHERE school_id = p_school_id
      AND receipt_number LIKE 'REC' || year_suffix || '%'
    FOR UPDATE;
    
    receipt_num := 'REC' || year_suffix || LPAD(counter::TEXT, 6, '0');
    
    -- Check if this receipt number already exists
    IF NOT EXISTS (
      SELECT 1 FROM public.payments 
      WHERE receipt_number = receipt_num
    ) THEN
      RETURN receipt_num;
    END IF;
    
    -- If we get here, there was a race condition, try again
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique receipt number after % attempts', max_attempts;
    END IF;
    
    -- Small delay before retry
    PERFORM pg_sleep(0.01);
  END LOOP;
END;
$$;