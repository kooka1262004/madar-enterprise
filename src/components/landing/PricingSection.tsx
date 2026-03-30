import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "تجربة مجانية",
    price: "مجاناً",
    period: "لمدة أسبوع",
    desc: "جرّب جميع مميزات المنصة لمدة 7 أيام كاملة بدون أي قيود.",
    features: ["جميع المميزات متاحة", "جميع الصلاحيات", "دعم كامل"],
    users: "غير محدود",
    stores: "غير محدود",
    products: "غير محدود",
    highlight: false,
  },
  {
    name: "الباقة الأساسية",
    price: "300",
    period: "دينار / شهرياً",
    desc: "مناسبة للمتاجر الصغيرة والتجار المبتدئين.",
    features: [
      "إدارة المنتجات",
      "حركة المخزون",
      "التقارير الأساسية",
      "نظام الباركود",
      "تنبيهات المخزون",
    ],
    users: "3",
    stores: "1",
    products: "500",
    highlight: false,
  },
  {
    name: "الباقة الاحترافية",
    price: "500",
    period: "دينار / شهرياً",
    desc: "الخيار المثالي للشركات المتوسطة التي تحتاج أدوات متقدمة.",
    features: [
      "إدارة المنتجات",
      "حركة المخزون",
      "التقارير الذكية",
      "نظام الباركود",
      "تنبيهات المخزون",
      "الجرد المتقدم",
      "الموارد البشرية",
      "المحاسبة الأساسية",
      "إدارة الموردين",
      "التالف والمرتجعات",
      "سجل النشاطات",
    ],
    users: "10",
    stores: "3",
    products: "5,000",
    highlight: true,
  },
  {
    name: "باقة الأعمال",
    price: "2,500",
    period: "دينار / شهرياً",
    desc: "للشركات الكبيرة التي تحتاج حلاً شاملاً بلا حدود.",
    features: [
      "إدارة المنتجات",
      "حركة المخزون",
      "التقارير الذكية",
      "نظام الباركود",
      "تنبيهات المخزون",
      "الجرد المتقدم",
      "الموارد البشرية الكاملة",
      "المحاسبة المتقدمة",
      "إدارة الموردين",
      "التالف والمرتجعات",
      "سجل النشاطات",
      "إعادة الطلب الذكية",
      "تحليل الأرباح",
      "كشف التلاعب",
      "تخصيص كامل",
      "أولوية الدعم الفني",
    ],
    users: "50",
    stores: "10",
    products: "غير محدود",
    highlight: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            باقات <span className="text-primary">مدار</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            اختر الباقة المناسبة لحجم أعمالك. جميع الباقات تشمل الدعم الفني والتحديثات المستمرة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col transition-all relative ${
                plan.highlight
                  ? "glass border-primary/50 shadow-glow scale-[1.02]"
                  : "glass hover:border-primary/30"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-xs font-bold text-primary-foreground flex items-center gap-1">
                  <Star className="h-3 w-3" /> الأكثر طلباً
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-3xl font-black text-primary">{plan.price}</span>
                {plan.period && (
                  <span className="text-sm text-muted-foreground mr-1">{plan.period}</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">{plan.desc}</p>

              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">المستخدمين</span>
                  <span className="font-bold text-foreground">{plan.users}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">المخازن</span>
                  <span className="font-bold text-foreground">{plan.stores}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">المنتجات</span>
                  <span className="font-bold text-foreground">{plan.products}</span>
                </div>
              </div>

              <div className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/register/company"
                className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
                  plan.highlight
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "border border-border hover:border-primary/50 text-foreground"
                }`}
              >
                ابدأ الآن
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
