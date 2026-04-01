import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, TrendingUp, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, ShoppingCart, AlertTriangle, Clock, Briefcase,
  Plus, Edit, Trash2, Download, Eye, Send, Check, Search, Upload, Calendar, Award, Flag, MessageSquare, ListChecks,
  Moon, Sun, Globe, Camera, RefreshCw, ArrowUpDown, Receipt, Printer, Volume2, Shield, Target, Wallet, ChevronDown, ChevronRight, AlertCircle, Info, Banknote, Building2, MapPin, Phone, Mail, FileCheck, UserPlus, CheckCircle2, XCircle, ArrowLeft
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
    { icon: Wallet, label: "المحفظة", labelEn: "Wallet", key: "wallet" },
  ]},
  { title: "المخزون", titleEn: "Inventory", items: [
    { icon: Package, label: "المنتجات", labelEn: "Products", key: "products" },
    { icon: Building2, label: "المخازن", labelEn: "Warehouses", key: "warehouses" },
    { icon: Warehouse, label: "حركة المخزون", labelEn: "Stock", key: "stock" },
    { icon: QrCode, label: "الباركود", labelEn: "Barcode", key: "barcode" },
    { icon: Truck, label: "الموردين", labelEn: "Suppliers", key: "suppliers" },
    { icon: RotateCcw, label: "التالف والمرتجعات", labelEn: "Returns", key: "returns" },
    { icon: ClipboardList, label: "الجرد", labelEn: "Inventory", key: "inventory" },
    { icon: Target, label: "إعادة الطلب", labelEn: "Reorder", key: "reorder" },
  ]},
  { title: "المالية", titleEn: "Finance", items: [
    { icon: BarChart3, label: "المحاسبة", labelEn: "Accounting", key: "accounting" },
    { icon: Receipt, label: "الفواتير", labelEn: "Invoices", key: "invoices" },
    { icon: TrendingUp, label: "الأرباح", labelEn: "Profits", key: "profits" },
    { icon: FileText, label: "التقارير", labelEn: "Reports", key: "reports" },
  ]},
  { title: "الشحن", titleEn: "Shipping", items: [
    { icon: ShoppingCart, label: "تتبع الطلبات", labelEn: "Orders", key: "orders" },
  ]},
  { title: "الموارد البشرية", titleEn: "HR", items: [
    { icon: Briefcase, label: "الموارد البشرية", labelEn: "HR", key: "hr" },
    { icon: Send, label: "طلبات الموظفين", labelEn: "Requests", key: "emp-requests" },
  ]},
  { title: "الإدارة", titleEn: "Admin", items: [
    { icon: Users, label: "المستخدمين", labelEn: "Users", key: "users" },
    { icon: UserCog, label: "الصلاحيات", labelEn: "Permissions", key: "permissions" },
    { icon: MessageSquare, label: "المراسلات", labelEn: "Messages", key: "messages" },
    { icon: Bell, label: "الإشعارات", labelEn: "Notifications", key: "notifications" },
    { icon: Settings, label: "الإعدادات", labelEn: "Settings", key: "settings" },
  ]},
];

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];
const statusMap: Record<string, { ar: string; en: string; color: string }> = {
  pending: { ar: "معلق", en: "Pending", color: "bg-warning/20 text-warning" },
  processing: { ar: "قيد التنفيذ", en: "Processing", color: "bg-primary/20 text-primary" },
  accepted: { ar: "تم القبول", en: "Accepted", color: "bg-success/20 text-success" },
  courier_sent: { ar: "تم إرسال مندوب", en: "Courier Sent", color: "bg-primary/20 text-primary" },
  shipped: { ar: "تم الشحن", en: "Shipped", color: "bg-success/20 text-success" },
  delivered: { ar: "تم التسليم", en: "Delivered", color: "bg-success/20 text-success" },
  cancelled: { ar: "ملغي", en: "Cancelled", color: "bg-destructive/20 text-destructive" },
  approved: { ar: "موافق", en: "Approved", color: "bg-success/20 text-success" },
  rejected: { ar: "مرفوض", en: "Rejected", color: "bg-destructive/20 text-destructive" },
};

const allPermissions = [
  { key: "dashboard", ar: "لوحة التحكم", en: "Dashboard" },
  { key: "my-info", ar: "شؤوني الوظيفية", en: "My Info" },
  { key: "attendance", ar: "الحضور والانصراف", en: "Attendance" },
  { key: "requests", ar: "طلباتي", en: "My Requests" },
  { key: "my-tasks", ar: "مهامي", en: "My Tasks" },
  { key: "products", ar: "المنتجات", en: "Products" },
  { key: "stock", ar: "حركة المخزون", en: "Stock" },
  { key: "barcode", ar: "الباركود", en: "Barcode" },
  { key: "suppliers", ar: "الموردين", en: "Suppliers" },
  { key: "returns", ar: "التالف والمرتجعات", en: "Returns" },
  { key: "inventory", ar: "الجرد", en: "Inventory" },
  { key: "accounting", ar: "المحاسبة", en: "Accounting" },
  { key: "invoices", ar: "الفواتير", en: "Invoices" },
  { key: "reports", ar: "التقارير", en: "Reports" },
  { key: "hr", ar: "الموارد البشرية", en: "HR" },
  { key: "users", ar: "المستخدمين", en: "Users" },
  { key: "settings", ar: "الإعدادات", en: "Settings" },
  { key: "orders", ar: "الطلبات", en: "Orders" },
  { key: "messages", ar: "المراسلات", en: "Messages" },
];

