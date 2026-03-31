
-- Enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'company', 'employee');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name TEXT NOT NULL,
  manager_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  city TEXT DEFAULT '',
  plan TEXT DEFAULT 'trial',
  plan_name TEXT DEFAULT 'تجربة مجانية',
  wallet NUMERIC DEFAULT 0,
  trial_end TIMESTAMPTZ DEFAULT (now() + interval '7 days'),
  status TEXT DEFAULT 'active',
  logo_url TEXT DEFAULT '',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all companies" ON public.companies FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update all companies" ON public.companies FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete companies" ON public.companies FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company owners can view own company" ON public.companies FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Company owners can update own company" ON public.companies FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Anyone can insert company" ON public.companies FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  position TEXT DEFAULT '',
  department TEXT DEFAULT '',
  salary NUMERIC DEFAULT 0,
  contract_type TEXT DEFAULT 'دائم',
  contract_end TEXT DEFAULT '',
  national_id TEXT DEFAULT '',
  qualification TEXT DEFAULT '',
  bank_name TEXT DEFAULT '',
  bank_account TEXT DEFAULT '',
  status TEXT DEFAULT 'active',
  permissions TEXT[] DEFAULT ARRAY['dashboard', 'my-info'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all employees" ON public.employees FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company owners can manage employees" ON public.employees FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Employees can view own record" ON public.employees FOR SELECT USING (auth.uid() = user_id);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT DEFAULT '',
  type TEXT DEFAULT '',
  quantity INT DEFAULT 0,
  buy_price NUMERIC DEFAULT 0,
  sell_price NUMERIC DEFAULT 0,
  image_url TEXT DEFAULT '',
  barcode TEXT DEFAULT '',
  min_stock INT DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Employees can view company products" ON public.products FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.employees WHERE company_id = products.company_id AND user_id = auth.uid())
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT DEFAULT '',
  customer_city TEXT DEFAULT '',
  items JSONB DEFAULT '[]',
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cash',
  payment_proof_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Employees can view company orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.employees WHERE company_id = orders.company_id AND user_id = auth.uid())
);

-- Stock movements
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  reason TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage movements" ON public.stock_movements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  customer_name TEXT DEFAULT '',
  customer_phone TEXT DEFAULT '',
  items JSONB DEFAULT '[]',
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  discount NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage invoices" ON public.invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);

-- Attendance
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TEXT DEFAULT '',
  check_out TEXT DEFAULT '',
  status TEXT DEFAULT '',
  deduction NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage attendance" ON public.attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Employees can view own attendance" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
);
CREATE POLICY "Employees can insert own attendance" ON public.attendance FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
);

-- Employee requests
CREATE TABLE public.employee_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC DEFAULT 0,
  reason TEXT DEFAULT '',
  start_date TEXT DEFAULT '',
  end_date TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage requests" ON public.employee_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Employees can view own requests" ON public.employee_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
);
CREATE POLICY "Employees can insert own requests" ON public.employee_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
);

-- Tasks
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage tasks" ON public.tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Employees can view own tasks" ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
);
CREATE POLICY "Employees can update own tasks" ON public.tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.employees WHERE id = employee_id AND user_id = auth.uid())
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT DEFAULT '',
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone authenticated can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Wallet requests
CREATE TABLE public.wallet_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  method TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  proof_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wallet_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage wallet requests" ON public.wallet_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Company owners can view own wallet requests" ON public.wallet_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);
CREATE POLICY "Company owners can insert wallet requests" ON public.wallet_requests FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);

-- Messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can update received messages" ON public.messages FOR UPDATE USING (auth.uid() = receiver_id);

-- Platform settings
CREATE TABLE public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage settings" ON public.platform_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Anyone can read settings" ON public.platform_settings FOR SELECT USING (true);

-- Suppliers
CREATE TABLE public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  city TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners can manage suppliers" ON public.suppliers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
);

-- Activity log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company owners and admins can view activity" ON public.activity_log FOR ALL USING (
  EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND owner_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
