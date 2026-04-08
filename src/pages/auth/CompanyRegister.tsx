import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building2, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-transparent.png";

const cities = ["طرابلس","بنغازي","مصراتة","الزاوية","زليتن","صبراتة","الخمس","غريان","ترهونة","سرت","أجدابيا","البيضاء","درنة","طبرق","سبها","أوباري","مرزق","غدامس","نالوت","يفرن","جنزور","تاجوراء","أخرى"];
const activities = ["تجارة عامة","تجارة إلكترونية","مواد غذائية","ملابس وأزياء","إلكترونيات","مواد بناء","أدوية","قطع غيار","أثاث","مستحضرات تجميل","مطاعم ومقاهي","خدمات","تصنيع","أخرى"];

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    companyName: "", managerName: "", email: "", phone: "", password: "", confirmPassword: "",
    activity: "", city: "", country: "ليبيا",
  });
  const lang = localStorage.getItem("madar_lang") || "ar";
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError(t("كلمات المرور غير متطابقة", "Passwords don't match"));
      return;
    }
    if (form.password.length < 6) {
      setError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters"));
      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password: form.password,
        options: {
          data: { full_name: form.managerName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError(t("البريد الإلكتروني مسجّل مسبقاً", "Email already registered"));
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Assign company role
        await supabase.from("user_roles").insert({
          user_id: authData.user.id,
          role: "company" as any,
        });

        // Get free trial plan
        const { data: trialPlan } = await supabase
          .from("plans")
          .select("id, name")
          .eq("price", 0)
          .limit(1)
          .single();

        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);

        // Create company record with trial plan
        const { data: newCompany } = await supabase.from("companies").insert({
          owner_id: authData.user.id,
          company_name: form.companyName,
          manager_name: form.managerName,
          email: normalizedEmail,
          phone: form.phone,
          city: form.city,
          plan: trialPlan?.id || "trial",
          plan_name: "تجربة مجانية",
          status: "active",
          trial_end: trialEnd.toISOString(),
        }).select("id").single();

        // Create subscription record for trial
        if (newCompany && trialPlan) {
          await supabase.from("subscriptions").insert({
            company_id: newCompany.id,
            plan_id: trialPlan.id,
            plan_name: "تجربة مجانية",
            price: 0,
            start_date: new Date().toISOString(),
            end_date: trialEnd.toISOString(),
            status: "active",
          });
        }

        // Update profile
        await supabase.from("profiles").update({
          full_name: form.managerName,
          phone: form.phone,
        }).eq("user_id", authData.user.id);

        setSuccess(true);
        setTimeout(() => navigate("/company"), 1500);
      }
    } catch (err) {
      setError(t("حدث خطأ غير متوقع", "An unexpected error occurred"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/"><img src={logo} alt="مدار" className="h-20 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-black text-foreground">{t("إنشاء حساب شركة", "Create Company Account")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("مرحباً بك! سجّل شركتك وابدأ بتجربة مجانية لمدة أسبوع كامل بجميع المميزات.", "Welcome! Register and start a free trial for a full week.")}</p>
        </div>

        {error && (
          <div className="rounded-xl p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 flex-shrink-0" /> {t("تم إنشاء الحساب بنجاح! جاري التحويل...", "Account created successfully! Redirecting...")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("اسم الشركة *", "Company Name *")}</label>
              <input type="text" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder={t("مثال: شركة النور للتجارة", "e.g. Al Noor Trading")} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("اسم المسؤول *", "Manager Name *")}</label>
              <input type="text" required value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                placeholder={t("الاسم الكامل", "Full name")} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("البريد الإلكتروني *", "Email *")}</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@company.com" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("رقم الهاتف *", "Phone *")}</label>
              <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="09XXXXXXXX" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("كلمة المرور *", "Password *")}</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={t("أنشئ كلمة مرور قوية", "Create a strong password")} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("تأكيد كلمة المرور *", "Confirm Password *")}</label>
              <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder={t("أعد إدخال كلمة المرور", "Re-enter password")} className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("نوع النشاط *", "Activity *")}</label>
              <select required value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary text-sm">
                <option value="">{t("اختر نوع النشاط", "Select activity")}</option>
                {activities.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("المدينة *", "City *")}</label>
              <select required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary text-sm">
                <option value="">{t("اختر المدينة", "Select city")}</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
            <Building2 className="h-4 w-4" /> {loading ? t("جاري الإنشاء...", "Creating...") : t("إنشاء الحساب وبدء التجربة المجانية", "Create Account & Start Free Trial")}
          </button>

          <div className="text-center pt-2 border-t border-border/30">
            <span className="text-xs text-muted-foreground">{t("لديك حساب بالفعل؟", "Already have an account?")} </span>
            <Link to="/login/company" className="text-xs text-primary hover:underline">{t("تسجيل الدخول", "Login")}</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegister;
