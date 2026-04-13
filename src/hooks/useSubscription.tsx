import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlanLimits {
  max_employees: number;
  max_users: number;
  max_stores: number;
  max_products: number;
  max_storage_mb: number;
  max_db_mb: number;
  max_file_uploads: number;
  max_departments: number;
  allowed_features: string[];
}

interface SubscriptionState {
  subscription: any | null;
  plan: any | null;
  limits: PlanLimits;
  status: "active" | "expired" | "suspended" | "trial" | "none";
  daysLeft: number;
  isExpired: boolean;
  isNearExpiry: boolean;
  expiryWarning: string;
  loading: boolean;
}

const DEFAULT_LIMITS: PlanLimits = {
  max_employees: 0, max_users: 1, max_stores: 1, max_products: 10,
  max_storage_mb: 50, max_db_mb: 10, max_file_uploads: 10, max_departments: 1,
  allowed_features: ["dashboard", "products"],
};

export const useSubscription = (companyId: string | null) => {
  const [state, setState] = useState<SubscriptionState>({
    subscription: null, plan: null, limits: DEFAULT_LIMITS,
    status: "none", daysLeft: 0, isExpired: false, isNearExpiry: false,
    expiryWarning: "", loading: true,
  });

  const checkSubscription = useCallback(async () => {
    if (!companyId) { setState(s => ({ ...s, loading: false })); return; }

    const [{ data: sub }, { data: company }] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("company_id", companyId).eq("status", "active").order("created_at", { ascending: false }).limit(1),
      supabase.from("companies").select("plan, plan_name, trial_end, status").eq("id", companyId).single(),
    ]);

    const activeSub = sub?.[0];
    let plan: any = null;

    if (activeSub?.plan_id) {
      const { data: p } = await supabase.from("plans").select("*").eq("id", activeSub.plan_id).single();
      plan = p;
    } else if (company?.plan) {
      const { data: p } = await supabase.from("plans").select("*").eq("id", company.plan).single();
      if (!p) {
        const { data: p2 } = await supabase.from("plans").select("*").eq("name", company.plan_name).single();
        plan = p2;
      } else plan = p;
    }

    const limits: PlanLimits = plan ? {
      max_employees: plan.max_employees ?? 0,
      max_users: plan.max_users ?? 1,
      max_stores: plan.max_stores ?? 1,
      max_products: plan.max_products ?? 50,
      max_storage_mb: plan.max_storage_mb ?? 200,
      max_db_mb: plan.max_db_mb ?? 50,
      max_file_uploads: plan.max_file_uploads ?? 50,
      max_departments: plan.max_departments ?? 1,
      allowed_features: plan.allowed_features || [],
    } : DEFAULT_LIMITS;

    let endDate: Date | null = null;
    if (activeSub?.end_date) endDate = new Date(activeSub.end_date);
    else if (company?.trial_end) endDate = new Date(company.trial_end);

    const now = new Date();
    const daysLeft = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / 86400000)) : 0;
    const isExpired = endDate ? now > endDate : !activeSub;
    const isNearExpiry = daysLeft > 0 && daysLeft <= 7;

    let status: SubscriptionState["status"] = "none";
    if (company?.status === "suspended") status = "suspended";
    else if (activeSub && !isExpired) status = "active";
    else if (!activeSub && company?.trial_end && !isExpired) status = "trial";
    else status = "expired";

    let expiryWarning = "";
    if (isNearExpiry) expiryWarning = `⚠️ اشتراكك ينتهي خلال ${daysLeft} يوم. جدّد الآن!`;
    if (isExpired && status !== "trial") expiryWarning = "🚫 اشتراكك منتهي. يرجى التجديد للاستمرار.";

    setState({ subscription: activeSub, plan, limits, status, daysLeft, isExpired: isExpired && status !== "trial", isNearExpiry, expiryWarning, loading: false });
  }, [companyId]);

  useEffect(() => { checkSubscription(); }, [checkSubscription]);

  const canAddEmployee = useCallback((currentCount: number) => {
    if (state.limits.max_employees === -1) return true;
    return currentCount < state.limits.max_employees;
  }, [state.limits.max_employees]);

  const canAddProduct = useCallback((currentCount: number) => {
    if (state.limits.max_products === -1) return true;
    return currentCount < state.limits.max_products;
  }, [state.limits.max_products]);

  const canAddStore = useCallback((currentCount: number) => {
    if (state.limits.max_stores === -1) return true;
    return currentCount < state.limits.max_stores;
  }, [state.limits.max_stores]);

  const hasFeature = useCallback((feature: string) => {
    // If no features defined (trial with all access or unlimited plan), allow all
    if (state.limits.allowed_features.length === 0) return true;
    return state.limits.allowed_features.includes(feature);
  }, [state.limits.allowed_features]);

  const getUpgradeMessage = useCallback((resource: string) => {
    return `باقتك الحالية لا تسمح بإضافة المزيد من ${resource}. يرجى ترقية باقتك للحصول على سعة أكبر.`;
  }, []);

  return {
    ...state,
    canAddEmployee,
    canAddProduct,
    canAddStore,
    hasFeature,
    getUpgradeMessage,
    refresh: checkSubscription,
  };
};