const sectionActions: Record<string, { key: string; ar: string; en: string }[]> = {
  products: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إضافة", en: "Add" },
    { key: "update", ar: "تعديل", en: "Edit" }, { key: "delete", ar: "حذف", en: "Delete" },
    { key: "export", ar: "تصدير", en: "Export" }, { key: "print", ar: "طباعة", en: "Print" },
  ],
  stock: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إضافة حركة", en: "Add" },
    { key: "update", ar: "تعديل", en: "Edit" }, { key: "delete", ar: "حذف", en: "Delete" },
    { key: "export", ar: "تصدير", en: "Export" },
  ],
  suppliers: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إضافة", en: "Add" },
    { key: "update", ar: "تعديل", en: "Edit" }, { key: "delete", ar: "حذف", en: "Delete" },
  ],
  orders: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إنشاء طلب", en: "Create" },
    { key: "update", ar: "تعديل", en: "Edit" }, { key: "delete", ar: "حذف", en: "Delete" },
    { key: "change_status", ar: "تغيير حالة", en: "Change Status" }, { key: "export", ar: "تصدير", en: "Export" },
  ],
  invoices: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إنشاء فاتورة", en: "Create" },
    { key: "update", ar: "تعديل", en: "Edit" }, { key: "delete", ar: "حذف", en: "Delete" },
    { key: "print", ar: "طباعة", en: "Print" }, { key: "export", ar: "تصدير", en: "Export" },
  ],
  accounting: [
    { key: "view", ar: "عرض", en: "View" }, { key: "export", ar: "تصدير", en: "Export" },
  ],
  reports: [
    { key: "view", ar: "عرض", en: "View" }, { key: "export", ar: "تصدير تقارير", en: "Export" },
  ],
  hr: [
    { key: "view", ar: "عرض", en: "View" }, { key: "manage", ar: "إدارة كاملة", en: "Full Manage" },
    { key: "approve", ar: "اعتماد طلبات", en: "Approve" }, { key: "reject", ar: "رفض طلبات", en: "Reject" },
  ],
  users: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إضافة", en: "Add" },
    { key: "update", ar: "تعديل", en: "Edit" }, { key: "delete", ar: "حذف", en: "Delete" },
  ],
  inventory: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إجراء جرد", en: "Run Inventory" },
    { key: "export", ar: "تصدير", en: "Export" },
  ],
  returns: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "تسجيل مرتجع", en: "Record Return" },
  ],
  barcode: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إنشاء باركود", en: "Generate" },
    { key: "upload", ar: "رفع صورة", en: "Upload" },
  ],
  attendance: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "تسجيل حضور", en: "Check-in" },
  ],
  requests: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إرسال طلبات", en: "Submit" },
    { key: "approve", ar: "اعتماد", en: "Approve" }, { key: "reject", ar: "رفض", en: "Reject" },
  ],
  messages: [
    { key: "view", ar: "عرض", en: "View" }, { key: "create", ar: "إرسال رسائل", en: "Send" },
  ],
  settings: [
    { key: "view", ar: "عرض", en: "View" }, { key: "update", ar: "تعديل", en: "Edit" },
  ],
};

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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [deliveryPrices, setDeliveryPrices] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any>({});
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(true);

  // UI state
  const [showForm, setShowForm] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<any[]>([{ product: "", quantity: 1, price: 0 }]);
  const [chargeMethod, setChargeMethod] = useState("");
  const [chargeStep, setChargeStep] = useState(0);
  const [hrTab, setHrTab] = useState("overview");
  const [accountingTab, setAccountingTab] = useState("daily");
  const [theme, setTheme] = useState(() => localStorage.getItem("madar_theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");
  const [barcodeMode, setBarcodeMode] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const [scannedResult, setScannedResult] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [walletLocation, setWalletLocation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const t = (ar: string, en: string) => lang === "ar" ? ar : en;
  const flatItems = sidebarSections.flatMap(s => s.items);
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";
  const btnPrimary = "px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold";
  const btnOutline = "px-6 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-secondary";
  const cardClass = "glass rounded-2xl p-5";

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
    if (!companyId || !user) return;
    const loadData = async () => {
      setLoading(true);
      const [compRes, prodsRes, empsRes, movsRes, supRes, ordRes, invRes, walRes, reqRes, taskRes, plansRes, msgsRes, notifRes, dpRes, subRes, attRes, psRes] = await Promise.all([
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
        supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("delivery_prices").select("*").order("city"),
        supabase.from("subscriptions").select("*").eq("company_id", companyId).eq("status", "active").order("created_at", { ascending: false }).limit(1),
        supabase.from("attendance").select("*").eq("company_id", companyId).order("date", { ascending: false }),
        supabase.from("platform_settings").select("*"),
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
      setNotifications(notifRes.data || []);
      setDeliveryPrices(dpRes.data || []);
      setSubscription(subRes.data?.[0] || null);
      setAttendanceRecords(attRes.data || []);
      const settingsObj: any = {};
      (psRes.data || []).forEach((s: any) => { settingsObj[s.key] = s.value; });
      setPlatformSettings(settingsObj);
      setLoading(false);
    };
    loadData();
  }, [companyId, user]);

  const logout = async () => { await signOut(); navigate("/"); };
  const totalBuyValue = products.reduce((a, p) => a + (Number(p.buy_price) || 0) * (Number(p.quantity) || 0), 0);
  const totalSellValue = products.reduce((a, p) => a + (Number(p.sell_price) || 0) * (Number(p.quantity) || 0), 0);
  const totalProfit = totalSellValue - totalBuyValue;
  const totalSalaries = employees.reduce((a, e) => a + (Number(e.salary) || 0), 0);
  const walletBalance = company?.wallet || 0;
  const daysLeft = subscription?.end_date ? Math.max(0, Math.ceil((new Date(subscription.end_date).getTime() - Date.now()) / 86400000)) : 0;

  const stats = [
    { label: t("المنتجات", "Products"), value: products.length, icon: Package, color: "text-primary" },
    { label: t("الموظفين", "Employees"), value: employees.length, icon: Users, color: "text-success" },
    { label: t("المحفظة", "Wallet"), value: `${walletBalance} ${t("د.ل", "LYD")}`, icon: Wallet, color: "text-warning" },
    { label: t("الباقة", "Plan"), value: company?.plan_name || t("تجربة مجانية", "Trial"), icon: CreditCard, color: "text-primary" },
    { label: t("الموردين", "Suppliers"), value: suppliers.length, icon: Truck, color: "text-muted-foreground" },
    { label: t("الطلبات", "Orders"), value: orders.length, icon: ShoppingCart, color: "text-primary" },
  ];

  // Chart data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleDateString(lang === "ar" ? "ar-LY" : "en", { month: "short" });
    const mOrders = orders.filter(o => new Date(o.created_at).getMonth() === d.getMonth());
    return { month, orders: mOrders.length, revenue: mOrders.reduce((a, o) => a + (Number(o.total) || 0), 0) };
  });

  // CRUD
  const refreshData = async (table: string) => {
    if (!companyId) return;
    if (table === "products") { const { data } = await supabase.from("products").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setProducts(data || []); }
    if (table === "employees") { const { data } = await supabase.from("employees").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setEmployees(data || []); }
    if (table === "movements") { const { data } = await supabase.from("stock_movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setMovements(data || []); }
    if (table === "suppliers") { const { data } = await supabase.from("suppliers").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setSuppliers(data || []); }
    if (table === "orders") { const { data } = await supabase.from("orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setOrders(data || []); }
    if (table === "invoices") { const { data } = await supabase.from("invoices").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setInvoices(data || []); }
    if (table === "wallet") { const { data } = await supabase.from("wallet_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setWalletRequests(data || []); const { data: c } = await supabase.from("companies").select("*").eq("id", companyId).single(); setCompany(c); }
    if (table === "emp-requests") { const { data } = await supabase.from("employee_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setEmpRequests(data || []); }
    if (table === "tasks") { const { data } = await supabase.from("tasks").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setTasks(data || []); }
    if (table === "attendance") { const { data } = await supabase.from("attendance").select("*").eq("company_id", companyId).order("date", { ascending: false }); setAttendanceRecords(data || []); }
    if (table === "notifications" && user) { const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }); setNotifications(data || []); }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd);
    await supabase.from("products").insert({ company_id: companyId, name: d.name as string, code: d.code as string, type: d.type as string, quantity: Number(d.quantity) || 0, buy_price: Number(d.buyPrice) || 0, sell_price: Number(d.sellPrice) || 0, barcode: d.barcode as string, min_stock: Number(d.minStock) || 5 });
    await refreshData("products");
    setShowForm("");
  };

  const saveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd);
    await supabase.from("suppliers").insert({ company_id: companyId!, name: d.name as string, phone: d.phone as string, email: d.email as string, city: d.city as string, notes: d.notes as string });
    await refreshData("suppliers");
    setShowForm("");
  };

  const saveMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd);
    const product = products.find(p => p.id === d.productId);
    await supabase.from("stock_movements").insert({ company_id: companyId!, product_id: d.productId as string, type: d.movementType as string, quantity: Number(d.quantity) || 0, reason: d.reason as string, notes: d.notes as string, created_by: user?.id });
    if (product) {
      const qty = Number(d.quantity) || 0;
      const newQty = ["buy", "add", "return"].includes(d.movementType as string) ? (product.quantity || 0) + qty : Math.max(0, (product.quantity || 0) - qty);
      await supabase.from("products").update({ quantity: newQty }).eq("id", product.id);
    }
    await refreshData("movements");
    await refreshData("products");
    setShowForm("");
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd);
    const rolePerms: Record<string, string[]> = {
      "مسؤول مخزن": ["dashboard","my-info","products","stock","barcode","suppliers","inventory","returns","attendance","requests","my-tasks"],
      "محاسب": ["dashboard","my-info","accounting","invoices","reports","attendance","requests","my-tasks"],
      "مسؤول موارد بشرية": ["dashboard","my-info","hr","users","permissions","attendance","requests","my-tasks"],
      "موظف عادي": ["dashboard","my-info","attendance","requests","my-tasks"],
    };
    try {
      const { data: result, error } = await supabase.functions.invoke("create-employee", {
        body: { email: (d.email as string).trim().toLowerCase(), password: d.password as string, fullName: d.username as string, position: d.role as string, department: d.department as string || d.role as string, permissions: rolePerms[d.role as string] || ["dashboard","my-info"], companyId, salary: Number(d.salary) || 0, phone: d.phone as string || "", contractType: d.contractType as string || "دائم" },
      });
      if (error || result?.error) { alert(result?.error || t("خطأ في إنشاء الموظف", "Error")); return; }
      alert(t("تم إضافة الموظف بنجاح!", "Employee added!"));
    } catch (err: any) { alert(err.message); return; }
    await refreshData("employees");
    setShowForm("");
  };

  const saveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd);
    const sub = invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0);
    await supabase.from("invoices").insert({
      company_id: companyId!, invoice_number: `INV-${Date.now().toString().slice(-6)}`,
      customer_name: d.clientName as string, customer_phone: d.clientPhone as string,
      items: invoiceItems.filter(i => i.product) as any, subtotal: sub,
      tax: Number(d.tax) || 0, discount: Number(d.discount) || 0,
      total: sub - (Number(d.discount) || 0) + (Number(d.tax) || 0), notes: d.notes as string, status: "pending",
    });
    await refreshData("invoices");
    setShowForm("");
    setInvoiceItems([{ product: "", quantity: 1, price: 0 }]);
  };

  const saveOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd);
    await supabase.from("orders").insert({ company_id: companyId!, customer_name: d.customerName as string, customer_phone: d.customerPhone as string, customer_city: d.customerCity as string, total: Number(d.total) || 0, notes: d.notes as string, payment_method: d.paymentMethod as string });
    await refreshData("orders");
    setShowForm("");
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    if (user) await supabase.from("notifications").insert({ user_id: user.id, title: t("تحديث حالة الطلب", "Order Updated"), message: `${t("تم تغيير حالة الطلب إلى", "Status changed to")} ${statusMap[status]?.ar || status}`, type: "order" });
  };

  const submitWalletRequest = async (method: string, formData: any) => {
    const proofFile = formData.proof;
    let proofUrl = "";
    if (proofFile && proofFile instanceof File && proofFile.size > 0) {
      const fileName = `wallet/${companyId}/${Date.now()}_${proofFile.name}`;
      const { data: upData } = await supabase.storage.from("uploads").upload(fileName, proofFile);
      if (upData) proofUrl = supabase.storage.from("uploads").getPublicUrl(fileName).data.publicUrl;
    }
    await supabase.from("wallet_requests").insert({ company_id: companyId!, amount: Number(formData.amount) || 0, method, notes: formData.notes || "", proof_url: proofUrl });
    // إشعار للمسؤول عند رفع إيصال جديد
    const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    if (admins) {
      for (const admin of admins) {
        await supabase.from("notifications").insert({ user_id: admin.user_id, title: t("إيصال شحن جديد 📄","New Wallet Receipt 📄"), message: `${t("شركة","Company")} ${company?.company_name} ${t("رفعت إيصال شحن بقيمة","uploaded a receipt for")} ${formData.amount} ${t("د.ل عبر","LYD via")} ${method}`, type: "wallet" });
      }
    }
    await refreshData("wallet");
    setChargeStep(0); setChargeMethod(""); setWalletLocation("");
    alert(t("تم إرسال طلب الشحن بنجاح! سيراجعه مسؤول النظام.", "Wallet request submitted!"));
  };

  const subscribeToplan = async (plan: any) => {
    if (walletBalance < plan.price) {
      alert(t("رصيدك غير كافٍ! الرجاء شحن المحفظة أولاً.", "Insufficient balance! Please charge your wallet first."));
      setActiveTab("wallet");
      return;
    }
    if (!confirm(t(`سوف يتم خصم ${plan.price} د.ل من محفظتك تلقائياً وتفعيل الباقة مباشرة. هل توافق؟`, `${plan.price} LYD will be deducted and plan activated immediately. Confirm?`))) return;
    // خصم تلقائي من المحفظة
    const newBalance = walletBalance - plan.price;
    await supabase.from("companies").update({ wallet: newBalance, plan: plan.id, plan_name: plan.name }).eq("id", companyId);
    // إنشاء اشتراك نشط
    const endDate = new Date(); endDate.setMonth(endDate.getMonth() + (plan.period === "سنة" ? 12 : plan.period === "6 أشهر" ? 6 : 1));
    await supabase.from("subscriptions").insert({ company_id: companyId!, plan_id: plan.id, plan_name: plan.name, price: plan.price, start_date: new Date().toISOString(), end_date: endDate.toISOString(), status: "active" });
    // تسجيل حركة مالية
    await supabase.from("wallet_transactions").insert({ company_id: companyId!, amount: plan.price, type: "payment", description: `اشتراك باقة ${plan.name}` });
    setCompany({ ...company, wallet: newBalance, plan: plan.id, plan_name: plan.name });
    const { data: sub } = await supabase.from("subscriptions").select("*").eq("company_id", companyId).eq("status", "active").order("created_at", { ascending: false }).limit(1);
    setSubscription(sub?.[0] || null);
    alert(t("✅ تم الاشتراك بنجاح وخصم المبلغ من محفظتك!", "✅ Subscription activated and amount deducted!"));
  };

  const handleEmpRequest = async (id: string, status: string, notes?: string) => {
    await supabase.from("employee_requests").update({ status, admin_notes: notes || "" }).eq("id", id);
    setEmpRequests(empRequests.map(r => r.id === id ? { ...r, status, admin_notes: notes } : r));
  };

  const updatePermissions = async (empId: string, perms: string[], overrides?: any) => {
    const updateObj: any = { permissions: perms };
    if (overrides !== undefined) updateObj.permission_overrides = overrides;
    await supabase.from("employees").update(updateObj).eq("id", empId);
    setEmployees(employees.map(e => e.id === empId ? { ...e, permissions: perms, ...(overrides !== undefined ? { permission_overrides: overrides } : {}) } : e));
  };

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const d = Object.fromEntries(fd);
    await supabase.from("tasks").insert({ company_id: companyId!, title: d.title as string, description: d.description as string, employee_id: d.employeeId as string || null, priority: d.priority as string || "medium", due_date: d.dueDate as string || "", status: "pending" });
    await refreshData("tasks");
    setShowForm("");
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const s = statusMap[status] || { ar: status, en: status, color: "bg-secondary text-foreground" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.color}`}>{lang === "ar" ? s.ar : s.en}</span>;
  };

  const SectionHeader = ({ title, desc, onAdd, addLabel, onPDF, pdfLabel }: any) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
      <div>
        <h3 className="font-bold text-foreground text-lg">{title}</h3>
        {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
      </div>
      <div className="flex gap-2">
        {onPDF && <button onClick={onPDF} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> {pdfLabel || "PDF"}</button>}
        {onAdd && <button onClick={onAdd} className={`${btnPrimary} flex items-center gap-2 text-xs`}><Plus className="h-3 w-3" /> {addLabel || t("إضافة", "Add")}</button>}
      </div>
    </div>
  );

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">{t("جاري التحميل...", "Loading...")}</p></div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
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
        <nav className="p-2 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          {sidebarSections.map(section => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1 mt-2">{lang === "ar" ? section.title : section.titleEn}</p>
              {section.items.map(item => (
                <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <item.icon className="h-4 w-4" />{lang === "ar" ? item.label : item.labelEn}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10"><LogOut className="h-4 w-4" /> {t("تسجيل الخروج", "Logout")}</button>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 ${lang === "ar" ? "md:mr-64" : "md:ml-64"}`}>
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{lang === "ar" ? flatItems.find(s => s.key === activeTab)?.label : flatItems.find(s => s.key === activeTab)?.labelEn}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => { setActiveTab("notifications"); }} className="p-2 rounded-xl hover:bg-secondary relative">
              <Bell className="h-4 w-4 text-foreground" />
              {notifications.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">{notifications.filter(n => !n.read).length}</span>}
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl hover:bg-secondary">
              {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="p-2 rounded-xl hover:bg-secondary"><Globe className="h-4 w-4" /></button>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-0">

          {/* ======= DASHBOARD ======= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {daysLeft > 0 && daysLeft <= 7 && (
                <div className="bg-warning/10 border border-warning/30 rounded-2xl p-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  <p className="text-sm text-warning font-bold">{t(`تنبيه: اشتراكك ينتهي خلال ${daysLeft} أيام. جدد اشتراكك لتجنب توقف الخدمة.`, `Warning: Your subscription expires in ${daysLeft} days.`)}</p>
                </div>
              )}
              <div className={cardClass}>
                <p className="text-sm text-foreground">{t("مرحباً", "Welcome")} <span className="font-bold text-primary">{company?.manager_name}</span>! 👋</p>
                <p className="text-xs text-muted-foreground mt-1">{t("الباقة:", "Plan:")} <span className="font-bold text-primary">{company?.plan_name}</span> · {t("المحفظة:", "Wallet:")} <span className="font-bold text-success">{walletBalance} {t("د.ل", "LYD")}</span></p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {stats.map(s => (
                  <div key={s.label} className={`${cardClass} cursor-pointer hover:border-primary/50`}>
                    <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={cardClass}>
                  <h4 className="font-bold text-foreground mb-3">{t("ملخص مالي", "Financial Summary")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("رأس المال", "Capital")}</span><span className="font-bold">{totalBuyValue.toLocaleString()} {t("د.ل", "LYD")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("قيمة المخزون (بيع)", "Stock (Sell)")}</span><span className="font-bold text-primary">{totalSellValue.toLocaleString()} {t("د.ل", "LYD")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("الربح المتوقع", "Profit")}</span><span className={`font-bold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>{totalProfit.toLocaleString()} {t("د.ل", "LYD")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("إجمالي الرواتب", "Total Salaries")}</span><span className="font-bold text-warning">{totalSalaries.toLocaleString()} {t("د.ل", "LYD")}</span></div>
                  </div>
                </div>
                <div className={cardClass}>
                  <h4 className="font-bold text-foreground mb-3">{t("المبيعات الشهرية", "Monthly Sales")}</h4>
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" /></AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ======= SUBSCRIPTION ======= */}
          {activeTab === "subscription" && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-2">{t("الباقة الحالية", "Current Plan")}</h3>
                <p className="text-3xl font-black text-primary">{company?.plan_name || t("تجربة مجانية", "Free Trial")}</p>
                {subscription && <p className="text-sm text-muted-foreground mt-2">{t("تنتهي:", "Ends:")} <span className="text-warning font-bold">{new Date(subscription.end_date).toLocaleDateString("ar-LY")}</span> · {t("متبقي:", "Left:")} <span className="text-primary font-bold">{daysLeft} {t("يوم", "days")}</span></p>}
                {!subscription && company?.trial_end && <p className="text-sm text-muted-foreground mt-2">{t("الفترة التجريبية تنتهي:", "Trial ends:")} <span className="text-warning font-bold">{new Date(company.trial_end).toLocaleDateString("ar-LY")}</span></p>}
                {daysLeft > 0 && daysLeft <= 7 && <div className="mt-3 bg-warning/10 rounded-xl p-3 text-sm text-warning font-bold flex items-center gap-2"><AlertTriangle className="h-4 w-4" />{t("اشتراكك على وشك الانتهاء! جدد الآن.", "Subscription expiring soon!")}</div>}
              </div>
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-4">{t("الباقات المتاحة", "Available Plans")}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t("اختر الباقة المناسبة لك. سيتم الخصم تلقائياً من محفظتك فوراً عند الاشتراك.", "Choose a plan. Amount will be auto-deducted from your wallet immediately.")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans.map(plan => (
                    <div key={plan.id} className={`${cardClass} border ${company?.plan_name === plan.name ? "border-primary" : "border-border/50"}`}>
                      {company?.plan_name === plan.name && <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary text-primary-foreground font-bold mb-2 inline-block">{t("باقتك الحالية", "Current")}</span>}
                      <h4 className="font-bold text-foreground text-lg">{plan.name}</h4>
                      <p className="text-3xl font-black text-primary mt-2">{plan.price} <span className="text-xs text-muted-foreground">{t("د.ل", "LYD")}/{plan.period}</span></p>
                      <div className="mt-3 text-xs text-muted-foreground space-y-1">
                        <p>👥 {plan.max_users} {t("مستخدم", "users")}</p>
                        <p>📦 {plan.max_products >= 999999 ? t("غير محدود", "∞") : plan.max_products} {t("منتج", "products")}</p>
                        <p>🏪 {plan.max_stores >= 999999 ? t("غير محدود", "∞") : plan.max_stores} {t("متجر", "stores")}</p>
                        {(plan.features || []).map((f: string, i: number) => <p key={i}>✅ {f}</p>)}
                      </div>
                      <button onClick={() => subscribeToplan(plan)} disabled={company?.plan_name === plan.name} className={`w-full mt-4 ${btnPrimary} ${company?.plan_name === plan.name ? "opacity-50 cursor-not-allowed" : ""}`}>
                        {company?.plan_name === plan.name ? t("مشترك حالياً", "Current") : t("اشتراك", "Subscribe")}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======= WALLET ======= */}
          {activeTab === "wallet" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${cardClass} border-primary/30`}>
                  <Wallet className="h-8 w-8 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">{t("رصيد المحفظة الحالي", "Current Balance")}</p>
                  <p className="text-4xl font-black text-primary">{walletBalance.toLocaleString()} <span className="text-lg text-muted-foreground">{t("د.ل", "LYD")}</span></p>
                </div>
                <div className={cardClass}>
                  <p className="text-xs text-muted-foreground mb-2">{t("آخر العمليات", "Recent Transactions")}</p>
                  {walletRequests.slice(0, 3).map(wr => (
                    <div key={wr.id} className="flex justify-between items-center text-xs py-1 border-b border-border/30 last:border-0">
                      <span className="text-foreground">{wr.method} - {wr.amount} {t("د.ل", "LYD")}</span>
                      <StatusBadge status={wr.status} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Charge flow */}
              {chargeStep === 0 && (
                <div className={cardClass}>
                  <h3 className="font-bold text-foreground mb-4">{t("شحن المحفظة", "Charge Wallet")}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{t("اختر موقعك لعرض طرق الشحن المتاحة:", "Choose your location:")}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button onClick={() => { setWalletLocation("libya"); setChargeStep(1); }} className={`${cardClass} hover:border-primary/50 text-center`}>
                      <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-bold text-foreground">{t("داخل ليبيا", "Inside Libya")}</p>
                    </button>
                    <button onClick={() => { setWalletLocation("outside"); setChargeStep(1); }} className={`${cardClass} hover:border-primary/50 text-center`}>
                      <Globe className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-bold text-foreground">{t("خارج ليبيا", "Outside Libya")}</p>
                    </button>
                  </div>
                </div>
              )}

              {chargeStep === 1 && walletLocation === "libya" && (
                <div className={cardClass}>
                  <button onClick={() => setChargeStep(0)} className="text-xs text-primary mb-3 flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> {t("رجوع", "Back")}</button>
                  <h3 className="font-bold text-foreground mb-4">{t("اختر طريقة الشحن", "Choose Method")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button onClick={() => { setChargeMethod("cash"); setChargeStep(2); }} className={`${cardClass} hover:border-primary/50 text-center`}>
                      <Banknote className="h-8 w-8 text-success mx-auto mb-2" />
                      <p className="font-bold text-foreground text-sm">{t("كاش", "Cash")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("عبر مندوب", "Via courier")}</p>
                    </button>
                    <button onClick={() => { setChargeMethod("bank"); setChargeStep(2); }} className={`${cardClass} hover:border-primary/50 text-center`}>
                      <Building2 className="h-8 w-8 text-primary mx-auto mb-2" />
                      <p className="font-bold text-foreground text-sm">{t("تحويل مصرفي", "Bank Transfer")}</p>
                    </button>
                    <button onClick={() => { setChargeMethod("eservice"); setChargeStep(2); }} className={`${cardClass} hover:border-primary/50 text-center`}>
                      <CreditCard className="h-8 w-8 text-warning mx-auto mb-2" />
                      <p className="font-bold text-foreground text-sm">{t("خدمات إلكترونية", "E-Services")}</p>
                      <p className="text-[10px] text-muted-foreground">{t("يسر باي، سحاري باي", "YusrPay, SafariPay")}</p>
                    </button>
                  </div>
                </div>
              )}

              {chargeStep === 1 && walletLocation === "outside" && (
                <div className={cardClass}>
                  <button onClick={() => setChargeStep(0)} className="text-xs text-primary mb-3 flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> {t("رجوع", "Back")}</button>
                  <h3 className="font-bold text-foreground mb-4">{t("الشحن من خارج ليبيا", "Charge from Outside Libya")}</h3>
                  <button onClick={() => { setChargeMethod("binance"); setChargeStep(2); }} className={`${cardClass} hover:border-primary/50 text-center w-full`}>
                    <DollarSign className="h-8 w-8 text-warning mx-auto mb-2" />
                    <p className="font-bold text-foreground">{t("باينانس (USDT)", "Binance (USDT)")}</p>
                    <p className="text-[10px] text-muted-foreground">{t("العملة: دولار أمريكي", "Currency: USD")}</p>
                  </button>
                </div>
              )}

              {chargeStep === 2 && chargeMethod === "cash" && (
                <div className={cardClass}>
                  <button onClick={() => setChargeStep(1)} className="text-xs text-primary mb-3 flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> {t("رجوع", "Back")}</button>
                  <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4">
                    <p className="text-sm text-warning font-bold">⚠️ {t("عملنا العزيز، في هذه العملية سوف نرسل لك مندوب لاستلام القيمة منك. لا تفعلها إلا إذا كنت متأكداً من طلبك.", "Dear customer, a courier will be sent to collect the amount. Only proceed if you are sure.")}</p>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("كاش", Object.fromEntries(fd)); }} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold text-foreground">{t("اسم المستلم *", "Receiver Name *")}</label><input name="receiverName" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("اسم الشركة *", "Company *")}</label><input name="companyName" defaultValue={company?.company_name} required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("رقم الهاتف *", "Phone *")}</label><input name="phone" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("المدينة *", "City *")}</label>
                        <select name="city" required className={inputClass}><option value="">{t("اختر", "Select")}</option>{deliveryPrices.map(dp => <option key={dp.id} value={dp.city}>{dp.city} ({dp.price} {t("د.ل توصيل", "LYD delivery")})</option>)}</select>
                      </div>
                      <div><label className="text-xs font-bold text-foreground">{t("المنطقة", "Area")}</label><input name="area" className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("القيمة بالدينار الليبي *", "Amount LYD *")}</label><input name="amount" type="number" required className={inputClass} /></div>
                    </div>
                    <div className="bg-warning/10 rounded-xl p-3 text-xs text-warning">⚠️ {t("ملاحظة: إذا لم ترسل صورة الواصل عند الاستلام من المندوب فلا يمكن شحن المحفظة.", "Note: Without receipt photo from courier, wallet cannot be charged.")}</div>
                    <div className="flex gap-2">
                      <button type="submit" className={btnPrimary}>{t("إرسال الطلب", "Submit")}</button>
                      <button type="button" onClick={() => { setChargeStep(0); setChargeMethod(""); }} className={btnOutline}>{t("إلغاء", "Cancel")}</button>
                    </div>
                  </form>
                </div>
              )}

              {chargeStep === 2 && chargeMethod === "bank" && (
                <div className={cardClass}>
                  <button onClick={() => setChargeStep(1)} className="text-xs text-primary mb-3 flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> {t("رجوع", "Back")}</button>
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                    <p className="text-sm text-primary font-bold">{t("عملنا العزيز، سوف ترى رقم حساب للتحويل ثم تعبئة النموذج وإرساله.", "Dear customer, you'll see the account number for transfer, then fill the form.")}</p>
                    <div className="mt-3 glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{t("رقم الحساب:", "Account:")}</p>
                      <p className="text-lg font-black text-foreground">{platformSettings?.bank_account || "لم يتم تحديده"}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t("المصرف:", "Bank:")}</p>
                      <p className="text-sm font-bold text-foreground">{platformSettings?.bank_name || "لم يتم تحديده"}</p>
                    </div>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("تحويل مصرفي", Object.fromEntries(fd)); }} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold text-foreground">{t("اسم المرسل *", "Sender *")}</label><input name="senderName" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("رقم حسابك *", "Your Account *")}</label><input name="accountNumber" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("رقم الهاتف *", "Phone *")}</label><input name="phone" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("القيمة *", "Amount *")}</label><input name="amount" type="number" required className={inputClass} /></div>
                    </div>
                    <div><label className="text-xs font-bold text-foreground">{t("صورة إثبات التحويل *", "Proof Image *")}</label><input name="proof" type="file" accept="image/*" required className={inputClass} /></div>
                    <div className="bg-destructive/10 rounded-xl p-3 text-xs text-destructive font-bold">🚫 {t("بدون صورة إثبات التحويل لا تشحن المحافظ!", "Without proof image, wallet CANNOT be charged!")}</div>
                    <div className="flex gap-2">
                      <button type="submit" className={btnPrimary}>{t("إرسال", "Submit")}</button>
                      <button type="button" onClick={() => { setChargeStep(0); setChargeMethod(""); }} className={btnOutline}>{t("إلغاء", "Cancel")}</button>
                    </div>
                  </form>
                </div>
              )}

              {chargeStep === 2 && chargeMethod === "eservice" && (
                <div className={cardClass}>
                  <button onClick={() => setChargeStep(1)} className="text-xs text-primary mb-3 flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> {t("رجوع", "Back")}</button>
                  <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                    <p className="text-sm font-bold text-primary mb-2">{t("اتبع الخطوات التالية:", "Follow these steps:")}</p>
                    <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>{t("اضغط على الرابط أدناه", "Click the link below")}</li>
                      <li>{t("أكمل عملية الدفع", "Complete the payment")}</li>
                      <li>{t("ارجع واملأ النموذج مع صورة الإثبات", "Return and fill the form with proof")}</li>
                    </ol>
                    <a href="https://mypay.ly/payment-link/share/iaRcZr4cFXa44OMlTriXZl2VcpO94d2X7AYPYQwWUEnwhGKZ4nGx9P3noBdU" target="_blank" rel="noopener noreferrer" className="mt-3 block text-center px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm">🔗 {t("فتح رابط الدفع", "Open Payment Link")}</a>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("خدمات إلكترونية", Object.fromEntries(fd)); }} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold text-foreground">{t("اسم المرسل *", "Sender *")}</label><input name="senderName" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("رقم الهاتف *", "Phone *")}</label><input name="phone" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("القيمة *", "Amount *")}</label><input name="amount" type="number" required className={inputClass} /></div>
                    </div>
                    <div><label className="text-xs font-bold text-foreground">{t("صورة إثبات التحويل *", "Proof *")}</label><input name="proof" type="file" accept="image/*" required className={inputClass} /></div>
                    <div className="bg-destructive/10 rounded-xl p-3 text-xs text-destructive font-bold">🚫 {t("بدون صورة لا تشحن المحافظ!", "Without proof, wallet won't be charged!")}</div>
                    <div className="flex gap-2">
                      <button type="submit" className={btnPrimary}>{t("إرسال", "Submit")}</button>
                      <button type="button" onClick={() => { setChargeStep(0); setChargeMethod(""); }} className={btnOutline}>{t("إلغاء", "Cancel")}</button>
                    </div>
                  </form>
                </div>
              )}

              {chargeStep === 2 && chargeMethod === "binance" && (
                <div className={cardClass}>
                  <button onClick={() => setChargeStep(1)} className="text-xs text-primary mb-3 flex items-center gap-1"><ArrowLeft className="h-3 w-3" /> {t("رجوع", "Back")}</button>
                  <div className="bg-warning/10 border border-warning/30 rounded-xl p-4 mb-4">
                    <p className="text-sm font-bold text-warning">{t("التحويل عبر باينانس (USDT)", "Binance Transfer (USDT)")}</p>
                    <div className="mt-3 glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{t("تعريف باينانس:", "Binance ID:")}</p>
                      <p className="text-lg font-black text-foreground">{platformSettings?.binance_id || "لم يتم تحديده"}</p>
                      {platformSettings?.binance_link && <a href={platformSettings.binance_link} target="_blank" className="text-xs text-primary underline mt-1 block">{t("رابط المحفظة", "Wallet Link")}</a>}
                    </div>
                    <p className="text-xs text-destructive font-bold mt-3">⚠️ {t("ملاحظة: العملة دولار. لا تستخدم طريقة لا تعرفها. نحن لسنا مسؤولين عن أخطاء الدفع.", "Note: Currency is USD. Don't use methods you don't know. We're not responsible for payment errors.")}</p>
                  </div>
                  <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("باينانس", Object.fromEntries(fd)); }} className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold text-foreground">{t("اسم المرسل *", "Sender *")}</label><input name="senderName" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("رقم الهاتف *", "Phone *")}</label><input name="phone" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("تعريف باينانس الخاص بك *", "Your Binance ID *")}</label><input name="binanceId" required className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("القيمة بالدولار *", "Amount USD *")}</label><input name="amount" type="number" required className={inputClass} /></div>
                    </div>
                    <div><label className="text-xs font-bold text-foreground">{t("صورة إثبات التحويل *", "Proof *")}</label><input name="proof" type="file" accept="image/*" required className={inputClass} /></div>
                    <div className="bg-destructive/10 rounded-xl p-3 text-xs text-destructive font-bold">🚫 {t("بدون صورة لا تشحن المحافظ!", "Without proof, wallet won't be charged!")}</div>
                    <div className="flex gap-2">
                      <button type="submit" className={btnPrimary}>{t("إرسال", "Submit")}</button>
                      <button type="button" onClick={() => { setChargeStep(0); setChargeMethod(""); }} className={btnOutline}>{t("إلغاء", "Cancel")}</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Wallet History */}
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-3">{t("سجل عمليات الشحن", "Charge History")}</h3>
                {walletRequests.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد عمليات.", "No transactions.")}</p> : (
                  <div className="space-y-3">{walletRequests.map(wr => (
                    <div key={wr.id} className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold text-foreground">{wr.method} - {wr.amount} {t("د.ل", "LYD")}</p>
                          <p className="text-xs text-muted-foreground">{new Date(wr.created_at).toLocaleDateString("ar-LY")}</p>
                        </div>
                        <StatusBadge status={wr.status} />
                      </div>
                      {/* شريط تتبع حالة الطلب */}
                      {(wr.method === "كاش") && (
                        <div className="flex items-center gap-1 mb-3 mt-2">
                          {["pending","accepted","courier_sent","shipped"].map((s, i) => {
                            const wrIdx = ["pending","accepted","courier_sent","shipped"].indexOf(wr.status === "approved" ? "shipped" : wr.status);
                            return (
                            <div key={s} className="flex-1">
                              <div className={`h-1.5 rounded-full ${wrIdx >= i ? (wr.status === "cancelled" ? "bg-destructive" : "bg-primary") : "bg-border"}`} />
                              <p className="text-[8px] text-center text-muted-foreground mt-1">{statusMap[s]?.ar}</p>
                            </div>
                          );
                          })}
                        </div>
                      )}
                      {/* إذا تم إرسال مندوب - نطلب رفع الواصل */}
                      {wr.status === "courier_sent" && !wr.proof_url && (
                        <div className="bg-warning/10 border border-warning/30 rounded-xl p-3 mt-2">
                          <p className="text-sm text-warning font-bold mb-2">📄 {t("الرجاء رفع واصل وصورة تثبت الدفع لشحن المحفظة", "Please upload receipt and payment proof to charge wallet")}</p>
                          <form onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.target as HTMLFormElement);
                            const proofFile = fd.get("proof") as File;
                            if (!proofFile || proofFile.size === 0) { alert(t("يجب رفع صورة الإثبات!", "Proof image required!")); return; }
                            const fileName = `wallet/${companyId}/${Date.now()}_${proofFile.name}`;
                            const { data: upData } = await supabase.storage.from("uploads").upload(fileName, proofFile);
                            if (upData) {
                              const proofUrl = supabase.storage.from("uploads").getPublicUrl(fileName).data.publicUrl;
                              await supabase.from("wallet_requests").update({ proof_url: proofUrl, receipt_uploaded_at: new Date().toISOString() }).eq("id", wr.id);
                              // إشعار للمسؤول
                              const { data: admins } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
                              if (admins) {
                                for (const admin of admins) {
                                  await supabase.from("notifications").insert({ user_id: admin.user_id, title: t("تم رفع إيصال 📄","Receipt Uploaded 📄"), message: `${company?.company_name} ${t("رفعت إيصال شحن كاش بقيمة","uploaded cash receipt for")} ${wr.amount} ${t("د.ل","LYD")}`, type: "wallet" });
                                }
                              }
                              await refreshData("wallet");
                              alert(t("✅ تم رفع الإيصال بنجاح! سيراجعه مسؤول النظام.", "✅ Receipt uploaded! Admin will review."));
                            }
                          }} className="space-y-2">
                            <input name="proof" type="file" accept="image/*" required className={inputClass} />
                            <button type="submit" className={btnPrimary}>{t("إرسال الإثبات", "Upload Proof")}</button>
                          </form>
                        </div>
                      )}
                      {wr.status === "courier_sent" && wr.proof_url && (
                        <div className="bg-success/10 border border-success/30 rounded-xl p-3 mt-2">
                          <p className="text-sm text-success font-bold">✅ {t("تم رفع الإيصال - في انتظار مراجعة المسؤول", "Receipt uploaded - awaiting admin review")}</p>
                        </div>
                      )}
                      {/* سبب الإلغاء */}
                      {wr.status === "cancelled" && wr.cancel_reason && (
                        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 mt-2">
                          <p className="text-xs text-destructive font-bold">❌ {t("سبب الإلغاء:", "Cancel reason:")} {wr.cancel_reason}</p>
                          {wr.admin_notes && <p className="text-xs text-muted-foreground mt-1">{t("ملاحظات المسؤول:", "Admin notes:")} {wr.admin_notes}</p>}
                        </div>
                      )}
                      {wr.proof_url && <a href={wr.proof_url} target="_blank" className="text-xs text-primary underline mt-1 block">📎 {t("عرض الإثبات", "View Proof")}</a>}
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* ======= PRODUCTS ======= */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <SectionHeader title={t("المنتجات", "Products")} desc={t("إدارة جميع منتجاتك ومخزونك. أضف منتجات جديدة وتتبع الكميات والأسعار.", "Manage your products and inventory.")} onAdd={() => setShowForm("product")} addLabel={t("إضافة منتج", "Add Product")} onPDF={() => exportToPDF(t("تقرير المنتجات", "Products Report"), products.map(p => ({ [t("الاسم","Name")]: p.name, [t("الكود","Code")]: p.code, [t("النوع","Type")]: p.type, [t("الكمية","Qty")]: p.quantity, [t("شراء","Buy")]: p.buy_price, [t("بيع","Sell")]: p.sell_price })), [t("الاسم","Name"), t("الكود","Code"), t("النوع","Type"), t("الكمية","Qty"), t("شراء","Buy"), t("بيع","Sell")])} />
              {showForm === "product" && (
                <form onSubmit={saveProduct} className={`${cardClass} space-y-3`}>
                  <h4 className="font-bold text-foreground">{t("إضافة منتج جديد", "Add Product")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المنتج *", "Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("كود المنتج", "Code")}</label><input name="code" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع المنتج", "Type")}</label><select name="type" className={inputClass}><option>{t("إلكترونيات", "Electronics")}</option><option>{t("ملابس", "Clothing")}</option><option>{t("أغذية", "Food")}</option><option>{t("مستلزمات", "Supplies")}</option><option>{t("قطع غيار", "Parts")}</option><option>{t("أخرى", "Other")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية", "Qty")}</label><input name="quantity" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر الشراء", "Buy Price")}</label><input name="buyPrice" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر البيع", "Sell Price")}</label><input name="sellPrice" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الباركود", "Barcode")}</label><input name="barcode" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الحد الأدنى للمخزون", "Min Stock")}</label><input name="minStock" type="number" defaultValue={5} className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className={btnPrimary}>{t("حفظ", "Save")}</button>
                    <button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء", "Cancel")}</button>
                  </div>
                </form>
              )}
              {products.length > 0 ? (
                <div className={`${cardClass} overflow-x-auto`}>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      {[t("الاسم","Name"),t("الكود","Code"),t("النوع","Type"),t("الكمية","Qty"),t("شراء","Buy"),t("بيع","Sell"),t("حالة","Status"),t("إجراءات","Actions")].map(h => <th key={h} className="text-right py-2 px-2 text-muted-foreground text-xs">{h}</th>)}
                    </tr></thead>
                    <tbody>{products.map(p => (
                      <tr key={p.id} className="border-b border-border/30">
                        <td className="py-2 px-2 text-foreground font-bold text-xs">{p.name}</td>
                        <td className="py-2 px-2 text-muted-foreground text-xs">{p.code || "-"}</td>
                        <td className="py-2 px-2"><span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary">{p.type || "-"}</span></td>
                        <td className="py-2 px-2 text-foreground font-bold text-xs">{p.quantity}</td>
                        <td className="py-2 px-2 text-muted-foreground text-xs">{p.buy_price}</td>
                        <td className="py-2 px-2 text-primary font-bold text-xs">{p.sell_price}</td>
                        <td className="py-2 px-2">{(p.quantity || 0) <= (p.min_stock || 5) ? <span className="text-destructive text-[10px] font-bold">⚠️ {t("منخفض", "Low")}</span> : <span className="text-success text-[10px]">✅</span>}</td>
                        <td className="py-2 px-2"><button onClick={async () => { await supabase.from("products").delete().eq("id", p.id); await refreshData("products"); }} className="text-destructive hover:bg-destructive/10 p-1 rounded"><Trash2 className="h-3 w-3" /></button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : !showForm && (
                <div className={`${cardClass} text-center py-12`}><Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد منتجات. ابدأ بإضافة منتجاتك.", "No products. Start adding products.")}</p></div>
              )}
            </div>
          )}

          {/* ======= STOCK MOVEMENTS ======= */}
          {activeTab === "stock" && (
            <div className="space-y-4">
              <SectionHeader title={t("حركة المخزون", "Stock Movements")} desc={t("تتبع جميع العمليات داخل المخازن: شراء، بيع، إضافة، سحب، تلف، مرتجعات.", "Track all warehouse operations.")} onAdd={() => setShowForm("movement")} onPDF={() => exportToPDF(t("تقرير حركة المخزون", "Stock Report"), movements.map(m => ({ [t("النوع","Type")]: m.type, [t("الكمية","Qty")]: m.quantity, [t("السبب","Reason")]: m.reason, [t("التاريخ","Date")]: new Date(m.created_at).toLocaleDateString("ar-LY") })), [t("النوع","Type"), t("الكمية","Qty"), t("السبب","Reason"), t("التاريخ","Date")])} />
              {showForm === "movement" && (
                <form onSubmit={saveMovement} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("المنتج *", "Product *")}</label><select name="productId" required className={inputClass}><option value="">{t("اختر", "Select")}</option>{products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.quantity})</option>)}</select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع الحركة *", "Type *")}</label><select name="movementType" required className={inputClass}><option value="buy">{t("شراء", "Buy")}</option><option value="sell">{t("بيع", "Sell")}</option><option value="add">{t("إضافة", "Add")}</option><option value="remove">{t("سحب", "Remove")}</option><option value="damage">{t("تلف", "Damage")}</option><option value="return">{t("مرتجع", "Return")}</option><option value="expired">{t("منتهي الصلاحية", "Expired")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية *", "Qty *")}</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("السبب", "Reason")}</label><input name="reason" className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("ملاحظات", "Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ", "Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء", "Cancel")}</button></div>
                </form>
              )}
              {movements.length > 0 ? (
                <div className={`${cardClass} overflow-x-auto`}>
                  <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("النوع","Type"),t("الكمية","Qty"),t("السبب","Reason"),t("التاريخ","Date")].map(h => <th key={h} className="text-right py-2 px-3 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                    <tbody>{movements.map(m => (<tr key={m.id} className="border-b border-border/30"><td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{m.type}</span></td><td className="py-2 px-3 text-foreground">{m.quantity}</td><td className="py-2 px-3 text-muted-foreground text-xs">{m.reason || "-"}</td><td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleDateString("ar-LY")}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : <div className={`${cardClass} text-center`}><p className="text-sm text-muted-foreground">{t("لا توجد حركات.", "No movements.")}</p></div>}
            </div>
          )}

          {/* ======= BARCODE ======= */}
          {activeTab === "barcode" && (
            <div className="space-y-4">
              <div className={cardClass}><p className="text-xs text-muted-foreground">{t("استخدم الباركود لتسريع عملية البيع والجرد. يمكنك إنشاء باركود جديد، مسح باركود بالكاميرا، أو رفع صورة باركود.", "Use barcode to speed up sales and inventory. Generate, scan with camera, or upload barcode image.")}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setBarcodeMode("generate")} className={`${cardClass} hover:border-primary/50 text-center`}><QrCode className="h-10 w-10 text-primary mx-auto mb-3" /><h4 className="font-bold text-foreground">{t("إنشاء باركود", "Generate")}</h4></button>
                <button onClick={() => setShowBarcodeScanner(true)} className={`${cardClass} hover:border-primary/50 text-center`}><Camera className="h-10 w-10 text-primary mx-auto mb-3" /><h4 className="font-bold text-foreground">{t("مسح باركود", "Scan")}</h4></button>
                <button onClick={() => setBarcodeMode("upload")} className={`${cardClass} hover:border-primary/50 text-center`}><Upload className="h-10 w-10 text-warning mx-auto mb-3" /><h4 className="font-bold text-foreground">{t("رفع صورة باركود", "Upload Image")}</h4></button>
              </div>
              {barcodeMode === "generate" && (
                <div className={cardClass}>
                  <input value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} placeholder={t("أدخل رمز الباركود أو اتركه فارغاً للإنشاء تلقائياً", "Enter barcode or leave empty")} className={inputClass} />
                  <button onClick={() => setGeneratedBarcode(barcodeInput || `MDR${Date.now().toString().slice(-8)}`)} className={`mt-3 ${btnPrimary}`}>{t("إنشاء", "Generate")}</button>
                  {generatedBarcode && <div className="mt-4"><BarcodeGenerator value={generatedBarcode} /></div>}
                </div>
              )}
              {barcodeMode === "upload" && (
                <div className={cardClass}>
                  <h4 className="font-bold text-foreground mb-2">{t("رفع صورة باركود للبحث عن المنتج", "Upload barcode image to find product")}</h4>
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    // استخدام HTML5 QR Code scanner لقراءة الباركود من الصورة
                    try {
                      const { Html5Qrcode } = await import("html5-qrcode");
                      const scanner = new Html5Qrcode("barcode-upload-reader");
                      const result = await scanner.scanFile(file, true);
                      setScannedResult(result);
                      // بحث عن المنتج
                      const found = products.find(p => p.barcode === result || p.code === result);
                      if (found) {
                        alert(t(`✅ تم العثور على المنتج: ${found.name}\nالكمية: ${found.quantity}\nسعر البيع: ${found.sell_price}`, `✅ Found: ${found.name}\nQty: ${found.quantity}\nPrice: ${found.sell_price}`));
                      } else {
                        alert(t(`لم يتم العثور على منتج بهذا الباركود: ${result}`, `No product found for barcode: ${result}`));
                      }
                    } catch (err) {
                      alert(t("تعذر قراءة الباركود من الصورة. تأكد من وضوح الصورة.", "Could not read barcode from image."));
                    }
                  }} className={inputClass} />
                  <div id="barcode-upload-reader" style={{ display: "none" }} />
                  {scannedResult && (() => { const found = products.find(p => p.barcode === scannedResult || p.code === scannedResult); return found ? (
                    <div className="mt-3 glass rounded-xl p-4 border-success/30">
                      <h4 className="font-bold text-success mb-2">✅ {t("تم العثور على المنتج", "Product Found")}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">{t("الاسم:","Name:")}</span> <span className="font-bold">{found.name}</span></div>
                        <div><span className="text-muted-foreground">{t("الكود:","Code:")}</span> <span className="font-bold">{found.code || "-"}</span></div>
                        <div><span className="text-muted-foreground">{t("الكمية:","Qty:")}</span> <span className="font-bold">{found.quantity}</span></div>
                        <div><span className="text-muted-foreground">{t("سعر البيع:","Sell:")}</span> <span className="font-bold text-primary">{found.sell_price}</span></div>
                        <div><span className="text-muted-foreground">{t("سعر الشراء:","Buy:")}</span> <span className="font-bold">{found.buy_price}</span></div>
                        <div><span className="text-muted-foreground">{t("النوع:","Type:")}</span> <span className="font-bold">{found.type || "-"}</span></div>
                      </div>
                    </div>
                  ) : <div className="mt-3 glass rounded-xl p-3"><p className="text-sm">{t("نتيجة المسح:","Result:")} <span className="font-bold text-primary">{scannedResult}</span></p><p className="text-xs text-destructive mt-1">{t("لم يتم العثور على منتج بهذا الباركود","No product found")}</p></div>; })()}
                </div>
              )}
              {showBarcodeScanner && <BarcodeScanner onScan={r => { setScannedResult(r); setShowBarcodeScanner(false); const found = products.find(p => p.barcode === r || p.code === r); if (found) alert(t(`✅ المنتج: ${found.name} - الكمية: ${found.quantity} - السعر: ${found.sell_price}`,`✅ ${found.name} - Qty: ${found.quantity} - Price: ${found.sell_price}`)); else alert(t(`لم يتم العثور على منتج: ${r}`,`No product: ${r}`)); }} onClose={() => setShowBarcodeScanner(false)} />}
              {scannedResult && barcodeMode !== "upload" && <div className={cardClass}><p className="text-sm text-foreground">{t("نتيجة المسح:", "Result:")} <span className="font-bold text-primary">{scannedResult}</span></p>{(() => { const found = products.find(p => p.barcode === scannedResult || p.code === scannedResult); return found ? <p className="text-xs text-success mt-1">✅ {found.name} - {t("الكمية:","Qty:")} {found.quantity} - {t("السعر:","Price:")} {found.sell_price}</p> : <p className="text-xs text-destructive mt-1">{t("لم يتم العثور على منتج","No product found")}</p>; })()}</div>}
            </div>
          )}

          {/* ======= SUPPLIERS ======= */}
          {activeTab === "suppliers" && (
            <div className="space-y-4">
              <SectionHeader title={t("الموردين", "Suppliers")} desc={t("المورد هو الشخص أو الشركة التي تشتري منها البضائع أو تبيعها لها. أضف موردينك لتتبع التعاملات.", "A supplier is who you buy from or sell to.")} onAdd={() => setShowForm("supplier")} onPDF={() => exportToPDF(t("تقرير الموردين", "Suppliers Report"), suppliers.map(s => ({ [t("الاسم","Name")]: s.name, [t("الهاتف","Phone")]: s.phone, [t("المدينة","City")]: s.city, [t("البريد","Email")]: s.email })), [t("الاسم","Name"), t("الهاتف","Phone"), t("المدينة","City"), t("البريد","Email")])} />
              {showForm === "supplier" && (
                <form onSubmit={saveSupplier} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المورد *", "Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف", "Phone")}</label><input name="phone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("البريد", "Email")}</label><input name="email" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المدينة", "City")}</label><input name="city" className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("ملاحظات", "Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ", "Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء", "Cancel")}</button></div>
                </form>
              )}
              {suppliers.length > 0 ? <div className="space-y-2">{suppliers.map(s => (
                <div key={s.id} className="glass rounded-xl p-3 flex justify-between items-center">
                  <div><p className="text-sm font-bold text-foreground">{s.name}</p><p className="text-xs text-muted-foreground">{s.phone} · {s.city}</p></div>
                  <button onClick={async () => { await supabase.from("suppliers").delete().eq("id", s.id); await refreshData("suppliers"); }} className="text-destructive p-1"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}</div> : <div className={`${cardClass} text-center`}><Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا يوجد موردين.", "No suppliers.")}</p></div>}
            </div>
          )}

          {/* ======= RETURNS ======= */}
          {activeTab === "returns" && (
            <div className="space-y-4">
              <SectionHeader title={t("التالف والمرتجعات", "Damaged & Returns")} desc={t("سجل المنتجات التالفة أو المرتجعة مع السبب. يمكنك أيضاً تسجيلها من حركة المخزون.", "Record damaged or returned products with reasons.")} />
              {movements.filter(m => ["damage", "return", "expired"].includes(m.type)).length > 0 ? (
                <div className={`${cardClass} overflow-x-auto`}>
                  <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("النوع","Type"),t("الكمية","Qty"),t("السبب","Reason"),t("التاريخ","Date")].map(h => <th key={h} className="text-right py-2 px-3 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                    <tbody>{movements.filter(m => ["damage", "return", "expired"].includes(m.type)).map(m => (<tr key={m.id} className="border-b border-border/30"><td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${m.type === "damage" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{m.type === "damage" ? t("تالف","Damaged") : m.type === "expired" ? t("منتهي","Expired") : t("مرتجع","Return")}</span></td><td className="py-2 px-3">{m.quantity}</td><td className="py-2 px-3 text-muted-foreground text-xs">{m.reason || "-"}</td><td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleDateString("ar-LY")}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : <div className={`${cardClass} text-center`}><RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد سجلات.", "No records.")}</p></div>}
            </div>
          )}

          {/* ======= INVENTORY (JARD) ======= */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <SectionHeader title={t("الجرد", "Inventory Count")} desc={t("قم بجرد مخزونك بشكل دوري. اختر نوع الجرد وابدأ العملية.", "Count your inventory periodically.")} onAdd={() => setShowForm("inventory")} addLabel={t("بدء جرد جديد","Start Inventory")} onPDF={() => exportToPDF(t("تقرير الجرد", "Inventory Report"), products.map(p => ({ [t("الاسم","Name")]: p.name, [t("الكمية","Qty")]: p.quantity, [t("سعر الشراء","Buy")]: p.buy_price, [t("سعر البيع","Sell")]: p.sell_price, [t("القيمة","Value")]: (p.quantity || 0) * (p.sell_price || 0) })), [t("الاسم","Name"), t("الكمية","Qty"), t("سعر الشراء","Buy"), t("سعر البيع","Sell"), t("القيمة","Value")])} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[{l: t("كامل","Full"), d: t("جرد جميع المنتجات","All products"), k:"full"}, {l: t("جزئي","Partial"), d: t("منتجات مختارة","Selected"), k:"partial"}, {l: t("مفاجئ","Surprise"), d: t("عشوائي","Random"), k:"surprise"}, {l: t("دوري","Periodic"), d: t("أسبوعي/شهري","Weekly/Monthly"), k:"periodic"}].map(type => (
                  <button key={type.l} onClick={() => setShowForm(`inventory-${type.k}`)} className={`${cardClass} text-center hover:border-primary/50`}><ClipboardList className="h-6 w-6 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{type.l}</p><p className="text-[10px] text-muted-foreground">{type.d}</p></button>
                ))}
              </div>
              {showForm.startsWith("inventory") && (
                <div className={cardClass}>
                  <h4 className="font-bold text-foreground mb-3">{t("بدء جرد","Start Inventory")} - {showForm.includes("full") ? t("كامل","Full") : showForm.includes("partial") ? t("جزئي","Partial") : showForm.includes("surprise") ? t("مفاجئ","Surprise") : t("دوري","Periodic")}</h4>
                  <p className="text-xs text-muted-foreground mb-4">{t("راجع كميات المنتجات الفعلية وقارنها بالنظام. عدّل الكميات إذا وجدت فرق.","Review actual product quantities and compare with system. Adjust if different.")}</p>
                  <div className={`overflow-x-auto`}>
                    <table className="w-full text-sm"><thead><tr className="border-b border-border"><th className="text-right py-2 px-2 text-muted-foreground text-xs">{t("المنتج","Product")}</th><th className="text-right py-2 px-2 text-muted-foreground text-xs">{t("الكمية بالنظام","System Qty")}</th><th className="text-right py-2 px-2 text-muted-foreground text-xs">{t("الكمية الفعلية","Actual Qty")}</th><th className="text-right py-2 px-2 text-muted-foreground text-xs">{t("الفرق","Diff")}</th><th className="text-right py-2 px-2 text-muted-foreground text-xs">{t("تحديث","Update")}</th></tr></thead>
                      <tbody>{products.map(p => {
                        const inputId = `inv-${p.id}`;
                        return (
                          <tr key={p.id} className="border-b border-border/30">
                            <td className="py-2 px-2 text-xs font-bold">{p.name}</td>
                            <td className="py-2 px-2 text-xs text-center">{p.quantity}</td>
                            <td className="py-2 px-2"><input id={inputId} type="number" defaultValue={p.quantity} className="w-20 px-2 py-1 rounded border border-border bg-secondary text-foreground text-xs text-center" /></td>
                            <td className="py-2 px-2 text-xs text-center" id={`diff-${p.id}`}>0</td>
                            <td className="py-2 px-2"><button onClick={async () => {
                              const el = document.getElementById(inputId) as HTMLInputElement;
                              const newQty = Number(el?.value) || 0;
                              const diff = newQty - (p.quantity || 0);
                              if (diff !== 0) {
                                await supabase.from("products").update({ quantity: newQty }).eq("id", p.id);
                                await supabase.from("stock_movements").insert({ company_id: companyId!, product_id: p.id, type: diff > 0 ? "add" : "remove", quantity: Math.abs(diff), reason: t("تعديل جرد","Inventory adjustment"), notes: `${t("جرد","Inventory")} ${showForm.replace("inventory-","")}`, created_by: user?.id });
                                await refreshData("products"); await refreshData("movements");
                                alert(t("✅ تم تحديث الكمية","✅ Quantity updated"));
                              }
                            }} className="px-2 py-1 rounded text-[10px] bg-primary/20 text-primary font-bold">{t("حفظ","Save")}</button></td>
                          </tr>
                        );
                      })}</tbody>
                    </table>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={async () => { await supabase.from("activity_log").insert({ company_id: companyId!, action: "inventory", details: `${t("تم إجراء جرد","Inventory done")} ${showForm.replace("inventory-","")} - ${products.length} ${t("منتج","products")}`, user_id: user?.id }); alert(t("✅ تم حفظ الجرد بنجاح!","✅ Inventory saved!")); setShowForm(""); }} className={btnPrimary}>{t("إنهاء الجرد","Finish Inventory")}</button>
                    <button onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button>
                  </div>
                </div>
              )}
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-3">{t("ملخص المخزون الحالي", "Current Inventory Summary")}</h4>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("إجمالي المنتجات", "Total Products")}</p><p className="text-xl font-black text-foreground">{products.length}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("إجمالي الكميات", "Total Qty")}</p><p className="text-xl font-black text-primary">{products.reduce((a, p) => a + (p.quantity || 0), 0)}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("منتجات منخفضة", "Low Stock")}</p><p className="text-xl font-black text-destructive">{products.filter(p => (p.quantity || 0) <= (p.min_stock || 5)).length}</p></div>
                </div>
                <div className={`overflow-x-auto`}>
                  <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("المنتج","Product"),t("الكمية","Qty"),t("سعر الشراء","Buy"),t("سعر البيع","Sell"),t("القيمة","Value"),t("الحالة","Status")].map(h => <th key={h} className="text-right py-2 px-2 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                    <tbody>{products.map(p => (<tr key={p.id} className="border-b border-border/30"><td className="py-2 px-2 text-xs font-bold">{p.name}</td><td className="py-2 px-2 text-xs text-center">{p.quantity}</td><td className="py-2 px-2 text-xs">{p.buy_price}</td><td className="py-2 px-2 text-xs text-primary">{p.sell_price}</td><td className="py-2 px-2 text-xs font-bold">{((p.quantity || 0) * (p.sell_price || 0)).toLocaleString()}</td><td className="py-2 px-2">{(p.quantity || 0) <= (p.min_stock || 5) ? <span className="text-destructive text-[10px]">⚠️</span> : <span className="text-success text-[10px]">✅</span>}</td></tr>))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======= REORDER ======= */}
          {activeTab === "reorder" && (
            <div className="space-y-4">
              <SectionHeader title={t("إعادة الطلب الذكية", "Smart Reorder")} desc={t("يحلل النظام حركة بيع كل منتج خلال آخر 30 يوم ويحسب معدل الاستهلاك اليومي ويقترح الكميات المثالية للطلب.", "System analyzes sales movement and suggests optimal reorder quantities.")} />
              <div className={cardClass}>
                <div className="space-y-3">
                  {products.filter(p => (p.quantity || 0) <= (p.min_stock || 5) * 2).length === 0 ? (
                    <p className="text-sm text-success font-bold">✅ {t("جميع المنتجات في مستوى آمن!", "All products at safe level!")}</p>
                  ) : products.filter(p => (p.quantity || 0) <= (p.min_stock || 5) * 2).map(p => {
                    const urgency = (p.quantity || 0) <= (p.min_stock || 5) ? "🔴" : "🟡";
                    return (
                      <div key={p.id} className="glass rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">{urgency} {p.name}</p>
                          <p className="text-xs text-muted-foreground">{t("الكمية:", "Qty:")} {p.quantity} · {t("الحد الأدنى:", "Min:")} {p.min_stock || 5}</p>
                        </div>
                        <span className="text-xs font-bold text-primary">{t("اطلب:", "Order:")} {Math.max(20, ((p.min_stock || 5) * 4) - (p.quantity || 0))} {t("وحدة", "units")}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======= ACCOUNTING ======= */}
          {activeTab === "accounting" && (
            <div className="space-y-4">
              <SectionHeader title={t("المحاسبة", "Accounting")} desc={t("متابعة الأوضاع المالية بشكل يومي وأسبوعي وشهري وسنوي. يمكنك تحميل التقارير بصيغة PDF.", "Track financials daily, weekly, monthly, yearly.")} onPDF={() => exportSimplePDF(t("التقرير المالي", "Financial Report"), `<h2>${t("رأس المال","Capital")}: ${totalBuyValue} ${t("د.ل","LYD")}</h2><h2>${t("الأرباح","Profits")}: ${totalProfit} ${t("د.ل","LYD")}</h2><h2>${t("المخزون (بيع)","Stock (Sell)")}: ${totalSellValue} ${t("د.ل","LYD")}</h2><h2>${t("إجمالي الرواتب","Salaries")}: ${totalSalaries} ${t("د.ل","LYD")}</h2>`)} />
              <div className="flex gap-2 flex-wrap">
                {["daily","weekly","monthly","yearly"].map(tab => (
                  <button key={tab} onClick={() => setAccountingTab(tab)} className={`px-4 py-2 rounded-xl text-xs ${accountingTab === tab ? "gradient-primary text-primary-foreground font-bold" : "glass text-foreground"}`}>
                    {tab === "daily" ? t("يومي","Daily") : tab === "weekly" ? t("أسبوعي","Weekly") : tab === "monthly" ? t("شهري","Monthly") : t("سنوي","Yearly")}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("رأس المال", "Capital")}</p><p className="text-xl font-black text-foreground">{totalBuyValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("الأرباح", "Profits")}</p><p className="text-xl font-black text-success">{totalProfit > 0 ? totalProfit.toLocaleString() : 0}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("المخزون", "Stock")}</p><p className="text-xl font-black text-primary">{totalSellValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("الرواتب", "Salaries")}</p><p className="text-xl font-black text-warning">{totalSalaries.toLocaleString()}</p></div>
              </div>
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-3">{t("الإيرادات الشهرية", "Monthly Revenue")}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ======= INVOICES ======= */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <SectionHeader title={t("الفواتير", "Invoices")} desc={t("أنشئ فواتير احترافية لعملائك وتتبع حالتها.", "Create professional invoices for your clients.")} onAdd={() => setShowForm("invoice")} addLabel={t("إنشاء فاتورة", "Create Invoice")} onPDF={() => exportToPDF(t("تقرير الفواتير", "Invoices"), invoices.map(i => ({ [t("الرقم","#")]: i.invoice_number, [t("العميل","Client")]: i.customer_name, [t("الإجمالي","Total")]: i.total, [t("الحالة","Status")]: i.status, [t("التاريخ","Date")]: new Date(i.created_at).toLocaleDateString("ar-LY") })), [t("الرقم","#"), t("العميل","Client"), t("الإجمالي","Total"), t("الحالة","Status"), t("التاريخ","Date")])} />
              {showForm === "invoice" && (
                <form onSubmit={saveInvoice} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم العميل *", "Client *")}</label><input name="clientName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف", "Phone")}</label><input name="clientPhone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الخصم", "Discount")}</label><input name="discount" type="number" defaultValue={0} className={inputClass} /></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-foreground">{t("البنود:", "Items:")}</p>
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2">
                        <div className="col-span-5"><select value={item.product} onChange={e => { const items = [...invoiceItems]; items[idx].product = e.target.value; const prod = products.find(p => p.name === e.target.value); if (prod) items[idx].price = Number(prod.sell_price); setInvoiceItems(items); }} className={inputClass}><option value="">{t("اختر", "Select")}</option>{products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                        <div className="col-span-3"><input type="number" value={item.quantity} onChange={e => { const items = [...invoiceItems]; items[idx].quantity = Number(e.target.value); setInvoiceItems(items); }} className={inputClass} placeholder={t("الكمية","Qty")} /></div>
                        <div className="col-span-3"><input type="number" value={item.price} onChange={e => { const items = [...invoiceItems]; items[idx].price = Number(e.target.value); setInvoiceItems(items); }} className={inputClass} placeholder={t("السعر","Price")} /></div>
                        <div className="col-span-1"><button type="button" onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="text-destructive p-2"><Trash2 className="h-3 w-3" /></button></div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { product: "", quantity: 1, price: 0 }])} className="text-xs text-primary font-bold">{t("+ إضافة بند", "+ Add item")}</button>
                    <p className="text-sm font-bold text-foreground">{t("الإجمالي:", "Total:")} {invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0)} {t("د.ل", "LYD")}</p>
                  </div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ", "Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء", "Cancel")}</button></div>
                </form>
              )}
              {invoices.length > 0 ? (
                <div className="space-y-2">{invoices.map(inv => (
                  <div key={inv.id} className="glass rounded-xl p-3 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-foreground">{inv.invoice_number} - {inv.customer_name}</p><p className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("ar-LY")}</p></div>
                    <div className="flex items-center gap-2"><span className="text-sm font-bold text-primary">{inv.total} {t("د.ل", "LYD")}</span><StatusBadge status={inv.status} /></div>
                  </div>
                ))}</div>
              ) : <div className={`${cardClass} text-center`}><Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد فواتير.", "No invoices.")}</p></div>}
            </div>
          )}

          {/* ======= PROFITS ======= */}
          {activeTab === "profits" && (
            <div className="space-y-4">
              <SectionHeader title={t("الأرباح", "Profits")} onPDF={() => exportSimplePDF(t("تقرير الأرباح","Profits Report"), `<p>${t("رأس المال","Capital")}: ${totalBuyValue}</p><p>${t("قيمة المخزون (بيع)","Stock (Sell)")}: ${totalSellValue}</p><p>${t("الربح المتوقع","Expected Profit")}: ${totalProfit}</p><p>${t("الخسارة","Loss")}: ${totalProfit < 0 ? Math.abs(totalProfit) : 0}</p>`)} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("رأس المال","Capital")}</p><p className="text-xl font-black">{totalBuyValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("الأرباح","Profits")}</p><p className="text-xl font-black text-success">{Math.max(0,totalProfit).toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("المخزون (بيع)","Stock Value")}</p><p className="text-xl font-black text-primary">{totalSellValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("الخسارة","Loss")}</p><p className="text-xl font-black text-destructive">{totalProfit < 0 ? Math.abs(totalProfit).toLocaleString() : 0}</p></div>
              </div>
            </div>
          )}

          {/* ======= REPORTS ======= */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <SectionHeader title={t("التقارير والتحليلات", "Reports & Analytics")} desc={t("جميع التقارير قابلة للتحميل بصيغة PDF.", "All reports can be downloaded as PDF.")} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { l: t("تقرير المنتجات","Products"), fn: () => exportToPDF(t("المنتجات","Products"), products.map(p => ({name:p.name,qty:p.quantity,buy:p.buy_price,sell:p.sell_price})), ["name","qty","buy","sell"]) },
                  { l: t("تقرير الموردين","Suppliers"), fn: () => exportToPDF(t("الموردين","Suppliers"), suppliers.map(s => ({name:s.name,phone:s.phone,city:s.city})), ["name","phone","city"]) },
                  { l: t("تقرير الطلبات","Orders"), fn: () => exportToPDF(t("الطلبات","Orders"), orders.map(o => ({name:o.customer_name,total:o.total,status:o.status})), ["name","total","status"]) },
                  { l: t("تقرير الحركات","Movements"), fn: () => exportToPDF(t("حركة المخزون","Stock"), movements.map(m => ({type:m.type,qty:m.quantity,reason:m.reason})), ["type","qty","reason"]) },
                  { l: t("التقرير المالي","Financial"), fn: () => exportSimplePDF(t("المالي","Financial"), `Capital: ${totalBuyValue}, Profit: ${totalProfit}`) },
                ].map(r => (
                  <button key={r.l} onClick={r.fn} className={`${cardClass} hover:border-primary/50 text-center`}><Download className="h-6 w-6 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{r.l}</p></button>
                ))}
              </div>
            </div>
          )}

          {/* ======= ORDERS ======= */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <SectionHeader title={t("تتبع الطلبات والشحن", "Orders & Shipping")} desc={t("تتبع حالة طلباتك من معلق إلى تم التسليم مع إشعارات فورية.", "Track orders from pending to delivered.")} onAdd={() => setShowForm("order")} addLabel={t("طلب جديد", "New Order")} onPDF={() => exportToPDF(t("الطلبات","Orders"), orders.map(o => ({[t("العميل","Client")]:o.customer_name,[t("المدينة","City")]:o.customer_city,[t("الإجمالي","Total")]:o.total,[t("الحالة","Status")]:statusMap[o.status]?.ar||o.status,[t("التاريخ","Date")]:new Date(o.created_at).toLocaleDateString("ar-LY")})), [t("العميل","Client"),t("المدينة","City"),t("الإجمالي","Total"),t("الحالة","Status"),t("التاريخ","Date")])} />
              {showForm === "order" && (
                <form onSubmit={saveOrder} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم العميل *","Client *")}</label><input name="customerName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف","Phone")}</label><input name="customerPhone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المدينة","City")}</label><input name="customerCity" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الإجمالي","Total")}</label><input name="total" type="number" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("طريقة الدفع","Payment")}</label><select name="paymentMethod" className={inputClass}><option value="cash">{t("كاش","Cash")}</option><option value="bank">{t("تحويل","Transfer")}</option></select></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("ملاحظات","Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {orders.length > 0 ? (
                <div className="space-y-3">{orders.map(o => (
                  <div key={o.id} className={`${cardClass}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div><p className="text-sm font-bold text-foreground">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.customer_city} · {o.customer_phone} · {new Date(o.created_at).toLocaleDateString("ar-LY")}</p></div>
                      <div className="text-right"><p className="text-sm font-bold text-primary">{o.total} {t("د.ل","LYD")}</p><StatusBadge status={o.status} /></div>
                    </div>
                    {/* Progress bar */}
                    <div className="flex items-center gap-1 mb-3">
                      {["pending","processing","shipped","delivered"].map((s, i) => (
                        <div key={s} className="flex-1">
                          <div className={`h-1.5 rounded-full ${["pending","processing","shipped","delivered"].indexOf(o.status) >= i ? "bg-primary" : "bg-border"}`} />
                          <p className="text-[9px] text-center text-muted-foreground mt-1">{statusMap[s]?.ar}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {["pending","processing","shipped","delivered"].map(s => (
                        <button key={s} onClick={() => updateOrderStatus(o.id, s)} disabled={o.status === s} className={`px-2 py-1 rounded text-[10px] ${o.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground hover:bg-primary/20"}`}>{statusMap[s]?.ar}</button>
                      ))}
                    </div>
                  </div>
                ))}</div>
              ) : <div className={`${cardClass} text-center`}><ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد طلبات.","No orders.")}</p></div>}
            </div>
          )}

          {/* ======= HR ======= */}
          {activeTab === "hr" && (
            <div className="space-y-4">
              <SectionHeader title={t("الموارد البشرية", "Human Resources")} desc={t("إدارة شاملة للموظفين والعقود والحضور والرواتب والمهام والمكافآت والمخالفات.", "Comprehensive HR management.")} onPDF={() => exportToPDF(t("تقرير الموظفين","Employees Report"), employees.map(e => ({[t("الاسم","Name")]:e.full_name,[t("الوظيفة","Position")]:e.position,[t("القسم","Dept")]:e.department,[t("الراتب","Salary")]:e.salary,[t("العقد","Contract")]:e.contract_type,[t("الحالة","Status")]:e.status})), [t("الاسم","Name"),t("الوظيفة","Position"),t("القسم","Dept"),t("الراتب","Salary"),t("العقد","Contract"),t("الحالة","Status")])} />
              <div className="flex gap-2 flex-wrap">
                {[{k:"overview",l:t("نظرة عامة","Overview")},{k:"employees",l:t("الموظفين","Employees")},{k:"contracts",l:t("العقود","Contracts")},{k:"attendance",l:t("الحضور","Attendance")},{k:"schedule",l:t("المواعيد","Schedule")},{k:"salaries",l:t("الرواتب","Salaries")},{k:"tasks",l:t("المهام","Tasks")},{k:"rewards",l:t("المكافآت","Rewards")},{k:"violations",l:t("المخالفات","Violations")},{k:"leaves",l:t("الإجازات","Leaves")}].map(tab => (
                  <button key={tab.k} onClick={() => setHrTab(tab.k)} className={`px-3 py-1.5 rounded-xl text-xs ${hrTab === tab.k ? "gradient-primary text-primary-foreground font-bold" : "glass text-foreground"}`}>{tab.l}</button>
                ))}
              </div>

              {hrTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className={cardClass}><Users className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("الموظفين","Employees")}</p><p className="text-2xl font-black">{employees.length}</p></div>
                    <div className={cardClass}><Send className="h-5 w-5 text-warning mb-2" /><p className="text-xs text-muted-foreground">{t("طلبات معلقة","Pending")}</p><p className="text-2xl font-black text-warning">{empRequests.filter(r=>r.status==="pending").length}</p></div>
                    <div className={cardClass}><DollarSign className="h-5 w-5 text-success mb-2" /><p className="text-xs text-muted-foreground">{t("إجمالي الرواتب","Salaries")}</p><p className="text-2xl font-black text-success">{totalSalaries.toLocaleString()}</p></div>
                    <div className={cardClass}><ListChecks className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("المهام","Tasks")}</p><p className="text-2xl font-black">{tasks.length}</p></div>
                  </div>
                  <div className={cardClass}>
                    <h4 className="font-bold text-foreground mb-2">{t("شرح قسم الموارد البشرية","HR Section Guide")}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{t("يتيح لك هذا القسم إدارة جميع شؤون الموظفين من إضافة موظفين جدد، طباعة عقودهم، تسجيل الحضور والانصراف مع الخصومات التلقائية، إدارة الرواتب الشهرية بالتفصيل (أساسي + إضافي - خصومات)، إرسال كشوفات الرواتب، إضافة مكافآت ومخالفات، تتبع الإجازات والطلبات. كل قسم يمكن تحميله بصيغة PDF.","This section lets you manage all employee affairs: add employees, print contracts, track attendance with auto-deductions, manage detailed salaries, send payslips, add rewards/violations, track leaves and requests. All exportable as PDF.")}</p>
                  </div>
                </div>
              )}

              {hrTab === "employees" && (
                <div className="space-y-2">
                  <button onClick={() => exportToPDF(t("تفاصيل الموظفين","Employee Details"), employees.map(e => ({[t("الاسم","Name")]:e.full_name,[t("البريد","Email")]:e.email,[t("الهاتف","Phone")]:e.phone||"-",[t("الوظيفة","Position")]:e.position,[t("الراتب","Salary")]:e.salary,[t("نوع العقد","Contract")]:e.contract_type,[t("المؤهل","Qualification")]:e.qualification||"-"})), [t("الاسم","Name"),t("البريد","Email"),t("الهاتف","Phone"),t("الوظيفة","Position"),t("الراتب","Salary"),t("نوع العقد","Contract"),t("المؤهل","Qualification")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> {t("تحميل التفاصيل PDF","Download Details PDF")}</button>
                  {employees.map(e => (
                    <div key={e.id} className="glass rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div><p className="text-sm font-bold text-foreground">{e.full_name}</p><p className="text-xs text-muted-foreground">{e.position} · {e.email} · {e.phone || "-"}</p></div>
                        <div className="text-right"><p className="text-sm font-bold text-primary">{e.salary || 0} {t("د.ل","LYD")}</p><p className="text-[10px] text-muted-foreground">{e.department} · {e.contract_type}</p></div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-[10px]">
                        <span className="glass rounded px-2 py-1">{t("رقم وطني:","NID:")} {e.national_id||"-"}</span>
                        <span className="glass rounded px-2 py-1">{t("مؤهل:","Qual:")} {e.qualification||"-"}</span>
                        <span className="glass rounded px-2 py-1">{t("مصرف:","Bank:")} {e.bank_name||"-"}</span>
                        <span className="glass rounded px-2 py-1">{t("نهاية العقد:","Contract End:")} {e.contract_end||"-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hrTab === "contracts" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">{t("عقود الموظفين. يمكنك طباعة أي عقد بالضغط على زر الطباعة.","Employee contracts. Print any contract.")}</p>
                  {employees.map(e => (
                    <div key={e.id} className="glass rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div><p className="font-bold text-foreground">{e.full_name}</p><p className="text-xs text-muted-foreground">{e.position}</p></div>
                        <button onClick={() => exportSimplePDF(`${t("عقد عمل","Employment Contract")} - ${e.full_name}`, `<div style="text-align:center;font-size:20px;font-weight:bold;margin-bottom:20px">${t("عقد عمل","Employment Contract")}</div><table style="width:100%;border-collapse:collapse"><tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">${t("الاسم","Name")}</td><td style="padding:8px;border:1px solid #ccc">${e.full_name}</td></tr><tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">${t("الوظيفة","Position")}</td><td style="padding:8px;border:1px solid #ccc">${e.position||"-"}</td></tr><tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">${t("القسم","Dept")}</td><td style="padding:8px;border:1px solid #ccc">${e.department||"-"}</td></tr><tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">${t("الراتب","Salary")}</td><td style="padding:8px;border:1px solid #ccc">${e.salary||0} ${t("د.ل","LYD")}</td></tr><tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">${t("نوع العقد","Type")}</td><td style="padding:8px;border:1px solid #ccc">${e.contract_type||"-"}</td></tr><tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">${t("نهاية العقد","End Date")}</td><td style="padding:8px;border:1px solid #ccc">${e.contract_end||t("غير محدد","Unspecified")}</td></tr><tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">${t("رقم وطني","NID")}</td><td style="padding:8px;border:1px solid #ccc">${e.national_id||"-"}</td></tr><tr><td style="padding:8px;border:1px solid #ccc;font-weight:bold">${t("المؤهل","Qualification")}</td><td style="padding:8px;border:1px solid #ccc">${e.qualification||"-"}</td></tr></table><p style="margin-top:40px;text-align:center;font-size:12px">${t("تاريخ الطباعة:","Print Date:")} ${new Date().toLocaleDateString("ar-LY")}</p>`)} className="flex items-center gap-1 px-3 py-2 rounded-xl border border-border text-xs text-foreground"><Printer className="h-3 w-3" /> {t("طباعة العقد","Print Contract")}</button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        <span className="glass rounded-xl px-3 py-2"><span className="text-muted-foreground">{t("النوع:","Type:")}</span> <span className="font-bold">{e.contract_type||"-"}</span></span>
                        <span className="glass rounded-xl px-3 py-2"><span className="text-muted-foreground">{t("الراتب:","Salary:")}</span> <span className="font-bold text-primary">{e.salary||0}</span></span>
                        <span className="glass rounded-xl px-3 py-2"><span className="text-muted-foreground">{t("نهاية:","End:")}</span> <span className="font-bold">{e.contract_end||t("غير محدد","N/A")}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hrTab === "attendance" && (
                <div className="space-y-3">
                  <button onClick={() => exportToPDF(t("سجل الحضور","Attendance Log"), attendanceRecords.slice(0,100).map(a => { const emp = employees.find(e => e.id === a.employee_id); return {[t("الموظف","Employee")]:emp?.full_name||"-",[t("التاريخ","Date")]:a.date,[t("حضور","In")]:a.check_in||"-",[t("انصراف","Out")]:a.check_out||"-",[t("الحالة","Status")]:a.status,[t("خصم","Ded")]:a.deduction||0}; }), [t("الموظف","Employee"),t("التاريخ","Date"),t("حضور","In"),t("انصراف","Out"),t("الحالة","Status"),t("خصم","Ded")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  <div className={`${cardClass} overflow-x-auto`}>
                    <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("الموظف","Employee"),t("التاريخ","Date"),t("الحضور","In"),t("الانصراف","Out"),t("الحالة","Status"),t("الخصم","Ded")].map(h => <th key={h} className="text-right py-2 px-2 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                      <tbody>{attendanceRecords.slice(0,50).map(a => { const emp = employees.find(e => e.id === a.employee_id); return (
                        <tr key={a.id} className="border-b border-border/30"><td className="py-2 px-2 text-xs font-bold">{emp?.full_name || "-"}</td><td className="py-2 px-2 text-xs">{a.date}</td><td className="py-2 px-2 text-xs">{a.check_in || "-"}</td><td className="py-2 px-2 text-xs">{a.check_out || "-"}</td><td className="py-2 px-2 text-xs">{a.status}</td><td className="py-2 px-2 text-xs text-destructive font-bold">{a.deduction || 0}</td></tr>
                      ); })}</tbody>
                    </table>
                  </div>
                </div>
              )}

              {hrTab === "schedule" && (
                <div className={cardClass}>
                  <h4 className="font-bold text-foreground mb-3">{t("مواعيد العمل والخصومات","Work Schedule & Deductions")}</h4>
                  <p className="text-xs text-muted-foreground mb-4">{t("مواعيد العمل الرسمية وقيم الخصومات المطبقة تلقائياً عند تسجيل الحضور.","Official work hours and automatic deduction values applied on attendance.")}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="glass rounded-xl p-3"><Clock className="h-4 w-4 text-primary mb-1" /><p className="text-xs text-muted-foreground">{t("بداية الدوام","Start")}</p><p className="text-sm font-bold">08:00 AM</p></div>
                    <div className="glass rounded-xl p-3"><Clock className="h-4 w-4 text-primary mb-1" /><p className="text-xs text-muted-foreground">{t("نهاية الدوام","End")}</p><p className="text-sm font-bold">04:00 PM</p></div>
                    <div className="glass rounded-xl p-3"><AlertTriangle className="h-4 w-4 text-warning mb-1" /><p className="text-xs text-muted-foreground">{t("تأخير مسموح","Late tolerance")}</p><p className="text-sm font-bold">15 {t("دقيقة","min")}</p></div>
                    <div className="glass rounded-xl p-3"><AlertTriangle className="h-4 w-4 text-destructive mb-1" /><p className="text-xs text-muted-foreground">{t("غياب بعد","Absent after")}</p><p className="text-sm font-bold">60 {t("دقيقة","min")}</p></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <h5 className="text-sm font-bold text-foreground">{t("جدول الخصومات","Deduction Table")}</h5>
                    <div className="glass rounded-xl p-3 flex justify-between items-center"><span className="text-xs text-foreground">⚠️ {t("التأخير (15-60 دقيقة)","Late (15-60 min)")}</span><span className="text-xs font-bold text-warning">10 {t("د.ل","LYD")}</span></div>
                    <div className="glass rounded-xl p-3 flex justify-between items-center"><span className="text-xs text-foreground">🔴 {t("غياب جزئي (+60 دقيقة)","Partial absence (+60 min)")}</span><span className="text-xs font-bold text-destructive">30 {t("د.ل","LYD")}</span></div>
                    <div className="glass rounded-xl p-3 flex justify-between items-center"><span className="text-xs text-foreground">⛔ {t("خروج مبكر بدون إذن","Early leave w/o permission")}</span><span className="text-xs font-bold text-destructive">20 {t("د.ل","LYD")}</span></div>
                    <div className="glass rounded-xl p-3 flex justify-between items-center"><span className="text-xs text-foreground">❌ {t("غياب كامل (لم يسجل)","Full absence (no record)")}</span><span className="text-xs font-bold text-destructive">50 {t("د.ل","LYD")}</span></div>
                  </div>
                </div>
              )}

              {hrTab === "salaries" && (
                <div className="space-y-3">
                  <button onClick={() => exportToPDF(t("كشوفات الرواتب","Payroll"), employees.map(e => { const ded = attendanceRecords.filter(a=>a.employee_id===e.id).reduce((a,r)=>a+(r.deduction||0),0); return {[t("الاسم","Name")]:e.full_name,[t("الأساسي","Base")]:e.salary||0,[t("الخصومات","Ded")]:ded,[t("الإضافي","Bonus")]:0,[t("الصافي","Net")]:(e.salary||0)-ded}; }), [t("الاسم","Name"),t("الأساسي","Base"),t("الخصومات","Ded"),t("الإضافي","Bonus"),t("الصافي","Net")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> {t("تحميل كشوفات PDF","Download Payroll PDF")}</button>
                  {employees.map(e => {
                    const ded = attendanceRecords.filter(a => a.employee_id === e.id).reduce((a, r) => a + (r.deduction || 0), 0);
                    const net = (e.salary || 0) - ded;
                    return (
                      <div key={e.id} className="glass rounded-xl p-4">
                        <div className="flex justify-between items-center mb-3">
                          <div><p className="font-bold text-foreground">{e.full_name}</p><p className="text-xs text-muted-foreground">{e.position}</p></div>
                          <button onClick={async () => { if (e.user_id) { await supabase.from("notifications").insert({ user_id: e.user_id, title: t("إشعار الراتب","Salary Notice"), message: `${t("تم تجهيز راتبك الشهري:","Monthly salary ready:")} ${t("أساسي","Base")}: ${e.salary} - ${t("خصومات","Ded")}: ${ded} = ${t("صافي","Net")}: ${net} ${t("د.ل","LYD")}`, type: "salary" }); alert(t("تم إرسال إشعار الراتب!","Salary notification sent!")); }}} className="px-3 py-1.5 rounded-xl text-xs bg-success/20 text-success font-bold flex items-center gap-1"><Send className="h-3 w-3" /> {t("إرسال كشف","Send Payslip")}</button>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          <div className="glass rounded-xl p-2 text-center"><p className="text-[10px] text-muted-foreground">{t("الأساسي","Base")}</p><p className="text-sm font-black text-foreground">{e.salary || 0}</p></div>
                          <div className="glass rounded-xl p-2 text-center"><p className="text-[10px] text-muted-foreground">{t("الخصومات","Ded")}</p><p className="text-sm font-black text-destructive">{ded}</p></div>
                          <div className="glass rounded-xl p-2 text-center"><p className="text-[10px] text-muted-foreground">{t("الإضافي","Bonus")}</p><p className="text-sm font-black text-success">0</p></div>
                          <div className="glass rounded-xl p-2 text-center"><p className="text-[10px] text-muted-foreground">{t("الصافي","Net")}</p><p className="text-sm font-black text-primary">{net}</p></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {hrTab === "tasks" && (
                <div className="space-y-3">
                  <button onClick={() => setShowForm("task")} className={`${btnPrimary} flex items-center gap-2 text-xs`}><Plus className="h-3 w-3" />{t("إضافة مهمة","Add Task")}</button>
                  {showForm === "task" && (
                    <form onSubmit={saveTask} className={`${cardClass} space-y-3`}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold text-foreground">{t("عنوان المهمة *","Title *")}</label><input name="title" required className={inputClass} /></div>
                        <div><label className="text-xs font-bold text-foreground">{t("الموظف","Employee")}</label><select name="employeeId" className={inputClass}><option value="">{t("اختر","Select")}</option>{employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-foreground">{t("الأولوية","Priority")}</label><select name="priority" className={inputClass}><option value="low">{t("منخفضة","Low")}</option><option value="medium">{t("متوسطة","Medium")}</option><option value="high">{t("عالية","High")}</option></select></div>
                        <div><label className="text-xs font-bold text-foreground">{t("تاريخ التسليم","Due Date")}</label><input name="dueDate" type="date" className={inputClass} /></div>
                      </div>
                      <div><label className="text-xs font-bold text-foreground">{t("الوصف","Description")}</label><textarea name="description" rows={2} className={inputClass} /></div>
                      <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                    </form>
                  )}
                  {tasks.map(tk => { const emp = employees.find(e => e.id === tk.employee_id); return (
                    <div key={tk.id} className={`glass rounded-xl p-3 flex justify-between items-center ${tk.priority === "high" ? "border-l-4 border-l-destructive" : tk.priority === "medium" ? "border-l-4 border-l-warning" : "border-l-4 border-l-success"}`}>
                      <div><p className="text-sm font-bold text-foreground">{tk.title}</p><p className="text-xs text-muted-foreground">{emp?.full_name || "-"} · {tk.due_date || "-"} · {tk.description?.slice(0,50) || ""}</p></div>
                      <StatusBadge status={tk.status} />
                    </div>
                  ); })}
                </div>
              )}

              {hrTab === "rewards" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">{t("أضف مكافآت للموظفين المتميزين. تُضاف قيمة المكافأة للراتب الشهري.","Add rewards for outstanding employees. Reward value is added to monthly salary.")}</p>
                  <button onClick={() => setShowForm("reward")} className={`${btnPrimary} flex items-center gap-2 text-xs`}><Plus className="h-3 w-3" /> {t("إضافة مكافأة","Add Reward")}</button>
                  {showForm === "reward" && (
                    <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); const emp = employees.find(emp => emp.id === d.employeeId); if (emp?.user_id) { await supabase.from("notifications").insert({ user_id: emp.user_id, title: t("مكافأة جديدة! 🎉","New Reward! 🎉"), message: `${t("حصلت على مكافأة بقيمة","You received a reward of")} ${d.amount} ${t("د.ل بسبب:","LYD because:")} ${d.reason}`, type: "reward" }); } await supabase.from("activity_log").insert({ company_id: companyId!, action: "reward", details: `${t("مكافأة","Reward")} ${emp?.full_name}: ${d.amount} - ${d.reason}`, user_id: user?.id }); alert(t("تم إضافة المكافأة وإشعار الموظف!","Reward added & employee notified!")); setShowForm(""); }} className={`${cardClass} space-y-3`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><label className="text-xs font-bold text-foreground">{t("الموظف *","Employee *")}</label><select name="employeeId" required className={inputClass}><option value="">{t("اختر","Select")}</option>{employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-foreground">{t("قيمة المكافأة *","Amount *")}</label><input name="amount" type="number" required className={inputClass} /></div>
                        <div><label className="text-xs font-bold text-foreground">{t("السبب *","Reason *")}</label><input name="reason" required className={inputClass} /></div>
                      </div>
                      <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                    </form>
                  )}
                </div>
              )}

              {hrTab === "violations" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">{t("سجّل المخالفات والخصومات الإدارية. تُخصم من الراتب الشهري.","Record violations and admin deductions. Deducted from monthly salary.")}</p>
                  <button onClick={() => setShowForm("violation")} className={`${btnPrimary} flex items-center gap-2 text-xs`}><Plus className="h-3 w-3" /> {t("إضافة مخالفة","Add Violation")}</button>
                  {showForm === "violation" && (
                    <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); const emp = employees.find(emp => emp.id === d.employeeId); if (emp?.user_id) { await supabase.from("notifications").insert({ user_id: emp.user_id, title: t("مخالفة إدارية ⚠️","Admin Violation ⚠️"), message: `${t("تم تسجيل مخالفة بقيمة","A violation of")} ${d.amount} ${t("د.ل بسبب:","LYD for:")} ${d.reason}`, type: "violation" }); } await supabase.from("activity_log").insert({ company_id: companyId!, action: "violation", details: `${t("مخالفة","Violation")} ${emp?.full_name}: ${d.amount} - ${d.reason}`, user_id: user?.id }); alert(t("تم تسجيل المخالفة!","Violation recorded!")); setShowForm(""); }} className={`${cardClass} space-y-3`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div><label className="text-xs font-bold text-foreground">{t("الموظف *","Employee *")}</label><select name="employeeId" required className={inputClass}><option value="">{t("اختر","Select")}</option>{employees.map(e => <option key={e.id} value={e.id}>{e.full_name}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-foreground">{t("قيمة المخالفة *","Amount *")}</label><input name="amount" type="number" required className={inputClass} /></div>
                        <div><label className="text-xs font-bold text-foreground">{t("السبب *","Reason *")}</label><input name="reason" required className={inputClass} /></div>
                      </div>
                      <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                    </form>
                  )}
                </div>
              )}

              {hrTab === "leaves" && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">{t("طلبات الإجازات والسلف والسحب المبكر المرسلة من الموظفين.","Leave, advance, and early salary requests from employees.")}</p>
                  {empRequests.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد طلبات.","No requests.")}</p> : empRequests.map(r => { const emp = employees.find(e => e.id === r.employee_id); return (
                    <div key={r.id} className="glass rounded-xl p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div><p className="text-sm font-bold text-foreground">{emp?.full_name || "-"}</p><p className="text-xs text-muted-foreground">{r.type === "leave" ? t("إجازة","Leave") : r.type === "advance" ? t("سلفة","Advance") : t("سحب راتب","Salary")} · {r.reason} · {new Date(r.created_at).toLocaleDateString("ar-LY")}</p></div>
                        <StatusBadge status={r.status} />
                      </div>
                      {r.amount > 0 && <p className="text-xs text-primary font-bold mb-2">{t("المبلغ:","Amount:")} {r.amount} {t("د.ل","LYD")}</p>}
                      {r.status === "pending" && (
                        <div className="flex gap-2"><button onClick={() => handleEmpRequest(r.id, "approved")} className="px-3 py-1 rounded text-xs bg-success/20 text-success font-bold">{t("موافقة","Approve")}</button><button onClick={() => handleEmpRequest(r.id, "rejected")} className="px-3 py-1 rounded text-xs bg-destructive/20 text-destructive font-bold">{t("رفض","Reject")}</button></div>
                      )}
                    </div>
                  ); })}
                </div>
              )}
            </div>
          )}

          {/* ======= EMP REQUESTS ======= */}
          {activeTab === "emp-requests" && (
            <div className="space-y-4">
              <SectionHeader title={t("طلبات الموظفين", "Employee Requests")} desc={t("استقبل ومعالج طلبات الإجازات والسلف والسحب المبكر للرواتب.","Manage leave, advance, and salary requests.")} />
              {empRequests.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد طلبات.","No requests.")}</p> : empRequests.map(r => { const emp = employees.find(e => e.id === r.employee_id); return (
                <div key={r.id} className="glass rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div><p className="text-sm font-bold text-foreground">{emp?.full_name || "-"}</p><p className="text-xs text-muted-foreground">{r.type} · {r.reason} · {new Date(r.created_at).toLocaleDateString("ar-LY")}</p></div>
                    <StatusBadge status={r.status} />
                  </div>
                  {r.amount > 0 && <p className="text-xs text-primary font-bold mb-2">{t("المبلغ:","Amount:")} {r.amount} {t("د.ل","LYD")}</p>}
                  {r.status === "pending" && (
                    <div className="flex gap-2"><button onClick={() => handleEmpRequest(r.id, "approved")} className="px-3 py-1 rounded text-xs bg-success/20 text-success font-bold">{t("موافقة","Approve")}</button><button onClick={() => handleEmpRequest(r.id, "rejected")} className="px-3 py-1 rounded text-xs bg-destructive/20 text-destructive font-bold">{t("رفض","Reject")}</button></div>
                  )}
                </div>
              ); })}
            </div>
          )}

          {/* ======= USERS ======= */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <SectionHeader title={t("إدارة المستخدمين", "User Management")} desc={t("أضف موظفين جدد وحدد صلاحياتهم ووظائفهم. الموظف يسجل الدخول بالبريد وكلمة المرور التي تحددها.","Add employees and set their permissions.")} onAdd={() => setShowForm("user")} addLabel={t("إضافة موظف","Add Employee")} />
              {showForm === "user" && (
                <form onSubmit={saveUser} className={`${cardClass} space-y-3`}>
                  <h4 className="font-bold text-foreground">{t("إضافة موظف جديد","Add New Employee")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("الاسم الكامل *","Full Name *")}</label><input name="username" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("البريد الإلكتروني *","Email *")}</label><input name="email" type="email" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("كلمة المرور *","Password *")}</label><input name="password" type="password" required minLength={6} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف","Phone")}</label><input name="phone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المسمى الوظيفي *","Position *")}</label><select name="role" required className={inputClass}><option>{t("مسؤول مخزن","Warehouse Manager")}</option><option>{t("محاسب","Accountant")}</option><option>{t("مسؤول موارد بشرية","HR Manager")}</option><option>{t("موظف عادي","Regular Employee")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("القسم","Department")}</label><input name="department" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الراتب","Salary")}</label><input name="salary" type="number" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع العقد","Contract")}</label><select name="contractType" className={inputClass}><option>{t("دائم","Permanent")}</option><option>{t("مؤقت","Temporary")}</option><option>{t("تجريبي","Probation")}</option></select></div>
                  </div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("إضافة","Add")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {employees.length > 0 ? <div className="space-y-2">{employees.map(e => (
                <div key={e.id} className="glass rounded-xl p-3 flex justify-between items-center">
                  <div><p className="text-sm font-bold text-foreground">{e.full_name}</p><p className="text-xs text-muted-foreground">{e.position} · {e.email}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${e.status === "active" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>{e.status === "active" ? t("نشط","Active") : t("معطل","Inactive")}</span>
                    <button onClick={async () => { if(confirm(t("حذف الموظف؟","Delete employee?"))) { await supabase.from("employees").delete().eq("id", e.id); await refreshData("employees"); }}} className="text-destructive p-1"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}</div> : <div className={`${cardClass} text-center`}><Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا يوجد موظفين.","No employees.")}</p></div>}
            </div>
          )}

          {/* ======= PERMISSIONS ======= */}
          {activeTab === "permissions" && (
            <div className="space-y-4">
              <SectionHeader title={t("الصلاحيات والتوظيف","Permissions & Access Control")} desc={t("تحكم دقيق في كل ما يراه ويفعله كل موظف. المستوى الأول: الوصول للقسم. المستوى الثاني: الإجراءات داخل كل قسم.","Granular control over what each employee can see and do. Level 1: Section access. Level 2: Actions within each section.")} />
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-2">
                <p className="text-xs text-primary font-bold">💡 {t("نظام الصلاحيات يعمل على مستويين: أولاً فعّل القسم ليظهر للموظف، ثم حدد الإجراءات المسموحة داخله. الموظف لن يستطيع تنفيذ أي عملية لم تمنحها له.","Permissions work on two levels: First enable the section for the employee, then select allowed actions. Employee cannot perform any action not granted.")}</p>
              </div>
              {employees.length === 0 ? (
                <div className={`${cardClass} text-center py-8`}><Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا يوجد موظفين. أضف موظفين من قسم المستخدمين أولاً.","No employees. Add employees from Users section first.")}</p></div>
              ) : employees.map(emp => {
                const empPerms: string[] = emp.permissions || [];
                const empOverrides: Record<string, Record<string, boolean>> = emp.permission_overrides || {};
                return (
                  <div key={emp.id} className={`${cardClass} border border-border/50`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">{emp.full_name?.charAt(0)}</div>
                        <div>
                          <h4 className="font-bold text-foreground">{emp.full_name}</h4>
                          <p className="text-xs text-muted-foreground">{emp.position || t("بدون مسمى","No title")} · {emp.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${emp.status === "active" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>{emp.status === "active" ? t("نشط","Active") : t("معطل","Disabled")}</span>
                    </div>
                    
                    {/* مستوى الأقسام */}
                    <div className="mb-4">
                      <h5 className="text-xs font-bold text-primary mb-2 flex items-center gap-1"><Shield className="h-3 w-3" /> {t("المستوى الأول: الأقسام المتاحة","Level 1: Available Sections")}</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {allPermissions.filter(p => !["dashboard","my-info"].includes(p.key)).map(perm => {
                          const has = empPerms.includes(perm.key);
                          return (
                            <button key={perm.key} onClick={() => {
                              const newPerms = has ? empPerms.filter((p: string) => p !== perm.key) : [...empPerms, perm.key];
                              const newOverrides = { ...empOverrides };
                              if (!has) { newOverrides[perm.key] = { view: true }; }
                              else { delete newOverrides[perm.key]; }
                              updatePermissions(emp.id, newPerms, newOverrides);
                            }} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${has ? "gradient-primary text-primary-foreground" : "glass text-muted-foreground border border-border/50"}`}>
                              {has ? "✅" : "⬜"} {lang === "ar" ? perm.ar : perm.en}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* مستوى الإجراءات */}
                    {empPerms.filter(p => sectionActions[p]).length > 0 && (
                      <div>
                        <h5 className="text-xs font-bold text-warning mb-2 flex items-center gap-1"><UserCog className="h-3 w-3" /> {t("المستوى الثاني: الإجراءات المسموحة داخل كل قسم","Level 2: Allowed Actions per Section")}</h5>
                        <div className="space-y-3">
                          {empPerms.filter(p => sectionActions[p]).map(sectionKey => {
                            const section = allPermissions.find(p => p.key === sectionKey);
                            const actions = sectionActions[sectionKey] || [];
                            const sectionOverrides = empOverrides[sectionKey] || {};
                            return (
                              <div key={sectionKey} className="glass rounded-xl p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-bold text-foreground">{lang === "ar" ? section?.ar : section?.en}</p>
                                  <button onClick={() => {
                                    const allOn = actions.every(a => sectionOverrides[a.key]);
                                    const newOverrides = { ...empOverrides };
                                    const newSection: Record<string, boolean> = {};
                                    actions.forEach(a => { newSection[a.key] = !allOn; });
                                    newOverrides[sectionKey] = newSection;
                                    updatePermissions(emp.id, empPerms, newOverrides);
                                  }} className="text-[10px] text-primary font-bold">{actions.every(a => sectionOverrides[a.key]) ? t("إلغاء الكل","Deselect All") : t("تحديد الكل","Select All")}</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {actions.map(action => {
                                    const enabled = !!sectionOverrides[action.key];
                                    return (
                                      <button key={action.key} onClick={() => {
                                        const newOverrides = { ...empOverrides };
                                        const newSection = { ...(newOverrides[sectionKey] || {}) };
                                        newSection[action.key] = !enabled;
                                        newOverrides[sectionKey] = newSection;
                                        updatePermissions(emp.id, empPerms, newOverrides);
                                      }} className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${enabled ? "bg-success/20 text-success border border-success/30" : "bg-secondary text-muted-foreground border border-border/50"}`}>
                                        {enabled ? "✅" : "⬜"} {lang === "ar" ? action.ar : action.en}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ======= MESSAGES ======= */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              <SectionHeader title={t("المراسلات","Messages")} desc={t("تواصل مع مسؤول النظام.","Communicate with system admin.")} />
              {messagesData.length === 0 ? <div className={`${cardClass} text-center`}><MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد رسائل.","No messages.")}</p></div> : messagesData.map(m => (
                <div key={m.id} className={`glass rounded-xl p-3 ${m.sender_id === user?.id ? "border-l-4 border-l-primary" : "border-l-4 border-l-success"}`}>
                  <p className="text-sm text-foreground">{m.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleString("ar-LY")}</p>
                </div>
              ))}
            </div>
          )}

          {/* ======= NOTIFICATIONS ======= */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <SectionHeader title={t("الإشعارات","Notifications")} />
              {notifications.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد إشعارات.","No notifications.")}</p> : notifications.map(n => (
                <div key={n.id} className={`glass rounded-xl p-3 flex justify-between items-center ${!n.read ? "border-l-4 border-l-primary" : ""}`}>
                  <div><p className="text-sm font-bold text-foreground">{n.title}</p><p className="text-xs text-muted-foreground">{n.message}</p><p className="text-[10px] text-muted-foreground">{new Date(n.created_at).toLocaleString("ar-LY")}</p></div>
                  <div className="flex gap-1">
                    {!n.read && <button onClick={async () => { await supabase.from("notifications").update({ read: true }).eq("id", n.id); await refreshData("notifications"); }} className="text-[10px] text-primary">{t("مقروء","Read")}</button>}
                    <button onClick={async () => { await supabase.from("notifications").delete().eq("id", n.id); await refreshData("notifications"); }} className="text-destructive p-1"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ======= SETTINGS ======= */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <SectionHeader title={t("الإعدادات","Settings")} desc={t("إعدادات ملف الشركة والهوية البصرية.","Company settings and branding.")} />
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-3">{t("معلومات الشركة","Company Info")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[{l:t("اسم الشركة","Name"),v:company?.company_name},{l:t("اسم المدير","Manager"),v:company?.manager_name},{l:t("البريد","Email"),v:company?.email},{l:t("الهاتف","Phone"),v:company?.phone},{l:t("المدينة","City"),v:company?.city},{l:t("الباقة","Plan"),v:company?.plan_name}].map(item => (
                    <div key={item.l} className="glass rounded-xl p-3"><p className="text-xs text-muted-foreground">{item.l}</p><p className="text-sm font-bold text-foreground">{item.v || "-"}</p></div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default CompanyDashboard;
