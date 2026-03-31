import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, ArrowRight, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-transparent.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const lang = localStorage.getItem("madar_lang") || "ar";
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (resetError) {
      setError(t("حدث خطأ أثناء إرسال رابط إعادة التعيين", "Error sending reset link"));
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><img src={logo} alt="مدار" className="h-20 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-black text-foreground">{t("نسيت كلمة المرور", "Forgot Password")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين", "Enter your email and we'll send you a reset link")}</p>
        </div>

        {error && (
          <div className="rounded-xl p-3 bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" /> {error}
          </div>
        )}

        {success ? (
          <div className="glass rounded-2xl p-6 text-center">
            <CheckCircle className="h-16 w-16 text-success mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">{t("تم إرسال الرابط!", "Link Sent!")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("تحقق من بريدك الإلكتروني وانقر على الرابط لإعادة تعيين كلمة المرور", "Check your email and click the link to reset your password")}</p>
            <Link to="/login/company" className="text-primary hover:underline text-sm font-bold flex items-center justify-center gap-2">
              <ArrowRight className="h-4 w-4" /> {t("العودة لتسجيل الدخول", "Back to Login")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">{t("البريد الإلكتروني", "Email")}</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t("أدخل بريدك الإلكتروني", "Enter your email")}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
              <Mail className="h-4 w-4" /> {loading ? t("جاري الإرسال...", "Sending...") : t("إرسال رابط إعادة التعيين", "Send Reset Link")}
            </button>
            <div className="text-center pt-2">
              <Link to="/login/company" className="text-xs text-muted-foreground hover:text-primary">{t("← العودة لتسجيل الدخول", "← Back to Login")}</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
