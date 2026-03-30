import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, X, Search } from "lucide-react";

interface BarcodeScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  lang?: string;
}

const BarcodeScanner = ({ onScan, onClose, lang = "ar" }: BarcodeScannerProps) => {
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "barcode-reader";
  const t = (ar: string, en: string) => lang === "ar" ? ar : en;

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      const html5Qrcode = new Html5Qrcode(containerId);
      scannerRef.current = html5Qrcode;
      setScanning(true);
      setError("");

      await html5Qrcode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        () => {}
      );
    } catch (err: any) {
      setError(t(
        "لا يمكن الوصول للكاميرا. تأكد من منح الإذن.",
        "Cannot access camera. Please grant permission."
      ));
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {}
    }
    setScanning(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="glass rounded-2xl p-6 max-w-md w-full relative">
        <button onClick={() => { stopScanner(); onClose(); }} className="absolute top-3 left-3 p-2 rounded-full bg-destructive/20 text-destructive hover:bg-destructive/30 z-10">
          <X size={20} />
        </button>
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <Camera className="h-5 w-5 text-primary" />
          {t("مسح الباركود بالكاميرا", "Scan Barcode with Camera")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {t("وجّه الكاميرا نحو الباركود وسيتم التعرف عليه تلقائياً.", "Point your camera at the barcode and it will be detected automatically.")}
        </p>
        <div
          id={containerId}
          className="w-full rounded-xl overflow-hidden bg-black min-h-[250px]"
        />
        {error && (
          <div className="mt-3 glass rounded-xl p-3 border-destructive/30">
            <p className="text-xs text-destructive">{error}</p>
          </div>
        )}
        {scanning && (
          <div className="mt-3 flex items-center gap-2 justify-center">
            <Search className="h-4 w-4 text-primary animate-pulse" />
            <p className="text-xs text-primary animate-pulse">{t("جاري البحث عن باركود...", "Searching for barcode...")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BarcodeScanner;
