import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, RotateCcw, FileText, DollarSign, TrendingUp,
  UserCog, Settings, LogOut, Bell, Menu, X, Briefcase, Receipt, Award,
  Moon, Sun, Globe, ShieldX, User, Clock, Calendar, Send, Check,
  ListChecks, MessageSquare, Download, Wallet, Plus, Trash2, Search, ShoppingCart,
  Building2, Camera, Upload, Target, AlertTriangle, ArrowUpDown, Eye, Edit,
  Shield, Printer, Volume2, Flag, RefreshCw, MapPin, Phone, Mail, Banknote
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { exportToPDF, exportSimplePDF } from "@/utils/pdfExport";
import logo from "@/assets/logo-transparent.png";
import BarcodeScanner from "@/components/BarcodeScanner";
import BarcodeGenerator from "@/components/BarcodeGenerator";

/* ─── Sidebar structure mirroring CompanyDashboard ─── */
const sidebarSections = [
  { title: "الرئيسية", titleEn: "Main", items: [
    { icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard", key: "dashboard" },
    { icon: Briefcase, label: "شؤوني الوظيفية", labelEn: "My Info", key: "my-info" },
    { icon: Clock, label: "الحضور والانصراف", labelEn: "Attendance", key: "attendance" },
    { icon: Calendar, label: "طلباتي", labelEn: "My Requests", key: "requests" },
    { icon: ListChecks, label: "مهامي", labelEn: "My Tasks", key: "my-tasks" },
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
  { title: "الإدارة", titleEn: "Admin", items: [
    { icon: MessageSquare, label: "المراسلات", labelEn: "Messages", key: "messages" },
  ]},
];

const alwaysVisible = ["dashboard", "my-info", "attendance", "requests", "my-tasks"];

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
  completed: { ar: "مكتمل", en: "Completed", color: "bg-success/20 text-success" },
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, role, employeeData, companyId, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("madar_theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");
  const [myData, setMyData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [showForm, setShowForm] = useState("");
  const [loading, setLoading] = useState(true);
  const [barcodeMode, setBarcodeMode] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedResult, setScannedResult] = useState("");
  const [invoiceItems, setInvoiceItems] = useState<any[]>([{ product: "", quantity: 1, price: 0 }]);
  const [accountingTab, setAccountingTab] = useState("daily");
  const [searchTerm, setSearchTerm] = useState("");

  const t = useCallback((ar: string, en: string) => lang === "ar" ? ar : en, [lang]);
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";
  const cardClass = "glass rounded-2xl p-5";
  const btnPrimary = "px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold";
  const btnOutline = "px-6 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-secondary";

  useEffect(() => { if (!authLoading && (!user || role !== "employee")) navigate("/login/user"); }, [user, role, authLoading]);
  useEffect(() => { localStorage.setItem("madar_theme", theme); if (theme === "light") document.documentElement.classList.add("light"); else document.documentElement.classList.remove("light"); }, [theme]);
  useEffect(() => { localStorage.setItem("madar_lang", lang); document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"; }, [lang]);

  useEffect(() => {
    if (!user || !companyId) return;
    const loadData = async () => {
      setLoading(true);
      const [empRes, tasksRes, reqRes, attRes, prodsRes, movsRes, supRes, ordRes, invRes, notifRes, msgsRes, whRes] = await Promise.all([
        supabase.from("employees").select("*, companies(company_name, manager_name, email)").eq("user_id", user.id).maybeSingle(),
        supabase.from("tasks").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("employee_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("attendance").select("*").eq("company_id", companyId).order("date", { ascending: false }),
        supabase.from("products").select("*").eq("company_id", companyId),
        supabase.from("stock_movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("suppliers").select("*").eq("company_id", companyId),
        supabase.from("orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: true }),
        supabase.from("warehouses" as any).select("*").eq("company_id", companyId).order("created_at", { ascending: true }),
      ]);
      setMyData(empRes.data);
      const myEmployeeId = empRes.data?.id;
      setTasks((tasksRes.data || []).filter((tk: any) => tk.employee_id === myEmployeeId));
      setMyRequests((reqRes.data || []).filter((r: any) => r.employee_id === myEmployeeId));
      setAttendance((attRes.data || []).filter((a: any) => a.employee_id === myEmployeeId));
      setProducts(prodsRes.data || []);
      setMovements(movsRes.data || []);
      setSuppliers(supRes.data || []);
      setOrders(ordRes.data || []);
      setInvoices(invRes.data || []);
      setNotifications(notifRes.data || []);
      setMessagesData(msgsRes.data || []);
      setWarehouses(whRes.data || []);
      setLoading(false);
    };
    loadData();
    const channel = supabase.channel('emp-notifs')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, (payload) => { setNotifications(prev => [payload.new as any, ...prev]); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${user.id}` }, (payload) => { setMessagesData(prev => [...prev, payload.new as any]); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, companyId]);

  /* ─── Permissions - FIXED: more permissive logic ─── */
  const permissions: string[] = myData?.permissions || employeeData?.permissions || ["dashboard", "my-info"];
  const permOverrides: Record<string, Record<string, boolean>> = myData?.permission_overrides || employeeData?.permission_overrides || {};
  
  // Fixed: if user has section permission, allow basic actions (view, create) by default
  // unless explicitly denied in overrides
  const canAction = useCallback((section: string, action: string) => {
    const sOvr = permOverrides[section];
    // If section is in permissions list but no overrides defined, allow all actions
    if (permissions.includes(section) && !sOvr) return true;
    if (!sOvr) return false;
    // If manage is true, allow everything
    if (sOvr["manage"]) return true;
    // Check specific action
    return !!sOvr[action];
  }, [permissions, permOverrides]);
  
  const hasSection = useCallback((key: string) => alwaysVisible.includes(key) || permissions.includes(key), [permissions]);

  /* ─── Filter sidebar ─── */
  const visibleSidebar = useMemo(() => sidebarSections.map(group => ({
    ...group,
    items: group.items.filter(item => hasSection(item.key)),
  })).filter(group => group.items.length > 0), [hasSection]);

  const flatItems = sidebarSections.flatMap(s => s.items);

  /* ─── Data helpers ─── */
  const refreshProducts = async () => { if (!companyId) return; const { data } = await supabase.from("products").select("*").eq("company_id", companyId); setProducts(data || []); };
  const refreshSuppliers = async () => { if (!companyId) return; const { data } = await supabase.from("suppliers").select("*").eq("company_id", companyId); setSuppliers(data || []); };
  const refreshMovements = async () => { if (!companyId) return; const { data } = await supabase.from("stock_movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setMovements(data || []); };
  const refreshOrders = async () => { if (!companyId) return; const { data } = await supabase.from("orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setOrders(data || []); };
  const refreshInvoices = async () => { if (!companyId) return; const { data } = await supabase.from("invoices").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setInvoices(data || []); };

  const logout = async () => { await signOut(); navigate("/login/user"); };
  const baseSalary = Number(myData?.salary) || 0;
  const companyName = myData?.companies?.company_name || employeeData?.companies?.company_name || "";
  const totalDeductions = attendance.reduce((a, r) => a + (r.deduction || 0), 0);
  const netSalary = baseSalary - totalDeductions;
  const today = new Date().toISOString().split("T")[0];
  const todayRecord = attendance.find(a => a.date === today);
  const totalBuyValue = products.reduce((a, p) => a + (Number(p.buy_price) || 0) * (Number(p.quantity) || 0), 0);
  const totalSellValue = products.reduce((a, p) => a + (Number(p.sell_price) || 0) * (Number(p.quantity) || 0), 0);
  const totalProfit = totalSellValue - totalBuyValue;

  const monthlyData = useMemo(() => Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
    const month = d.toLocaleDateString(lang === "ar" ? "ar-LY" : "en", { month: "short" });
    const mOrders = orders.filter(o => new Date(o.created_at).getMonth() === d.getMonth());
    return { month, orders: mOrders.length, revenue: mOrders.reduce((a, o) => a + (Number(o.total) || 0), 0) };
  }), [orders, lang]);

  const recordAttendance = async (type: "in" | "out") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });
    const hour = now.getHours(); const minute = now.getMinutes();
    let status = ""; let deduction = 0;
    if (type === "in") {
      if (hour < 8 || (hour === 8 && minute <= 15)) { status = t("في الوقت ✅", "On time ✅"); }
      else if ((hour === 8 && minute > 15) || hour === 9) { status = t("متأخر ⚠️", "Late ⚠️"); deduction = 10; }
      else { status = t("غياب جزئي 🔴", "Partial absence 🔴"); deduction = 30; }
    } else {
      if (hour < 16) { status = t("خروج مبكر بدون إذن ⛔", "Early leave w/o permission ⛔"); deduction = 20; }
      else { status = t("انصراف طبيعي ✅", "Normal checkout ✅"); }
    }
    const confirmMsg = type === "in"
      ? t(`⚠️ تنبيه: سيتم تسجيل حضورك الآن.\nحالتك: ${status}${deduction > 0 ? `\n💰 سيتم خصم ${deduction} د.ل من راتبك` : ""}`, `Recording check-in. Status: ${status}`)
      : t(`⚠️ تنبيه: سيتم تسجيل انصرافك الآن.\nحالتك: ${status}${deduction > 0 ? `\n💰 سيتم خصم ${deduction} د.ل من راتبك` : ""}`, `Recording check-out. Status: ${status}`);
    if (!confirm(confirmMsg)) return;
    if (todayRecord) {
      const update: any = type === "in" ? { check_in: timeStr, status, deduction } : { check_out: timeStr, status: `${todayRecord.status} · ${status}`, deduction: (todayRecord.deduction || 0) + deduction };
      await supabase.from("attendance").update(update).eq("id", todayRecord.id);
    } else {
      await supabase.from("attendance").insert({ company_id: companyId!, employee_id: myData?.id, date: today, check_in: type === "in" ? timeStr : "", check_out: type === "out" ? timeStr : "", status, deduction });
    }
    const { data } = await supabase.from("attendance").select("*").eq("employee_id", myData?.id).order("date", { ascending: false });
    setAttendance(data || []);
  };

  const submitRequest = async (type: string, data: any) => {
    await supabase.from("employee_requests").insert({ company_id: companyId!, employee_id: myData?.id, type, reason: data.reason || "", amount: Number(data.amount) || 0, start_date: data.from || "", end_date: data.to || "" });
    alert(t("تم إرسال طلبك بنجاح!", "Request submitted!"));
    const { data: reqs } = await supabase.from("employee_requests").select("*").eq("employee_id", myData?.id).order("created_at", { ascending: false });
    setMyRequests(reqs || []);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  const SectionHeader = ({ title, desc, onAdd, addLabel, onPDF, pdfLabel }: any) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
      <div><h3 className="font-bold text-foreground text-lg">{title}</h3>{desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}</div>
      <div className="flex gap-2">
        {onPDF && <button onClick={onPDF} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> {pdfLabel || "PDF"}</button>}
        {onAdd && <button onClick={onAdd} className={`${btnPrimary} flex items-center gap-2 text-xs`}><Plus className="h-3 w-3" /> {addLabel || t("إضافة", "Add")}</button>}
      </div>
    </div>
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const s = statusMap[status] || { ar: status, en: status, color: "bg-secondary text-foreground" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.color}`}>{lang === "ar" ? s.ar : s.en}</span>;
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">{t("جاري التحميل...", "Loading...")}</p></div>
    </div>
  );

  if (!myData) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" /><p className="text-foreground font-bold">{t("لم يتم العثور على بياناتك الوظيفية", "Employee data not found")}</p><p className="text-xs text-muted-foreground mt-2">{t("تأكد أن مسؤول الشركة أضافك في قسم المستخدمين.", "Make sure your company admin added you.")}</p><button onClick={logout} className="mt-4 px-6 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm">{t("تسجيل الخروج", "Logout")}</button></div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 ${lang === "ar" ? "right-0 border-l" : "left-0 border-r"} w-64 bg-card border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div><h2 className="font-black text-primary text-sm">{companyName || "مدار"}</h2><p className="text-[10px] text-muted-foreground">{myData.full_name} · {myData.position || t("موظف","Employee")}</p></div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-2 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
          {visibleSidebar.map(section => (
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
        {/* Fixed: logout not covering content - positioned inside sidebar with proper spacing */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10"><LogOut className="h-4 w-4" /> {t("تسجيل الخروج", "Logout")}</button>
        </div>
      </aside>

      <main className={`flex-1 ${lang === "ar" ? "md:mr-64" : "md:ml-64"}`}>
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{lang === "ar" ? flatItems.find(s => s.key === activeTab)?.label : flatItems.find(s => s.key === activeTab)?.labelEn}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setActiveTab("notifications")} className="p-2 rounded-xl hover:bg-secondary relative">
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">{notifications.filter(n => !n.read).length}</span>}
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl hover:bg-secondary">{theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}</button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="p-2 rounded-xl hover:bg-secondary"><Globe className="h-4 w-4" /></button>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">{myData.full_name?.charAt(0)}</div>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-0 pb-6">
          {/* Access Denied for non-permitted tabs */}
          {!hasSection(activeTab) && activeTab !== "notifications" && (
            <div className={`${cardClass} text-center py-12`}>
              <ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">{t("غير مصرح", "Access Denied")}</h3>
              <p className="text-sm text-muted-foreground">{t("ليس لديك صلاحية للوصول إلى هذا القسم. تواصل مع مسؤول الشركة.", "No permission. Contact your company admin.")}</p>
            </div>
          )}

          {/* ======= DASHBOARD ======= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className={`${cardClass} border-primary/30`}>
                <p className="text-sm text-foreground">{t("مرحباً", "Welcome")} <span className="font-bold text-primary">{myData.full_name}</span>! 👋</p>
                <p className="text-xs text-muted-foreground mt-1">{t("المسمى:", "Position:")} <span className="font-bold">{myData.position || "-"}</span> · {t("القسم:", "Dept:")} <span className="font-bold">{myData.department || "-"}</span> · {t("الشركة:", "Company:")} <span className="font-bold">{companyName}</span></p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <div className={cardClass}><DollarSign className="h-5 w-5 text-success mb-2" /><p className="text-xs text-muted-foreground">{t("الراتب الأساسي", "Base Salary")}</p><p className="text-xl font-black text-foreground">{baseSalary.toLocaleString()} <span className="text-xs text-muted-foreground">{t("د.ل", "LYD")}</span></p></div>
                <div className={cardClass}><ListChecks className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("المهام", "Tasks")}</p><p className="text-xl font-black text-foreground">{tasks.length}</p><p className="text-[10px] text-warning">{tasks.filter(t=>t.status==="pending").length} {t("معلقة","pending")}</p></div>
                <div className={cardClass}><Clock className="h-5 w-5 text-success mb-2" /><p className="text-xs text-muted-foreground">{t("حضور اليوم", "Today")}</p><p className="text-xl font-black text-foreground">{todayRecord?.check_in || t("لم يسجّل", "N/A")}</p></div>
                {hasSection("products") && <div className={cardClass}><Package className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("المنتجات","Products")}</p><p className="text-xl font-black">{products.length}</p></div>}
                {hasSection("orders") && <div className={cardClass}><ShoppingCart className="h-5 w-5 text-warning mb-2" /><p className="text-xs text-muted-foreground">{t("الطلبات","Orders")}</p><p className="text-xl font-black">{orders.length}</p></div>}
                {hasSection("suppliers") && <div className={cardClass}><Truck className="h-5 w-5 text-muted-foreground mb-2" /><p className="text-xs text-muted-foreground">{t("الموردين","Suppliers")}</p><p className="text-xl font-black">{suppliers.length}</p></div>}
              </div>
              {hasSection("accounting") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={cardClass}>
                    <h4 className="font-bold text-foreground mb-3">{t("ملخص مالي", "Financial Summary")}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("رأس المال","Capital")}</span><span className="font-bold">{totalBuyValue.toLocaleString()} {t("د.ل","LYD")}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("قيمة المخزون","Stock")}</span><span className="font-bold text-primary">{totalSellValue.toLocaleString()} {t("د.ل","LYD")}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{t("الربح المتوقع","Profit")}</span><span className={`font-bold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>{totalProfit.toLocaleString()} {t("د.ل","LYD")}</span></div>
                    </div>
                  </div>
                  <div className={cardClass}>
                    <h4 className="font-bold text-foreground mb-3">{t("المبيعات الشهرية","Monthly Sales")}</h4>
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" /></AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
              {notifications.filter(n => !n.read).length > 0 && (
                <div className={cardClass}>
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> {t("إشعارات جديدة","New Notifications")}</h4>
                  {notifications.filter(n => !n.read).slice(0, 5).map(n => (
                    <div key={n.id} className="glass rounded-xl p-2 mb-1 border-l-4 border-l-primary"><p className="text-xs font-bold text-foreground">{n.title}</p><p className="text-[10px] text-muted-foreground">{n.message}</p></div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ======= MY INFO ======= */}
          {activeTab === "my-info" && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-2">{t("بياناتي الوظيفية", "My Employment Info")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { l: t("الاسم الكامل","Name"), v: myData.full_name, icon: User },
                    { l: t("البريد","Email"), v: myData.email, icon: Mail },
                    { l: t("الهاتف","Phone"), v: myData.phone || "-", icon: Phone },
                    { l: t("المسمى الوظيفي","Position"), v: myData.position || "-", icon: Briefcase },
                    { l: t("القسم","Department"), v: myData.department || "-", icon: Users },
                    { l: t("نوع العقد","Contract"), v: myData.contract_type || "-", icon: FileText },
                    { l: t("نهاية العقد","Contract End"), v: myData.contract_end || "-", icon: Calendar },
                    { l: t("الراتب","Salary"), v: `${baseSalary.toLocaleString()} ${t("د.ل","LYD")}`, icon: DollarSign },
                    { l: t("المؤهل","Qualification"), v: myData.qualification || "-", icon: Award },
                    { l: t("الرقم الوطني","National ID"), v: myData.national_id || "-", icon: CreditCard },
                    { l: t("المصرف","Bank"), v: myData.bank_name || "-", icon: Wallet },
                    { l: t("رقم الحساب","Account"), v: myData.bank_account || "-", icon: Receipt },
                    { l: t("الشركة","Company"), v: companyName, icon: Building2 },
                    { l: t("مدير الشركة","Manager"), v: myData.companies?.manager_name || "-", icon: UserCog },
                  ].map(item => (
                    <div key={item.l} className="glass rounded-xl p-3 flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-primary shrink-0" />
                      <div><p className="text-[10px] text-muted-foreground">{item.l}</p><p className="text-sm font-bold text-foreground">{item.v}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-3">{t("تفاصيل الراتب","Salary Details")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="glass rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">{t("الأساسي","Base")}</p><p className="text-lg font-black text-foreground">{baseSalary}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">{t("الخصومات","Deductions")}</p><p className="text-lg font-black text-destructive">{totalDeductions}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">{t("الإضافي","Bonus")}</p><p className="text-lg font-black text-success">0</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">{t("الصافي","Net")}</p><p className="text-lg font-black text-primary">{netSalary}</p></div>
                </div>
              </div>
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-2">{t("صلاحياتي","My Permissions")}</h4>
                <div className="flex flex-wrap gap-2">
                  {permissions.map(p => {
                    const section = flatItems.find(s=>s.key===p);
                    const sectionOvr = permOverrides[p] || {};
                    const activeActions = Object.entries(sectionOvr).filter(([,v]) => v).map(([k]) => k);
                    return (
                      <div key={p} className="glass rounded-xl p-2">
                        <span className="px-3 py-1 rounded-full text-xs gradient-primary text-primary-foreground font-bold">{section?.label || p}</span>
                        {activeActions.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{activeActions.map(a => <span key={a} className="px-2 py-0.5 rounded text-[10px] bg-success/20 text-success font-bold">{a}</span>)}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ======= ATTENDANCE ======= */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-2">{t("الحضور والانصراف", "Attendance")}</h3>
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                  <p className="text-sm text-foreground font-bold">{t("مواعيد العمل:","Work Hours:")}</p>
                  <p className="text-xs text-muted-foreground">{t("بداية: 08:00 صباحاً · نهاية: 04:00 مساءً · تأخير مسموح: 15 دقيقة","Start: 08:00 AM · End: 04:00 PM · Late tolerance: 15 min")}</p>
                  <p className="text-xs text-warning mt-1">{t("⚠️ التأخير: خصم 10 د.ل · الغياب الجزئي: 30 د.ل · الخروج المبكر: 20 د.ل","⚠️ Late: -10 LYD · Partial absence: -30 LYD · Early leave: -20 LYD")}</p>
                </div>
                <div className="flex gap-3 flex-wrap mb-6">
                  {(!todayRecord || !todayRecord.check_in) && <button onClick={() => recordAttendance("in")} className={`${btnPrimary} flex items-center gap-2`}><Check className="h-5 w-5" /> {t("تسجيل حضور", "Check In")}</button>}
                  {todayRecord?.check_in && !todayRecord?.check_out && <button onClick={() => recordAttendance("out")} className="px-6 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold flex items-center gap-2"><LogOut className="h-5 w-5" /> {t("تسجيل انصراف", "Check Out")}</button>}
                  {todayRecord?.check_in && todayRecord?.check_out && <div className="glass rounded-xl p-4 border-success/30 w-full"><p className="text-sm text-success font-bold">✅ {t("تم تسجيل حضورك وانصرافك اليوم", "Today's attendance complete")}</p><p className="text-xs text-muted-foreground mt-1">{t("حضور:","In:")} {todayRecord.check_in} · {t("انصراف:","Out:")} {todayRecord.check_out}</p></div>}
                </div>
                <h4 className="font-bold text-foreground mb-3">{t("سجل الحضور", "Attendance Log")}</h4>
                {attendance.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا يوجد سجل.", "No records.")}</p> : (
                  <div className="space-y-2">{attendance.map(a => (
                    <div key={a.id} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div><p className="text-sm font-bold text-foreground">{a.date}</p><p className="text-xs text-muted-foreground">{t("حضور:","In:")} {a.check_in || "-"} · {t("انصراف:","Out:")} {a.check_out || "-"}</p></div>
                      <div className="text-right"><p className="text-xs">{a.status}</p>{a.deduction > 0 && <p className="text-[10px] text-destructive font-bold">{t("خصم:","Ded:")} {a.deduction} {t("د.ل","LYD")}</p>}</div>
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* ======= REQUESTS ======= */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-2">{t("طلباتي", "My Requests")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[
                    { icon: Calendar, color: "text-primary", title: t("طلب إجازة","Leave"), type: "leave", fields: [{ name: "from", type: "date", label: t("من","From") }, { name: "to", type: "date", label: t("إلى","To") }] },
                    { icon: DollarSign, color: "text-warning", title: t("طلب سلفة","Advance"), type: "advance", fields: [{ name: "amount", type: "number", label: t("المبلغ","Amount") }] },
                    { icon: CreditCard, color: "text-success", title: t("سحب راتب مبكر","Early Salary"), type: "salary", fields: [{ name: "amount", type: "number", label: t("المبلغ","Amount") }] },
                  ].map(req => (
                    <div key={req.type} className="glass rounded-xl p-4">
                      <req.icon className={`h-6 w-6 ${req.color} mb-2`} />
                      <h4 className="font-bold text-foreground text-sm mb-3">{req.title}</h4>
                      <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest(req.type, Object.fromEntries(fd)); (e.target as HTMLFormElement).reset(); }} className="space-y-2">
                        {req.fields.map(f => <input key={f.name} name={f.name} type={f.type} required className={inputClass} placeholder={f.label} />)}
                        <textarea name="reason" rows={2} className={inputClass} placeholder={t("السبب","Reason")} />
                        <button type="submit" className={`w-full ${btnPrimary} flex items-center justify-center gap-2`}><Send className="h-4 w-4" /> {t("إرسال","Submit")}</button>
                      </form>
                    </div>
                  ))}
                </div>
                <h4 className="font-bold text-foreground mb-3">{t("طلباتي السابقة","Previous Requests")}</h4>
                {myRequests.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد طلبات.","No requests.")}</p> : (
                  <div className="space-y-2">{myRequests.map(r => (
                    <div key={r.id} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div><p className="text-sm font-bold text-foreground">{r.type === "leave" ? t("إجازة","Leave") : r.type === "advance" ? t("سلفة","Advance") : t("سحب راتب","Salary")} {r.reason ? `- ${r.reason}` : ""}</p><p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-LY")} {r.amount > 0 ? `· ${r.amount} ${t("د.ل","LYD")}` : ""}</p>{r.admin_notes && <p className="text-[10px] text-primary mt-1">{t("ملاحظات:","Notes:")} {r.admin_notes}</p>}</div>
                      <StatusBadge status={r.status} />
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* ======= MY TASKS ======= */}
          {activeTab === "my-tasks" && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-2">{t("مهامي","My Tasks")}</h3>
                {tasks.length === 0 ? <div className="text-center py-8"><ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد مهام.","No tasks.")}</p></div> : (
                  <div className="space-y-3">{tasks.map(tk => (
                    <div key={tk.id} className={`glass rounded-xl p-4 ${tk.priority === "high" ? "border-l-4 border-l-destructive" : tk.priority === "medium" ? "border-l-4 border-l-warning" : "border-l-4 border-l-success"}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div><p className="text-sm font-bold text-foreground">{tk.title}</p>{tk.description && <p className="text-xs text-muted-foreground mt-1">{tk.description}</p>}</div>
                        <StatusBadge status={tk.status} />
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">{tk.due_date && <span>📅 {tk.due_date}</span>}<span>🔥 {tk.priority === "high" ? t("عالية","High") : tk.priority === "medium" ? t("متوسطة","Medium") : t("منخفضة","Low")}</span></div>
                      {tk.status === "pending" && <button onClick={async () => { await supabase.from("tasks").update({ status: "completed" }).eq("id", tk.id); setTasks(tasks.map(t => t.id === tk.id ? {...t, status: "completed"} : t)); }} className="mt-2 px-3 py-1 rounded text-xs bg-success/20 text-success font-bold">{t("تم الإنجاز","Complete")}</button>}
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* ======= PRODUCTS ======= */}
          {activeTab === "products" && hasSection("products") && (
            <div className="space-y-4">
              <SectionHeader title={t("المنتجات","Products")} desc={t("إدارة المنتجات والمخزون.","Manage products and inventory.")} onAdd={canAction("products","create") ? () => setShowForm("product") : undefined} addLabel={t("إضافة منتج","Add Product")} onPDF={canAction("products","export") ? () => exportToPDF(t("تقرير المنتجات","Products"), products.map(p => ({[t("الاسم","Name")]:p.name,[t("الكود","Code")]:p.code,[t("الكمية","Qty")]:p.quantity,[t("بيع","Sell")]:p.sell_price})), [t("الاسم","Name"),t("الكود","Code"),t("الكمية","Qty"),t("بيع","Sell")]) : undefined} />
              {showForm === "product" && (
                <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); await supabase.from("products").insert({ company_id: companyId!, name: d.name as string, code: d.code as string, type: d.type as string, quantity: Number(d.quantity)||0, buy_price: Number(d.buyPrice)||0, sell_price: Number(d.sellPrice)||0, barcode: d.barcode as string, min_stock: Number(d.minStock)||5, warehouse_id: (d.warehouseId as string) || null }); await refreshProducts(); setShowForm(""); }} className={`${cardClass} space-y-3`}>
                  <h4 className="font-bold text-foreground">{t("إضافة منتج جديد","Add Product")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المنتج *","Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكود","Code")}</label><input name="code" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("النوع","Type")}</label><select name="type" className={inputClass}><option>{t("إلكترونيات","Electronics")}</option><option>{t("ملابس","Clothing")}</option><option>{t("أغذية","Food")}</option><option>{t("أخرى","Other")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية","Qty")}</label><input name="quantity" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر الشراء","Buy")}</label><input name="buyPrice" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر البيع","Sell")}</label><input name="sellPrice" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الباركود","Barcode")}</label><input name="barcode" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الحد الأدنى","Min Stock")}</label><input name="minStock" type="number" defaultValue={5} className={inputClass} /></div>
                    {warehouses.length > 0 && <div><label className="text-xs font-bold text-foreground">{t("المخزن","Warehouse")}</label><select name="warehouseId" className={inputClass}><option value="">{t("-- اختر --","-- Select --")}</option>{warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.name}</option>)}</select></div>}
                  </div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {products.length > 0 ? (
                <div className={`${cardClass} overflow-x-auto`}>
                  <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("الاسم","Name"),t("الكود","Code"),t("النوع","Type"),t("الكمية","Qty"),t("بيع","Sell"),t("حالة","Status"),t("إجراءات","Actions")].map(h => <th key={h} className="text-right py-2 px-2 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                    <tbody>{products.map(p => (<tr key={p.id} className="border-b border-border/30"><td className="py-2 px-2 text-xs font-bold">{p.name}</td><td className="py-2 px-2 text-xs text-muted-foreground">{p.code||"-"}</td><td className="py-2 px-2"><span className="px-2 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary">{p.type||"-"}</span></td><td className="py-2 px-2 text-xs font-bold">{p.quantity}</td><td className="py-2 px-2 text-xs text-primary font-bold">{p.sell_price}</td><td className="py-2 px-2">{(p.quantity||0)<=(p.min_stock||5)?<span className="text-destructive text-[10px] font-bold">⚠️ {t("منخفض","Low")}</span>:<span className="text-success text-[10px]">✅</span>}</td><td className="py-2 px-2">{canAction("products","delete") && <button onClick={async () => { if(confirm(t("حذف؟","Delete?"))) { await supabase.from("products").delete().eq("id", p.id); await refreshProducts(); }}} className="text-destructive p-1"><Trash2 className="h-3 w-3" /></button>}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : !showForm && <div className={`${cardClass} text-center py-8`}><Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد منتجات.","No products.")}</p></div>}
            </div>
          )}

          {/* ======= WAREHOUSES ======= */}
          {activeTab === "warehouses" && hasSection("warehouses") && (
            <div className="space-y-4">
              <SectionHeader title={t("المخازن","Warehouses")} desc={t("عرض المخازن المتاحة.","View available warehouses.")} />
              {warehouses.length === 0 ? <div className={`${cardClass} text-center py-8`}><Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد مخازن.","No warehouses.")}</p></div> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {warehouses.map((wh: any) => { const whProducts = products.filter(p => p.warehouse_id === wh.id); const whValue = whProducts.reduce((a: number, p: any) => a + (Number(p.sell_price) || 0) * (Number(p.quantity) || 0), 0); return (
                    <div key={wh.id} className={`${cardClass} border ${wh.is_default ? "border-primary/50" : "border-border/50"}`}>
                      <h4 className="font-bold text-foreground">{wh.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{wh.location || t("بدون موقع","No location")}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="glass rounded-xl p-2 text-center"><p className="text-lg font-black text-foreground">{whProducts.length}</p><p className="text-[10px] text-muted-foreground">{t("منتج","products")}</p></div>
                        <div className="glass rounded-xl p-2 text-center"><p className="text-lg font-black text-primary">{whValue.toLocaleString()}</p><p className="text-[10px] text-muted-foreground">{t("د.ل","LYD")}</p></div>
                      </div>
                    </div>
                  ); })}
                </div>
              )}
            </div>
          )}

          {/* ======= STOCK MOVEMENTS ======= */}
          {activeTab === "stock" && hasSection("stock") && (
            <div className="space-y-4">
              <SectionHeader title={t("حركة المخزون","Stock Movements")} desc={t("تتبع العمليات داخل المخازن.","Track warehouse operations.")} onAdd={canAction("stock","create") ? () => setShowForm("movement") : undefined} onPDF={canAction("stock","export") ? () => exportToPDF(t("حركة المخزون","Stock"), movements.map(m => ({[t("النوع","Type")]:m.type,[t("الكمية","Qty")]:m.quantity,[t("السبب","Reason")]:m.reason,[t("التاريخ","Date")]:new Date(m.created_at).toLocaleDateString("ar-LY")})), [t("النوع","Type"),t("الكمية","Qty"),t("السبب","Reason"),t("التاريخ","Date")]) : undefined} />
              {showForm === "movement" && (
                <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); await supabase.from("stock_movements").insert({ company_id: companyId!, product_id: d.productId as string, type: d.movementType as string, quantity: Number(d.quantity)||0, reason: d.reason as string, notes: d.notes as string, created_by: user?.id, warehouse_id: (d.warehouseId as string) || null }); const product = products.find(p=>p.id===d.productId); if(product) { const qty = Number(d.quantity)||0; const newQty = ["buy","add","return"].includes(d.movementType as string) ? (product.quantity||0)+qty : Math.max(0,(product.quantity||0)-qty); await supabase.from("products").update({quantity:newQty}).eq("id",product.id); } await refreshMovements(); await refreshProducts(); setShowForm(""); }} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("المنتج *","Product *")}</label><select name="productId" required className={inputClass}><option value="">{t("اختر","Select")}</option>{products.map(p=><option key={p.id} value={p.id}>{p.name} ({p.quantity})</option>)}</select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع الحركة *","Type *")}</label><select name="movementType" required className={inputClass}><option value="buy">{t("شراء","Buy")}</option><option value="sell">{t("بيع","Sell")}</option><option value="add">{t("إضافة","Add")}</option><option value="remove">{t("سحب","Remove")}</option><option value="damage">{t("تلف","Damage")}</option><option value="return">{t("مرتجع","Return")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية *","Qty *")}</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("السبب","Reason")}</label><input name="reason" className={inputClass} /></div>
                    {warehouses.length > 0 && <div><label className="text-xs font-bold text-foreground">{t("المخزن","Warehouse")}</label><select name="warehouseId" className={inputClass}><option value="">{t("-- اختر --","-- Select --")}</option>{warehouses.map((wh: any) => <option key={wh.id} value={wh.id}>{wh.name}</option>)}</select></div>}
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("ملاحظات","Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {movements.length > 0 ? (
                <div className={`${cardClass} overflow-x-auto`}>
                  <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("النوع","Type"),t("الكمية","Qty"),t("السبب","Reason"),t("التاريخ","Date")].map(h => <th key={h} className="text-right py-2 px-3 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                    <tbody>{movements.map(m => (<tr key={m.id} className="border-b border-border/30"><td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{m.type}</span></td><td className="py-2 px-3 text-foreground">{m.quantity}</td><td className="py-2 px-3 text-muted-foreground text-xs">{m.reason||"-"}</td><td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleDateString("ar-LY")}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : <div className={`${cardClass} text-center`}><p className="text-sm text-muted-foreground">{t("لا توجد حركات.","No movements.")}</p></div>}
            </div>
          )}

          {/* ======= BARCODE ======= */}
          {activeTab === "barcode" && hasSection("barcode") && (
            <div className="space-y-4">
              <div className={cardClass}><p className="text-xs text-muted-foreground">{t("استخدم الباركود لتسريع عملية البيع والجرد.","Use barcode to speed up sales and inventory.")}</p></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setBarcodeMode("generate")} className={`${cardClass} hover:border-primary/50 text-center`}><QrCode className="h-10 w-10 text-primary mx-auto mb-3" /><h4 className="font-bold text-foreground">{t("إنشاء باركود","Generate")}</h4></button>
                <button onClick={() => setShowBarcodeScanner(true)} className={`${cardClass} hover:border-primary/50 text-center`}><Camera className="h-10 w-10 text-primary mx-auto mb-3" /><h4 className="font-bold text-foreground">{t("مسح باركود","Scan")}</h4></button>
                <button onClick={() => setBarcodeMode("upload")} className={`${cardClass} hover:border-primary/50 text-center`}><Upload className="h-10 w-10 text-warning mx-auto mb-3" /><h4 className="font-bold text-foreground">{t("رفع صورة باركود","Upload Image")}</h4></button>
              </div>
              {barcodeMode === "generate" && (
                <div className={cardClass}>
                  <input value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} placeholder={t("أدخل رمز الباركود","Enter barcode")} className={inputClass} />
                  <button onClick={() => setGeneratedBarcode(barcodeInput || `MDR${Date.now().toString().slice(-8)}`)} className={`mt-3 ${btnPrimary}`}>{t("إنشاء","Generate")}</button>
                  {generatedBarcode && <div className="mt-4"><BarcodeGenerator value={generatedBarcode} /></div>}
                </div>
              )}
              {barcodeMode === "upload" && (
                <div className={cardClass}>
                  <h4 className="font-bold text-foreground mb-2">{t("رفع صورة باركود للبحث عن المنتج","Upload barcode image to find product")}</h4>
                  <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; try { const { Html5Qrcode } = await import("html5-qrcode"); const scanner = new Html5Qrcode("barcode-upload-reader-emp"); const result = await scanner.scanFile(file, true); setScannedResult(result); const found = products.find(p => p.barcode === result || p.code === result); if (found) { alert(t(`✅ تم العثور على: ${found.name}\nالكمية: ${found.quantity}\nسعر البيع: ${found.sell_price}`,`✅ Found: ${found.name}`)); } else { alert(t(`لم يتم العثور على منتج بهذا الباركود: ${result}`,"Not found")); } } catch { alert(t("تعذر قراءة الباركود.","Could not read barcode.")); } }} className={inputClass} />
                  <div id="barcode-upload-reader-emp" style={{ display: "none" }} />
                  {scannedResult && (() => { const found = products.find(p => p.barcode === scannedResult || p.code === scannedResult); return found ? (
                    <div className="mt-3 glass rounded-xl p-4 border-success/30">
                      <h4 className="font-bold text-success mb-2">✅ {t("تم العثور على المنتج","Product Found")}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">{t("الاسم:","Name:")}</span> <span className="font-bold">{found.name}</span></div>
                        <div><span className="text-muted-foreground">{t("الكمية:","Qty:")}</span> <span className="font-bold">{found.quantity}</span></div>
                        <div><span className="text-muted-foreground">{t("سعر البيع:","Sell:")}</span> <span className="font-bold text-primary">{found.sell_price}</span></div>
                        <div><span className="text-muted-foreground">{t("سعر الشراء:","Buy:")}</span> <span className="font-bold">{found.buy_price}</span></div>
                      </div>
                    </div>
                  ) : null; })()}
                </div>
              )}
              {showBarcodeScanner && <div className="mt-4"><BarcodeScanner onScan={(r) => { setScannedResult(r); setShowBarcodeScanner(false); }} onClose={() => setShowBarcodeScanner(false)} /><button onClick={() => setShowBarcodeScanner(false)} className="mt-2 text-xs text-destructive">{t("إغلاق","Close")}</button></div>}
            </div>
          )}

          {/* ======= SUPPLIERS ======= */}
          {activeTab === "suppliers" && hasSection("suppliers") && (
            <div className="space-y-4">
              <SectionHeader title={t("الموردين","Suppliers")} onAdd={canAction("suppliers","create") ? () => setShowForm("supplier") : undefined} addLabel={t("إضافة مورد","Add Supplier")} />
              {showForm === "supplier" && (
                <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); await supabase.from("suppliers").insert({ company_id: companyId!, name: d.name as string, phone: d.phone as string, email: d.email as string, city: d.city as string, notes: d.notes as string }); await refreshSuppliers(); setShowForm(""); }} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("الاسم *","Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف","Phone")}</label><input name="phone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("البريد","Email")}</label><input name="email" type="email" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المدينة","City")}</label><input name="city" className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("ملاحظات","Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {suppliers.map(s => (
                <div key={s.id} className="glass rounded-xl p-3 flex justify-between items-center">
                  <div><p className="text-sm font-bold text-foreground">{s.name}</p><p className="text-xs text-muted-foreground">{s.phone||"-"} · {s.city||"-"}</p></div>
                  <button onClick={async () => { if(confirm(t("حذف؟","Delete?"))) { await supabase.from("suppliers").delete().eq("id", s.id); await refreshSuppliers(); }}} className="text-destructive p-1"><Trash2 className="h-3 w-3" /></button>
                </div>
              ))}
              {suppliers.length === 0 && !showForm && <p className="text-sm text-muted-foreground">{t("لا يوجد موردين.","No suppliers.")}</p>}
            </div>
          )}

          {/* ======= RETURNS ======= */}
          {activeTab === "returns" && hasSection("returns") && (
            <div className="space-y-4">
              <SectionHeader title={t("التالف والمرتجعات","Returns & Damaged")} desc={t("تتبع المنتجات التالفة والمرتجعات.","Track damaged and returned products.")} />
              {movements.filter(m => ["return","damage","expired"].includes(m.type)).length > 0 ? (
                <div className={`${cardClass} overflow-x-auto`}>
                  <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("النوع","Type"),t("الكمية","Qty"),t("السبب","Reason"),t("التاريخ","Date")].map(h => <th key={h} className="text-right py-2 px-3 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                    <tbody>{movements.filter(m => ["return","damage","expired"].includes(m.type)).map(m => (<tr key={m.id} className="border-b border-border/30"><td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive">{m.type}</span></td><td className="py-2 px-3">{m.quantity}</td><td className="py-2 px-3 text-muted-foreground text-xs">{m.reason||"-"}</td><td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleDateString("ar-LY")}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : <div className={`${cardClass} text-center`}><p className="text-sm text-muted-foreground">{t("لا توجد مرتجعات.","No returns.")}</p></div>}
            </div>
          )}

          {/* ======= INVENTORY ======= */}
          {activeTab === "inventory" && hasSection("inventory") && (
            <div className="space-y-4">
              <SectionHeader title={t("الجرد","Inventory")} desc={t("مراجعة وجرد المنتجات والمخزون.","Review and count products.")} onPDF={() => exportToPDF(t("تقرير الجرد","Inventory"), products.map(p => ({[t("الاسم","Name")]:p.name,[t("الكمية","Qty")]:p.quantity,[t("شراء","Buy")]:p.buy_price,[t("بيع","Sell")]:p.sell_price,[t("قيمة المخزون","Value")]:(p.sell_price||0)*(p.quantity||0)})), [t("الاسم","Name"),t("الكمية","Qty"),t("شراء","Buy"),t("بيع","Sell"),t("قيمة المخزون","Value")])} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("إجمالي المنتجات","Total Products")}</p><p className="text-2xl font-black">{products.length}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("إجمالي الكمية","Total Qty")}</p><p className="text-2xl font-black text-primary">{products.reduce((a,p)=>a+(p.quantity||0),0)}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("قيمة المخزون","Stock Value")}</p><p className="text-2xl font-black text-success">{totalSellValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("منتجات منخفضة","Low Stock")}</p><p className="text-2xl font-black text-destructive">{products.filter(p=>(p.quantity||0)<=(p.min_stock||5)).length}</p></div>
              </div>
              <div className={`${cardClass} overflow-x-auto`}>
                <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("الاسم","Name"),t("الكمية","Qty"),t("الحد الأدنى","Min"),t("حالة","Status")].map(h => <th key={h} className="text-right py-2 px-3 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                  <tbody>{products.map(p => (<tr key={p.id} className="border-b border-border/30"><td className="py-2 px-3 font-bold text-xs">{p.name}</td><td className="py-2 px-3 text-xs">{p.quantity}</td><td className="py-2 px-3 text-xs">{p.min_stock||5}</td><td className="py-2 px-3">{(p.quantity||0)<=(p.min_stock||5)?<span className="text-destructive text-[10px] font-bold">⚠️ {t("منخفض","Low")}</span>:<span className="text-success text-[10px]">✅</span>}</td></tr>))}</tbody>
                </table>
              </div>
            </div>
          )}

          {/* ======= REORDER ======= */}
          {activeTab === "reorder" && hasSection("reorder") && (
            <div className="space-y-4">
              <SectionHeader title={t("إعادة الطلب","Reorder")} desc={t("المنتجات التي وصلت للحد الأدنى وتحتاج إعادة طلب.","Products at minimum stock level.")} />
              {products.filter(p => (p.quantity||0) <= (p.min_stock||5)).length > 0 ? (
                <div className="space-y-2">{products.filter(p => (p.quantity||0) <= (p.min_stock||5)).map(p => (
                  <div key={p.id} className="glass rounded-xl p-3 flex justify-between items-center border-l-4 border-l-destructive">
                    <div><p className="text-sm font-bold text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{t("الكمية:","Qty:")} {p.quantity} · {t("الحد الأدنى:","Min:")} {p.min_stock||5}</p></div>
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                ))}</div>
              ) : <div className={`${cardClass} text-center py-8`}><Check className="h-12 w-12 text-success mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("جميع المنتجات فوق الحد الأدنى.","All products above minimum.")}</p></div>}
            </div>
          )}

          {/* ======= ACCOUNTING ======= */}
          {activeTab === "accounting" && hasSection("accounting") && (
            <div className="space-y-4">
              <SectionHeader title={t("المحاسبة","Accounting")} desc={t("متابعة الأوضاع المالية.","Track financials.")} onPDF={() => exportSimplePDF(t("التقرير المالي","Financial Report"), `${t("رأس المال","Capital")}: ${totalBuyValue} ${t("د.ل","LYD")}\n${t("الأرباح","Profits")}: ${totalProfit} ${t("د.ل","LYD")}\n${t("المخزون","Stock")}: ${totalSellValue} ${t("د.ل","LYD")}`)} />
              <div className="flex gap-2 flex-wrap">
                {["daily","weekly","monthly","yearly"].map(tab => (
                  <button key={tab} onClick={() => setAccountingTab(tab)} className={`px-4 py-2 rounded-xl text-xs ${accountingTab === tab ? "gradient-primary text-primary-foreground font-bold" : "glass text-foreground"}`}>
                    {tab === "daily" ? t("يومي","Daily") : tab === "weekly" ? t("أسبوعي","Weekly") : tab === "monthly" ? t("شهري","Monthly") : t("سنوي","Yearly")}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("رأس المال","Capital")}</p><p className="text-xl font-black">{totalBuyValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("الأرباح","Profits")}</p><p className="text-xl font-black text-success">{totalProfit > 0 ? totalProfit.toLocaleString() : 0}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("المخزون","Stock")}</p><p className="text-xl font-black text-primary">{totalSellValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("الطلبات","Orders")}</p><p className="text-xl font-black">{orders.reduce((a,o)=>a+(o.total||0),0).toLocaleString()}</p></div>
              </div>
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-3">{t("الإيرادات الشهرية","Monthly Revenue")}</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="month" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4,4,0,0]} /></BarChart>
                </ResponsiveContainer>
              </div>
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-3">{t("تفاصيل المنتجات المالية","Product Financial Details")}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("المنتج","Product"),t("الكمية","Qty"),t("شراء","Buy"),t("بيع","Sell"),t("رأس المال","Capital"),t("قيمة البيع","Sell Value"),t("الربح","Profit")].map(h => <th key={h} className="text-right py-2 px-2 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                    <tbody>{products.map(p => { const cap = (p.buy_price||0)*(p.quantity||0); const sv = (p.sell_price||0)*(p.quantity||0); return (<tr key={p.id} className="border-b border-border/30"><td className="py-2 px-2 text-xs font-bold">{p.name}</td><td className="py-2 px-2 text-xs text-center">{p.quantity}</td><td className="py-2 px-2 text-xs">{p.buy_price}</td><td className="py-2 px-2 text-xs text-primary">{p.sell_price}</td><td className="py-2 px-2 text-xs">{cap.toLocaleString()}</td><td className="py-2 px-2 text-xs text-primary">{sv.toLocaleString()}</td><td className="py-2 px-2 text-xs font-bold" style={{color: sv-cap >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}}>{(sv-cap).toLocaleString()}</td></tr>); })}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======= INVOICES ======= */}
          {activeTab === "invoices" && hasSection("invoices") && (
            <div className="space-y-4">
              <SectionHeader title={t("الفواتير","Invoices")} onAdd={() => setShowForm("invoice")} addLabel={t("إنشاء فاتورة","Create Invoice")} onPDF={() => exportToPDF(t("الفواتير","Invoices"), invoices.map(i => ({[t("الرقم","#")]:i.invoice_number,[t("العميل","Client")]:i.customer_name,[t("الإجمالي","Total")]:i.total,[t("التاريخ","Date")]:new Date(i.created_at).toLocaleDateString("ar-LY")})), [t("الرقم","#"),t("العميل","Client"),t("الإجمالي","Total"),t("التاريخ","Date")])} />
              {showForm === "invoice" && (
                <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); const sub = invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0); await supabase.from("invoices").insert({ company_id: companyId!, invoice_number: `INV-${Date.now().toString().slice(-6)}`, customer_name: d.clientName as string, customer_phone: d.clientPhone as string, items: invoiceItems.filter(i => i.product) as any, subtotal: sub, tax: Number(d.tax)||0, discount: Number(d.discount)||0, total: sub - (Number(d.discount)||0) + (Number(d.tax)||0), notes: d.notes as string, status: "pending" }); await refreshInvoices(); setShowForm(""); setInvoiceItems([{ product: "", quantity: 1, price: 0 }]); }} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم العميل *","Client *")}</label><input name="clientName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف","Phone")}</label><input name="clientPhone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الخصم","Discount")}</label><input name="discount" type="number" defaultValue={0} className={inputClass} /></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-foreground">{t("البنود:","Items:")}</p>
                    {invoiceItems.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2">
                        <div className="col-span-5"><select value={item.product} onChange={e => { const items = [...invoiceItems]; items[idx].product = e.target.value; const prod = products.find(p => p.name === e.target.value); if (prod) items[idx].price = Number(prod.sell_price); setInvoiceItems(items); }} className={inputClass}><option value="">{t("اختر","Select")}</option>{products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                        <div className="col-span-3"><input type="number" value={item.quantity} onChange={e => { const items = [...invoiceItems]; items[idx].quantity = Number(e.target.value); setInvoiceItems(items); }} className={inputClass} /></div>
                        <div className="col-span-3"><input type="number" value={item.price} onChange={e => { const items = [...invoiceItems]; items[idx].price = Number(e.target.value); setInvoiceItems(items); }} className={inputClass} /></div>
                        <div className="col-span-1"><button type="button" onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="text-destructive p-2"><Trash2 className="h-3 w-3" /></button></div>
                      </div>
                    ))}
                    <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { product: "", quantity: 1, price: 0 }])} className="text-xs text-primary font-bold">{t("+ إضافة بند","+ Add item")}</button>
                    <p className="text-sm font-bold text-foreground">{t("الإجمالي:","Total:")} {invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0)} {t("د.ل","LYD")}</p>
                  </div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {invoices.length > 0 ? (
                <div className="space-y-2">{invoices.map(inv => (
                  <div key={inv.id} className="glass rounded-xl p-3 flex justify-between items-center">
                    <div><p className="text-sm font-bold text-foreground">{inv.invoice_number} - {inv.customer_name}</p><p className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("ar-LY")}</p></div>
                    <div className="flex items-center gap-2"><span className="text-sm font-bold text-primary">{inv.total} {t("د.ل","LYD")}</span><StatusBadge status={inv.status} /></div>
                  </div>
                ))}</div>
              ) : <div className={`${cardClass} text-center`}><Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد فواتير.","No invoices.")}</p></div>}
            </div>
          )}

          {/* ======= PROFITS ======= */}
          {activeTab === "profits" && hasSection("profits") && (
            <div className="space-y-4">
              <SectionHeader title={t("الأرباح","Profits")} onPDF={() => exportSimplePDF(t("تقرير الأرباح","Profits"), `Capital: ${totalBuyValue}, Profit: ${totalProfit}`)} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("رأس المال","Capital")}</p><p className="text-xl font-black">{totalBuyValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("الأرباح","Profits")}</p><p className="text-xl font-black text-success">{Math.max(0,totalProfit).toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("المخزون","Stock Value")}</p><p className="text-xl font-black text-primary">{totalSellValue.toLocaleString()}</p></div>
                <div className={`${cardClass} text-center`}><p className="text-xs text-muted-foreground">{t("الخسارة","Loss")}</p><p className="text-xl font-black text-destructive">{totalProfit < 0 ? Math.abs(totalProfit).toLocaleString() : 0}</p></div>
              </div>
            </div>
          )}

          {/* ======= REPORTS ======= */}
          {activeTab === "reports" && hasSection("reports") && (
            <div className="space-y-4">
              <SectionHeader title={t("التقارير","Reports")} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onClick={() => exportToPDF(t("المنتجات","Products"), products.map(p => ({[t("الاسم","Name")]:p.name,[t("الكمية","Qty")]:p.quantity,[t("بيع","Sell")]:p.sell_price})), [t("الاسم","Name"),t("الكمية","Qty"),t("بيع","Sell")])} className={`${cardClass} hover:border-primary/50 text-center`}><Package className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{t("تقرير المنتجات","Products Report")}</p></button>
                <button onClick={() => exportToPDF(t("الطلبات","Orders"), orders.map(o => ({[t("العميل","Client")]:o.customer_name,[t("الإجمالي","Total")]:o.total,[t("الحالة","Status")]:o.status})), [t("العميل","Client"),t("الإجمالي","Total"),t("الحالة","Status")])} className={`${cardClass} hover:border-primary/50 text-center`}><ShoppingCart className="h-8 w-8 text-warning mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{t("تقرير الطلبات","Orders Report")}</p></button>
                <button onClick={() => exportSimplePDF(t("تقرير مالي","Financial"), `${t("رأس المال","Capital")}: ${totalBuyValue}\n${t("الأرباح","Profits")}: ${totalProfit}\n${t("المخزون","Stock")}: ${totalSellValue}`)} className={`${cardClass} hover:border-primary/50 text-center`}><BarChart3 className="h-8 w-8 text-success mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{t("التقرير المالي","Financial Report")}</p></button>
                <button onClick={() => exportToPDF(t("الموردين","Suppliers"), suppliers.map(s => ({[t("الاسم","Name")]:s.name,[t("الهاتف","Phone")]:s.phone,[t("المدينة","City")]:s.city})), [t("الاسم","Name"),t("الهاتف","Phone"),t("المدينة","City")])} className={`${cardClass} hover:border-primary/50 text-center`}><Truck className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{t("تقرير الموردين","Suppliers Report")}</p></button>
              </div>
            </div>
          )}

          {/* ======= ORDERS ======= */}
          {activeTab === "orders" && hasSection("orders") && (
            <div className="space-y-4">
              <SectionHeader title={t("تتبع الطلبات","Orders")} onAdd={() => setShowForm("order")} addLabel={t("إنشاء طلب","New Order")} onPDF={() => exportToPDF(t("الطلبات","Orders"), orders.map(o => ({[t("العميل","Client")]:o.customer_name,[t("الإجمالي","Total")]:o.total,[t("الحالة","Status")]:o.status})), [t("العميل","Client"),t("الإجمالي","Total"),t("الحالة","Status")])} />
              {showForm === "order" && (
                <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); await supabase.from("orders").insert({ company_id: companyId!, customer_name: d.customerName as string, customer_phone: d.customerPhone as string, customer_city: d.customerCity as string, total: Number(d.total)||0, notes: d.notes as string }); await refreshOrders(); setShowForm(""); }} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم العميل *","Client Name *")}</label><input name="customerName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف","Phone")}</label><input name="customerPhone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المدينة","City")}</label><input name="customerCity" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المبلغ","Amount")}</label><input name="total" type="number" className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("ملاحظات","Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {orders.length > 0 ? (
                <div className="space-y-2">{orders.map(o => (
                  <div key={o.id} className="glass rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                      <div><p className="text-sm font-bold text-foreground">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.customer_phone||""} · {o.customer_city||""} · {new Date(o.created_at).toLocaleDateString("ar-LY")}</p></div>
                      <div className="flex items-center gap-2"><span className="text-sm font-bold text-primary">{o.total} {t("د.ل","LYD")}</span><StatusBadge status={o.status} /></div>
                    </div>
                    {canAction("orders","change_status") && (
                      <div className="flex gap-1 flex-wrap mt-2">{["pending","processing","shipped","delivered"].map(s => <button key={s} onClick={() => updateOrderStatus(o.id, s)} className={`text-[10px] px-2 py-1 rounded-lg ${o.status === s ? "gradient-primary text-primary-foreground" : "glass text-foreground"}`}>{statusMap[s]?.[lang === "ar" ? "ar" : "en"] || s}</button>)}</div>
                    )}
                  </div>
                ))}</div>
              ) : <div className={`${cardClass} text-center`}><ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد طلبات.","No orders.")}</p></div>}
            </div>
          )}

          {/* ======= MESSAGES ======= */}
          {activeTab === "messages" && hasSection("messages") && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-3">{t("المراسلات مع المدير","Messages with Manager")}</h3>
                <div className="max-h-[400px] overflow-y-auto space-y-2 mb-4">
                  {messagesData.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">{t("لا توجد رسائل.","No messages.")}</p> : messagesData.map(m => (
                    <div key={m.id} className={`glass rounded-xl p-3 max-w-[80%] ${m.sender_id === user?.id ? (lang === "ar" ? "mr-auto" : "ml-auto") : (lang === "ar" ? "ml-auto" : "mr-auto")}`}>
                      <p className="text-xs text-muted-foreground mb-1">{m.sender_id === user?.id ? t("أنت","You") : t("المدير","Manager")}</p>
                      <p className="text-sm text-foreground">{m.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newMessageText} onChange={e => setNewMessageText(e.target.value)} placeholder={t("اكتب رسالتك...","Write message...")} className={`${inputClass} flex-1`} onKeyDown={async (e) => { if (e.key === "Enter" && newMessageText.trim() && myData?.companies) { const ownerQuery = await supabase.from("companies").select("owner_id").eq("id", companyId!).maybeSingle(); if (ownerQuery.data) { await supabase.from("messages").insert({ sender_id: user!.id, receiver_id: ownerQuery.data.owner_id, content: newMessageText }); setNewMessageText(""); const { data } = await supabase.from("messages").select("*").or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).order("created_at", { ascending: true }); setMessagesData(data || []); }}}} />
                  <button onClick={async () => { if (!newMessageText.trim()) return; const ownerQuery = await supabase.from("companies").select("owner_id").eq("id", companyId!).maybeSingle(); if (ownerQuery.data) { await supabase.from("messages").insert({ sender_id: user!.id, receiver_id: ownerQuery.data.owner_id, content: newMessageText }); setNewMessageText(""); const { data } = await supabase.from("messages").select("*").or(`sender_id.eq.${user!.id},receiver_id.eq.${user!.id}`).order("created_at", { ascending: true }); setMessagesData(data || []); }}} className={`${btnPrimary} flex items-center gap-2`}><Send className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          )}

          {/* ======= NOTIFICATIONS ======= */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("الإشعارات","Notifications")} ({notifications.filter(n => !n.read).length} {t("جديد","new")})</h3>
                <div className="flex gap-2">
                  {notifications.length > 0 && <>
                    <button onClick={async () => { for (const n of notifications) { await supabase.from("notifications").update({ read: true }).eq("id", n.id); } setNotifications(notifications.map(n => ({...n, read: true}))); }} className="text-xs text-primary hover:underline">{t("تعيين الكل كمقروء","Mark all read")}</button>
                    <button onClick={async () => { for (const n of notifications) { await supabase.from("notifications").delete().eq("id", n.id); } setNotifications([]); }} className="text-xs text-destructive hover:underline">{t("حذف الكل","Delete all")}</button>
                  </>}
                </div>
              </div>
              {notifications.length === 0 ? (
                <div className={`${cardClass} text-center py-8`}><Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد إشعارات.","No notifications.")}</p></div>
              ) : (
                <div className="space-y-2">{notifications.map(n => (
                  <div key={n.id} className={`glass rounded-xl p-4 ${!n.read ? "border-primary/30" : ""}`}>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm flex-1 ${!n.read ? "font-bold text-foreground" : "text-muted-foreground"}`}>{n.title}: {n.message}</p>
                      <button onClick={async () => { await supabase.from("notifications").delete().eq("id", n.id); setNotifications(notifications.filter(nn => nn.id !== n.id)); }} className="text-destructive mr-2"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString("ar-LY")}</p>
                  </div>
                ))}</div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
