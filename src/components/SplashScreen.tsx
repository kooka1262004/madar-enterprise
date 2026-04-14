import { useState, useEffect } from "react";
import logo from "@/assets/logo-transparent.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeOut(true), 2000);
    const endTimer = setTimeout(() => onFinish(), 2500);
    return () => { clearTimeout(timer); clearTimeout(endTimer); };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[10000] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ${fadeOut ? "opacity-0" : "opacity-100"}`}
    >
      <img src={logo} alt="مدار" className="w-28 h-28 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold text-foreground mb-2">مدار</h1>
      <p className="text-sm text-muted-foreground">منصة إدارة متكاملة</p>
      <div className="mt-8 w-12 h-1 rounded-full bg-primary/30 overflow-hidden">
        <div className="h-full bg-primary rounded-full animate-[loading_2s_ease-in-out]" />
      </div>
    </div>
  );
};

export default SplashScreen;
