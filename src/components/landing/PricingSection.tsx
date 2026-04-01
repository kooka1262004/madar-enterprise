import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PricingSection = () => {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("plans").select("*").eq("active", true).order("price", { ascending: true }).then(({ data }) => setPlans(data || []));
  }, []);

  const fallbackPlans = [
    { name: "تجربة مجانية", price: 0, period: "أسبوع", max_users: 2, max_employees: 2, max_stores: 1, max_products: 50, max_storage_mb: 100, features: ["لوحة تحكم","المنتجات","حركة المخزون","الباركود"], highlight: false },
    { name: "الباقة الأساسية", price: 500, period: "شهر", max_users: 3, max_employees: 3, max_stores: 1, max_products: 200, max_storage_mb: 500, features: ["لوحة تحكم","المنتجات","حركة المخزون","الباركود","الموردين","الفواتير","التقارير"], highlight: false },
    { name: "الباقة المتقدمة", price: 1500, period: "شهر", max_users: 10, max_employees: 10, max_stores: 3, max_products: 1000, max_storage_mb: 2000, features: ["كل مميزات الأساسية","المحاسبة","الجرد","الموارد البشرية","الطلبات","المراسلات"], highlight: true },
    { name: "باقة الأعمال", price: 3000, period: "شهر", max_users: 30, max_employees: 25, max_stores: 5, max_products: 5000, max_storage_mb: 5000, features: ["كل مميزات المتقدمة","التقارير الذكية","المحاسبة المتقدمة","إعادة الطلب","سجل النشاطات"], highlight: false },
    { name: "الباقة الاحترافية", price: 5000, period: "شهر", max_users: 100, max_employees: 100, max_stores: 15, max_products: 999999, max_storage_mb: 20000, features: ["جميع المميزات بلا حدود","أولوية الدعم الفني","تخصيص كامل"], highlight: false },
  ];

  const displayPlans = plans.length > 0 ? plans.map((p, i) => ({ ...p, highlight: i === 2 })) : fallbackPlans;

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {displayPlans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-5 flex flex-col transition-all relative ${
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
              <h3 className="text-lg font-bold text-foreground mb-2">{plan.name}</h3>
              <div className="mb-1">
                <span className="text-2xl font-black text-primary">{plan.price === 0 ? "مجاناً" : plan.price}</span>
                {plan.price > 0 && <span className="text-xs text-muted-foreground mr-1">دينار / {plan.period}</span>}
                {plan.price === 0 && <span className="text-xs text-muted-foreground mr-1">لمدة {plan.period}</span>}
              </div>

              <div className="space-y-1.5 mb-3 text-xs">
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">المستخدمين</span>
                  <span className="font-bold text-foreground">{plan.max_users}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">الموظفين</span>
                  <span className="font-bold text-foreground">{plan.max_employees || plan.max_users}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">المخازن</span>
                  <span className="font-bold text-foreground">{plan.max_stores}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">المنتجات</span>
                  <span className="font-bold text-foreground">{plan.max_products >= 999999 ? "غير محدود" : plan.max_products}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/30">
                  <span className="text-muted-foreground">التخزين</span>
                  <span className="font-bold text-foreground">{plan.max_storage_mb >= 20000 ? "20 GB" : `${plan.max_storage_mb || 500} MB`}</span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4 flex-1">
                {(plan.features || []).slice(0, 6).map((f: string) => (
                  <div key={f} className="flex items-center gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-success shrink-0" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/register/company"
                className={`block text-center py-2 rounded-xl font-bold text-sm transition-all ${
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
