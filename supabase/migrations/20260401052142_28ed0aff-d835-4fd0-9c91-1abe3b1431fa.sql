CREATE OR REPLACE FUNCTION public.is_company_owner(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.companies
    WHERE id = _company_id
      AND owner_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.employee_belongs_to_company(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees
    WHERE company_id = _company_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS permission_overrides jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.wallet_requests
ADD COLUMN IF NOT EXISTS receipt_required boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS receipt_uploaded_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS receipt_reviewed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancel_reason text NOT NULL DEFAULT ''::text;

CREATE OR REPLACE FUNCTION public.employee_has_section_access(_company_id uuid, _section text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.company_id = _company_id
      AND e.user_id = auth.uid()
      AND e.status = 'active'
      AND (
        COALESCE(e.permissions, ARRAY[]::text[]) @> ARRAY[_section]
        OR COALESCE((e.permission_overrides -> _section ->> 'view')::boolean, false)
        OR COALESCE((e.permission_overrides -> _section ->> 'manage')::boolean, false)
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.employee_has_action_access(_company_id uuid, _section text, _action text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.employees e
    WHERE e.company_id = _company_id
      AND e.user_id = auth.uid()
      AND e.status = 'active'
      AND (
        COALESCE((e.permission_overrides -> _section ->> _action)::boolean, false)
        OR COALESCE((e.permission_overrides -> _section ->> 'manage')::boolean, false)
      )
  );
$$;

DROP POLICY IF EXISTS "Employees can view company products" ON public.products;
CREATE POLICY "Employees can view company products"
ON public.products
FOR SELECT
USING (public.employee_has_section_access(company_id, 'products'));

CREATE POLICY "Employees can insert company products"
ON public.products
FOR INSERT
WITH CHECK (public.employee_has_action_access(company_id, 'products', 'create'));

CREATE POLICY "Employees can update company products"
ON public.products
FOR UPDATE
USING (public.employee_has_action_access(company_id, 'products', 'update'));

CREATE POLICY "Employees can delete company products"
ON public.products
FOR DELETE
USING (public.employee_has_action_access(company_id, 'products', 'delete'));

DROP POLICY IF EXISTS "Company owners can manage suppliers" ON public.suppliers;
CREATE POLICY "Company owners can manage suppliers"
ON public.suppliers
FOR ALL
USING (public.is_company_owner(company_id))
WITH CHECK (public.is_company_owner(company_id));

CREATE POLICY "Employees can view company suppliers"
ON public.suppliers
FOR SELECT
USING (public.employee_has_section_access(company_id, 'suppliers'));

CREATE POLICY "Employees can insert company suppliers"
ON public.suppliers
FOR INSERT
WITH CHECK (public.employee_has_action_access(company_id, 'suppliers', 'create'));

CREATE POLICY "Employees can update company suppliers"
ON public.suppliers
FOR UPDATE
USING (public.employee_has_action_access(company_id, 'suppliers', 'update'));

CREATE POLICY "Employees can delete company suppliers"
ON public.suppliers
FOR DELETE
USING (public.employee_has_action_access(company_id, 'suppliers', 'delete'));

DROP POLICY IF EXISTS "Company owners can manage movements" ON public.stock_movements;
CREATE POLICY "Company owners can manage movements"
ON public.stock_movements
FOR ALL
USING (public.is_company_owner(company_id))
WITH CHECK (public.is_company_owner(company_id));

CREATE POLICY "Employees can view stock movements"
ON public.stock_movements
FOR SELECT
USING (public.employee_has_section_access(company_id, 'stock'));

CREATE POLICY "Employees can insert stock movements"
ON public.stock_movements
FOR INSERT
WITH CHECK (public.employee_has_action_access(company_id, 'stock', 'create'));

CREATE POLICY "Employees can update stock movements"
ON public.stock_movements
FOR UPDATE
USING (public.employee_has_action_access(company_id, 'stock', 'update'));

CREATE POLICY "Employees can delete stock movements"
ON public.stock_movements
FOR DELETE
USING (public.employee_has_action_access(company_id, 'stock', 'delete'));

DROP POLICY IF EXISTS "Employees can view company invoices" ON public.invoices;
CREATE POLICY "Employees can view company invoices"
ON public.invoices
FOR SELECT
USING (public.employee_has_section_access(company_id, 'invoices'));

CREATE POLICY "Employees can insert company invoices"
ON public.invoices
FOR INSERT
WITH CHECK (public.employee_has_action_access(company_id, 'invoices', 'create'));

CREATE POLICY "Employees can update company invoices"
ON public.invoices
FOR UPDATE
USING (public.employee_has_action_access(company_id, 'invoices', 'update'));

CREATE POLICY "Employees can delete company invoices"
ON public.invoices
FOR DELETE
USING (public.employee_has_action_access(company_id, 'invoices', 'delete'));

DROP POLICY IF EXISTS "Employees can manage company orders" ON public.orders;
DROP POLICY IF EXISTS "Employees can view company orders" ON public.orders;
CREATE POLICY "Employees can view company orders"
ON public.orders
FOR SELECT
USING (public.employee_has_section_access(company_id, 'orders'));

CREATE POLICY "Employees can insert company orders"
ON public.orders
FOR INSERT
WITH CHECK (public.employee_has_action_access(company_id, 'orders', 'create'));

CREATE POLICY "Employees can update company orders"
ON public.orders
FOR UPDATE
USING (public.employee_has_action_access(company_id, 'orders', 'update') OR public.employee_has_action_access(company_id, 'orders', 'change_status'));

CREATE POLICY "Employees can delete company orders"
ON public.orders
FOR DELETE
USING (public.employee_has_action_access(company_id, 'orders', 'delete'));

DROP POLICY IF EXISTS "Employees can update own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Employees can view own tasks" ON public.tasks;
CREATE POLICY "Employees can view own tasks"
ON public.tasks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = tasks.employee_id
      AND e.user_id = auth.uid()
  )
  OR public.employee_has_section_access(company_id, 'tasks')
);

CREATE POLICY "Employees can update own tasks"
ON public.tasks
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = tasks.employee_id
      AND e.user_id = auth.uid()
  )
  OR public.employee_has_action_access(company_id, 'tasks', 'update')
);

