import { useState, useEffect } from "react";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const defaultContact = {
  email: "support@madar.ly",
  phone: "+218 XX XXX XXXX",
  address: "ليبيا - طرابلس",
  workDays: "الأحد - الخميس: 9:00 ص - 5:00 م",
  offDays: "الجمعة - السبت: مغلق",
};

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [contact, setContact] = useState(defaultContact);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from("platform_settings").select("value").eq("key", "contact_info").maybeSingle().then(({ data }) => {
      if (data?.value) setContact({ ...defaultContact, ...(data.value as any) });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Get admin user to send message to
    const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin" as any).limit(1);
    const adminId = adminRoles?.[0]?.user_id;
    if (adminId) {
      await supabase.from("notifications").insert({
        user_id: adminId,
        title: "رسالة جديدة من الموقع",
        message: `من: ${form.name} (${form.email})\n${form.message}`,
        type: "message",
      });
    }
    alert("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
    setForm({ name: "", email: "", message: "" });
    setSending(false);
  };

  return (
    <section id="contact" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-primary/3 pointer-events-none" />
      <div className="container mx-auto max-w-4xl relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4">
            تواصل <span className="text-primary">معنا</span>
          </h2>
          <p className="text-muted-foreground">لديك سؤال أو استفسار؟ نحن هنا لمساعدتك.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">الاسم الكامل</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="أدخل اسمك الكامل" required
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="أدخل بريدك الإلكتروني" required
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-1">الرسالة</label>
              <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="اكتب رسالتك هنا..." required rows={4}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm resize-none" />
            </div>
            <button type="submit" disabled={sending} className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50">
              <Send className="h-4 w-4" /> {sending ? "جاري الإرسال..." : "إرسال الرسالة"}
            </button>
          </form>

          <div className="space-y-6">
            <div className="glass rounded-xl p-6 space-y-4">
              <h3 className="font-bold text-foreground">معلومات التواصل</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span dir="ltr">{contact.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>{contact.address}</span>
              </div>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="font-bold text-foreground mb-2">ساعات العمل</h3>
              <p className="text-sm text-muted-foreground">{contact.workDays || defaultContact.workDays}</p>
              <p className="text-sm text-muted-foreground">{contact.offDays || defaultContact.offDays}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
