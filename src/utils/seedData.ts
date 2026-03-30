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

  // Demo employees with different permissions
  const demoEmployees = [
    {
      id: "emp_001", fullName: "سالم العريبي", email: "salem@najah.ly", password: "emp123",
      phone: "0923456789", position: "مسؤول مخزن", department: "المخزون",
      salary: 1500, contractType: "دائم", contractEnd: "", nationalId: "1234567890",
      qualification: "بكالوريوس", bankName: "مصرف الجمهورية", bankAccount: "1234",
      status: "active", accountStatus: "active",
      permissions: ["dashboard", "my-info", "products", "stock", "barcode", "suppliers", "inventory", "returns"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "emp_002", fullName: "فاطمة بن عامر", email: "fatma@najah.ly", password: "emp123",
      phone: "0934567890", position: "محاسبة", department: "المالية",
      salary: 2000, contractType: "دائم", contractEnd: "", nationalId: "0987654321",
      qualification: "ماجستير محاسبة", bankName: "مصرف التجارة", bankAccount: "5678",
      status: "active", accountStatus: "active",
      permissions: ["dashboard", "my-info", "accounting", "profits", "invoices", "reports"],
      createdAt: new Date().toISOString(),
    },
    {
      id: "emp_003", fullName: "يوسف الشريف", email: "youssef@najah.ly", password: "emp123",
      phone: "0945678901", position: "مندوب مبيعات", department: "المبيعات",
      salary: 1200, contractType: "مؤقت", contractEnd: "2026-12-31", nationalId: "1122334455",
      qualification: "دبلوم", bankName: "مصرف الوحدة", bankAccount: "9012",
      status: "active", accountStatus: "active",
      permissions: ["dashboard", "my-info", "products", "invoices"],
      createdAt: new Date().toISOString(),
    },
  ];
  localStorage.setItem(`madar_employees_${DEMO_COMPANY_ID}`, JSON.stringify(demoEmployees));

  console.log("✅ Demo data seeded: شركة النجاح للتجارة");
  console.log("👤 Company Admin: admin@najah.ly / 123456");
  console.log("👤 Employees: salem@najah.ly / fatma@najah.ly / youssef@najah.ly (password: emp123)");
};
