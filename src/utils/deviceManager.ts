// Device fingerprinting and management utility

export interface DeviceInfo {
  id: string;
  name: string;
  type: "هاتف" | "تابلت" | "لابتوب" | "كمبيوتر" | "غير معروف";
  typeEn: "Phone" | "Tablet" | "Laptop" | "Desktop" | "Unknown";
  browser: string;
  os: string;
  firstLogin: string;
  lastActivity: string;
  active: boolean;
}

const detectDeviceType = (): { type: DeviceInfo["type"]; typeEn: DeviceInfo["typeEn"] } => {
  const ua = navigator.userAgent;
  const width = window.innerWidth;
  
  if (/iPad|tablet/i.test(ua) || (width >= 600 && width <= 1024 && 'ontouchstart' in window)) {
    return { type: "تابلت", typeEn: "Tablet" };
  }
  if (/Mobile|Android|iPhone/i.test(ua)) {
    return { type: "هاتف", typeEn: "Phone" };
  }
  if (width <= 1366 && /Mac|Windows/i.test(ua)) {
    return { type: "لابتوب", typeEn: "Laptop" };
  }
  if (/Mac|Windows|Linux/i.test(ua)) {
    return { type: "كمبيوتر", typeEn: "Desktop" };
  }
  return { type: "غير معروف", typeEn: "Unknown" };
};

const detectBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  return "Unknown";
};

const detectOS = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
};

export const generateDeviceId = (): string => {
  let deviceId = localStorage.getItem("madar_device_id");
  if (!deviceId) {
    deviceId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("madar_device_id", deviceId);
  }
  return deviceId;
};

export const getCurrentDeviceInfo = (): DeviceInfo => {
  const { type, typeEn } = detectDeviceType();
  const now = new Date().toISOString();
  return {
    id: generateDeviceId(),
    name: `${detectOS()} - ${detectBrowser()}`,
    type,
    typeEn,
    browser: detectBrowser(),
    os: detectOS(),
    firstLogin: now,
    lastActivity: now,
    active: true,
  };
};

export const getDevicesForCompany = (companyId: string): DeviceInfo[] => {
  return JSON.parse(localStorage.getItem(`madar_devices_${companyId}`) || "[]");
};

export const saveDevicesForCompany = (companyId: string, devices: DeviceInfo[]) => {
  localStorage.setItem(`madar_devices_${companyId}`, JSON.stringify(devices));
};

export const getMaxDevicesForPlan = (planId: string, plans: any[]): number => {
  const plan = plans.find((p: any) => p.id === planId);
  return plan?.devices || 1;
};

export const registerDevice = (companyId: string, maxDevices: number): { success: boolean; message: string; messageEn: string } => {
  const currentDevice = getCurrentDeviceInfo();
  const devices = getDevicesForCompany(companyId);
  
  // Check if device already registered
  const existingIdx = devices.findIndex(d => d.id === currentDevice.id);
  if (existingIdx >= 0) {
    devices[existingIdx].lastActivity = new Date().toISOString();
    devices[existingIdx].active = true;
    saveDevicesForCompany(companyId, devices);
    return { success: true, message: "تم تسجيل الدخول بنجاح", messageEn: "Login successful" };
  }
  
  // Check device limit
  const activeDevices = devices.filter(d => d.active);
  if (activeDevices.length >= maxDevices) {
    return {
      success: false,
      message: `تم الوصول للحد الأقصى من الأجهزة (${maxDevices}). يرجى حذف جهاز قديم أو ترقية الباقة.`,
      messageEn: `Device limit reached (${maxDevices}). Please remove a device or upgrade your plan.`,
    };
  }
  
  // Register new device
  devices.push(currentDevice);
  saveDevicesForCompany(companyId, devices);
  
  // Add notification
  const notifs = JSON.parse(localStorage.getItem(`madar_notif_company_${companyId}`) || "[]");
  notifs.push({
    id: Date.now().toString(),
    message: `تم تسجيل جهاز جديد: ${currentDevice.name} (${currentDevice.type})`,
    date: new Date().toISOString(),
    read: false,
  });
  localStorage.setItem(`madar_notif_company_${companyId}`, JSON.stringify(notifs));
  
  return { success: true, message: "تم تسجيل الجهاز والدخول بنجاح", messageEn: "Device registered and login successful" };
};

export const removeDevice = (companyId: string, deviceId: string) => {
  const devices = getDevicesForCompany(companyId);
  const updated = devices.filter(d => d.id !== deviceId);
  saveDevicesForCompany(companyId, updated);
};

export const deactivateDevice = (companyId: string, deviceId: string) => {
  const devices = getDevicesForCompany(companyId);
  const updated = devices.map(d => d.id === deviceId ? { ...d, active: false } : d);
  saveDevicesForCompany(companyId, updated);
};

export const getDeviceIcon = (type: string): string => {
  switch (type) {
    case "هاتف": return "📱";
    case "تابلت": return "📲";
    case "لابتوب": return "💻";
    case "كمبيوتر": return "🖥️";
    default: return "📟";
  }
};
