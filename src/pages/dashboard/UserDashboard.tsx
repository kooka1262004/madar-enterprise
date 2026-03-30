import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Bell, Menu, X, Shield } from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("madar_user") || "{}");

  const logout = () => {
    localStorage.removeItem("madar_user");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed inset-y-0 right-0 w-64 bg-card border-l border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-black text-primary text-lg">مدار</h2>
            <p className="text-xs text-muted-foreground">واجهة المستخدم</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3">
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm gradient-primary text-primary-foreground font-bold">
            <LayoutDashboard className="h-4 w-4" /> لوحة التحكم
          </button>
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
          <h1 className="text-lg font-bold text-foreground">لوحة التحكم</h1>
          <Bell className="h-5 w-5 text-muted-foreground" />
        </header>

        <div className="p-4 md:p-6">
          <div className="glass rounded-2xl p-6 text-center">
            <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="font-bold text-foreground mb-2">مرحباً {user.name || "بك"}</h3>
            <p className="text-sm text-muted-foreground">الأقسام المتاحة لك تعتمد على الصلاحيات التي حددها مسؤول شركتك. تواصل معه لإضافة صلاحيات جديدة.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
