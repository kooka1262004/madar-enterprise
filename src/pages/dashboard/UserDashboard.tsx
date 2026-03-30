import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, LogOut, Bell, Menu, X, Package, Warehouse, BarChart3, QrCode,
  Truck, ClipboardList, RotateCcw, FileText, DollarSign, Briefcase, Clock, TrendingUp, ShoppingCart, UserCog
} from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const allSidebarItems = [
  { icon: LayoutDashboard, label: "لوحة التحكم", key: "dashboard" },
  { icon: Package, label: "المنتجات", key: "products" },
  { icon: Warehouse, label: "حركة المخزون", key: "stock" },
  { icon: QrCode, label: "الباركود", key: "barcode" },
  { icon: Truck, label: "الموردين", key: "suppliers" },
  { icon: ClipboardList, label: "الجرد", key: "inventory" },
  { icon: ShoppingCart, label: "إعادة الطلب الذكية", key: "reorder" },
  { icon: RotateCcw, label: "التالف والمرتجعات", key: "returns" },
  { icon: BarChart3, label: "المحاسبة", key: "accounting" },
  { icon: TrendingUp, label: "الأرباح", key: "profits" },
  { icon: FileText, label: "التقارير", key: "reports" },
  { icon: Briefcase, label: "الموارد البشرية", key: "hr" },
  { icon: Clock, label: "سجل النشاطات", key: "activity-log" },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = JSON.parse(localStorage.getItem("madar_user") || "{}");

  // Filter sidebar based on user permissions (default: show all for now)
  const permissions = user.permissions || allSidebarItems.map(i => i.key);
  const visibleItems = allSidebarItems.filter(i => i.key === "dashboard" || permissions.includes(i.key));

  const logout = () => { localStorage.removeItem("madar_user"); navigate("/"); };

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed inset-y-0 right-0 w-64 bg-card border-l border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">{user.companyName || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">واجهة المستخدم</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-130px)]">
          {visibleItems.map((item) => (
            <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
              <item.icon className="h-4 w-4" />{item.label}
            </button>
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
          <h1 className="text-lg font-bold text-foreground">{visibleItems.find(s => s.key === activeTab)?.label || "لوحة التحكم"}</h1>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </header>

        <div className="p-4 md:p-6">
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">مرحباً {user.username || user.name || "بك"} 👋</h3>
                <p className="text-sm text-muted-foreground">الأقسام المتاحة لك تعتمد على الصلاحيات التي حددها مسؤول شركتك. تواصل معه لإضافة صلاحيات جديدة.</p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-3">شؤونك الوظيفية</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">الوظيفة</p><p className="text-sm font-bold text-foreground">{user.role || "-"}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">الشركة</p><p className="text-sm font-bold text-foreground">{user.companyName || "-"}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">الراتب</p><p className="text-sm font-bold text-primary">{user.salary || "غير محدد"}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">العقد</p><p className="text-sm font-bold text-foreground">{user.contractType || "غير محدد"}</p></div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "dashboard" && (
            <div className="glass rounded-2xl p-6 text-center">
              {(() => { const Item = visibleItems.find(s => s.key === activeTab); return Item ? <Item.icon className="h-12 w-12 text-primary mx-auto mb-4" /> : null; })()}
              <h3 className="font-bold text-foreground mb-2">{visibleItems.find(s => s.key === activeTab)?.label}</h3>
              <p className="text-sm text-muted-foreground">يمكنك استخدام هذا القسم حسب الصلاحيات الممنوحة لك من مسؤول الشركة.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
