-- Drop the old function
DROP FUNCTION IF EXISTS public.generate_receipt_number(uuid);

-- Create improved receipt number generation function without FOR UPDATE on aggregate
CREATE OR REPLACE FUNCTION public.generate_receipt_number(p_school_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  receipt_num TEXT;
  counter INTEGER;
  year_suffix TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
  last_receipt TEXT;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Loop to handle potential race conditions
  LOOP
    -- Get the maximum counter without FOR UPDATE on aggregate
    SELECT COALESCE(MAX(CAST(SUBSTRING(receipt_number FROM 6) AS INTEGER)), 0) INTO counter
    FROM public.payments
    WHERE school_id = p_school_id
      AND receipt_number LIKE 'REC' || year_suffix || '%';
    
    -- Increment counter
    counter := counter + 1;
    receipt_num := 'REC' || year_suffix || LPAD(counter::TEXT, 6, '0');
    
    -- Try to insert a dummy check to ensure uniqueness
    IF NOT EXISTS (
      SELECT 1 FROM public.payments 
      WHERE receipt_number = receipt_num
      FOR UPDATE SKIP LOCKED
    ) THEN
      RETURN receipt_num;
    END IF;
    
    -- If we get here, there was a race condition, try again
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      -- Generate a unique receipt with timestamp to avoid collision
      receipt_num := 'REC' || year_suffix || LPAD(counter::TEXT, 4, '0') || LPAD(EXTRACT(EPOCH FROM clock_timestamp())::BIGINT % 100, 2, '0');
      RETURN receipt_num;
    END IF;
    
    -- Small delay before retry
    PERFORM pg_sleep(0.01);
  END LOOP;
END;
$$;