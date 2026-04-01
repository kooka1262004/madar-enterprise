CREATE POLICY "Employees can view own company"
ON public.companies
FOR SELECT
USING (public.employee_belongs_to_company(id));

CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all invoices"
ON public.invoices
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all suppliers"
ON public.suppliers
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all stock movements"
ON public.stock_movements
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all employee requests"
ON public.employee_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all attendance"
ON public.attendance
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all tasks"
ON public.tasks
FOR SELECT
USING (has_role(auth.uid(), 'admin'));