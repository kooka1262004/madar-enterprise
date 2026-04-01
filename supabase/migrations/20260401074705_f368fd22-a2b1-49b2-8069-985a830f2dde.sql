
-- Create warehouses table
CREATE TABLE IF NOT EXISTS public.warehouses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all warehouses" ON public.warehouses FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Company owners can manage warehouses" ON public.warehouses FOR ALL USING (is_company_owner(company_id)) WITH CHECK (is_company_owner(company_id));
CREATE POLICY "Employees can view company warehouses" ON public.warehouses FOR SELECT USING (employee_belongs_to_company(company_id));

-- Add warehouse_id to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL;

-- Add warehouse_id to stock_movements  
ALTER TABLE public.stock_movements ADD COLUMN IF NOT EXISTS warehouse_id uuid REFERENCES public.warehouses(id) ON DELETE SET NULL;
