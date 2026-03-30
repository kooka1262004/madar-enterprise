import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeGeneratorProps {
  value: string;
  width?: number;
  height?: number;
  format?: string;
}

const BarcodeGenerator = ({ value, width = 2, height = 80, format = "CODE128" }: BarcodeGeneratorProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format,
          width,
          height,
          displayValue: true,
          fontSize: 14,
          margin: 10,
          background: "#ffffff",
          lineColor: "#000000",
        });
      } catch (e) {
        // fallback for invalid format
        try {
          JsBarcode(svgRef.current, value, {
            format: "CODE128",
            width,
            height,
            displayValue: true,
            fontSize: 14,
            margin: 10,
            background: "#ffffff",
            lineColor: "#000000",
          });
        } catch (e2) {}
      }
    }
  }, [value, width, height, format]);

  if (!value) return null;

  return (
    <div className="bg-white p-4 rounded-xl inline-block">
      <svg ref={svgRef} />
    </div>
  );
};

export default BarcodeGenerator;
