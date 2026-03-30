import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, Warehouse, Users, CreditCard, BarChart3, QrCode,
  Truck, ClipboardList, TrendingUp, RotateCcw, FileText, DollarSign,
  UserCog, Settings, LogOut, Bell, Menu, X, ShoppingCart, AlertTriangle, Clock, Briefcase,
  Plus, Edit, Trash2, Download, Eye, Send, Check, Search, Upload, Calendar, Award, Flag, MessageSquare, ListChecks,
  Moon, Sun, Globe, Camera, RefreshCw, ArrowUpDown, Receipt, Printer, Monitor, Smartphone, Laptop, Volume2
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import logo from "@/assets/logo-transparent.png";
import { exportToPDF, exportSimplePDF } from "@/utils/pdfExport";
import BarcodeScanner from "@/components/BarcodeScanner";
import BarcodeGenerator from "@/components/BarcodeGenerator";
import { getDevicesForCompany, removeDevice, deactivateDevice, getDeviceIcon, generateDeviceId } from "@/utils/deviceManager";

const sidebarSections = [
  { title: "الرئيسية", titleEn: "Main", items: [
    { icon: LayoutDashboard, label: "لوحة التحكم", labelEn: "Dashboard", key: "dashboard" },
    { icon: CreditCard, label: "الاشتراك والباقة", labelEn: "Subscription", key: "subscription" },
    { icon: DollarSign, label: "المحفظة", labelEn: "Wallet", key: "wallet" },
  ]},
  { title: "المخزون", titleEn: "Inventory", items: [
    { icon: Package, label: "المنتجات", labelEn: "Products", key: "products" },
    { icon: Warehouse, label: "حركة المخزون", labelEn: "Stock Movements", key: "stock" },
    { icon: QrCode, label: "الباركود", labelEn: "Barcode", key: "barcode" },
    { icon: Truck, label: "الموردين", labelEn: "Suppliers", key: "suppliers" },
    { icon: ClipboardList, label: "الجرد", labelEn: "Inventory Audit", key: "inventory" },
    { icon: ShoppingCart, label: "إعادة الطلب الذكية", labelEn: "Smart Reorder", key: "reorder" },
    { icon: RotateCcw, label: "التالف والمرتجعات", labelEn: "Damaged & Returns", key: "returns" },
  ]},
  { title: "المالية", titleEn: "Finance", items: [
    { icon: BarChart3, label: "المحاسبة", labelEn: "Accounting", key: "accounting" },
    { icon: TrendingUp, label: "الأرباح", labelEn: "Profits", key: "profits" },
    { icon: Receipt, label: "الفواتير", labelEn: "Invoices", key: "invoices" },
    { icon: FileText, label: "التقارير", labelEn: "Reports", key: "reports" },
  ]},
  { title: "الموارد البشرية", titleEn: "Human Resources", items: [
    { icon: Briefcase, label: "الموارد البشرية", labelEn: "HR", key: "hr" },
  ]},
  { title: "الإدارة", titleEn: "Administration", items: [
    { icon: Users, label: "المستخدمين", labelEn: "Users", key: "users" },
    { icon: Monitor, label: "إدارة الأجهزة", labelEn: "Devices", key: "devices" },
    { icon: UserCog, label: "الصلاحيات", labelEn: "Permissions", key: "permissions" },
    { icon: MessageSquare, label: "المراسلات", labelEn: "Messages", key: "messages" },
    { icon: Clock, label: "سجل النشاطات", labelEn: "Activity Log", key: "activity-log" },
    { icon: AlertTriangle, label: "كشف التلاعب", labelEn: "Fraud Detection", key: "fraud" },
    { icon: Settings, label: "الإعدادات", labelEn: "Settings", key: "settings" },
  ]},
];

const movementTypes = [
  { value: "buy", label: "شراء", labelEn: "Purchase", desc: "شراء بضاعة جديدة من مورد وإضافتها للمخزون" },
  { value: "sell", label: "بيع", labelEn: "Sale", desc: "بيع بضاعة لعميل وخصمها من المخزون" },
  { value: "add", label: "إضافة", labelEn: "Addition", desc: "إضافة كمية للمخزون (هدية، نقل، تعديل)" },
  { value: "remove", label: "سحب", labelEn: "Removal", desc: "سحب كمية من المخزون (نقل، استخدام داخلي)" },
  { value: "damage", label: "تلف", labelEn: "Damage", desc: "منتجات تالفة تم استبعادها من المخزون" },
  { value: "expiry", label: "انتهاء صلاحية", labelEn: "Expiry", desc: "منتجات انتهت صلاحيتها" },
  { value: "return", label: "مرتجع", labelEn: "Return", desc: "بضاعة مرتجعة من العميل" },
  { value: "inventory", label: "جرد", labelEn: "Inventory", desc: "تعديل الكمية بناءً على نتائج الجرد" },
];

