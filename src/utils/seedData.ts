// Seeder: Creates demo company with data
export const seedDemoData = () => {
  const DEMO_COMPANY_ID = "demo_company_001";
  const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");
  if (companies.find((c: any) => c.id === DEMO_COMPANY_ID)) return;

  const demoCompany = {
    id: DEMO_COMPANY_ID,
    companyName: "شركة النجاح للتجارة",
    managerName: "أحمد محمد",
    email: "admin@najah.ly",
    phone: "0912345678",
    password: "123456",
    city: "طرابلس",
    plan: "pro",
    planName: "الباقة الاحترافية",
    wallet: 500,
    devices: [],
    maxDevices: 5,
    trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    status: "active",
  };
  companies.push(demoCompany);
  localStorage.setItem("madar_companies", JSON.stringify(companies));

  const demoProducts = [
    { id: "prod_001", name: "هاتف سامسونج A54", code: "SAM-A54", type: "إلكترونيات", quantity: 25, buyPrice: 800, sellPrice: 1100, createdAt: new Date().toISOString() },
    { id: "prod_002", name: "سماعات بلوتوث", code: "BT-EAR-01", type: "إلكترونيات", quantity: 50, buyPrice: 50, sellPrice: 85, createdAt: new Date().toISOString() },
    { id: "prod_003", name: "حقيبة لابتوب", code: "BAG-LP-01", type: "إكسسوارات", quantity: 30, buyPrice: 30, sellPrice: 55, createdAt: new Date().toISOString() },
  ];
  localStorage.setItem(`madar_products_${DEMO_COMPANY_ID}`, JSON.stringify(demoProducts));

  console.log("✅ Demo data seeded: شركة النجاح للتجارة");
  console.log("👤 Admin: admin@najah.ly / 123456");
};
