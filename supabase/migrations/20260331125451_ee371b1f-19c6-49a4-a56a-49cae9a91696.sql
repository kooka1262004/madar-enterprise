
-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true) ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to uploads bucket
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Anyone can view uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Users can update own uploads" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'uploads');
CREATE POLICY "Users can delete own uploads" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'uploads');

-- Add delete policy for notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Add delete policy for messages  
CREATE POLICY "Users can delete own messages" ON public.messages FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Add coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_percent numeric DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  max_uses integer DEFAULT 1,
  used_count integer DEFAULT 0,
  active boolean DEFAULT true,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read active coupons" ON public.coupons FOR SELECT USING (active = true);

-- Add delivery_prices table
CREATE TABLE IF NOT EXISTS public.delivery_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.delivery_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage delivery prices" ON public.delivery_prices FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read delivery prices" ON public.delivery_prices FOR SELECT USING (true);

-- Seed delivery prices for Libyan cities
INSERT INTO public.delivery_prices (city, price) VALUES
  ('طرابلس', 10), ('بنغازي', 25), ('مصراتة', 15), ('الزاوية', 12),
  ('زليتن', 14), ('صبراتة', 13), ('الخمس', 14), ('غريان', 18),
  ('ترهونة', 16), ('سرت', 30), ('أجدابيا', 28), ('البيضاء', 32),
  ('درنة', 35), ('طبرق', 38), ('سبها', 45), ('أوباري', 48),
  ('مرزق', 50), ('غدامس', 40), ('نالوت', 35), ('يفرن', 20),
  ('جنزور', 10), ('تاجوراء', 10)
ON CONFLICT DO NOTHING;
