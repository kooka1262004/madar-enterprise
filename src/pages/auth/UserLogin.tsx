import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Building2, Shield, Mail, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const UserLogin = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ companyName: "", adminName: "", adminEmail: "", employeeEmail: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const theme = localStorage.getItem("madar_theme") || "dark";
  const lang = localStorage.getItem("madar_lang") || "ar";
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      // Step 1: Find matching company
      const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");
      const matchedCompany = companies.find((c: any) =>
        c.companyName?.toLowerCase().trim() === form.companyName.toLowerCase().trim() ||
        c.id === form.companyName.trim()
      );

      if (!matchedCompany) {
        setError(t("❌ اسم الشركة غير موجود في النظام. تأكد من إدخال الاسم الصحيح.", "❌ Company name not found. Please check the name."));
        setLoading(false);
        return;
      }

      // Step 2: Verify admin name and email match the company
      if (
        matchedCompany.managerName?.toLowerCase().trim() !== form.adminName.toLowerCase().trim()
      ) {
        setError(t("❌ اسم مسؤول الشركة غير صحيح أو لا يتطابق مع الشركة المحددة.", "❌ Company admin name is incorrect or doesn't match the company."));
        setLoading(false);
        return;
      }

      if (
        matchedCompany.email?.toLowerCase().trim() !== form.adminEmail.toLowerCase().trim()
      ) {
        setError(t("❌ البريد الإلكتروني لمسؤول الشركة غير صحيح.", "❌ Company admin email is incorrect."));
        setLoading(false);
        return;
      }

      // Step 3: Find the employee under this company
      const employees = JSON.parse(localStorage.getItem(`madar_employees_${matchedCompany.id}`) || "[]");
      const employee = employees.find((emp: any) =>
        emp.email?.toLowerCase().trim() === form.employeeEmail.toLowerCase().trim()
      );

      if (!employee) {
        setError(t("❌ لم يتم العثور على موظف بهذا البريد الإلكتروني في هذه الشركة. تأكد من إضافتك من قبل مسؤول الشركة.", "❌ No employee found with this email in this company. Make sure you were added by the company admin."));
        setLoading(false);
        return;
      }

      // Step 4: Verify password
      if (employee.password !== form.password) {
        setError(t("❌ كلمة المرور غير صحيحة.", "❌ Incorrect password."));
        setLoading(false);
        return;
      }

      // Step 5: Check if account is active
      if (employee.status === "suspended") {
        setError(t("🚫 هذا الحساب موقوف. يرجى التواصل مع مسؤول الشركة لتفعيله.", "🚫 This account is suspended. Please contact your company admin."));
        setLoading(false);
        return;
      }

      // All checks passed — create session
      const userData = {
        role: "user",
        id: employee.id,
        username: employee.fullName,
        name: employee.fullName,
        email: employee.email,
        position: employee.position,
        companyId: matchedCompany.id,
        companyName: matchedCompany.companyName,
        adminName: matchedCompany.managerName,
        adminEmail: matchedCompany.email,
        permissions: employee.permissions || [],
        loginTime: new Date().toISOString(),
      };

      // Update last login
      const updatedEmployees = employees.map((emp: any) =>
        emp.id === employee.id ? { ...emp, lastLogin: new Date().toISOString() } : emp
      );
      localStorage.setItem(`madar_employees_${matchedCompany.id}`, JSON.stringify(updatedEmployees));

      localStorage.setItem("madar_user", JSON.stringify(userData));
      setLoading(false);
      navigate("/user");
    }, 600);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/"><img src={logo} alt="مدار" className="h-16 mx-auto mb-3" /></Link>
          <h1 className="text-2xl font-black text-foreground">{t("تسجيل دخول الموظفين", "Employee Login")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("سجّل دخولك باستخدام بيانات حسابك الذي أنشأه مسؤول شركتك", "Login with credentials created by your company admin")}</p>
        </div>

        <form onSubmit={handleLogin} className="glass rounded-2xl p-5 space-y-3">
          <div className="glass rounded-xl p-3 text-center">
            <p className="text-xs text-warning flex items-center justify-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {t("لا يمكنك إنشاء حساب بنفسك. حسابك يُنشأ من قبل مسؤول شركتك فقط.", "You cannot create your own account. Only your company admin can create it.")}
            </p>
          </div>

          {error && (
            <div className="rounded-xl p-3 bg-destructive/10 border border-destructive/30 text-destructive text-xs font-medium">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-1">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              {t("اسم الشركة", "Company Name")}
            </label>
            <input type="text" required value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              placeholder={t("أدخل اسم الشركة المسجلة في المنصة", "Enter the registered company name")}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
          </div>

          {/* Admin Name */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-1">
              <Shield className="h-3.5 w-3.5 text-primary" />
              {t("اسم مسؤول الشركة", "Company Admin Name")}
            </label>
            <input type="text" required value={form.adminName}
              onChange={(e) => setForm({ ...form, adminName: e.target.value })}
              placeholder={t("أدخل اسم المسؤول الذي أنشأ حسابك", "Enter the admin who created your account")}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
          </div>

          {/* Admin Email */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-1">
              <Mail className="h-3.5 w-3.5 text-primary" />
              {t("البريد الإلكتروني لمسؤول الشركة", "Admin Email")}
            </label>
            <input type="email" required value={form.adminEmail}
              onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
              placeholder={t("أدخل البريد الإلكتروني لمسؤول شركتك", "Enter your company admin's email")}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
          </div>

          {/* Employee Email */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-1">
              <User className="h-3.5 w-3.5 text-primary" />
              {t("بريدك الإلكتروني", "Your Email")}
            </label>
            <input type="email" required value={form.employeeEmail}
              onChange={(e) => setForm({ ...form, employeeEmail: e.target.value })}
              placeholder={t("أدخل بريدك الإلكتروني المسجل لدى شركتك", "Enter your registered email")}
              className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-foreground mb-1">
              <Lock className="h-3.5 w-3.5 text-primary" />
              {t("كلمة المرور", "Password")}
            </label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={t("أدخل كلمة المرور الخاصة بك", "Enter your password")}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
            ) : (
              <><CheckCircle className="h-4 w-4" /> {t("تسجيل الدخول", "Login")}</>
            )}
          </button>

          <div className="glass rounded-xl p-3 mt-2">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              {t(
                "🔒 النظام يتحقق من: اسم الشركة ← اسم المسؤول ← بريد المسؤول ← بريد الموظف ← كلمة المرور ← حالة الحساب. لن تتمكن من الدخول إلا إذا كانت جميع البيانات صحيحة ومتطابقة.",
                "🔒 System verifies: Company → Admin → Admin Email → Employee Email → Password → Account Status. All must match."
              )}
            </p>
          </div>

          <div className="text-center pt-2 border-t border-border/30">
            <Link to="/login/company" className="text-xs text-muted-foreground hover:text-primary">
              {t("دخول كمسؤول شركة؟", "Login as company admin?")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