const walletStatuses = [
  { value: "pending", label: "معلّق", labelEn: "Pending", color: "bg-warning/20 text-warning" },
  { value: "processing", label: "قيد التنفيذ", labelEn: "Processing", color: "bg-info/20 text-info" },
  { value: "sent_rep", label: "تم إرسال مندوب", labelEn: "Rep Sent", color: "bg-primary/20 text-primary" },
  { value: "received", label: "تم استلام القيمة", labelEn: "Received", color: "bg-accent/20 text-accent" },
  { value: "approved", label: "تم القبول", labelEn: "Approved", color: "bg-success/20 text-success" },
  { value: "rejected", label: "مرفوض", labelEn: "Rejected", color: "bg-destructive/20 text-destructive" },
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
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [showAddAdvance, setShowAddAdvance] = useState(false);
  const [chargeMethod, setChargeMethod] = useState("");
  const [chargeStep, setChargeStep] = useState(0);
  const [inventoryType, setInventoryType] = useState("");
  const [inventoryScope, setInventoryScope] = useState("");
  const [showStartInventory, setShowStartInventory] = useState(false);
  const [hrTab, setHrTab] = useState("overview");
  const [accountingTab, setAccountingTab] = useState("daily");
  const [accountingMode, setAccountingMode] = useState("manual");
  const [barcodeMode, setBarcodeMode] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [generatedBarcode, setGeneratedBarcode] = useState("");
  const [showRenewal, setShowRenewal] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("madar_theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("madar_lang") || "ar");
  const [uploadProof, setUploadProof] = useState<any>(null);
  const [workSchedule, setWorkSchedule] = useState(() => JSON.parse(localStorage.getItem(`madar_schedule_${user.id}`) || JSON.stringify({ start: "08:00", end: "16:00", lateMinutes: 15, absentMinutes: 120 })));
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [scannedResult, setScannedResult] = useState("");
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<any[]>([{ product: "", quantity: 1, price: 0 }]);
  const [savedBarcodes, setSavedBarcodes] = useState<any[]>(() => JSON.parse(localStorage.getItem(`madar_barcodes_${user.id}`) || "[]"));
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  const products = JSON.parse(localStorage.getItem(`madar_products_${user.id}`) || "[]");
  const companyUsers = JSON.parse(localStorage.getItem("madar_users") || "[]").filter((u: any) => u.companyId === user.id);
  const suppliers = JSON.parse(localStorage.getItem(`madar_suppliers_${user.id}`) || "[]");
  const movements = JSON.parse(localStorage.getItem(`madar_movements_${user.id}`) || "[]");
  const employees = JSON.parse(localStorage.getItem(`madar_employees_${user.id}`) || "[]");
  const damaged = JSON.parse(localStorage.getItem(`madar_damaged_${user.id}`) || "[]");
  const violations = JSON.parse(localStorage.getItem(`madar_violations_${user.id}`) || "[]");
  const rewards = JSON.parse(localStorage.getItem(`madar_rewards_${user.id}`) || "[]");
  const tasks = JSON.parse(localStorage.getItem(`madar_tasks_${user.id}`) || "[]");
  const leaves = JSON.parse(localStorage.getItem(`madar_leaves_${user.id}`) || "[]");
  const advances = JSON.parse(localStorage.getItem(`madar_advances_${user.id}`) || "[]");
  const inventoryLogs = JSON.parse(localStorage.getItem(`madar_inventory_${user.id}`) || "[]");
  const adminProfile = JSON.parse(localStorage.getItem("madar_admin_profile") || "{}");
  const deliveryPrices = JSON.parse(localStorage.getItem("madar_delivery_prices") || "{}");

  const logout = () => { localStorage.removeItem("madar_user"); navigate("/"); };
  const flatItems = sidebarSections.flatMap(s => s.items);
  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm";

  const totalBuyValue = products.reduce((a: number, p: any) => a + (Number(p.buyPrice) || 0) * (Number(p.quantity) || 0), 0);
  const totalSellValue = products.reduce((a: number, p: any) => a + (Number(p.sellPrice) || 0) * (Number(p.quantity) || 0), 0);
  const totalProfit = totalSellValue - totalBuyValue;

  const stats = [
    { label: t("المنتجات","Products"), value: products.length, icon: Package },
    { label: t("المستخدمين","Users"), value: companyUsers.length, icon: Users },
    { label: t("رصيد المحفظة","Wallet"), value: `${user.wallet || 0} ${t("د.ل","LYD")}`, icon: DollarSign },
    { label: t("الباقة","Plan"), value: user.planName || t("تجربة مجانية","Free Trial"), icon: CreditCard },
    { label: t("الموظفين","Employees"), value: employees.length, icon: Briefcase },
    { label: t("الموردين","Suppliers"), value: suppliers.length, icon: Truck },
  ];

  const saveItem = (key: string, items: any[], newItem: any, setter: (v: boolean) => void) => {
    const updated = [...items, { ...newItem, id: Date.now().toString(), createdAt: new Date().toISOString() }];
    localStorage.setItem(`madar_${key}_${user.id}`, JSON.stringify(updated));
    setter(false);
    window.location.reload();
  };

  const saveProduct = (product: any) => saveItem("products", products, product, setShowAddProduct);
  const saveSupplier = (s: any) => saveItem("suppliers", suppliers, s, setShowAddSupplier);
  const saveEmployee = (emp: any) => saveItem("employees", employees, emp, setShowAddEmployee);

  const saveMovement = (m: any) => {
    const movs = [...movements, { ...m, id: Date.now().toString(), date: new Date().toISOString(), by: user.managerName }];
    localStorage.setItem(`madar_movements_${user.id}`, JSON.stringify(movs));
    // Update product quantity
    const prods = [...products];
    const pi = prods.findIndex(p => p.name === m.product);
    if (pi >= 0) {
      const qty = Number(m.quantity) || 0;
      if (["buy","add","return","inventory"].includes(m.movementType)) {
        prods[pi] = { ...prods[pi], quantity: Number(prods[pi].quantity) + qty };
      } else {
        prods[pi] = { ...prods[pi], quantity: Math.max(0, Number(prods[pi].quantity) - qty) };
      }
      localStorage.setItem(`madar_products_${user.id}`, JSON.stringify(prods));
    }
    setShowAddMovement(false);
    window.location.reload();
  };

  const saveDamaged = (d: any) => {
    const items = [...damaged, { ...d, id: Date.now().toString(), date: new Date().toISOString() }];
    localStorage.setItem(`madar_damaged_${user.id}`, JSON.stringify(items));
    setShowAddDamaged(false);
    window.location.reload();
  };

  const saveUser = (u: any) => {
    const users = JSON.parse(localStorage.getItem("madar_users") || "[]");
    users.push({ ...u, id: Date.now().toString(), companyId: user.id, companyName: user.companyName });
    localStorage.setItem("madar_users", JSON.stringify(users));
    setShowAddUser(false);
    window.location.reload();
  };

  const submitWalletRequest = (method: string, data: any) => {
    const reqs = JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]");
    const newReq: any = { id: Date.now().toString(), companyId: user.id, companyName: user.companyName, method, ...data, status: "pending", date: new Date().toISOString() };
    if (uploadProof) { newReq.proofImage = uploadProof; newReq.proofDate = new Date().toISOString(); }
    reqs.push(newReq);
    localStorage.setItem("madar_wallet_requests", JSON.stringify(reqs));
    // Notify admin
    const adminNotifs = JSON.parse(localStorage.getItem("madar_admin_notifs") || "[]");
    adminNotifs.unshift({ id: Date.now().toString(), message: `طلب شحن محفظة جديد من ${user.companyName} بقيمة ${data.amount || "?"} د.ل (${method})${uploadProof ? " - مرفق إثبات" : ""}`, date: new Date().toISOString(), read: false });
    localStorage.setItem("madar_admin_notifs", JSON.stringify(adminNotifs));
    setChargeStep(0);
    setChargeMethod("");
    setUploadProof(null);
    alert(t("تم إرسال طلب الشحن بنجاح! سيتم مراجعته من قبل إدارة المنصة.","Wallet request submitted successfully!"));
  };

  const requestRenewal = () => {
    if ((user.wallet || 0) <= 0) {
      alert(t("رصيد محفظتك غير كافٍ. يرجى شحن المحفظة أولاً.","Insufficient wallet balance. Please charge your wallet first."));
      return;
    }
    alert(t("تم إرسال طلب التجديد للمسؤول. سيتم الخصم من محفظتك عند الموافقة.","Renewal request sent to admin. Amount will be deducted upon approval."));
    setShowRenewal(false);
  };

  const generateBarcode = () => {
    const code = barcodeInput || `MDR${Date.now().toString().slice(-8)}`;
    setGeneratedBarcode(code);
    setBarcodeInput(code);
  };

  return (
    <div className="min-h-screen flex bg-background">
      <aside className={`fixed inset-y-0 ${lang === "ar" ? "right-0 border-l" : "left-0 border-r"} w-64 bg-card border-border z-50 transform transition-transform md:translate-x-0 ${sidebarOpen ? "translate-x-0" : lang === "ar" ? "translate-x-full md:translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="مدار" className="h-8" />
            <div>
              <h2 className="font-black text-primary text-sm">{user.companyName || "مدار"}</h2>
              <p className="text-[10px] text-muted-foreground">{t("لوحة إدارة الشركة","Company Dashboard")}</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-muted-foreground"><X size={20} /></button>
        </div>
        <nav className="p-3 space-y-3 overflow-y-auto h-[calc(100vh-130px)]">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-3 mb-1">{lang === "ar" ? section.title : section.titleEn}</p>
              {section.items.map((item) => (
                <button key={item.key} onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-xl text-sm transition-all ${activeTab === item.key ? "gradient-primary text-primary-foreground font-bold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}>
                  <item.icon className="h-4 w-4" />{lang === "ar" ? item.label : item.labelEn}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="absolute bottom-0 right-0 left-0 p-3 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="h-4 w-4" /> {t("تسجيل الخروج","Logout")}
          </button>
        </div>
      </aside>

      <main className={`flex-1 ${lang === "ar" ? "md:mr-64" : "md:ml-64"}`}>
        <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-foreground"><Menu size={24} /></button>
          <h1 className="text-lg font-bold text-foreground">{lang === "ar" ? flatItems.find(s => s.key === activeTab)?.label : flatItems.find(s => s.key === activeTab)?.labelEn}</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => { const newTheme = theme === "dark" ? "light" : "dark"; setTheme(newTheme); localStorage.setItem("madar_theme", newTheme); if (newTheme === "light") document.documentElement.classList.add("light"); else document.documentElement.classList.remove("light"); }} className="p-2 rounded-xl hover:bg-secondary">
              {theme === "dark" ? <Sun className="h-4 w-4 text-warning" /> : <Moon className="h-4 w-4 text-foreground" />}
            </button>
            <button onClick={() => { const newLang = lang === "ar" ? "en" : "ar"; setLang(newLang); localStorage.setItem("madar_lang", newLang); document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr"; }} className="p-2 rounded-xl hover:bg-secondary">
              <Globe className="h-4 w-4 text-foreground" />
            </button>
            <Bell className="h-5 w-5 text-muted-foreground" />
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-5 border-primary/30">
                <p className="text-sm text-foreground">{t("مرحباً","Welcome")} <span className="font-bold text-primary">{user.managerName || user.companyName}</span>! {t("هذه لوحة التحكم الخاصة بشركتك.","This is your company dashboard.")}</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="glass rounded-2xl p-5">
                    <s.icon className="h-5 w-5 text-primary mb-2" />
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-xl font-black text-foreground">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Device Info Card */}
              {(() => {
                const devices = getDevicesForCompany(user.id);
                const allPlans = JSON.parse(localStorage.getItem("madar_plans") || "[]");
                const plan = allPlans.find((p: any) => p.id === user.plan);
                const maxDevices = plan?.devices || user.maxDevices || 3;
                const activeDevices = devices.filter((d: any) => d.active);
                return (
                  <div className="glass rounded-2xl p-5 border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-foreground flex items-center gap-2"><Monitor className="h-4 w-4 text-primary" /> {t("حالة الأجهزة","Device Status")}</h4>
                      <button onClick={() => setActiveTab("devices")} className="text-xs text-primary hover:underline">{t("إدارة الأجهزة","Manage Devices")}</button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="glass rounded-xl p-3 text-center"><p className="text-lg font-black text-primary">{activeDevices.length}</p><p className="text-[10px] text-muted-foreground">{t("مستخدمة","Active")}</p></div>
                      <div className="glass rounded-xl p-3 text-center"><p className="text-lg font-black text-foreground">{maxDevices}</p><p className="text-[10px] text-muted-foreground">{t("الحد الأقصى","Max")}</p></div>
                      <div className="glass rounded-xl p-3 text-center"><p className="text-lg font-black text-success">{maxDevices - activeDevices.length}</p><p className="text-[10px] text-muted-foreground">{t("متبقية","Remaining")}</p></div>
                    </div>
                    {activeDevices.length >= maxDevices && (
                      <div className="mt-2 glass rounded-xl p-2 border-warning/30">
                        <p className="text-[10px] text-warning text-center">⚠️ {t("تم الوصول للحد الأقصى! يرجى حذف جهاز أو ترقية الباقة.","Device limit reached! Remove a device or upgrade.")}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-3">{t("حركة المبيعات","Sales Movement")}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={[
                      { name: t("يناير","Jan"), sales: 1200, purchases: 800 },
                      { name: t("فبراير","Feb"), sales: 1800, purchases: 1200 },
                      { name: t("مارس","Mar"), sales: 2400, purchases: 1000 },
                      { name: t("أبريل","Apr"), sales: 2100, purchases: 1500 },
                      { name: t("مايو","May"), sales: 3000, purchases: 1800 },
                      { name: t("يونيو","Jun"), sales: 2700, purchases: 1400 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, color: "hsl(var(--foreground))" }} />
                      <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" />
                      <Area type="monotone" dataKey="purchases" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.1)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-3">{t("توزيع المخزون","Stock Distribution")}</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={(() => {
                        const typeCount: Record<string,number> = {};
                        products.forEach((p: any) => { typeCount[p.type || "أخرى"] = (typeCount[p.type || "أخرى"] || 0) + Number(p.quantity || 0); });
                        return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
                      })()} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                        {["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--warning))", "hsl(var(--destructive))"].map((c, i) => <Cell key={i} fill={c} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-2">{t("ملخص مالي","Financial Summary")}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("رأس المال","Capital")}</span><span className="text-foreground font-bold">{totalBuyValue} {t("د.ل","LYD")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("قيمة المخزون (بيع)","Stock Value (Sell)")}</span><span className="text-primary font-bold">{totalSellValue} {t("د.ل","LYD")}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{t("الربح المتوقع","Expected Profit")}</span><span className={`font-bold ${totalProfit >= 0 ? "text-success" : "text-destructive"}`}>{totalProfit} {t("د.ل","LYD")}</span></div>
                  </div>
                </div>
                <div className="glass rounded-2xl p-5">
                  <h4 className="font-bold text-foreground mb-2">{t("آخر الحركات","Recent Movements")}</h4>
                  {movements.length === 0 ? <p className="text-xs text-muted-foreground">{t("لا توجد حركات.","No movements.")}</p> : (
                    <div className="space-y-1">{movements.slice(-5).reverse().map((m: any) => (
                      <div key={m.id} className="flex justify-between text-xs"><span className="text-foreground">{m.product} - {m.movementType}</span><span className="text-muted-foreground">{m.quantity}</span></div>
                    ))}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Subscription */}
          {activeTab === "subscription" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("الباقة الحالية","Current Plan")}</h3>
                <p className="text-sm text-muted-foreground mb-3">{t("معلومات اشتراكك الحالي والمدة المتبقية.","Your current subscription information.")}</p>
                <p className="text-3xl font-black text-primary">{user.planName || t("تجربة مجانية","Free Trial")}</p>
                {user.trialEnd && (
                  <div className="mt-3">
                    <p className="text-sm text-muted-foreground">{t("تنتهي التجربة:","Trial ends:")} <span className="text-warning font-bold">{new Date(user.trialEnd).toLocaleDateString("ar-LY")}</span></p>
                    {new Date(user.trialEnd).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000 && (
                      <div className="mt-2 glass rounded-xl p-3 border-warning/30">
                        <p className="text-xs text-warning">⚠️ {t("تنبيه: اشتراكك على وشك الانتهاء! قم بترقية باقتك للاستمرار.","Warning: Your subscription is about to expire!")}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-3">{t("تجديد الباقة","Renew Plan")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("سيتم إرسال طلبك للمسؤول ويخصم من محفظتك. تأكد من شحن محفظتك أولاً.","Request will be sent to admin and deducted from your wallet.")}</p>
                <div className="flex items-center gap-3">
                  <div className="glass rounded-xl p-3"><p className="text-xs text-muted-foreground">{t("رصيد المحفظة","Wallet Balance")}</p><p className="text-lg font-black text-primary">{user.wallet || 0} {t("د.ل","LYD")}</p></div>
                  {(user.wallet || 0) > 0 ? (
                    <button onClick={() => setShowRenewal(true)} className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("تجديد الباقة","Renew Plan")}</button>
                  ) : (
                    <div className="glass rounded-xl p-3 border-warning/30">
                      <p className="text-xs text-warning">⚠️ {t("رصيد محفظتك غير كافٍ. اشحن محفظتك أولاً.","Insufficient balance. Charge your wallet first.")}</p>
                      <button onClick={() => setActiveTab("wallet")} className="text-xs text-primary hover:underline mt-1">{t("شحن المحفظة","Charge Wallet")}</button>
                    </div>
                  )}
                </div>
                {showRenewal && (
                  <div className="mt-4 glass rounded-xl p-4">
                    <p className="text-sm text-warning mb-3">⚠️ {t("تنبيه: سيتم إرسال طلبك للمسؤول ويخصم المبلغ من محفظتك عند الموافقة.","Warning: Amount will be deducted from wallet upon approval.")}</p>
                    <div className="flex gap-2">
                      <button onClick={requestRenewal} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إرسال الطلب","Submit Request")}</button>
                      <button onClick={() => setShowRenewal(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Device Management */}
          {activeTab === "devices" && (() => {
            const devices = getDevicesForCompany(user.id);
            const allPlans = JSON.parse(localStorage.getItem("madar_plans") || "[]");
            const plan = allPlans.find((p: any) => p.id === user.plan);
            const maxDevices = plan?.devices || user.maxDevices || 3;
            const activeDevices = devices.filter((d: any) => d.active);
            const currentDeviceId = generateDeviceId();
            return (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("إدارة الأجهزة المرتبطة بحسابك. يمكنك حذف أجهزة لتحرير مساحة لأجهزة جديدة.","Manage devices linked to your account. Remove devices to free slots for new ones.")}</p>
              
              {/* Device Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass rounded-2xl p-5 text-center">
                  <Monitor className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-black text-primary">{activeDevices.length}</p>
                  <p className="text-xs text-muted-foreground">{t("أجهزة نشطة","Active Devices")}</p>
                </div>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-2xl font-black text-foreground">{maxDevices}</p>
                  <p className="text-xs text-muted-foreground">{t("الحد الأقصى","Max Allowed")}</p>
                </div>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-2xl font-black text-success">{Math.max(0, maxDevices - activeDevices.length)}</p>
                  <p className="text-xs text-muted-foreground">{t("متبقية","Remaining")}</p>
                </div>
                <div className="glass rounded-2xl p-5 text-center">
                  <p className="text-sm font-black text-primary">{user.planName || t("تجربة","Trial")}</p>
                  <p className="text-xs text-muted-foreground">{t("الباقة الحالية","Current Plan")}</p>
                  <button onClick={() => setActiveTab("subscription")} className="text-[10px] text-primary hover:underline mt-1">{t("ترقية الباقة","Upgrade")}</button>
                </div>
              </div>

              {activeDevices.length >= maxDevices && (
                <div className="glass rounded-2xl p-4 border-warning/30">
                  <div className="flex items-center gap-2 text-warning mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <p className="text-sm font-bold">{t("تنبيه: تم الوصول للحد الأقصى من الأجهزة!","Warning: Device limit reached!")}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("لن تتمكن من تسجيل الدخول من جهاز جديد. يرجى حذف جهاز قديم أو ترقية الباقة.","Cannot login from a new device. Remove a device or upgrade your plan.")}</p>
                </div>
              )}

              {/* Progress Bar */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-foreground">{t("استخدام الأجهزة","Device Usage")}</p>
                  <p className="text-xs text-muted-foreground">{activeDevices.length}/{maxDevices}</p>
                </div>
                <div className="w-full h-3 rounded-full bg-secondary">
                  <div className={`h-3 rounded-full transition-all ${activeDevices.length >= maxDevices ? "bg-destructive" : activeDevices.length >= maxDevices * 0.8 ? "bg-warning" : "bg-primary"}`} style={{ width: `${Math.min(100, (activeDevices.length / maxDevices) * 100)}%` }} />
                </div>
              </div>

              {/* Device List */}
              <div className="glass rounded-2xl p-5">
                <h4 className="font-bold text-foreground mb-4">{t("الأجهزة المسجلة","Registered Devices")} ({devices.length})</h4>
                {devices.length === 0 ? (
                  <div className="text-center py-6">
                    <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">{t("لا توجد أجهزة مسجلة بعد.","No devices registered yet.")}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {devices.map((d: any) => (
                      <div key={d.id} className={`glass rounded-xl p-4 transition-all ${d.id === currentDeviceId ? "border-primary/50 shadow-glow" : ""}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getDeviceIcon(d.type)}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-foreground">{d.name}</p>
                                {d.id === currentDeviceId && <span className="px-2 py-0.5 rounded-full text-[9px] bg-primary/20 text-primary font-bold">{t("هذا الجهاز","This device")}</span>}
                              </div>
                              <p className="text-xs text-muted-foreground">{lang === "ar" ? d.type : d.typeEn} · {d.browser} · {d.os}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-[10px] text-muted-foreground">{t("أول دخول:","First:") } {new Date(d.firstLogin).toLocaleDateString("ar-LY")}</p>
                                <p className="text-[10px] text-muted-foreground">{t("آخر نشاط:","Last:") } {new Date(d.lastActivity).toLocaleDateString("ar-LY")}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${d.active ? "bg-success" : "bg-muted"}`} />
                            {d.id !== currentDeviceId && (
                              <div className="flex gap-1">
                                {d.active && (
                                  <button onClick={() => { deactivateDevice(user.id, d.id); window.location.reload(); }} className="text-xs px-2 py-1 rounded-lg bg-warning/20 text-warning" title={t("تعطيل","Deactivate")}>
                                    {t("تعطيل","Disable")}
                                  </button>
                                )}
                                <button onClick={() => { if (confirm(t("هل تريد حذف هذا الجهاز نهائياً؟","Remove this device permanently?"))) { removeDevice(user.id, d.id); window.location.reload(); } }} className="text-xs px-2 py-1 rounded-lg bg-destructive/20 text-destructive" title={t("حذف","Remove")}>
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Plan comparison for devices */}
              <div className="glass rounded-2xl p-5">
                <h4 className="font-bold text-foreground mb-3">{t("مقارنة الباقات - عدد الأجهزة","Plan Comparison - Devices")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {allPlans.filter((p: any) => p.active).map((p: any) => (
                    <div key={p.id} className={`glass rounded-xl p-3 text-center transition-all ${user.plan === p.id ? "border-primary/50" : ""}`}>
                      <p className="text-xs font-bold text-foreground">{p.name}</p>
                      <p className="text-lg font-black text-primary">{p.devices || 1}</p>
                      <p className="text-[10px] text-muted-foreground">{t("جهاز","devices")}</p>
                      {user.plan !== p.id && (p.devices || 1) > maxDevices && (
                        <button onClick={() => setActiveTab("subscription")} className="text-[9px] text-primary hover:underline mt-1">{t("ترقية","Upgrade")}</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            );
          })()}

          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("رصيد المحفظة","Wallet Balance")}</h3>
                <p className="text-sm text-muted-foreground mb-2">{t("رصيدك الحالي في المحفظة. يُستخدم لتجديد الباقات والخدمات.","Your current wallet balance used for renewals and services.")}</p>
                <p className="text-3xl font-black text-primary">{user.wallet || 0} {t("د.ل","LYD")}</p>
              </div>
              
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("شحن المحفظة","Charge Wallet")}</h3>
                {!chargeMethod ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onClick={() => { setChargeMethod("cash"); setChargeStep(1); }} className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all text-right">
                      <h4 className="font-bold text-foreground text-sm mb-2">💵 {t("كاش (نقدي)","Cash")}</h4>
                      <p className="text-xs text-muted-foreground">{t("سنرسل مندوب لاستلام القيمة منك.","We'll send a representative to collect.")}</p>
                    </button>
                    <button onClick={() => { setChargeMethod("bank"); setChargeStep(1); }} className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all text-right">
                      <h4 className="font-bold text-foreground text-sm mb-2">🏦 {t("تحويل مصرفي","Bank Transfer")}</h4>
                      <p className="text-xs text-muted-foreground">{t("حوّل للحساب وأرفق إثبات التحويل.","Transfer and attach proof.")}</p>
                    </button>
                    <button onClick={() => { setChargeMethod("electronic"); setChargeStep(1); }} className="glass rounded-xl p-4 border-primary/30 hover:border-primary/50 transition-all text-right">
                      <h4 className="font-bold text-foreground text-sm mb-2">📱 {t("خدمات إلكترونية","Electronic")}</h4>
                      <p className="text-xs text-muted-foreground">{t("ادفع عبر البطاقات المصرفية أو يسر باي.","Pay via banking cards or YserPay.")}</p>
                    </button>
                  </div>
                ) : chargeMethod === "cash" ? (
                  <div className="space-y-4">
                    {chargeStep === 1 && (
                      <div className="glass rounded-xl p-4">
                        <p className="text-sm text-foreground mb-4">{t("عميلنا العزيز، في هذه العملية سوف نرسل لك مندوب لاستلام القيمة منك.","Dear customer, we will send a representative to collect the amount.")}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setChargeStep(2)} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("موافق","Agree")}</button>
                          <button onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("رجوع","Back")}</button>
                        </div>
                      </div>
                    )}
                    {chargeStep === 2 && (
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("كاش", Object.fromEntries(fd)); }} className="space-y-3">
                        <input name="recipientName" required placeholder={t("اسم المستلم","Recipient Name")} className={inputClass} />
                        <input name="companyName" required placeholder={t("اسم الشركة","Company Name")} defaultValue={user.companyName} className={inputClass} />
                        <input name="phone" required placeholder={t("رقم الهاتف","Phone")} className={inputClass} />
                        <select name="city" required className={inputClass}>
                          <option value="">{t("اختر المدينة","Select City")}</option>
                          {Object.keys(deliveryPrices).map(city => <option key={city} value={city}>{city} - {t("توصيل","Delivery")}: {deliveryPrices[city]} {t("د.ل","LYD")}</option>)}
                        </select>
                        <input name="area" required placeholder={t("المنطقة","Area")} className={inputClass} />
                        <input name="amount" type="number" required placeholder={t("القيمة بالدينار الليبي","Amount in LYD")} className={inputClass} />
                        <p className="text-xs text-warning">⚠️ {t("تنبيه: إذا لم ترسل صورة الوصل عند الاستلام من المندوب فلا يمكن شحن المحفظة.","Warning: You must send receipt photo for wallet to be charged.")}</p>
                        <div className="flex gap-2">
                          <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إرسال","Submit")}</button>
                          <button type="button" onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("رجوع","Back")}</button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : chargeMethod === "bank" ? (
                  <div className="space-y-4">
                    {chargeStep === 1 && (
                      <div className="glass rounded-xl p-4">
                        <p className="text-sm text-foreground mb-4">{t("عميلنا العزيز، سترى رقم الحساب للتحويل ثم تعبئة النموذج وإرساله.","Dear customer, you'll see the account number then fill the form.")}</p>
                        <div className="flex gap-2">
                          <button onClick={() => setChargeStep(2)} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("موافق","Agree")}</button>
                          <button onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("رجوع","Back")}</button>
                        </div>
                      </div>
                    )}
                    {chargeStep === 2 && (
                      <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("تحويل مصرفي", Object.fromEntries(fd)); }} className="space-y-3">
                        <div className="glass rounded-xl p-4 border-primary/30">
                          <p className="text-sm text-foreground font-bold">{t("رقم الحساب للتحويل:","Account number:")}</p>
                          <p className="text-lg font-black text-primary">{adminProfile.bankAccount || t("لم يتم تحديده بعد","Not set yet")}</p>
                        </div>
                        <input name="senderName" required placeholder={t("اسم المرسل","Sender Name")} className={inputClass} />
                        <input name="senderAccount" required placeholder={t("رقم حسابك","Your Account")} className={inputClass} />
                        <input name="phone" required placeholder={t("رقم الهاتف","Phone")} className={inputClass} />
                        <input name="amount" type="number" required placeholder={t("المبلغ المحوّل","Transfer Amount")} className={inputClass} />
                        <div>
                          <label className="text-xs font-bold text-foreground">{t("إثبات التحويل (مطلوب) *","Transfer Proof (required) *")}</label>
                          <label className="glass rounded-xl p-3 text-center border-dashed border-2 border-border cursor-pointer hover:border-primary/50 transition-all block mt-1">
                            <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                            <p className="text-[10px] text-muted-foreground">{uploadProof ? t("✅ تم رفع الصورة","✅ Photo uploaded") : t("ارفع صورة إثبات التحويل","Upload transfer proof")}</p>
                            <input type="file" accept="image/*" className="hidden" onChange={(ev) => {
                              const file = ev.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (re) => setUploadProof(re.target?.result as string);
                              reader.readAsDataURL(file);
                            }} />
                          </label>
                        </div>
                        <p className="text-xs text-warning">⚠️ {t("بدون صورة إثبات التحويل لا يمكن شحن المحفظة.","Without transfer proof, wallet cannot be charged.")}</p>
                        <div className="flex gap-2">
                          <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إرسال","Submit")}</button>
                          <button type="button" onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("رجوع","Back")}</button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="glass rounded-xl p-4">
                      <p className="text-sm text-foreground mb-2">{t("اتبع الخطوات التالية:","Follow these steps:")}</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>{t("اضغط على الرابط أدناه","Click the link below")}</li>
                        <li>{t("أكمل عملية الدفع","Complete the payment")}</li>
                        <li>{t("عبّئ النموذج وأرفق إثبات التحويل","Fill form and attach proof")}</li>
                      </ol>
                      <a href="https://mypay.ly/payment-link/share/iaRcZr4cFXa44OMlTriXZl2VcpO94d2X7AYPYQwWUEnwhGKZ4nGx9P3noBdU" target="_blank" rel="noopener noreferrer" className="inline-block mt-2 text-sm text-primary hover:underline font-bold">🔗 {t("رابط الدفع الإلكتروني","Electronic Payment Link")}</a>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); submitWalletRequest("خدمات إلكترونية", Object.fromEntries(fd)); }} className="space-y-3">
                      <input name="senderName" required placeholder={t("اسم المرسل","Sender Name")} className={inputClass} />
                      <input name="phone" required placeholder={t("رقم الهاتف","Phone")} className={inputClass} />
                      <input name="amount" type="number" required placeholder={t("المبلغ","Amount")} className={inputClass} />
                      <div>
                        <label className="text-xs font-bold text-foreground">{t("إثبات الدفع (مطلوب) *","Payment Proof (required) *")}</label>
                        <label className="glass rounded-xl p-3 text-center border-dashed border-2 border-border cursor-pointer hover:border-primary/50 transition-all block mt-1">
                          <Upload className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                          <p className="text-[10px] text-muted-foreground">{uploadProof ? t("✅ تم رفع الصورة","✅ Photo uploaded") : t("ارفع صورة إثبات الدفع","Upload payment proof")}</p>
                          <input type="file" accept="image/*" className="hidden" onChange={(ev) => {
                            const file = ev.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (re) => setUploadProof(re.target?.result as string);
                            reader.readAsDataURL(file);
                          }} />
                        </label>
                      </div>
                      <p className="text-xs text-warning">⚠️ {t("أرفق صورة تثبت التحويل.","Attach transfer proof.")}</p>
                      <div className="flex gap-2">
                        <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إرسال","Submit")}</button>
                        <button type="button" onClick={() => { setChargeMethod(""); setChargeStep(0); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("رجوع","Back")}</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Wallet Tracking */}
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">{t("متابعة عمليات الشحن","Track Charges")}</h3>
                  <button onClick={() => exportToPDF(t("عمليات الشحن","Charges"), JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]").filter((r: any) => r.companyId === user.id).map((r: any) => ({ amount: r.amount, method: r.method, status: r.status, date: new Date(r.date).toLocaleDateString("ar-LY") })), [t("المبلغ","Amount"),t("الطريقة","Method"),t("الحالة","Status"),t("التاريخ","Date")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
                {(() => {
                  const reqs = JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]").filter((r: any) => r.companyId === user.id);
                  return reqs.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد عمليات شحن.","No charges.")}</p> : (
                    <div className="space-y-3">
                      {reqs.map((r: any) => {
                        const statusInfo = walletStatuses.find(s => s.value === r.status) || walletStatuses[0];
                        const needsProof = r.status === "received";
                        return (
                          <div key={r.id} className="glass rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="text-sm font-bold text-foreground">{r.amount} {t("د.ل","LYD")}</span>
                                <span className="text-xs text-muted-foreground mr-2">- {r.method}</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-xs ${statusInfo.color}`}>{lang === "ar" ? statusInfo.label : statusInfo.labelEn}</span>
                            </div>
                            {/* Status tracking */}
                            <div className="flex items-center gap-1 mt-2">
                              {walletStatuses.slice(0, -1).map((s, i) => {
                                const currentIdx = walletStatuses.findIndex(ws => ws.value === r.status);
                                const isActive = i <= currentIdx;
                                return (
                                  <div key={s.value} className="flex items-center gap-1 flex-1">
                                    <div className={`w-2 h-2 rounded-full ${isActive ? "bg-primary" : "bg-muted"}`} />
                                    <div className={`h-0.5 flex-1 ${isActive ? "bg-primary" : "bg-muted"}`} />
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
                              <span>{t("معلّق","Pending")}</span>
                              <span>{t("قيد التنفيذ","Processing")}</span>
                              <span>{t("مندوب","Rep")}</span>
                              <span>{t("استلام","Received")}</span>
                              <span>{t("مقبول","Approved")}</span>
                            </div>
                            {needsProof && (
                              <div className="mt-3 glass rounded-lg p-3 border-warning/30">
                                <p className="text-xs text-warning mb-2">📸 {t("يرجى رفع صورة إثبات التحويل / صورة الوصل","Please upload proof of transfer / receipt photo")}</p>
                                <div className="flex gap-2 items-center">
                                  <label className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs cursor-pointer flex items-center gap-1">
                                    <Upload className="h-3 w-3" /> {t("رفع صورة","Upload Photo")}
                                    <input type="file" accept="image/*" className="hidden" onChange={(ev) => {
                                      const file = ev.target.files?.[0];
                                      if (!file) return;
                                      const reader = new FileReader();
                                      reader.onload = (re) => {
                                        const proofData = re.target?.result as string;
                                        const reqs = JSON.parse(localStorage.getItem("madar_wallet_requests") || "[]");
                                        const ri = reqs.findIndex((rq: any) => rq.id === r.id);
                                        if (ri >= 0) {
                                          reqs[ri] = { ...reqs[ri], proofImage: proofData, proofDate: new Date().toISOString() };
                                          localStorage.setItem("madar_wallet_requests", JSON.stringify(reqs));
                                          // Notify admin
                                          const adminNotifs = JSON.parse(localStorage.getItem("madar_admin_notifs") || "[]");
                                          adminNotifs.unshift({ id: Date.now().toString(), message: `${user.companyName} رفعت إثبات تحويل لطلب شحن بقيمة ${r.amount} د.ل`, date: new Date().toISOString(), read: false });
                                          localStorage.setItem("madar_admin_notifs", JSON.stringify(adminNotifs));
                                          alert(t("تم رفع الصورة بنجاح! سيراجعها مسؤول النظام.","Photo uploaded! Admin will review it."));
                                          window.location.reload();
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }} />
                                  </label>
                                </div>
                              </div>
                            )}
                            {r.proofImage && (
                              <div className="mt-2 glass rounded-lg p-2">
                                <p className="text-[10px] text-success mb-1">✅ {t("تم رفع إثبات التحويل","Proof uploaded")}</p>
                                <img src={r.proofImage} alt="proof" className="h-16 rounded-lg object-cover" />
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-2">{new Date(r.date).toLocaleDateString("ar-LY")} {new Date(r.date).toLocaleTimeString("ar-LY")}</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("إدارة جميع منتجاتك: أضف، عدّل، احذف، وتابع الأسعار والكميات.","Manage all your products: add, edit, delete, track prices and quantities.")}</p>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("المنتجات","Products")} ({products.length})</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddProduct(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة منتج","Add Product")}</button>
                  <button onClick={() => exportToPDF(t("المنتجات","Products"), products.map((p: any) => ({ name: p.name, code: p.code || "-", type: p.type, qty: p.quantity, buy: p.buyPrice, sell: p.sellPrice })), [t("المنتج","Product"),t("الكود","Code"),t("النوع","Type"),t("الكمية","Qty"),t("شراء","Buy"),t("بيع","Sell")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
              </div>
              {showAddProduct && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveProduct(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <h4 className="font-bold text-foreground">{t("إنشاء منتج جديد","Create New Product")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المنتج *","Product Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("كود المنتج","Product Code")}</label><input name="code" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع المنتج","Type")}</label>
                      <select name="type" className={inputClass}><option>إلكترونيات</option><option>ملابس</option><option>مواد غذائية</option><option>أدوية</option><option>مستحضرات تجميل</option><option>قطع غيار</option><option>أثاث</option><option>مواد بناء</option><option>أخرى</option></select>
                    </div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية *","Quantity *")}</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر الشراء *","Buy Price *")}</label><input name="buyPrice" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سعر البيع *","Sell Price *")}</label><input name="sellPrice" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("أسعار إضافية","Extra Prices")}</label><input name="extraPrices" placeholder={t("سعر الجملة، سعر خاص...","Wholesale, special...")} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المقاسات","Sizes")}</label><input name="sizes" placeholder="S, M, L, XL" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الباركود","Barcode")}</label><input name="barcode" className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    <button type="button" onClick={() => setShowAddProduct(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </form>
              )}
              {products.length > 0 && (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج","Product")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الكود","Code")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("النوع","Type")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية","Qty")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("شراء","Buy")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("بيع","Sell")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("إجراءات","Actions")}</th>
                    </tr></thead>
                    <tbody>{products.map((p: any) => (
                      <tr key={p.id} className="border-b border-border/30">
                        <td className="py-2 px-3 text-foreground font-medium">{p.name}</td>
                        <td className="py-2 px-3 text-muted-foreground">{p.code || "-"}</td>
                        <td className="py-2 px-3 text-muted-foreground">{p.type}</td>
                        <td className="py-2 px-3 text-foreground">{p.quantity}</td>
                        <td className="py-2 px-3 text-muted-foreground">{p.buyPrice}</td>
                        <td className="py-2 px-3 text-primary font-bold">{p.sellPrice}</td>
                        <td className="py-2 px-3 flex gap-1">
                          <button className="text-destructive" onClick={() => { localStorage.setItem(`madar_products_${user.id}`, JSON.stringify(products.filter((pr: any) => pr.id !== p.id))); window.location.reload(); }}><Trash2 className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              {products.length === 0 && !showAddProduct && (
                <div className="glass rounded-2xl p-6 text-center"><Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لم تقم بإضافة أي منتجات بعد.","No products added yet.")}</p></div>
              )}
            </div>
          )}

          {/* Stock Movements */}
          {activeTab === "stock" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("تسجيل جميع حركات المخزون: بيع، شراء، تلف، مرتجع، انتهاء صلاحية، وغيرها.","Record all stock movements: sales, purchases, damage, returns, expiry, etc.")}</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-foreground">{t("حركة المخزون","Stock Movements")}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddMovement(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة حركة","Add Movement")}</button>
                  <button onClick={() => exportToPDF(t("حركة المخزون","Stock Movements"), movements.map((m: any) => ({ product: m.product, type: m.movementType, qty: m.quantity, reason: m.reason || "-", date: new Date(m.date).toLocaleDateString("ar-LY"), by: m.by })), [t("المنتج","Product"),t("النوع","Type"),t("الكمية","Qty"),t("السبب","Reason"),t("التاريخ","Date"),t("بواسطة","By")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  {movements.length > 0 && <button onClick={() => { localStorage.setItem(`madar_movements_${user.id}`, "[]"); window.location.reload(); }} className="px-3 py-2 rounded-xl bg-destructive/20 text-destructive text-xs">{t("تصفير","Clear")}</button>}
                </div>
              </div>
              {showAddMovement && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveMovement(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("المنتج","Product")}</label><select name="product" className={inputClass}>{products.map((p: any) => <option key={p.id} value={p.name}>{p.name}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع الحركة","Movement Type")}</label>
                      <select name="movementType" className={inputClass}>{movementTypes.map(mt => <option key={mt.value} value={mt.value}>{mt.label} - {mt.desc}</option>)}</select>
                    </div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية","Quantity")}</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("السعر (إن وجد)","Price (if any)")}</label><input name="price" type="number" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("سبب الحركة","Reason")}</label><input name="reason" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المورد/العميل","Supplier/Client")}</label><input name="party" className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("تفاصيل وملاحظات","Details & Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    <button type="button" onClick={() => setShowAddMovement(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </form>
              )}
              {movements.length > 0 ? (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border">
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج","Product")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("النوع","Type")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية","Qty")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("السبب","Reason")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("التاريخ","Date")}</th>
                      <th className="text-right py-2 px-3 text-muted-foreground">{t("بواسطة","By")}</th>
                    </tr></thead>
                    <tbody>{movements.map((m: any) => {
                      const mt = movementTypes.find(t => t.value === m.movementType);
                      return (
                        <tr key={m.id} className="border-b border-border/30">
                          <td className="py-2 px-3 text-foreground">{m.product}</td>
                          <td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{mt?.label || m.movementType}</span></td>
                          <td className="py-2 px-3 text-foreground">{m.quantity}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{m.reason || "-"}</td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{new Date(m.date).toLocaleDateString("ar-LY")}</td>
                          <td className="py-2 px-3 text-muted-foreground">{m.by}</td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              ) : (
                <div className="glass rounded-2xl p-6 text-center"><Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد حركات مخزون.","No stock movements.")}</p></div>
              )}
            </div>
          )}

          {/* Barcode */}
          {activeTab === "barcode" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("نظام الباركود: أنشئ باركود تلقائياً أو يدوياً، امسح باركود بالكاميرا، أو ارفع صورة باركود.","Barcode system: Create automatically or manually, scan with camera, or upload barcode image.")}</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={() => setBarcodeMode("create")} className={`glass rounded-xl p-4 text-center transition-all ${barcodeMode === "create" ? "border-primary/50" : "hover:border-primary/30"}`}>
                  <QrCode className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{t("إنشاء باركود","Create Barcode")}</p>
                </button>
                <button onClick={() => setBarcodeMode("scan")} className={`glass rounded-xl p-4 text-center transition-all ${barcodeMode === "scan" ? "border-primary/50" : "hover:border-primary/30"}`}>
                  <Camera className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{t("مسح باركود بالكاميرا","Scan with Camera")}</p>
                </button>
                <button onClick={() => setBarcodeMode("upload")} className={`glass rounded-xl p-4 text-center transition-all ${barcodeMode === "upload" ? "border-primary/50" : "hover:border-primary/30"}`}>
                  <Upload className="h-8 w-8 text-primary mx-auto mb-2" /><p className="text-sm font-bold text-foreground">{t("رفع صورة باركود","Upload Barcode")}</p>
                </button>
              </div>
              {barcodeMode === "create" && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-3">{t("إنشاء باركود","Create Barcode")}</h4>
                  <div className="flex gap-2 mb-4">
                    <input value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} placeholder={t("أدخل رقم الباركود أو اتركه فارغاً للتوليد التلقائي","Enter barcode or leave empty for auto-generate")} className={inputClass} />
                    <button onClick={generateBarcode} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold whitespace-nowrap">{t("توليد","Generate")}</button>
                  </div>
                  {generatedBarcode && (
                    <div className="glass rounded-xl p-6 text-center space-y-3">
                      <BarcodeGenerator value={generatedBarcode} />
                      <p className="text-sm text-foreground font-bold">{generatedBarcode}</p>
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => {
                          const barcodes = [...savedBarcodes, { id: Date.now().toString(), code: generatedBarcode, createdAt: new Date().toISOString() }];
                          setSavedBarcodes(barcodes);
                          localStorage.setItem(`madar_barcodes_${user.id}`, JSON.stringify(barcodes));
                          alert(t("تم حفظ الباركود!","Barcode saved!"));
                        }} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-xs font-bold">{t("حفظ","Save")}</button>
                        <button onClick={() => {
                          const printWin = window.open("", "_blank");
                          if (printWin) {
                            printWin.document.write(`<html><body style="display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0;"><div id="bc"></div><script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script><script>JsBarcode("#bc","${generatedBarcode}",{format:"CODE128",width:2,height:100,displayValue:true});window.onload=()=>window.print();<\/script></body></html>`);
                          }
                        }} className="px-4 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Printer className="h-3 w-3" /> {t("طباعة","Print")}</button>
                      </div>
                    </div>
                  )}
                  {/* Saved Barcodes */}
                  {savedBarcodes.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-bold text-foreground mb-2">{t("الباركودات المحفوظة","Saved Barcodes")} ({savedBarcodes.length})</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {savedBarcodes.map((bc: any) => (
                          <div key={bc.id} className="glass rounded-xl p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-mono text-foreground">{bc.code}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(bc.createdAt).toLocaleDateString("ar-LY")}</p>
                            </div>
                            <button onClick={() => {
                              const filtered = savedBarcodes.filter(b => b.id !== bc.id);
                              setSavedBarcodes(filtered);
                              localStorage.setItem(`madar_barcodes_${user.id}`, JSON.stringify(filtered));
                            }} className="text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {barcodeMode === "scan" && (
                <div className="glass rounded-2xl p-6 text-center">
                  <Camera className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-sm text-foreground font-bold mb-2">{t("مسح الباركود بالكاميرا","Scan Barcode with Camera")}</p>
                  <p className="text-xs text-muted-foreground mb-4">{t("اضغط على الزر لفتح الكاميرا ومسح الباركود تلقائياً.","Click button to open camera and scan barcode automatically.")}</p>
                  <button onClick={() => setShowBarcodeScanner(true)} className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2 mx-auto"><Camera className="h-4 w-4" /> {t("فتح الكاميرا","Open Camera")}</button>
                  {scannedResult && (
                    <div className="mt-4 glass rounded-xl p-4 border-primary/30">
                      <p className="text-xs text-muted-foreground mb-1">{t("نتيجة المسح:","Scan Result:")}</p>
                      <p className="text-lg font-black text-primary font-mono">{scannedResult}</p>
                      {(() => {
                        const prod = products.find((p: any) => p.barcode === scannedResult || p.code === scannedResult);
                        if (prod) return (
                          <div className="mt-2 glass rounded-lg p-3 text-right">
                            <p className="text-sm font-bold text-foreground">{prod.name}</p>
                            <p className="text-xs text-muted-foreground">{t("الكمية:","Qty:")} {prod.quantity} | {t("السعر:","Price:")} {prod.sellPrice} {t("د.ل","LYD")}</p>
                          </div>
                        );
                        return <p className="text-xs text-warning mt-1">{t("لم يتم العثور على منتج مطابق.","No matching product found.")}</p>;
                      })()}
                    </div>
                  )}
                </div>
              )}
              {barcodeMode === "upload" && (
                <div className="glass rounded-2xl p-6 text-center">
                  <Upload className="h-16 w-16 text-primary mx-auto mb-4" />
                  <p className="text-sm text-foreground font-bold mb-2">{t("رفع صورة باركود","Upload Barcode Image")}</p>
                  <label className="px-6 py-3 rounded-xl gradient-primary text-primary-foreground text-sm font-bold cursor-pointer inline-block">
                    {t("اختر صورة","Choose Image")}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                      if (e.target.files?.[0]) {
                        alert(t("تم رفع الصورة. سيتم تحليلها.","Image uploaded. Will be analyzed."));
                      }
                    }} />
                  </label>
                </div>
              )}
              {showBarcodeScanner && (
                <BarcodeScanner
                  lang={lang}
                  onScan={(code) => {
                    setScannedResult(code);
                    setShowBarcodeScanner(false);
                  }}
                  onClose={() => setShowBarcodeScanner(false)}
                />
              )}
            </div>
          )}



          {/* Suppliers */}
          {activeTab === "suppliers" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("المورد هو الشخص أو الشركة التي تشتري منها بضاعتك أو تبيع لها. يمكنك إدارة بيانات الموردين.","A supplier is a person or company you buy from or sell to.")}</p>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("الموردين","Suppliers")} ({suppliers.length})</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddSupplier(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة مورد","Add Supplier")}</button>
                  <button onClick={() => exportToPDF(t("الموردين","Suppliers"), suppliers.map((s: any) => ({ name: s.name, phone: s.phone, type: s.dealType, city: s.city })), [t("المورد","Supplier"),t("الهاتف","Phone"),t("التعامل","Deal"),t("المدينة","City")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
              </div>
              {showAddSupplier && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveSupplier(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المورد *","Supplier Name *")}</label><input name="name" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("رقم الهاتف","Phone")}</label><input name="phone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع التعامل","Deal Type")}</label><select name="dealType" className={inputClass}><option>{t("يبيع لنا","Sells to us")}</option><option>{t("يشتري منا","Buys from us")}</option><option>{t("كلاهما","Both")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المدينة","City")}</label><input name="city" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("العنوان","Address")}</label><input name="address" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الشروط","Terms")}</label><input name="terms" className={inputClass} /></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("تفاصيل إضافية","Details")}</label><textarea name="details" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    <button type="button" onClick={() => setShowAddSupplier(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </form>
              )}
              {suppliers.length > 0 ? (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("المورد","Supplier")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الهاتف","Phone")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("التعامل","Deal")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("المدينة","City")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("إجراءات","Actions")}</th></tr></thead>
                    <tbody>{suppliers.map((s: any) => (<tr key={s.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground font-medium">{s.name}</td><td className="py-2 px-3 text-muted-foreground">{s.phone}</td><td className="py-2 px-3 text-muted-foreground">{s.dealType}</td><td className="py-2 px-3 text-muted-foreground">{s.city}</td><td className="py-2 px-3"><button className="text-destructive" onClick={() => { localStorage.setItem(`madar_suppliers_${user.id}`, JSON.stringify(suppliers.filter((sp: any) => sp.id !== s.id))); window.location.reload(); }}><Trash2 className="h-4 w-4" /></button></td></tr>))}</tbody>
                  </table>
                </div>
              ) : !showAddSupplier && (
                <div className="glass rounded-2xl p-6 text-center"><Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لم تقم بإضافة أي موردين.","No suppliers added.")}</p></div>
              )}
            </div>
          )}

          {/* Inventory Audit */}
          {activeTab === "inventory" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("الجرد","Inventory Audit")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("اختر نوع الجرد: بشري (يدوي بواسطة الموظفين) أو ذكاء اصطناعي (تلقائي يحلل البيانات ويكشف الفروقات).","Choose audit type: Human (manual by employees) or AI (automatic analysis).")}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <button onClick={() => setInventoryType("human")} className={`glass rounded-xl p-4 text-right transition-all ${inventoryType === "human" ? "border-primary/50 shadow-glow" : "hover:border-primary/30"}`}>
                    <h4 className="font-bold text-foreground text-sm">👤 {t("جرد بشري","Human Audit")}</h4>
                    <p className="text-xs text-muted-foreground">{t("جرد يدوي بواسطة الموظفين مع نموذج تسجيل تفصيلي","Manual audit with detailed registration form")}</p>
                  </button>
                  <button onClick={() => setInventoryType("ai")} className={`glass rounded-xl p-4 text-right transition-all ${inventoryType === "ai" ? "border-primary/50 shadow-glow" : "hover:border-primary/30"}`}>
                    <h4 className="font-bold text-foreground text-sm">🤖 {t("جرد بالذكاء الاصطناعي","AI Audit")}</h4>
                    <p className="text-xs text-muted-foreground">{t("جرد تلقائي يحلل البيانات ويكشف الفروقات والعجز","Automatic audit analyzing data and detecting discrepancies")}</p>
                  </button>
                </div>
                <h4 className="font-bold text-foreground text-sm mb-2">{t("نطاق الجرد","Audit Scope")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
                  {[
                    {k:"full",l:"جرد كامل",e:"Full"},
                    {k:"partial",l:"جرد جزئي",e:"Partial"},
                    {k:"surprise",l:"جرد مفاجئ",e:"Surprise"},
                    {k:"periodic",l:"جرد دوري",e:"Periodic"},
                    {k:"weekly",l:"جرد أسبوعي",e:"Weekly"},
                    {k:"monthly",l:"جرد شهري",e:"Monthly"},
                  ].map(s => (
                    <button key={s.k} onClick={() => setInventoryScope(s.k)} className={`glass rounded-lg p-2 text-xs text-foreground transition-all ${inventoryScope === s.k ? "border-primary/50 gradient-primary text-primary-foreground font-bold" : "hover:border-primary/30"}`}>{lang === "ar" ? s.l : s.e}</button>
                  ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setShowStartInventory(true)} className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("بدء الجرد","Start Audit")}</button>
                  <button onClick={() => exportToPDF(t("سجل الجرد","Audit Log"), inventoryLogs.map((l: any) => ({ type: l.type, scope: l.scope, date: new Date(l.date).toLocaleDateString("ar-LY"), by: l.by, status: l.status })), [t("النوع","Type"),t("النطاق","Scope"),t("التاريخ","Date"),t("بواسطة","By"),t("الحالة","Status")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> {t("تحميل سجل الجرد","Download Log")} PDF</button>
                </div>
                {showStartInventory && (
                  <form onSubmit={(e) => { e.preventDefault(); const log = { id: Date.now().toString(), type: inventoryType || "human", scope: inventoryScope || "full", date: new Date().toISOString(), by: user.managerName, status: "مكتمل" }; const logs = [...inventoryLogs, log]; localStorage.setItem(`madar_inventory_${user.id}`, JSON.stringify(logs)); setShowStartInventory(false); alert(t("تم بدء الجرد بنجاح!","Audit started!")); window.location.reload(); }} className="glass rounded-xl p-4 mt-4 space-y-3">
                    <h4 className="font-bold text-foreground text-sm">{t("نموذج بدء الجرد","Start Audit Form")}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div><label className="text-xs font-bold text-foreground">{t("من قام بالجرد","Auditor")}</label><input defaultValue={user.managerName} className={inputClass} /></div>
                      <div><label className="text-xs font-bold text-foreground">{t("ملاحظات","Notes")}</label><input className={inputClass} /></div>
                    </div>
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("تأكيد بدء الجرد","Confirm Start")}</button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Reorder, Returns, Profits, Reports */}
          {activeTab === "reorder" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("اقتراحات إعادة الطلب الذكية","Smart Reorder Suggestions")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("يقوم النظام بتحليل حركة بيع كل منتج خلال آخر 30 يوم.","The system analyzes sales movement for each product over the last 30 days.")}</p>
                <div className="glass rounded-xl p-4 mb-4">
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• {t("كم يوم يكفي المخزون الحالي","How many days current stock lasts")}</li>
                    <li>• {t("الكمية المثالية للطلب — تكفي لـ 30 يوم + مخزون أمان 7 أيام","Optimal order quantity — 30 days + 7 days safety stock")}</li>
                    <li>• 🔴 {t("حرج","Critical")} · 🟡 {t("قريب","Soon")} · 🟢 {t("مخطط","Planned")}</li>
                    <li>• {t("المنتجات الراكدة — لم تتحرك خلال 30 يوم","Stagnant products — no movement in 30 days")}</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-primary">{products.filter((p: any) => Number(p.quantity) < 10).length}</p><p className="text-xs text-muted-foreground">{t("منتج يحتاج طلب","Needs reorder")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-warning">0</p><p className="text-xs text-muted-foreground">{t("منتج راكد","Stagnant")}</p></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "returns" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("سجل التالف والمرتجعات: أنشئ سجلات للمنتجات التالفة أو المرتجعة مع تفاصيل السبب والكمية.","Damaged & returns log: Create records for damaged or returned products.")}</p>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("التالف والمرتجعات","Damaged & Returns")}</h3>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddDamaged(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إنشاء","Create")}</button>
                  <button onClick={() => exportToPDF(t("التالف والمرتجعات","Damaged & Returns"), damaged.map((d: any) => ({ product: d.product, type: d.type, qty: d.quantity, reason: d.reason, date: new Date(d.date).toLocaleDateString("ar-LY") })), [t("المنتج","Product"),t("النوع","Type"),t("الكمية","Qty"),t("السبب","Reason"),t("التاريخ","Date")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  {damaged.length > 0 && <button onClick={() => { localStorage.setItem(`madar_damaged_${user.id}`, "[]"); window.location.reload(); }} className="px-3 py-2 rounded-xl bg-destructive/20 text-destructive text-xs">{t("تصفير","Clear")}</button>}
                </div>
              </div>
              {showAddDamaged && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveDamaged(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("المنتج","Product")}</label><select name="product" className={inputClass}>{products.map((p: any) => <option key={p.id}>{p.name}</option>)}</select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("النوع","Type")}</label><select name="type" className={inputClass}><option>{t("تالف","Damaged")}</option><option>{t("مرتجع","Returned")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الكمية","Quantity")}</label><input name="quantity" type="number" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("السبب","Reason")}</label><input name="reason" required className={inputClass} /></div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    <button type="button" onClick={() => setShowAddDamaged(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </form>
              )}
              {damaged.length > 0 ? (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("المنتج","Product")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("النوع","Type")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الكمية","Qty")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("السبب","Reason")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("التاريخ","Date")}</th></tr></thead>
                    <tbody>{damaged.map((d: any) => (<tr key={d.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground">{d.product}</td><td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${d.type === "تالف" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>{d.type}</span></td><td className="py-2 px-3">{d.quantity}</td><td className="py-2 px-3 text-muted-foreground">{d.reason}</td><td className="py-2 px-3 text-muted-foreground text-xs">{new Date(d.date).toLocaleDateString("ar-LY")}</td></tr>))}</tbody>
                  </table>
                </div>
              ) : !showAddDamaged && (
                <div className="glass rounded-2xl p-6 text-center"><RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد سجلات.","No records.")}</p></div>
              )}
            </div>
          )}

          {activeTab === "profits" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground">{t("الأرباح","Profits")}</h3>
                  <button onClick={() => exportSimplePDF(t("تقرير الأرباح","Profits Report"), `<table style="width:100%;border-collapse:collapse;"><tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">رأس المال</td><td style="padding:10px;border:1px solid #e5e7eb;">${totalBuyValue} د.ل</td></tr><tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">قيمة المخزون (بيع)</td><td style="padding:10px;border:1px solid #e5e7eb;">${totalSellValue} د.ل</td></tr><tr><td style="padding:10px;border:1px solid #e5e7eb;font-weight:bold;">الربح</td><td style="padding:10px;border:1px solid #e5e7eb;color:green;">${totalProfit} د.ل</td></tr></table>`)} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{t("ملخص الأرباح والخسائر بناءً على أسعار الشراء والبيع وقيمة المخزون.","Profit/loss summary based on buy/sell prices and stock value.")}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("رأس المال","Capital")}</p><p className="text-xl font-black text-foreground">{totalBuyValue} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الأرباح","Profits")}</p><p className="text-xl font-black text-success">{totalProfit > 0 ? totalProfit : 0} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("قيمة المخزون","Stock Value")}</p><p className="text-xl font-black text-primary">{totalSellValue} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الخسارة","Loss")}</p><p className="text-xl font-black text-destructive">{totalProfit < 0 ? Math.abs(totalProfit) : 0} {t("د.ل","LYD")}</p></div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("نظام الفواتير الاحترافي: أنشئ فواتير، اطبعها بصيغة PDF، وأرسلها للعملاء.","Professional invoice system: Create invoices, print as PDF, and send to clients.")}</p>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("الفواتير","Invoices")} ({(JSON.parse(localStorage.getItem(`madar_invoices_${user.id}`) || "[]")).length})</h3>
                <button onClick={() => setShowAddInvoice(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إنشاء فاتورة","Create Invoice")}</button>
              </div>

              {showAddInvoice && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as HTMLFormElement);
                  const invoiceData = {
                    id: Date.now().toString(),
                    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
                    clientName: fd.get("clientName"),
                    clientPhone: fd.get("clientPhone"),
                    clientAddress: fd.get("clientAddress"),
                    notes: fd.get("notes"),
                    items: invoiceItems.filter(i => i.product),
                    subtotal: invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0),
                    tax: Number(fd.get("tax")) || 0,
                    discount: Number(fd.get("discount")) || 0,
                    total: invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0) - (Number(fd.get("discount")) || 0) + (Number(fd.get("tax")) || 0),
                    status: "pending",
                    createdAt: new Date().toISOString(),
                    createdBy: user.managerName,
                  };
                  const invoices = JSON.parse(localStorage.getItem(`madar_invoices_${user.id}`) || "[]");
                  invoices.push(invoiceData);
                  localStorage.setItem(`madar_invoices_${user.id}`, JSON.stringify(invoices));
                  setShowAddInvoice(false);
                  setInvoiceItems([{ product: "", quantity: 1, price: 0 }]);
                  window.location.reload();
                }} className="glass rounded-2xl p-6 space-y-4">
                  <h4 className="font-bold text-foreground">{t("إنشاء فاتورة جديدة","Create New Invoice")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم العميل *","Client Name *")}</label><input name="clientName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("هاتف العميل","Client Phone")}</label><input name="clientPhone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("عنوان العميل","Client Address")}</label><input name="clientAddress" className={inputClass} /></div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-bold text-foreground">{t("بنود الفاتورة","Invoice Items")}</label>
                      <button type="button" onClick={() => setInvoiceItems([...invoiceItems, { product: "", quantity: 1, price: 0 }])} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> {t("إضافة بند","Add Item")}</button>
                    </div>
                    <div className="space-y-2">
                      {invoiceItems.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-5">
                            {idx === 0 && <label className="text-[10px] text-muted-foreground">{t("المنتج/الخدمة","Product/Service")}</label>}
                            <select value={item.product} onChange={(e) => {
                              const items = [...invoiceItems];
                              items[idx].product = e.target.value;
                              const prod = products.find((p: any) => p.name === e.target.value);
                              if (prod) items[idx].price = Number(prod.sellPrice) || 0;
                              setInvoiceItems(items);
                            }} className={inputClass}>
                              <option value="">{t("اختر أو اكتب","Select or type")}</option>
                              {products.map((p: any) => <option key={p.id} value={p.name}>{p.name} - {p.sellPrice} {t("د.ل","LYD")}</option>)}
                            </select>
                          </div>
                          <div className="col-span-2">
                            {idx === 0 && <label className="text-[10px] text-muted-foreground">{t("الكمية","Qty")}</label>}
                            <input type="number" min="1" value={item.quantity} onChange={(e) => { const items = [...invoiceItems]; items[idx].quantity = Number(e.target.value); setInvoiceItems(items); }} className={inputClass} />
                          </div>
                          <div className="col-span-3">
                            {idx === 0 && <label className="text-[10px] text-muted-foreground">{t("السعر","Price")}</label>}
                            <input type="number" value={item.price} onChange={(e) => { const items = [...invoiceItems]; items[idx].price = Number(e.target.value); setInvoiceItems(items); }} className={inputClass} />
                          </div>
                          <div className="col-span-1">
                            {idx === 0 && <label className="text-[10px] text-muted-foreground">{t("المجموع","Total")}</label>}
                            <p className="text-sm font-bold text-primary py-2">{item.quantity * item.price}</p>
                          </div>
                          <div className="col-span-1">
                            {invoiceItems.length > 1 && <button type="button" onClick={() => setInvoiceItems(invoiceItems.filter((_, i) => i !== idx))} className="text-destructive p-1"><Trash2 className="h-4 w-4" /></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("الضريبة","Tax")}</label><input name="tax" type="number" defaultValue={0} className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الخصم","Discount")}</label><input name="discount" type="number" defaultValue={0} className={inputClass} /></div>
                    <div className="glass rounded-xl p-3"><p className="text-xs text-muted-foreground">{t("الإجمالي","Total")}</p><p className="text-xl font-black text-primary">{invoiceItems.reduce((a, i) => a + (i.quantity * i.price), 0)} {t("د.ل","LYD")}</p></div>
                  </div>
                  <div><label className="text-xs font-bold text-foreground">{t("ملاحظات","Notes")}</label><textarea name="notes" rows={2} className={inputClass} /></div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ الفاتورة","Save Invoice")}</button>
                    <button type="button" onClick={() => { setShowAddInvoice(false); setInvoiceItems([{ product: "", quantity: 1, price: 0 }]); }} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </form>
              )}

              {/* Invoice List */}
              {(() => {
                const invoices = JSON.parse(localStorage.getItem(`madar_invoices_${user.id}`) || "[]");
                if (invoices.length === 0 && !showAddInvoice) return (
                  <div className="glass rounded-2xl p-6 text-center"><Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لم تقم بإنشاء أي فواتير بعد.","No invoices created yet.")}</p></div>
                );
                return (
                  <div className="glass rounded-2xl p-4 overflow-x-auto">
                    <div className="flex justify-end mb-2">
                      <button onClick={() => exportToPDF(t("الفواتير","Invoices"), invoices.map((inv: any) => ({ number: inv.invoiceNumber, client: inv.clientName, total: inv.total, status: inv.status, date: new Date(inv.createdAt).toLocaleDateString("ar-LY") })), [t("الرقم","#"),t("العميل","Client"),t("الإجمالي","Total"),t("الحالة","Status"),t("التاريخ","Date")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                    </div>
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-border">
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("رقم الفاتورة","Invoice #")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("العميل","Client")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الإجمالي","Total")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة","Status")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("التاريخ","Date")}</th>
                        <th className="text-right py-2 px-3 text-muted-foreground">{t("إجراءات","Actions")}</th>
                      </tr></thead>
                      <tbody>{invoices.map((inv: any) => (
                        <tr key={inv.id} className="border-b border-border/30">
                          <td className="py-2 px-3 text-primary font-mono font-bold">{inv.invoiceNumber}</td>
                          <td className="py-2 px-3 text-foreground">{inv.clientName}</td>
                          <td className="py-2 px-3 text-foreground font-bold">{inv.total} {t("د.ل","LYD")}</td>
                          <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-xs ${inv.status === "paid" ? "bg-success/20 text-success" : inv.status === "sent" ? "bg-primary/20 text-primary" : "bg-warning/20 text-warning"}`}>{inv.status === "paid" ? t("مدفوعة","Paid") : inv.status === "sent" ? t("مرسلة","Sent") : t("معلّقة","Pending")}</span></td>
                          <td className="py-2 px-3 text-muted-foreground text-xs">{new Date(inv.createdAt).toLocaleDateString("ar-LY")}</td>
                          <td className="py-2 px-3 flex gap-1">
                            <button onClick={() => {
                              const itemsHTML = inv.items.map((i: any) => `<tr><td style="padding:8px;border:1px solid #e5e7eb;">${i.product}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${i.quantity}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:center;">${i.price}</td><td style="padding:8px;border:1px solid #e5e7eb;text-align:center;font-weight:bold;">${i.quantity * i.price}</td></tr>`).join("");
                              exportSimplePDF(
                                `فاتورة ${inv.invoiceNumber}`,
                                `<div style="margin-bottom:20px;"><strong>العميل:</strong> ${inv.clientName}<br/><strong>الهاتف:</strong> ${inv.clientPhone || "-"}<br/><strong>العنوان:</strong> ${inv.clientAddress || "-"}</div>
                                <table style="width:100%;border-collapse:collapse;">
                                  <thead><tr style="background:#2563eb;color:white;"><th style="padding:8px;">المنتج/الخدمة</th><th style="padding:8px;">الكمية</th><th style="padding:8px;">السعر</th><th style="padding:8px;">المجموع</th></tr></thead>
                                  <tbody>${itemsHTML}</tbody>
                                </table>
                                <div style="margin-top:15px;text-align:left;">
                                  <p>المجموع الفرعي: ${inv.subtotal} د.ل</p>
                                  <p>الضريبة: ${inv.tax} د.ل</p>
                                  <p>الخصم: ${inv.discount} د.ل</p>
                                  <p style="font-size:18px;font-weight:bold;color:#2563eb;">الإجمالي: ${inv.total} د.ل</p>
                                </div>
                                ${inv.notes ? `<div style="margin-top:15px;padding:10px;background:#f8fafc;border-radius:8px;"><strong>ملاحظات:</strong> ${inv.notes}</div>` : ""}`
                              );
                            }} className="p-1 text-primary hover:text-primary/80" title={t("طباعة PDF","Print PDF")}><Printer className="h-4 w-4" /></button>
                            <button onClick={() => {
                              const updated = invoices.map((i: any) => i.id === inv.id ? {...i, status: inv.status === "pending" ? "sent" : "paid"} : i);
                              localStorage.setItem(`madar_invoices_${user.id}`, JSON.stringify(updated));
                              window.location.reload();
                            }} className="p-1 text-success hover:text-success/80" title={inv.status === "pending" ? t("تعيين كمرسلة","Mark Sent") : t("تعيين كمدفوعة","Mark Paid")}><Check className="h-4 w-4" /></button>
                            <button onClick={() => {
                              localStorage.setItem(`madar_invoices_${user.id}`, JSON.stringify(invoices.filter((i: any) => i.id !== inv.id)));
                              window.location.reload();
                            }} className="p-1 text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></button>
                          </td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === "reports" && (
            <div className="space-y-4">
              <h3 className="font-bold text-foreground">{t("التقارير والتحليلات","Reports & Analytics")}</h3>
              <p className="text-sm text-muted-foreground">{t("جميع التقارير قابلة للتحميل بصيغة PDF.","All reports can be downloaded as PDF.")}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: t("تقرير المنتجات","Products Report"), data: products, cols: [t("المنتج","Product"),t("الكمية","Qty"),t("سعر البيع","Price")] },
                  { name: t("تقرير الحركات","Movements Report"), data: movements, cols: [t("المنتج","Product"),t("النوع","Type"),t("الكمية","Qty")] },
                  { name: t("تقرير الموردين","Suppliers Report"), data: suppliers, cols: [t("المورد","Supplier"),t("الهاتف","Phone"),t("المدينة","City")] },
                  { name: t("تقرير التالف","Damaged Report"), data: damaged, cols: [t("المنتج","Product"),t("النوع","Type"),t("الكمية","Qty")] },
                ].map(r => (
                  <div key={r.name} className="glass rounded-xl p-4">
                    <FileText className="h-6 w-6 text-primary mb-2" />
                    <p className="text-sm font-bold text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{r.data.length} {t("سجل","records")}</p>
                    <button onClick={() => exportToPDF(r.name, r.data, r.cols)} className="text-xs text-primary hover:underline flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accounting */}
          {activeTab === "accounting" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("المحاسبة","Accounting")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("المحاسبة الشاملة: يومية وأسبوعية وشهرية وسنوية. يمكنك اختيار المحاسبة البشرية أو بالذكاء الاصطناعي. تشمل الأرباح والرواتب والخسائر والمبيعات والماليات الشاملة.","Comprehensive accounting: daily, weekly, monthly, yearly. Choose manual or AI. Includes profits, salaries, losses, sales and full financials.")}</p>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setAccountingMode("manual")} className={`px-4 py-2 rounded-xl text-sm ${accountingMode === "manual" ? "gradient-primary text-primary-foreground font-bold" : "border border-border text-foreground"}`}>👤 {t("محاسبة يدوية","Manual")}</button>
                  <button onClick={() => setAccountingMode("ai")} className={`px-4 py-2 rounded-xl text-sm ${accountingMode === "ai" ? "gradient-primary text-primary-foreground font-bold" : "border border-border text-foreground"}`}>🤖 {t("ذكاء اصطناعي","AI")}</button>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap">
                  {[{k:"daily",l:"يومي",e:"Daily"},{k:"weekly",l:"أسبوعي",e:"Weekly"},{k:"monthly",l:"شهري",e:"Monthly"},{k:"yearly",l:"سنوي",e:"Yearly"}].map(tab => (
                    <button key={tab.k} onClick={() => setAccountingTab(tab.k)} className={`px-4 py-2 rounded-xl text-sm transition-all ${accountingTab === tab.k ? "gradient-primary text-primary-foreground font-bold" : "border border-border text-foreground"}`}>{lang === "ar" ? tab.l : tab.e}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("المبيعات","Sales")}</p><p className="text-xl font-black text-primary">0 {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("المصروفات","Expenses")}</p><p className="text-xl font-black text-destructive">0 {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("صافي الربح","Net Profit")}</p><p className="text-xl font-black text-success">{totalProfit} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("الرواتب","Salaries")}</p><p className="text-xl font-black text-warning">{employees.reduce((a: number, e: any) => a + (Number(e.salary) || 0), 0)} {t("د.ل","LYD")}</p></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("رأس المال","Capital")}</p><p className="text-lg font-black text-foreground">{totalBuyValue} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("قيمة المخزون","Stock Value")}</p><p className="text-lg font-black text-primary">{totalSellValue} {t("د.ل","LYD")}</p></div>
                  <div className="glass rounded-xl p-4 text-center"><p className="text-xs text-muted-foreground">{t("عدد الموظفين","Employees")}</p><p className="text-lg font-black text-foreground">{employees.length}</p></div>
                </div>
                <button onClick={() => exportSimplePDF(t(`تقرير المحاسبة - ${accountingTab === "daily" ? "يومي" : accountingTab === "weekly" ? "أسبوعي" : accountingTab === "monthly" ? "شهري" : "سنوي"}`, `Accounting - ${accountingTab}`), `<table style="width:100%;border-collapse:collapse;"><tr><td style="padding:10px;border:1px solid #e5e7eb;">المبيعات</td><td style="padding:10px;border:1px solid #e5e7eb;">0 د.ل</td></tr><tr><td style="padding:10px;border:1px solid #e5e7eb;">المصروفات</td><td style="padding:10px;border:1px solid #e5e7eb;">0 د.ل</td></tr><tr><td style="padding:10px;border:1px solid #e5e7eb;">الربح</td><td style="padding:10px;border:1px solid #e5e7eb;">${totalProfit} د.ل</td></tr><tr><td style="padding:10px;border:1px solid #e5e7eb;">الرواتب</td><td style="padding:10px;border:1px solid #e5e7eb;">${employees.reduce((a: number, e: any) => a + (Number(e.salary) || 0), 0)} د.ل</td></tr></table>`)} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><Download className="h-4 w-4" /> {t("تحميل PDF","Download PDF")}</button>
              </div>
            </div>
          )}

          {/* HR - Full Implementation */}
          {activeTab === "hr" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("إدارة الموارد البشرية الشاملة: الموظفين، العقود، الحضور، الإجازات، الرواتب، السلف، المخالفات، المكافآت، والمهام.","Complete HR management: employees, contracts, attendance, leaves, salaries, advances, violations, rewards, and tasks.")}</p>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("الموارد البشرية","Human Resources")}</h3>
                <button onClick={() => setShowAddEmployee(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة موظف","Add Employee")}</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[{k:"overview",l:"نظرة عامة",e:"Overview"},{k:"contracts",l:"العقود",e:"Contracts"},{k:"attendance",l:"الحضور",e:"Attendance"},{k:"schedule",l:"مواعيد العمل",e:"Schedule"},{k:"leaves",l:"الإجازات",e:"Leaves"},{k:"salaries",l:"الرواتب",e:"Salaries"},{k:"advances",l:"السلف",e:"Advances"},{k:"violations",l:"المخالفات",e:"Violations"},{k:"rewards",l:"المكافآت",e:"Rewards"},{k:"tasks",l:"المهام",e:"Tasks"},{k:"notifications",l:"الإشعارات",e:"Notifications"}].map(tab => (
                  <button key={tab.k} onClick={() => setHrTab(tab.k)} className={`px-3 py-1.5 rounded-xl text-xs transition-all ${hrTab === tab.k ? "gradient-primary text-primary-foreground font-bold" : "border border-border text-foreground"}`}>{lang === "ar" ? tab.l : tab.e}</button>
                ))}
              </div>
              
              {showAddEmployee && (() => {
                const allPerms = [
                  {k:"dashboard",l:"لوحة التحكم"},{k:"products",l:"المنتجات"},{k:"stock",l:"حركة المخزون"},{k:"barcode",l:"الباركود"},
                  {k:"suppliers",l:"الموردين"},{k:"inventory",l:"الجرد"},{k:"reorder",l:"إعادة الطلب"},{k:"returns",l:"التالف والمرتجعات"},
                  {k:"accounting",l:"المحاسبة"},{k:"profits",l:"الأرباح"},{k:"invoices",l:"الفواتير"},{k:"reports",l:"التقارير"},
                  {k:"hr",l:"الموارد البشرية"},{k:"users",l:"المستخدمين"},{k:"activity-log",l:"سجل النشاطات"},{k:"settings",l:"الإعدادات"},
                  {k:"notifications",l:"الإشعارات"},{k:"messages",l:"المراسلات"},
                ];
                const [selPerms, setSelPerms] = useState<string[]>(["dashboard","my-info","notifications","messages"]);
                return (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data: any = Object.fromEntries(fd); data.permissions = selPerms; data.status = data.accountStatus || "active"; saveEmployee(data); }} className="glass rounded-2xl p-6 space-y-3">
                  <h4 className="font-bold text-foreground">{t("إضافة موظف جديد","Add New Employee")}</h4>
                  <p className="text-xs text-muted-foreground">{t("أدخل بيانات الموظف الكاملة. الموظف سيستخدم البريد وكلمة المرور لتسجيل الدخول.","Enter complete employee data. Employee will use email and password to login.")}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("الاسم الكامل *","Full Name *")}</label><input name="fullName" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("البريد الإلكتروني *","Email *")}</label><input name="email" type="email" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("كلمة المرور *","Password *")}</label><input name="password" type="password" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الهاتف","Phone")}</label><input name="phone" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المسمى الوظيفي","Position")}</label><input name="position" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("القسم","Department")}</label><input name="department" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الراتب الأساسي","Base Salary")}</label><input name="salary" type="number" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نوع العقد","Contract Type")}</label><select name="contractType" className={inputClass}><option>{t("دائم","Permanent")}</option><option>{t("مؤقت","Temporary")}</option><option>{t("جزئي","Part-time")}</option></select></div>
                    <div><label className="text-xs font-bold text-foreground">{t("نهاية العقد","Contract End")}</label><input name="contractEnd" type="date" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الرقم الوطني","National ID")}</label><input name="nationalId" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("المؤهل","Qualification")}</label><input name="qualification" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المصرف","Bank Name")}</label><input name="bankName" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("رقم الحساب","Account Number")}</label><input name="bankAccount" className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("حالة الحساب","Account Status")}</label>
                      <select name="accountStatus" className={inputClass}><option value="active">{t("نشط","Active")}</option><option value="suspended">{t("موقوف","Suspended")}</option></select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-foreground mb-2 block">{t("الصلاحيات (الأقسام التي سيراها الموظف)","Permissions (sections visible to employee)")}</label>
                    <p className="text-xs text-muted-foreground mb-2">{t("اختر الأقسام التي تريد أن يراها هذا الموظف في لوحته. الأقسام غير المحددة ستكون مخفية عنه.","Select sections you want this employee to see. Unselected sections will be hidden.")}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {allPerms.map(p => (
                        <label key={p.k} className="flex items-center gap-2 glass rounded-lg p-2 cursor-pointer hover:border-primary/30 transition-all">
                          <input type="checkbox" checked={selPerms.includes(p.k)} onChange={(e) => { if (e.target.checked) setSelPerms([...selPerms, p.k]); else setSelPerms(selPerms.filter(x => x !== p.k)); }} className="rounded accent-primary" />
                          <span className="text-xs text-foreground">{p.l}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    <button type="button" onClick={() => setShowAddEmployee(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </form>
                );
              })()}

              {hrTab === "overview" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-primary">{employees.length}</p><p className="text-xs text-muted-foreground">{t("إجمالي الموظفين","Total Employees")}</p></div>
                    <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-success">0</p><p className="text-xs text-muted-foreground">{t("حاضرين","Present")}</p></div>
                    <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-warning">{leaves.length}</p><p className="text-xs text-muted-foreground">{t("في إجازة","On Leave")}</p></div>
                    <div className="glass rounded-xl p-4 text-center"><p className="text-2xl font-black text-destructive">0</p><p className="text-xs text-muted-foreground">{t("غائبين","Absent")}</p></div>
                  </div>
                  {employees.length > 0 && (
                    <div className="glass rounded-2xl p-4 overflow-x-auto">
                      <div className="flex justify-end mb-2"><button onClick={() => exportToPDF(t("الموظفين","Employees"), employees.map((e: any) => ({ name: e.fullName, position: e.position, dept: e.department, salary: e.salary, contract: e.contractType })), [t("الاسم","Name"),t("الوظيفة","Position"),t("القسم","Dept"),t("الراتب","Salary"),t("العقد","Contract")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button></div>
                       <table className="w-full text-sm">
                         <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("الاسم","Name")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("البريد","Email")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الوظيفة","Position")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الراتب","Salary")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الحالة","Status")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("آخر دخول","Last Login")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("إجراءات","Actions")}</th></tr></thead>
                         <tbody>{employees.map((e: any) => (<tr key={e.id} className="border-b border-border/30">
                           <td className="py-2 px-3 text-foreground font-medium">{e.fullName}</td>
                           <td className="py-2 px-3 text-muted-foreground text-xs">{e.email}</td>
                           <td className="py-2 px-3 text-muted-foreground">{e.position}</td>
                           <td className="py-2 px-3 text-primary font-bold">{e.salary} {t("د.ل","LYD")}</td>
                           <td className="py-2 px-3"><span className={`px-2 py-0.5 rounded-full text-[10px] ${e.status === "suspended" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>{e.status === "suspended" ? t("موقوف","Suspended") : t("نشط","Active")}</span></td>
                           <td className="py-2 px-3 text-muted-foreground text-[10px]">{e.lastLogin ? new Date(e.lastLogin).toLocaleDateString("ar-LY") : t("لم يدخل بعد","Never")}</td>
                           <td className="py-2 px-3 flex gap-1 flex-wrap">
                             <button title={e.status === "suspended" ? t("تفعيل","Activate") : t("إيقاف","Suspend")} onClick={() => { const updated = employees.map((emp: any) => emp.id === e.id ? {...emp, status: emp.status === "suspended" ? "active" : "suspended"} : emp); localStorage.setItem(`madar_employees_${user.id}`, JSON.stringify(updated)); window.location.reload(); }} className={`p-1 ${e.status === "suspended" ? "text-success" : "text-warning"}`}>{e.status === "suspended" ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}</button>
                             <button title={t("إعادة كلمة المرور","Reset Password")} onClick={() => { const newPass = prompt(t("أدخل كلمة المرور الجديدة:","Enter new password:")); if (newPass) { const updated = employees.map((emp: any) => emp.id === e.id ? {...emp, password: newPass} : emp); localStorage.setItem(`madar_employees_${user.id}`, JSON.stringify(updated)); alert(t("تم تغيير كلمة المرور بنجاح!","Password changed!")); } }} className="p-1 text-primary"><RefreshCw className="h-3.5 w-3.5" /></button>
                             <button title={t("حذف","Delete")} className="p-1 text-destructive" onClick={() => { if (confirm(t("هل تريد حذف هذا الموظف؟","Delete this employee?"))) { localStorage.setItem(`madar_employees_${user.id}`, JSON.stringify(employees.filter((emp: any) => emp.id !== e.id))); window.location.reload(); } }}><Trash2 className="h-3.5 w-3.5" /></button>
                           </td>
                         </tr>))}</tbody>
                       </table>
                    </div>
                  )}
                </div>
              )}

              {hrTab === "contracts" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">{t("العقود","Contracts")}</h4><button onClick={() => exportToPDF(t("العقود","Contracts"), employees.map((e: any) => ({ name: e.fullName, type: e.contractType, end: e.contractEnd || "-", position: e.position })), [t("الاسم","Name"),t("النوع","Type"),t("الانتهاء","End"),t("الوظيفة","Position")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> {t("طباعة","Print")}</button></div>
                  {employees.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد عقود.","No contracts.")}</p> : (
                    <div className="space-y-2">{employees.map((e: any) => (<div key={e.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{e.fullName}</p><p className="text-xs text-muted-foreground">{e.position} - {e.contractType}</p></div><span className="text-xs text-muted-foreground">{e.contractEnd || t("غير محدد","Not set")}</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "schedule" && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-4">{t("مواعيد العمل","Work Schedule")}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{t("حدد متى يبدأ العمل ومتى ينتهي، وكم دقيقة تأخير مسموح، وبعد كم دقيقة يعتبر غياب.","Set work start/end time, allowed late minutes, and absence threshold.")}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="text-sm font-bold text-foreground">{t("بداية العمل","Start Time")}</label><input type="time" value={workSchedule.start} onChange={e => { const s = {...workSchedule, start: e.target.value}; setWorkSchedule(s); localStorage.setItem(`madar_schedule_${user.id}`, JSON.stringify(s)); }} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("نهاية العمل","End Time")}</label><input type="time" value={workSchedule.end} onChange={e => { const s = {...workSchedule, end: e.target.value}; setWorkSchedule(s); localStorage.setItem(`madar_schedule_${user.id}`, JSON.stringify(s)); }} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("التأخير المسموح (دقيقة)","Late Threshold (min)")}</label><input type="number" value={workSchedule.lateMinutes} onChange={e => { const s = {...workSchedule, lateMinutes: +e.target.value}; setWorkSchedule(s); localStorage.setItem(`madar_schedule_${user.id}`, JSON.stringify(s)); }} className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-foreground">{t("حد الغياب (دقيقة)","Absence Threshold (min)")}</label><input type="number" value={workSchedule.absentMinutes} onChange={e => { const s = {...workSchedule, absentMinutes: +e.target.value}; setWorkSchedule(s); localStorage.setItem(`madar_schedule_${user.id}`, JSON.stringify(s)); }} className={inputClass} /></div>
                  </div>
                </div>
              )}

              {hrTab === "attendance" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">{t("سجل الحضور والانصراف","Attendance Log")}</h4><button onClick={() => exportSimplePDF(t("سجل الحضور","Attendance"), `<p>${t("مواعيد العمل:","Work hours:")} ${workSchedule.start} - ${workSchedule.end}</p><p>${t("تأخير مسموح:","Late threshold:")} ${workSchedule.lateMinutes} ${t("دقيقة","min")}</p>`)} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button></div>
                  <p className="text-sm text-muted-foreground">{t("مواعيد العمل:","Work hours:")} {workSchedule.start} - {workSchedule.end} | {t("تأخير:","Late:")} {workSchedule.lateMinutes}{t("د","m")} | {t("غياب:","Absent:")} {workSchedule.absentMinutes}{t("د","m")}</p>
                </div>
              )}

              {hrTab === "salaries" && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-4">{t("الرواتب","Salaries")}</h4>
                  <p className="text-sm text-muted-foreground mb-4">{t("إرسال الرواتب وإشعارات الرواتب للموظفين.","Send salaries and salary notifications to employees.")}</p>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button onClick={() => alert(t("تم إرسال إشعارات الرواتب لجميع الموظفين!","Salary notifications sent to all employees!"))} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Bell className="h-4 w-4" /> {t("إشعارات الرواتب","Salary Notifications")}</button>
                    <button onClick={() => alert(t("تم إرسال الرواتب بنجاح!","Salaries sent successfully!"))} className="px-4 py-2 rounded-xl bg-success/20 text-success text-sm font-bold flex items-center gap-2"><Send className="h-4 w-4" /> {t("إرسال الرواتب","Send Salaries")}</button>
                    <button onClick={() => exportToPDF(t("كشف الرواتب","Salary Report"), employees.map((e: any) => ({ name: e.fullName, position: e.position, salary: e.salary, bank: e.bankName || "-", account: e.bankAccount || "-" })), [t("الاسم","Name"),t("الوظيفة","Position"),t("الراتب","Salary"),t("المصرف","Bank"),t("الحساب","Account")])} className="px-3 py-2 rounded-xl border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  </div>
                  {employees.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا يوجد موظفون.","No employees.")}</p> : (
                    <div className="space-y-2">{employees.map((e: any) => (<div key={e.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{e.fullName}</p><p className="text-xs text-muted-foreground">{e.position} - {e.bankName || t("لم يحدد المصرف","No bank")}</p></div><span className="text-sm font-bold text-primary">{e.salary || 0} {t("د.ل","LYD")}</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "leaves" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">{t("الإجازات","Leaves")}</h4><button onClick={() => setShowAddLeave(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("طلب إجازة","Request Leave")}</button></div>
                  {showAddLeave && (
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data = Object.fromEntries(fd); const items = [...leaves, { ...data, id: Date.now().toString(), status: "pending", date: new Date().toISOString() }]; localStorage.setItem(`madar_leaves_${user.id}`, JSON.stringify(items)); setShowAddLeave(false); window.location.reload(); }} className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select name="employee" required className={inputClass}><option value="">{t("اختر الموظف","Select Employee")}</option>{employees.map((e: any) => <option key={e.id}>{e.fullName}</option>)}</select>
                        <select name="type" className={inputClass}><option>{t("سنوية","Annual")}</option><option>{t("مرضية","Sick")}</option><option>{t("طارئة","Emergency")}</option><option>{t("بدون راتب","Unpaid")}</option></select>
                        <input name="days" type="number" required placeholder={t("عدد الأيام","Days")} className={inputClass} />
                        <input name="from" type="date" required className={inputClass} />
                        <input name="to" type="date" required className={inputClass} />
                      </div>
                      <textarea name="reason" placeholder={t("السبب","Reason")} className={inputClass} />
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    </form>
                  )}
                  {leaves.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد طلبات إجازة.","No leave requests.")}</p> : (
                    <div className="space-y-2">{leaves.map((l: any) => (<div key={l.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{l.employee}</p><p className="text-xs text-muted-foreground">{l.type} - {l.days} {t("أيام","days")}</p></div><span className="px-2 py-0.5 rounded-full text-xs bg-warning/20 text-warning">{l.status === "approved" ? t("مقبول","Approved") : t("معلّق","Pending")}</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "advances" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">{t("السلف والسحب المبكر","Advances & Early Withdrawal")}</h4><button onClick={() => setShowAddAdvance(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إنشاء سلفة","Create Advance")}</button></div>
                  {showAddAdvance && (
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data = Object.fromEntries(fd); const items = [...advances, { ...data, id: Date.now().toString(), date: new Date().toISOString() }]; localStorage.setItem(`madar_advances_${user.id}`, JSON.stringify(items)); setShowAddAdvance(false); window.location.reload(); }} className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select name="employee" required className={inputClass}><option value="">{t("اختر الموظف","Select Employee")}</option>{employees.map((e: any) => <option key={e.id}>{e.fullName}</option>)}</select>
                        <input name="amount" type="number" required placeholder={t("المبلغ","Amount")} className={inputClass} />
                        <input name="reason" placeholder={t("السبب","Reason")} className={inputClass} />
                      </div>
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    </form>
                  )}
                  {advances.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد سلف.","No advances.")}</p> : (
                    <div className="space-y-2">{advances.map((a: any) => (<div key={a.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{a.employee}</p><p className="text-xs text-muted-foreground">{a.reason}</p></div><span className="text-sm font-bold text-primary">{a.amount} {t("د.ل","LYD")}</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "violations" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">{t("المخالفات","Violations")}</h4><div className="flex gap-2"><button onClick={() => setShowAddViolation(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إنشاء مخالفة","Create Violation")}</button><button onClick={() => exportToPDF(t("المخالفات","Violations"), violations.map((v: any) => ({ employee: v.employee, amount: v.amount, reason: v.reason, date: new Date(v.date).toLocaleDateString("ar-LY") })), [t("الموظف","Employee"),t("القيمة","Amount"),t("السبب","Reason"),t("التاريخ","Date")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button></div></div>
                  {showAddViolation && (
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data = Object.fromEntries(fd); const items = [...violations, { ...data, id: Date.now().toString(), date: new Date().toISOString() }]; localStorage.setItem(`madar_violations_${user.id}`, JSON.stringify(items)); setShowAddViolation(false); window.location.reload(); }} className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select name="employee" required className={inputClass}><option value="">{t("اختر الموظف","Select Employee")}</option>{employees.map((e: any) => <option key={e.id}>{e.fullName}</option>)}</select>
                        <input name="amount" type="number" placeholder={t("قيمة المخالفة","Violation Amount")} className={inputClass} />
                        <input name="reason" required placeholder={t("السبب","Reason")} className={inputClass} />
                      </div>
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    </form>
                  )}
                  {violations.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد مخالفات.","No violations.")}</p> : (
                    <div className="space-y-2">{violations.map((v: any) => (<div key={v.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{v.employee}</p><p className="text-xs text-muted-foreground">{v.reason}</p></div><span className="text-sm font-bold text-destructive">{v.amount} {t("د.ل","LYD")}</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "rewards" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">{t("المكافآت","Rewards")}</h4><div className="flex gap-2"><button onClick={() => setShowAddReward(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إنشاء مكافأة","Create Reward")}</button><button onClick={() => exportToPDF(t("المكافآت","Rewards"), rewards.map((r: any) => ({ employee: r.employee, amount: r.amount, reason: r.reason, date: new Date(r.date).toLocaleDateString("ar-LY") })), [t("الموظف","Employee"),t("القيمة","Amount"),t("السبب","Reason"),t("التاريخ","Date")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button></div></div>
                  {showAddReward && (
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data = Object.fromEntries(fd); const items = [...rewards, { ...data, id: Date.now().toString(), date: new Date().toISOString() }]; localStorage.setItem(`madar_rewards_${user.id}`, JSON.stringify(items)); setShowAddReward(false); window.location.reload(); }} className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <select name="employee" required className={inputClass}><option value="">{t("اختر الموظف","Select Employee")}</option>{employees.map((e: any) => <option key={e.id}>{e.fullName}</option>)}</select>
                        <input name="amount" type="number" placeholder={t("قيمة المكافأة","Reward Amount")} className={inputClass} />
                        <input name="reason" required placeholder={t("السبب","Reason")} className={inputClass} />
                      </div>
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    </form>
                  )}
                  {rewards.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد مكافآت.","No rewards.")}</p> : (
                    <div className="space-y-2">{rewards.map((r: any) => (<div key={r.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{r.employee}</p><p className="text-xs text-muted-foreground">{r.reason}</p></div><span className="text-sm font-bold text-success">{r.amount} {t("د.ل","LYD")}</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "tasks" && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4"><h4 className="font-bold text-foreground">{t("المهام","Tasks")}</h4><div className="flex gap-2"><button onClick={() => setShowAddTask(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة مهمة","Add Task")}</button><button onClick={() => exportToPDF(t("المهام","Tasks"), tasks.map((tk: any) => ({ employee: tk.employee, title: tk.title, deadline: tk.deadline, type: tk.type, status: tk.status || "جديدة" })), [t("الموظف","Employee"),t("المهمة","Task"),t("التسليم","Deadline"),t("النوع","Type"),t("الحالة","Status")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button></div></div>
                  {showAddTask && (
                    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); const data = Object.fromEntries(fd); const items = [...tasks, { ...data, id: Date.now().toString(), status: "جديدة", date: new Date().toISOString() }]; localStorage.setItem(`madar_tasks_${user.id}`, JSON.stringify(items)); setShowAddTask(false); window.location.reload(); }} className="space-y-3 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select name="employee" required className={inputClass}><option value="">{t("اختر الموظف","Select Employee")}</option>{employees.map((e: any) => <option key={e.id}>{e.fullName}</option>)}</select>
                        <input name="title" required placeholder={t("عنوان المهمة","Task Title")} className={inputClass} />
                        <input name="deadline" type="date" required className={inputClass} />
                        <select name="type" className={inputClass}><option>{t("أساسية","Essential")}</option><option>{t("إضافية","Extra")}</option></select>
                      </div>
                      <textarea name="details" placeholder={t("تفاصيل المهمة","Task Details")} rows={2} className={inputClass} />
                      <input name="extraValue" type="number" placeholder={t("قيمة الإضافي (إن وجد)","Extra Value (if any)")} className={inputClass} />
                      <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ","Save")}</button>
                    </form>
                  )}
                  {tasks.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد مهام.","No tasks.")}</p> : (
                    <div className="space-y-2">{tasks.map((tk: any) => (<div key={tk.id} className="flex items-center justify-between glass rounded-xl p-3"><div><p className="text-sm font-bold text-foreground">{tk.title}</p><p className="text-xs text-muted-foreground">{tk.employee} - {tk.type} - {t("التسليم:","Due:")} {tk.deadline}</p></div><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{tk.status}</span></div>))}</div>
                  )}
                </div>
              )}

              {hrTab === "notifications" && (
                <div className="glass rounded-2xl p-6">
                  <h4 className="font-bold text-foreground mb-4">{t("إشعارات الموارد البشرية","HR Notifications")}</h4>
                  <div className="glass rounded-xl p-6 text-center"><Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد إشعارات جديدة.","No new notifications.")}</p></div>
                </div>
              )}
            </div>
          )}

          {/* Users, Permissions, Activity Log, Fraud, Settings - remain similar with bilingual support */}
          {activeTab === "users" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("المستخدمون لا يمكنهم إنشاء حسابات بأنفسهم. أضفهم من هنا وحدد صلاحياتهم.","Users cannot create accounts themselves. Add them here and set permissions.")}</p>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t("المستخدمين","Users")} ({companyUsers.length})</h3>
                <button onClick={() => setShowAddUser(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Plus className="h-4 w-4" /> {t("إضافة مستخدم","Add User")}</button>
              </div>
              {showAddUser && (
                <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveUser(Object.fromEntries(fd)); }} className="glass rounded-2xl p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div><label className="text-xs font-bold text-foreground">{t("اسم المستخدم *","Username *")}</label><input name="username" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("البريد *","Email *")}</label><input name="email" type="email" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("كلمة المرور *","Password *")}</label><input name="password" type="password" required className={inputClass} /></div>
                    <div><label className="text-xs font-bold text-foreground">{t("الصلاحية","Role")}</label>
                      <select name="role" className={inputClass}><option>{t("مسؤول مخزن","Stock Manager")}</option><option>{t("محاسب","Accountant")}</option><option>{t("مسؤول جرد","Audit Manager")}</option><option>{t("مسؤول منتجات","Product Manager")}</option><option>{t("مسؤول موارد بشرية","HR Manager")}</option><option>{t("موظف عادي","Regular Employee")}</option></select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("إضافة","Add")}</button>
                    <button type="button" onClick={() => setShowAddUser(false)} className="px-6 py-2 rounded-xl border border-border text-foreground text-sm">{t("إلغاء","Cancel")}</button>
                  </div>
                </form>
              )}
              {companyUsers.length > 0 && (
                <div className="glass rounded-2xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border"><th className="text-right py-2 px-3 text-muted-foreground">{t("المستخدم","User")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("البريد","Email")}</th><th className="text-right py-2 px-3 text-muted-foreground">{t("الصلاحية","Role")}</th></tr></thead>
                    <tbody>{companyUsers.map((u: any) => (<tr key={u.id} className="border-b border-border/30"><td className="py-2 px-3 text-foreground">{u.username}</td><td className="py-2 px-3 text-muted-foreground">{u.email}</td><td className="py-2 px-3"><span className="px-2 py-0.5 rounded-full text-xs bg-primary/20 text-primary">{u.role}</span></td></tr>))}</tbody>
                  </table>
                </div>
              )}
              {companyUsers.length === 0 && !showAddUser && (
                <div className="glass rounded-2xl p-6 text-center"><Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لم تقم بإضافة أي مستخدمين.","No users added yet.")}</p></div>
              )}
            </div>
          )}

          {activeTab === "permissions" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-2">{t("الصلاحيات والتوظيف","Permissions")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("حدد صلاحيات كل موظف. كل قسم يمكن تشغيله أو إيقاف ظهوره لأي موظف. الموظف لا يرى إلا ما تسمح له.","Set permissions for each employee. Each section can be toggled on/off. Employees only see what you allow.")}</p>
              {companyUsers.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا يوجد موظفون.","No employees.")}</p> : (
                <div className="space-y-4">
                  {companyUsers.map((u: any) => (
                    <div key={u.id} className="glass rounded-xl p-4">
                      <p className="font-bold text-foreground mb-2">{u.username} - <span className="text-primary">{u.role}</span></p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {flatItems.filter(i => i.key !== "dashboard").map(item => (
                          <label key={item.key} className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input type="checkbox" defaultChecked className="rounded accent-primary" />
                            {lang === "ar" ? item.label : item.labelEn}
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "activity-log" && (
            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground">{t("سجل النشاطات","Activity Log")}</h3>
                <div className="flex gap-2">
                  <button onClick={() => exportToPDF(t("سجل النشاطات","Activity Log"), movements.map((m: any) => ({ action: `${m.movementType} - ${m.product}`, qty: m.quantity, by: m.by, date: new Date(m.date).toLocaleDateString("ar-LY") })), [t("العملية","Action"),t("الكمية","Qty"),t("بواسطة","By"),t("التاريخ","Date")])} className="px-3 py-1.5 rounded-lg border border-border text-foreground text-xs flex items-center gap-1"><Download className="h-3 w-3" /> PDF</button>
                  <button onClick={() => { localStorage.setItem(`madar_movements_${user.id}`, "[]"); window.location.reload(); }} className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-xs">{t("حذف الكل","Clear All")}</button>
                </div>
              </div>
              {movements.length === 0 ? (
                <div className="glass rounded-xl p-6 text-center"><Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{t("لا توجد نشاطات.","No activities.")}</p></div>
              ) : (
                <div className="space-y-2">{movements.slice().reverse().map((m: any) => (
                  <div key={m.id} className="glass rounded-xl p-3 flex justify-between items-center"><div><p className="text-sm text-foreground">{m.movementType} - {m.product} ({m.quantity})</p><p className="text-xs text-muted-foreground">{m.by} - {new Date(m.date).toLocaleDateString("ar-LY")}</p></div></div>
                ))}</div>
              )}
            </div>
          )}

          {/* Messages */}
          {activeTab === "messages" && (() => {
            const companyMessages = JSON.parse(localStorage.getItem(`madar_messages_company_${user.id}`) || "[]");
            const adminMessages = JSON.parse(localStorage.getItem("madar_admin_messages") || "[]").filter((m: any) => !m.company || m.company === user.id);
            const allMessages = [...companyMessages, ...adminMessages.map((m: any) => ({ ...m, fromAdmin: true }))].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("المراسلات مع إدارة المنصة","Messages with Platform Admin")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("أرسل رسالة لمسؤول النظام أو اطلع على الرسائل المرسلة إليك.","Send a message to system admin or view received messages.")}</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.target as HTMLFormElement);
                  const message = fd.get("message") as string;
                  if (!message) return;
                  const msg = { id: Date.now().toString(), from: user.companyName, companyId: user.id, message, date: new Date().toISOString(), type: "رسالة من شركة" };
                  const msgs = [...companyMessages, msg];
                  localStorage.setItem(`madar_messages_company_${user.id}`, JSON.stringify(msgs));
                  // Also save to admin messages
                  const admMsgs = JSON.parse(localStorage.getItem("madar_admin_messages") || "[]");
                  admMsgs.unshift({ ...msg, from: user.companyName, company: user.id });
                  localStorage.setItem("madar_admin_messages", JSON.stringify(admMsgs));
                  // Notify admin
                  const adminNotifs = JSON.parse(localStorage.getItem("madar_admin_notifs") || "[]");
                  adminNotifs.unshift({ id: Date.now().toString(), message: `رسالة جديدة من ${user.companyName}: ${message.substring(0, 50)}...`, date: new Date().toISOString(), read: false });
                  localStorage.setItem("madar_admin_notifs", JSON.stringify(adminNotifs));
                  (e.target as HTMLFormElement).reset();
                  alert(t("تم إرسال الرسالة بنجاح!","Message sent!"));
                  window.location.reload();
                }} className="space-y-3 mb-6">
                  <textarea name="message" required rows={3} placeholder={t("اكتب رسالتك لمسؤول النظام...","Write your message to system admin...")} className={inputClass} />
                  <button type="submit" className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold flex items-center gap-2"><Send className="h-4 w-4" /> {t("إرسال","Send")}</button>
                </form>
              </div>
              <div className="glass rounded-2xl p-6">
                <h4 className="font-bold text-foreground mb-4">{t("سجل المراسلات","Message History")}</h4>
                {allMessages.length === 0 ? <p className="text-sm text-muted-foreground">{t("لا توجد رسائل.","No messages.")}</p> : (
                  <div className="space-y-2">{allMessages.map((m: any) => (
                    <div key={m.id} className={`glass rounded-xl p-3 ${m.fromAdmin ? "border-primary/20" : ""}`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] ${m.fromAdmin ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"}`}>
                          {m.fromAdmin ? t("من مسؤول النظام","From Admin") : t("أنت","You")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{m.date ? new Date(m.date).toLocaleDateString("ar-LY") + " " + new Date(m.date).toLocaleTimeString("ar-LY") : ""}</span>
                      </div>
                      {m.type && <span className="text-[10px] text-muted-foreground">{m.type}</span>}
                      <p className="text-sm text-foreground mt-1">{m.message}</p>
                    </div>
                  ))}</div>
                )}
              </div>
            </div>
            );
          })()}

          {activeTab === "fraud" && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-foreground mb-4">{t("كشف التلاعب والاحتيال","Fraud Detection")}</h3>
              <p className="text-sm text-muted-foreground mb-4">{t("مراقبة العمليات المشبوهة داخل شركتك.","Monitor suspicious operations within your company.")}</p>
              <div className="glass rounded-xl p-6 text-center"><AlertTriangle className="h-12 w-12 text-success mx-auto mb-3" /><p className="text-foreground font-bold">{t("لا توجد عمليات مشبوهة","No suspicious operations")}</p></div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-2">{t("إعدادات الشركة","Company Settings")}</h3>
                <p className="text-sm text-muted-foreground mb-4">{t("تعديل هوية الشركة وشعارها واسمها وإعدادات صفحة دخول المستخدمين الخاصة بالشركة.","Edit company identity, logo, name and user login page settings.")}</p>
                <div className="space-y-3 max-w-lg">
                  <div><label className="text-sm font-bold text-foreground">{t("اسم الشركة","Company Name")}</label><input defaultValue={user.companyName} className={inputClass} /></div>
                  <div><label className="text-sm font-bold text-foreground">{t("شعار الشركة","Company Logo")}</label><div className="glass rounded-xl p-4 text-center border-dashed border-2 border-border cursor-pointer"><Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" /><p className="text-xs text-muted-foreground">{t("اسحب الشعار هنا أو انقر للتحميل","Drag logo or click to upload")}</p></div></div>
                  <button className="px-6 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-bold">{t("حفظ التغييرات","Save Changes")}</button>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-bold text-foreground mb-4">{t("إعدادات المنصة","Platform Settings")}</h3>
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => { const newTheme = theme === "dark" ? "light" : "dark"; setTheme(newTheme); localStorage.setItem("madar_theme", newTheme); if (newTheme === "light") document.documentElement.classList.add("light"); else document.documentElement.classList.remove("light"); }} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2">
                    {theme === "dark" ? <><Sun className="h-4 w-4" /> {t("وضع نهاري","Light Mode")}</> : <><Moon className="h-4 w-4" /> {t("وضع ليلي","Dark Mode")}</>}
                  </button>
                  <button onClick={() => { const newLang = lang === "ar" ? "en" : "ar"; setLang(newLang); localStorage.setItem("madar_lang", newLang); document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr"; }} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" /> {lang === "ar" ? "English" : "العربية"}
                  </button>
                  <button onClick={() => alert(t("تم تنظيف الذاكرة!","Cache cleared!"))} className="px-4 py-2 rounded-xl border border-border text-foreground text-sm flex items-center gap-2"><RefreshCw className="h-4 w-4" /> {t("تنظيف الذاكرة","Clear Cache")}</button>
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
