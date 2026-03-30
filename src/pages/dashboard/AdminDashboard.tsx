import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Package, CreditCard, Users, Settings, LogOut,
  BarChart3, Shield, Ticket, DollarSign, Activity, AlertTriangle, User, Bell, Menu, X,
  Eye, Trash2, Send, Gift, Ban, CheckCircle, Clock, FileText, Edit, Plus, Download, RefreshCw, Search, MessageSquare,
  Upload, Moon, Sun, Globe, Scale, Truck, Image, Monitor
} from "lucide-react";
import logo from "@/assets/logo-transparent.png";
import { exportToPDF, exportSimplePDF } from "@/utils/pdfExport";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const libyanCities = [
  "طرابلس","بنغازي","مصراتة","الزاوية","زليتن","البيضاء","الخمس","سبها","درنة","طبرق",
  "غريان","صبراتة","سرت","اجدابيا","جنزور","تاجوراء","زوارة","ترهونة","نالوت","غدامس",
  "بني وليد","يفرن","جادو","الجفرة","الكفرة","أوباري","مرزق","براك","وادي الشاطئ"
];

const defaultDeliveryPrices: Record<string, number> = {};
libyanCities.forEach(c => { defaultDeliveryPrices[c] = 25; });
defaultDeliveryPrices["طرابلس"] = 15;
defaultDeliveryPrices["بنغازي"] = 20;
defaultDeliveryPrices["مصراتة"] = 20;
defaultDeliveryPrices["سبها"] = 40;

const termsAndConditions = `
<h3>لوائح وقوانين منصة مدار</h3>
<p>1. <strong>حقوق المنصة:</strong> منصة مدار تحتفظ بجميع الحقوق الفكرية والتقنية. لا يجوز نسخ أو إعادة توزيع أي جزء من المنصة.</p>
<p>2. <strong>حقوق العميل:</strong> العميل يحتفظ بملكية بياناته الكاملة ويحق له طلب تصديرها أو حذفها في أي وقت.</p>
<p>3. <strong>الاشتراكات:</strong> عند انتهاء الاشتراك يتم تعليق الحساب مع الاحتفاظ بالبيانات لمدة 90 يوم. بعدها يحق للمنصة حذف البيانات.</p>
<p>4. <strong>الاستخدام:</strong> يُمنع استخدام المنصة لأي أغراض غير قانونية أو احتيالية.</p>
<p>5. <strong>المحفظة:</strong> شحن المحفظة غير قابل للاسترداد بعد القبول إلا في حالات استثنائية يقررها مسؤول النظام.</p>
<p>6. <strong>الصلاحيات:</strong> كل شركة مسؤولة عن إدارة صلاحيات موظفيها. المنصة غير مسؤولة عن سوء استخدام الصلاحيات داخل الشركة.</p>
<p>7. <strong>الخصوصية:</strong> لا تشارك المنصة بيانات أي شركة مع طرف ثالث. جميع البيانات مشفرة ومحمية.</p>
<p>8. <strong>التعليق:</strong> يحق لمسؤول النظام تعليق أي حساب يخالف هذه القوانين دون إنذار مسبق.</p>
<p>9. <strong>التحديثات:</strong> تحتفظ المنصة بحق تعديل هذه القوانين في أي وقت مع إشعار المستخدمين.</p>
<p>10. <strong>النزاعات:</strong> يتم حل النزاعات وفق القانون الليبي وفي المحاكم الليبية المختصة.</p>
`;

