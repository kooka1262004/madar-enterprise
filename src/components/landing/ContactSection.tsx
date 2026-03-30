import { useState } from "react";
import { Send, Phone, Mail, MapPin } from "lucide-react";

const defaultContact = {
  email: "support@madar.ly",
  phone: "+218 XX XXX XXXX",
  address: "ليبيا - طرابلس",
  workDays: "الأحد - الخميس: 9:00 ص - 5:00 م",
  offDays: "الجمعة - السبت: مغلق",
};

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const contact = JSON.parse(localStorage.getItem("madar_contact_info") || JSON.stringify(defaultContact));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Save to admin messages
    const msgs = JSON.parse(localStorage.getItem("madar_admin_messages") || "[]");
    msgs.unshift({ id: Date.now().toString(), from: form.name, type: "رسالة من الموقع", message: `${form.message}\n\nالبريد: ${form.email}`, date: new Date().toISOString() });
    localStorage.setItem("madar_admin_messages", JSON.stringify(msgs));
    const notifs = JSON.parse(localStorage.getItem("madar_admin_notifs") || "[]");
    notifs.unshift({ id: Date.now().toString(), message: `رسالة جديدة من الموقع: ${form.name} - ${form.message.substring(0, 50)}`, date: new Date().toISOString(), read: false });
    localStorage.setItem("madar_admin_notifs", JSON.stringify(notifs));
    alert("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");
    setForm({ name: "", email: "", message: "" });
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
            <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all">
              <Send className="h-4 w-4" /> إرسال الرسالة
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
              <p className="text-sm text-muted-foreground">{contact.workDays}</p>
              <p className="text-sm text-muted-foreground">{contact.offDays}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
