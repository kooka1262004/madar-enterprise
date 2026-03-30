import {
  Warehouse, Users, BarChart3, Package, QrCode, Bell,
  ClipboardList, TrendingUp, ShieldCheck, FileText, Settings, Clock,
} from "lucide-react";

const features = [
  { icon: Warehouse, title: "إدارة المخازن", desc: "أنشئ مخازن متعددة، تتبع الكميات، وراقب حركة المنتجات لحظة بلحظة مع تنبيهات تلقائية عند انخفاض المخزون." },
  { icon: Package, title: "إدارة المنتجات", desc: "أضف منتجاتك بكل تفاصيلها: الأسعار، المقاسات، الأكواد، الصور. نظّم كل شيء في مكان واحد." },
  { icon: QrCode, title: "نظام الباركود", desc: "أنشئ باركود لكل منتج واستخدم الماسح لتسريع عمليات الجرد والبيع والاستلام." },
  { icon: Users, title: "الموارد البشرية", desc: "أدر موظفيك بالكامل: العقود، الحضور، الإجازات، الرواتب، السلف، المكافآت، والمهام." },
  { icon: BarChart3, title: "المحاسبة والتقارير", desc: "تقارير مالية يومية وأسبوعية وشهرية وسنوية مع تحليل الأرباح والخسائر وتحميل PDF." },
  { icon: ClipboardList, title: "الجرد الاحترافي", desc: "جرد بشري وذكي بأنواع مختلفة: جرد كلي، جزئي، مفاجئ، ودوري مع تقارير فورية." },
  { icon: TrendingUp, title: "تحليل ذكي", desc: "تحليل استهلاك المنتجات، اقتراح كميات إعادة الطلب، وتحديد المنتجات الراكدة تلقائياً." },
  { icon: Bell, title: "تنبيهات ذكية", desc: "تنبيهات فورية عند انخفاض المخزون، انتهاء الاشتراك، أو أي حدث مهم في نظامك." },
  { icon: ShieldCheck, title: "صلاحيات متقدمة", desc: "تحكم كامل في ما يراه كل موظف. فعّل أو أوقف أي قسم لأي مستخدم." },
  { icon: FileText, title: "الفواتير والمرتجعات", desc: "سجل كامل للتالف والمرتجعات مع إمكانية تحميل كل التقارير بصيغة PDF." },
  { icon: Settings, title: "تخصيص كامل", desc: "خصص هوية شركتك، صفحة الدخول، والشعار من لوحة التحكم بدون أي تعديل برمجي." },
  { icon: Clock, title: "سجل النشاطات", desc: "تتبع كل عملية تتم في النظام: من أضاف، من عدّل، من حذف. شفافية كاملة." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            كل ما تحتاجه في <span className="text-primary">منصة واحدة</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            مدار توفر لك أدوات متكاملة لإدارة أعمالك باحترافية عالية، مصممة خصيصاً للسوق الليبي والعربي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass rounded-2xl p-6 hover:border-primary/40 transition-all group"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
