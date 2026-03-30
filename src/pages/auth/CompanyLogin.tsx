import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building2 } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";

const CompanyLogin = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Check admin
    if (form.email === "kookakooka6589@gmail.com") {
      localStorage.setItem("madar_user", JSON.stringify({ role: "admin", email: form.email, name: "مسؤول النظام" }));
      navigate("/admin");
      return;
    }
    // Company login
    const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");
    const company = companies.find((c: any) => c.email === form.email && c.password === form.password);
    if (company) {
      localStorage.setItem("madar_user", JSON.stringify({ role: "company", ...company }));
      navigate("/company");
    } else {
      alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><img src={logoDark} alt="مدار" className="h-20 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-black text-foreground">دخول الشركات</h1>
          <p className="text-sm text-muted-foreground mt-1">سجّل دخولك لإدارة شركتك عبر منصة مدار</p>
        </div>

        <form onSubmit={handleLogin} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">البريد الإلكتروني</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="أدخل بريدك الإلكتروني"
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">البريد الذي سجّلت به حساب شركتك</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">كلمة المرور</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="أدخل كلمة المرور"
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            <Building2 className="h-4 w-4" />
            تسجيل الدخول
          </button>
          <div className="flex justify-between text-xs">
            <button type="button" className="text-primary hover:underline">نسيت كلمة المرور؟</button>
            <Link to="/register/company" className="text-primary hover:underline">إنشاء حساب جديد</Link>
          </div>
          <div className="text-center pt-2 border-t border-border/30">
            <Link to="/login/user" className="text-xs text-muted-foreground hover:text-primary">دخول كمستخدم (موظف)؟</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyLogin;
