import { useState, useEffect } from "react";
import logo from "@/assets/logo-transparent.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 60);

    const timer = setTimeout(() => setFadeOut(true), 3500);
    const endTimer = setTimeout(() => onFinish(), 4200);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
      clearTimeout(endTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center transition-opacity duration-700 ${fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"}`}
      style={{
        background: "linear-gradient(160deg, hsl(220 30% 6%) 0%, hsl(215 40% 12%) 50%, hsl(220 30% 6%) 100%)",
        transition: "opacity 700ms ease-out, transform 700ms ease-out",
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(210 80% 55% / 0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative">
          <div
            className="absolute inset-0 blur-2xl opacity-40 rounded-full"
            style={{ background: "hsl(210 80% 55% / 0.3)" }}
          />
          <img
            src={logo}
            alt="مدار"
            className="relative w-36 h-36 mb-8 animate-[splash-logo_1s_ease-out]"
          />
        </div>

        <h1
          className="text-4xl font-black mb-2 animate-[splash-text_1s_ease-out_0.3s_both]"
          style={{ color: "hsl(210 40% 96%)" }}
        >
          مدار
        </h1>
        <p
          className="text-base mb-1 animate-[splash-text_1s_ease-out_0.5s_both]"
          style={{ color: "hsl(215 15% 55%)" }}
        >
          منصة إدارة متكاملة
        </p>
        <p
          className="text-xs animate-[splash-text_1s_ease-out_0.7s_both]"
          style={{ color: "hsl(215 15% 40%)" }}
        >
          إدارة · محاسبة · موارد بشرية
        </p>

        {/* Progress bar */}
        <div className="mt-10 w-48 h-1 rounded-full overflow-hidden" style={{ background: "hsl(220 20% 18%)" }}>
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, hsl(210 80% 55%), hsl(210 100% 65%))",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
