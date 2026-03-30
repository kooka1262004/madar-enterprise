import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, TrendingUp, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, ShoppingCart, AlertTriangle, Clock, Briefcase,
  Plus, Edit, Trash2, Download, Eye, Send, Check, Search, Upload, Calendar, Award, Flag, MessageSquare, ListChecks
} from "lucide-react";
import logo from "@/assets/logo-transparent.png";

const sidebarSections = [
  { title: "الرئيسية", items: [
    { icon: LayoutDashboard, label: "لوحة التحكم", key: "dashboard" },
    { icon: CreditCard, label: "الاشتراك والباقة", key: "subscription" },
    { icon: DollarSign, label: "المحفظة", key: "wallet" },
  ]},
  { title: "المخزون", items: [
    { icon: Package, label: "المنتجات", key: "products" },
    { icon: Warehouse, label: "حركة المخزون", key: "stock" },
    { icon: QrCode, label: "الباركود", key: "barcode" },
    { icon: Truck, label: "الموردين", key: "suppliers" },
    { icon: ClipboardList, label: "الجرد", key: "inventory" },
    { icon: ShoppingCart, label: "إعادة الطلب الذكية", key: "reorder" },
    { icon: RotateCcw, label: "التالف والمرتجعات", key: "returns" },
  ]},
  { title: "المالية", items: [
    { icon: BarChart3, label: "المحاسبة", key: "accounting" },
    { icon: TrendingUp, label: "الأرباح", key: "profits" },
    { icon: FileText, label: "التقارير", key: "reports" },
  ]},
  { title: "الموارد البشرية", items: [
    { icon: Briefcase, label: "الموارد البشرية", key: "hr" },
  ]},
  { title: "الإدارة", items: [
    { icon: Users, label: "المستخدمين", key: "users" },
    { icon: UserCog, label: "الصلاحيات", key: "permissions" },
    { icon: Clock, label: "سجل النشاطات", key: "activity-log" },
    { icon: AlertTriangle, label: "كشف التلاعب", key: "fraud" },
    { icon: Settings, label: "الإعدادات", key: "settings" },
  ]},
];

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("madar_user") || "{}"));
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showAddMovement, setShowAddMovement] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddDamaged, setShowAddDamaged] = useState(false);
  const [showAddViolation, setShowAddViolation] = useState(false);
  const [showAddReward, setShowAddReward] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [chargeMethod, setChargeMethod] = useState("");
  const [chargeStep, setChargeStep] = useState(0);
  const [inventoryType, setInventoryType] = useState("");
  const [hrTab, setHrTab] = useState("overview");
  const [accountingTab, setAccountingTab] = useState("daily");

  const products = JSON.parse(localStorage.getItem(`madar_products_${user.id}`) || "[]");
  const companyUsers = JSON.parse(localStorage.getItem("madar_users") || "[]").filter((u: any) => u.companyId === user.id);
  const suppliers = JSON.parse(localStorage.getItem(`madar_suppliers_${user.id}`) || "[]");
  const movements = JSON.parse(localStorage.getItem(`madar_movements_${user.id}`) || "[]");
  const employees = JSON.parse(localStorage.getItem(`madar_employees_${user.id}`) || "[]");
  const adminProfile = JSON.parse(localStorage.getItem("madar_admin_profile") || "{}");

  const logout = () => { localStorage.removeItem("madar_user"); navigate("/"); };
  const flatItems = sidebarSections.flatMap(s => s.items);

  const stats = [
    { label: "المنتجات", value: products.length, icon: Package },
    { label: "المستخدمين", value: companyUsers.length, icon: Users },
    { label: "رصيد المحفظة", value: `${user.wallet || 0} د.ل`, icon: DollarSign },
    { label: "الباقة", value: user.planName || "تجربة مجانية", icon: CreditCard },
  ];

  const saveProduct = (product: any) => {
    const prods = [...products, { ...product, id: Date.now().toString(), createdAt: new Date().toISOString() }];
    localStorage.setItem(`madar_products_${user.id}`, JSON.stringify(prods));
    setShowAddProduct(false);
    window.location.reload();
  };

  const saveUser = (u: any) => {
    const users = JSON.parse(localStorage.getItem("madar_users") || "[]");
    users.push({ ...u, id: Date.now().toString(), companyId: user.id, companyName: user.companyName });
    localStorage.setItem("madar_users", JSON.stringify(users));
    setShowAddUser(false);
    window.location.reload();
  };

  const saveSupplier = (s: any) => {
    const sups = [...suppliers, { ...s, id: Date.now().toString() }];
    localStorage.setItem(`madar_suppliers_${user.id}`, JSON.stringify(sups));
    setShowAddSupplier(false);
    window.location.reload();
  };

  const saveMovement = (m: any) => {
    const movs = [...movements, { ...m, id: Date.now().toString(), date: new Date().toISOString(), by: user.managerName }];
    localStorage.setItem(`madar_movements_${user.id}`, JSON.stringify(movs));
    setShowAddMovement(false);
    window.location.reload();
  };

  const saveEmployee = (emp: any) => {
    const emps = [...employees, { ...emp, id: Date.now().toString() }];
    localStorage.setItem(`madar_employees_${user.id}`, JSON.stringify(emps));
    setShowAddEmployee(false);
    window.location.reload();
  };

  const submitWalletRequest = (method: string, data: any) => {
    const reqs = JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]");
    reqs.push({ id: Date.now().toString(), companyId: user.id, companyName: user.companyName, method, ...data, status: "pending", date: new Date().toISOString() });
    localStorage.setItem("madar_wallet_requests", JSON.stringify(reqs));
    setChargeStep(0);
    setChargeMethod("");
    alert("تم إرسال طلب الشحن بنجاح! سيتم مراجعته من قبل إدارة المنصة.");
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

  return (
    <div className="min-h-screen flex">
      <aside className={`fixed inset-y-0 right-0 w-64 bg-card border-l border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">{user.companyName || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">لوحة إدارة الشركة</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-130px)]">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">{section.title}</p>
              {section.items.map((item) => (
                <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <item.icon className="h-4 w-4" />{item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="h-4 w-4" /> تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 md:mr-64">
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{flatItems.find(s => s.key === activeTab)?.label}</h1>
          <div className="flex items-center gap-2"><Bell className="h-5 w-5 text-muted-foreground" /></div>
        </header>

        <div className="p-4 md:p-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border-primary/30">
                <p className="text-sm text-foreground">مرحباً <span className="font-bold text-primary">{user.managerName || user.companyName}</span>! هذه لوحة التحكم الخاصة بشركتك.</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <s.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subscription */}
          {activeTab === "subscription" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">الباقة الحالية</h3>
                <p className="text-3xl font-black text-primary">{user.planName || "تجربة مجانية"}</p>
                {user.trialEnd && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">تنتهي التجربة: <span className="text-warning font-bold">{new Date(user.trialEnd).toLocaleDateString("ar-LY")}</span></p>
                    {new Date(user.trialEnd).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && (
                      <div className="mt-2 glass rounded-xl p-3 border-warning/30">
                        <p className="text-xs text-warning">⚠️ تنبيه: اشتراكك على وشك الانتهاء! قم بترقية باقتك للاستمرار.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Wallet */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">رصيد المحفظة</h3>
                <p className="text-3xl font-black text-primary">{user.wallet || 0} د.ل</p>
              </div>
              
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">شحن المحفظة</h3>
                {!chargeMethod ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => { setChargeMethod("cash"); setChargeStep(1); }} className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all text-right">
                      <h4 className="font-bold text-foreground text-sm mb-2">💵 كاش (نقدي)</h4>
                      <p className="text-xs text-muted-foreground">سنرسل مندوب لاستلام القيمة منك.</p>
                    </button>
                    <button onClick={() => { setChargeMethod("bank"); setChargeStep(1); }} className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all text-right">
                      <h4 className="font-bold text-foreground text-sm mb-2">🏦 تحويل مصرفي</h4>
                      <p className="text-xs text-muted-foreground">حوّل للحساب وأرفق إثبات التحويل.</p>
                    </button>
                    <button onClick={() => { setChargeMethod("electronic"); setChargeStep(1); }} className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all text-right">
                      <h4 className="font-bold text-foreground text-sm mb-2">📱 خدمات إلكترونية</h4>
                      <p className="text-xs text-muted-foreground">ادفع عبر البطاقات المصرفية أو يسر باي.</p>
                    </button>
                  </div>
                ) : chargeMethod === "cash" ? (
                  <div className="space-y-4">
                    {chargeStep === 1 && (
                      <div className="glass rounded-xl p-4">
                        <p className="text-sm text-foreground mb-4">عميلنا العزيز، في هذه العملية سوف نرسل لك مندوب لاستلام القيمة منك.</p>
                        <div className="flex gap-2">
                          <button onClick={() => setChargeStep(2)} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">موافق</button>
                          <button onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">رجوع</button>
                        </div>
                      </div>
                    )}
                    {chargeStep === 2 && (
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("كاش", Object.fromEntries(fd)); }} className="space-y-3">
                        <input name="recipientName" required placeholder="اسم المستلم" className={inputClass} />
                        <input name="companyName" required placeholder="اسم الشركة" defaultValue={user.companyName} className={inputClass} />
                        <input name="phone" required placeholder="رقم الهاتف" className={inputClass} />
                        <input name="city" required placeholder="المدينة" className={inputClass} />
                        <input name="area" required placeholder="المنطقة" className={inputClass} />
                        <input name="amount" type="number" required placeholder="القيمة بالدينار الليبي" className={inputClass} />
                        <p className="text-xs text-warning">⚠️ تنبيه: إذا لم ترسل صورة الوصل عند الاستلام من المندوب فلا يمكن شحن المحفظة.</p>
                        <div className="flex gap-2">
                          <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">إرسال</button>
                          <button type="button" onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">رجوع</button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : chargeMethod === "bank" ? (
                  <div className="space-y-4">
                    {chargeStep === 1 && (
                      <div className="glass rounded-xl p-4">
                        <p className="text-sm text-foreground mb-4">عميلنا العزيز، سترى رقم الحساب للتحويل ثم تعبئة النموذج وإرساله.</p>
                        <div className="flex gap-2">
                          <button onClick={() => setChargeStep(2)} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">موافق</button>
                          <button onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">رجوع</button>
                        </div>
                      </div>
                    )}
                    {chargeStep === 2 && (
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("تحويل مصرفي", Object.fromEntries(fd)); }} className="space-y-3">
                        <div className="glass rounded-xl p-4 border-primary/30">
                          <p className="text-sm text-foreground font-bold">رقم الحساب للتحويل:</p>
                          <p className="text-lg font-black text-primary">{adminProfile.bankAccount || "لم يتم تحديده بعد"}</p>
                        </div>
                        <input name="senderName" required placeholder="اسم المرسل" className={inputClass} />
                        <input name="senderAccount" required placeholder="رقم حسابك" className={inputClass} />
                        <input name="phone" required placeholder="رقم الهاتف" className={inputClass} />
                        <input name="amount" type="number" required placeholder="المبلغ المحوّل" className={inputClass} />
                        <p className="text-xs text-warning">⚠️ بدون صورة إثبات التحويل لا يمكن شحن المحفظة.</p>
                        <div className="flex gap-2">
                          <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">إرسال</button>
                          <button type="button" onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">رجوع</button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm text-foreground mb-2">اتبع الخطوات التالية:</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>اضغط على الرابط أدناه</li>
                        <li>أكمل عملية الدفع</li>
                        <li>عبّئ النموذج وأرفق إثبات التحويل</li>
                      </ol>
                      <a href="https://mypay.ly/payment-link/share/iaRcZr4cFXa44OMlTriXZl2VcpO94d2X7AYPYQwWUEnwhGKZ4nGx9P3noBdU" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-primary hover:underline font-bold">🔗 رابط الدفع الإلكتروني</a>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("خدمات إلكترونية", Object.fromEntries(fd)); }} className="space-y-3">
                      <input name="senderName" required placeholder="اسم المرسل" className={inputClass} />
                      <input name="phone" required placeholder="رقم الهاتف" className={inputClass} />
                      <input name="amount" type="number" required placeholder="المبلغ" className={inputClass} />
                      <p className="text-xs text-warning">⚠️ أرفق صورة تثبت التحويل.</p>
                      <div className="flex gap-2">
                        <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">إرسال</button>
                        <button type="button" onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">رجوع</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Wallet request tracking */}
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">متابعة عمليات الشحن</h3>
                {(() => {
                  const reqs = JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]").filter((r: any) => r.companyId === user.id);
                  return reqs.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد عمليات شحن.</p> : (
                    <div className="space-y-2">
                      {reqs.map((r: any) => (
                        <div key={r.id} className="flex items-center justify-between glass rounded-xl p-3">
                          <div>
                            <span className="text-sm font-bold text-foreground">{r.amount} د.ل</span>
                            <span className="text-xs text-muted-foreground mr-2">- {r.method}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${r.status === "approved" ? "bg-success/20 text-success" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>
                            {r.status === "approved" ? "تم القبول" : r.status === "rejected" ? "مرفوض" : r.status === "processing" ? "قيد الشحن" : "معلّق"}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">المنتجات ({products.length})</h3>
                <button onClick={() => setShowAddProduct(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة منتج</button>
              </div>
              {showAddProduct && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveProduct(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <h4 className="font-bold text-foreground">إنشاء منتج جديد</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">اسم المنتج *</label><input name="name" required placeholder="اسم المنتج" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">كود المنتج</label><input name="code" placeholder="كود فريد" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">نوع المنتج</label>
                      <select name="type" className={inputClass}><option>إلكترونيات</option><option>ملابس</option><option>مواد غذائية</option><option>أدوية</option><option>مستحضرات تجميل</option><option>قطع غيار</option><option>أثاث</option><option>مواد بناء</option><option>أخرى</option></select>
                    </div>
                    <div><label className="text-xs font-bold text-foreground">الكمية الموجودة *</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">سعر الشراء *</label><input name="buyPrice" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">سعر البيع *</label><input name="sellPrice" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">أسعار إضافية</label><input name="extraPrices" placeholder="سعر الجملة، سعر خاص..." className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">المقاسات / الأحجام</label><input name="sizes" placeholder="S, M, L, XL" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">الباركود</label><input name="barcode" placeholder="رقم الباركود" className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ المنتج</button>
                    <button type="button" onClick={() => setShowAddProduct(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">إلغاء</button>
                  </div>
                </form>
              )}
              {products.length === 0 && !showAddProduct ? (
                <div className="glass rounded-2xl p-6 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">لم تقم بإضافة أي منتجات بعد. ابدأ بإضافة أول منتج لك.</p>
                </div>
              ) : products.length > 0 && (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <div className="flex items-center justify-end mb-3"><button className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> تحميل PDF</button></div>
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">المنتج</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">الكود</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">النوع</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">الكمية</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">سعر البيع</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">الإجراءات</th>
                    </tr></thead>
                    <tbody>
                      {products.map((p: any) => (
                        <tr key={p.id} className="border-b border-border/30">
                          <td className="py-2 px-3 text-foreground font-medium">{p.name}</td>
                          <td className="py-2 px-3 text-muted-foreground">{p.code || "-"}</td>
                          <td className="py-2 px-3 text-muted-foreground">{p.type}</td>
                          <td className="py-2 px-3 text-foreground">{p.quantity}</td>
                          <td className="py-2 px-3 text-primary font-bold">{p.sellPrice} د.ل</td>
                          <td className="py-2 px-3 flex gap-1">
                            <button className="text-primary"><Edit className="h-4 w-4" /></button>
                            <button className="text-destructive" onClick={() => { const up = products.filter((pr: any) => pr.id !== p.id); localStorage.setItem(`madar_products_${user.id}`, JSON.stringify(up)); window.location.reload(); }}><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Stock Movements */}
          {activeTab === "stock" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">حركة المخزون</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddMovement(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة حركة</button>
                  <button className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">تسجيل جميع العمليات والنشاطات داخل المخازن: جرد، إضافة، حذف، تلف، انتهاء صلاحية.</p>
              {showAddMovement && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveMovement(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">المنتج</label><select name="product" className={inputClass}>{products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-foreground">نوع الحركة</label><select name="movementType" className={inputClass}><option>إضافة</option><option>سحب</option><option>تلف</option><option>مرتجع</option><option>جرد</option><option>انتهاء صلاحية</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">الكمية</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">سبب الحركة</label><input name="reason" className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">ملاحظات</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ</button>
                    <button type="button" onClick={() => setShowAddMovement(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">إلغاء</button>
                  </div>
                </form>
              )}
              {movements.length === 0 ? (
                <div className="glass rounded-2xl p-6 text-center"><Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">لا توجد حركات مخزون مسجلة.</p></div>
              ) : (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">المنتج</th><th className="text-right py-2 px-3 text-muted-foreground">النوع</th><th className="text-right py-2 px-3 text-muted-foreground">الكمية</th><th className="text-right py-2 px-3 text-muted-foreground">التاريخ</th><th className="text-right py-2 px-3 text-muted-foreground">بواسطة</th></tr></thead>
                    <tbody>{movements.map((m: any) => (<tr key={m.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground">{m.product}</td><td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{m.movementType}</span></td><td className="py-2 px-3 text-foreground">{m.quantity}</td><td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.date).toLocaleDateString("ar-LY")}</td><td className="py-2 px-3 text-muted-foreground">{m.by}</td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Barcode */}
          {activeTab === "barcode" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">نظام الباركود</h3>
                <p className="text-sm text-muted-foreground mb-4">إنشاء باركود تلقائياً أو يدوياً، ومسح الباركود للبحث عن المنتجات.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="glass rounded-xl p-4 text-center hover:border-primary/50 transition-all"><QrCode className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">إنشاء باركود</p><p className="text-xs text-muted-foreground">إنشاء تلقائي أو يدوي</p></button>
                  <button className="glass rounded-xl p-4 text-center hover:border-primary/50 transition-all"><Search className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">مسح باركود</p><p className="text-xs text-muted-foreground">مسح بالكاميرا للبحث</p></button>
                  <button className="glass rounded-xl p-4 text-center hover:border-primary/50 transition-all"><Upload className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">رفع باركود</p><p className="text-xs text-muted-foreground">رفع صورة باركود</p></button>
                </div>
              </div>
            </div>
          )}

          {/* Suppliers */}
          {activeTab === "suppliers" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">الموردين ({suppliers.length})</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddSupplier(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة مورد</button>
                  <button className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">المورد هو الشخص أو الشركة التي تشتري منها بضاعتك أو تبيع لها. يمكنك إدارة بيانات الموردين وتتبع التعاملات معهم.</p>
              {showAddSupplier && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveSupplier(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">اسم المورد *</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">رقم الهاتف</label><input name="phone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">نوع التعامل</label><select name="dealType" className={inputClass}><option>يبيع لنا</option><option>يشتري منا</option><option>كلاهما</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">المدينة</label><input name="city" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">العنوان</label><input name="address" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">الشروط</label><input name="terms" className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">تفاصيل إضافية</label><textarea name="details" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ</button>
                    <button type="button" onClick={() => setShowAddSupplier(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">إلغاء</button>
                  </div>
                </form>
              )}
              {suppliers.length === 0 && !showAddSupplier ? (
                <div className="glass rounded-2xl p-6 text-center"><Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">لم تقم بإضافة أي موردين بعد.</p></div>
              ) : suppliers.length > 0 && (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">المورد</th><th className="text-right py-2 px-3 text-muted-foreground">الهاتف</th><th className="text-right py-2 px-3 text-muted-foreground">التعامل</th><th className="text-right py-2 px-3 text-muted-foreground">المدينة</th><th className="text-right py-2 px-3 text-muted-foreground">الإجراءات</th></tr></thead>
                    <tbody>{suppliers.map((s: any) => (<tr key={s.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground font-medium">{s.name}</td><td className="py-2 px-3 text-muted-foreground">{s.phone}</td><td className="py-2 px-3 text-muted-foreground">{s.dealType}</td><td className="py-2 px-3 text-muted-foreground">{s.city}</td><td className="py-2 px-3"><button className="text-destructive" onClick={() => { const up = suppliers.filter((sp: any) => sp.id !== s.id); localStorage.setItem(`madar_suppliers_${user.id}`, JSON.stringify(up)); window.location.reload(); }}><Trash2 className="h-4 w-4" /></button></td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Inventory */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">الجرد</h3>
                <p className="text-sm text-muted-foreground mb-4">اختر نوع الجرد المناسب: بشري (يدوي) أو ذكاء اصطناعي (تلقائي).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <button onClick={() => setInventoryType("human")} className={`glass rounded-xl p-4 text-right transition-all ${inventoryType === "human" ? "border-primary/50" : "hover:border-primary/30"}`}>
                    <h4 className="font-bold text-foreground text-sm">👤 جرد بشري</h4>
                    <p className="text-xs text-muted-foreground">جرد يدوي بواسطة الموظفين مع نموذج تسجيل</p>
                  </button>
                  <button onClick={() => setInventoryType("ai")} className={`glass rounded-xl p-4 text-right transition-all ${inventoryType === "ai" ? "border-primary/50" : "hover:border-primary/30"}`}>
                    <h4 className="font-bold text-foreground text-sm">🤖 جرد بالذكاء الاصطناعي</h4>
                    <p className="text-xs text-muted-foreground">جرد تلقائي يحلل البيانات ويكشف الفروقات</p>
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                  {["جرد كامل","جرد جزئي","جرد مفاجئ","جرد دوري","جرد أسبوعي","جرد شهري"].map(t => (
                    <button key={t} className="glass rounded-lg p-2 text-xs text-foreground hover:border-primary/30 transition-all">{t}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">بدء الجرد</button>
                  <button className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> تحميل سجل الجرد PDF</button>
                </div>
              </div>
            </div>
          )}

          {/* Reorder */}
          {activeTab === "reorder" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">اقتراحات إعادة الطلب الذكية</h3>
                <p className="text-sm text-muted-foreground mb-4">تحليل معدل الاستهلاك واقتراح الكميات المثالية.</p>
                <div className="glass rounded-xl p-4 mb-4">
                  <h4 className="font-bold text-foreground text-sm mb-2">كيف تعمل إعادة الطلب الذكية؟</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">يقوم النظام بتحليل حركة بيع كل منتج خلال آخر 30 يوم وحساب معدل الاستهلاك اليومي. ثم يحسب:</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                    <li>• كم يوم يكفي المخزون الحالي — بناءً على معدل البيع</li>
                    <li>• الكمية المثالية للطلب — تكفي لـ 30 يوم + مخزون أمان 7 أيام</li>
                    <li>• مستوى الاستعجال — 🔴 حرج (ينفد قبل وصول الطلب) · 🟡 قريب · 🟢 مخطط</li>
                    <li>• المنتجات الراكدة — منتجات لم تتحرك خلال 30 يوم</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-primary">0</p><p className="text-xs text-muted-foreground">منتج يحتاج طلب</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-warning">0</p><p className="text-xs text-muted-foreground">منتج راكد</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Returns/Damaged */}
          {activeTab === "returns" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">التالف والمرتجعات</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddDamaged(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إنشاء</button>
                  <button className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
              </div>
              {showAddDamaged && (
                <form onSubmit={(e) => { e.preventDefault(); setShowAddDamaged(false); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">المنتج</label><select name="product" className={inputClass}>{products.map((p: any) => <option key={p.id}>{p.name}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-foreground">النوع</label><select name="type" className={inputClass}><option>تالف</option><option>مرتجع</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">الكمية</label><input name="quantity" type="number" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">السبب</label><input name="reason" className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ</button>
                    <button type="button" onClick={() => setShowAddDamaged(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">إلغاء</button>
                  </div>
                </form>
              )}
              <div className="glass rounded-2xl p-6 text-center"><RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">لا توجد سجلات تالف أو مرتجعات.</p></div>
            </div>
          )}

          {/* Profits */}
          {activeTab === "profits" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">الأرباح</h3>
                  <button className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">رأس المال</p><p className="text-xl font-black text-foreground">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">الأرباح</p><p className="text-xl font-black text-success">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">قيمة المخزون (بيع)</p><p className="text-xl font-black text-primary">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">الخسارة</p><p className="text-xl font-black text-destructive">0 د.ل</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">التقارير والتحليلات</h3>
              <p className="text-sm text-muted-foreground">جميع التقارير قابلة للتحميل بصيغة PDF.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {["تقرير المنتجات","تقرير الأوامر","تقرير الحركات","تقرير الموردين"].map(r => (
                  <div key={r} className="glass rounded-xl p-4">
                    <FileText className="h-6 w-6 text-primary mb-2" />
                    <p className="text-sm font-bold text-foreground">{r}</p>
                    <button className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"><Download className="h-3 w-3" /> تحميل PDF</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accounting */}
          {activeTab === "accounting" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">المحاسبة</h3>
                <p className="text-sm text-muted-foreground mb-4">المحاسبة الشاملة: يومية وأسبوعية وشهرية وسنوية. يمكن استخدام المحاسبة البشرية أو بالذكاء الاصطناعي.</p>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[{k:"daily",l:"يومي"},{k:"weekly",l:"أسبوعي"},{k:"monthly",l:"شهري"},{k:"yearly",l:"سنوي"}].map(t => (
                    <button key={t.k} onClick={() => setAccountingTab(t.k)} className={`px-4 py-2 rounded-xl text-sm transition-all ${accountingTab === t.k ? "gradient-primary text-primary-foreground font-bold" : "border border-border text-foreground"}`}>{t.l}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">المبيعات</p><p className="text-xl font-black text-primary">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">المصروفات</p><p className="text-xl font-black text-destructive">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">صافي الربح</p><p className="text-xl font-black text-success">0 د.ل</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">الرواتب</p><p className="text-xl font-black text-warning">0 د.ل</p></div>
                </div>
                <button className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><Download className="h-4 w-4" /> تحميل التقرير PDF</button>
              </div>
            </div>
          )}

          {/* HR */}
          {activeTab === "hr" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">الموارد البشرية</h3>
                <button onClick={() => setShowAddEmployee(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة موظف</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[{k:"overview",l:"نظرة عامة"},{k:"contracts",l:"العقود"},{k:"attendance",l:"الحضور"},{k:"leaves",l:"الإجازات"},{k:"salaries",l:"الرواتب"},{k:"advances",l:"السلف"},{k:"violations",l:"المخالفات"},{k:"rewards",l:"المكافآت"},{k:"tasks",l:"المهام"},{k:"notifications",l:"الإشعارات"}].map(t => (
                  <button key={t.k} onClick={() => setHrTab(t.k)} className={`px-3 py-1.5 rounded-xl text-xs transition-all ${hrTab === t.k ? "gradient-primary text-primary-foreground font-bold" : "border border-border text-foreground"}`}>{t.l}</button>
                ))}
              </div>
              
              {showAddEmployee && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveEmployee(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <h4 className="font-bold text-foreground">إضافة موظف جديد</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">الاسم الكامل *</label><input name="fullName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">الهاتف</label><input name="phone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">البريد الإلكتروني</label><input name="email" type="email" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">الوظيفة</label><input name="position" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">القسم</label><input name="department" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">الراتب الأساسي</label><input name="salary" type="number" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">نوع العقد</label><select name="contractType" className={inputClass}><option>دائم</option><option>مؤقت</option><option>جزئي</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">نهاية العقد</label><input name="contractEnd" type="date" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">الرقم الوطني</label><input name="nationalId" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">المؤهل</label><input name="qualification" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">اسم المصرف</label><input name="bankName" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">رقم الحساب</label><input name="bankAccount" className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ</button>
                    <button type="button" onClick={() => setShowAddEmployee(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">إلغاء</button>
                  </div>
                </form>
              )}

              {hrTab === "overview" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-primary">{employees.length}</p><p className="text-xs text-muted-foreground">إجمالي الموظفين</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-success">0</p><p className="text-xs text-muted-foreground">حاضرين اليوم</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-warning">0</p><p className="text-xs text-muted-foreground">في إجازة</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-destructive">0</p><p className="text-xs text-muted-foreground">غائبين</p></div>
                </div>
              )}

              {hrTab === "contracts" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">العقود</h4><button className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> طباعة</button></div>
                  {employees.length === 0 ? <p className="text-sm text-muted-foreground">لا توجد عقود.</p> : (
                    <div className="space-y-2">{employees.map((e: any) => (<div key={e.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{e.fullName}</p><p className="text-xs text-muted-foreground">{e.position} - {e.contractType}</p></div><span className="text-xs text-muted-foreground">{e.contractEnd || "غير محدد"}</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "attendance" && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-4">سجل الحضور والانصراف</h4>
                  <p className="text-sm text-muted-foreground mb-4">مواعيد العمل: يمكن تحديد متى يبدأ العمل ومتى ينتهي، وكم دقيقة تأخير مسموح، وبعد كم يعتبر غياب.</p>
                  <button className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> تحميل PDF</button>
                </div>
              )}

              {hrTab === "salaries" && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-4">الرواتب</h4>
                  <div className="flex gap-2 mb-4">
                    <button className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Send className="h-4 w-4" /> إرسال الرواتب</button>
                    <button className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> كشف الرواتب PDF</button>
                  </div>
                  {employees.length === 0 ? <p className="text-sm text-muted-foreground">لا يوجد موظفون.</p> : (
                    <div className="space-y-2">{employees.map((e: any) => (<div key={e.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{e.fullName}</p><p className="text-xs text-muted-foreground">{e.position}</p></div><span className="text-sm font-bold text-primary">{e.salary || 0} د.ل</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "violations" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">المخالفات</h4><button onClick={() => setShowAddViolation(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إنشاء مخالفة</button></div>
                  {showAddViolation && (
                    <form onSubmit={(e) => { e.preventDefault(); setShowAddViolation(false); }} className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select className={inputClass}><option value="">اختر الموظف</option>{employees.map((e: any) => <option key={e.id}>{e.fullName}</option>)}</select>
                        <input placeholder="قيمة المخالفة" type="number" className={inputClass} />
                        <input placeholder="السبب" className={inputClass} />
                      </div>
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ</button>
                    </form>
                  )}
                  <p className="text-sm text-muted-foreground">لا توجد مخالفات مسجلة.</p>
                </div>
              )}

              {hrTab === "rewards" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">المكافآت</h4><button onClick={() => setShowAddReward(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إنشاء مكافأة</button></div>
                  {showAddReward && (
                    <form onSubmit={(e) => { e.preventDefault(); setShowAddReward(false); }} className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select className={inputClass}><option value="">اختر الموظف</option>{employees.map((e: any) => <option key={e.id}>{e.fullName}</option>)}</select>
                        <input placeholder="قيمة المكافأة" type="number" className={inputClass} />
                        <input placeholder="السبب" className={inputClass} />
                      </div>
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ</button>
                    </form>
                  )}
                  <p className="text-sm text-muted-foreground">لا توجد مكافآت مسجلة.</p>
                </div>
              )}

              {hrTab === "tasks" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">المهام</h4><button onClick={() => setShowAddTask(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة مهمة</button></div>
                  {showAddTask && (
                    <form onSubmit={(e) => { e.preventDefault(); setShowAddTask(false); }} className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select className={inputClass}><option value="">اختر الموظف</option>{employees.map((e: any) => <option key={e.id}>{e.fullName}</option>)}</select>
                        <input placeholder="عنوان المهمة" className={inputClass} />
                        <input placeholder="مدة التسليم" type="date" className={inputClass} />
                        <select className={inputClass}><option>أساسية</option><option>إضافية</option></select>
                      </div>
                      <textarea placeholder="تفاصيل المهمة" rows={2} className={inputClass} />
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ</button>
                    </form>
                  )}
                  <p className="text-sm text-muted-foreground">لا توجد مهام مسجلة.</p>
                </div>
              )}

              {["leaves","advances","notifications"].includes(hrTab) && (
                <div className="glass rounded-2xl p-6 text-center">
                  <Briefcase className="h-12 w-12 text-primary mx-auto mb-3" />
                  <h4 className="font-bold text-foreground mb-2">{{leaves:"الإجازات",advances:"السلف والسحب المبكر",notifications:"الإشعارات"}[hrTab]}</h4>
                  <p className="text-sm text-muted-foreground">لا توجد بيانات. ستظهر هنا عند إضافة طلبات جديدة.</p>
                </div>
              )}
            </div>
          )}

          {/* Users */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">المستخدمين (الموظفين) ({companyUsers.length})</h3>
                <button onClick={() => setShowAddUser(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> إضافة مستخدم</button>
              </div>
              <div className="glass rounded-2xl p-4"><p className="text-xs text-warning">⚠️ المستخدمون لا يمكنهم إنشاء حسابات بأنفسهم. أضفهم من هنا وحدد صلاحياتهم.</p></div>
              {showAddUser && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveUser(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">اسم المستخدم *</label><input name="username" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">البريد الإلكتروني *</label><input name="email" type="email" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">كلمة المرور *</label><input name="password" type="password" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">الصلاحية</label>
                      <select name="role" className={inputClass}><option>مسؤول مخزن</option><option>محاسب</option><option>مسؤول جرد</option><option>مسؤول منتجات</option><option>مسؤول موارد بشرية</option><option>موظف عادي</option></select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">إضافة</button>
                    <button type="button" onClick={() => setShowAddUser(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">إلغاء</button>
                  </div>
                </form>
              )}
              {companyUsers.length === 0 && !showAddUser ? (
                <div className="glass rounded-2xl p-6 text-center"><Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">لم تقم بإضافة أي مستخدمين بعد.</p></div>
              ) : companyUsers.length > 0 && (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">المستخدم</th><th className="text-right py-2 px-3 text-muted-foreground">البريد</th><th className="text-right py-2 px-3 text-muted-foreground">الصلاحية</th></tr></thead>
                    <tbody>{companyUsers.map((u: any) => (<tr key={u.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground">{u.username}</td><td className="py-2 px-3 text-muted-foreground">{u.email}</td><td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{u.role}</span></td></tr>))}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Permissions */}
          {activeTab === "permissions" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">الصلاحيات والتوظيف</h3>
              <p className="text-sm text-muted-foreground mb-4">حدد صلاحيات كل موظف. كل قسم موجود في القائمة يمكن تشغيله أو إيقاف ظهوره لأي موظف.</p>
              {companyUsers.length === 0 ? <p className="text-sm text-muted-foreground">لا يوجد موظفون. أضف مستخدمين أولاً.</p> : (
                <div className="space-y-4">
                  {companyUsers.map((u: any) => (
                    <div key={u.id} className="glass rounded-xl p-4">
                      <p className="font-bold text-foreground mb-2">{u.username} - <span className="text-primary">{u.role}</span></p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {flatItems.map(item => (
                          <label key={item.key} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded" />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Log */}
          {activeTab === "activity-log" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">سجل النشاطات</h3>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs">تصفية</button>
                  <button className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs">حذف الكل</button>
                </div>
              </div>
              <div className="glass rounded-xl p-6 text-center"><Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">لا توجد نشاطات مسجلة.</p></div>
            </div>
          )}

          {/* Fraud */}
          {activeTab === "fraud" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">كشف التلاعب والاحتيال</h3>
              <div className="glass rounded-xl p-6 text-center"><AlertTriangle className="h-12 w-12 text-success mx-auto mb-3" /><p className="text-foreground font-bold">لا توجد عمليات مشبوهة</p></div>
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">إعدادات الشركة</h3>
                <p className="text-sm text-muted-foreground mb-4">تعديل هوية الشركة وشعارها واسمها وإعدادات صفحة دخول المستخدمين الخاصة بالشركة.</p>
                <div className="space-y-3 max-w-lg">
                  <div><label className="text-sm font-bold text-foreground">اسم الشركة</label><input defaultValue={user.companyName} className={inputClass} /></div>
                  <div><label className="text-sm font-bold text-foreground">شعار الشركة</label><div className="glass rounded-xl p-4 text-center"><Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-xs text-muted-foreground">اسحب الشعار هنا أو انقر للتحميل</p></div></div>
                  <button className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">حفظ التغييرات</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">حالة المنصة</h3>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><RotateCcw className="h-4 w-4" /> تنظيف الذاكرة</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompanyDashboard;
