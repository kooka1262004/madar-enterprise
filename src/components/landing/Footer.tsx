import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-transparent.png";

const Footer = () => {
  const [branding, setBranding] = useState<any>({});
  const [contact, setContact] = useState<any>({});

  useEffect(() => {
    supabase.from("platform_settings").select("key, value").in("key", ["branding", "contact_info"]).then(({ data }) => {
      (data || []).forEach((s: any) => {
        if (s.key === "branding") setBranding(s.value || {});
        if (s.key === "contact_info") setContact(s.value || {});
      });
    });
  }, []);

  const displayLogo = branding.logo || logo;
  const platformName = branding.name || "مدار";

  return (
    <footer className="border-t border-border/30 py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <img src={displayLogo} alt={platformName} className="h-10 mb-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              منصة متكاملة لإدارة المخازن والموارد البشرية والمحاسبة. تحكّم. تنظيم. نمو.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">روابط سريعة</h4>
            <div className="space-y-2 text-sm">
              <a href="#features" className="block text-muted-foreground hover:text-primary transition-colors">المميزات</a>
              <a href="#pricing" className="block text-muted-foreground hover:text-primary transition-colors">الباقات</a>
              <a href="#faq" className="block text-muted-foreground hover:text-primary transition-colors">الأسئلة الشائعة</a>
              <a href="#contact" className="block text-muted-foreground hover:text-primary transition-colors">تواصل معنا</a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">الوصول السريع</h4>
            <div className="space-y-2 text-sm">
              <Link to="/login/company" className="block text-muted-foreground hover:text-primary transition-colors">دخول الشركات</Link>
              <Link to="/login/user" className="block text-muted-foreground hover:text-primary transition-colors">دخول المستخدمين</Link>
              <Link to="/register/company" className="block text-muted-foreground hover:text-primary transition-colors">إنشاء حساب شركة</Link>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-foreground mb-3">تواصل معنا</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {contact.email && <p>{contact.email}</p>}
              {contact.phone && <p dir="ltr">{contact.phone}</p>}
              {contact.address && <p>{contact.address}</p>}
            </div>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 text-center text-sm text-muted-foreground">
          جميع الحقوق محفوظة © {new Date().getFullYear()} منصة {platformName}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
