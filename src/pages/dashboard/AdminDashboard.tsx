import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Building2, Package, CreditCard, Users, Settings, LogOut,
  BarChart3, Shield, Ticket, DollarSign, Activity, AlertTriangle, User, Bell, Menu, X,
  Eye, Trash2, Send, Gift, Ban, CheckCircle, Clock, FileText, Edit, Plus, Download, RefreshCw, Search, MessageSquare,
  Upload, Moon, Sun, Globe, Scale, Truck, Image, Monitor, Check
} from "lucide-react";
import logo from "@/assets/logo-transparent.png";
import { exportToPDF, exportSimplePDF } from "@/utils/pdfExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const sidebarSections = [
  { title: "الرئيسية", titleEn: "Main", items: [
    { icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard", key: "dashboard" },
    { icon: Eye, label: "المراقبة الشاملة", labelEn: "Monitoring", key: "monitoring" },
  ]},
  { title: "إدارة المنصة", titleEn: "Platform Management", items: [
    { icon: Building2, label: "إدارة الشركات", labelEn: "Companies", key: "companies" },
    { icon: Package, label: "إدارة الباقات", labelEn: "Plans", key: "plans" },
    { icon: DollarSign, label: "إدارة العملات", labelEn: "Currencies", key: "currencies" },
    { icon: Ticket, label: "طلبات الاشتراك", labelEn: "Sub Requests", key: "sub-requests" },
    { icon: CreditCard, label: "طلبات شحن المحافظ", labelEn: "Wallet Requests", key: "wallet-requests" },
    { icon: Truck, label: "أسعار التوصيل", labelEn: "Delivery Prices", key: "delivery" },
  ]},
  { title: "المالية", titleEn: "Finance", items: [
    { icon: BarChart3, label: "أرباح المنصة", labelEn: "Revenue", key: "revenue" },
  ]},
  { title: "النظام", titleEn: "System", items: [
    { icon: Activity, label: "حالة المنصة", labelEn: "Platform Status", key: "status" },
    { icon: Scale, label: "لوائح وقوانين", labelEn: "Terms & Conditions", key: "terms" },
    { icon: MessageSquare, label: "المراسلات", labelEn: "Messages", key: "messages" },
    { icon: Bell, label: "الإشعارات", labelEn: "Notifications", key: "notifications" },
    { icon: Monitor, label: "تواصل معنا", labelEn: "Contact Info", key: "contact" },
  ]},
  { title: "الحساب", titleEn: "Account", items: [
    { icon: User, label: "الملف الشخصي", labelEn: "Profile", key: "profile" },
    { icon: Image, label: "هوية المنصة", labelEn: "Platform Branding", key: "branding" },
    { icon: Settings, label: "إعدادات المنصة", labelEn: "Settings", key: "settings" },
  ]},
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [walletRequests, setWalletRequests] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [subRequests, setSubRequests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [messagesData, setMessagesData] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [grantPlanModal, setGrantPlanModal] = useState<any>(null);
  const [revokePlanModal, setRevokePlanModal] = useState<any>(null);
  const [searchCompany, setSearchCompany] = useState("");
  const [newMessage, setNewMessage] = useState({ company: "", type: "إشعار عام", message: "" });
  const [theme, setTheme] = useState(() => localStorage.getItem("madar_theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");

  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    if (!authLoading && (!user || role !== "admin")) navigate("/login/company");
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

  // Load all data from Supabase
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      setLoading(true);
      const [companiesRes, walletRes, plansRes, subReqRes, notifsRes, msgsRes, settingsRes] = await Promise.all([
        supabase.from("companies").select("*").order("created_at", { ascending: false }),
        supabase.from("wallet_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("plans").select("*").order("price", { ascending: true }),
        supabase.from("subscription_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("messages").select("*").or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`).order("created_at", { ascending: false }),
        supabase.from("platform_settings").select("*"),
      ]);
      setCompanies(companiesRes.data || []);
      setWalletRequests(walletRes.data || []);
      setPlans(plansRes.data || []);
      setSubRequests(subReqRes.data || []);
      setNotifications(notifsRes.data || []);
      setMessagesData(msgsRes.data || []);
      const settings: Record<string, any> = {};
      (settingsRes.data || []).forEach((s: any) => { settings[s.key] = s.value; });
      setPlatformSettings(settings);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const flatItems = sidebarSections.flatMap(s => s.items);
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

  const logout = async () => { await signOut(); navigate("/"); };

  const branding = platformSettings.branding || { name: "مدار", primaryColor: "#2563eb", accentColor: "#c9a227", logo: "" };
  const currency = platformSettings.currency || { primary: "LYD", secondary: "USD", rate: 4.85 };
  const contactInfo = platformSettings.contact_info || { email: "support@madar.ly", phone: "+218 XX XXX XXXX", address: "ليبيا - طرابلس" };

  const saveSetting = async (key: string, value: any) => {
    const { data: existing } = await supabase.from("platform_settings").select("id").eq("key", key).maybeSingle();
    if (existing) {
      await supabase.from("platform_settings").update({ value, updated_at: new Date().toISOString() }).eq("key", key);
    } else {
      await supabase.from("platform_settings").insert({ key, value });
    }
    setPlatformSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateWalletRequest = async (id: string, status: string, notes?: string) => {
    await supabase.from("wallet_requests").update({ status, admin_notes: notes || "" }).eq("id", id);
    if (status === "approved") {
      const req = walletRequests.find(r => r.id === id);
      if (req) {
        const company = companies.find(c => c.id === req.company_id);
        if (company) {
          await supabase.from("companies").update({ wallet: (company.wallet || 0) + Number(req.amount) }).eq("id", company.id);
          await supabase.from("wallet_transactions").insert({ company_id: company.id, amount: Number(req.amount), type: "deposit", description: `شحن محفظة - ${req.method}` });
          await supabase.from("notifications").insert({ user_id: company.owner_id, title: "تم قبول طلب الشحن", message: `تم قبول طلب شحن المحفظة بقيمة ${req.amount} د.ل` });
        }
      }
    }
    // Reload
    const { data } = await supabase.from("wallet_requests").select("*").order("created_at", { ascending: false });
    setWalletRequests(data || []);
    const { data: comps } = await supabase.from("companies").select("*").order("created_at", { ascending: false });
    setCompanies(comps || []);
  };

  const suspendCompany = async (id: string) => {
    const company = companies.find(c => c.id === id);
    const newStatus = company?.status === "suspended" ? "active" : "suspended";
    await supabase.from("companies").update({ status: newStatus }).eq("id", id);
    setCompanies(companies.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const deleteCompany = async (id: string) => {
    if (!confirm(t("هل أنت متأكد من حذف هذه الشركة؟", "Are you sure?"))) return;
    await supabase.from("companies").delete().eq("id", id);
    setCompanies(companies.filter(c => c.id !== id));
  };

  const grantPlan = async (companyId: string, planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    await supabase.from("companies").update({ plan: plan.id, plan_name: plan.name, status: "active" }).eq("id", companyId);
    await supabase.from("subscriptions").insert({ company_id: companyId, plan_id: plan.id, plan_name: plan.name, price: plan.price, end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
    setCompanies(companies.map(c => c.id === companyId ? { ...c, plan: plan.id, plan_name: plan.name, status: "active" } : c));
    setGrantPlanModal(null);
  };

  const revokePlan = async (companyId: string, reason: string) => {
    await supabase.from("companies").update({ plan: null, plan_name: "تجربة مجانية", status: "suspended" }).eq("id", companyId);
    const company = companies.find(c => c.id === companyId);
    if (company) {
      await supabase.from("notifications").insert({ user_id: company.owner_id, title: "تم سحب الباقة", message: `تم سحب باقتك. السبب: ${reason}` });
    }
    setCompanies(companies.map(c => c.id === companyId ? { ...c, plan: null, plan_name: "تجربة مجانية", status: "suspended" } : c));
    setRevokePlanModal(null);
  };

  const handleSubRequest = async (id: string, status: string) => {
    const req = subRequests.find(r => r.id === id);
    await supabase.from("subscription_requests").update({ status }).eq("id", id);
    if (status === "approved" && req) {
      await supabase.from("subscriptions").insert({ company_id: req.company_id, plan_id: req.plan_id, plan_name: req.plan_name, price: req.price, end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() });
      await supabase.from("companies").update({ plan: req.plan_id, plan_name: req.plan_name, status: "active" }).eq("id", req.company_id);
    }
    const { data } = await supabase.from("subscription_requests").select("*").order("created_at", { ascending: false });
    setSubRequests(data || []);
  };

  const savePlan = async (plan: any) => {
    if (plan.id && plans.find(p => p.id === plan.id)) {
      await supabase.from("plans").update({ name: plan.name, name_en: plan.name_en, price: plan.price, period: plan.period, max_users: plan.max_users, max_stores: plan.max_stores, max_products: plan.max_products, features: plan.features, active: plan.active }).eq("id", plan.id);
    } else {
      await supabase.from("plans").insert(plan);
    }
    const { data } = await supabase.from("plans").select("*").order("price", { ascending: true });
    setPlans(data || []);
    setEditingPlan(null);
  };

  const deletePlan = async (id: string) => {
    await supabase.from("plans").delete().eq("id", id);
    setPlans(plans.filter(p => p.id !== id));
  };

  const sendMessage = async () => {
    if (!newMessage.message || !user) return;
    if (newMessage.company) {
      const company = companies.find(c => c.id === newMessage.company);
      if (company) {
        await supabase.from("messages").insert({ sender_id: user.id, receiver_id: company.owner_id, content: newMessage.message });
        await supabase.from("notifications").insert({ user_id: company.owner_id, title: "رسالة من مسؤول النظام", message: newMessage.message });
      }
    } else {
      for (const c of companies) {
        await supabase.from("messages").insert({ sender_id: user.id, receiver_id: c.owner_id, content: newMessage.message });
        await supabase.from("notifications").insert({ user_id: c.owner_id, title: "رسالة من مسؤول النظام", message: newMessage.message });
      }
    }
    setNewMessage({ company: "", type: "إشعار عام", message: "" });
    alert(t("تم إرسال الرسالة بنجاح!", "Message sent successfully!"));
  };

  const totalRevenue = walletRequests.filter(r => r.status === "approved").reduce((a, r) => a + Number(r.amount || 0), 0);
  const filteredCompanies = companies.filter(c => !searchCompany || c.company_name?.includes(searchCompany) || c.email?.includes(searchCompany));

  const stats = [
    { label: t("الشركات المسجلة", "Registered Companies"), value: companies.length, icon: Building2 },
    { label: t("الاشتراكات الفعالة", "Active Subscriptions"), value: companies.filter(c => c.status === "active").length, icon: CheckCircle },
    { label: t("إجمالي الأرباح", "Total Revenue"), value: `${totalRevenue} ${t("د.ل", "LYD")}`, icon: DollarSign },
    { label: t("طلبات الشحن المعلقة", "Pending Requests"), value: walletRequests.filter(r => r.status === "pending").length, icon: CreditCard },
    { label: t("طلبات الاشتراك", "Sub Requests"), value: subRequests.filter(r => r.status === "pending").length, icon: Ticket },
    { label: t("الحسابات المعلقة", "Suspended Accounts"), value: companies.filter(c => c.status === "suspended").length, icon: Ban },
  ];

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
              <h2 className="font-black text-primary text-sm">{branding.name || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">{t("مسؤول النظام", "System Admin")}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-130px)]">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">{lang === "ar" ? section.title : section.titleEn}</p>
              {section.items.map((item) => (
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
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="p-2 rounded-xl hover:bg-secondary">
              <Globe className="h-4 w-4 text-foreground" />
            </button>
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notifications.filter(n => !n.read).length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center">{notifications.filter(n => !n.read).length}</span>}
            </div>
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">م</div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <s.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-4">{t("توزيع الباقات", "Plan Distribution")}</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={(() => {
                        const counts: Record<string, number> = {};
                        companies.forEach(c => { counts[c.plan_name || "تجربة"] = (counts[c.plan_name || "تجربة"] || 0) + 1; });
                        return Object.entries(counts).map(([name, value]) => ({ name, value }));
                      })()} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))", "hsl(var(--warning))"].map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-4">{t("التسجيلات الشهرية", "Monthly Registrations")}</h4>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[t("يناير","Jan"),t("فبراير","Feb"),t("مارس","Mar"),t("أبريل","Apr"),t("مايو","May"),t("يونيو","Jun")].map((name, i) => ({
                      name: name.slice(0, 3),
                      count: companies.filter(c => new Date(c.created_at).getMonth() === i).length,
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("آخر الشركات المسجلة", "Recent Companies")}</h3>
                {companies.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد شركات مسجلة بعد.", "No companies registered yet.")}</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الشركة", "Company")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("المسؤول", "Manager")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الباقة", "Plan")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة", "Status")}</th>
                      </tr></thead>
                      <tbody>{companies.slice(0, 10).map(c => (
                        <tr key={c.id} className="border-b border-border/30">
                          <td className="py-2 px-3 text-foreground">{c.company_name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{c.manager_name}</td>
                          <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.plan_name}</span></td>
                          <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? t("معلّق", "Suspended") : t("نشط", "Active")}</span></td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Monitoring */}
          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-primary">{companies.length}</p><p className="text-xs text-muted-foreground">{t("شركة مسجلة", "Registered")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-success">{companies.filter(c => c.status === "active").length}</p><p className="text-xs text-muted-foreground">{t("اشتراك فعال", "Active")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-warning">{companies.filter(c => c.plan === "trial" || !c.plan).length}</p><p className="text-xs text-muted-foreground">{t("فترة تجريبية", "Trial")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-destructive">{companies.filter(c => c.status === "suspended").length}</p><p className="text-xs text-muted-foreground">{t("معلّقة", "Suspended")}</p></div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("تفاصيل الاشتراكات", "Subscription Details")}</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الشركة", "Company")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الباقة", "Plan")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("المحفظة", "Wallet")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة", "Status")}</th>
                    </tr></thead>
                    <tbody>{companies.map(c => (
                      <tr key={c.id} className="border-b border-border/30">
                        <td className="py-2 px-3 text-foreground font-medium">{c.company_name}</td>
                        <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.plan_name}</span></td>
                        <td className="py-2 px-3 text-foreground">{c.wallet || 0} {t("د.ل", "LYD")}</td>
                        <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? t("معلّق", "Suspended") : t("نشط", "Active")}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Companies */}
          {activeTab === "companies" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]"><Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><input value={searchCompany} onChange={e => setSearchCompany(e.target.value)} placeholder={t("بحث...", "Search...")} className={inputClass + " pr-10"} /></div>
                <button onClick={() => exportToPDF(t("الشركات","Companies"), companies.map(c => ({ name: c.company_name, manager: c.manager_name, plan: c.plan_name, status: c.status })), [t("الشركة","Company"),t("المسؤول","Manager"),t("الباقة","Plan"),t("الحالة","Status")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
              </div>
              <div className="glass rounded-2xl p-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-right py-2 px-3 text-muted-foreground">{t("الشركة", "Company")}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground">{t("البريد", "Email")}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground">{t("الباقة", "Plan")}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground">{t("المحفظة", "Wallet")}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة", "Status")}</th>
                    <th className="text-right py-2 px-3 text-muted-foreground">{t("الإجراءات", "Actions")}</th>
                  </tr></thead>
                  <tbody>{filteredCompanies.map(c => (
                    <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/30">
                      <td className="py-2 px-3 text-foreground font-medium">{c.company_name}</td>
                      <td className="py-2 px-3 text-muted-foreground text-xs">{c.email}</td>
                      <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.plan_name}</span></td>
                      <td className="py-2 px-3 text-foreground">{c.wallet || 0} {t("د.ل", "LYD")}</td>
                      <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? t("معلّق", "Suspended") : t("نشط", "Active")}</span></td>
                      <td className="py-2 px-3">
                        <div className="flex gap-1 flex-wrap">
                          <button onClick={() => suspendCompany(c.id)} className={`text-xs px-2 py-1 rounded-lg ${c.status === "suspended" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>{c.status === "suspended" ? t("تفعيل", "Activate") : t("تعليق", "Suspend")}</button>
                          <button onClick={() => setGrantPlanModal(c)} className="text-xs px-2 py-1 rounded-lg bg-primary/20 text-primary">{t("منح باقة", "Grant")}</button>
                          <button onClick={() => setRevokePlanModal(c)} className="text-xs px-2 py-1 rounded-lg bg-warning/20 text-warning">{t("سحب", "Revoke")}</button>
                          <button onClick={() => deleteCompany(c.id)} className="text-xs px-2 py-1 rounded-lg bg-destructive/20 text-destructive">{t("حذف", "Delete")}</button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {grantPlanModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="glass rounded-2xl p-6 max-w-md w-full">
                    <h3 className="font-bold text-foreground mb-4">{t("منح باقة لـ", "Grant plan to")} {grantPlanModal.company_name}</h3>
                    <div className="space-y-2">{plans.filter(p => p.active).map(p => (
                      <button key={p.id} onClick={() => grantPlan(grantPlanModal.id, p.id)} className="w-full glass rounded-xl p-3 text-right hover:border-primary/50 flex justify-between items-center">
                        <span className="font-bold text-foreground text-sm">{p.name}</span>
                        <span className="text-primary text-sm">{p.price} {t("د.ل", "LYD")}/{p.period}</span>
                      </button>
                    ))}</div>
                    <button onClick={() => setGrantPlanModal(null)} className="mt-4 w-full px-4 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                  </div>
                </div>
              )}
              {revokePlanModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); revokePlan(revokePlanModal.id, fd.get("reason") as string); }} className="glass rounded-2xl p-6 max-w-md w-full">
                    <h3 className="font-bold text-foreground mb-4">{t("سحب باقة من", "Revoke from")} {revokePlanModal.company_name}</h3>
                    <textarea name="reason" required placeholder={t("سبب السحب...", "Reason...")} rows={3} className={inputClass} />
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="px-6 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold">{t("سحب", "Revoke")}</button>
                      <button type="button" onClick={() => setRevokePlanModal(null)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Plans */}
          {activeTab === "plans" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("إدارة الباقات", "Manage Plans")}</h3>
                <button onClick={() => setEditingPlan({ name: "", name_en: "", price: 0, period: "شهر", max_users: 5, max_stores: 1, max_products: 500, features: [], active: true })} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة باقة", "Add Plan")}</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map(p => (
                  <div key={p.id} className={`glass rounded-2xl p-5 ${!p.active ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-foreground">{p.name}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingPlan({...p})} className="text-primary"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => deletePlan(p.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-primary">{p.price} <span className="text-xs text-muted-foreground">{t("د.ل", "LYD")} / {p.period}</span></p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p>👥 {t("المستخدمين", "Users")}: {p.max_users}</p>
                      <p>🏪 {t("المخازن", "Stores")}: {p.max_stores}</p>
                      <p>📦 {t("المنتجات", "Products")}: {p.max_products >= 999999 ? t("غير محدود", "Unlimited") : p.max_products}</p>
                    </div>
                    {p.features?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">{p.features.map((f: string, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">{f}</span>)}</div>
                    )}
                  </div>
                ))}
              </div>
              {editingPlan && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-4">{editingPlan.id ? t("تعديل الباقة", "Edit Plan") : t("إنشاء باقة جديدة", "Create Plan")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="text-sm font-bold text-foreground">{t("اسم الباقة", "Plan Name")}</label><input value={editingPlan.name} onChange={e => setEditingPlan({...editingPlan, name: e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("السعر", "Price")}</label><input type="number" value={editingPlan.price} onChange={e => setEditingPlan({...editingPlan, price: +e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("المدة", "Period")}</label><select value={editingPlan.period} onChange={e => setEditingPlan({...editingPlan, period: e.target.value})} className={inputClass}><option>أسبوع</option><option>شهر</option><option>سنة</option></select></div>
                    <div><label className="text-sm font-bold text-foreground">{t("المستخدمين", "Users")}</label><input type="number" value={editingPlan.max_users} onChange={e => setEditingPlan({...editingPlan, max_users: +e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("المخازن", "Stores")}</label><input type="number" value={editingPlan.max_stores} onChange={e => setEditingPlan({...editingPlan, max_stores: +e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("المنتجات", "Products")}</label><input type="number" value={editingPlan.max_products} onChange={e => setEditingPlan({...editingPlan, max_products: +e.target.value})} className={inputClass} /></div>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-bold text-foreground">{t("المميزات", "Features")}</label>
                    <input value={editingPlan.features?.join(",") || ""} onChange={e => setEditingPlan({...editingPlan, features: e.target.value.split(",").map((f: string) => f.trim()).filter(Boolean)})} className={inputClass} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => savePlan(editingPlan)} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ", "Save")}</button>
                    <button onClick={() => setEditingPlan(null)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء", "Cancel")}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Subscription Requests */}
          {activeTab === "sub-requests" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("طلبات الاشتراك", "Subscription Requests")}</h3>
              {subRequests.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد طلبات.", "No requests.")}</p></div> : (
                <div className="space-y-3">{subRequests.map(req => (
                  <div key={req.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-foreground">{req.plan_name} - {req.price} {t("د.ل", "LYD")}</p>
                        <p className="text-xs text-muted-foreground">{t("طريقة الدفع:", "Payment:")} {req.payment_method} · {new Date(req.created_at).toLocaleDateString("ar-LY")}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${req.status === "approved" ? "bg-success/20 text-success" : req.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{req.status === "approved" ? t("مقبول", "Approved") : req.status === "rejected" ? t("مرفوض", "Rejected") : t("معلّق", "Pending")}</span>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleSubRequest(req.id, "approved")} className="px-4 py-1.5 rounded-xl bg-success/20 text-success text-xs font-bold">{t("قبول", "Approve")}</button>
                        <button onClick={() => handleSubRequest(req.id, "rejected")} className="px-4 py-1.5 rounded-xl bg-destructive/20 text-destructive text-xs font-bold">{t("رفض", "Reject")}</button>
                      </div>
                    )}
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Currencies */}
          {activeTab === "currencies" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">{t("إدارة العملات", "Currency Management")}</h3>
              <div className="space-y-4">
                <div><label className="block text-sm font-bold text-foreground mb-1">{t("العملة الأساسية", "Primary")}</label>
                  <select value={currency.primary} onChange={e => saveSetting("currency", {...currency, primary: e.target.value})} className={inputClass}>
                    <option value="LYD">{t("دينار ليبي", "LYD")}</option><option value="USD">{t("دولار أمريكي", "USD")}</option>
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-foreground mb-1">{t("سعر الصرف", "Exchange Rate")}</label>
                  <input type="number" step="0.01" value={currency.rate} onChange={e => saveSetting("currency", {...currency, rate: +e.target.value})} className={inputClass} />
                </div>
              </div>
            </div>
          )}

          {/* Wallet Requests */}
          {activeTab === "wallet-requests" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("طلبات شحن المحافظ", "Wallet Requests")} ({walletRequests.length})</h3>
                <button onClick={() => exportToPDF(t("طلبات شحن المحافظ","Wallet Requests"), walletRequests.map(r => ({ amount: r.amount, method: r.method, status: r.status, date: new Date(r.created_at).toLocaleDateString("ar-LY") })), [t("المبلغ","Amount"),t("الطريقة","Method"),t("الحالة","Status"),t("التاريخ","Date")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
              </div>
              {walletRequests.length === 0 ? <div className="glass rounded-2xl p-6 text-center"><CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد طلبات.", "No requests.")}</p></div> : (
                <div className="space-y-3">{walletRequests.map(r => (
                  <div key={r.id} className="glass rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-foreground">{r.amount} {t("د.ل", "LYD")}</p>
                        <p className="text-xs text-muted-foreground">{t("الطريقة:", "Method:")} {r.method} · {new Date(r.created_at).toLocaleDateString("ar-LY")}</p>
                        {r.notes && <p className="text-xs text-muted-foreground mt-1">{r.notes}</p>}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "approved" ? "bg-success/20 text-success" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{r.status}</span>
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => updateWalletRequest(r.id, "approved")} className="px-4 py-1.5 rounded-xl bg-success/20 text-success text-xs font-bold">{t("قبول", "Approve")}</button>
                        <button onClick={() => updateWalletRequest(r.id, "rejected")} className="px-4 py-1.5 rounded-xl bg-destructive/20 text-destructive text-xs font-bold">{t("رفض", "Reject")}</button>
                      </div>
                    )}
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Revenue */}
          {activeTab === "revenue" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="glass rounded-2xl p-5"><p className="text-xs text-muted-foreground">{t("إجمالي الأرباح", "Total Revenue")}</p><p className="text-2xl font-black text-primary">{totalRevenue} {t("د.ل", "LYD")}</p></div>
                <div className="glass rounded-2xl p-5"><p className="text-xs text-muted-foreground">{t("الشركات النشطة", "Active Companies")}</p><p className="text-2xl font-black text-success">{companies.filter(c => c.status === "active").length}</p></div>
                <div className="glass rounded-2xl p-5"><p className="text-xs text-muted-foreground">{t("طلبات معلقة", "Pending")}</p><p className="text-2xl font-black text-warning">{walletRequests.filter(r => r.status === "pending").length}</p></div>
              </div>
            </div>
          )}

          {/* Platform Status */}
          {activeTab === "status" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("حالة المنصة", "Platform Status")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="glass rounded-xl p-4 text-center"><div className="w-3 h-3 rounded-full bg-success mx-auto mb-2" /><p className="text-sm text-foreground font-bold">{t("تعمل", "Online")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><Activity className="h-6 w-6 text-primary mx-auto mb-2" /><p className="text-sm text-foreground font-bold">{t("ممتاز", "Excellent")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><Clock className="h-6 w-6 text-warning mx-auto mb-2" /><p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("ar-LY")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><Users className="h-6 w-6 text-primary mx-auto mb-2" /><p className="text-xs text-muted-foreground">{companies.filter(c => c.status === "active").length} {t("شركة", "companies")}</p></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <div><span className="font-bold text-foreground">{t("الإصدار", "Version")}:</span> 3.0.0</div>
                  <div><span className="font-bold text-foreground">{t("الشركات", "Companies")}:</span> {companies.length}</div>
                  <div><span className="font-bold text-foreground">{t("الطلبات", "Requests")}:</span> {walletRequests.length}</div>
                  <div><span className="font-bold text-foreground">{t("الباقات", "Plans")}:</span> {plans.length}</div>
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("المراسلات", "Messages")}</h3>
                <div className="space-y-3">
                  <select value={newMessage.company} onChange={e => setNewMessage({...newMessage, company: e.target.value})} className={inputClass}>
                    <option value="">{t("جميع الشركات", "All Companies")}</option>
                    {companies.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                  <textarea value={newMessage.message} onChange={e => setNewMessage({...newMessage, message: e.target.value})} rows={3} className={inputClass} placeholder={t("اكتب رسالتك...", "Write your message...")} />
                  <button onClick={sendMessage} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Send className="h-4 w-4" /> {t("إرسال", "Send")}</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("سجل المراسلات", "Message History")}</h3>
                {messagesData.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد رسائل.", "No messages.")}</p> : (
                  <div className="space-y-2">{messagesData.map(m => (
                    <div key={m.id} className="glass rounded-xl p-3">
                      <p className="text-sm text-foreground">{m.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.created_at).toLocaleDateString("ar-LY")}</p>
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("الإشعارات", "Notifications")} ({notifications.filter(n => !n.read).length} {t("جديد", "new")})</h3>
                {notifications.length > 0 && (
                  <button onClick={async () => { for (const n of notifications) { await supabase.from("notifications").update({ read: true }).eq("id", n.id); } setNotifications(notifications.map(n => ({...n, read: true}))); }} className="text-xs text-primary hover:underline">{t("تعيين الكل كمقروء", "Mark all read")}</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div className="glass rounded-2xl p-6 text-center"><Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد إشعارات", "No notifications")}</p></div>
              ) : (
                <div className="space-y-2">{notifications.map(n => (
                  <div key={n.id} onClick={async () => { await supabase.from("notifications").update({ read: true }).eq("id", n.id); setNotifications(notifications.map(nn => nn.id === n.id ? {...nn, read: true} : nn)); }} className={`glass rounded-xl p-4 cursor-pointer ${!n.read ? "border-primary/30" : ""}`}>
                    <p className={`text-sm ${!n.read ? "font-bold text-foreground" : "text-muted-foreground"}`}>{n.title}: {n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.created_at).toLocaleDateString("ar-LY")}</p>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">{t("الملف الشخصي", "Profile")}</h3>
              <div className="space-y-3">
                <div><label className="text-sm font-bold text-foreground">{t("البريد الإلكتروني", "Email")}</label><input value={user?.email || ""} disabled className={inputClass + " opacity-50"} /></div>
                <div><label className="text-sm font-bold text-foreground">{t("الدور", "Role")}</label><input value={t("مسؤول النظام", "System Admin")} disabled className={inputClass + " opacity-50"} /></div>
              </div>
            </div>
          )}

          {/* Branding */}
          {activeTab === "branding" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">{t("هوية المنصة", "Platform Branding")}</h3>
              <div className="space-y-4">
                <div><label className="text-sm font-bold text-foreground">{t("اسم المنصة", "Name")}</label><input value={branding.name} onChange={e => saveSetting("branding", {...branding, name: e.target.value})} className={inputClass} /></div>
                <div><label className="text-sm font-bold text-foreground">{t("اللون الأساسي", "Primary Color")}</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={branding.primaryColor} onChange={e => saveSetting("branding", {...branding, primaryColor: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer" />
                    <input value={branding.primaryColor} onChange={e => saveSetting("branding", {...branding, primaryColor: e.target.value})} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delivery */}
          {activeTab === "delivery" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">{t("أسعار التوصيل", "Delivery Prices")}</h3>
              <p className="text-sm text-muted-foreground">{t("يمكنك تعديل أسعار التوصيل من إعدادات المنصة.", "Delivery prices can be managed from platform settings.")}</p>
            </div>
          )}

          {/* Terms */}
          {activeTab === "terms" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">{t("لوائح وقوانين المنصة", "Terms & Conditions")}</h3>
              <div className="prose prose-sm text-muted-foreground max-w-none" dangerouslySetInnerHTML={{ __html: `<p>1. منصة مدار تحتفظ بجميع الحقوق الفكرية والتقنية.</p><p>2. العميل يحتفظ بملكية بياناته.</p><p>3. عند انتهاء الاشتراك يتم تعليق الحساب مع الاحتفاظ بالبيانات 90 يوم.</p><p>4. يُمنع الاستخدام غير القانوني.</p><p>5. شحن المحفظة غير قابل للاسترداد بعد القبول.</p>` }} />
            </div>
          )}

          {/* Contact */}
          {activeTab === "contact" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">{t("معلومات التواصل", "Contact Info")}</h3>
              <div className="space-y-3">
                <div><label className="text-sm font-bold text-foreground">{t("البريد", "Email")}</label><input value={contactInfo.email || ""} onChange={e => saveSetting("contact_info", {...contactInfo, email: e.target.value})} className={inputClass} /></div>
                <div><label className="text-sm font-bold text-foreground">{t("الهاتف", "Phone")}</label><input value={contactInfo.phone || ""} onChange={e => saveSetting("contact_info", {...contactInfo, phone: e.target.value})} className={inputClass} /></div>
                <div><label className="text-sm font-bold text-foreground">{t("العنوان", "Address")}</label><input value={contactInfo.address || ""} onChange={e => saveSetting("contact_info", {...contactInfo, address: e.target.value})} className={inputClass} /></div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">{t("إعدادات المنصة", "Platform Settings")}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <div><p className="text-sm font-bold text-foreground">{t("المظهر", "Theme")}</p></div>
                  <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2">
                    {theme === "dark" ? <><Sun className="h-4 w-4" /> {t("نهاري", "Light")}</> : <><Moon className="h-4 w-4" /> {t("ليلي", "Dark")}</>}
                  </button>
                </div>
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <div><p className="text-sm font-bold text-foreground">{t("اللغة", "Language")}</p></div>
                  <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" /> {lang === "ar" ? "English" : "العربية"}
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

export default AdminDashboard;
