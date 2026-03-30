import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, LogOut, Bell, Menu, X, Package, Warehouse, BarChart3, QrCode,
  Truck, ClipboardList, RotateCcw, FileText, DollarSign, Briefcase, Clock, TrendingUp, ShoppingCart, UserCog,
  Moon, Sun, Globe, Download, Camera, Upload, Plus, Trash2, Send, Check, Eye, Award, Flag, MessageSquare, Calendar, ListChecks, Settings, Receipt, Users
} from "lucide-react";
import logo from "@/assets/logo-transparent.png";
import { exportToPDF, exportSimplePDF } from "@/utils/pdfExport";

const allSidebarItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard", key: "dashboard" },
  { icon: Briefcase, label: "شؤوني الوظيفية", labelEn: "My Employment", key: "my-info" },
  { icon: Package, label: "المنتجات", labelEn: "Products", key: "products" },
  { icon: Warehouse, label: "حركة المخزون", labelEn: "Stock", key: "stock" },
  { icon: QrCode, label: "الباركود", labelEn: "Barcode", key: "barcode" },
  { icon: Truck, label: "الموردين", labelEn: "Suppliers", key: "suppliers" },
  { icon: ClipboardList, label: "الجرد", labelEn: "Inventory", key: "inventory" },
  { icon: ShoppingCart, label: "إعادة الطلب", labelEn: "Reorder", key: "reorder" },
  { icon: RotateCcw, label: "التالف والمرتجعات", labelEn: "Returns", key: "returns" },
  { icon: BarChart3, label: "المحاسبة", labelEn: "Accounting", key: "accounting" },
  { icon: TrendingUp, label: "الأرباح", labelEn: "Profits", key: "profits" },
  { icon: Receipt, label: "الفواتير", labelEn: "Invoices", key: "invoices" },
  { icon: FileText, label: "التقارير", labelEn: "Reports", key: "reports" },
  { icon: Briefcase, label: "الموارد البشرية", labelEn: "HR", key: "hr" },
  { icon: Users, label: "المستخدمين", labelEn: "Users", key: "users" },
  { icon: Clock, label: "سجل النشاطات", labelEn: "Activity", key: "activity-log" },
  { icon: Settings, label: "الإعدادات", labelEn: "Settings", key: "settings" },
  { icon: Bell, label: "الإشعارات", labelEn: "Notifications", key: "notifications" },
  { icon: MessageSquare, label: "المراسلات", labelEn: "Messages", key: "messages" },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem("madar_theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");
  const user = JSON.parse(localStorage.getItem("madar_user") || "{}");
  const [notifications, setNotifications] = useState<any[]>(() => JSON.parse(localStorage.getItem(`madar_notif_user_${user.id}`) || "[]"));

  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    localStorage.setItem("madar_theme", theme);
    if (theme === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("madar_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  // Redirect if not logged in
  useEffect(() => {
    if (!user.id) navigate("/login/user");
  }, []);

  // Get permissions - only show what admin allowed + always show my-info & notifications
  const permissions = user.permissions || [];
  const alwaysVisible = ["dashboard", "my-info", "notifications", "messages"];
  const visibleItems = allSidebarItems.filter(i => alwaysVisible.includes(i.key) || permissions.includes(i.key));

  // Get company data (read-only for employee)
  const companyId = user.companyId;
  const products = JSON.parse(localStorage.getItem(`madar_products_${companyId}`) || "[]");
  const movements = JSON.parse(localStorage.getItem(`madar_movements_${companyId}`) || "[]");
  const suppliers = JSON.parse(localStorage.getItem(`madar_suppliers_${companyId}`) || "[]");
  const employees = JSON.parse(localStorage.getItem(`madar_employees_${companyId}`) || "[]");
  const damaged = JSON.parse(localStorage.getItem(`madar_damaged_${companyId}`) || "[]");
  const tasks = JSON.parse(localStorage.getItem(`madar_tasks_${companyId}`) || "[]");
  const violations = JSON.parse(localStorage.getItem(`madar_violations_${companyId}`) || "[]");
  const rewards = JSON.parse(localStorage.getItem(`madar_rewards_${companyId}`) || "[]");
  const leaves = JSON.parse(localStorage.getItem(`madar_leaves_${companyId}`) || "[]");
  const advances = JSON.parse(localStorage.getItem(`madar_advances_${companyId}`) || "[]");
  const invoices = JSON.parse(localStorage.getItem(`madar_invoices_${companyId}`) || "[]");

  // Find my employee record
  const myEmployee = employees.find((e: any) => e.email === user.email || e.id === user.id) || {};
  const myTasks = tasks.filter((t: any) => t.employee === myEmployee.fullName || t.employee === user.username);
  const myViolations = violations.filter((v: any) => v.employee === myEmployee.fullName || v.employee === user.username);
  const myRewards = rewards.filter((r: any) => r.employee === myEmployee.fullName || r.employee === user.username);
  const myLeaves = leaves.filter((l: any) => l.employee === myEmployee.fullName || l.employee === user.username);
  const myAdvances = advances.filter((a: any) => a.employee === myEmployee.fullName || a.employee === user.username);

  const logout = () => { localStorage.removeItem("madar_user"); navigate("/login/user"); };
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

  const markNotifRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? {...n, read: true} : n);
    setNotifications(updated);
    localStorage.setItem(`madar_notif_user_${user.id}`, JSON.stringify(updated));
  };

  const totalBuyValue = products.reduce((a: number, p: any) => a + (Number(p.buyPrice) || 0) * (Number(p.quantity) || 0), 0);
  const totalSellValue = products.reduce((a: number, p: any) => a + (Number(p.sellPrice) || 0) * (Number(p.quantity) || 0), 0);
  const totalProfit = totalSellValue - totalBuyValue;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 ${lang === "ar" ? "right-0 border-l" : "left-0 border-r"} w-64 bg-card border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">{user.companyName || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">{t("واجهة الموظف","Employee Panel")}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-130px)]">
          {visibleItems.map((item) => (
            <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <item.icon className="h-4 w-4" />{lang === "ar" ? item.label : item.labelEn}
              {item.key === "notifications" && unreadCount > 0 && <span className="mr-auto px-1.5 py-0.5 rounded-full text-[10px] bg-destructive text-destructive-foreground">{unreadCount}</span>}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-border">
          <div className="glass rounded-xl p-2 mb-2">
            <p className="text-[10px] text-muted-foreground text-center">{user.name} • {user.position || t("موظف","Employee")}</p>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="h-4 w-4" /> {t("تسجيل الخروج","Logout")}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${lang === "ar" ? "md:mr-64" : "md:ml-64"}`}>
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{visibleItems.find(s => s.key === activeTab)?.[lang === "ar" ? "label" : "labelEn"] || t("لوحة التحكم","Dashboard")}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => { const nt = theme === "dark" ? "light" : "dark"; setTheme(nt); }} className="p-2 rounded-xl hover:bg-secondary">
              {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => { const nl = lang === "ar" ? "en" : "ar"; setLang(nl); localStorage.setItem("madar_lang", nl); document.documentElement.dir = nl === "ar" ? "rtl" : "ltr"; }} className="p-2 rounded-xl hover:bg-secondary">
              <Globe className="h-4 w-4 text-foreground" />
            </button>
            <button onClick={() => setActiveTab("notifications")} className="relative p-2 rounded-xl hover:bg-secondary">
              <Bell className="h-4 w-4 text-foreground" />
              {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center">{unreadCount}</span>}
            </button>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* ========== DASHBOARD ========== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("مرحباً","Welcome")} {user.name || user.username} 👋</h3>
                <p className="text-sm text-muted-foreground">{t("هذه لوحتك الشخصية. الأقسام المتاحة لك تعتمد على الصلاحيات التي حددها مسؤول شركتك.","This is your personal panel. Available sections depend on permissions set by your company admin.")}</p>
                <div className="mt-3 glass rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">{t("الشركة:","Company:")} <span className="text-primary font-bold">{user.companyName}</span> • {t("المسؤول:","Admin:")} <span className="font-bold text-foreground">{user.adminName}</span></p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الوظيفة","Position")}</p><p className="text-sm font-bold text-foreground">{myEmployee.position || user.position || "-"}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("القسم","Department")}</p><p className="text-sm font-bold text-foreground">{myEmployee.department || "-"}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الراتب","Salary")}</p><p className="text-sm font-bold text-primary">{myEmployee.salary || t("غير محدد","N/A")} {myEmployee.salary ? t("د.ل","LYD") : ""}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("العقد","Contract")}</p><p className="text-sm font-bold text-foreground">{myEmployee.contractType || t("غير محدد","N/A")}</p></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-primary">{myTasks.length}</p><p className="text-xs text-muted-foreground">{t("المهام","Tasks")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-success">{myRewards.length}</p><p className="text-xs text-muted-foreground">{t("المكافآت","Rewards")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-warning">{myLeaves.length}</p><p className="text-xs text-muted-foreground">{t("الإجازات","Leaves")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-destructive">{myViolations.length}</p><p className="text-xs text-muted-foreground">{t("المخالفات","Violations")}</p></div>
              </div>
              {/* Accessible sections */}
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-3">{t("الأقسام المتاحة لك","Available Sections")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {visibleItems.filter(i => !alwaysVisible.includes(i.key) || i.key === "my-info").map(item => (
                    <button key={item.key} onClick={() => setActiveTab(item.key)} className="glass rounded-xl p-3 text-center hover:border-primary/30 transition-all">
                      <item.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                      <p className="text-xs font-bold text-foreground">{lang === "ar" ? item.label : item.labelEn}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========== MY EMPLOYMENT INFO ========== */}
          {activeTab === "my-info" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("شؤوني الوظيفية","My Employment Info")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { l: t("الاسم","Name"), v: myEmployee.fullName || user.name },
                    { l: t("البريد","Email"), v: myEmployee.email || user.email },
                    { l: t("الوظيفة","Position"), v: myEmployee.position },
                    { l: t("القسم","Department"), v: myEmployee.department },
                    { l: t("الراتب الأساسي","Base Salary"), v: myEmployee.salary ? `${myEmployee.salary} ${t("د.ل","LYD")}` : "-" },
                    { l: t("نوع العقد","Contract"), v: myEmployee.contractType },
                    { l: t("نهاية العقد","Contract End"), v: myEmployee.contractEnd || t("غير محدد","N/A") },
                    { l: t("الرقم الوطني","National ID"), v: myEmployee.nationalId },
                    { l: t("المؤهل","Qualification"), v: myEmployee.qualification },
                    { l: t("المصرف","Bank"), v: myEmployee.bankName },
                    { l: t("رقم الحساب","Account"), v: myEmployee.bankAccount },
                    { l: t("الشركة","Company"), v: user.companyName },
                  ].map(item => (
                    <div key={item.l} className="glass rounded-xl p-3 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{item.l}</span>
                      <span className="text-sm font-bold text-foreground">{item.v || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-3">{t("مهامي","My Tasks")} ({myTasks.length})</h4>
                {myTasks.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد مهام.","No tasks.")}</p> : (
                  <div className="space-y-2">{myTasks.map((task: any) => (
                    <div key={task.id} className="glass rounded-xl p-3">
                      <div className="flex justify-between items-start"><p className="text-sm font-bold text-foreground">{task.title}</p><span className={`px-2 py-0.5 rounded-full text-[10px] ${task.priority === "أساسية" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>{task.priority}</span></div>
                      <p className="text-xs text-muted-foreground mt-1">{task.details}</p>
                      {task.deadline && <p className="text-[10px] text-warning mt-1">⏰ {t("الموعد:","Deadline:")} {task.deadline}</p>}
                    </div>
                  ))}</div>
                )}
              </div>

              {/* Salary Details */}
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-3">{t("تفاصيل راتبي","My Salary Details")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("الأساسي","Base")}</p><p className="text-lg font-black text-primary">{myEmployee.salary || 0} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("المكافآت","Rewards")}</p><p className="text-lg font-black text-success">{myRewards.reduce((a: number, r: any) => a + (Number(r.amount) || 0), 0)} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("الخصومات","Deductions")}</p><p className="text-lg font-black text-destructive">{myViolations.reduce((a: number, v: any) => a + (Number(v.amount) || 0), 0)} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("السلف","Advances")}</p><p className="text-lg font-black text-warning">{myAdvances.reduce((a: number, a2: any) => a + (Number(a2.amount) || 0), 0)} {t("د.ل","LYD")}</p></div>
                </div>
                <div className="mt-4 glass rounded-xl p-4 border-primary/30">
                  <p className="text-sm text-muted-foreground">{t("صافي الراتب المتوقع:","Expected net salary:")}</p>
                  <p className="text-2xl font-black text-primary">{(Number(myEmployee.salary) || 0) + myRewards.reduce((a: number, r: any) => a + (Number(r.amount) || 0), 0) - myViolations.reduce((a: number, v: any) => a + (Number(v.amount) || 0), 0) - myAdvances.reduce((a: number, a2: any) => a + (Number(a2.amount) || 0), 0)} {t("د.ل","LYD")}</p>
                </div>
              </div>

              {/* Violations */}
              {myViolations.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-3">{t("مخالفاتي","My Violations")}</h4>
                  <div className="space-y-2">{myViolations.map((v: any) => (
                    <div key={v.id} className="flex justify-between items-center glass rounded-xl p-3">
                      <div><p className="text-sm text-foreground">{v.reason}</p><p className="text-xs text-muted-foreground">{new Date(v.date).toLocaleDateString("ar-LY")}</p></div>
                      <span className="text-sm font-bold text-destructive">-{v.amount} {t("د.ل","LYD")}</span>
                    </div>
                  ))}</div>
                </div>
              )}

              {/* Leaves */}
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-3">{t("إجازاتي","My Leaves")}</h4>
                {myLeaves.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد إجازات.","No leaves.")}</p> : (
                  <div className="space-y-2">{myLeaves.map((l: any) => (
                    <div key={l.id} className="flex justify-between items-center glass rounded-xl p-3">
                      <div><p className="text-sm font-bold text-foreground">{l.type}</p><p className="text-xs text-muted-foreground">{l.days} {t("أيام","days")} - {l.reason}</p></div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${l.status === "approved" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{l.status === "approved" ? t("مقبول","Approved") : t("معلّق","Pending")}</span>
                    </div>
                  ))}</div>
                )}
              </div>

              {/* Rewards */}
              {myRewards.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-3">{t("مكافآتي","My Rewards")}</h4>
                  <div className="space-y-2">{myRewards.map((r: any) => (
                    <div key={r.id} className="flex justify-between items-center glass rounded-xl p-3">
                      <div><p className="text-sm text-foreground">{r.reason}</p><p className="text-xs text-muted-foreground">{new Date(r.date).toLocaleDateString("ar-LY")}</p></div>
                      <span className="text-sm font-bold text-success">+{r.amount} {t("د.ل","LYD")}</span>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}

          {/* ========== PRODUCTS (Read-only) ========== */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("عرض المنتجات المتاحة في مخزون شركتك (للقراءة فقط).","View available products in your company inventory (read-only).")}</p>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("المنتجات","Products")} ({products.length})</h3>
                <button onClick={() => exportToPDF(t("المنتجات","Products"), products.map((p: any) => ({ name: p.name, qty: p.quantity, price: p.sellPrice })), [t("المنتج","Product"),t("الكمية","Qty"),t("السعر","Price")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
              </div>
              {products.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد منتجات.","No products.")}</p></div> : (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج","Product")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية","Qty")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("سعر البيع","Price")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("النوع","Type")}</th></tr></thead>
                    <tbody>{products.map((p: any) => (<tr key={p.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground font-medium">{p.name}</td><td className="py-2 px-3">{p.quantity}</td><td className="py-2 px-3 text-primary font-bold">{p.sellPrice} {t("د.ل","LYD")}</td><td className="py-2 px-3 text-muted-foreground">{p.type}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== STOCK MOVEMENTS (Read-only) ========== */}
          {activeTab === "stock" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("حركة المخزون","Stock Movements")} ({movements.length})</h3>
              {movements.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد حركات.","No movements.")}</p></div> : (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج","Product")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("النوع","Type")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية","Qty")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("التاريخ","Date")}</th></tr></thead>
                    <tbody>{movements.map((m: any) => (<tr key={m.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground">{m.product}</td><td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{m.movementType}</span></td><td className="py-2 px-3">{m.quantity}</td><td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.date).toLocaleDateString("ar-LY")}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== INVOICES (Read-only) ========== */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("الفواتير","Invoices")} ({invoices.length})</h3>
              {invoices.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد فواتير.","No invoices.")}</p></div> : (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">#</th><th className="text-right py-2 px-3 text-muted-foreground">{t("العميل","Client")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الإجمالي","Total")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة","Status")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("التاريخ","Date")}</th></tr></thead>
                    <tbody>{invoices.map((inv: any) => (<tr key={inv.id} className="border-b border-border/30"><td className="py-2 px-3 text-primary font-mono">{inv.invoiceNumber}</td><td className="py-2 px-3 text-foreground">{inv.clientName}</td><td className="py-2 px-3 font-bold">{inv.total} {t("د.ل","LYD")}</td><td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === "paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{inv.status === "paid" ? t("مدفوعة","Paid") : t("معلّقة","Pending")}</span></td><td className="py-2 px-3 text-muted-foreground text-xs">{new Date(inv.createdAt).toLocaleDateString("ar-LY")}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== PROFITS (Read-only) ========== */}
          {activeTab === "profits" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("الأرباح","Profits")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("رأس المال","Capital")}</p><p className="text-xl font-black text-foreground">{totalBuyValue} {t("د.ل","LYD")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الأرباح","Profits")}</p><p className="text-xl font-black text-success">{totalProfit > 0 ? totalProfit : 0} {t("د.ل","LYD")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("قيمة المخزون","Stock")}</p><p className="text-xl font-black text-primary">{totalSellValue} {t("د.ل","LYD")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الخسارة","Loss")}</p><p className="text-xl font-black text-destructive">{totalProfit < 0 ? Math.abs(totalProfit) : 0} {t("د.ل","LYD")}</p></div>
              </div>
            </div>
          )}

          {/* ========== ACCOUNTING (Read-only) ========== */}
          {activeTab === "accounting" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("المحاسبة","Accounting")}</h3>
              <p className="text-sm text-muted-foreground">{t("عرض البيانات المحاسبية للشركة (للقراءة فقط).","View company accounting data (read-only).")}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("المبيعات","Sales")}</p><p className="text-xl font-black text-primary">0 {t("د.ل","LYD")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("المصروفات","Expenses")}</p><p className="text-xl font-black text-destructive">0 {t("د.ل","LYD")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("صافي الربح","Net Profit")}</p><p className="text-xl font-black text-success">{totalProfit} {t("د.ل","LYD")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الرواتب","Salaries")}</p><p className="text-xl font-black text-warning">{employees.reduce((a: number, e: any) => a + (Number(e.salary) || 0), 0)} {t("د.ل","LYD")}</p></div>
              </div>
            </div>
          )}

          {/* ========== REPORTS (Read-only) ========== */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("التقارير","Reports")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: t("تقرير المنتجات","Products"), data: products, cols: [t("المنتج","Product"),t("الكمية","Qty"),t("السعر","Price")] },
                  { name: t("تقرير الحركات","Movements"), data: movements, cols: [t("المنتج","Product"),t("النوع","Type"),t("الكمية","Qty")] },
                  { name: t("تقرير الموردين","Suppliers"), data: suppliers, cols: [t("المورد","Supplier"),t("الهاتف","Phone")] },
                ].map(r => (
                  <div key={r.name} className="glass rounded-xl p-4">
                    <FileText className="h-6 w-6 text-primary mb-2" />
                    <p className="text-sm font-bold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{r.data.length} {t("سجل","records")}</p>
                    <button onClick={() => exportToPDF(r.name, r.data, r.cols)} className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========== SUPPLIERS (Read-only) ========== */}
          {activeTab === "suppliers" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("الموردين","Suppliers")} ({suppliers.length})</h3>
              {suppliers.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا يوجد موردين.","No suppliers.")}</p></div> : (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("المورد","Supplier")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الهاتف","Phone")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("المدينة","City")}</th></tr></thead>
                    <tbody>{suppliers.map((s: any) => (<tr key={s.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground font-medium">{s.name}</td><td className="py-2 px-3">{s.phone}</td><td className="py-2 px-3 text-muted-foreground">{s.city}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== RETURNS (Read-only) ========== */}
          {activeTab === "returns" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("التالف والمرتجعات","Damaged & Returns")} ({damaged.length})</h3>
              {damaged.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد سجلات.","No records.")}</p></div> : (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج","Product")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("النوع","Type")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية","Qty")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("السبب","Reason")}</th></tr></thead>
                    <tbody>{damaged.map((d: any) => (<tr key={d.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground">{d.product}</td><td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-destructive/20 text-destructive">{d.type}</span></td><td className="py-2 px-3">{d.quantity}</td><td className="py-2 px-3 text-muted-foreground text-xs">{d.reason}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ========== NOTIFICATIONS ========== */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("الإشعارات","Notifications")}</h3>
                {notifications.length > 0 && <button onClick={() => { const updated = notifications.map(n => ({...n, read: true})); setNotifications(updated); localStorage.setItem(`madar_notif_user_${user.id}`, JSON.stringify(updated)); }} className="text-xs text-primary hover:underline">{t("تعيين الكل كمقروء","Mark all read")}</button>}
              </div>
              {notifications.length === 0 ? (
                <div className="glass rounded-2xl p-6 text-center"><Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد إشعارات.","No notifications.")}</p></div>
              ) : (
                <div className="space-y-2">{notifications.map((n: any) => (
                  <div key={n.id} onClick={() => markNotifRead(n.id)} className={`glass rounded-xl p-4 cursor-pointer transition-all ${!n.read ? "border-primary/30" : ""}`}>
                    <div className="flex justify-between items-start">
                      <p className="text-sm text-foreground">{n.message}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.date).toLocaleDateString("ar-LY")}</p>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* ========== MESSAGES ========== */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("المراسلات","Messages")}</h3>
              <p className="text-sm text-muted-foreground">{t("المراسلات الواردة من إدارة الشركة.","Messages from company management.")}</p>
              <div className="glass rounded-2xl p-6 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">{t("لا توجد رسائل.","No messages.")}</p>
              </div>
            </div>
          )}

          {/* Fallback for sections without permission */}
          {!visibleItems.find(i => i.key === activeTab) && !["dashboard","my-info","notifications","messages"].includes(activeTab) && (
            <div className="glass rounded-2xl p-6 text-center">
              <Shield className="h-16 w-16 text-destructive/50 mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">{t("غير مصرح لك","Access Denied")}</h3>
              <p className="text-sm text-muted-foreground">{t("ليس لديك صلاحية للوصول لهذا القسم. تواصل مع مسؤول شركتك لتفعيل الصلاحية.","You don't have permission to access this section. Contact your company admin.")}</p>
            </div>
          )}
        </div>
      </main>

      {/* Overlay */}
      {sidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />}
    </div>
  );
};

export default UserDashboard;
