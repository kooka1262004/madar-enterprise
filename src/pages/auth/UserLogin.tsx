import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User } from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const UserLogin = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", company: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem("madar_users") || "[]");
    const user = users.find((u: any) => 
      (u.username === form.username || u.email === form.username) && 
      u.password === form.password && 
      (u.companyId === form.company || (u.companyName || "").toLowerCase() === form.company.toLowerCase())
    );
    if (user) {
      localStorage.setItem("madar_user", JSON.stringify({ role: "user", ...user }));
      navigate("/user");
    } else {
      // Also check employees list across all companies
      const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");
      const matchedCompany = companies.find((c: any) => 
        c.companyName?.toLowerCase() === form.company.toLowerCase() || c.id === form.company
      );
      if (matchedCompany) {
        const employees = JSON.parse(localStorage.getItem(`madar_employees_${matchedCompany.id}`) || "[]");
        const emp = employees.find((e: any) => 
          (e.email === form.username || e.fullName === form.username) && form.password
        );
        if (emp) {
          const userData = {
            role: "user",
            id: emp.id,
            username: emp.fullName,
            name: emp.fullName,
            email: emp.email,
            companyId: matchedCompany.id,
            companyName: matchedCompany.companyName,
            permissions: emp.permissions || ["dashboard", "my-info", "notifications", "messages"],
          };
          localStorage.setItem("madar_user", JSON.stringify(userData));
          navigate("/user");
          return;
        }
      }
      alert("بيانات الدخول غير صحيحة أو الشركة غير متطابقة");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><img src={logo} alt="مدار" className="h-20 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-black text-foreground">دخول المستخدمين</h1>
          <p className="text-sm text-muted-foreground mt-1">سجّل دخولك باستخدام بيانات حسابك الذي أنشأه مسؤول شركتك</p>
        </div>

        <form onSubmit={handleLogin} className="glass rounded-2xl p-6 space-y-4">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-warning">⚠️ لا يمكنك إنشاء حساب بنفسك. يتم إنشاء حسابك من قبل مسؤول شركتك فقط.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">اسم الشركة أو المعرّف</label>
            <input type="text" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
              placeholder="أدخل اسم الشركة أو رمزها" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">اسم المستخدم أو البريد</label>
            <input type="text" required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="أدخل اسم المستخدم أو البريد" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">كلمة المرور</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="أدخل كلمة المرور" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            <User className="h-4 w-4" /> تسجيل الدخول
          </button>
          <div className="text-center pt-2 border-t border-border/30">
            <Link to="/login/company" className="text-xs text-muted-foreground hover:text-primary">دخول كشركة؟</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
