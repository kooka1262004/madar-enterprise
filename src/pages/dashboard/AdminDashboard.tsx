import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Package, CreditCard, Users, Settings, LogOut,
  BarChart3, Shield, Ticket, DollarSign, Activity, AlertTriangle, User, Bell, Menu, X,
  Eye, Trash2, Send, Gift, Ban, CheckCircle, Clock, FileText, Edit, Plus, Download, RefreshCw, Search, MessageSquare
} from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const sidebarSections = [
  { title: "الرئيسية", items: [
    { icon: LayoutDashboard, label: "لوحة التحكم", key: "dashboard" },
    { icon: Eye, label: "المراقبة الشاملة", key: "monitoring" },
  ]},
  { title: "إدارة المنصة", items: [
    { icon: Building2, label: "إدارة الشركات", key: "companies" },
    { icon: Package, label: "إدارة الباقات", key: "plans" },
    { icon: DollarSign, label: "إدارة العملات", key: "currencies" },
    { icon: Ticket, label: "الكوبونات", key: "coupons" },
    { icon: CreditCard, label: "طلبات شحن المحافظ", key: "wallet-requests" },
  ]},
  { title: "المالية", items: [
    { icon: BarChart3, label: "أرباح المنصة", key: "revenue" },
  ]},
  { title: "النظام", items: [
    { icon: Activity, label: "حالة المنصة", key: "status" },
    { icon: AlertTriangle, label: "كشف التلاعب", key: "fraud" },
    { icon: MessageSquare, label: "المراسلات", key: "messages" },
    { icon: Bell, label: "الإشعارات", key: "notifications" },
  ]},
  { title: "الحساب", items: [
    { icon: User, label: "الملف الشخصي", key: "profile" },
    { icon: Settings, label: "إعدادات المنصة", key: "settings" },
  ]},
];

