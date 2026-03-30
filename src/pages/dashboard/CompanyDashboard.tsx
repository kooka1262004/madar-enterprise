import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, TrendingUp, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, ShoppingCart, AlertTriangle, Clock, Briefcase
} from "lucide-react";

const sidebarSections = [
  { title: "الرئيسية", items: [
    { icon: LayoutDashboard, label: "لوحة التحكم", key: "dashboard" },
    { icon: CreditCard, label: "الاشتراك والباقة", key: "subscription" },
    { icon: DollarSign, label: "المحفظة", key: "wallet" },
  ]},
  { title: "المخزون", items: [
    { icon: Package, label: "المنتجات", key: "products" },
    { icon: Warehouse, label: "حركة المخزون", key: "stock" },
    { icon: QrCode, label: "الباركود", key: "barcode" },
    { icon: Truck, label: "الموردين", key: "suppliers" },
    { icon: ClipboardList, label: "الجرد", key: "inventory" },
    { icon: ShoppingCart, label: "إعادة الطلب الذكية", key: "reorder" },
    { icon: RotateCcw, label: "التالف والمرتجعات", key: "returns" },
  ]},
  { title: "المالية", items: [
    { icon: BarChart3, label: "المحاسبة", key: "accounting" },
    { icon: TrendingUp, label: "الأرباح", key: "profits" },
    { icon: FileText, label: "التقارير", key: "reports" },
  ]},
  { title: "الموارد البشرية", items: [
    { icon: Briefcase, label: "الموارد البشرية", key: "hr" },
  ]},
  { title: "الإدارة", items: [
    { icon: Users, label: "المستخدمين", key: "users" },
    { icon: UserCog, label: "الصلاحيات", key: "permissions" },
    { icon: Clock, label: "سجل النشاطات", key: "activity-log" },
    { icon: Settings, label: "الإعدادات", key: "settings" },
  ]},
];

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("madar_user") || "{}");

  const logout = () => {
    localStorage.removeItem("madar_user");
    navigate("/");
  };

  const stats = [
    { label: "المنتجات", value: "0", icon: Package },
    { label: "المستخدمين", value: "0", icon: Users },
    { label: "رصيد المحفظة", value: "0 د.ل", icon: DollarSign },
    { label: "الباقة", value: user.planName || "تجربة مجانية", icon: CreditCard },
  ];

  const flatItems = sidebarSections.flatMap(s => s.items);

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed inset-y-0 right-0 w-64 bg-card border-l border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-black text-primary text-lg">{user.companyName || "مدار"}</h2>
            <p className="text-xs text-muted-foreground">لوحة إدارة الشركة</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-4 overflow-y-auto h-[calc(100vh-130px)]">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">{section.title}</p>
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${
                    activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
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
          </div>
        </header>

        <div className="p-4 md:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border-primary/30">
                <p className="text-sm text-foreground">مرحباً <span className="font-bold text-primary">{user.managerName || user.companyName}</span>! هذه لوحة التحكم الخاصة بشركتك. من هنا يمكنك إدارة كل شيء.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <s.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">رصيد المحفظة</h3>
                <p className="text-3xl font-black text-primary">{user.wallet || 0} د.ل</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">شحن المحفظة</h3>
                <p className="text-sm text-muted-foreground mb-4">اختر طريقة الشحن المناسبة لك:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all cursor-pointer">
                    <h4 className="font-bold text-foreground text-sm mb-2">💵 كاش (نقدي)</h4>
                    <p className="text-xs text-muted-foreground">استلام عبر مندوب. يتم إرسال نموذج استلام لتأكيد العملية.</p>
                  </div>
                  <div className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all cursor-pointer">
                    <h4 className="font-bold text-foreground text-sm mb-2">🏦 تحويل مصرفي</h4>
                    <p className="text-xs text-muted-foreground">حوّل إلى حساب المنصة وأرفق إثبات التحويل.</p>
                  </div>
                  <div className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all cursor-pointer">
                    <h4 className="font-bold text-foreground text-sm mb-2">📱 خدمات إلكترونية</h4>
                    <p className="text-xs text-muted-foreground">ادفع عبر رابط الدفع الإلكتروني وأرفق الإثبات.</p>
                    <a href="https://mypay.ly/payment-link/share/iaRcZr4cFXa44OMlTriXZl2VcpO94d2X7AYPYQwWUEnwhGKZ4nGx9P3noBdU" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-2 block">رابط الدفع</a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">المنتجات</h3>
                <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">+ إضافة منتج</button>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">لم تقم بإضافة أي منتجات بعد. ابدأ بإضافة أول منتج لك.</p>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">المستخدمين (الموظفين)</h3>
                <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">+ إضافة مستخدم</button>
              </div>
              <div className="glass rounded-2xl p-4">
                <p className="text-xs text-warning">⚠️ ملاحظة: المستخدمون لا يمكنهم إنشاء حسابات بأنفسهم. يجب عليك إضافتهم من هنا وتحديد صلاحياتهم.</p>
              </div>
              <div className="glass rounded-2xl p-6 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">لم تقم بإضافة أي مستخدمين بعد.</p>
              </div>
            </div>
          )}

          {!["dashboard","wallet","products","users"].includes(activeTab) && (
            <div className="glass rounded-2xl p-6 text-center">
              {(() => { const Item = flatItems.find(s => s.key === activeTab); return Item ? <Item.icon className="h-12 w-12 text-primary mx-auto mb-4" /> : null; })()}
              <h3 className="font-bold text-foreground mb-2">{flatItems.find(s => s.key === activeTab)?.label}</h3>
              <p className="text-sm text-muted-foreground">هذا القسم جاهز ويمكن تفعيله. سيتم إضافة المحتوى الكامل في التحديثات القادمة.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
