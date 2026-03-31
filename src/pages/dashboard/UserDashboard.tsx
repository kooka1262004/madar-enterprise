import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, TrendingUp, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, Briefcase, Receipt,
  Moon, Sun, Globe, ShieldX, User, Clock, Calendar, Send, Check,
  AlertTriangle, Award, Flag, ListChecks, MessageSquare, Download
} from "lucide-react";
import { exportSimplePDF } from "@/utils/pdfExport";
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
  { icon: BarChart3, label: "المحاسبة", labelEn: "Accounting", key: "accounting" },
  { icon: Receipt, label: "الفواتير", labelEn: "Invoices", key: "invoices" },
  { icon: FileText, label: "التقارير", labelEn: "Reports", key: "reports" },
  { icon: Briefcase, label: "الموارد البشرية", labelEn: "HR", key: "hr" },
  { icon: Users, label: "المستخدمين", labelEn: "Users", key: "users" },
  { icon: Settings, label: "الإعدادات", labelEn: "Settings", key: "settings" },
];

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
  const [loading, setLoading] = useState(true);

  const t = (ar: string, en: string) => lang === "ar" ? ar : en;
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

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
      const [empRes, tasksRes, reqRes, attRes, prodsRes, movsRes] = await Promise.all([
        supabase.from("employees").select("*, companies(company_name)").eq("user_id", user.id).maybeSingle(),
        supabase.from("tasks").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("employee_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
        supabase.from("attendance").select("*").eq("company_id", companyId).order("date", { ascending: false }),
        supabase.from("products").select("*").eq("company_id", companyId),
        supabase.from("stock_movements").select("*").eq("company_id", companyId).order("created_at", { ascending: false }),
      ]);
      setMyData(empRes.data);
      // Filter tasks assigned to this employee
      const myEmployeeId = empRes.data?.id;
      setTasks((tasksRes.data || []).filter((tk: any) => tk.employee_id === myEmployeeId));
      setMyRequests((reqRes.data || []).filter((r: any) => r.employee_id === myEmployeeId));
      setAttendance((attRes.data || []).filter((a: any) => a.employee_id === myEmployeeId));
      setProducts(prodsRes.data || []);
      setMovements(movsRes.data || []);
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

  // Attendance
  const today = new Date().toISOString().split("T")[0];
  const todayRecord = attendance.find(a => a.date === today);

  const recordAttendance = async (type: "in" | "out") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });
    const status = type === "in" ? t("حضور", "Check-in") : t("انصراف", "Check-out");

    if (todayRecord) {
      const update: any = type === "in" ? { check_in: timeStr, status } : { check_out: timeStr, status };
      await supabase.from("attendance").update(update).eq("id", todayRecord.id);
    } else {
      await supabase.from("attendance").insert({
        company_id: companyId!,
        employee_id: myData?.id,
        date: today,
        check_in: type === "in" ? timeStr : "",
        status,
      });
    }
    // Reload
    const { data } = await supabase.from("attendance").select("*").eq("employee_id", myData?.id).order("date", { ascending: false });
    setAttendance(data || []);
    alert(`${t("تم تسجيل", "Recorded")} ${status} - ${timeStr}`);
  };

  const submitRequest = async (type: string, data: any) => {
    await supabase.from("employee_requests").insert({
      company_id: companyId!,
      employee_id: myData?.id,
      type,
      reason: data.reason || "",
      amount: Number(data.amount) || 0,
      start_date: data.from || "",
      end_date: data.to || "",
    });
    alert(t("تم إرسال طلبك بنجاح!", "Request submitted!"));
    const { data: reqs } = await supabase.from("employee_requests").select("*").eq("employee_id", myData?.id).order("created_at", { ascending: false });
    setMyRequests(reqs || []);
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-muted-foreground">{t("جاري التحميل...", "Loading...")}</p></div>
    </div>
  );

  if (!myData) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center"><ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" /><p className="text-foreground font-bold">{t("لم يتم العثور على بياناتك", "Employee data not found")}</p><button onClick={logout} className="mt-4 px-6 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm">{t("تسجيل الخروج", "Logout")}</button></div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`fixed inset-y-0 ${lang === "ar" ? "right-0 border-l" : "left-0 border-r"} w-64 bg-card border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">{companyName || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">{myData.full_name}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-130px)]">
          {visibleSections.map(item => (
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
          <h1 className="text-lg font-bold text-foreground">{lang === "ar" ? visibleSections.find(s => s.key === activeTab)?.label : visibleSections.find(s => s.key === activeTab)?.labelEn}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl hover:bg-secondary">
              {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="p-2 rounded-xl hover:bg-secondary"><Globe className="h-4 w-4 text-foreground" /></button>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground"><User className="h-4 w-4" /></div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* Access Denied */}
          {!permissions.includes(activeTab) && !["dashboard", "my-info", "attendance", "requests", "my-tasks"].includes(activeTab) && (
            <div className="glass rounded-2xl p-12 text-center">
              <ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">{t("غير مصرح", "Access Denied")}</h3>
              <p className="text-sm text-muted-foreground">{t("ليس لديك صلاحية.", "No permission.")}</p>
            </div>
          )}

          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border-primary/30">
                <p className="text-sm text-foreground">{t("مرحباً", "Welcome")} <span className="font-bold text-primary">{myData.full_name}</span>!</p>
                <p className="text-xs text-muted-foreground mt-1">{t("المسمى:", "Position:")} {myData.position || "-"} · {t("القسم:", "Dept:")} {myData.department || "-"} · {t("الشركة:", "Company:")} {companyName}</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="glass rounded-2xl p-5"><DollarSign className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("الراتب", "Salary")}</p><p className="text-xl font-black text-foreground">{baseSalary} {t("د.ل", "LYD")}</p></div>
                <div className="glass rounded-2xl p-5"><ListChecks className="h-5 w-5 text-primary mb-2" /><p className="text-xs text-muted-foreground">{t("المهام", "Tasks")}</p><p className="text-xl font-black text-foreground">{tasks.length}</p></div>
                <div className="glass rounded-2xl p-5"><Calendar className="h-5 w-5 text-warning mb-2" /><p className="text-xs text-muted-foreground">{t("الطلبات", "Requests")}</p><p className="text-xl font-black text-foreground">{myRequests.length}</p></div>
                <div className="glass rounded-2xl p-5"><Clock className="h-5 w-5 text-success mb-2" /><p className="text-xs text-muted-foreground">{t("حضور اليوم", "Today")}</p><p className="text-xl font-black text-foreground">{todayRecord?.check_in || t("لم يسجّل", "N/A")}</p></div>
              </div>
              {todayRecord && (
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-3">{t("حضور اليوم", "Today's Attendance")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-xl p-3"><p className="text-xs text-muted-foreground">{t("الحضور", "In")}</p><p className="text-sm font-bold text-foreground">{todayRecord.check_in || "-"}</p></div>
                    <div className="glass rounded-xl p-3"><p className="text-xs text-muted-foreground">{t("الانصراف", "Out")}</p><p className="text-sm font-bold text-foreground">{todayRecord.check_out || "-"}</p></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Info */}
          {activeTab === "my-info" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("بياناتي الوظيفية", "My Employment Info")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { l: t("الاسم", "Name"), v: myData.full_name },
                    { l: t("البريد", "Email"), v: myData.email },
                    { l: t("الهاتف", "Phone"), v: myData.phone || "-" },
                    { l: t("المسمى", "Position"), v: myData.position || "-" },
                    { l: t("القسم", "Department"), v: myData.department || "-" },
                    { l: t("نوع العقد", "Contract"), v: myData.contract_type || "-" },
                    { l: t("الراتب", "Salary"), v: `${baseSalary} ${t("د.ل", "LYD")}` },
                    { l: t("المصرف", "Bank"), v: myData.bank_name || "-" },
                    { l: t("رقم الحساب", "Account"), v: myData.bank_account || "-" },
                    { l: t("الشركة", "Company"), v: companyName },
                  ].map(item => (
                    <div key={item.l} className="glass rounded-xl p-3">
                      <p className="text-xs text-muted-foreground">{item.l}</p>
                      <p className="text-sm font-bold text-foreground">{item.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Attendance */}
          {activeTab === "attendance" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("الحضور والانصراف", "Attendance")}</h3>
                <div className="flex gap-3 mb-6">
                  {(!todayRecord || !todayRecord.check_in) && (
                    <button onClick={() => recordAttendance("in")} className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2">
                      <Check className="h-5 w-5" /> {t("تسجيل حضور", "Check In")}
                    </button>
                  )}
                  {todayRecord?.check_in && !todayRecord?.check_out && (
                    <button onClick={() => recordAttendance("out")} className="px-6 py-3 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold flex items-center gap-2">
                      <LogOut className="h-5 w-5" /> {t("تسجيل انصراف", "Check Out")}
                    </button>
                  )}
                  {todayRecord?.check_in && todayRecord?.check_out && (
                    <div className="glass rounded-xl p-4 border-success/30">
                      <p className="text-sm text-success font-bold">✅ {t("تم تسجيل حضورك وانصرافك اليوم", "Today's attendance complete")}</p>
                    </div>
                  )}
                </div>
                <h4 className="font-bold text-foreground mb-3">{t("سجل الحضور", "Attendance Log")}</h4>
                {attendance.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا يوجد سجل.", "No records.")}</p> : (
                  <div className="space-y-2">{attendance.map(a => (
                    <div key={a.id} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-foreground">{a.date}</p>
                        <p className="text-xs text-muted-foreground">{t("حضور:", "In:")} {a.check_in || "-"} · {t("انصراف:", "Out:")} {a.check_out || "-"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{a.status}</span>
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* Requests */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("طلباتي", "My Requests")}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="glass rounded-xl p-4">
                    <Calendar className="h-6 w-6 text-primary mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("طلب إجازة", "Leave Request")}</h4>
                    <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("leave", Object.fromEntries(fd)); }} className="space-y-2">
                      <select name="type" className={inputClass}><option>{t("سنوية", "Annual")}</option><option>{t("مرضية", "Sick")}</option><option>{t("طارئة", "Emergency")}</option></select>
                      <input name="from" type="date" required className={inputClass} />
                      <input name="to" type="date" required className={inputClass} />
                      <textarea name="reason" rows={2} className={inputClass} placeholder={t("السبب", "Reason")} />
                      <button type="submit" className="w-full px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <DollarSign className="h-6 w-6 text-warning mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("طلب سلفة", "Advance")}</h4>
                    <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("advance", Object.fromEntries(fd)); }} className="space-y-2">
                      <input name="amount" type="number" required className={inputClass} placeholder={t("المبلغ", "Amount")} />
                      <textarea name="reason" rows={2} className={inputClass} placeholder={t("السبب", "Reason")} />
                      <button type="submit" className="w-full px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <CreditCard className="h-6 w-6 text-success mb-2" />
                    <h4 className="font-bold text-foreground text-sm mb-3">{t("سحب راتب", "Salary Withdrawal")}</h4>
                    <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitRequest("salary", Object.fromEntries(fd)); }} className="space-y-2">
                      <input name="amount" type="number" className={inputClass} placeholder={t("المبلغ", "Amount")} />
                      <textarea name="reason" rows={2} className={inputClass} placeholder={t("ملاحظات", "Notes")} />
                      <button type="submit" className="w-full px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2"><Send className="h-4 w-4" /> {t("إرسال", "Submit")}</button>
                    </form>
                  </div>
                </div>
                <h4 className="font-bold text-foreground mb-3">{t("طلباتي السابقة", "Previous Requests")}</h4>
                {myRequests.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد طلبات.", "No requests.")}</p> : (
                  <div className="space-y-2">{myRequests.map(r => (
                    <div key={r.id} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div><p className="text-sm font-bold text-foreground">{r.type} {r.reason ? `- ${r.reason}` : ""}</p><p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ar-LY")}</p></div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "approved" ? "bg-success/20 text-success" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{r.status}</span>
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* Tasks */}
          {activeTab === "my-tasks" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("مهامي", "My Tasks")}</h3>
                {tasks.length === 0 ? (
                  <div className="text-center py-8"><ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد مهام.", "No tasks.")}</p></div>
                ) : (
                  <div className="space-y-2">{tasks.map(tk => (
                    <div key={tk.id} className="glass rounded-xl p-3 flex items-center justify-between">
                      <div><p className="text-sm font-bold text-foreground">{tk.title}</p><p className="text-xs text-muted-foreground">{tk.description} · {t("الأولوية:", "Priority:")} {tk.priority}</p></div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${tk.status === "completed" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{tk.status}</span>
                        {tk.status !== "completed" && (
                          <button onClick={async () => {
                            await supabase.from("tasks").update({ status: "completed" }).eq("id", tk.id);
                            setTasks(tasks.map(t => t.id === tk.id ? { ...t, status: "completed" } : t));
                          }} className="text-xs px-2 py-1 rounded-lg bg-success/20 text-success">{t("إنجاز", "Complete")}</button>
                        )}
                      </div>
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* Products (read-only based on permissions) */}
          {activeTab === "products" && permissions.includes("products") && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("المنتجات", "Products")} ({products.length})</h3>
              {products.length > 0 ? (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج", "Product")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية", "Qty")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("السعر", "Price")}</th>
                    </tr></thead>
                    <tbody>{products.map(p => (
                      <tr key={p.id} className="border-b border-border/30">
                        <td className="py-2 px-3 text-foreground">{p.name}</td>
                        <td className="py-2 px-3 text-foreground">{p.quantity}</td>
                        <td className="py-2 px-3 text-primary font-bold">{p.sell_price}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              ) : (
                <div className="glass rounded-2xl p-6 text-center"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد منتجات.", "No products.")}</p></div>
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

export default UserDashboard;
