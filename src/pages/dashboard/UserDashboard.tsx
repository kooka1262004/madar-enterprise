import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, Briefcase, Receipt,
  Moon, Sun, Globe, ShieldX, User, Clock, Calendar, Send, Check,
  ListChecks, MessageSquare, Download, Wallet, Plus, Trash2, Search, ShoppingCart
} from "lucide-react";
import { exportToPDF } from "@/utils/pdfExport";
import logo from "@/assets/logo-transparent.png";
import BarcodeScanner from "@/components/BarcodeScanner";
import BarcodeGenerator from "@/components/BarcodeGenerator";

const allSections = [
  { icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard", key: "dashboard" },
  { icon: Briefcase, label: "شؤوني الوظيفية", labelEn: "My Employment", key: "my-info" },
  { icon: Clock, label: "الحضور والانصراف", labelEn: "Attendance", key: "attendance" },
  { icon: Calendar, label: "طلباتي", labelEn: "My Requests", key: "requests" },
  { icon: ListChecks, label: "مهامي", labelEn: "My Tasks", key: "my-tasks" },
  { icon: Package, label: "المنتجات", labelEn: "Products", key: "products" },
  { icon: Warehouse, label: "حركة المخزون", labelEn: "Stock", key: "stock" },
  { icon: QrCode, label: "الباركود", labelEn: "Barcode", key: "barcode" },
  { icon: Truck, label: "الموردين", labelEn: "Suppliers", key: "suppliers" },
  { icon: BarChart3, label: "المحاسبة", labelEn: "Accounting", key: "accounting" },
  { icon: Receipt, label: "الفواتير", labelEn: "Invoices", key: "invoices" },
  { icon: FileText, label: "التقارير", labelEn: "Reports", key: "reports" },
  { icon: Briefcase, label: "الموارد البشرية", labelEn: "HR", key: "hr" },
  { icon: Users, label: "المستخدمين", labelEn: "Users", key: "users" },
  { icon: Settings, label: "الإعدادات", labelEn: "Settings", key: "settings" },
  { icon: ShoppingCart, label: "الطلبات", labelEn: "Orders", key: "orders" },
  { icon: RotateCcw, label: "التالف والمرتجعات", labelEn: "Returns", key: "returns" },
  { icon: ClipboardList, label: "الجرد", labelEn: "Inventory", key: "inventory" },
];

const statusMap: Record<string, { ar: string; color: string }> = {
  pending: { ar: "معلق", color: "bg-warning/20 text-warning" },
  approved: { ar: "موافق", color: "bg-success/20 text-success" },
  rejected: { ar: "مرفوض", color: "bg-destructive/20 text-destructive" },
  completed: { ar: "مكتمل", color: "bg-success/20 text-success" },
  processing: { ar: "قيد التنفيذ", color: "bg-primary/20 text-primary" },
  shipped: { ar: "تم الشحن", color: "bg-primary/20 text-primary" },
  delivered: { ar: "تم التسليم", color: "bg-success/20 text-success" },
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
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState("");
  const [loading, setLoading] = useState(true);
  const [barcodeMode, setBarcodeMode] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedResult, setScannedResult] = useState("");

  const t = (ar: string, en: string) => lang === "ar" ? ar : en;
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";
  const cardClass = "glass rounded-2xl p-5";
  const btnPrimary = "px-6 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-bold";
  const btnOutline = "px-6 py-2.5 rounded-xl border border-border text-foreground text-sm hover:bg-secondary";

  useEffect(() => {
    if (!authLoading && (!user || role !== "employee")) navigate("/login/user");
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
    if (!user || !companyId) return;
    const loadData = async () => {
      setLoading(true);
      const [empRes, tasksRes, reqRes, attRes, prodsRes, movsRes, supRes, ordRes, invRes, notifRes] = await Promise.all([
        supabase.from("employees").select("*, companies(company_name, manager_name)").eq("user_id", user.id).maybeSingle(),
        supabase.from("tasks").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("employee_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("attendance").select("*").eq("company_id", companyId).order("date", { ascending: false }),
        supabase.from("products").select("*").eq("company_id", companyId),
        supabase.from("stock_movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("suppliers").select("*").eq("company_id", companyId),
        supabase.from("orders").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
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
      setLoading(false);
    };
    loadData();
  }, [user, companyId]);

  const permissions: string[] = myData?.permissions || employeeData?.permissions || ["dashboard", "my-info"];
  const visibleSections = allSections.filter(s =>
    ["my-info", "dashboard", "attendance", "requests", "my-tasks"].includes(s.key) || permissions.includes(s.key)
  );

  const logout = async () => { await signOut(); navigate("/login/user"); };
  const baseSalary = Number(myData?.salary) || 0;
  const companyName = myData?.companies?.company_name || employeeData?.companies?.company_name || "";
  const totalDeductions = attendance.reduce((a, r) => a + (r.deduction || 0), 0);
  const netSalary = baseSalary - totalDeductions;

  const today = new Date().toISOString().split("T")[0];
  const todayRecord = attendance.find(a => a.date === today);

  const recordAttendance = async (type: "in" | "out") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });
    const hour = now.getHours();
    const minute = now.getMinutes();
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
    alert(t("تم إرسال طلبك بنجاح! سيراجعه مسؤول الشركة.", "Request submitted!"));
    const { data: reqs } = await supabase.from("employee_requests").select("*").eq("employee_id", myData?.id).order("created_at", { ascending: false });
    setMyRequests(reqs || []);
  };

  const refreshProducts = async () => { if (!companyId) return; const { data } = await supabase.from("products").select("*").eq("company_id", companyId); setProducts(data || []); };
  const refreshSuppliers = async () => { if (!companyId) return; const { data } = await supabase.from("suppliers").select("*").eq("company_id", companyId); setSuppliers(data || []); };
  const refreshMovements = async () => { if (!companyId) return; const { data } = await supabase.from("stock_movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false }); setMovements(data || []); };

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

  const StatusBadge = ({ status }: { status: string }) => {
    const s = statusMap[status] || { ar: status, color: "bg-secondary text-foreground" };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.color}`}>{s.ar}</span>;
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`fixed inset-y-0 ${lang === "ar" ? "right-0 border-l" : "left-0 border-r"} w-64 bg-card border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div><h2 className="font-black text-primary text-sm">{companyName || "مدار"}</h2><p className="text-[10px] text-muted-foreground">{myData.full_name}</p></div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-2 space-y-1 overflow-y-auto h-[calc(100vh-130px)]">
          {visibleSections.map(item => (
            <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <item.icon className="h-4 w-4" />{lang === "ar" ? item.label : item.labelEn}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10"><LogOut className="h-4 w-4" /> {t("تسجيل الخروج", "Logout")}</button>
        </div>
      </aside>

      <main className={`flex-1 ${lang === "ar" ? "md:mr-64" : "md:ml-64"}`}>
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{lang === "ar" ? visibleSections.find(s => s.key === activeTab)?.label : visibleSections.find(s => s.key === activeTab)?.labelEn}</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-secondary relative">
              <Bell className="h-4 w-4" />
              {notifications.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center">{notifications.filter(n => !n.read).length}</span>}
            </button>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl hover:bg-secondary">{theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4" />}</button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="p-2 rounded-xl hover:bg-secondary"><Globe className="h-4 w-4" /></button>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground"><User className="h-4 w-4" /></div>
          </div>
        </header>

        <div className="p-4 md:p-6 space-y-0">
          {/* Access Denied */}
          {!permissions.includes(activeTab) && !["dashboard", "my-info", "attendance", "requests", "my-tasks"].includes(activeTab) && (
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className={cardClass}><DollarSign className="h-5 w-5 text-success mb-2" /><p className="text-xs text-muted-foreground">{t("الراتب الأساسي", "Base Salary")}</p><p className="text-xl font-black text-foreground">{baseSalary.toLocaleString()} <span className="text-xs text-muted-foreground">{t("د.ل", "LYD")}</span></p></div>
                <div className={cardClass}><ListChecks className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("المهام", "Tasks")}</p><p className="text-xl font-black text-foreground">{tasks.length}</p><p className="text-[10px] text-warning">{tasks.filter(t=>t.status==="pending").length} {t("معلقة","pending")}</p></div>
                <div className={cardClass}><Calendar className="h-5 w-5 text-warning mb-2" /><p className="text-xs text-muted-foreground">{t("الطلبات", "Requests")}</p><p className="text-xl font-black text-foreground">{myRequests.length}</p></div>
                <div className={cardClass}><Clock className="h-5 w-5 text-success mb-2" /><p className="text-xs text-muted-foreground">{t("حضور اليوم", "Today")}</p><p className="text-xl font-black text-foreground">{todayRecord?.check_in || t("لم يسجّل", "N/A")}</p></div>
              </div>
              {notifications.filter(n => !n.read).length > 0 && (
                <div className={cardClass}>
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> {t("إشعارات جديدة","New Notifications")}</h4>
                  {notifications.filter(n => !n.read).slice(0, 5).map(n => (
                    <div key={n.id} className="glass rounded-xl p-2 mb-1 border-l-4 border-l-primary">
                      <p className="text-xs font-bold text-foreground">{n.title}</p>
                      <p className="text-[10px] text-muted-foreground">{n.message}</p>
                    </div>
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
                <p className="text-xs text-muted-foreground mb-4">{t("جميع بياناتك الوظيفية كما حددها مسؤول الشركة.", "Your employment details as set by company admin.")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { l: t("الاسم الكامل", "Name"), v: myData.full_name, icon: User },
                    { l: t("البريد الإلكتروني", "Email"), v: myData.email, icon: MessageSquare },
                    { l: t("الهاتف", "Phone"), v: myData.phone || "-", icon: Clock },
                    { l: t("المسمى الوظيفي", "Position"), v: myData.position || "-", icon: Briefcase },
                    { l: t("القسم", "Department"), v: myData.department || "-", icon: Users },
                    { l: t("نوع العقد", "Contract Type"), v: myData.contract_type || "-", icon: FileText },
                    { l: t("نهاية العقد", "Contract End"), v: myData.contract_end || "-", icon: Calendar },
                    { l: t("الراتب الأساسي", "Base Salary"), v: `${baseSalary.toLocaleString()} ${t("د.ل", "LYD")}`, icon: DollarSign },
                    { l: t("المؤهل", "Qualification"), v: myData.qualification || "-", icon: Award },
                    { l: t("الرقم الوطني", "National ID"), v: myData.national_id || "-", icon: CreditCard },
                    { l: t("المصرف", "Bank"), v: myData.bank_name || "-", icon: Wallet },
                    { l: t("رقم الحساب", "Account #"), v: myData.bank_account || "-", icon: Receipt },
                    { l: t("الشركة", "Company"), v: companyName, icon: LayoutDashboard },
                    { l: t("مدير الشركة", "Manager"), v: myData.companies?.manager_name || "-", icon: UserCog },
                  ].map(item => (
                    <div key={item.l} className="glass rounded-xl p-3 flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-primary shrink-0" />
                      <div><p className="text-[10px] text-muted-foreground">{item.l}</p><p className="text-sm font-bold text-foreground">{item.v}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-3">{t("تفاصيل الراتب المتوقع","Expected Salary Details")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="glass rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">{t("الأساسي","Base")}</p><p className="text-lg font-black text-foreground">{baseSalary}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">{t("الخصومات","Deductions")}</p><p className="text-lg font-black text-destructive">{totalDeductions}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">{t("الإضافي","Bonus")}</p><p className="text-lg font-black text-success">0</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-[10px] text-muted-foreground">{t("الصافي","Net")}</p><p className="text-lg font-black text-primary">{netSalary}</p></div>
                </div>
              </div>
              <div className={cardClass}>
                <h4 className="font-bold text-foreground mb-2">{t("صلاحياتي","My Permissions")}</h4>
                <div className="flex flex-wrap gap-2">{permissions.map(p => <span key={p} className="px-3 py-1 rounded-full text-xs gradient-primary text-primary-foreground font-bold">{allSections.find(s=>s.key===p)?.label || p}</span>)}</div>
              </div>
            </div>
          )}

          {/* ======= ATTENDANCE ======= */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-2">{t("الحضور والانصراف", "Attendance")}</h3>
                <p className="text-xs text-muted-foreground mb-4">{t("سجّل حضورك وانصرافك يومياً. سيتم احتساب التأخير والغياب والخصومات تلقائياً.", "Record daily check-in/out.")}</p>
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-4">
                  <p className="text-sm text-foreground font-bold">{t("مواعيد العمل:","Work Hours:")}</p>
                  <p className="text-xs text-muted-foreground">{t("بداية: 08:00 صباحاً · نهاية: 04:00 مساءً · تأخير مسموح: 15 دقيقة","Start: 08:00 AM · End: 04:00 PM · Late tolerance: 15 min")}</p>
                  <p className="text-xs text-warning mt-1">{t("⚠️ التأخير: خصم 10 د.ل · الغياب الجزئي: 30 د.ل · الخروج المبكر: 20 د.ل","⚠️ Late: -10 LYD · Partial absence: -30 LYD · Early leave: -20 LYD")}</p>
                </div>
                <div className="flex gap-3 mb-6">
                  {(!todayRecord || !todayRecord.check_in) && <button onClick={() => recordAttendance("in")} className={`${btnPrimary} flex items-center gap-2`}><Check className="h-5 w-5" /> {t("تسجيل حضور", "Check In")}</button>}
                  {todayRecord?.check_in && !todayRecord?.check_out && <button onClick={() => recordAttendance("out")} className="px-6 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold flex items-center gap-2"><LogOut className="h-5 w-5" /> {t("تسجيل انصراف", "Check Out")}</button>}
                  {todayRecord?.check_in && todayRecord?.check_out && <div className="glass rounded-xl p-4 border-success/30 w-full"><p className="text-sm text-success font-bold">✅ {t("تم تسجيل حضورك وانصرافك اليوم", "Today's attendance complete")}</p><p className="text-xs text-muted-foreground mt-1">{t("حضور:","In:")} {todayRecord.check_in} · {t("انصراف:","Out:")} {todayRecord.check_out}</p></div>}
                </div>
                <h4 className="font-bold text-foreground mb-3">{t("سجل الحضور", "Attendance Log")}</h4>
                {attendance.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا يوجد سجل.", "No records.")}</p> : (
                  <div className="space-y-2">{attendance.map(a => (
                    <div key={a.id} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div><p className="text-sm font-bold text-foreground">{a.date}</p><p className="text-xs text-muted-foreground">{t("حضور:", "In:")} {a.check_in || "-"} · {t("انصراف:", "Out:")} {a.check_out || "-"}</p></div>
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
                  <div className="glass rounded-xl p-4">
                    <Calendar className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("طلب إجازة", "Leave Request")}</h4>
                    <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("leave", Object.fromEntries(fd)); (e.target as HTMLFormElement).reset(); }} className="space-y-2">
                      <select name="leaveType" className={inputClass}><option>{t("سنوية", "Annual")}</option><option>{t("مرضية", "Sick")}</option><option>{t("طارئة", "Emergency")}</option></select>
                      <input name="from" type="date" required className={inputClass} /><input name="to" type="date" required className={inputClass} />
                      <textarea name="reason" rows={2} className={inputClass} placeholder={t("السبب", "Reason")} />
                      <button type="submit" className={`w-full ${btnPrimary} flex items-center justify-center gap-2`}><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <DollarSign className="h-6 w-6 text-warning mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("طلب سلفة", "Advance")}</h4>
                    <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("advance", Object.fromEntries(fd)); (e.target as HTMLFormElement).reset(); }} className="space-y-2">
                      <input name="amount" type="number" required className={inputClass} placeholder={t("المبلغ", "Amount")} />
                      <textarea name="reason" rows={2} className={inputClass} placeholder={t("السبب", "Reason")} />
                      <button type="submit" className={`w-full ${btnPrimary} flex items-center justify-center gap-2`}><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <CreditCard className="h-6 w-6 text-success mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("سحب راتب مبكر", "Early Salary")}</h4>
                    <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("salary", Object.fromEntries(fd)); (e.target as HTMLFormElement).reset(); }} className="space-y-2">
                      <input name="amount" type="number" className={inputClass} placeholder={t("المبلغ", "Amount")} />
                      <textarea name="reason" rows={2} className={inputClass} placeholder={t("ملاحظات", "Notes")} />
                      <button type="submit" className={`w-full ${btnPrimary} flex items-center justify-center gap-2`}><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>
                </div>
                <h4 className="font-bold text-foreground mb-3">{t("طلباتي السابقة", "Previous Requests")}</h4>
                {myRequests.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد طلبات.", "No requests.")}</p> : (
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
                <h3 className="font-bold text-foreground mb-2">{t("مهامي", "My Tasks")}</h3>
                {tasks.length === 0 ? <div className="text-center py-8"><ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد مهام.", "No tasks.")}</p></div> : (
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

          {/* ======= PRODUCTS (with CRUD if permitted) ======= */}
          {activeTab === "products" && permissions.includes("products") && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-foreground">{t("المنتجات","Products")} ({products.length})</h3>
                <div className="flex gap-2">
                  <button onClick={() => exportToPDF(t("المنتجات","Products"), products.map(p => ({[t("الاسم","Name")]:p.name,[t("الكود","Code")]:p.code,[t("الكمية","Qty")]:p.quantity,[t("بيع","Sell")]:p.sell_price})), [t("الاسم","Name"),t("الكود","Code"),t("الكمية","Qty"),t("بيع","Sell")])} className="px-3 py-2 rounded-xl border border-border text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  <button onClick={() => setShowForm("product")} className={`${btnPrimary} flex items-center gap-2 text-xs`}><Plus className="h-3 w-3" /> {t("إضافة","Add")}</button>
                </div>
              </div>
              {showForm === "product" && (
                <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); await supabase.from("products").insert({ company_id: companyId!, name: d.name as string, code: d.code as string, type: d.type as string, quantity: Number(d.quantity)||0, buy_price: Number(d.buyPrice)||0, sell_price: Number(d.sellPrice)||0, barcode: d.barcode as string, min_stock: Number(d.minStock)||5 }); await refreshProducts(); setShowForm(""); }} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المنتج *","Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكود","Code")}</label><input name="code" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("النوع","Type")}</label><select name="type" className={inputClass}><option>{t("إلكترونيات","Electronics")}</option><option>{t("ملابس","Clothing")}</option><option>{t("أغذية","Food")}</option><option>{t("أخرى","Other")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية","Qty")}</label><input name="quantity" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر الشراء","Buy")}</label><input name="buyPrice" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر البيع","Sell")}</label><input name="sellPrice" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الباركود","Barcode")}</label><input name="barcode" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الحد الأدنى","Min Stock")}</label><input name="minStock" type="number" defaultValue={5} className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {products.length > 0 ? (
                <div className={`${cardClass} overflow-x-auto`}>
                  <table className="w-full text-sm"><thead><tr className="border-b border-border">{[t("الاسم","Name"),t("الكود","Code"),t("النوع","Type"),t("الكمية","Qty"),t("بيع","Sell"),t("حالة","Status")].map(h => <th key={h} className="text-right py-2 px-2 text-muted-foreground text-xs">{h}</th>)}</tr></thead>
                    <tbody>{products.map(p => (<tr key={p.id} className="border-b border-border/30"><td className="py-2 px-2 text-xs font-bold">{p.name}</td><td className="py-2 px-2 text-xs text-muted-foreground">{p.code||"-"}</td><td className="py-2 px-2 text-xs">{p.type||"-"}</td><td className="py-2 px-2 text-xs font-bold">{p.quantity}</td><td className="py-2 px-2 text-xs text-primary font-bold">{p.sell_price}</td><td className="py-2 px-2">{(p.quantity||0)<=(p.min_stock||5)?<span className="text-destructive text-[10px] font-bold">⚠️</span>:<span className="text-success text-[10px]">✅</span>}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : <p className="text-sm text-muted-foreground">{t("لا توجد منتجات.","No products.")}</p>}
            </div>
          )}

          {/* ======= BARCODE ======= */}
          {activeTab === "barcode" && permissions.includes("barcode") && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-4">{t("الباركود","Barcode")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <QrCode className="h-8 w-8 text-primary mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-2">{t("إنشاء باركود","Generate Barcode")}</h4>
                    <input value={generatedBarcode} onChange={e => setGeneratedBarcode(e.target.value)} className={inputClass} placeholder={t("أدخل الكود أو اتركه فارغاً للتلقائي","Enter code or leave empty for auto")} />
                    <button onClick={() => { if (!generatedBarcode) setGeneratedBarcode(`BC-${Date.now().toString().slice(-8)}`); setBarcodeMode("generate"); }} className={`mt-2 w-full ${btnPrimary}`}>{t("إنشاء","Generate")}</button>
                    {barcodeMode === "generate" && generatedBarcode && <div className="mt-3"><BarcodeGenerator value={generatedBarcode} /></div>}
                  </div>
                  <div className="glass rounded-xl p-4">
                    <Search className="h-8 w-8 text-warning mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-2">{t("مسح باركود","Scan Barcode")}</h4>
                    <button onClick={() => setShowBarcodeScanner(true)} className={`w-full ${btnPrimary}`}>{t("فتح الماسح","Open Scanner")}</button>
                    {scannedResult && <div className="mt-3 glass rounded-xl p-3"><p className="text-xs text-muted-foreground">{t("النتيجة:","Result:")}</p><p className="font-bold text-foreground">{scannedResult}</p></div>}
                  </div>
                </div>
                {showBarcodeScanner && <div className="mt-4"><BarcodeScanner onResult={(r) => { setScannedResult(r); setShowBarcodeScanner(false); }} /><button onClick={() => setShowBarcodeScanner(false)} className="mt-2 text-xs text-destructive">{t("إغلاق","Close")}</button></div>}
              </div>
            </div>
          )}

          {/* ======= SUPPLIERS ======= */}
          {activeTab === "suppliers" && permissions.includes("suppliers") && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-foreground">{t("الموردين","Suppliers")} ({suppliers.length})</h3>
                <button onClick={() => setShowForm("supplier")} className={`${btnPrimary} flex items-center gap-2 text-xs`}><Plus className="h-3 w-3" /> {t("إضافة","Add")}</button>
              </div>
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
            </div>
          )}

          {/* ======= STOCK ======= */}
          {activeTab === "stock" && permissions.includes("stock") && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-foreground">{t("حركة المخزون","Stock Movements")}</h3>
                <button onClick={() => setShowForm("movement")} className={`${btnPrimary} flex items-center gap-2 text-xs`}><Plus className="h-3 w-3" /> {t("إضافة حركة","Add Movement")}</button>
              </div>
              {showForm === "movement" && (
                <form onSubmit={async (e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const d = Object.fromEntries(fd); await supabase.from("stock_movements").insert({ company_id: companyId!, product_id: d.productId as string, type: d.movementType as string, quantity: Number(d.quantity)||0, reason: d.reason as string, notes: d.notes as string, created_by: user?.id }); const product = products.find(p=>p.id===d.productId); if(product) { const qty = Number(d.quantity)||0; const newQty = ["buy","add","return"].includes(d.movementType as string) ? (product.quantity||0)+qty : Math.max(0,(product.quantity||0)-qty); await supabase.from("products").update({quantity:newQty}).eq("id",product.id); } await refreshMovements(); await refreshProducts(); setShowForm(""); }} className={`${cardClass} space-y-3`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("المنتج *","Product *")}</label><select name="productId" required className={inputClass}><option value="">{t("اختر","Select")}</option>{products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع الحركة *","Type *")}</label><select name="movementType" required className={inputClass}><option value="buy">{t("شراء","Buy")}</option><option value="sell">{t("بيع","Sell")}</option><option value="add">{t("إضافة","Add")}</option><option value="damage">{t("تالف","Damage")}</option><option value="return">{t("مرتجع","Return")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية *","Qty *")}</label><input name="quantity" type="number" required className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("السبب","Reason")}</label><input name="reason" className={inputClass} /></div>
                  <div><label className="text-xs font-bold text-foreground">{t("ملاحظات","Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2"><button type="submit" className={btnPrimary}>{t("حفظ","Save")}</button><button type="button" onClick={() => setShowForm("")} className={btnOutline}>{t("إلغاء","Cancel")}</button></div>
                </form>
              )}
              {movements.length > 0 ? (
                <div className="space-y-2">{movements.slice(0,30).map(m => (
                  <div key={m.id} className="glass rounded-xl p-2 flex justify-between items-center text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary">{m.type}</span>
                    <span className="text-foreground font-bold">{m.quantity}</span>
                    <span className="text-muted-foreground">{m.reason||"-"}</span>
                    <span className="text-muted-foreground">{new Date(m.created_at).toLocaleDateString("ar-LY")}</span>
                  </div>
                ))}</div>
              ) : <p className="text-sm text-muted-foreground">{t("لا توجد حركات.","No movements.")}</p>}
            </div>
          )}

          {/* ======= ORDERS ======= */}
          {activeTab === "orders" && permissions.includes("orders") && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("الطلبات","Orders")} ({orders.length})</h3>
              {orders.map(o => (
                <div key={o.id} className="glass rounded-xl p-3">
                  <div className="flex justify-between items-start mb-2"><div><p className="text-sm font-bold text-foreground">{o.customer_name}</p><p className="text-xs text-muted-foreground">{o.customer_city} · {new Date(o.created_at).toLocaleDateString("ar-LY")}</p></div><div className="text-right"><p className="text-sm font-bold text-primary">{o.total} {t("د.ل","LYD")}</p><StatusBadge status={o.status} /></div></div>
                  <div className="flex items-center gap-1">{["pending","processing","shipped","delivered"].map((s,i) => (<div key={s} className="flex-1"><div className={`h-1.5 rounded-full ${["pending","processing","shipped","delivered"].indexOf(o.status) >= i ? "bg-primary" : "bg-border"}`} /><p className="text-[9px] text-center text-muted-foreground mt-1">{statusMap[s]?.ar}</p></div>))}</div>
                </div>
              ))}
              {orders.length === 0 && <p className="text-sm text-muted-foreground">{t("لا توجد طلبات.","No orders.")}</p>}
            </div>
          )}

          {/* ======= ACCOUNTING ======= */}
          {activeTab === "accounting" && permissions.includes("accounting") && (
            <div className="space-y-4">
              <div className={cardClass}>
                <h3 className="font-bold text-foreground mb-4">{t("المحاسبة","Accounting")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("رأس المال","Capital")}</p><p className="text-lg font-black">{products.reduce((a,p)=>a+(p.buy_price||0)*(p.quantity||0),0).toLocaleString()}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("المخزون","Stock")}</p><p className="text-lg font-black text-primary">{products.reduce((a,p)=>a+(p.sell_price||0)*(p.quantity||0),0).toLocaleString()}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("الربح","Profit")}</p><p className="text-lg font-black text-success">{(products.reduce((a,p)=>a+(p.sell_price||0)*(p.quantity||0),0)-products.reduce((a,p)=>a+(p.buy_price||0)*(p.quantity||0),0)).toLocaleString()}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("الطلبات","Orders")}</p><p className="text-lg font-black">{orders.reduce((a,o)=>a+(o.total||0),0).toLocaleString()}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* ======= INVOICES ======= */}
          {activeTab === "invoices" && permissions.includes("invoices") && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("الفواتير","Invoices")} ({invoices.length})</h3>
              {invoices.map(inv => (
                <div key={inv.id} className="glass rounded-xl p-3 flex justify-between items-center">
                  <div><p className="text-sm font-bold text-foreground">{inv.invoice_number} - {inv.customer_name}</p><p className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString("ar-LY")}</p></div>
                  <span className="text-sm font-bold text-primary">{inv.total} {t("د.ل","LYD")}</span>
                </div>
              ))}
              {invoices.length === 0 && <p className="text-sm text-muted-foreground">{t("لا توجد فواتير.","No invoices.")}</p>}
            </div>
          )}

        </div>
      </main>
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
};

export default UserDashboard;