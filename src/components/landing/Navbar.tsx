import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo-transparent.png";

const navLinks = [
  { label: "المميزات", href: "#features" },
  { label: "كيف تعمل", href: "#how-it-works" },
  { label: "الباقات", href: "#pricing" },
  { label: "الأسئلة الشائعة", href: "#faq" },
  { label: "تواصل معنا", href: "#contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [branding, setBranding] = useState<any>({});

  useEffect(() => {
    supabase.from("platform_settings").select("value").eq("key", "branding").maybeSingle().then(({ data }) => {
      if (data?.value) setBranding(data.value as any);
    });
  }, []);

  const displayLogo = branding.logo || logo;

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={displayLogo} alt={branding.name || "مدار"} className="h-10 w-auto" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login/company" className="px-5 py-2 text-sm font-semibold rounded-lg border border-border hover:border-primary/50 text-foreground transition-all">
            دخول الشركات
          </Link>
          <Link to="/register/company" className="px-5 py-2 text-sm font-semibold rounded-lg gradient-primary text-primary-foreground shadow-glow transition-all hover:opacity-90">
            إنشاء حساب
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-border/30 p-4 space-y-3">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium text-muted-foreground hover:text-primary py-2">
              {l.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-3 border-t border-border/30">
            <Link to="/login/company" className="text-center px-5 py-2 text-sm font-semibold rounded-lg border border-border text-foreground">دخول الشركات</Link>
            <Link to="/register/company" className="text-center px-5 py-2 text-sm font-semibold rounded-lg gradient-primary text-primary-foreground">إنشاء حساب</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
