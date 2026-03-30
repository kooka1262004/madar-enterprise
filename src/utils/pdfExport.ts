// PDF Export utility - generates downloadable content
export const exportToPDF = (title: string, data: any[], columns: string[]) => {
  // Create a printable HTML document
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { font-family: 'Cairo', 'Segoe UI', sans-serif; direction: rtl; }
        body { padding: 40px; background: #fff; color: #1a1a2e; }
        h1 { color: #2563eb; font-size: 24px; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #2563eb; color: white; padding: 10px; text-align: right; font-size: 13px; }
        td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
        tr:nth-child(even) { background: #f8fafc; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        .logo { font-size: 28px; font-weight: 900; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="logo">مدار</div>
      <h1>${title}</h1>
      <div class="meta">تاريخ التصدير: ${new Date().toLocaleDateString("ar-LY")} ${new Date().toLocaleTimeString("ar-LY")}</div>
      <table>
        <thead><tr>${columns.map(c => `<th>${c}</th>`).join("")}</tr></thead>
        <tbody>${data.map(row => `<tr>${columns.map((_, i) => `<td>${Object.values(row)[i] ?? "-"}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
      <div class="footer">تم التصدير من منصة مدار - ${new Date().getFullYear()}</div>
    </body>
    </html>
  `;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) {
    win.onload = () => { win.print(); };
  }
};

export const exportSimplePDF = (title: string, content: string) => {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * { font-family: 'Cairo', 'Segoe UI', sans-serif; direction: rtl; }
        body { padding: 40px; background: #fff; color: #1a1a2e; }
        h1 { color: #2563eb; font-size: 24px; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
        .content { font-size: 14px; line-height: 2; }
        .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
        .logo { font-size: 28px; font-weight: 900; color: #2563eb; }
      </style>
    </head>
    <body>
      <div class="logo">مدار</div>
      <h1>${title}</h1>
      <div class="meta">تاريخ التصدير: ${new Date().toLocaleDateString("ar-LY")}</div>
      <div class="content">${content}</div>
      <div class="footer">تم التصدير من منصة مدار - ${new Date().getFullYear()}</div>
    </body>
    </html>
  `;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) { win.onload = () => { win.print(); }; }
};