const sidebarSections = [
  { title: "الرئيسية", titleEn: "Main", items: [
    { icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard", key: "dashboard" },
    { icon: Eye, label: "المراقبة الشاملة", labelEn: "Monitoring", key: "monitoring" },
  ]},
  { title: "إدارة المنصة", titleEn: "Platform Management", items: [
    { icon: Building2, label: "إدارة الشركات", labelEn: "Companies", key: "companies" },
    { icon: Package, label: "إدارة الباقات", labelEn: "Plans", key: "plans" },
    { icon: DollarSign, label: "إدارة العملات", labelEn: "Currencies", key: "currencies" },
    { icon: Ticket, label: "الكوبونات", labelEn: "Coupons", key: "coupons" },
    { icon: CreditCard, label: "طلبات شحن المحافظ", labelEn: "Wallet Requests", key: "wallet-requests" },
    { icon: Truck, label: "أسعار التوصيل", labelEn: "Delivery Prices", key: "delivery" },
  ]},
  { title: "المالية", titleEn: "Finance", items: [
    { icon: BarChart3, label: "أرباح المنصة", labelEn: "Revenue", key: "revenue" },
  ]},
  { title: "النظام", titleEn: "System", items: [
    { icon: Activity, label: "حالة المنصة", labelEn: "Platform Status", key: "status" },
    { icon: AlertTriangle, label: "كشف التلاعب", labelEn: "Fraud Detection", key: "fraud" },
    { icon: Scale, label: "لوائح وقوانين", labelEn: "Terms & Conditions", key: "terms" },
    { icon: MessageSquare, label: "المراسلات", labelEn: "Messages", key: "messages" },
    { icon: Bell, label: "الإشعارات", labelEn: "Notifications", key: "notifications" },
  ]},
  { title: "الحساب", titleEn: "Account", items: [
    { icon: User, label: "الملف الشخصي", labelEn: "Profile", key: "profile" },
    { icon: Image, label: "هوية المنصة", labelEn: "Platform Branding", key: "branding" },
    { icon: Settings, label: "إعدادات المنصة", labelEn: "Settings", key: "settings" },
  ]},
];

const defaultPlans = [
  { id: "trial", name: "تجربة مجانية", nameEn: "Free Trial", price: 0, period: "أسبوع", users: 999, stores: 999, products: 999, devices: 2, features: ["جميع المميزات"], active: true },
  { id: "starter", name: "باقة البداية", nameEn: "Starter", price: 100, period: "أسبوع", users: 2, stores: 1, products: 200, devices: 1, features: ["إدارة المنتجات","حركة المخزون","التقارير الأساسية","الباركود"], active: true },
  { id: "basic", name: "الباقة الأساسية", nameEn: "Basic", price: 300, period: "شهر", users: 3, stores: 1, products: 500, devices: 3, features: ["إدارة المنتجات","حركة المخزون","التقارير الأساسية","الباركود","تنبيهات المخزون"], active: true },
  { id: "pro", name: "الباقة الاحترافية", nameEn: "Professional", price: 500, period: "شهر", users: 10, stores: 3, products: 5000, devices: 5, features: ["إدارة المنتجات","حركة المخزون","التقارير الذكية","الباركود","تنبيهات المخزون","الجرد المتقدم","الموارد البشرية","المحاسبة","إدارة الموردين","التالف والمرتجعات","سجل النشاطات"], active: true },
  { id: "business", name: "باقة الأعمال", nameEn: "Business", price: 1000, period: "شهر", users: 50, stores: 10, products: 999999, devices: 10, features: ["جميع المميزات","أولوية الدعم"], active: true },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>(() => JSON.parse(localStorage.getItem("madar_companies") || "[]"));
  const [walletRequests, setWalletRequests] = useState<any[]>(() => JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]"));
  const [plans, setPlans] = useState(() => JSON.parse(localStorage.getItem("madar_plans") || JSON.stringify(defaultPlans)));
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem("madar_admin_profile") || JSON.stringify({ name: "مسؤول النظام", email: "kookakooka6589@gmail.com", bankAccount: "", password: "" })));
  const [currency, setCurrency] = useState(() => JSON.parse(localStorage.getItem("madar_currency") || JSON.stringify({ primary: "LYD", secondary: "USD", rate: 4.85 })));
  const [coupons, setCoupons] = useState(() => JSON.parse(localStorage.getItem("madar_coupons") || "[]"));
  const [deliveryPrices, setDeliveryPrices] = useState(() => JSON.parse(localStorage.getItem("madar_delivery_prices") || JSON.stringify(defaultDeliveryPrices)));
  const [branding, setBranding] = useState(() => JSON.parse(localStorage.getItem("madar_branding") || JSON.stringify({ name: "مدار", primaryColor: "#2563eb", accentColor: "#c9a227", logo: "" })));
  const [platformSettings, setPlatformSettings] = useState(() => JSON.parse(localStorage.getItem("madar_platform_settings") || JSON.stringify({ autoRegistration: true, maintenanceMode: false })));
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newCoupon, setNewCoupon] = useState({ code: "", value: 0, type: "percent", maxUses: 10, expiresAt: "" });
  const [grantPlanModal, setGrantPlanModal] = useState<any>(null);
  const [revokePlanModal, setRevokePlanModal] = useState<any>(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("madar_theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");
  const [searchCompany, setSearchCompany] = useState("");
  const [fraudLogs, setFraudLogs] = useState<any[]>(() => JSON.parse(localStorage.getItem("madar_fraud_logs") || "[]"));
  const [adminNotifications, setAdminNotifications] = useState<any[]>(() => JSON.parse(localStorage.getItem("madar_admin_notifs") || "[]"));
  const [adminMessages, setAdminMessages] = useState<any[]>(() => JSON.parse(localStorage.getItem("madar_admin_messages") || "[]"));
  const [terms, setTerms] = useState<any[]>(() => JSON.parse(localStorage.getItem("madar_terms") || JSON.stringify([
    { id: "1", title: "حقوق المنصة", content: "منصة مدار تحتفظ بجميع الحقوق الفكرية والتقنية." },
    { id: "2", title: "حقوق العميل", content: "العميل يحتفظ بملكية بياناته الكاملة." },
    { id: "3", title: "الاشتراكات", content: "عند انتهاء الاشتراك يتم تعليق الحساب مع الاحتفاظ بالبيانات 90 يوم." },
    { id: "4", title: "الاستخدام", content: "يُمنع استخدام المنصة لأغراض غير قانونية." },
    { id: "5", title: "المحفظة", content: "شحن المحفظة غير قابل للاسترداد بعد القبول." },
    { id: "6", title: "الصلاحيات", content: "كل شركة مسؤولة عن إدارة صلاحيات موظفيها." },
    { id: "7", title: "الخصوصية", content: "لا تشارك المنصة بيانات أي شركة مع طرف ثالث." },
    { id: "8", title: "التعليق", content: "يحق لمسؤول النظام تعليق أي حساب يخالف القوانين." },
    { id: "9", title: "التحديثات", content: "تحتفظ المنصة بحق تعديل القوانين مع إشعار المستخدمين." },
    { id: "10", title: "النزاعات", content: "يتم حل النزاعات وفق القانون الليبي." },
  ])));
  const [editingTerm, setEditingTerm] = useState<any>(null);
  const [newMessage, setNewMessage] = useState({ company: "", type: "إشعار عام", message: "" });

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

  const flatItems = sidebarSections.flatMap(s => s.items);
  const logout = () => { localStorage.removeItem("madar_user"); navigate("/"); };
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

  const savePlans = (p: any[]) => { setPlans(p); localStorage.setItem("madar_plans", JSON.stringify(p)); };
  const saveCoupons = (c: any[]) => { setCoupons(c); localStorage.setItem("madar_coupons", JSON.stringify(c)); };
  const saveProfile = (p: any) => { setProfile(p); localStorage.setItem("madar_admin_profile", JSON.stringify(p)); };
  const saveCurrency = (c: any) => { setCurrency(c); localStorage.setItem("madar_currency", JSON.stringify(c)); };
  const saveDelivery = (d: any) => { setDeliveryPrices(d); localStorage.setItem("madar_delivery_prices", JSON.stringify(d)); };
  const saveBranding = (b: any) => { setBranding(b); localStorage.setItem("madar_branding", JSON.stringify(b)); };
  const saveSettings = (s: any) => { setPlatformSettings(s); localStorage.setItem("madar_platform_settings", JSON.stringify(s)); };

  const reloadCompanies = () => setCompanies(JSON.parse(localStorage.getItem("madar_companies") || "[]"));
  const reloadWallet = () => setWalletRequests(JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]"));

  const updateWalletRequest = (id: string, status: string) => {
    const reqs = [...walletRequests];
    const idx = reqs.findIndex(r => r.id === id);
    if (idx >= 0) {
      reqs[idx] = { ...reqs[idx], status, updatedAt: new Date().toISOString() };
      if (status === "approved") {
        const req = reqs[idx];
        const comps = [...companies];
        const ci = comps.findIndex(c => c.id === req.companyId);
        if (ci >= 0) {
          comps[ci] = { ...comps[ci], wallet: (comps[ci].wallet || 0) + (Number(req.amount) || 0) };
          localStorage.setItem("madar_companies", JSON.stringify(comps));
          setCompanies(comps);
          // Send notification to company
          const compNotifs = JSON.parse(localStorage.getItem(`madar_notif_company_${req.companyId}`) || "[]");
          compNotifs.push({ id: Date.now().toString(), message: `تم قبول طلب شحن المحفظة بقيمة ${req.amount} د.ل`, date: new Date().toISOString(), read: false });
          localStorage.setItem(`madar_notif_company_${req.companyId}`, JSON.stringify(compNotifs));
        }
      }
      if (status === "received") {
        // Send notification to company to upload proof
        const req = reqs[idx];
        const compNotifs = JSON.parse(localStorage.getItem(`madar_notif_company_${req.companyId}`) || "[]");
        compNotifs.push({ id: Date.now().toString(), message: `الرجاء رفع إثبات التحويل أو استلام القيمة لشحن محفظتك. لا تشحن المحفظة بدون إثبات.`, date: new Date().toISOString(), read: false, type: "proof_required", requestId: id });
        localStorage.setItem(`madar_notif_company_${req.companyId}`, JSON.stringify(compNotifs));
      }
      localStorage.setItem("madar_wallet_requests", JSON.stringify(reqs));
      setWalletRequests(reqs);
      addAdminNotif(`تم تغيير حالة طلب شحن المحفظة إلى: ${status}`);
    }
  };

  const addAdminNotif = (message: string) => {
    const notif = { id: Date.now().toString(), message, date: new Date().toISOString(), read: false };
    const updated = [notif, ...adminNotifications];
    setAdminNotifications(updated);
    localStorage.setItem("madar_admin_notifs", JSON.stringify(updated));
  };

  const saveTerms = (t: any[]) => { setTerms(t); localStorage.setItem("madar_terms", JSON.stringify(t)); };
  const saveMessages = (m: any[]) => { setAdminMessages(m); localStorage.setItem("madar_admin_messages", JSON.stringify(m)); };

  const sendMessage = () => {
    if (!newMessage.message) return;
    const msg = { id: Date.now().toString(), ...newMessage, from: t("مسؤول النظام","System Admin"), date: new Date().toISOString() };
    saveMessages([msg, ...adminMessages]);
    // Notify targeted companies
    if (newMessage.company) {
      const compNotifs = JSON.parse(localStorage.getItem(`madar_notif_company_${newMessage.company}`) || "[]");
      compNotifs.push({ id: Date.now().toString(), message: `رسالة جديدة من مسؤول النظام: ${newMessage.message}`, date: new Date().toISOString(), read: false });
      localStorage.setItem(`madar_notif_company_${newMessage.company}`, JSON.stringify(compNotifs));
    } else {
      companies.forEach(c => {
        const compNotifs = JSON.parse(localStorage.getItem(`madar_notif_company_${c.id}`) || "[]");
        compNotifs.push({ id: Date.now().toString(), message: `رسالة جديدة من مسؤول النظام: ${newMessage.message}`, date: new Date().toISOString(), read: false });
        localStorage.setItem(`madar_notif_company_${c.id}`, JSON.stringify(compNotifs));
      });
    }
    setNewMessage({ company: "", type: "إشعار عام", message: "" });
    alert(t("تم إرسال الرسالة بنجاح!","Message sent successfully!"));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const logoData = ev.target?.result as string;
      saveBranding({ ...branding, logo: logoData });
    };
    reader.readAsDataURL(file);
  };

  const deleteWalletRequest = (id: string) => {
    const reqs = walletRequests.filter(r => r.id !== id);
    localStorage.setItem("madar_wallet_requests", JSON.stringify(reqs));
    setWalletRequests(reqs);
  };

  const clearWalletRequests = () => {
    localStorage.setItem("madar_wallet_requests", "[]");
    setWalletRequests([]);
  };

  const suspendCompany = (id: string) => {
    const comps = companies.map(c => c.id === id ? { ...c, status: c.status === "suspended" ? "active" : "suspended" } : c);
    localStorage.setItem("madar_companies", JSON.stringify(comps));
    setCompanies(comps);
  };

  const deleteCompany = (id: string) => {
    if (!confirm(t("هل أنت متأكد من حذف هذه الشركة؟ سيتم حذف جميع بياناتها نهائياً.", "Are you sure? All company data will be permanently deleted."))) return;
    const comps = companies.filter(c => c.id !== id);
    localStorage.setItem("madar_companies", JSON.stringify(comps));
    setCompanies(comps);
    // Clean up related data
    localStorage.removeItem(`madar_products_${id}`);
    localStorage.removeItem(`madar_suppliers_${id}`);
    localStorage.removeItem(`madar_movements_${id}`);
    localStorage.removeItem(`madar_employees_${id}`);
    const users = JSON.parse(localStorage.getItem("madar_users") || "[]").filter((u: any) => u.companyId !== id);
    localStorage.setItem("madar_users", JSON.stringify(users));
  };

  const grantPlan = (companyId: string, planId: string) => {
    const plan = plans.find((p: any) => p.id === planId);
    if (!plan) return;
    const comps = companies.map(c => c.id === companyId ? { ...c, plan: planId, planName: plan.name, status: "active" } : c);
    localStorage.setItem("madar_companies", JSON.stringify(comps));
    setCompanies(comps);
    setGrantPlanModal(null);
  };

  const revokePlan = (companyId: string, reason: string) => {
    const comps = companies.map(c => c.id === companyId ? { ...c, plan: "trial", planName: "تجربة مجانية", status: "suspended", revokeReason: reason } : c);
    localStorage.setItem("madar_companies", JSON.stringify(comps));
    setCompanies(comps);
    setRevokePlanModal(null);
  };

  const allUsers = JSON.parse(localStorage.getItem("madar_users") || "[]");
  const totalRevenue = companies.reduce((a: number, c: any) => a + (c.totalPaid || 0), 0);

  const stats = [
    { label: t("الشركات المسجلة","Registered Companies"), value: companies.length, icon: Building2 },
    { label: t("المستخدمين","Users"), value: allUsers.length, icon: Users },
    { label: t("الاشتراكات الفعالة","Active Subscriptions"), value: companies.filter(c => c.status === "active").length, icon: CheckCircle },
    { label: t("إجمالي الأرباح","Total Revenue"), value: `${totalRevenue} ${t("د.ل","LYD")}`, icon: DollarSign },
    { label: t("طلبات الشحن المعلقة","Pending Requests"), value: walletRequests.filter(r => r.status === "pending").length, icon: CreditCard },
    { label: t("الحسابات المعلقة","Suspended Accounts"), value: companies.filter(c => c.status === "suspended").length, icon: Ban },
  ];

  const filteredCompanies = companies.filter(c => 
    !searchCompany || c.companyName?.includes(searchCompany) || c.email?.includes(searchCompany)
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 ${lang === "ar" ? "right-0 border-l" : "left-0 border-r"} w-64 bg-card border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">{branding.name || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">{t("مسؤول النظام","System Admin")}</p>
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
            <LogOut className="h-4 w-4" /> {t("تسجيل الخروج","Logout")}
          </button>
        </div>
      </aside>

      <main className={`flex-1 ${lang === "ar" ? "md:mr-64" : "md:ml-64"}`}>
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{lang === "ar" ? flatItems.find(s => s.key === activeTab)?.label : flatItems.find(s => s.key === activeTab)?.labelEn}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-xl hover:bg-secondary transition-all">
              {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => setLang(lang === "ar" ? "en" : "ar")} className="p-2 rounded-xl hover:bg-secondary transition-all">
              <Globe className="h-4 w-4 text-foreground" />
            </button>
            <Bell className="h-5 w-5 text-muted-foreground" />
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
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">{t("آخر الشركات المسجلة","Recent Companies")}</h3>
                  <button onClick={() => exportToPDF(t("الشركات المسجلة","Registered Companies"), companies.map(c => ({ name: c.companyName, manager: c.managerName, plan: c.planName, status: c.status === "suspended" ? "معلّق" : "نشط" })), [t("الشركة","Company"),t("المسؤول","Manager"),t("الباقة","Plan"),t("الحالة","Status")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
                {companies.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد شركات مسجلة بعد.","No companies registered yet.")}</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t("الشركة","Company")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t("المسؤول","Manager")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t("الباقة","Plan")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">{t("الحالة","Status")}</th>
                      </tr></thead>
                      <tbody>
                        {companies.slice(0, 10).map((c: any) => (
                          <tr key={c.id} className="border-b border-border/30">
                            <td className="py-2 px-3 text-foreground">{c.companyName}</td>
                            <td className="py-2 px-3 text-muted-foreground">{c.managerName}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.planName}</span></td>
                            <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? t("معلّق","Suspended") : t("نشط","Active")}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Monitoring */}
          {activeTab === "monitoring" && (
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">{t("مراقبة جميع المستخدمين والشركات والباقات والاشتراكات في الوقت الفعلي.","Monitor all users, companies, plans and subscriptions in real-time.")}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-primary">{companies.length}</p><p className="text-xs text-muted-foreground">{t("شركة مسجلة","Registered")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-success">{companies.filter(c => c.status === "active").length}</p><p className="text-xs text-muted-foreground">{t("اشتراك فعال","Active")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-warning">{companies.filter(c => c.plan === "trial").length}</p><p className="text-xs text-muted-foreground">{t("فترة تجريبية","Trial")}</p></div>
                <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-destructive">{companies.filter(c => c.status === "suspended").length}</p><p className="text-xs text-muted-foreground">{t("حسابات معلّقة","Suspended")}</p></div>
              </div>
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">{t("تفاصيل الاشتراكات","Subscription Details")}</h3>
                  <button onClick={() => exportToPDF(t("تفاصيل الاشتراكات","Subscriptions"), companies.map(c => ({ name: c.companyName, plan: c.planName, date: new Date(c.createdAt).toLocaleDateString("ar-LY"), wallet: `${c.wallet || 0}`, status: c.status === "suspended" ? "معلّق" : "نشط" })), [t("الشركة","Company"),t("الباقة","Plan"),t("التسجيل","Registered"),t("المحفظة","Wallet"),t("الحالة","Status")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
                {companies.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد شركات.","No companies.")}</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الشركة","Company")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الباقة","Plan")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("تاريخ التسجيل","Registered")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("المحفظة","Wallet")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة","Status")}</th>
                      </tr></thead>
                      <tbody>
                        {companies.map((c: any) => (
                          <tr key={c.id} className="border-b border-border/30">
                            <td className="py-2 px-3 text-foreground font-medium">{c.companyName}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.planName}</span></td>
                            <td className="py-2 px-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("ar-LY")}</td>
                            <td className="py-2 px-3 text-foreground">{c.wallet || 0} {t("د.ل","LYD")}</td>
                            <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? t("معلّق","Suspended") : t("نشط","Active")}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Companies */}
          {activeTab === "companies" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
                  <h3 className="font-bold text-foreground">{t("جميع الشركات","All Companies")} ({companies.length})</h3>
                  <div className="flex gap-2 flex-wrap">
                    <div className="relative">
                      <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input value={searchCompany} onChange={e => setSearchCompany(e.target.value)} placeholder={t("بحث...","Search...")} className="pr-9 pl-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm w-48" />
                    </div>
                    <button onClick={() => exportToPDF(t("الشركات","Companies"), companies.map(c => ({ name: c.companyName, email: c.email, city: c.city, plan: c.planName, wallet: `${c.wallet||0}`, status: c.status })), [t("الشركة","Company"),t("البريد","Email"),t("المدينة","City"),t("الباقة","Plan"),t("المحفظة","Wallet"),t("الحالة","Status")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  </div>
                </div>
                {filteredCompanies.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد شركات مسجلة.","No companies.")}</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الشركة","Company")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("البريد","Email")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الباقة","Plan")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("المحفظة","Wallet")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة","Status")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الإجراءات","Actions")}</th>
                      </tr></thead>
                      <tbody>
                        {filteredCompanies.map((c: any) => (
                          <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/30">
                            <td className="py-2 px-3 text-foreground font-medium">{c.companyName}</td>
                            <td className="py-2 px-3 text-muted-foreground text-xs">{c.email}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.planName}</span></td>
                            <td className="py-2 px-3 text-foreground">{c.wallet || 0} {t("د.ل","LYD")}</td>
                            <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? t("معلّق","Suspended") : t("نشط","Active")}</span></td>
                            <td className="py-2 px-3">
                              <div className="flex gap-1 flex-wrap">
                                <button onClick={() => suspendCompany(c.id)} className={`text-xs px-2 py-1 rounded-lg ${c.status === "suspended" ? "bg-success/20 text-success" : "bg-warning/20 text-warning"}`}>
                                  {c.status === "suspended" ? t("تفعيل","Activate") : t("تعليق","Suspend")}
                                </button>
                                <button onClick={() => setGrantPlanModal(c)} className="text-xs px-2 py-1 rounded-lg bg-primary/20 text-primary">{t("منح باقة","Grant Plan")}</button>
                                <button onClick={() => setRevokePlanModal(c)} className="text-xs px-2 py-1 rounded-lg bg-warning/20 text-warning">{t("سحب باقة","Revoke")}</button>
                                <button onClick={() => deleteCompany(c.id)} className="text-xs px-2 py-1 rounded-lg bg-destructive/20 text-destructive">{t("حذف","Delete")}</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Grant Plan Modal */}
              {grantPlanModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="glass rounded-2xl p-6 max-w-md w-full">
                    <h3 className="font-bold text-foreground mb-4">{t("منح باقة لـ","Grant plan to")} {grantPlanModal.companyName}</h3>
                    <div className="space-y-2">
                      {plans.filter((p: any) => p.active).map((p: any) => (
                        <button key={p.id} onClick={() => grantPlan(grantPlanModal.id, p.id)} className="w-full glass rounded-xl p-3 text-right hover:border-primary/50 transition-all flex justify-between items-center">
                          <span className="font-bold text-foreground text-sm">{p.name}</span>
                          <span className="text-primary text-sm">{p.price} {t("د.ل","LYD")}/{p.period}</span>
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setGrantPlanModal(null)} className="mt-4 w-full px-4 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </div>
              )}

              {/* Revoke Plan Modal */}
              {revokePlanModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); revokePlan(revokePlanModal.id, fd.get("reason") as string); }} className="glass rounded-2xl p-6 max-w-md w-full">
                    <h3 className="font-bold text-foreground mb-4">{t("سحب باقة من","Revoke plan from")} {revokePlanModal.companyName}</h3>
                    <textarea name="reason" required placeholder={t("سبب السحب...","Reason for revoking...")} rows={3} className={inputClass} />
                    <div className="flex gap-2 mt-4">
                      <button type="submit" className="px-6 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-bold">{t("سحب","Revoke")}</button>
                      <button type="button" onClick={() => setRevokePlanModal(null)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
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
                <h3 className="font-bold text-foreground">{t("إدارة الباقات","Manage Plans")}</h3>
                <button onClick={() => setEditingPlan({ id: Date.now().toString(), name: "", price: 0, period: "شهر", users: 5, stores: 1, products: 500, features: [], active: true })}
                  className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة باقة","Add Plan")}</button>
              </div>
              <p className="text-sm text-muted-foreground">{t("يمكنك إنشاء وتعديل وتغيير الباقات بالكامل مع التحكم في عدد المستخدمين والمخازن والمنتجات والمميزات.","Create, edit and manage plans with full control over users, stores, products and features.")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((p: any) => (
                  <div key={p.id} className={`glass rounded-2xl p-5 ${!p.active ? "opacity-50" : ""}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-foreground">{p.name}</h4>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingPlan({...p})} className="text-primary"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => { const up = plans.map((pl: any) => pl.id === p.id ? {...pl, active: !pl.active} : pl); savePlans(up); }} className="text-warning">
                          {p.active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button onClick={() => savePlans(plans.filter((pl: any) => pl.id !== p.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <p className="text-2xl font-black text-primary">{p.price} <span className="text-xs text-muted-foreground">{t("د.ل","LYD")} / {p.period}</span></p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p>👥 {t("المستخدمين","Users")}: {p.users}</p>
                      <p>🏪 {t("المخازن","Stores")}: {p.stores}</p>
                      <p>📦 {t("المنتجات","Products")}: {p.products === 999999 ? t("غير محدود","Unlimited") : p.products}</p>
                      <p>📱 {t("الأجهزة","Devices")}: {p.devices || 1}</p>
                    </div>
                    {p.features?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">{p.features.map((f: string, i: number) => <span key={i} className="px-2 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary">{f}</span>)}</div>
                    )}
                  </div>
                ))}
              </div>
              {editingPlan && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-4">{editingPlan.name ? t("تعديل الباقة","Edit Plan") : t("إنشاء باقة جديدة","Create New Plan")}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="text-sm font-bold text-foreground">{t("اسم الباقة","Plan Name")}</label><input value={editingPlan.name} onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("السعر (د.ل)","Price (LYD)")}</label><input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({...editingPlan, price: +e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("المدة","Period")}</label><select value={editingPlan.period} onChange={(e) => setEditingPlan({...editingPlan, period: e.target.value})} className={inputClass}><option>أسبوع</option><option>شهر</option><option>سنة</option></select></div>
                    <div><label className="text-sm font-bold text-foreground">{t("عدد المستخدمين","Users")}</label><input type="number" value={editingPlan.users} onChange={(e) => setEditingPlan({...editingPlan, users: +e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("عدد المخازن","Stores")}</label><input type="number" value={editingPlan.stores} onChange={(e) => setEditingPlan({...editingPlan, stores: +e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("عدد المنتجات","Products")}</label><input type="number" value={editingPlan.products} onChange={(e) => setEditingPlan({...editingPlan, products: +e.target.value})} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("عدد الأجهزة","Devices")}</label><input type="number" value={editingPlan.devices || 1} onChange={(e) => setEditingPlan({...editingPlan, devices: +e.target.value})} className={inputClass} /></div>
                  </div>
                  <div className="mt-3">
                    <label className="text-sm font-bold text-foreground">{t("المميزات (فاصلة بين كل ميزة)","Features (comma-separated)")}</label>
                    <input value={editingPlan.features?.join(",") || ""} onChange={(e) => setEditingPlan({...editingPlan, features: e.target.value.split(",").map((f: string) => f.trim()).filter(Boolean)})} className={inputClass} placeholder={t("إدارة المنتجات, حركة المخزون, ...","Product management, Stock tracking, ...")} />
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { const exists = plans.findIndex((p: any) => p.id === editingPlan.id); if (exists >= 0) { const up = [...plans]; up[exists] = editingPlan; savePlans(up); } else { savePlans([...plans, editingPlan]); } setEditingPlan(null); }}
                      className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    <button onClick={() => setEditingPlan(null)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Currencies */}
          {activeTab === "currencies" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">{t("إدارة العملات","Currency Management")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("حدد العملة الأساسية والثانوية وسعر الصرف. العملة الأساسية تظهر بشكل واضح والثانوية تحتها.","Set primary and secondary currencies and exchange rate.")}</p>
              <div className="space-y-4">
                <div><label className="block text-sm font-bold text-foreground mb-1">{t("العملة الأساسية","Primary Currency")}</label>
                  <select value={currency.primary} onChange={(e) => saveCurrency({...currency, primary: e.target.value})} className={inputClass}>
                    <option value="LYD">{t("دينار ليبي (د.ل)","Libyan Dinar (LYD)")}</option>
                    <option value="USD">{t("دولار أمريكي ($)","US Dollar ($)")}</option>
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-foreground mb-1">{t("العملة الثانوية","Secondary Currency")}</label>
                  <select value={currency.secondary} onChange={(e) => saveCurrency({...currency, secondary: e.target.value})} className={inputClass}>
                    <option value="USD">{t("دولار أمريكي ($)","US Dollar ($)")}</option>
                    <option value="LYD">{t("دينار ليبي (د.ل)","Libyan Dinar (LYD)")}</option>
                  </select>
                </div>
                <div><label className="block text-sm font-bold text-foreground mb-1">{t("سعر الصرف","Exchange Rate")}</label>
                  <input type="number" step="0.01" value={currency.rate} onChange={(e) => saveCurrency({...currency, rate: +e.target.value})} className={inputClass} />
                  <p className="text-xs text-muted-foreground mt-1">1 {currency.primary === "LYD" ? t("دينار","Dinar") : t("دولار","Dollar")} = {currency.rate} {currency.secondary === "USD" ? t("دولار","Dollar") : t("دينار","Dinar")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Coupons */}
          {activeTab === "coupons" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("إنشاء كوبون جديد","Create New Coupon")}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t("قم بإنشاء كوبونات خصم للعملاء مع تحديد القيمة والصلاحية وعدد الاستخدامات.","Create discount coupons with value, validity and usage limits.")}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-sm font-bold text-foreground">{t("كود الكوبون","Coupon Code")}</label><input value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})} placeholder="MADAR50" className={inputClass} /></div>
                  <div><label className="text-sm font-bold text-foreground">{t("القيمة","Value")}</label><input type="number" value={newCoupon.value} onChange={(e) => setNewCoupon({...newCoupon, value: +e.target.value})} className={inputClass} /></div>
                  <div><label className="text-sm font-bold text-foreground">{t("النوع","Type")}</label><select value={newCoupon.type} onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})} className={inputClass}><option value="percent">{t("نسبة مئوية %","Percentage %")}</option><option value="fixed">{t("مبلغ ثابت","Fixed Amount")}</option></select></div>
                  <div><label className="text-sm font-bold text-foreground">{t("عدد الاستخدامات","Max Uses")}</label><input type="number" value={newCoupon.maxUses} onChange={(e) => setNewCoupon({...newCoupon, maxUses: +e.target.value})} className={inputClass} /></div>
                  <div><label className="text-sm font-bold text-foreground">{t("تاريخ الانتهاء","Expiry Date")}</label><input type="date" value={newCoupon.expiresAt} onChange={(e) => setNewCoupon({...newCoupon, expiresAt: e.target.value})} className={inputClass} /></div>
                </div>
                <button onClick={() => { if (!newCoupon.code) return; saveCoupons([...coupons, { ...newCoupon, id: Date.now().toString(), uses: 0 }]); setNewCoupon({ code: "", value: 0, type: "percent", maxUses: 10, expiresAt: "" }); }}
                  className="mt-4 px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إنشاء الكوبون","Create Coupon")}</button>
              </div>
              {coupons.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-foreground">{t("الكوبونات","Coupons")} ({coupons.length})</h3>
                    <button onClick={() => exportToPDF(t("الكوبونات","Coupons"), coupons.map((c: any) => ({ code: c.code, value: `${c.value}${c.type==="percent"?"%":" د.ل"}`, uses: `${c.uses||0}/${c.maxUses}`, expires: c.expiresAt || "-" })), [t("الكود","Code"),t("القيمة","Value"),t("الاستخدام","Usage"),t("الانتهاء","Expires")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  </div>
                  <div className="space-y-2">
                    {coupons.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between glass rounded-xl p-3">
                        <div>
                          <span className="font-bold text-primary text-sm">{c.code}</span>
                          <span className="text-xs text-muted-foreground mr-2">- {t("خصم","Discount")} {c.value}{c.type === "percent" ? "%" : ` ${t("د.ل","LYD")}`}</span>
                          <span className="text-xs text-muted-foreground">({c.uses || 0}/{c.maxUses})</span>
                        </div>
                        <button onClick={() => saveCoupons(coupons.filter((cp: any) => cp.id !== c.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wallet Requests - Full Status Flow */}
          {activeTab === "wallet-requests" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
                <h3 className="font-bold text-foreground">{t("طلبات شحن المحافظ","Wallet Requests")}</h3>
                <div className="flex gap-2">
                  <button onClick={() => exportToPDF(t("طلبات الشحن","Wallet Requests"), walletRequests.map(r => ({ company: r.companyName, amount: `${r.amount}`, method: r.method, status: r.status, date: new Date(r.date).toLocaleDateString("ar-LY") })), [t("الشركة","Company"),t("المبلغ","Amount"),t("الطريقة","Method"),t("الحالة","Status"),t("التاريخ","Date")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  {walletRequests.length > 0 && <button onClick={clearWalletRequests} className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs flex items-center gap-1"><Trash2 className="h-3 w-3" /> {t("تصفير","Clear All")}</button>}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{t("يمكنك تغيير حالة كل طلب: معلّق → قيد التنفيذ → إرسال مندوب → استلام → قبول/رفض.","Change status: Pending → Processing → Rep Sent → Received → Approved/Rejected.")}</p>
              {walletRequests.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد طلبات.","No requests.")}</p> : (
                <div className="space-y-4">
                  {walletRequests.map((r: any) => {
                    const statusFlow = ["pending","processing","sent_rep","received","approved"];
                    const statusLabels: Record<string,string> = { pending: t("معلّق","Pending"), processing: t("قيد التنفيذ","Processing"), sent_rep: t("إرسال مندوب","Rep Sent"), received: t("تم الاستلام","Received"), approved: t("مقبول","Approved"), rejected: t("مرفوض","Rejected") };
                    const statusColors: Record<string,string> = { pending: "bg-warning/20 text-warning", processing: "bg-info/20 text-info", sent_rep: "bg-primary/20 text-primary", received: "bg-accent/20 text-accent", approved: "bg-success/20 text-success", rejected: "bg-destructive/20 text-destructive" };
                    const currentIdx = statusFlow.indexOf(r.status);
                    return (
                      <div key={r.id} className="glass rounded-xl p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-3 mb-3">
                          <div>
                            <p className="text-sm font-bold text-foreground">{r.companyName}</p>
                            <p className="text-xs text-muted-foreground">{r.method} - {r.amount} {t("د.ل","LYD")} - {new Date(r.date).toLocaleDateString("ar-LY")}</p>
                            {r.proofImage && <p className="text-xs text-success mt-1">✅ {t("تم رفع إثبات التحويل","Proof uploaded")}</p>}
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs self-start ${statusColors[r.status] || statusColors.pending}`}>{statusLabels[r.status] || r.status}</span>
                        </div>
                        {/* Status progress bar */}
                        <div className="flex items-center gap-1 mb-2">
                          {statusFlow.map((s, i) => (
                            <div key={s} className="flex items-center gap-1 flex-1">
                              <div className={`w-2.5 h-2.5 rounded-full ${i <= currentIdx ? "bg-primary" : "bg-muted"}`} />
                              {i < statusFlow.length - 1 && <div className={`h-0.5 flex-1 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />}
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground mb-3">
                          <span>{t("معلّق","Pending")}</span><span>{t("تنفيذ","Process")}</span><span>{t("مندوب","Rep")}</span><span>{t("استلام","Recv")}</span><span>{t("مقبول","OK")}</span>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {r.status !== "approved" && r.status !== "rejected" && (
                            <>
                              {r.status === "pending" && <button onClick={() => updateWalletRequest(r.id, "processing")} className="text-xs px-3 py-1.5 rounded-lg bg-info/20 text-info">{t("قيد التنفيذ","Processing")}</button>}
                              {r.status === "processing" && <button onClick={() => updateWalletRequest(r.id, "sent_rep")} className="text-xs px-3 py-1.5 rounded-lg bg-primary/20 text-primary">{t("إرسال مندوب","Send Rep")}</button>}
                              {r.status === "sent_rep" && <button onClick={() => updateWalletRequest(r.id, "received")} className="text-xs px-3 py-1.5 rounded-lg bg-accent/20 text-accent">{t("تم الاستلام","Received")}</button>}
                              {r.status === "received" && <button onClick={() => updateWalletRequest(r.id, "approved")} className="text-xs px-3 py-1.5 rounded-lg bg-success/20 text-success">{t("قبول وشحن المحفظة","Approve & Charge")}</button>}
                              <button onClick={() => updateWalletRequest(r.id, "rejected")} className="text-xs px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive">{t("رفض","Reject")}</button>
                            </>
                          )}
                          <button onClick={() => deleteWalletRequest(r.id)} className="text-xs px-2 py-1.5 rounded-lg bg-destructive/10 text-destructive"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Delivery Prices */}
          {activeTab === "delivery" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("أسعار التوصيل حسب المدن الليبية","Delivery Prices by Libyan Cities")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("حدد سعر التوصيل لكل مدينة. يظهر للعميل عند اختيار الدفع كاش.","Set delivery prices per city. Shown to clients when choosing cash payment.")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {libyanCities.map(city => (
                    <div key={city} className="flex items-center gap-2 glass rounded-xl p-3">
                      <span className="text-sm text-foreground font-medium flex-1">{city}</span>
                      <input type="number" value={deliveryPrices[city] || 0} onChange={(e) => saveDelivery({...deliveryPrices, [city]: +e.target.value})}
                        className="w-20 px-2 py-1 rounded-lg bg-secondary border border-border text-foreground text-sm text-center" />
                      <span className="text-xs text-muted-foreground">{t("د.ل","LYD")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Revenue */}
          {activeTab === "revenue" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">{t("أرباح المنصة","Platform Revenue")}</h3>
                  <button onClick={() => exportSimplePDF(t("أرباح المنصة","Platform Revenue"), `
                    <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">اليوم</td><td style="padding:10px;border:1px solid #e5e7eb;">0 د.ل</td></tr>
                    <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">هذا الأسبوع</td><td style="padding:10px;border:1px solid #e5e7eb;">0 د.ل</td></tr>
                    <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">هذا الشهر</td><td style="padding:10px;border:1px solid #e5e7eb;">0 د.ل</td></tr>
                    <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">هذه السنة</td><td style="padding:10px;border:1px solid #e5e7eb;">${totalRevenue} د.ل</td></tr>
                    <tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">الإجمالي</td><td style="padding:10px;border:1px solid #e5e7eb;color:#2563eb;font-weight:bold;">${totalRevenue} د.ل</td></tr>
                    </table>
                  `)} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><Download className="h-4 w-4" /> {t("تحميل PDF","Download PDF")}</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("اليوم","Today")}</p><p className="text-xl font-black text-primary">0 {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("هذا الأسبوع","This Week")}</p><p className="text-xl font-black text-primary">0 {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("هذا الشهر","This Month")}</p><p className="text-xl font-black text-primary">0 {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("هذه السنة","This Year")}</p><p className="text-xl font-black text-primary">{totalRevenue} {t("د.ل","LYD")}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Status - Expanded */}
          {activeTab === "status" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("حالة المنصة والصيانة","Platform Status & Maintenance")}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="glass rounded-xl p-4 text-center"><div className="w-3 h-3 rounded-full bg-success mx-auto mb-2" /><p className="text-sm text-foreground font-bold">{t("المنصة تعمل","Online")}</p><p className="text-xs text-muted-foreground">{t("جميع الخدمات متاحة","All services available")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><Activity className="h-6 w-6 text-primary mx-auto mb-2" /><p className="text-sm text-foreground font-bold">{t("الأداء","Performance")}</p><p className="text-xs text-muted-foreground">{t("ممتاز","Excellent")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><Clock className="h-6 w-6 text-warning mx-auto mb-2" /><p className="text-sm text-foreground font-bold">{t("آخر تحديث","Last Update")}</p><p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("ar-LY")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><Users className="h-6 w-6 text-primary mx-auto mb-2" /><p className="text-sm text-foreground font-bold">{t("المتصلين","Connected")}</p><p className="text-xs text-muted-foreground">{companies.filter(c => c.status === "active").length} {t("شركة","companies")}</p></div>
                </div>

                {/* Storage & Capacity */}
                <div className="glass rounded-xl p-4 mb-4">
                  <h4 className="font-bold text-foreground text-sm mb-3">{t("السعة والتخزين","Storage & Capacity")}</h4>
                  <div className="space-y-3">
                    {[
                      { label: t("التخزين المستخدم","Storage Used"), value: `${((JSON.stringify(localStorage).length / 1024 / 1024) * 100).toFixed(1)}%`, used: JSON.stringify(localStorage).length / 1024, max: 5120 },
                      { label: t("الذاكرة","Memory"), value: "45%", used: 45, max: 100 },
                      { label: t("تحمل الطلبات","Request Load"), value: `${walletRequests.length + companies.length}`, used: walletRequests.length + companies.length, max: 1000 },
                    ].map(item => (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">{item.label}</span><span className="text-foreground font-bold">{item.value}</span></div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min((item.used / item.max) * 100, 100)}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass rounded-xl p-4 mb-4">
                  <h4 className="font-bold text-foreground text-sm mb-2">{t("معلومات النظام","System Info")}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-muted-foreground">
                    <div><span className="font-bold text-foreground">{t("الإصدار","Version")}:</span> 2.0.0</div>
                    <div><span className="font-bold text-foreground">{t("الشركات","Companies")}:</span> {companies.length}</div>
                    <div><span className="font-bold text-foreground">{t("المستخدمين","Users")}:</span> {allUsers.length}</div>
                    <div><span className="font-bold text-foreground">{t("الطلبات","Requests")}:</span> {walletRequests.length}</div>
                    <div><span className="font-bold text-foreground">{t("حجم البيانات","Data Size")}:</span> {(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</div>
                    <div><span className="font-bold text-foreground">{t("الإشعارات","Notifications")}:</span> {adminNotifications.length}</div>
                    <div><span className="font-bold text-foreground">{t("الرسائل","Messages")}:</span> {adminMessages.length}</div>
                    <div><span className="font-bold text-foreground">{t("الكوبونات","Coupons")}:</span> {coupons.length}</div>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { alert(t("تمت إعادة التشغيل بنجاح!","Restart successful!")); addAdminNotif(t("تم إعادة تشغيل المنصة","Platform restarted")); }} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><RefreshCw className="h-4 w-4" /> {t("إعادة تشغيل","Restart")}</button>
                  <button onClick={() => { localStorage.removeItem("madar_fraud_logs"); setFraudLogs([]); alert(t("تم تنظيف الذاكرة!","Cache cleared!")); addAdminNotif(t("تم تنظيف ذاكرة المنصة","Platform cache cleared")); }} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><Trash2 className="h-4 w-4" /> {t("تنظيف الذاكرة","Clear Cache")}</button>
                  <button onClick={() => exportSimplePDF(t("تقرير حالة المنصة","Platform Status Report"), `<p>حالة المنصة: تعمل</p><p>الشركات: ${companies.length}</p><p>المستخدمين: ${allUsers.length}</p><p>الطلبات: ${walletRequests.length}</p><p>حجم البيانات: ${(JSON.stringify(localStorage).length / 1024).toFixed(1)} KB</p>`)} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><Download className="h-4 w-4" /> PDF</button>
                </div>
              </div>
            </div>
          )}

          {/* Fraud Detection */}
          {activeTab === "fraud" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">{t("كشف التلاعب والاحتيال","Fraud Detection")}</h3>
                {fraudLogs.length > 0 && <button onClick={() => { localStorage.setItem("madar_fraud_logs", "[]"); setFraudLogs([]); }} className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs">{t("حذف الكل","Clear All")}</button>}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{t("مراقبة العمليات المشبوهة ورصد أي محاولات تلاعب أو احتيال في المنصة.","Monitor suspicious operations and detect fraud attempts.")}</p>
              {fraudLogs.length === 0 ? (
                <div className="glass rounded-xl p-6 text-center">
                  <Shield className="h-12 w-12 text-success mx-auto mb-3" />
                  <p className="text-foreground font-bold">{t("لا توجد عمليات مشبوهة","No suspicious operations")}</p>
                  <p className="text-xs text-muted-foreground">{t("جميع العمليات طبيعية","All operations normal")}</p>
                </div>
              ) : (
                <div className="space-y-2">{fraudLogs.map((log: any, i: number) => (
                  <div key={i} className="glass rounded-xl p-3 flex justify-between items-center">
                    <div><p className="text-sm text-foreground">{log.message}</p><p className="text-xs text-muted-foreground">{log.date}</p></div>
                    <AlertTriangle className="h-5 w-5 text-warning" />
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Terms & Conditions - CRUD */}
          {activeTab === "terms" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">{t("لوائح وقوانين المنصة","Terms & Conditions")}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingTerm({ id: "", title: "", content: "" })} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة","Add")}</button>
                    <button onClick={() => exportSimplePDF(t("لوائح المنصة","Terms"), terms.map((t: any) => `<h4>${t.title}</h4><p>${t.content}</p>`).join(""))} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{t("هذه اللوائح تضمن حق المنصة وحق العميل. يتم إعلام الشركات عند أي تعديل.","These terms ensure rights. Companies are notified on changes.")}</p>

                {editingTerm && (
                  <div className="glass rounded-xl p-4 mb-4 space-y-3">
                    <input value={editingTerm.title} onChange={e => setEditingTerm({...editingTerm, title: e.target.value})} placeholder={t("عنوان اللائحة","Term Title")} className={inputClass} />
                    <textarea value={editingTerm.content} onChange={e => setEditingTerm({...editingTerm, content: e.target.value})} placeholder={t("محتوى اللائحة","Term Content")} rows={3} className={inputClass} />
                    <div className="flex gap-2">
                      <button onClick={() => {
                        if (!editingTerm.title) return;
                        if (editingTerm.id) {
                          saveTerms(terms.map(t => t.id === editingTerm.id ? editingTerm : t));
                        } else {
                          saveTerms([...terms, { ...editingTerm, id: Date.now().toString() }]);
                        }
                        // Notify companies
                        companies.forEach(c => {
                          const notifs = JSON.parse(localStorage.getItem(`madar_notif_company_${c.id}`) || "[]");
                          notifs.push({ id: Date.now().toString(), message: `تم تحديث لوائح وقوانين المنصة: ${editingTerm.title}`, date: new Date().toISOString(), read: false });
                          localStorage.setItem(`madar_notif_company_${c.id}`, JSON.stringify(notifs));
                        });
                        setEditingTerm(null);
                      }} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                      <button onClick={() => setEditingTerm(null)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {terms.map((term: any, i: number) => (
                    <div key={term.id} className="glass rounded-xl p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-foreground">{i + 1}. {term.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{term.content}</p>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <button onClick={() => setEditingTerm({...term})} className="text-primary"><Edit className="h-4 w-4" /></button>
                          <button onClick={() => saveTerms(terms.filter(t => t.id !== term.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Messages - Persistent */}
          {activeTab === "messages" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("المراسلات","Messages")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("إرسال رسائل للشركات. الرسائل محفوظة ويمكن للشركات الرد عليها.","Send messages to companies. Messages are saved and companies can reply.")}</p>
                <div className="space-y-3">
                  <div><label className="text-sm font-bold text-foreground">{t("اختر الشركة","Select Company")}</label>
                    <select value={newMessage.company} onChange={e => setNewMessage({...newMessage, company: e.target.value})} className={inputClass}><option value="">{t("جميع الشركات","All Companies")}</option>{companies.map((c: any) => <option key={c.id} value={c.id}>{c.companyName}</option>)}</select>
                  </div>
                  <div><label className="text-sm font-bold text-foreground">{t("نوع الرسالة","Message Type")}</label>
                    <select value={newMessage.type} onChange={e => setNewMessage({...newMessage, type: e.target.value})} className={inputClass}><option>{t("إشعار عام","General Notice")}</option><option>{t("تحذير","Warning")}</option><option>{t("تهنئة","Congratulation")}</option><option>{t("تذكير بالدفع","Payment Reminder")}</option></select>
                  </div>
                  <div><label className="text-sm font-bold text-foreground">{t("الرسالة","Message")}</label><textarea value={newMessage.message} onChange={e => setNewMessage({...newMessage, message: e.target.value})} rows={3} className={inputClass} placeholder={t("اكتب رسالتك هنا...","Write your message here...")} /></div>
                  <button onClick={sendMessage} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Send className="h-4 w-4" /> {t("إرسال","Send")}</button>
                </div>
              </div>
              {/* Received messages from companies */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("الرسائل المرسلة والمستلمة","Sent & Received Messages")}</h3>
                {adminMessages.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد رسائل.","No messages.")}</p> : (
                  <div className="space-y-2">{adminMessages.map((m: any) => (
                    <div key={m.id} className="glass rounded-xl p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] ${m.type === "تحذير" || m.type === "Warning" ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>{m.type}</span>
                          <span className="text-xs text-muted-foreground mr-2">{m.from === t("مسؤول النظام","System Admin") ? `→ ${m.company ? companies.find(c => c.id === m.company)?.companyName || t("الكل","All") : t("الكل","All")}` : `← ${m.from}`}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-muted-foreground">{m.date ? new Date(m.date).toLocaleDateString("ar-LY") : ""}</span>
                          <button onClick={() => saveMessages(adminMessages.filter(msg => msg.id !== m.id))} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground mt-1">{m.message}</p>
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
                <h3 className="font-bold text-foreground">{t("الإشعارات","Notifications")} ({adminNotifications.filter(n => !n.read).length} {t("جديد","new")})</h3>
                <div className="flex gap-2">
                  {adminNotifications.length > 0 && (
                    <>
                      <button onClick={() => { const updated = adminNotifications.map(n => ({...n, read: true})); setAdminNotifications(updated); localStorage.setItem("madar_admin_notifs", JSON.stringify(updated)); }} className="text-xs text-primary hover:underline">{t("تعيين الكل كمقروء","Mark all read")}</button>
                      <button onClick={() => { setAdminNotifications([]); localStorage.setItem("madar_admin_notifs", "[]"); }} className="text-xs text-destructive hover:underline">{t("حذف الكل","Delete all")}</button>
                    </>
                  )}
                </div>
              </div>
              {adminNotifications.length === 0 ? (
                <div className="glass rounded-2xl p-6 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">{t("لا توجد إشعارات جديدة","No new notifications")}</p>
                </div>
              ) : (
                <div className="space-y-2">{adminNotifications.map((n: any) => (
                  <div key={n.id} onClick={() => { const updated = adminNotifications.map(nn => nn.id === n.id ? {...nn, read: true} : nn); setAdminNotifications(updated); localStorage.setItem("madar_admin_notifs", JSON.stringify(updated)); }} className={`glass rounded-xl p-4 cursor-pointer transition-all ${!n.read ? "border-primary/30" : ""}`}>
                    <div className="flex justify-between items-start">
                      <p className={`text-sm ${!n.read ? "font-bold text-foreground" : "text-muted-foreground"}`}>{n.message}</p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary" />}
                        <button onClick={(e) => { e.stopPropagation(); const updated = adminNotifications.filter(nn => nn.id !== n.id); setAdminNotifications(updated); localStorage.setItem("madar_admin_notifs", JSON.stringify(updated)); }} className="text-destructive"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{n.date ? new Date(n.date).toLocaleDateString("ar-LY") + " " + new Date(n.date).toLocaleTimeString("ar-LY") : ""}</p>
                  </div>
                ))}</div>
              )}
            </div>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="space-y-4 max-w-lg">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("الملف الشخصي لمسؤول النظام","System Admin Profile")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("بياناتك الشخصية ورقم حسابك المصرفي الذي يظهر للعملاء عند التحويل.","Your personal data and bank account shown to clients.")}</p>
                <div className="space-y-3">
                  <div><label className="text-sm font-bold text-foreground">{t("الاسم","Name")}</label><input value={profile.name} onChange={(e) => saveProfile({...profile, name: e.target.value})} className={inputClass} /></div>
                  <div><label className="text-sm font-bold text-foreground">{t("البريد الإلكتروني","Email")}</label><input value={profile.email} onChange={(e) => saveProfile({...profile, email: e.target.value})} className={inputClass} /></div>
                  <div><label className="text-sm font-bold text-foreground">{t("كلمة المرور الجديدة","New Password")}</label><input type="password" value={profile.password} onChange={(e) => saveProfile({...profile, password: e.target.value})} placeholder={t("أدخل كلمة مرور جديدة","Enter new password")} className={inputClass} /></div>
                  <div>
                    <label className="text-sm font-bold text-foreground">{t("رقم الحساب المصرفي","Bank Account")}</label>
                    <input value={profile.bankAccount} onChange={(e) => saveProfile({...profile, bankAccount: e.target.value})} placeholder={t("يظهر للعملاء عند التحويل المصرفي","Shown to clients for bank transfer")} className={inputClass} />
                    <p className="text-xs text-muted-foreground mt-1">{t("سيظهر هذا الرقم في خانة شحن المحافظ بالتحويل المصرفي","This number appears in wallet charging via bank transfer")}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Branding - Fixed Logo Upload */}
          {activeTab === "branding" && (
            <div className="space-y-4 max-w-lg">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("هوية المنصة","Platform Branding")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("غيّر اسم المنصة والشعار والألوان. التغييرات تظهر في جميع الصفحات.","Change platform name, logo and colors.")}</p>
                <div className="space-y-4">
                  <div><label className="text-sm font-bold text-foreground">{t("اسم المنصة","Platform Name")}</label><input value={branding.name} onChange={(e) => saveBranding({...branding, name: e.target.value})} className={inputClass} /></div>
                  <div>
                    <label className="text-sm font-bold text-foreground">{t("شعار المنصة","Platform Logo")}</label>
                    {branding.logo && (
                      <div className="mb-3 glass rounded-xl p-4 flex items-center justify-center">
                        <img src={branding.logo} alt="Logo" className="h-20 object-contain" />
                      </div>
                    )}
                    <label className="glass rounded-xl p-6 text-center border-dashed border-2 border-border cursor-pointer hover:border-primary/50 transition-all block">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">{t("اسحب الشعار هنا أو انقر للتحميل","Drag logo here or click to upload")}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{t("يُفضل PNG بخلفية شفافة","PNG with transparent background preferred")}</p>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                  <div><label className="text-sm font-bold text-foreground">{t("اللون الأساسي","Primary Color")}</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={branding.primaryColor} onChange={(e) => saveBranding({...branding, primaryColor: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer" />
                      <input value={branding.primaryColor} onChange={(e) => saveBranding({...branding, primaryColor: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                  <div><label className="text-sm font-bold text-foreground">{t("لون التمييز","Accent Color")}</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={branding.accentColor} onChange={(e) => saveBranding({...branding, accentColor: e.target.value})} className="w-10 h-10 rounded-lg cursor-pointer" />
                      <input value={branding.accentColor} onChange={(e) => saveBranding({...branding, accentColor: e.target.value})} className={inputClass} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">{t("إعدادات المنصة","Platform Settings")}</h3>
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <div><p className="text-sm font-bold text-foreground">{t("وضع الصيانة","Maintenance Mode")}</p><p className="text-xs text-muted-foreground">{t("إيقاف المنصة مؤقتاً","Temporarily disable platform")}</p></div>
                  <button onClick={() => saveSettings({...platformSettings, maintenanceMode: !platformSettings.maintenanceMode})} className={`px-4 py-2 rounded-xl text-sm font-bold ${platformSettings.maintenanceMode ? "bg-destructive text-destructive-foreground" : "border border-border text-foreground"}`}>
                    {platformSettings.maintenanceMode ? t("إيقاف","Disable") : t("تفعيل","Enable")}
                  </button>
                </div>
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <div><p className="text-sm font-bold text-foreground">{t("التسجيل التلقائي","Auto Registration")}</p><p className="text-xs text-muted-foreground">{t("السماح بتسجيل الشركات بدون تحقق","Allow registration without verification")}</p></div>
                  <button onClick={() => saveSettings({...platformSettings, autoRegistration: !platformSettings.autoRegistration})} className={`px-4 py-2 rounded-xl text-sm font-bold ${platformSettings.autoRegistration ? "gradient-primary text-primary-foreground" : "border border-border text-foreground"}`}>
                    {platformSettings.autoRegistration ? t("مفعّل","Enabled") : t("معطّل","Disabled")}
                  </button>
                </div>
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <div><p className="text-sm font-bold text-foreground">{t("المظهر","Theme")}</p></div>
                  <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2">
                    {theme === "dark" ? <><Sun className="h-4 w-4" /> {t("نهاري","Light")}</> : <><Moon className="h-4 w-4" /> {t("ليلي","Dark")}</>}
                  </button>
                </div>
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <div><p className="text-sm font-bold text-foreground">{t("اللغة","Language")}</p></div>
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
