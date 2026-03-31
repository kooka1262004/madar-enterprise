
-- Plans table
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text DEFAULT '',
  price numeric NOT NULL DEFAULT 0,
  period text DEFAULT 'شهر',
  max_users integer DEFAULT 5,
  max_stores integer DEFAULT 1,
  max_products integer DEFAULT 500,
  features text[] DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Admins can manage plans" ON public.plans FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id),
  plan_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view own subscriptions" ON public.subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = subscriptions.company_id AND companies.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can insert subscriptions" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Subscription requests table
CREATE TABLE public.subscription_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id),
  plan_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  payment_method text DEFAULT '',
  proof_url text DEFAULT '',
  status text DEFAULT 'pending',
  admin_notes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can manage own requests" ON public.subscription_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = subscription_requests.company_id AND companies.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage all requests" ON public.subscription_requests FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Wallet transactions table  
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  type text NOT NULL DEFAULT 'deposit',
  description text DEFAULT '',
  status text DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company owners can view own transactions" ON public.wallet_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM companies WHERE companies.id = wallet_transactions.company_id AND companies.owner_id = auth.uid())
);
CREATE POLICY "Admins can manage transactions" ON public.wallet_transactions FOR ALL USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can insert transactions" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Add insert policy for user_roles (needed for registration)
CREATE POLICY "Authenticated can insert own role" ON public.user_roles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for employees insert by company owners
CREATE POLICY "Employees can manage company orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM employees WHERE employees.company_id = orders.company_id AND employees.user_id = auth.uid())
);

-- Add RLS for employees to view company invoices
CREATE POLICY "Employees can view company invoices" ON public.invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM employees WHERE employees.company_id = invoices.company_id AND employees.user_id = auth.uid())
);

-- Seed default plans
INSERT INTO public.plans (name, name_en, price, period, max_users, max_stores, max_products, features) VALUES
('تجربة مجانية', 'Free Trial', 0, 'أسبوع', 999, 999, 999, ARRAY['جميع المميزات']),
('باقة البداية', 'Basic', 100, 'شهر', 2, 1, 200, ARRAY['إدارة المنتجات','حركة المخزون','التقارير الأساسية','الباركود']),
('الباقة الأساسية', 'Standard', 300, 'شهر', 3, 1, 500, ARRAY['إدارة المنتجات','حركة المخزون','التقارير الأساسية','الباركود','تنبيهات المخزون']),
('الباقة الاحترافية', 'Pro', 500, 'شهر', 10, 3, 5000, ARRAY['إدارة المنتجات','حركة المخزون','التقارير الذكية','الباركود','تنبيهات المخزون','الجرد المتقدم','الموارد البشرية','المحاسبة','إدارة الموردين','التالف والمرتجعات','سجل النشاطات']),
('باقة الأعمال', 'Business', 1000, 'شهر', 50, 10, 999999, ARRAY['جميع المميزات','أولوية الدعم']);

-- Seed default platform settings
INSERT INTO public.platform_settings (key, value) VALUES
('branding', '{"name": "مدار", "primaryColor": "#2563eb", "accentColor": "#c9a227", "logo": ""}'),
('currency', '{"primary": "LYD", "secondary": "USD", "rate": 4.85}'),
('contact_info', '{"email": "support@madar.ly", "phone": "+218 XX XXX XXXX", "address": "ليبيا - طرابلس", "workDays": "الأحد - الخميس: 9:00 ص - 5:00 م", "offDays": "الجمعة - السبت: مغلق"}'),
('auto_registration', 'true'),
('maintenance_mode', 'false')
ON CONFLICT DO NOTHING;

-- Enable realtime for notifications and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
