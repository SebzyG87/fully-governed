-- Add credits_balance to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_balance NUMERIC DEFAULT 0;

-- Optional: Create an admin helper to add credits
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, amount NUMERIC)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_balance NUMERIC;
BEGIN
    UPDATE public.profiles
    SET credits_balance = credits_balance + amount
    WHERE id = user_id
    RETURNING credits_balance INTO new_balance;
    
    RETURN new_balance;
END;
$$;
