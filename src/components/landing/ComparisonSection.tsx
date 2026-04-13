import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const allFeatureKeys = [
  { key: "products", ar: "إدارة المنتجات" },
  { key: "stock", ar: "حركة المخزون" },
  { key: "reports", ar: "التقارير" },
  { key: "barcode", ar: "نظام الباركود" },
  { key: "suppliers", ar: "الموردين" },
  { key: "invoices", ar: "الفواتير" },
  { key: "accounting", ar: "المحاسبة" },
  { key: "orders", ar: "الطلبات والشحن" },
  { key: "warehouses", ar: "المخازن المتعددة" },
  { key: "inventory", ar: "الجرد المتقدم" },
  { key: "hr", ar: "الموارد البشرية" },
  { key: "users", ar: "إدارة المستخدمين" },
  { key: "permissions", ar: "نظام الصلاحيات" },
  { key: "returns", ar: "التالف والمرتجعات" },
  { key: "reorder", ar: "إعادة الطلب الذكية" },
  { key: "profits", ar: "تحليل الأرباح" },
  { key: "settings", ar: "إعدادات متقدمة" },
];

const ComparisonSection = () => {
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("plans").select("*").eq("active", true).order("price", { ascending: true }).then(({ data }) => {
      setPlans((data || []).filter((p: any) => p.price > 0));
    });
  }, []);

  if (plans.length === 0) return null;

  return (
    <section className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
      <div className="container mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            مقارنة <span className="text-primary">الباقات</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            قارن بين الباقات واختر ما يناسب احتياجات شركتك.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right py-4 px-4 text-sm font-bold text-foreground">الميزة</th>
                {plans.map((p) => (
                  <th key={p.id} className="py-4 px-4 text-center text-sm font-bold text-primary">{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatureKeys.map((f) => (
                <tr key={f.key} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">{f.ar}</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="py-3 px-4 text-center">
                      {(plan.allowed_features || []).includes(f.key) ? (
                        <Check className="h-5 w-5 text-success mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection;
