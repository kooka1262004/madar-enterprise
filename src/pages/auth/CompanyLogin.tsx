import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building2, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-transparent.png";

const CompanyLogin = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const lang = localStorage.getItem("madar_lang") || "ar";
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) {
        setError(t("البريد الإلكتروني أو كلمة المرور غير صحيحة", "Invalid email or password"));
        setLoading(false);
        return;
      }

      if (data.user) {
        // Check role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (roleData?.role === "admin") {
          navigate("/admin");
        } else if (roleData?.role === "company") {
          // Check if company is suspended
          const { data: company } = await supabase
            .from("companies")
            .select("status")
            .eq("owner_id", data.user.id)
            .maybeSingle();

          if (company?.status === "suspended") {
            await supabase.auth.signOut();
            setError(t("هذا الحساب موقوف. يرجى التواصل مع مسؤول النظام.", "Account suspended. Contact system admin."));
            setLoading(false);
            return;
          }

          // Update last login
          await supabase
            .from("companies")
            .update({ last_login: new Date().toISOString() })
            .eq("owner_id", data.user.id);

          navigate("/company");
        } else {
          setError(t("هذا الحساب ليس حساب شركة. جرّب دخول الموظفين.", "This is not a company account. Try employee login."));
          await supabase.auth.signOut();
        }
      }
    } catch (err) {
      setError(t("حدث خطأ غير متوقع", "An unexpected error occurred"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><img src={logo} alt="مدار" className="h-20 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-black text-foreground">{t("دخول الشركات", "Company Login")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("سجّل دخولك لإدارة شركتك عبر منصة مدار", "Login to manage your company via Madar")}</p>
        </div>

        {error && (
          <div className="rounded-xl p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">{t("البريد الإلكتروني", "Email")}</label>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder={t("أدخل بريدك الإلكتروني", "Enter your email")} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
          </div>
          <div>
            <label className="block text-sm font-bold text-foreground mb-1">{t("كلمة المرور", "Password")}</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t("أدخل كلمة المرور", "Enter password")} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
            <Building2 className="h-4 w-4" /> {loading ? t("جاري التسجيل...", "Logging in...") : t("تسجيل الدخول", "Login")}
          </button>
          <div className="flex justify-between text-xs">
            <Link to="/forgot-password" className="text-primary hover:underline">{t("نسيت كلمة المرور؟", "Forgot password?")}</Link>
            <Link to="/register/company" className="text-primary hover:underline">{t("إنشاء حساب جديد", "Create account")}</Link>
          </div>
          <div className="text-center border-t border-border pt-3">
            <Link to="/login/user" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("دخول الموظفين →", "Employee Login →")}</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyLogin;
