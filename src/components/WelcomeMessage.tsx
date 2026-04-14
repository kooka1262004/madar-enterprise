import { useState, useEffect } from "react";
import logo from "@/assets/logo-transparent.png";

const WelcomeMessage = () => {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("madar_welcome_seen");
    if (!seen) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    setFadeOut(true);
    setTimeout(() => {
      setShow(false);
      localStorage.setItem("madar_welcome_seen", "true");
    }, 300);
  };

  if (!show) return null;

  return (
    <div className={`fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
      <div className="bg-card rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-border">
        <img src={logo} alt="مدار" className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">مرحباً بك في مدار! 👋</h2>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          منصتك المتكاملة لإدارة المخازن والموارد البشرية والمحاسبة. نتمنى لك تجربة مميزة!
        </p>
        <button
          onClick={dismiss}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
        >
          ابدأ الآن
        </button>
      </div>
    </div>
  );
};

export default WelcomeMessage;
