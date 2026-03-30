import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "ما هي منصة مدار؟", a: "مدار هي منصة سحابية متكاملة لإدارة المخازن والموارد البشرية والمحاسبة والجرد، مصممة خصيصاً للشركات والتجار في ليبيا. تساعدك على تنظيم عملك بالكامل من مكان واحد." },
  { q: "هل يمكنني تجربة المنصة مجاناً؟", a: "نعم! نوفر تجربة مجانية لمدة أسبوع كامل تشمل جميع المميزات والصلاحيات بدون أي قيود." },
  { q: "كيف يمكنني شحن محفظتي؟", a: "يمكنك شحن محفظتك عبر ثلاث طرق: الدفع النقدي (كاش) عبر مندوب، التحويل المصرفي إلى حساب المنصة، أو عبر خدمات الدفع الإلكتروني." },
  { q: "هل يمكن لموظفيني إنشاء حسابات بأنفسهم؟", a: "لا، فقط مسؤول الشركة يمكنه إضافة الموظفين وتحديد صلاحياتهم. هذا يضمن أمان وتنظيم الوصول إلى بيانات شركتك." },
  { q: "هل المنصة تعمل على الهاتف؟", a: "نعم! مدار مصممة لتعمل بشكل مثالي على جميع الأجهزة: الهاتف المحمول، التابلت، والكمبيوتر." },
  { q: "هل يمكنني تخصيص المنصة لشركتي؟", a: "بالتأكيد! يمكنك تغيير الشعار، هوية الشركة، صفحة دخول الموظفين، وتحديد الأقسام المتاحة لكل مستخدم من لوحة التحكم." },
  { q: "هل بياناتي آمنة؟", a: "نعم، كل شركة لها بيانات مستقلة تماماً. نستخدم تشفيراً متقدماً ونظام صلاحيات صارم لحماية بياناتك." },
  { q: "هل يمكنني تحميل التقارير؟", a: "نعم، يمكنك تحميل جميع التقارير بصيغة PDF بما في ذلك تقارير المخزون، المالية، الموظفين، والجرد." },
];

const FAQSection = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            الأسئلة <span className="text-primary">الشائعة</span>
          </h2>
          <p className="text-muted-foreground">إجابات على أكثر الأسئلة شيوعاً حول منصة مدار.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="glass rounded-xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right"
              >
                <span className="font-bold text-foreground text-sm">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-primary shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`} />
              </button>
              {open === i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
