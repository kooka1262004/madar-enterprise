import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-transparent.png";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);
  const lang = localStorage.getItem("madar_lang") || "ar";
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check if already in recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("كلمات المرور غير متطابقة", "Passwords don't match"));
      return;
    }
    if (password.length < 6) {
      setError(t("كلمة المرور يجب أن تكون 6 أحرف على الأقل", "Password must be at least 6 characters"));
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login/company"), 2000);
    }
    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <Link to="/"><img src={logo} alt="مدار" className="h-20 mx-auto mb-4" /></Link>
          <div className="glass rounded-2xl p-6">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">{t("جاري التحقق من الرابط...", "Verifying link...")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><img src={logo} alt="مدار" className="h-20 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-black text-foreground">{t("إعادة تعيين كلمة المرور", "Reset Password")}</h1>
        </div>

        {error && (
          <div className="rounded-xl p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {success ? (
          <div className="glass rounded-2xl p-6 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">{t("تم تغيير كلمة المرور!", "Password Changed!")}</h3>
            <p className="text-sm text-muted-foreground">{t("جاري التحويل لتسجيل الدخول...", "Redirecting to login...")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("كلمة المرور الجديدة", "New Password")}</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("أدخل كلمة المرور الجديدة", "Enter new password")}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("تأكيد كلمة المرور", "Confirm Password")}</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("أعد إدخال كلمة المرور", "Re-enter password")}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
              <Lock className="h-4 w-4" /> {loading ? t("جاري التحديث...", "Updating...") : t("تحديث كلمة المرور", "Update Password")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
