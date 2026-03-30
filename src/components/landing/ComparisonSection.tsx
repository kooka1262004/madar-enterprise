import { Check, X } from "lucide-react";

const allFeatures = [
  "إدارة المنتجات",
  "حركة المخزون",
  "التقارير الأساسية",
  "نظام الباركود",
  "تنبيهات المخزون",
  "التقارير الذكية",
  "الجرد المتقدم",
  "الموارد البشرية",
  "المحاسبة",
  "إدارة الموردين",
  "التالف والمرتجعات",
  "سجل النشاطات",
  "إعادة الطلب الذكية",
  "تحليل الأرباح المتقدم",
  "كشف التلاعب والاحتيال",
  "تخصيص كامل للهوية",
  "أولوية الدعم الفني",
];

type PlanCheck = boolean;
const planData: Record<string, PlanCheck[]> = {
  "الأساسية": [true,true,true,true,true, false,false,false,false,false,false,false,false,false,false,false,false],
  "الاحترافية": [true,true,true,true,true, true,true,true,true,true,true, false,false,false,false,false,false],
  "الأعمال": [true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true],
};

const ComparisonSection = () => {
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
                {Object.keys(planData).map((p) => (
                  <th key={p} className="py-4 px-4 text-center text-sm font-bold text-primary">{p}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((f, i) => (
                <tr key={f} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">{f}</td>
                  {Object.values(planData).map((checks, j) => (
                    <td key={j} className="py-3 px-4 text-center">
                      {checks[i] ? (
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
