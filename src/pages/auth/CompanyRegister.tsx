import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Building2, Upload } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";

const cities = ["طرابلس","بنغازي","مصراتة","الزاوية","زليتن","صبراتة","الخمس","غريان","ترهونة","سرت","أجدابيا","البيضاء","درنة","طبرق","سبها","أوباري","مرزق","غدامس","نالوت","يفرن","جنزور","تاجوراء","أخرى"];
const activities = ["تجارة عامة","تجارة إلكترونية","مواد غذائية","ملابس وأزياء","إلكترونيات","مواد بناء","أدوية","قطع غيار","أثاث","مستحضرات تجميل","مطاعم ومقاهي","خدمات","تصنيع","أخرى"];

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({
    companyName: "", managerName: "", email: "", phone: "", password: "", confirmPassword: "",
    activity: "", city: "", country: "ليبيا", logo: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("كلمات المرور غير متطابقة");
      return;
    }
    const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");
    if (companies.find((c: any) => c.email === form.email)) {
      alert("البريد الإلكتروني مسجّل مسبقاً");
      return;
    }
    const newCompany = {
      id: Date.now().toString(),
      ...form,
      plan: "trial",
      planName: "تجربة مجانية",
      trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      wallet: 0,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    companies.push(newCompany);
    localStorage.setItem("madar_companies", JSON.stringify(companies));
    localStorage.setItem("madar_user", JSON.stringify({ role: "company", ...newCompany }));
    navigate("/company");
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-20">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/"><img src={logoDark} alt="مدار" className="h-20 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-black text-foreground">إنشاء حساب شركة</h1>
          <p className="text-sm text-muted-foreground mt-1">مرحباً بك! سجّل شركتك وابدأ بتجربة مجانية لمدة أسبوع كامل بجميع المميزات.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">اسم الشركة *</label>
              <input type="text" required value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                placeholder="مثال: شركة النور للتجارة" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
              <p className="text-xs text-muted-foreground mt-1">الاسم الذي سيظهر في المنصة وصفحة دخول موظفيك</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">اسم المسؤول *</label>
              <input type="text" required value={form.managerName} onChange={(e) => setForm({ ...form, managerName: e.target.value })}
                placeholder="الاسم الكامل" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
              <p className="text-xs text-muted-foreground mt-1">اسم الشخص المسؤول عن إدارة حساب الشركة</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">البريد الإلكتروني *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@company.com" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
              <p className="text-xs text-muted-foreground mt-1">سيُستخدم لتسجيل الدخول واستلام الإشعارات</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">رقم الهاتف *</label>
              <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="09XXXXXXXX" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">كلمة المرور *</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="أنشئ كلمة مرور قوية" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">تأكيد كلمة المرور *</label>
              <input type="password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                placeholder="أعد إدخال كلمة المرور" className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">نوع النشاط *</label>
              <select required value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary text-sm">
                <option value="">اختر نوع النشاط</option>
                {activities.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">المدينة *</label>
              <select required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground focus:outline-none focus:border-primary text-sm">
                <option value="">اختر المدينة</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
            <Building2 className="h-4 w-4" />
            إنشاء الحساب وبدء التجربة المجانية
          </button>

          <div className="text-center pt-2 border-t border-border/30">
            <span className="text-xs text-muted-foreground">لديك حساب بالفعل؟ </span>
            <Link to="/login/company" className="text-xs text-primary hover:underline">تسجيل الدخول</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyRegister;
