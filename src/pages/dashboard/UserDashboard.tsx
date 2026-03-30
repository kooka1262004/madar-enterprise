import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, LogOut, Bell, Menu, X, Package, Warehouse, BarChart3, QrCode,
  Truck, ClipboardList, RotateCcw, FileText, DollarSign, Briefcase, Clock, TrendingUp, ShoppingCart, UserCog,
  Moon, Sun, Globe, Download, Camera, Upload, Plus, Trash2, Send, Check, Eye, Award, Flag, MessageSquare, Calendar, ListChecks
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
  { icon: FileText, label: "التقارير", labelEn: "Reports", key: "reports" },
  { icon: Briefcase, label: "الموارد البشرية", labelEn: "HR", key: "hr" },
  { icon: Clock, label: "سجل النشاطات", labelEn: "Activity", key: "activity-log" },
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

  // Get permissions
  const permissions = user.permissions || allSidebarItems.map(i => i.key);
  const visibleItems = allSidebarItems.filter(i => ["dashboard","my-info","notifications","messages"].includes(i.key) || permissions.includes(i.key));

  // Get company data
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
  const messages = JSON.parse(localStorage.getItem(`madar_messages_${companyId}`) || "[]");

  // Find my employee record
  const myEmployee = employees.find((e: any) => e.email === user.email || e.fullName === user.username || e.fullName === user.name) || {};
  const myTasks = tasks.filter((t: any) => t.employee === myEmployee.fullName || t.employee === user.username);
  const myViolations = violations.filter((v: any) => v.employee === myEmployee.fullName || v.employee === user.username);
  const myRewards = rewards.filter((r: any) => r.employee === myEmployee.fullName || r.employee === user.username);
  const myLeaves = leaves.filter((l: any) => l.employee === myEmployee.fullName || l.employee === user.username);
  const myAdvances = advances.filter((a: any) => a.employee === myEmployee.fullName || a.employee === user.username);

  const logout = () => { localStorage.removeItem("madar_user"); navigate("/"); };
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
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="h-4 w-4" /> {t("تسجيل الخروج","Logout")}
          </button>
        </div>
      </aside>

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
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("مرحباً","Welcome")} {user.username || user.name || t("بك","back")} 👋</h3>
                <p className="text-sm text-muted-foreground">{t("الأقسام المتاحة لك تعتمد على الصلاحيات التي حددها مسؤول شركتك.","Available sections depend on permissions set by your company admin.")}</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الوظيفة","Position")}</p><p className="text-sm font-bold text-foreground">{myEmployee.position || user.role || "-"}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الشركة","Company")}</p><p className="text-sm font-bold text-foreground">{user.companyName || "-"}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الراتب","Salary")}</p><p className="text-sm font-bold text-primary">{myEmployee.salary || t("غير محدد","N/A")} {myEmployee.salary ? t("د.ل","LYD") : ""}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("العقد","Contract")}</p><p className="text-sm font-bold text-foreground">{myEmployee.contractType || t("غير محدد","N/A")}</p></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-primary">{myTasks.length}</p><p className="text-xs text-muted-foreground">{t("المهام","Tasks")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-success">{myRewards.length}</p><p className="text-xs text-muted-foreground">{t("المكافآت","Rewards")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-warning">{myLeaves.length}</p><p className="text-xs text-muted-foreground">{t("الإجازات","Leaves")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-destructive">{myViolations.length}</p><p className="text-xs text-muted-foreground">{t("المخالفات","Violations")}</p></div>
              </div>
            </div>
          )}

          {/* My Employment Info */}
          {activeTab === "my-info" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("شؤوني الوظيفية","My Employment Info")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { l: t("الاسم","Name"), v: myEmployee.fullName || user.username },
                    { l: t("الوظيفة","Position"), v: myEmployee.position },
                    { l: t("القسم","Department"), v: myEmployee.department },
                    { l: t("الراتب","Salary"), v: myEmployee.salary ? `${myEmployee.salary} ${t("د.ل","LYD")}` : "-" },
                    { l: t("نوع العقد","Contract"), v: myEmployee.contractType },
                    { l: t("نهاية العقد","Contract End"), v: myEmployee.contractEnd || t("غير محدد","N/A") },
                    { l: t("الرقم الوطني","National ID"), v: myEmployee.nationalId },
                    { l: t("المؤهل","Qualification"), v: myEmployee.qualification },
                    { l: t("المصرف","Bank"), v: myEmployee.bankName },
                    { l: t("رقم الحساب","Account"), v: myEmployee.bankAccount },
                  ].map(item => (
                    <div key={item.l} className="glass rounded-xl p-3 flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{item.l}</span>
                      <span className="text-sm font-bold text-foreground">{item.v || "-"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* My Tasks */}
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-3">{t("مهامي","My Tasks")} ({myTasks.length})</h4>
                {myTasks.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد مهام.","No tasks.")}</p> : (
                  <div className="space-y-2">{myTasks.map((task: any) => (
                    <div key={task.id} className="glass rounded-xl p-3">
                      <div className="flex justify-between items-start"><p className="text-sm font-bold text-foreground">{task.title}</p><span className={`px-2 py-0.5 rounded-full text-[10px] ${task.priority === "أساسية" || task.priority === "Essential" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>{task.priority}</span></div>
                      <p className="text-xs text-muted-foreground mt-1">{task.details}</p>
                      {task.deadline && <p className="text-[10px] text-warning mt-1">⏰ {t("الموعد النهائي:","Deadline:")} {task.deadline}</p>}
                    </div>
                  ))}</div>
                )}
              </div>

              {/* My Salary Details */}
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-3">{t("تفاصيل راتبي","My Salary Details")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("الراتب الأساسي","Base Salary")}</p><p className="text-lg font-black text-primary">{myEmployee.salary || 0} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("المكافآت","Rewards")}</p><p className="text-lg font-black text-success">{myRewards.reduce((a: number, r: any) => a + (Number(r.amount) || 0), 0)} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("الخصومات","Deductions")}</p><p className="text-lg font-black text-destructive">{myViolations.reduce((a: number, v: any) => a + (Number(v.amount) || 0), 0)} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-3 text-center"><p className="text-xs text-muted-foreground">{t("السلف","Advances")}</p><p className="text-lg font-black text-warning">{myAdvances.reduce((a: number, a2: any) => a + (Number(a2.amount) || 0), 0)} {t("د.ل","LYD")}</p></div>
                </div>
                <div className="mt-4 glass rounded-xl p-4 border-primary/30">
                  <p className="text-sm text-muted-foreground">{t("صافي الراتب المتوقع الشهر المقبل:","Expected net salary next month:")}</p>
                  <p className="text-2xl font-black text-primary">{(Number(myEmployee.salary) || 0) + myRewards.reduce((a: number, r: any) => a + (Number(r.amount) || 0), 0) - myViolations.reduce((a: number, v: any) => a + (Number(v.amount) || 0), 0) - myAdvances.reduce((a: number, a2: any) => a + (Number(a2.amount) || 0), 0)} {t("د.ل","LYD")}</p>
                </div>
              </div>

              {/* My Violations */}
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

              {/* My Leaves */}
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
            </div>
          )}

          {/* Products - read only view */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("المنتجات","Products")} ({products.length})</h3>
              {products.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد منتجات.","No products.")}</p></div> : (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج","Product")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية","Qty")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("سعر البيع","Price")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("النوع","Type")}</th></tr></thead>
                    <tbody>{products.map((p: any) => (<tr key={p.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground font-medium">{p.name}</td><td className="py-2 px-3">{p.quantity}</td><td className="py-2 px-3 text-primary font-bold">{p.sellPrice} {t("د.ل","LYD")}</td><td className="py-2 px-3 text-muted-foreground">{p.productType}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Stock Movements */}
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

          {/* Profits */}
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

          {/* Notifications */}
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
                    <div className="flex justify-between items-start"><p className={`text-sm ${!n.read ? "font-bold text-foreground" : "text-muted-foreground"}`}>{n.message}</p>{!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.date ? new Date(n.date).toLocaleDateString("ar-LY") : ""}</p>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Messages */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("المراسلات","Messages")}</h3>
              {messages.length === 0 ? (
                <div className="glass rounded-2xl p-6 text-center"><MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد رسائل.","No messages.")}</p></div>
              ) : (
                <div className="space-y-2">{messages.filter((m: any) => m.to === "all" || m.to === user.username).map((m: any) => (
                  <div key={m.id} className="glass rounded-xl p-4">
                    <div className="flex justify-between"><span className={`px-2 py-0.5 rounded-full text-[10px] ${m.type === "تحذير" || m.type === "Warning" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>{m.type}</span><span className="text-[10px] text-muted-foreground">{m.date ? new Date(m.date).toLocaleDateString("ar-LY") : ""}</span></div>
                    <p className="text-sm text-foreground mt-2">{m.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t("من:","From:")} {m.from}</p>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Generic sections */}
          {!["dashboard","my-info","products","stock","profits","notifications","messages"].includes(activeTab) && (
            <div className="glass rounded-2xl p-6 text-center">
              {(() => { const Item = visibleItems.find(s => s.key === activeTab); return Item ? <Item.icon className="h-12 w-12 text-primary mx-auto mb-4" /> : null; })()}
              <h3 className="font-bold text-foreground mb-2">{visibleItems.find(s => s.key === activeTab)?.[lang === "ar" ? "label" : "labelEn"]}</h3>
              <p className="text-sm text-muted-foreground">{t("يمكنك استخدام هذا القسم حسب الصلاحيات الممنوحة لك من مسؤول الشركة.","Use this section based on permissions from your company admin.")}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
