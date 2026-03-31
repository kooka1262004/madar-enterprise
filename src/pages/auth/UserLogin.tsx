import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-transparent.png";

const UserLogin = () => {
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
        setError(t("البريد الإلكتروني أو كلمة المرور غير صحيحة. تأكد من أن مسؤول شركتك قد أضاف حسابك.", "Invalid email or password. Make sure your company admin has added your account."));
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

        if (roleData?.role === "employee") {
          // Check employee status
          const { data: emp } = await supabase
            .from("employees")
            .select("status, company_id")
            .eq("user_id", data.user.id)
            .maybeSingle();

          if (emp?.status === "suspended") {
            await supabase.auth.signOut();
            setError(t("هذا الحساب موقوف. يرجى التواصل مع مسؤول الشركة.", "Account suspended. Contact your company admin."));
            setLoading(false);
            return;
          }

          // Check company status
          if (emp) {
            const { data: company } = await supabase
              .from("companies")
              .select("status")
              .eq("id", emp.company_id)
              .maybeSingle();

            if (company?.status === "suspended") {
              await supabase.auth.signOut();
              setError(t("شركتك موقوفة حالياً. يرجى التواصل مع مسؤول النظام.", "Your company is suspended. Contact system admin."));
              setLoading(false);
              return;
            }
          }

          navigate("/user");
        } else if (roleData?.role === "admin") {
          navigate("/admin");
        } else if (roleData?.role === "company") {
          navigate("/company");
        } else {
          setError(t("لا توجد صلاحيات لهذا الحساب.", "No permissions found for this account."));
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
          <h1 className="text-2xl font-black text-foreground">{t("دخول الموظفين", "Employee Login")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("سجّل دخولك بالبريد وكلمة المرور التي حددها لك مسؤول شركتك", "Login with credentials set by your company admin")}</p>
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
            <User className="h-4 w-4" /> {loading ? t("جاري التسجيل...", "Logging in...") : t("تسجيل الدخول", "Login")}
          </button>
          <div className="text-center border-t border-border pt-3">
            <Link to="/login/company" className="text-xs text-muted-foreground hover:text-primary transition-colors">{t("← دخول الشركات", "← Company Login")}</Link>
          </div>
        </form>

        <div className="glass rounded-2xl p-4 mt-4">
          <p className="text-xs text-muted-foreground text-center">
            💡 {t("لا تملك حساب؟ اطلب من مسؤول شركتك إضافتك من قسم الموارد البشرية في لوحة التحكم.", "Don't have an account? Ask your company admin to add you from the HR section.")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
