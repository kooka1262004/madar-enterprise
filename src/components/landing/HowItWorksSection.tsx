import { UserPlus, Settings, Rocket, BarChart3 } from "lucide-react";

const steps = [
  { icon: UserPlus, num: "١", title: "أنشئ حسابك", desc: "سجّل شركتك في أقل من دقيقة. أدخل بياناتك الأساسية وابدأ فوراً بتجربة مجانية لمدة أسبوع كامل بكل المميزات." },
  { icon: Settings, num: "٢", title: "خصّص نظامك", desc: "أضف مخازنك، منتجاتك، وموظفيك. حدد الصلاحيات لكل مستخدم وخصص هوية شركتك في المنصة." },
  { icon: Rocket, num: "٣", title: "ابدأ العمل", desc: "استخدم أدوات إدارة المخزون، الباركود، الجرد، والموارد البشرية لتنظيم عملك بشكل احترافي." },
  { icon: BarChart3, num: "٤", title: "راقب وحلّل", desc: "تابع تقارير الأرباح والخسائر، حلّل أداء المنتجات، واتخذ قرارات ذكية مبنية على بيانات حقيقية." },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
      <div className="container mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            كيف تعمل <span className="text-primary">مدار</span>؟
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            أربع خطوات بسيطة لتبدأ رحلتك نحو إدارة أعمال أكثر تنظيماً وكفاءة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={s.num} className="text-center relative">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                <s.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="text-3xl font-black text-primary/20 mb-2">{s.num}</div>
              <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 -left-4 w-8 h-0.5 bg-primary/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
