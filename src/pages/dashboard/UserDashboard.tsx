import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, TrendingUp, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, Briefcase, Receipt,
  Moon, Sun, Globe, ShieldX, User
} from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const allSections = [
  { icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard", key: "dashboard" },
  { icon: Briefcase, label: "شؤوني الوظيفية", labelEn: "My Employment", key: "my-info" },
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
  { icon: Settings, label: "الإعدادات", labelEn: "Settings", key: "settings" },
  { icon: Bell, label: "الإشعارات", labelEn: "Notifications", key: "notifications" },
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
    if (!user || user.role !== "employee") {
      navigate("/login/user");
    }
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
  const visibleSections = allSections.filter(s => s.key === "my-info" || s.key === "dashboard" || permissions.includes(s.key));

  const logout = () => { localStorage.removeItem("madar_user"); navigate("/login/user"); };

  // Get employee data from company
  const employees = JSON.parse(localStorage.getItem(`madar_employees_${user.companyId}`) || "[]");
  const myData = employees.find((e: any) => e.email === user.email) || user;
  const rewards = JSON.parse(localStorage.getItem(`madar_rewards_${user.companyId}`) || "[]").filter((r: any) => r.employee === (myData.fullName || user.fullName));
  const violations = JSON.parse(localStorage.getItem(`madar_violations_${user.companyId}`) || "[]").filter((v: any) => v.employee === (myData.fullName || user.fullName));
  const tasks = JSON.parse(localStorage.getItem(`madar_tasks_${user.companyId}`) || "[]").filter((tk: any) => tk.employee === (myData.fullName || user.fullName));
  const leaves = JSON.parse(localStorage.getItem(`madar_leaves_${user.companyId}`) || "[]").filter((l: any) => l.employee === (myData.fullName || user.fullName));
  const advances = JSON.parse(localStorage.getItem(`madar_advances_${user.companyId}`) || "[]").filter((a: any) => a.employee === (myData.fullName || user.fullName));

  const totalRewards = rewards.reduce((a: number, r: any) => a + (Number(r.amount) || 0), 0);
  const totalViolations = violations.reduce((a: number, v: any) => a + (Number(v.deduction) || 0), 0);
  const totalAdvances = advances.reduce((a: number, a2: any) => a + (Number(a2.amount) || 0), 0);
  const baseSalary = Number(myData.salary) || 0;
  const netSalary = baseSalary + totalRewards - totalViolations - totalAdvances;

  if (!user || user.role !== "employee") return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
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
            <button onClick={() => { const newTheme = theme === "dark" ? "light" : "dark"; setTheme(newTheme); }} className="p-2 rounded-xl hover:bg-secondary">
              {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => { const newLang = lang === "ar" ? "en" : "ar"; setLang(newLang); document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr"; }} className="p-2 rounded-xl hover:bg-secondary">
              <Globe className="h-4 w-4 text-foreground" />
            </button>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* Check if tab is allowed */}
          {!permissions.includes(activeTab) && activeTab !== "dashboard" && activeTab !== "my-info" && (
            <div className="glass rounded-2xl p-12 text-center">
              <ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">{t("غير مصرح", "Access Denied")}</h3>
              <p className="text-sm text-muted-foreground">{t("ليس لديك صلاحية للوصول لهذا القسم. تواصل مع مسؤول شركتك.", "You don't have permission to access this section.")}</p>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border-primary/30">
                <p className="text-sm text-foreground">{t("مرحباً", "Welcome")} <span className="font-bold text-primary">{myData.fullName || user.fullName}</span>! {t("أنت موظف في", "You work at")} <span className="font-bold">{user.companyName}</span></p>
                <p className="text-xs text-muted-foreground mt-1">{t("المسمى الوظيفي:", "Position:")} {myData.position || t("موظف", "Employee")} · {t("القسم:", "Dept:")} {myData.department || "-"}</p>
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
                  <p className="text-xl font-black text-success">{totalRewards} {t("د.ل", "LYD")}</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <ClipboardList className="h-5 w-5 text-warning mb-2" />
                  <p className="text-xs text-muted-foreground">{t("المهام", "Tasks")}</p>
                  <p className="text-xl font-black text-foreground">{tasks.length}</p>
                </div>
                <div className="glass rounded-2xl p-5">
                  <CreditCard className="h-5 w-5 text-primary mb-2" />
                  <p className="text-xs text-muted-foreground">{t("صافي الراتب", "Net Salary")}</p>
                  <p className={`text-xl font-black ${netSalary >= 0 ? "text-primary" : "text-destructive"}`}>{netSalary} {t("د.ل", "LYD")}</p>
                </div>
              </div>

              {/* Tasks */}
              {tasks.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-3">{t("مهامي", "My Tasks")}</h4>
                  <div className="space-y-2">
                    {tasks.map((tk: any) => (
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
                    { l: t("الشركة", "Company"), v: user.companyName },
                    { l: t("مسؤول الشركة", "Company Admin"), v: user.managerName },
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
                <h4 className="font-bold text-foreground mb-4">{t("كشف الراتب", "Salary Breakdown")}</h4>
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

              {/* Leaves */}
              {leaves.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-3">{t("الإجازات", "Leaves")}</h4>
                  <div className="space-y-2">{leaves.map((l: any) => (
                    <div key={l.id} className="flex justify-between glass rounded-xl p-3">
                      <div><p className="text-sm text-foreground">{l.type}</p><p className="text-xs text-muted-foreground">{l.from} → {l.to}</p></div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${l.status === "مقبولة" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{l.status || t("معلّقة", "Pending")}</span>
                    </div>
                  ))}</div>
                </div>
              )}
            </div>
          )}

          {/* Placeholder for other sections - shows company data if permitted */}
          {permissions.includes(activeTab) && !["dashboard", "my-info"].includes(activeTab) && (
            <div className="glass rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                {(() => {
                  const section = allSections.find(s => s.key === activeTab);
                  if (section) {
                    const Icon = section.icon;
                    return <Icon className="h-8 w-8 text-primary-foreground" />;
                  }
                  return null;
                })()}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {lang === "ar" ? allSections.find(s => s.key === activeTab)?.label : allSections.find(s => s.key === activeTab)?.labelEn}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("هذا القسم متاح لك حسب صلاحياتك. يمكنك الاطلاع على البيانات الخاصة بشركتك.", "This section is available to you. You can view your company's data.")}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
