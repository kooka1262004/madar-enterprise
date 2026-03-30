// Seeder: Creates demo company, admin, and 3 employees with different roles
export const seedDemoData = () => {
  const DEMO_COMPANY_ID = "demo_company_001";

  // Check if already seeded
  const companies = JSON.parse(localStorage.getItem("madar_companies") || "[]");
  if (companies.find((c: any) => c.id === DEMO_COMPANY_ID)) return;

  // Demo Company
  const demoCompany = {
    id: DEMO_COMPANY_ID,
    companyName: "شركة النجاح للتجارة",
    managerName: "أحمد محمد",
    email: "admin@najah.ly",
    phone: "0912345678",
    password: "123456",
    city: "طرابلس",
    planName: "الباقة الاحترافية",
    wallet: 500,
    trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  companies.push(demoCompany);
  localStorage.setItem("madar_companies", JSON.stringify(companies));

  // Demo Employees
  const demoEmployees = [
    {
      id: "emp_001",
      fullName: "سالم العريبي",
      email: "salem@najah.ly",
      password: "emp123",
      phone: "0923456789",
      position: "مسؤول مخزن",
      department: "المخازن",
      salary: 1500,
      contractType: "دائم",
      contractEnd: "2026-12-31",
      nationalId: "1234567890",
      qualification: "بكالوريوس إدارة أعمال",
      bankName: "مصرف الجمهورية",
      bankAccount: "0011223344",
      status: "active",
      permissions: ["dashboard", "my-info", "products", "stock", "barcode", "inventory", "returns", "notifications", "messages"],
      createdAt: new Date().toISOString(),
      lastLogin: null,
    },
    {
      id: "emp_002",
      fullName: "فاطمة بن علي",
      email: "fatma@najah.ly",
      password: "emp123",
      phone: "0934567890",
      position: "محاسبة",
      department: "المالية",
      salary: 2000,
      contractType: "دائم",
      contractEnd: "2027-06-30",
      nationalId: "9876543210",
      qualification: "ماجستير محاسبة",
      bankName: "المصرف التجاري",
      bankAccount: "5566778899",
      status: "active",
      permissions: ["dashboard", "my-info", "accounting", "profits", "invoices", "reports", "notifications", "messages"],
      createdAt: new Date().toISOString(),
      lastLogin: null,
    },
    {
      id: "emp_003",
      fullName: "يوسف الشريف",
      email: "youssef@najah.ly",
      password: "emp123",
      phone: "0945678901",
      position: "موظف مبيعات",
      department: "المبيعات",
      salary: 1200,
      contractType: "مؤقت",
      contractEnd: "2026-06-30",
      nationalId: "1122334455",
      qualification: "دبلوم تسويق",
      bankName: "مصرف الوحدة",
      bankAccount: "1100220033",
      status: "active",
      permissions: ["dashboard", "my-info", "products", "invoices", "notifications", "messages"],
      createdAt: new Date().toISOString(),
      lastLogin: null,
    },
  ];

  localStorage.setItem(`madar_employees_${DEMO_COMPANY_ID}`, JSON.stringify(demoEmployees));

  // Demo Products
  const demoProducts = [
    { id: "prod_001", name: "هاتف سامسونج A54", code: "SAM-A54", type: "إلكترونيات", quantity: 25, buyPrice: 800, sellPrice: 1100, createdAt: new Date().toISOString() },
    { id: "prod_002", name: "سماعات بلوتوث", code: "BT-EAR-01", type: "إلكترونيات", quantity: 50, buyPrice: 50, sellPrice: 85, createdAt: new Date().toISOString() },
    { id: "prod_003", name: "حقيبة لابتوب", code: "BAG-LP-01", type: "إكسسوارات", quantity: 30, buyPrice: 30, sellPrice: 55, createdAt: new Date().toISOString() },
  ];
  localStorage.setItem(`madar_products_${DEMO_COMPANY_ID}`, JSON.stringify(demoProducts));

  console.log("✅ Demo data seeded: شركة النجاح للتجارة");
  console.log("👤 Admin: admin@najah.ly / 123456");
  console.log("👷 Employees: salem@najah.ly, fatma@najah.ly, youssef@najah.ly / emp123");
};
