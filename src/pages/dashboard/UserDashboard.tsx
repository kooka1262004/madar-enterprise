import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, TrendingUp, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, Briefcase, Receipt,
  Moon, Sun, Globe, ShieldX, User, Clock, Calendar, Send, Check,
  AlertTriangle, Award, Flag, ListChecks, MessageSquare, Download
} from "lucide-react";
import { exportToPDF, exportSimplePDF } from "@/utils/pdfExport";
import logo from "@/assets/logo-transparent.png";

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
  { icon: ClipboardList, label: "الجرد", labelEn: "Inventory", key: "inventory" },
  { icon: RotateCcw, label: "التالف والمرتجعات", labelEn: "Returns", key: "returns" },
  { icon: BarChart3, label: "المحاسبة", labelEn: "Accounting", key: "accounting" },
  { icon: TrendingUp, label: "الأرباح", labelEn: "Profits", key: "profits" },
  { icon: Receipt, label: "الفواتير", labelEn: "Invoices", key: "invoices" },
  { icon: FileText, label: "التقارير", labelEn: "Reports", key: "reports" },
  { icon: Briefcase, label: "الموارد البشرية", labelEn: "HR", key: "hr" },
  { icon: Users, label: "المستخدمين", labelEn: "Users", key: "users" },
  { icon: UserCog, label: "الصلاحيات", labelEn: "Permissions", key: "permissions" },
  { icon: MessageSquare, label: "المراسلات", labelEn: "Messages", key: "messages" },
  { icon: Bell, label: "الإشعارات", labelEn: "Notifications", key: "notifications" },
  { icon: Settings, label: "الإعدادات", labelEn: "Settings", key: "settings" },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [user] = useState(() => JSON.parse(localStorage.getItem("madar_user") || "{}"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("madar_theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    if (!user || user.role !== "employee") navigate("/login/user");
  }, [user, navigate]);

  useEffect(() => {
    localStorage.setItem("madar_theme", theme);
    if (theme === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("madar_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const permissions: string[] = user.permissions || ["dashboard", "my-info"];
  const visibleSections = allSections.filter(s =>
    ["my-info", "dashboard", "attendance", "requests", "my-tasks"].includes(s.key) || permissions.includes(s.key)
  );

  const logout = () => { localStorage.removeItem("madar_user"); navigate("/login/user"); };

  // Employee data
  const employees = JSON.parse(localStorage.getItem(`madar_employees_${user.companyId}`) || "[]");
  const myData = employees.find((e: any) => e.email === user.email) || user;
  const rewards = JSON.parse(localStorage.getItem(`madar_rewards_${user.companyId}`) || "[]").filter((r: any) => r.employee === (myData.fullName || user.fullName));
  const violations = JSON.parse(localStorage.getItem(`madar_violations_${user.companyId}`) || "[]").filter((v: any) => v.employee === (myData.fullName || user.fullName));
  const tasks = JSON.parse(localStorage.getItem(`madar_tasks_${user.companyId}`) || "[]").filter((tk: any) => tk.employee === (myData.fullName || user.fullName));
  const leaves = JSON.parse(localStorage.getItem(`madar_leaves_${user.companyId}`) || "[]").filter((l: any) => l.employee === (myData.fullName || user.fullName));
  const advances = JSON.parse(localStorage.getItem(`madar_advances_${user.companyId}`) || "[]").filter((a: any) => a.employee === (myData.fullName || user.fullName));
  const attendance = JSON.parse(localStorage.getItem(`madar_attendance_${user.companyId}_${user.email}`) || "[]");
  const schedule = JSON.parse(localStorage.getItem(`madar_schedule_${user.companyId}`) || JSON.stringify({ start: "08:00", end: "16:00", lateMinutes: 15, absentMinutes: 120 }));

  // Company data for permitted sections
  const products = JSON.parse(localStorage.getItem(`madar_products_${user.companyId}`) || "[]");
  const movements = JSON.parse(localStorage.getItem(`madar_movements_${user.companyId}`) || "[]");
  const suppliers = JSON.parse(localStorage.getItem(`madar_suppliers_${user.companyId}`) || "[]");
  const invoices = JSON.parse(localStorage.getItem(`madar_invoices_${user.companyId}`) || "[]");

  const totalRewards = rewards.reduce((a: number, r: any) => a + (Number(r.amount) || 0), 0);
  const totalViolations = violations.reduce((a: number, v: any) => a + (Number(v.deduction) || 0), 0);
  const totalAdvances = advances.reduce((a: number, a2: any) => a + (Number(a2.amount) || 0), 0);
  const baseSalary = Number(myData.salary) || 0;
  const netSalary = baseSalary + totalRewards - totalViolations - totalAdvances;
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

  // Attendance helpers
  const today = new Date().toISOString().split("T")[0];
  const todayRecord = attendance.find((a: any) => a.date === today);

  const recordAttendance = (type: "in" | "out") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });
    const [startH, startM] = schedule.start.split(":").map(Number);
    const [endH, endM] = schedule.end.split(":").map(Number);
    const scheduledStart = startH * 60 + startM;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let status = "";
    let deduction = 0;

    if (type === "in") {
      const diff = currentMinutes - scheduledStart;
      if (diff <= 0) { status = t("في الوقت ✅", "On Time ✅"); }
      else if (diff <= (schedule.lateMinutes || 15)) { status = t("تأخير بسيط ⚠️", "Slightly Late ⚠️"); }
      else if (diff <= (schedule.absentMinutes || 120)) { status = t(`متأخر ${diff} دقيقة ❌`, `Late ${diff} min ❌`); deduction = Math.floor(diff / 30) * 10; }
      else { status = t("غياب 🚫", "Absent 🚫"); deduction = 50; }
    } else {
      const scheduledEnd = endH * 60 + endM;
      if (currentMinutes < scheduledEnd - 30) { status = t("خروج مبكر بدون إذن ❌", "Early Leave Without Permission ❌"); deduction = 30; }
      else { status = t("انصراف عادي ✅", "Normal Leave ✅"); }
    }

    const record = todayRecord ? { ...todayRecord } : { date: today, checkIn: "", checkOut: "", status: "", deduction: 0 };
    if (type === "in") { record.checkIn = timeStr; record.statusIn = status; record.deductionIn = deduction; }
    else { record.checkOut = timeStr; record.statusOut = status; record.deductionOut = deduction; }
    record.deduction = (record.deductionIn || 0) + (record.deductionOut || 0);

    const updated = todayRecord
      ? attendance.map((a: any) => a.date === today ? record : a)
      : [...attendance, record];
    localStorage.setItem(`madar_attendance_${user.companyId}_${user.email}`, JSON.stringify(updated));

    const msg = type === "in"
      ? `${t("تم تسجيل حضورك", "Attendance recorded")} - ${status}${deduction > 0 ? `\n${t("سيتم خصم", "Deduction:")} ${deduction} ${t("د.ل من راتبك", "LYD from salary")}` : ""}`
      : `${t("تم تسجيل انصرافك", "Leave recorded")} - ${status}${deduction > 0 ? `\n${t("سيتم خصم", "Deduction:")} ${deduction} ${t("د.ل من راتبك", "LYD from salary")}` : ""}`;
    alert(msg);
    window.location.reload();
  };

  // Submit requests
  const submitRequest = (type: string, data: any) => {
    const key = type === "leave" ? "leaves" : type === "advance" ? "advances" : "salary_requests";
    const existing = JSON.parse(localStorage.getItem(`madar_${key}_${user.companyId}`) || "[]");
    existing.push({ ...data, id: Date.now().toString(), employee: myData.fullName || user.fullName, status: t("معلّقة", "Pending"), date: new Date().toISOString() });
    localStorage.setItem(`madar_${key}_${user.companyId}`, JSON.stringify(existing));
    // Notify company
    const notifs = JSON.parse(localStorage.getItem(`madar_notif_company_${user.companyId}`) || "[]");
    notifs.push({ id: Date.now().toString(), message: `${t("طلب جديد من", "New request from")} ${myData.fullName}: ${data.requestType || type}`, date: new Date().toISOString(), read: false });
    localStorage.setItem(`madar_notif_company_${user.companyId}`, JSON.stringify(notifs));
    alert(t("تم إرسال طلبك بنجاح! سيتم مراجعته من قبل مسؤول الشركة.", "Request submitted successfully!"));
    window.location.reload();
  };

  if (!user || user.role !== "employee") return null;

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`fixed inset-y-0 ${lang === "ar" ? "right-0 border-l" : "left-0 border-r"} w-64 bg-card border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">{user.companyName || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">{myData.fullName || user.fullName}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-130px)]">
          {visibleSections.map((item) => (
            <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <item.icon className="h-4 w-4" />{lang === "ar" ? item.label : item.labelEn}
            </button>
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
          <h1 className="text-lg font-bold text-foreground">
            {lang === "ar" ? visibleSections.find(s => s.key === activeTab)?.label : visibleSections.find(s => s.key === activeTab)?.labelEn}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl hover:bg-secondary">
              {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => { setLang(lang === "ar" ? "en" : "ar"); }} className="p-2 rounded-xl hover:bg-secondary">
              <Globe className="h-4 w-4 text-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* Access Denied */}
          {!permissions.includes(activeTab) && !["dashboard", "my-info", "attendance", "requests", "my-tasks"].includes(activeTab) && (
            <div className="glass rounded-2xl p-12 text-center">
              <ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">{t("غير مصرح", "Access Denied")}</h3>
              <p className="text-sm text-muted-foreground">{t("ليس لديك صلاحية للوصول لهذا القسم.", "You don't have permission.")}</p>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border-primary/30">
                <p className="text-sm text-foreground">{t("مرحباً", "Welcome")} <span className="font-bold text-primary">{myData.fullName || user.fullName}</span>!</p>
                <p className="text-xs text-muted-foreground mt-1">{t("المسمى:", "Position:")} {myData.position || "-"} · {t("القسم:", "Dept:")} {myData.department || "-"} · {t("الشركة:", "Company:")} {user.companyName}</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass rounded-2xl p-5">
                  <DollarSign className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">{t("الراتب الأساسي", "Base Salary")}</p>
                  <p className="text-xl font-black text-foreground">{baseSalary} {t("د.ل", "LYD")}</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <TrendingUp className="h-5 w-5 text-success mb-2" />
                  <p className="text-xs text-muted-foreground">{t("المكافآت", "Rewards")}</p>
                  <p className="text-xl font-black text-success">+{totalRewards} {t("د.ل", "LYD")}</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <AlertTriangle className="h-5 w-5 text-destructive mb-2" />
                  <p className="text-xs text-muted-foreground">{t("الخصومات", "Deductions")}</p>
                  <p className="text-xl font-black text-destructive">-{totalViolations} {t("د.ل", "LYD")}</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <CreditCard className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">{t("صافي الراتب", "Net Salary")}</p>
                  <p className={`text-xl font-black ${netSalary >= 0 ? "text-primary" : "text-destructive"}`}>{netSalary} {t("د.ل", "LYD")}</p>
                </div>
              </div>

              {/* Today's attendance */}
              <div className="glass rounded-2xl p-5">
                <h4 className="font-bold text-foreground mb-3">{t("حضور اليوم", "Today's Attendance")}</h4>
                {todayRecord ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{t("وقت الحضور", "Check-in")}</p>
                      <p className="text-sm font-bold text-foreground">{todayRecord.checkIn || t("لم يسجّل", "Not recorded")}</p>
                      {todayRecord.statusIn && <p className="text-xs mt-1">{todayRecord.statusIn}</p>}
                    </div>
                    <div className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{t("وقت الانصراف", "Check-out")}</p>
                      <p className="text-sm font-bold text-foreground">{todayRecord.checkOut || t("لم يسجّل", "Not recorded")}</p>
                      {todayRecord.statusOut && <p className="text-xs mt-1">{todayRecord.statusOut}</p>}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("لم تسجل حضورك اليوم بعد.", "You haven't checked in today.")}</p>
                )}
                <div className="flex gap-2 mt-3">
                  {(!todayRecord || !todayRecord.checkIn) && (
                    <button onClick={() => recordAttendance("in")} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2">
                      <Check className="h-4 w-4" /> {t("تسجيل حضور", "Check In")}
                    </button>
                  )}
                  {todayRecord?.checkIn && !todayRecord?.checkOut && (
                    <button onClick={() => recordAttendance("out")} className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold flex items-center gap-2">
                      <LogOut className="h-4 w-4" /> {t("تسجيل انصراف", "Check Out")}
                    </button>
                  )}
                </div>
              </div>

              {/* Tasks */}
              {tasks.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-3">{t("مهامي", "My Tasks")} ({tasks.length})</h4>
                  <div className="space-y-2">
                    {tasks.slice(0, 5).map((tk: any) => (
                      <div key={tk.id} className="flex items-center justify-between glass rounded-xl p-3">
                        <div>
                          <p className="text-sm font-bold text-foreground">{tk.title}</p>
                          <p className="text-xs text-muted-foreground">{t("التسليم:", "Due:")} {tk.deadline} · {tk.type}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{tk.status || t("جديدة", "New")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Employment Info */}
          {activeTab === "my-info" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("بياناتي الوظيفية", "My Employment Info")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { l: t("الاسم الكامل", "Full Name"), v: myData.fullName },
                    { l: t("البريد الإلكتروني", "Email"), v: myData.email },
                    { l: t("الهاتف", "Phone"), v: myData.phone || "-" },
                    { l: t("المسمى الوظيفي", "Position"), v: myData.position || "-" },
                    { l: t("القسم", "Department"), v: myData.department || "-" },
                    { l: t("نوع العقد", "Contract"), v: myData.contractType || "-" },
                    { l: t("نهاية العقد", "Contract End"), v: myData.contractEnd || "-" },
                    { l: t("المؤهل", "Qualification"), v: myData.qualification || "-" },
                    { l: t("الرقم الوطني", "National ID"), v: myData.nationalId || "-" },
                    { l: t("اسم المصرف", "Bank"), v: myData.bankName || "-" },
                    { l: t("رقم الحساب", "Account"), v: myData.bankAccount || "-" },
                    { l: t("الشركة", "Company"), v: user.companyName },
                  ].map(item => (
                    <div key={item.l} className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{item.l}</p>
                      <p className="text-sm font-bold text-foreground">{item.v || "-"}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-foreground">{t("كشف الراتب", "Salary Breakdown")}</h4>
                  <button onClick={() => exportSimplePDF(t("كشف راتب - ", "Salary - ") + (myData.fullName || ""), `<table style="width:100%;border-collapse:collapse;"><tr><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">الراتب الأساسي</td><td style="padding:10px;border:1px solid #ddd;">${baseSalary} د.ل</td></tr><tr><td style="padding:10px;border:1px solid #ddd;">المكافآت</td><td style="padding:10px;border:1px solid #ddd;color:green;">+${totalRewards} د.ل</td></tr><tr><td style="padding:10px;border:1px solid #ddd;">الخصومات</td><td style="padding:10px;border:1px solid #ddd;color:red;">-${totalViolations} د.ل</td></tr><tr><td style="padding:10px;border:1px solid #ddd;">السلف</td><td style="padding:10px;border:1px solid #ddd;color:orange;">-${totalAdvances} د.ل</td></tr><tr style="background:#f0f0f0;"><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">صافي الراتب</td><td style="padding:10px;border:1px solid #ddd;font-weight:bold;">${netSalary} د.ل</td></tr></table>`)} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("الراتب الأساسي", "Base Salary")}</span><span className="text-foreground font-bold">{baseSalary} {t("د.ل", "LYD")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("المكافآت", "Rewards")}</span><span className="text-success font-bold">+{totalRewards} {t("د.ل", "LYD")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("الخصومات", "Deductions")}</span><span className="text-destructive font-bold">-{totalViolations} {t("د.ل", "LYD")}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">{t("السلف", "Advances")}</span><span className="text-warning font-bold">-{totalAdvances} {t("د.ل", "LYD")}</span></div>
                  <div className="border-t border-border pt-2 flex justify-between"><span className="font-bold text-foreground">{t("صافي الراتب", "Net Salary")}</span><span className={`font-black text-lg ${netSalary >= 0 ? "text-primary" : "text-destructive"}`}>{netSalary} {t("د.ل", "LYD")}</span></div>
                </div>
              </div>

              {/* Rewards */}
              {rewards.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-3">{t("المكافآت", "Rewards")}</h4>
                  <div className="space-y-2">{rewards.map((r: any) => (
                    <div key={r.id} className="flex justify-between glass rounded-xl p-3">
                      <span className="text-sm text-foreground">{r.reason}</span>
                      <span className="text-sm font-bold text-success">+{r.amount} {t("د.ل", "LYD")}</span>
                    </div>
                  ))}</div>
                </div>
              )}

              {/* Violations */}
              {violations.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-3">{t("المخالفات والخصومات", "Violations")}</h4>
                  <div className="space-y-2">{violations.map((v: any) => (
                    <div key={v.id} className="flex justify-between glass rounded-xl p-3">
                      <div><p className="text-sm text-foreground">{v.reason}</p><p className="text-xs text-muted-foreground">{v.type}</p></div>
                      <span className="text-sm font-bold text-destructive">-{v.deduction} {t("د.ل", "LYD")}</span>
                    </div>
                  ))}</div>
                </div>
              )}

              {/* Leaves */}
              {leaves.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-3">{t("الإجازات", "Leaves")}</h4>
                  <div className="space-y-2">{leaves.map((l: any) => (
                    <div key={l.id} className="flex justify-between glass rounded-xl p-3">
                      <div><p className="text-sm text-foreground">{l.type}</p><p className="text-xs text-muted-foreground">{l.from} → {l.to}</p></div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${l.status === "مقبولة" || l.status === "Approved" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{l.status}</span>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}

          {/* Attendance */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("الحضور والانصراف", "Attendance")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("سجّل حضورك وانصرافك يومياً. سيتم احتساب التأخير والغياب تلقائياً.", "Record your daily attendance. Lateness and absence will be calculated automatically.")}</p>
                <div className="glass rounded-xl p-4 mb-4 border-primary/30">
                  <p className="text-sm text-foreground">{t("ساعات العمل:", "Working Hours:")} <span className="font-bold text-primary">{schedule.start} - {schedule.end}</span></p>
                  <p className="text-xs text-muted-foreground mt-1">{t("التأخير المسموح:", "Allowed Late:")} {schedule.lateMinutes || 15} {t("دقيقة", "min")} · {t("بعد", "After")} {schedule.absentMinutes || 120} {t("دقيقة يُحسب غياب", "min = absence")}</p>
                </div>

                <div className="flex gap-3 mb-6">
                  {(!todayRecord || !todayRecord.checkIn) && (
                    <button onClick={() => recordAttendance("in")} className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2">
                      <Check className="h-5 w-5" /> {t("تسجيل حضور", "Check In")}
                    </button>
                  )}
                  {todayRecord?.checkIn && !todayRecord?.checkOut && (
                    <button onClick={() => recordAttendance("out")} className="px-6 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold flex items-center gap-2">
                      <LogOut className="h-5 w-5" /> {t("تسجيل انصراف", "Check Out")}
                    </button>
                  )}
                  {todayRecord?.checkIn && todayRecord?.checkOut && (
                    <div className="glass rounded-xl p-4 border-success/30">
                      <p className="text-sm text-success font-bold">✅ {t("تم تسجيل حضورك وانصرافك اليوم", "Today's attendance complete")}</p>
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-foreground mb-3">{t("سجل الحضور", "Attendance Log")}</h4>
                {attendance.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا يوجد سجل حضور.", "No attendance records.")}</p> : (
                  <div className="space-y-2">
                    {[...attendance].reverse().map((a: any) => (
                      <div key={a.date} className="glass rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">{a.date}</p>
                          <p className="text-xs text-muted-foreground">{t("حضور:", "In:")} {a.checkIn || "-"} · {t("انصراف:", "Out:")} {a.checkOut || "-"}</p>
                          {a.statusIn && <p className="text-xs">{a.statusIn}</p>}
                          {a.statusOut && <p className="text-xs">{a.statusOut}</p>}
                        </div>
                        {a.deduction > 0 && <span className="text-xs font-bold text-destructive">-{a.deduction} {t("د.ل", "LYD")}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requests */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("طلباتي", "My Requests")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("أرسل طلبات الإجازة والسلف وسحب الراتب لمسؤول شركتك.", "Submit leave, advance and salary requests.")}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Leave */}
                  <div className="glass rounded-xl p-4">
                    <Calendar className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("طلب إجازة", "Leave Request")}</h4>
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("leave", { ...Object.fromEntries(fd), requestType: t("إجازة", "Leave") }); }} className="space-y-2">
                      <select name="type" required className={inputClass}>
                        <option>{t("إجازة سنوية", "Annual Leave")}</option>
                        <option>{t("إجازة مرضية", "Sick Leave")}</option>
                        <option>{t("إجازة طارئة", "Emergency Leave")}</option>
                        <option>{t("إجازة بدون راتب", "Unpaid Leave")}</option>
                      </select>
                      <input name="from" type="date" required className={inputClass} placeholder={t("من", "From")} />
                      <input name="to" type="date" required className={inputClass} placeholder={t("إلى", "To")} />
                      <textarea name="reason" rows={2} className={inputClass} placeholder={t("السبب", "Reason")} />
                      <button type="submit" className="w-full px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>

                  {/* Advance */}
                  <div className="glass rounded-xl p-4">
                    <DollarSign className="h-6 w-6 text-warning mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("طلب سلفة", "Advance Request")}</h4>
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("advance", { ...Object.fromEntries(fd), requestType: t("سلفة", "Advance") }); }} className="space-y-2">
                      <input name="amount" type="number" required className={inputClass} placeholder={t("المبلغ (د.ل)", "Amount (LYD)")} />
                      <textarea name="reason" rows={2} className={inputClass} placeholder={t("السبب", "Reason")} />
                      <button type="submit" className="w-full px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>

                  {/* Salary Request */}
                  <div className="glass rounded-xl p-4">
                    <CreditCard className="h-6 w-6 text-success mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("طلب سحب راتب", "Salary Withdrawal")}</h4>
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("salary_request", { ...Object.fromEntries(fd), requestType: t("سحب راتب", "Salary Withdrawal") }); }} className="space-y-2">
                      <select name="type" required className={inputClass}>
                        <option>{t("سحب دوري (نهاية الشهر)", "Monthly")}</option>
                        <option>{t("سحب مبكر", "Early Withdrawal")}</option>
                      </select>
                      <input name="amount" type="number" className={inputClass} placeholder={t("المبلغ (اختياري)", "Amount (optional)")} />
                      <textarea name="notes" rows={2} className={inputClass} placeholder={t("ملاحظات", "Notes")} />
                      <button type="submit" className="w-full px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>
                </div>

                {/* Previous requests */}
                <h4 className="font-bold text-foreground mb-3">{t("طلباتي السابقة", "Previous Requests")}</h4>
                {(() => {
                  const allReqs = [
                    ...leaves.map((l: any) => ({ ...l, reqType: t("إجازة", "Leave") })),
                    ...advances.map((a: any) => ({ ...a, reqType: t("سلفة", "Advance") })),
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                  return allReqs.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد طلبات سابقة.", "No previous requests.")}</p> : (
                    <div className="space-y-2">{allReqs.map((r: any) => (
                      <div key={r.id} className="glass rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-foreground">{r.reqType} {r.type ? `- ${r.type}` : ""}</p>
                          <p className="text-xs text-muted-foreground">{r.from ? `${r.from} → ${r.to}` : r.amount ? `${r.amount} ${t("د.ل", "LYD")}` : ""} · {r.reason || ""}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "مقبولة" || r.status === "Approved" ? "bg-success/20 text-success" : r.status === "مرفوضة" || r.status === "Rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{r.status}</span>
                      </div>
                    ))}</div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* My Tasks */}
          {activeTab === "my-tasks" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("مهامي", "My Tasks")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("المهام المرسلة إليك من مسؤول الشركة.", "Tasks assigned to you by company admin.")}</p>
                {tasks.length === 0 ? (
                  <div className="glass rounded-xl p-6 text-center"><ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد مهام حالياً.", "No tasks currently.")}</p></div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((tk: any) => (
                      <div key={tk.id} className="glass rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-bold text-foreground">{tk.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${tk.status === "مكتملة" || tk.status === "Done" ? "bg-success/20 text-success" : tk.status === "قيد التنفيذ" ? "bg-info/20 text-info" : "bg-primary/20 text-primary"}`}>{tk.status || t("جديدة", "New")}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{t("النوع:", "Type:")} {tk.type} · {t("التسليم:", "Due:")} {tk.deadline}</p>
                        {tk.details && <p className="text-xs text-muted-foreground">{tk.details}</p>}
                        {tk.extraValue && <p className="text-xs text-success mt-1">{t("قيمة إضافية:", "Extra:")} {tk.extraValue} {t("د.ل", "LYD")}</p>}
                        {tk.status !== "مكتملة" && tk.status !== "Done" && (
                          <button onClick={() => {
                            const allTasks = JSON.parse(localStorage.getItem(`madar_tasks_${user.companyId}`) || "[]");
                            const updated = allTasks.map((t: any) => t.id === tk.id ? { ...t, status: t("مكتملة", "Done") } : t);
                            localStorage.setItem(`madar_tasks_${user.companyId}`, JSON.stringify(updated));
                            window.location.reload();
                          }} className="mt-2 px-4 py-1.5 rounded-lg border border-success text-success text-xs font-bold flex items-center gap-1"><Check className="h-3 w-3" /> {t("تعيين كمكتملة", "Mark Done")}</button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company sections based on permissions */}
          {permissions.includes(activeTab) && activeTab === "products" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("المنتجات", "Products")} ({products.length})</h3>
              {products.length > 0 ? (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج", "Product")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية", "Qty")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("سعر البيع", "Price")}</th>
                    </tr></thead>
                    <tbody>{products.map((p: any) => (
                      <tr key={p.id} className="border-b border-border/30">
                        <td className="py-2 px-3 text-foreground">{p.name}</td>
                        <td className="py-2 px-3 text-foreground">{p.quantity}</td>
                        <td className="py-2 px-3 text-primary font-bold">{p.sellPrice}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <div className="glass rounded-2xl p-6 text-center"><p className="text-sm text-muted-foreground">{t("لا توجد منتجات.", "No products.")}</p></div>}
            </div>
          )}

          {permissions.includes(activeTab) && activeTab === "stock" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("حركة المخزون", "Stock Movements")}</h3>
              {movements.length > 0 ? (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج", "Product")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("النوع", "Type")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية", "Qty")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("التاريخ", "Date")}</th>
                    </tr></thead>
                    <tbody>{movements.map((m: any) => (
                      <tr key={m.id} className="border-b border-border/30">
                        <td className="py-2 px-3 text-foreground">{m.product}</td>
                        <td className="py-2 px-3 text-primary">{m.movementType}</td>
                        <td className="py-2 px-3">{m.quantity}</td>
                        <td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.date).toLocaleDateString("ar-LY")}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <div className="glass rounded-2xl p-6 text-center"><p className="text-sm text-muted-foreground">{t("لا توجد حركات.", "No movements.")}</p></div>}
            </div>
          )}

          {permissions.includes(activeTab) && activeTab === "invoices" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("الفواتير", "Invoices")}</h3>
              {invoices.length > 0 ? (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("رقم الفاتورة", "Invoice #")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("العميل", "Client")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الإجمالي", "Total")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة", "Status")}</th>
                    </tr></thead>
                    <tbody>{invoices.map((inv: any) => (
                      <tr key={inv.id} className="border-b border-border/30">
                        <td className="py-2 px-3 text-foreground">{inv.invoiceNumber}</td>
                        <td className="py-2 px-3 text-muted-foreground">{inv.clientName}</td>
                        <td className="py-2 px-3 text-primary font-bold">{inv.total} {t("د.ل", "LYD")}</td>
                        <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === "paid" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{inv.status === "paid" ? t("مدفوعة", "Paid") : t("معلقة", "Pending")}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : <div className="glass rounded-2xl p-6 text-center"><p className="text-sm text-muted-foreground">{t("لا توجد فواتير.", "No invoices.")}</p></div>}
            </div>
          )}

          {/* Generic permitted sections */}
          {permissions.includes(activeTab) && !["dashboard", "my-info", "attendance", "requests", "my-tasks", "products", "stock", "invoices"].includes(activeTab) && (
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const section = allSections.find(s => s.key === activeTab);
                  if (section) { const Icon = section.icon; return <Icon className="h-8 w-8 text-primary-foreground" />; }
                  return null;
                })()}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {lang === "ar" ? allSections.find(s => s.key === activeTab)?.label : allSections.find(s => s.key === activeTab)?.labelEn}
              </h3>
              <p className="text-sm text-muted-foreground">{t("هذا القسم متاح لك حسب صلاحياتك.", "This section is available based on your permissions.")}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
