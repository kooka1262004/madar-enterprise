import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building2, AlertTriangle, Monitor, Trash2, ArrowUpCircle } from "lucide-react";
import logo from "@/assets/logo-transparent.png";
import { registerDevice, getMaxDevicesForPlan, getDevicesForCompany, removeDevice, getDeviceIcon } from "@/utils/deviceManager";

const CompanyLogin = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [deviceError, setDeviceError] = useState<any>(null);
  const lang = localStorage.getItem("madar_lang") || "ar";
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDeviceError(null);

    if (form.email === "kookakooka6589@gmail.com") {
      localStorage.setItem("madar_user", JSON.stringify({ role: "admin", email: form.email, name: "مسؤول النظام" }));
      navigate("/admin");
      return;
    }

    const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");
    const company = companies.find((c: any) => c.email === form.email && c.password === form.password);
    
    if (!company) {
      setError(t("البريد الإلكتروني أو كلمة المرور غير صحيحة", "Invalid email or password"));
      return;
    }

    if (company.status === "suspended") {
      setError(t("هذا الحساب موقوف. يرجى التواصل مع مسؤول النظام.", "Account suspended. Contact system admin."));
      return;
    }

    // Device check
    const plans = JSON.parse(localStorage.getItem("madar_plans") || "[]");
    const maxDevices = company.maxDevices || getMaxDevicesForPlan(company.plan || "trial", plans) || 3;
    const result = registerDevice(company.id, maxDevices);

    if (!result.success) {
      const devices = getDevicesForCompany(company.id);
      setDeviceError({ message: lang === "ar" ? result.message : result.messageEn, devices, companyId: company.id, maxDevices });
      return;
    }

    // Store subscription info for verification
    const updatedCompany = { ...company, lastLogin: new Date().toISOString() };
    const updatedCompanies = companies.map((c: any) => c.id === company.id ? updatedCompany : c);
    localStorage.setItem("madar_companies", JSON.stringify(updatedCompanies));

    localStorage.setItem("madar_user", JSON.stringify({ role: "company", ...updatedCompany }));
    navigate("/company");
  };

  const handleRemoveDevice = (deviceId: string) => {
    if (!deviceError) return;
    removeDevice(deviceError.companyId, deviceId);
    const updatedDevices = getDevicesForCompany(deviceError.companyId);
    if (updatedDevices.filter(d => d.active).length < deviceError.maxDevices) {
      setDeviceError(null);
      // Auto retry login
      handleLogin({ preventDefault: () => {} } as React.FormEvent);
    } else {
      setDeviceError({ ...deviceError, devices: updatedDevices });
    }
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

        {deviceError && (
          <div className="glass rounded-2xl p-5 mb-4 space-y-3">
            <div className="flex items-center gap-2 text-warning">
              <Monitor className="h-5 w-5" />
              <p className="text-sm font-bold">{t("تم الوصول للحد الأقصى من الأجهزة", "Device Limit Reached")}</p>
            </div>
            <p className="text-xs text-muted-foreground">{deviceError.message}</p>
            <p className="text-xs text-foreground font-bold">{t("الأجهزة المسجلة حالياً:", "Currently registered devices:")} ({deviceError.devices.length}/{deviceError.maxDevices})</p>
            <div className="space-y-2">
              {deviceError.devices.map((d: any) => (
                <div key={d.id} className="flex items-center justify-between glass rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getDeviceIcon(d.type)}</span>
                    <div>
                      <p className="text-xs font-bold text-foreground">{d.name}</p>
                      <p className="text-[10px] text-muted-foreground">{t("آخر نشاط:", "Last:")} {new Date(d.lastActivity).toLocaleDateString("ar-LY")}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveDevice(d.id)} className="text-xs px-2 py-1 rounded-lg bg-destructive/20 text-destructive flex items-center gap-1">
                    <Trash2 className="h-3 w-3" /> {t("حذف", "Remove")}
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeviceError(null)} className="flex-1 py-2 rounded-xl border border-border text-foreground text-sm">{t("إعادة المحاولة", "Try Again")}</button>
              <button onClick={() => navigate("/register/company")} className="flex-1 py-2 rounded-xl bg-primary/20 text-primary text-sm font-bold flex items-center justify-center gap-1">
                <ArrowUpCircle className="h-3 w-3" /> {t("ترقية الباقة", "Upgrade Plan")}
              </button>
            </div>
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
          <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            <Building2 className="h-4 w-4" /> {t("تسجيل الدخول", "Login")}
          </button>
          <div className="flex justify-between text-xs">
            <button type="button" className="text-primary hover:underline">{t("نسيت كلمة المرور؟", "Forgot password?")}</button>
            <Link to="/register/company" className="text-primary hover:underline">{t("إنشاء حساب جديد", "Create account")}</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyLogin;
