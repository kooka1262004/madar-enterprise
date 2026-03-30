import { Link } from "react-router-dom";
import { Warehouse, Users, BarChart3, Shield, Sparkles } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden pt-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-glow/5 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="animate-float mb-8">
          <img src={logoDark} alt="مدار" className="h-32 md:h-40 mx-auto" />
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
          <span className="text-foreground">منصة </span>
          <span className="text-primary text-glow">مدار</span>
          <br />
          <span className="text-xl md:text-3xl lg:text-4xl font-bold text-muted-foreground">
            منصة متكاملة لإدارة المخازن والموارد البشرية
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-base md:text-lg text-muted-foreground mb-10 leading-relaxed">
          تحكّم في مخازنك، نظّم فريقك، وحلّل أرباحك من مكان واحد.
          <br />
          مدار تساعد الشركات والتجار في ليبيا على إدارة أعمالهم باحترافية وكفاءة عالية.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/register/company"
            className="px-8 py-3.5 text-base font-bold rounded-xl gradient-primary text-primary-foreground shadow-glow hover:opacity-90 transition-all"
          >
            ابدأ تجربتك المجانية
          </Link>
          <a
            href="#features"
            className="px-8 py-3.5 text-base font-bold rounded-xl border border-border hover:border-primary/50 text-foreground transition-all"
          >
            اكتشف المميزات
          </a>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { icon: Warehouse, label: "إدارة المخازن", desc: "تتبع وجرد ذكي" },
            { icon: Users, label: "الموارد البشرية", desc: "موظفين ورواتب" },
            { icon: BarChart3, label: "المحاسبة", desc: "أرباح وتقارير" },
            { icon: Shield, label: "الأمان", desc: "حماية متقدمة" },
          ].map((item) => (
            <div key={item.label} className="glass rounded-xl p-4 hover:border-primary/30 transition-all group">
              <item.icon className="h-6 w-6 text-primary mb-2 mx-auto group-hover:scale-110 transition-transform" />
              <div className="text-sm font-bold text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
