import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Building2, Package, CreditCard, Users, Settings, LogOut,
  BarChart3, Shield, Ticket, DollarSign, Activity, AlertTriangle, User, Bell, Menu, X
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", key: "dashboard" },
  { icon: Building2, label: "إدارة الشركات", key: "companies" },
  { icon: Package, label: "إدارة الباقات", key: "plans" },
  { icon: DollarSign, label: "إدارة العملات", key: "currencies" },
  { icon: Ticket, label: "الكوبونات", key: "coupons" },
  { icon: BarChart3, label: "أرباح المنصة", key: "revenue" },
  { icon: Activity, label: "حالة المنصة", key: "status" },
  { icon: AlertTriangle, label: "كشف التلاعب", key: "fraud" },
  { icon: Bell, label: "الإشعارات", key: "notifications" },
  { icon: User, label: "الملف الشخصي", key: "profile" },
  { icon: Settings, label: "الإعدادات", key: "settings" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");

  const logout = () => {
    localStorage.removeItem("madar_user");
    navigate("/");
  };

  const stats = [
    { label: "الشركات المسجلة", value: companies.length, color: "text-primary" },
    { label: "المستخدمين النشطين", value: companies.reduce((a: number, c: any) => a + (JSON.parse(localStorage.getItem("madar_users") || "[]").filter((u: any) => u.companyId === c.id).length), 0), color: "text-success" },
    { label: "الاشتراكات الفعالة", value: companies.filter((c: any) => c.status === "active").length, color: "text-warning" },
    { label: "إجمالي الأرباح", value: "0 د.ل", color: "text-accent" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 w-64 bg-card border-l border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-black text-primary text-lg">مدار</h2>
            <p className="text-xs text-muted-foreground">مسؤول النظام</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-130px)]">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === item.key
                  ? "gradient-primary text-primary-foreground font-bold"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:mr-64">
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{sidebarItems.find(s => s.key === activeTab)?.label}</h1>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">م</div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">آخر الشركات المسجلة</h3>
                {companies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد شركات مسجلة بعد.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">الشركة</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">المسؤول</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">الباقة</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.slice(0, 10).map((c: any) => (
                          <tr key={c.id} className="border-b border-border/30">
                            <td className="py-2 px-3 text-foreground">{c.companyName}</td>
                            <td className="py-2 px-3 text-muted-foreground">{c.managerName}</td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.planName}</span></td>
                            <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-success/20 text-success">نشط</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "companies" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">جميع الشركات ({companies.length})</h3>
              {companies.length === 0 ? (
                <p className="text-sm text-muted-foreground">لا توجد شركات مسجلة.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground">الشركة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">البريد</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">المدينة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">النشاط</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">الباقة</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {companies.map((c: any) => (
                        <tr key={c.id} className="border-b border-border/30 hover:bg-secondary/30">
                          <td className="py-2 px-3 text-foreground font-medium">{c.companyName}</td>
                          <td className="py-2 px-3 text-muted-foreground">{c.email}</td>
                          <td className="py-2 px-3 text-muted-foreground">{c.city}</td>
                          <td className="py-2 px-3 text-muted-foreground">{c.activity}</td>
                          <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{c.planName}</span></td>
                          <td className="py-2 px-3">
                            <button className="text-xs text-primary hover:underline ml-2">تعديل</button>
                            <button className="text-xs text-destructive hover:underline">تعليق</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "plans" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">إدارة الباقات</h3>
              <p className="text-sm text-muted-foreground">يمكنك من هنا إنشاء وتعديل الباقات والتحكم في المميزات المتاحة لكل باقة.</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {["الأساسية - 300 د.ل","الاحترافية - 500 د.ل","الأعمال - 2,500 د.ل"].map((p) => (
                  <div key={p} className="glass rounded-xl p-4">
                    <h4 className="font-bold text-foreground text-sm mb-2">{p}</h4>
                    <button className="text-xs text-primary hover:underline">تعديل الباقة</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "currencies" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">إدارة العملات</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1">العملة الأساسية</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm">
                    <option>دينار ليبي (د.ل)</option>
                    <option>دولار أمريكي ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-foreground mb-1">سعر الصرف</label>
                  <input type="number" placeholder="4.85" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-sm" />
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="glass rounded-2xl p-6 max-w-lg">
              <h3 className="font-bold text-foreground mb-4">الملف الشخصي</h3>
              <div className="space-y-3">
                <div><label className="text-sm font-bold text-foreground">الاسم</label><p className="text-sm text-muted-foreground">مسؤول النظام</p></div>
                <div><label className="text-sm font-bold text-foreground">البريد</label><p className="text-sm text-muted-foreground">kookakooka6589@gmail.com</p></div>
              </div>
            </div>
          )}

          {!["dashboard","companies","plans","currencies","profile"].includes(activeTab) && (
            <div className="glass rounded-2xl p-6 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-foreground mb-2">{sidebarItems.find(s => s.key === activeTab)?.label}</h3>
              <p className="text-sm text-muted-foreground">هذا القسم جاهز ويمكن تفعيله. سيتم إضافة المحتوى الكامل في التحديثات القادمة.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