CREATE POLICY "Employees can insert company tasks"
ON public.tasks
FOR INSERT
WITH CHECK (public.employee_has_action_access(company_id, 'tasks', 'create'));

CREATE POLICY "Employees can delete company tasks"
ON public.tasks
FOR DELETE
USING (public.employee_has_action_access(company_id, 'tasks', 'delete'));

DROP POLICY IF EXISTS "Company owners can manage attendance" ON public.attendance;
CREATE POLICY "Company owners can manage attendance"
ON public.attendance
FOR ALL
USING (public.is_company_owner(company_id))
WITH CHECK (public.is_company_owner(company_id));

DROP POLICY IF EXISTS "Employees can view own attendance" ON public.attendance;
CREATE POLICY "Employees can view own attendance"
ON public.attendance
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = attendance.employee_id
      AND e.user_id = auth.uid()
  )
  OR public.employee_has_section_access(company_id, 'attendance')
);

DROP POLICY IF EXISTS "Employees can insert own attendance" ON public.attendance;
CREATE POLICY "Employees can insert own attendance"
ON public.attendance
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = attendance.employee_id
      AND e.user_id = auth.uid()
  )
  OR public.employee_has_action_access(company_id, 'attendance', 'create')
);

CREATE POLICY "Employees can update attendance"
ON public.attendance
FOR UPDATE
USING (public.employee_has_action_access(company_id, 'attendance', 'update'));

DROP POLICY IF EXISTS "Company owners can manage requests" ON public.employee_requests;
CREATE POLICY "Company owners can manage requests"
ON public.employee_requests
FOR ALL
USING (public.is_company_owner(company_id))
WITH CHECK (public.is_company_owner(company_id));

DROP POLICY IF EXISTS "Employees can view own requests" ON public.employee_requests;
CREATE POLICY "Employees can view requests"
ON public.employee_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_requests.employee_id
      AND e.user_id = auth.uid()
  )
  OR public.employee_has_section_access(company_id, 'requests')
);

DROP POLICY IF EXISTS "Employees can insert own requests" ON public.employee_requests;
CREATE POLICY "Employees can insert requests"
ON public.employee_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employees e
    WHERE e.id = employee_requests.employee_id
      AND e.user_id = auth.uid()
  )
  OR public.employee_has_action_access(company_id, 'requests', 'create')
);

CREATE POLICY "Employees can update requests"
ON public.employee_requests
FOR UPDATE
USING (public.employee_has_action_access(company_id, 'requests', 'update') OR public.employee_has_action_access(company_id, 'requests', 'approve') OR public.employee_has_action_access(company_id, 'requests', 'reject'));

DROP POLICY IF EXISTS "Company owners can insert wallet requests" ON public.wallet_requests;
CREATE POLICY "Company owners can insert wallet requests"
ON public.wallet_requests
FOR INSERT
WITH CHECK (public.is_company_owner(company_id));

DROP POLICY IF EXISTS "Company owners can view own wallet requests" ON public.wallet_requests;
CREATE POLICY "Company owners can view own wallet requests"
ON public.wallet_requests
FOR SELECT
USING (public.is_company_owner(company_id) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Company owners can upload wallet proof after courier"
ON public.wallet_requests
FOR UPDATE
USING (public.is_company_owner(company_id))
WITH CHECK (
  public.is_company_owner(company_id)
  AND status IN ('accepted', 'courier_sent')
);

DROP POLICY IF EXISTS "Admins can manage wallet requests" ON public.wallet_requests;
CREATE POLICY "Admins can manage wallet requests"
ON public.wallet_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_requests ENABLE ROW LEVEL SECURITY;