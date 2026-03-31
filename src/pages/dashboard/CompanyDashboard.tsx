import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, TrendingUp, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, ShoppingCart, AlertTriangle, Clock, Briefcase,
  Plus, Edit, Trash2, Download, Eye, Send, Check, Search, Upload, Calendar, Award, Flag, MessageSquare, ListChecks,
  Moon, Sun, Globe, Camera, RefreshCw, ArrowUpDown, Receipt, Printer, Volume2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import logo from "@/assets/logo-transparent.png";
import { exportToPDF, exportSimplePDF } from "@/utils/pdfExport";
import BarcodeScanner from "@/components/BarcodeScanner";
import BarcodeGenerator from "@/components/BarcodeGenerator";

const sidebarSections = [
  { title: "الرئيسية", titleEn: "Main", items: [
    { icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard", key: "dashboard" },
    { icon: CreditCard, label: "الاشتراك والباقة", labelEn: "Subscription", key: "subscription" },
    { icon: DollarSign, label: "المحفظة", labelEn: "Wallet", key: "wallet" },
  ]},
  { title: "المخزون", titleEn: "Inventory", items: [
    { icon: Package, label: "المنتجات", labelEn: "Products", key: "products" },
    { icon: Warehouse, label: "حركة المخزون", labelEn: "Stock Movements", key: "stock" },
    { icon: QrCode, label: "الباركود", labelEn: "Barcode", key: "barcode" },
    { icon: Truck, label: "الموردين", labelEn: "Suppliers", key: "suppliers" },
    { icon: RotateCcw, label: "التالف والمرتجعات", labelEn: "Damaged & Returns", key: "returns" },
  ]},
  { title: "المالية", titleEn: "Finance", items: [
    { icon: BarChart3, label: "المحاسبة", labelEn: "Accounting", key: "accounting" },
    { icon: Receipt, label: "الفواتير", labelEn: "Invoices", key: "invoices" },
  ]},
  { title: "الموارد البشرية", titleEn: "HR", items: [
    { icon: Briefcase, label: "الموارد البشرية", labelEn: "HR", key: "hr" },
    { icon: Send, label: "طلبات الموظفين", labelEn: "Employee Requests", key: "emp-requests" },
  ]},
  { title: "الشحن", titleEn: "Shipping", items: [
    { icon: Truck, label: "تتبع الطلبات", labelEn: "Orders", key: "orders" },
  ]},
  { title: "الإدارة", titleEn: "Admin", items: [
    { icon: Users, label: "المستخدمين", labelEn: "Users", key: "users" },
    { icon: UserCog, label: "الصلاحيات", labelEn: "Permissions", key: "permissions" },
    { icon: MessageSquare, label: "المراسلات", labelEn: "Messages", key: "messages" },
    { icon: Settings, label: "الإعدادات", labelEn: "Settings", key: "settings" },
  ]},
];

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const { user, role, companyId, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [walletRequests, setWalletRequests] = useState<any[]>([]);
  const [empRequests, setEmpRequests] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeMode, setBarcodeMode] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const [scannedResult, setScannedResult] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<any[]>([{ product: "", quantity: 1, price: 0 }]);
  const [chargeMethod, setChargeMethod] = useState("");
  const [chargeStep, setChargeStep] = useState(0);
  const [hrTab, setHrTab] = useState("overview");
  const [theme, setTheme] = useState(() => localStorage.getItem("madar_theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");

  const t = (ar: string, en: string) => lang === "ar" ? ar : en;
  const flatItems = sidebarSections.flatMap(s => s.items);
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

  useEffect(() => {
    if (!authLoading && (!user || role !== "company")) navigate("/login/company");
  }, [user, role, authLoading]);

  useEffect(() => {
    localStorage.setItem("madar_theme", theme);
    if (theme === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("madar_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (!companyId) return;
    const loadData = async () => {
      setLoading(true);
      const [compRes, prodsRes, empsRes, movsRes, supRes, ordRes, invRes, walRes, reqRes, taskRes, plansRes, msgsRes] = await Promise.all([
        supabase.from("companies").select("*").eq("id", companyId).single(),
        supabase.from("products").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("employees").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("stock_movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("suppliers").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("wallet_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("employee_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("tasks").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("plans").select("*").eq("active", true).order("price", { ascending: true }),
        user ? supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false }) : { data: [] },
      ]);
      setCompany(compRes.data);
      setProducts(prodsRes.data || []);
      setEmployees(empsRes.data || []);
      setMovements(movsRes.data || []);
      setSuppliers(supRes.data || []);
      setOrders(ordRes.data || []);
      setInvoices(invRes.data || []);
      setWalletRequests(walRes.data || []);
      setEmpRequests(reqRes.data || []);
      setTasks(taskRes.data || []);
      setPlans(plansRes.data || []);
      setMessagesData(msgsRes.data || []);
      setLoading(false);
    };
    loadData();
  }, [companyId, user]);

  const logout = async () => { await signOut(); navigate("/"); };

  const totalBuyValue = products.reduce((a, p) => a + (Number(p.buy_price) || 0) * (Number(p.quantity) || 0), 0);
  const totalSellValue = products.reduce((a, p) => a + (Number(p.sell_price) || 0) * (Number(p.quantity) || 0), 0);
  const totalProfit = totalSellValue - totalBuyValue;

  const stats = [
    { label: t("المنتجات", "Products"), value: products.length, icon: Package },
    { label: t("الموظفين", "Employees"), value: employees.length, icon: Users },
    { label: t("رصيد المحفظة", "Wallet"), value: `${company?.wallet || 0} ${t("د.ل", "LYD")}`, icon: DollarSign },
    { label: t("الباقة", "Plan"), value: company?.plan_name || t("تجربة مجانية", "Free Trial"), icon: CreditCard },
    { label: t("الموردين", "Suppliers"), value: suppliers.length, icon: Truck },
    { label: t("الطلبات", "Orders"), value: orders.length, icon: ShoppingCart },
  ];

  // CRUD helpers
  const saveProduct = async (data: any) => {
    await supabase.from("products").insert({ company_id: companyId, name: data.name, code: data.code, type: data.type, quantity: Number(data.quantity) || 0, buy_price: Number(data.buyPrice) || 0, sell_price: Number(data.sellPrice) || 0, barcode: data.barcode });
    const { data: prods } = await supabase.from("products").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setProducts(prods || []);
    setShowAddProduct(false);
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    setProducts(products.filter(p => p.id !== id));
  };

  const saveSupplier = async (data: any) => {
    await supabase.from("suppliers").insert({ company_id: companyId!, name: data.name, phone: data.phone, email: data.email, city: data.city, notes: data.notes });
    const { data: sups } = await supabase.from("suppliers").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setSuppliers(sups || []);
    setShowAddSupplier(false);
  };

  const saveMovement = async (data: any) => {
    await supabase.from("stock_movements").insert({ company_id: companyId!, type: data.movementType, quantity: Number(data.quantity) || 0, reason: data.reason, notes: data.notes, created_by: user?.id });
    // Update product quantity
    const product = products.find(p => p.name === data.product);
    if (product) {
      const qty = Number(data.quantity) || 0;
      const newQty = ["buy", "add", "return", "inventory"].includes(data.movementType) ? product.quantity + qty : Math.max(0, product.quantity - qty);
      await supabase.from("products").update({ quantity: newQty }).eq("id", product.id);
    }
    const { data: movs } = await supabase.from("stock_movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setMovements(movs || []);
    const { data: prods } = await supabase.from("products").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setProducts(prods || []);
    setShowAddMovement(false);
  };

  const saveUser = async (data: any) => {
    // Create Supabase auth user for employee
    const { data: authData, error } = await supabase.auth.signUp({ email: data.email, password: data.password, options: { data: { full_name: data.username } } });
    if (error) { alert(error.message); return; }
    if (authData.user) {
      await supabase.from("user_roles").insert({ user_id: authData.user.id, role: "employee" as any });
      const rolePermissions: Record<string, string[]> = {
        "مسؤول مخزن": ["dashboard","my-info","products","stock","barcode","suppliers","inventory","returns"],
        "محاسب": ["dashboard","my-info","accounting","profits","invoices","reports"],
        "مسؤول موارد بشرية": ["dashboard","my-info","hr","users","permissions"],
        "موظف عادي": ["dashboard","my-info"],
      };
      const perms = rolePermissions[data.role] || ["dashboard", "my-info"];
      await supabase.from("employees").insert({ company_id: companyId!, user_id: authData.user.id, full_name: data.username, email: data.email, position: data.role, department: data.role, permissions: perms, status: "active" });
    }
    const { data: emps } = await supabase.from("employees").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setEmployees(emps || []);
    setShowAddUser(false);
  };

  const saveInvoice = async (data: any) => {
    await supabase.from("invoices").insert({
      company_id: companyId!,
      invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      customer_name: data.clientName,
      customer_phone: data.clientPhone,
      items: invoiceItems.filter(i => i.product) as any,
      subtotal: invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0),
      tax: Number(data.tax) || 0,
      discount: Number(data.discount) || 0,
      total: invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0) - (Number(data.discount) || 0) + (Number(data.tax) || 0),
      notes: data.notes,
      status: "pending",
    });
    const { data: invs } = await supabase.from("invoices").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setInvoices(invs || []);
    setShowAddInvoice(false);
    setInvoiceItems([{ product: "", quantity: 1, price: 0 }]);
  };

  const submitWalletRequest = async (method: string, data: any) => {
    await supabase.from("wallet_requests").insert({ company_id: companyId!, amount: Number(data.amount) || 0, method, notes: data.notes || "" });
    const { data: reqs } = await supabase.from("wallet_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setWalletRequests(reqs || []);
    setChargeStep(0);
    setChargeMethod("");
    alert(t("تم إرسال طلب الشحن بنجاح!", "Wallet request submitted!"));
  };

  const saveOrder = async (data: any) => {
    await supabase.from("orders").insert({ company_id: companyId!, customer_name: data.customerName, customer_phone: data.customerPhone, customer_city: data.customerCity, total: Number(data.total) || 0, notes: data.notes, payment_method: data.paymentMethod });
    const { data: ords } = await supabase.from("orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
    setOrders(ords || []);
    setShowAddOrder(false);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const updatePermissions = async (empId: string, perms: string[]) => {
    await supabase.from("employees").update({ permissions: perms }).eq("id", empId);
    setEmployees(employees.map(e => e.id === empId ? { ...e, permissions: perms } : e));
  };

  const handleEmpRequest = async (id: string, status: string) => {
    await supabase.from("employee_requests").update({ status }).eq("id", id);
    setEmpRequests(empRequests.map(r => r.id === id ? { ...r, status } : r));
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">{t("جاري التحميل...", "Loading...")}</p></div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`fixed inset-y-0 ${lang === "ar" ? "right-0 border-l" : "left-0 border-r"} w-64 bg-card border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">{company?.company_name || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">{t("لوحة إدارة الشركة", "Company Dashboard")}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-130px)]">
          {sidebarSections.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">{lang === "ar" ? section.title : section.titleEn}</p>
              {section.items.map(item => (
                <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <item.icon className="h-4 w-4" />{lang === "ar" ? item.label : item.labelEn}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="h-4 w-4" /> {t("تسجيل الخروج", "Logout")}
          </button>
        </div>
      </aside>

      <main className={`flex-1 ${lang === "ar" ? "md:mr-64" : "md:ml-64"}`}>
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{lang === "ar" ? flatItems.find(s => s.key === activeTab)?.label : flatItems.find(s => s.key === activeTab)?.labelEn}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl hover:bg-secondary">
              {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="p-2 rounded-xl hover:bg-secondary"><Globe className="h-4 w-4 text-foreground" /></button>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border-primary/30">
                <p className="text-sm text-foreground">{t("مرحباً", "Welcome")} <span className="font-bold text-primary">{company?.manager_name}</span>!</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map(s => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <s.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-2">{t("ملخص مالي", "Financial Summary")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("رأس المال", "Capital")}</span><span className="text-foreground font-bold">{totalBuyValue} {t("د.ل", "LYD")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("قيمة المخزون", "Stock Value")}</span><span className="text-primary font-bold">{totalSellValue} {t("د.ل", "LYD")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("الربح المتوقع", "Expected Profit")}</span><span className={`font-bold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>{totalProfit} {t("د.ل", "LYD")}</span></div>
                  </div>
                </div>
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-2">{t("آخر الحركات", "Recent Movements")}</h4>
                  {movements.length === 0 ? <p className="text-xs text-muted-foreground">{t("لا توجد حركات.", "No movements.")}</p> : (
                    <div className="space-y-1">{movements.slice(0, 5).map(m => (
                      <div key={m.id} className="flex justify-between text-xs"><span className="text-foreground">{m.type}</span><span className="text-muted-foreground">{m.quantity}</span></div>
                    ))}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscription */}
          {activeTab === "subscription" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("الباقة الحالية", "Current Plan")}</h3>
                <p className="text-3xl font-black text-primary">{company?.plan_name || t("تجربة مجانية", "Free Trial")}</p>
                {company?.trial_end && (
                  <p className="text-sm text-muted-foreground mt-2">{t("تنتهي:", "Ends:")} <span className="text-warning font-bold">{new Date(company.trial_end).toLocaleDateString("ar-LY")}</span></p>
                )}
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("الباقات المتاحة", "Available Plans")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map(plan => (
                    <div key={plan.id} className="glass rounded-xl p-4 border-primary/20">
                      <h4 className="font-bold text-foreground">{plan.name}</h4>
                      <p className="text-2xl font-black text-primary mt-2">{plan.price} <span className="text-xs text-muted-foreground">{t("د.ل", "LYD")}/{plan.period}</span></p>
                      <div className="mt-2 text-xs text-muted-foreground space-y-1">
                        <p>👥 {plan.max_users} {t("مستخدم", "users")}</p>
                        <p>📦 {plan.max_products >= 999999 ? t("غير محدود", "Unlimited") : plan.max_products} {t("منتج", "products")}</p>
                      </div>
                      <button onClick={async () => {
                        await supabase.from("subscription_requests").insert({ company_id: companyId!, plan_id: plan.id, plan_name: plan.name, price: plan.price, payment_method: "محفظة" });
                        alert(t("تم إرسال طلب الاشتراك! سيراجعه مسؤول النظام.", "Subscription request sent!"));
                      }} className="mt-3 w-full px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold">{t("اشترك", "Subscribe")}</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wallet */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("رصيد المحفظة", "Wallet Balance")}</h3>
                <p className="text-3xl font-black text-primary">{company?.wallet || 0} {t("د.ل", "LYD")}</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("شحن المحفظة", "Charge Wallet")}</h3>
                {!chargeMethod ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[{ key: "cash", icon: "💵", label: t("كاش", "Cash"), desc: t("سنرسل مندوب لاستلام القيمة", "We'll send a rep") },
                      { key: "bank", icon: "🏦", label: t("تحويل مصرفي", "Bank Transfer"), desc: t("حوّل وأرفق إثبات", "Transfer and attach proof") },
                      { key: "electronic", icon: "📱", label: t("خدمات إلكترونية", "Electronic"), desc: t("ادفع عبر البطاقات", "Pay via cards") }
                    ].map(m => (
                      <button key={m.key} onClick={() => { setChargeMethod(m.key); setChargeStep(1); }} className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all text-right">
                        <h4 className="font-bold text-foreground text-sm mb-2">{m.icon} {m.label}</h4>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest(chargeMethod, Object.fromEntries(fd)); }} className="space-y-3">
                    <input name="amount" type="number" required placeholder={t("القيمة بالدينار", "Amount in LYD")} className={inputClass} />
                    <textarea name="notes" placeholder={t("ملاحظات", "Notes")} rows={2} className={inputClass} />
                    <div className="flex gap-2">
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إرسال", "Submit")}</button>
                      <button type="button" onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("رجوع", "Back")}</button>
                    </div>
                  </form>
                )}
              </div>
              {walletRequests.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-4">{t("طلبات الشحن", "Charge Requests")}</h3>
                  <div className="space-y-2">{walletRequests.map(r => (
                    <div key={r.id} className="glass rounded-xl p-3 flex justify-between items-center">
                      <div><p className="text-sm font-bold text-foreground">{r.amount} {t("د.ل", "LYD")} - {r.method}</p><p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-LY")}</p></div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "approved" ? "bg-success/20 text-success" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{r.status}</span>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("المنتجات", "Products")} ({products.length})</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddProduct(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة", "Add")}</button>
                  <button onClick={() => exportToPDF(t("المنتجات","Products"), products.map(p => ({ name: p.name, code: p.code, type: p.type, qty: p.quantity, buy: p.buy_price, sell: p.sell_price })), [t("المنتج","Product"),t("الكود","Code"),t("النوع","Type"),t("الكمية","Qty"),t("شراء","Buy"),t("بيع","Sell")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
              </div>
              {showAddProduct && (
                <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveProduct(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المنتج *", "Product Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكود", "Code")}</label><input name="code" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("النوع", "Type")}</label><input name="type" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية *", "Qty *")}</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر الشراء *", "Buy Price *")}</label><input name="buyPrice" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر البيع *", "Sell Price *")}</label><input name="sellPrice" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الباركود", "Barcode")}</label><input name="barcode" className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ", "Save")}</button>
                    <button type="button" onClick={() => setShowAddProduct(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                  </div>
                </form>
              )}
              {products.length > 0 && (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج", "Product")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية", "Qty")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("شراء", "Buy")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("بيع", "Sell")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("إجراءات", "Actions")}</th>
                    </tr></thead>
                    <tbody>{products.map(p => (
                      <tr key={p.id} className="border-b border-border/30">
                        <td className="py-2 px-3 text-foreground font-medium">{p.name}</td>
                        <td className="py-2 px-3 text-foreground">{p.quantity}</td>
                        <td className="py-2 px-3 text-muted-foreground">{p.buy_price}</td>
                        <td className="py-2 px-3 text-primary font-bold">{p.sell_price}</td>
                        <td className="py-2 px-3"><button onClick={() => deleteProduct(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {products.length === 0 && !showAddProduct && (
                <div className="glass rounded-2xl p-6 text-center"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لم تقم بإضافة أي منتجات.", "No products added.")}</p></div>
              )}
            </div>
          )}

          {/* Stock Movements */}
          {activeTab === "stock" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("حركة المخزون", "Stock Movements")}</h3>
                <button onClick={() => setShowAddMovement(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة", "Add")}</button>
              </div>
              {showAddMovement && (
                <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveMovement(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("المنتج", "Product")}</label><select name="product" className={inputClass}>{products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع الحركة", "Type")}</label><select name="movementType" className={inputClass}><option value="buy">{t("شراء", "Buy")}</option><option value="sell">{t("بيع", "Sell")}</option><option value="add">{t("إضافة", "Add")}</option><option value="remove">{t("سحب", "Remove")}</option><option value="damage">{t("تلف", "Damage")}</option><option value="return">{t("مرتجع", "Return")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية", "Qty")}</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("السبب", "Reason")}</label><input name="reason" className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ", "Save")}</button>
                    <button type="button" onClick={() => setShowAddMovement(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                  </div>
                </form>
              )}
              {movements.length > 0 ? (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("النوع", "Type")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية", "Qty")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("السبب", "Reason")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("التاريخ", "Date")}</th>
                    </tr></thead>
                    <tbody>{movements.map(m => (
                      <tr key={m.id} className="border-b border-border/30">
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{m.type}</span></td>
                        <td className="py-2 px-3 text-foreground">{m.quantity}</td>
                        <td className="py-2 px-3 text-muted-foreground">{m.reason || "-"}</td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleDateString("ar-LY")}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : (
                <div className="glass rounded-2xl p-6 text-center"><Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد حركات.", "No movements.")}</p></div>
              )}
            </div>
          )}

          {/* Barcode */}
          {activeTab === "barcode" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => setBarcodeMode("generate")} className="glass rounded-2xl p-6 text-center hover:border-primary/50 transition-all">
                  <QrCode className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h4 className="font-bold text-foreground">{t("إنشاء باركود", "Generate Barcode")}</h4>
                </button>
                <button onClick={() => setShowBarcodeScanner(true)} className="glass rounded-2xl p-6 text-center hover:border-primary/50 transition-all">
                  <Camera className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h4 className="font-bold text-foreground">{t("مسح باركود", "Scan Barcode")}</h4>
                </button>
              </div>
              {barcodeMode === "generate" && (
                <div className="glass rounded-2xl p-6">
                  <input value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} placeholder={t("أدخل رمز الباركود", "Enter barcode")} className={inputClass} />
                  <button onClick={() => setGeneratedBarcode(barcodeInput || `MDR${Date.now().toString().slice(-8)}`)} className="mt-3 px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إنشاء", "Generate")}</button>
                  {generatedBarcode && <div className="mt-4"><BarcodeGenerator value={generatedBarcode} /></div>}
                </div>
              )}
              {showBarcodeScanner && <BarcodeScanner onResult={r => { setScannedResult(r); setShowBarcodeScanner(false); }} onClose={() => setShowBarcodeScanner(false)} />}
              {scannedResult && <div className="glass rounded-2xl p-4"><p className="text-sm text-foreground">{t("نتيجة المسح:", "Scan result:")} <span className="font-bold text-primary">{scannedResult}</span></p></div>}
            </div>
          )}

          {/* Suppliers */}
          {activeTab === "suppliers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("الموردين", "Suppliers")} ({suppliers.length})</h3>
                <button onClick={() => setShowAddSupplier(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة", "Add")}</button>
              </div>
              {showAddSupplier && (
                <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveSupplier(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("الاسم *", "Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف", "Phone")}</label><input name="phone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("البريد", "Email")}</label><input name="email" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المدينة", "City")}</label><input name="city" className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ", "Save")}</button>
                    <button type="button" onClick={() => setShowAddSupplier(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                  </div>
                </form>
              )}
              {suppliers.length > 0 ? (
                <div className="space-y-2">{suppliers.map(s => (
                  <div key={s.id} className="glass rounded-xl p-3 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-foreground">{s.name}</p><p className="text-xs text-muted-foreground">{s.phone} · {s.city}</p></div>
                  </div>
                ))}</div>
              ) : !showAddSupplier && (
                <div className="glass rounded-2xl p-6 text-center"><Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا يوجد موردين.", "No suppliers.")}</p></div>
              )}
            </div>
          )}

          {/* Returns/Damaged */}
          {activeTab === "returns" && (
            <div className="glass rounded-2xl p-6 text-center"><RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("سجّل التالف والمرتجعات من حركة المخزون.", "Record damaged/returns via stock movements.")}</p></div>
          )}

          {/* Accounting */}
          {activeTab === "accounting" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("المحاسبة", "Accounting")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("رأس المال", "Capital")}</p><p className="text-xl font-black text-foreground">{totalBuyValue} {t("د.ل", "LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الأرباح", "Profits")}</p><p className="text-xl font-black text-success">{totalProfit > 0 ? totalProfit : 0} {t("د.ل", "LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("المخزون", "Stock")}</p><p className="text-xl font-black text-primary">{totalSellValue} {t("د.ل", "LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("المحفظة", "Wallet")}</p><p className="text-xl font-black text-primary">{company?.wallet || 0} {t("د.ل", "LYD")}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("الفواتير", "Invoices")} ({invoices.length})</h3>
                <button onClick={() => setShowAddInvoice(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إنشاء فاتورة", "Create Invoice")}</button>
              </div>
              {showAddInvoice && (
                <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveInvoice(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم العميل *", "Client *")}</label><input name="clientName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف", "Phone")}</label><input name="clientPhone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الخصم", "Discount")}</label><input name="discount" type="number" defaultValue={0} className={inputClass} /></div>
                  </div>
                  <div className="space-y-2">
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2">
                        <div className="col-span-5"><select value={item.product} onChange={e => { const items = [...invoiceItems]; items[idx].product = e.target.value; const prod = products.find(p => p.name === e.target.value); if (prod) items[idx].price = Number(prod.sell_price); setInvoiceItems(items); }} className={inputClass}><option value="">{t("اختر", "Select")}</option>{products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                        <div className="col-span-3"><input type="number" value={item.quantity} onChange={e => { const items = [...invoiceItems]; items[idx].quantity = Number(e.target.value); setInvoiceItems(items); }} className={inputClass} /></div>
                        <div className="col-span-3"><input type="number" value={item.price} onChange={e => { const items = [...invoiceItems]; items[idx].price = Number(e.target.value); setInvoiceItems(items); }} className={inputClass} /></div>
                        <div className="col-span-1"><button type="button" onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="text-destructive p-2"><Trash2 className="h-4 w-4" /></button></div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { product: "", quantity: 1, price: 0 }])} className="text-xs text-primary">{t("+ إضافة بند", "+ Add item")}</button>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ", "Save")}</button>
                    <button type="button" onClick={() => setShowAddInvoice(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                  </div>
                </form>
              )}
              {invoices.length > 0 ? (
                <div className="space-y-2">{invoices.map(inv => (
                  <div key={inv.id} className="glass rounded-xl p-3 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-foreground">{inv.invoice_number} - {inv.customer_name}</p><p className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("ar-LY")}</p></div>
                    <span className="text-sm font-bold text-primary">{inv.total} {t("د.ل", "LYD")}</span>
                  </div>
                ))}</div>
              ) : !showAddInvoice && (
                <div className="glass rounded-2xl p-6 text-center"><Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد فواتير.", "No invoices.")}</p></div>
              )}
            </div>
          )}

          {/* HR */}
          {activeTab === "hr" && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {["overview", "employees", "salaries", "tasks"].map(tab => (
                  <button key={tab} onClick={() => setHrTab(tab)} className={`px-4 py-2 rounded-xl text-sm ${hrTab === tab ? "gradient-primary text-primary-foreground font-bold" : "glass text-foreground"}`}>
                    {tab === "overview" ? t("نظرة عامة", "Overview") : tab === "employees" ? t("الموظفين", "Employees") : tab === "salaries" ? t("الرواتب", "Salaries") : t("المهام", "Tasks")}
                  </button>
                ))}
              </div>
              {hrTab === "overview" && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="glass rounded-2xl p-5"><Briefcase className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("الموظفين", "Employees")}</p><p className="text-2xl font-black text-foreground">{employees.length}</p></div>
                  <div className="glass rounded-2xl p-5"><Send className="h-5 w-5 text-warning mb-2" /><p className="text-xs text-muted-foreground">{t("طلبات معلقة", "Pending")}</p><p className="text-2xl font-black text-warning">{empRequests.filter(r => r.status === "pending").length}</p></div>
                  <div className="glass rounded-2xl p-5"><ListChecks className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("المهام", "Tasks")}</p><p className="text-2xl font-black text-foreground">{tasks.length}</p></div>
                </div>
              )}
              {hrTab === "employees" && (
                <div className="space-y-2">{employees.map(e => (
                  <div key={e.id} className="glass rounded-xl p-3 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-foreground">{e.full_name}</p><p className="text-xs text-muted-foreground">{e.position} · {e.email}</p></div>
                    <span className="text-sm font-bold text-primary">{e.salary || 0} {t("د.ل", "LYD")}</span>
                  </div>
                ))}</div>
              )}
              {hrTab === "salaries" && (
                <div className="space-y-2">{employees.map(e => (
                  <div key={e.id} className="glass rounded-xl p-3 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-foreground">{e.full_name}</p><p className="text-xs text-muted-foreground">{e.position}</p></div>
                    <span className="text-sm font-bold text-primary">{e.salary || 0} {t("د.ل", "LYD")}</span>
                  </div>
                ))}</div>
              )}
              {hrTab === "tasks" && (
                <div className="space-y-2">{tasks.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد مهام.", "No tasks.")}</p> : tasks.map(tk => (
                  <div key={tk.id} className="glass rounded-xl p-3 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-foreground">{tk.title}</p><p className="text-xs text-muted-foreground">{tk.description}</p></div>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{tk.status}</span>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Employee Requests */}
          {activeTab === "emp-requests" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("طلبات الموظفين", "Employee Requests")}</h3>
              {empRequests.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><Send className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد طلبات.", "No requests.")}</p></div> : (
                <div className="space-y-2">{empRequests.map(r => (
                  <div key={r.id} className="glass rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <div><p className="text-sm font-bold text-foreground">{r.type} - {r.reason}</p><p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-LY")}</p></div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "approved" ? "bg-success/20 text-success" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{r.status}</span>
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEmpRequest(r.id, "approved")} className="px-3 py-1 rounded-lg bg-success/20 text-success text-xs">{t("قبول", "Approve")}</button>
                        <button onClick={() => handleEmpRequest(r.id, "rejected")} className="px-3 py-1 rounded-lg bg-destructive/20 text-destructive text-xs">{t("رفض", "Reject")}</button>
                      </div>
                    )}
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("تتبع الطلبات", "Orders")} ({orders.length})</h3>
                <button onClick={() => setShowAddOrder(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("طلب جديد", "New Order")}</button>
              </div>
              {showAddOrder && (
                <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveOrder(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم العميل *", "Client *")}</label><input name="customerName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف", "Phone")}</label><input name="customerPhone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المدينة", "City")}</label><input name="customerCity" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الإجمالي", "Total")}</label><input name="total" type="number" className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ", "Save")}</button>
                    <button type="button" onClick={() => setShowAddOrder(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                  </div>
                </form>
              )}
              {orders.length > 0 ? (
                <div className="space-y-2">{orders.map(o => (
                  <div key={o.id} className="glass rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div><p className="text-sm font-bold text-foreground">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.customer_city} · {o.total} {t("د.ل", "LYD")}</p></div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${o.status === "delivered" ? "bg-success/20 text-success" : o.status === "shipped" ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning"}`}>{o.status}</span>
                    </div>
                    <div className="flex gap-1">
                      {["pending", "processing", "shipped", "delivered"].map(s => (
                        <button key={s} onClick={() => updateOrderStatus(o.id, s)} className={`text-[10px] px-2 py-1 rounded-lg ${o.status === s ? "gradient-primary text-primary-foreground" : "glass text-muted-foreground"}`}>{s === "pending" ? t("معلّق", "Pending") : s === "processing" ? t("تنفيذ", "Processing") : s === "shipped" ? t("شحن", "Shipped") : t("تسليم", "Delivered")}</button>
                      ))}
                    </div>
                  </div>
                ))}</div>
              ) : !showAddOrder && (
                <div className="glass rounded-2xl p-6 text-center"><Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد طلبات.", "No orders.")}</p></div>
              )}
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("المستخدمين", "Users")} ({employees.length})</h3>
                <button onClick={() => setShowAddUser(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة", "Add")}</button>
              </div>
              {showAddUser && (
                <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveUser(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("الاسم *", "Name *")}</label><input name="username" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("البريد *", "Email *")}</label><input name="email" type="email" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("كلمة المرور *", "Password *")}</label><input name="password" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الصلاحية", "Role")}</label><select name="role" className={inputClass}><option>{t("مسؤول مخزن", "Stock Manager")}</option><option>{t("محاسب", "Accountant")}</option><option>{t("مسؤول موارد بشرية", "HR Manager")}</option><option>{t("موظف عادي", "Regular")}</option></select></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إضافة", "Add")}</button>
                    <button type="button" onClick={() => setShowAddUser(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                  </div>
                </form>
              )}
              {employees.length > 0 && (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الاسم", "Name")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("البريد", "Email")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الصلاحية", "Role")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة", "Status")}</th>
                    </tr></thead>
                    <tbody>{employees.map(e => (
                      <tr key={e.id} className="border-b border-border/30">
                        <td className="py-2 px-3 text-foreground font-bold">{e.full_name}</td>
                        <td className="py-2 px-3 text-muted-foreground">{e.email}</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{e.position}</span></td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">{t("نشط", "Active")}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Permissions */}
          {activeTab === "permissions" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">{t("الصلاحيات", "Permissions")}</h3>
              {employees.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا يوجد موظفون.", "No employees.")}</p> : (
                <div className="space-y-4">{employees.map(emp => {
                  const empPerms: string[] = emp.permissions || ["dashboard", "my-info"];
                  return (
                    <div key={emp.id} className="glass rounded-xl p-4">
                      <p className="font-bold text-foreground mb-2">{emp.full_name} - <span className="text-primary">{emp.position}</span></p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {flatItems.filter(i => !["dashboard", "subscription", "wallet"].includes(i.key)).map(item => (
                          <label key={item.key} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input type="checkbox" checked={empPerms.includes(item.key)} onChange={e => {
                              let newPerms = [...empPerms];
                              if (e.target.checked) { if (!newPerms.includes(item.key)) newPerms.push(item.key); }
                              else { newPerms = newPerms.filter(p => p !== item.key); }
                              updatePermissions(emp.id, newPerms);
                            }} className="rounded accent-primary" />
                            {lang === "ar" ? item.label : item.labelEn}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}</div>
              )}
            </div>
          )}

          {/* Messages */}
          {activeTab === "messages" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">{t("المراسلات", "Messages")}</h3>
              <form onSubmit={async e => {
                e.preventDefault();
                const fd = new FormData(e.target as HTMLFormElement);
                const message = fd.get("message") as string;
                if (!message || !user) return;
                // Send to admin - find admin user
                const { data: adminRole } = await supabase.from("user_roles").select("user_id").eq("role", "admin" as any).limit(1).single();
                if (adminRole) {
                  await supabase.from("messages").insert({ sender_id: user.id, receiver_id: adminRole.user_id, content: message });
                }
                (e.target as HTMLFormElement).reset();
                alert(t("تم إرسال الرسالة!", "Message sent!"));
                const { data: msgs } = await supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false });
                setMessagesData(msgs || []);
              }} className="space-y-3 mb-6">
                <textarea name="message" required rows={3} placeholder={t("اكتب رسالتك...", "Write message...")} className={inputClass} />
                <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Send className="h-4 w-4" /> {t("إرسال", "Send")}</button>
              </form>
              {messagesData.length > 0 && (
                <div className="space-y-2">{messagesData.map(m => (
                  <div key={m.id} className={`glass rounded-xl p-3 ${m.sender_id === user?.id ? "" : "border-primary/20"}`}>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${m.sender_id === user?.id ? "bg-accent/20 text-accent" : "bg-primary/20 text-primary"}`}>{m.sender_id === user?.id ? t("أنت", "You") : t("مسؤول النظام", "Admin")}</span>
                    <p className="text-sm text-foreground mt-1">{m.content}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleDateString("ar-LY")}</p>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">{t("الإعدادات", "Settings")}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <p className="text-sm font-bold text-foreground">{t("المظهر", "Theme")}</p>
                  <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm">
                    {theme === "dark" ? t("نهاري", "Light") : t("ليلي", "Dark")}
                  </button>
                </div>
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <p className="text-sm font-bold text-foreground">{t("اللغة", "Language")}</p>
                  <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm">
                    {lang === "ar" ? "English" : "العربية"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
