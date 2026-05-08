
-- Add missing columns to clothing_products
ALTER TABLE public.clothing_products
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 't-shirt',
  ADD COLUMN IF NOT EXISTS base_colour TEXT NOT NULL DEFAULT 'Black',
  ADD COLUMN IF NOT EXISTS artwork_url TEXT,
  ADD COLUMN IF NOT EXISTS placement TEXT DEFAULT 'front';

-- Add missing columns to clothing_orders
ALTER TABLE public.clothing_orders
  ADD COLUMN IF NOT EXISTS seller_id UUID,
  ADD COLUMN IF NOT EXISTS buyer_first_name TEXT,
  ADD COLUMN IF NOT EXISTS colour TEXT,
  ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending';

-- Allow authenticated users to read their own orders as sellers
DROP POLICY IF EXISTS "Users can view own orders" ON public.clothing_orders;
CREATE POLICY "Users can view own orders" ON public.clothing_orders
  FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id OR auth.uid() = artist_id OR auth.uid() = seller_id OR has_role(auth.uid(), 'family'::app_role));

-- Allow users to delete draft clothing products
DROP POLICY IF EXISTS "Users can delete own draft products" ON public.clothing_products;
CREATE POLICY "Users can delete own draft products" ON public.clothing_products
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND status = 'draft');