const defaultPlans = [
  { id: "trial", name: "تجربة مجانية", price: 0, period: "أسبوع", users: 999, stores: 999, products: 999, features: ["جميع المميزات"], active: true },
  { id: "starter", name: "باقة البداية", price: 100, period: "أسبوع", users: 2, stores: 1, products: 200, features: ["إدارة المنتجات","حركة المخزون","التقارير الأساسية","الباركود"], active: true },
  { id: "basic", name: "الباقة الأساسية", price: 300, period: "شهر", users: 3, stores: 1, products: 500, features: ["إدارة المنتجات","حركة المخزون","التقارير الأساسية","الباركود","تنبيهات المخزون"], active: true },
  { id: "pro", name: "الباقة الاحترافية", price: 500, period: "شهر", users: 10, stores: 3, products: 5000, features: ["إدارة المنتجات","حركة المخزون","التقارير الذكية","الباركود","تنبيهات المخزون","الجرد المتقدم","الموارد البشرية","المحاسبة","إدارة الموردين","التالف والمرتجعات","سجل النشاطات"], active: true },
  { id: "business", name: "باقة الأعمال", price: 1000, period: "شهر", users: 50, stores: 10, products: 999999, features: ["جميع المميزات","أولوية الدعم"], active: true },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");
  const walletRequests = JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]");
  const [plans, setPlans] = useState(() => JSON.parse(localStorage.getItem("madar_plans") || JSON.stringify(defaultPlans)));
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem("madar_admin_profile") || JSON.stringify({ name: "مسؤول النظام", email: "kookakooka6589@gmail.com", bankAccount: "", password: "" })));
  const [currency, setCurrency] = useState(() => JSON.parse(localStorage.getItem("madar_currency") || JSON.stringify({ primary: "LYD", secondary: "USD", rate: 4.85 })));
  const [coupons, setCoupons] = useState(() => JSON.parse(localStorage.getItem("madar_coupons") || "[]"));
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [newCoupon, setNewCoupon] = useState({ code: "", value: 0, type: "percent", maxUses: 10, expiresAt: "" });

  const flatItems = sidebarSections.flatMap(s => s.items);

  const logout = () => { localStorage.removeItem("madar_user"); navigate("/"); };

  const savePlans = (p: any[]) => { setPlans(p); localStorage.setItem("madar_plans", JSON.stringify(p)); };
  const saveCoupons = (c: any[]) => { setCoupons(c); localStorage.setItem("madar_coupons", JSON.stringify(c)); };
  const saveProfile = (p: any) => { setProfile(p); localStorage.setItem("madar_admin_profile", JSON.stringify(p)); };
  const saveCurrency = (c: any) => { setCurrency(c); localStorage.setItem("madar_currency", JSON.stringify(c)); };

  const updateWalletRequest = (id: string, status: string) => {
    const reqs = JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]");
    const updated = reqs.map((r: any) => r.id === id ? { ...r, status } : r);
    localStorage.setItem("madar_wallet_requests", JSON.stringify(updated));
    if (status === "approved") {
      const req = reqs.find((r: any) => r.id === id);
      if (req) {
        const comps = JSON.parse(localStorage.getItem("madar_companies") || "[]");
        const updatedComps = comps.map((c: any) => c.id === req.companyId ? { ...c, wallet: (c.wallet || 0) + req.amount } : c);
        localStorage.setItem("madar_companies", JSON.stringify(updatedComps));
      }
    }
    window.location.reload();
  };

  const suspendCompany = (id: string) => {
    const comps = JSON.parse(localStorage.getItem("madar_companies") || "[]");
    const updated = comps.map((c: any) => c.id === id ? { ...c, status: c.status === "suspended" ? "active" : "suspended" } : c);
    localStorage.setItem("madar_companies", JSON.stringify(updated));
    window.location.reload();
  };

  const stats = [
    { label: "الشركات المسجلة", value: companies.length, icon: Building2 },
    { label: "المستخدمين", value: JSON.parse(localStorage.getItem("madar_users") || "[]").length, icon: Users },
    { label: "الاشتراكات الفعالة", value: companies.filter((c: any) => c.status === "active").length, icon: CheckCircle },
    { label: "إجمالي الأرباح", value: `${companies.reduce((a: number, c: any) => a + (c.totalPaid || 0), 0)} د.ل`, icon: DollarSign },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed inset-y-0 right-0 w-64 bg-card border-l border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">مدار</h2>
              <p className="text-[10px] text-muted-foreground">مسؤول النظام</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-130px)]">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">{section.title}</p>
              {section.items.map((item) => (
                <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <item.icon className="h-4 w-4" />{item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 md:mr-64">
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{flatItems.find(s => s.key === activeTab)?.label}</h1>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">م</div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <s.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className="text-2xl font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">آخر الشركات المسجلة</h3>
                {companies.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد شركات مسجلة بعد.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">الشركة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">المسؤول</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">الباقة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground font-medium">الحالة</th>
                      </tr></thead>
                      <tbody>
                        {companies.slice(0, 10).map((c: any) => (
                          <tr key={c.id} className="border-b border-border/30">
                            <td className="py-2 px-3 text-foreground">{c.companyName}</td>
                            <td className="py-2 px-3 text-muted-foreground">{c.managerName}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.planName}</span></td>
                            <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? "معلّق" : "نشط"}</span></td>
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
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">المراقبة الشاملة</h3>
                <p className="text-sm text-muted-foreground mb-4">مراقبة جميع المستخدمين والشركات والباقات والاشتراكات في الوقت الفعلي.</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-primary">{companies.length}</p>
                    <p className="text-xs text-muted-foreground">شركة مسجلة</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-success">{companies.filter((c: any) => c.status === "active").length}</p>
                    <p className="text-xs text-muted-foreground">اشتراك فعال</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-warning">{companies.filter((c: any) => c.plan === "trial").length}</p>
                    <p className="text-xs text-muted-foreground">فترة تجريبية</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-destructive">{companies.filter((c: any) => c.status === "suspended").length}</p>
                    <p className="text-xs text-muted-foreground">حسابات معلّقة</p>
                  </div>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">تفاصيل الاشتراكات</h3>
                {companies.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد شركات.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground">الشركة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">الباقة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">تاريخ التسجيل</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">انتهاء التجربة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">المحفظة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">الحالة</th>
                      </tr></thead>
                      <tbody>
                        {companies.map((c: any) => (
                          <tr key={c.id} className="border-b border-border/30">
                            <td className="py-2 px-3 text-foreground font-medium">{c.companyName}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.planName}</span></td>
                            <td className="py-2 px-3 text-muted-foreground">{new Date(c.createdAt).toLocaleDateString("ar-LY")}</td>
                            <td className="py-2 px-3 text-muted-foreground">{c.trialEnd ? new Date(c.trialEnd).toLocaleDateString("ar-LY") : "-"}</td>
                            <td className="py-2 px-3 text-foreground">{c.wallet || 0} د.ل</td>
                            <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? "معلّق" : "نشط"}</span></td>
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">جميع الشركات ({companies.length})</h3>
                </div>
                {companies.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد شركات مسجلة.</p> : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground">الشركة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">البريد</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">المدينة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">الباقة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">المحفظة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">الحالة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">الإجراءات</th>
                      </tr></thead>
                      <tbody>
                        {companies.map((c: any) => (
                          <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/30">
                            <td className="py-2 px-3 text-foreground font-medium">{c.companyName}</td>
                            <td className="py-2 px-3 text-muted-foreground text-xs">{c.email}</td>
                            <td className="py-2 px-3 text-muted-foreground">{c.city}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.planName}</span></td>
                            <td className="py-2 px-3 text-foreground">{c.wallet || 0} د.ل</td>
                            <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${c.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{c.status === "suspended" ? "معلّق" : "نشط"}</span></td>
                            <td className="py-2 px-3 flex gap-1">
                              <button onClick={() => suspendCompany(c.id)} className={`text-xs px-2 py-1 rounded-lg ${c.status === "suspended" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                                {c.status === "suspended" ? "تفعيل" : "تعليق"}
                              </button>
                              <button className="text-xs px-2 py-1 rounded-lg bg-primary/20 text-primary">منح باقة</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Plans */}
          {activeTab === "plans" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">إدارة الباقات</h3>
                <button onClick={() => setEditingPlan({ id: Date.now().toString(), name: "", price: 0, period: "شهر", users: 5, stores: 1, products: 500, features: [], active: true })}
                  className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة باقة</button>
              </div>
              <p className="text-sm text-muted-foreground">يمكنك إنشاء وتعديل وتغيير الباقات بالكامل مع التحكم في عدد المستخدمين والمخازن والمنتجات والمميزات.</p>
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
                      </div>
                    </div>
                    <p className="text-2xl font-black text-primary">{p.price} <span className="text-xs text-muted-foreground">د.ل / {p.period}</span></p>
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <p>👥 المستخدمين: {p.users}</p>
                      <p>🏪 المخازن: {p.stores}</p>
                      <p>📦 المنتجات: {p.products}</p>
                    </div>
                  </div>
                ))}
              </div>
              {editingPlan && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-4">{editingPlan.name ? "تعديل الباقة" : "إنشاء باقة جديدة"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div><label className="text-sm font-bold text-foreground">اسم الباقة</label><input value={editingPlan.name} onChange={(e) => setEditingPlan({...editingPlan, name: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                    <div><label className="text-sm font-bold text-foreground">السعر (د.ل)</label><input type="number" value={editingPlan.price} onChange={(e) => setEditingPlan({...editingPlan, price: +e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                    <div><label className="text-sm font-bold text-foreground">المدة</label><select value={editingPlan.period} onChange={(e) => setEditingPlan({...editingPlan, period: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm"><option>أسبوع</option><option>شهر</option><option>سنة</option></select></div>
                    <div><label className="text-sm font-bold text-foreground">عدد المستخدمين</label><input type="number" value={editingPlan.users} onChange={(e) => setEditingPlan({...editingPlan, users: +e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                    <div><label className="text-sm font-bold text-foreground">عدد المخازن</label><input type="number" value={editingPlan.stores} onChange={(e) => setEditingPlan({...editingPlan, stores: +e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                    <div><label className="text-sm font-bold text-foreground">عدد المنتجات</label><input type="number" value={editingPlan.products} onChange={(e) => setEditingPlan({...editingPlan, products: +e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { const exists = plans.findIndex((p: any) => p.id === editingPlan.id); if (exists >= 0) { const up = [...plans]; up[exists] = editingPlan; savePlans(up); } else { savePlans([...plans, editingPlan]); } setEditingPlan(null); }}
                      className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ</button>
                    <button onClick={() => setEditingPlan(null)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">إلغاء</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Currencies */}
          {activeTab === "currencies" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">إدارة العملات</h3>
              <p className="text-sm text-muted-foreground mb-4">حدد العملة الأساسية والثانوية وسعر الصرف. العملة الأساسية تظهر بشكل واضح والثانوية تحتها.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1">العملة الأساسية</label>
                  <select value={currency.primary} onChange={(e) => saveCurrency({...currency, primary: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm">
                    <option value="LYD">دينار ليبي (د.ل)</option>
                    <option value="USD">دولار أمريكي ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1">العملة الثانوية</label>
                  <select value={currency.secondary} onChange={(e) => saveCurrency({...currency, secondary: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm">
                    <option value="USD">دولار أمريكي ($)</option>
                    <option value="LYD">دينار ليبي (د.ل)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1">سعر الصرف</label>
                  <input type="number" step="0.01" value={currency.rate} onChange={(e) => saveCurrency({...currency, rate: +e.target.value})} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">1 {currency.primary === "LYD" ? "دينار" : "دولار"} = {currency.rate} {currency.secondary === "USD" ? "دولار" : "دينار"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Coupons */}
          {activeTab === "coupons" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">إنشاء كوبون جديد</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="text-sm font-bold text-foreground">كود الكوبون</label><input value={newCoupon.code} onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value})} placeholder="مثال: MADAR50" className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                  <div><label className="text-sm font-bold text-foreground">القيمة</label><input type="number" value={newCoupon.value} onChange={(e) => setNewCoupon({...newCoupon, value: +e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                  <div><label className="text-sm font-bold text-foreground">النوع</label><select value={newCoupon.type} onChange={(e) => setNewCoupon({...newCoupon, type: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm"><option value="percent">نسبة مئوية %</option><option value="fixed">مبلغ ثابت</option></select></div>
                  <div><label className="text-sm font-bold text-foreground">عدد الاستخدامات</label><input type="number" value={newCoupon.maxUses} onChange={(e) => setNewCoupon({...newCoupon, maxUses: +e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                  <div><label className="text-sm font-bold text-foreground">تاريخ الانتهاء</label><input type="date" value={newCoupon.expiresAt} onChange={(e) => setNewCoupon({...newCoupon, expiresAt: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                </div>
                <button onClick={() => { if (!newCoupon.code) return; saveCoupons([...coupons, { ...newCoupon, id: Date.now().toString(), uses: 0 }]); setNewCoupon({ code: "", value: 0, type: "percent", maxUses: 10, expiresAt: "" }); }}
                  className="mt-4 px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">إنشاء الكوبون</button>
              </div>
              {coupons.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-bold text-foreground mb-4">الكوبونات ({coupons.length})</h3>
                  <div className="space-y-2">
                    {coupons.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between glass rounded-xl p-3">
                        <div>
                          <span className="font-bold text-primary text-sm">{c.code}</span>
                          <span className="text-xs text-muted-foreground mr-2">- خصم {c.value}{c.type === "percent" ? "%" : " د.ل"}</span>
                          <span className="text-xs text-muted-foreground">({c.uses || 0}/{c.maxUses} استخدام)</span>
                        </div>
                        <button onClick={() => saveCoupons(coupons.filter((cp: any) => cp.id !== c.id))} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wallet Requests */}
          {activeTab === "wallet-requests" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">طلبات شحن المحافظ</h3>
              <p className="text-sm text-muted-foreground mb-4">قم بمراجعة طلبات شحن المحافظ وتغيير حالتها (قبول / رفض / معلّق).</p>
              {walletRequests.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد طلبات شحن حالياً.</p> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">الشركة</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">المبلغ</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">الطريقة</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">الحالة</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">الإجراء</th>
                    </tr></thead>
                    <tbody>
                      {walletRequests.map((r: any) => (
                        <tr key={r.id} className="border-b border-border/30">
                          <td className="py-2 px-3 text-foreground">{r.companyName}</td>
                          <td className="py-2 px-3 text-primary font-bold">{r.amount} د.ل</td>
                          <td className="py-2 px-3 text-muted-foreground">{r.method}</td>
                          <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "approved" ? "bg-success/20 text-success" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{r.status === "approved" ? "مقبول" : r.status === "rejected" ? "مرفوض" : "معلّق"}</span></td>
                          <td className="py-2 px-3 flex gap-1">
                            {r.status === "pending" && <>
                              <button onClick={() => updateWalletRequest(r.id, "approved")} className="text-xs px-2 py-1 rounded bg-success/20 text-success">قبول</button>
                              <button onClick={() => updateWalletRequest(r.id, "rejected")} className="text-xs px-2 py-1 rounded bg-destructive/20 text-destructive">رفض</button>
                            </>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Revenue */}
          {activeTab === "revenue" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">أرباح المنصة</h3>
                  <button className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><Download className="h-4 w-4" /> تحميل PDF</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">اليوم</p><p className="text-xl font-black text-primary">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">هذا الأسبوع</p><p className="text-xl font-black text-primary">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">هذا الشهر</p><p className="text-xl font-black text-primary">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">هذه السنة</p><p className="text-xl font-black text-primary">0 د.ل</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Platform Status */}
          {activeTab === "status" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">حالة المنصة والصيانة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="glass rounded-xl p-4 text-center"><div className="w-3 h-3 rounded-full bg-success mx-auto mb-2" /><p className="text-sm text-foreground font-bold">المنصة تعمل</p><p className="text-xs text-muted-foreground">جميع الخدمات متاحة</p></div>
                  <div className="glass rounded-xl p-4 text-center"><Activity className="h-6 w-6 text-primary mx-auto mb-2" /><p className="text-sm text-foreground font-bold">الأداء</p><p className="text-xs text-muted-foreground">ممتاز - وقت الاستجابة &lt; 100ms</p></div>
                  <div className="glass rounded-xl p-4 text-center"><Clock className="h-6 w-6 text-warning mx-auto mb-2" /><p className="text-sm text-foreground font-bold">آخر تحديث</p><p className="text-xs text-muted-foreground">{new Date().toLocaleDateString("ar-LY")}</p></div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><RefreshCw className="h-4 w-4" /> إعادة تشغيل</button>
                  <button className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><Trash2 className="h-4 w-4" /> تنظيف الذاكرة</button>
                </div>
              </div>
            </div>
          )}

          {/* Fraud */}
          {activeTab === "fraud" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">كشف التلاعب والاحتيال</h3>
              <p className="text-sm text-muted-foreground mb-4">مراقبة العمليات المشبوهة ورصد أي محاولات تلاعب أو احتيال.</p>
              <div className="glass rounded-xl p-6 text-center">
                <Shield className="h-12 w-12 text-success mx-auto mb-3" />
                <p className="text-foreground font-bold">لا توجد عمليات مشبوهة</p>
                <p className="text-xs text-muted-foreground">جميع العمليات طبيعية حتى الآن</p>
              </div>
            </div>
          )}

          {/* Messages */}
          {activeTab === "messages" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">المراسلات</h3>
              <p className="text-sm text-muted-foreground mb-4">إرسال رسائل وتحذيرات للشركات والمستخدمين.</p>
              <div className="space-y-3">
                <div><label className="text-sm font-bold text-foreground">اختر الشركة</label>
                  <select className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm">
                    <option value="">جميع الشركات</option>
                    {companies.map((c: any) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                  </select>
                </div>
                <div><label className="text-sm font-bold text-foreground">الرسالة</label><textarea rows={3} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" placeholder="اكتب رسالتك هنا..." /></div>
                <button className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Send className="h-4 w-4" /> إرسال</button>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">الإشعارات</h3>
              <div className="glass rounded-xl p-6 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">لا توجد إشعارات جديدة</p>
              </div>
            </div>
          )}

          {/* Profile */}
          {activeTab === "profile" && (
            <div className="space-y-4 max-w-lg">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">الملف الشخصي لمسؤول النظام</h3>
                <div className="space-y-3">
                  <div><label className="text-sm font-bold text-foreground">الاسم</label><input value={profile.name} onChange={(e) => saveProfile({...profile, name: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                  <div><label className="text-sm font-bold text-foreground">البريد الإلكتروني</label><input value={profile.email} onChange={(e) => saveProfile({...profile, email: e.target.value})} className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                  <div><label className="text-sm font-bold text-foreground">كلمة المرور الجديدة</label><input type="password" value={profile.password} onChange={(e) => saveProfile({...profile, password: e.target.value})} placeholder="أدخل كلمة مرور جديدة" className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" /></div>
                  <div>
                    <label className="text-sm font-bold text-foreground">رقم الحساب المصرفي</label>
                    <input value={profile.bankAccount} onChange={(e) => saveProfile({...profile, bankAccount: e.target.value})} placeholder="يظهر هذا الرقم للعملاء عند التحويل المصرفي" className="w-full mt-1 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground text-sm" />
                    <p className="text-xs text-muted-foreground mt-1">سيظهر هذا الرقم في خانة شحن المحافظ بالتحويل المصرفي</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">إعدادات المنصة</h3>
              <p className="text-sm text-muted-foreground mb-4">إعدادات عامة للمنصة وتخصيص المظهر والسلوك.</p>
              <div className="space-y-4 max-w-lg">
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <div><p className="text-sm font-bold text-foreground">وضع الصيانة</p><p className="text-xs text-muted-foreground">إيقاف المنصة مؤقتاً للصيانة</p></div>
                  <button className="px-4 py-2 rounded-xl border border-border text-foreground text-sm">تفعيل</button>
                </div>
                <div className="flex items-center justify-between glass rounded-xl p-4">
                  <div><p className="text-sm font-bold text-foreground">التسجيل التلقائي</p><p className="text-xs text-muted-foreground">السماح بتسجيل الشركات تلقائياً بدون تحقق</p></div>
                  <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm">مفعّل</button>
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
