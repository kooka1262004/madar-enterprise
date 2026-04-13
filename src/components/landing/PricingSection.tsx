import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PricingSection = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [currency, setCurrency] = useState<any>({ primary: "LYD", secondary: "USD", rate: 4.85 });

  useEffect(() => {
    Promise.all([
      supabase.from("plans").select("*").eq("active", true).order("price", { ascending: true }),
      supabase.from("platform_settings").select("*").eq("key", "currency").maybeSingle(),
    ]).then(([plansRes, currRes]) => {
      setPlans(plansRes.data || []);
      if (currRes.data?.value) setCurrency(currRes.data.value);
    });
  }, []);

  const paidPlans = plans.filter(p => p.price > 0);
  const trialPlan = plans.find(p => p.price === 0);

  const formatUSD = (lyd: number) => (lyd / (currency.rate || 4.85)).toFixed(2);

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
          {trialPlan && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30">
              <span className="text-success font-bold text-sm">🎁 تجربة مجانية لمدة أسبوع بجميع المميزات!</span>
            </div>
          )}
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${Math.min(paidPlans.length, 4)} gap-5 max-w-5xl mx-auto`}>
          {paidPlans.map((plan, i) => {
            const isMiddle = paidPlans.length === 3 && i === 1;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col transition-all relative ${
                  isMiddle
                    ? "glass border-primary/50 shadow-glow scale-[1.02]"
                    : "glass hover:border-primary/30"
                }`}
              >
                {isMiddle && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full gradient-primary text-xs font-bold text-primary-foreground flex items-center gap-1">
                    <Star className="h-3 w-3" /> الأكثر طلباً
                  </div>
                )}
                <h3 className="text-lg font-bold text-foreground mb-2">{plan.name}</h3>
                {plan.name_en && <p className="text-xs text-muted-foreground mb-2">{plan.name_en}</p>}

                {/* Dual pricing */}
                <div className="mb-1">
                  <span className="text-3xl font-black text-primary">{plan.price}</span>
                  <span className="text-xs text-muted-foreground mr-1">د.ل / {plan.period}</span>
                </div>
                <div className="mb-3">
                  <span className="text-sm font-bold text-muted-foreground">{formatUSD(plan.price)} $</span>
                  <span className="text-[10px] text-muted-foreground/70 mr-1"> (1$ ≈ {currency.rate} د.ل)</span>
                </div>

                <div className="space-y-1.5 mb-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground">المستخدمين</span>
                    <span className="font-bold text-foreground">{plan.max_users === -1 ? "∞" : plan.max_users}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground">الموظفين</span>
                    <span className="font-bold text-foreground">{plan.max_employees === -1 ? "∞" : (plan.max_employees || plan.max_users)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground">المخازن</span>
                    <span className="font-bold text-foreground">{plan.max_stores === -1 ? "∞" : plan.max_stores}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground">المنتجات</span>
                    <span className="font-bold text-foreground">{plan.max_products === -1 ? "غير محدود" : plan.max_products}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/30">
                    <span className="text-muted-foreground">التخزين</span>
                    <span className="font-bold text-foreground">{plan.max_storage_mb >= 5000 ? `${(plan.max_storage_mb / 1000).toFixed(0)} GB` : `${plan.max_storage_mb || 500} MB`}</span>
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
                  className={`block text-center py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isMiddle
                      ? "gradient-primary text-primary-foreground shadow-glow"
                      : "border border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  ابدأ الآن
                </Link>
              </div>
            );
          })}
        </div>

        {/* Exchange rate note */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground/60">💱 سعر الصرف: 1 دولار أمريكي ≈ {currency.rate} دينار ليبي (للتوضيح لغير الليبيين)</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
