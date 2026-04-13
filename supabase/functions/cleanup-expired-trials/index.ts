import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find companies with expired free trial (20+ days ago) and no paid subscription
    const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredCompanies } = await supabaseAdmin
      .from("companies")
      .select("id, owner_id, company_name, trial_end, plan, plan_name")
      .or(`plan.eq.trial,plan.is.null`)
      .lt("trial_end", twentyDaysAgo);

    if (!expiredCompanies || expiredCompanies.length === 0) {
      return new Response(JSON.stringify({ message: "No expired trials to clean up", cleaned: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let cleaned = 0;

    for (const company of expiredCompanies) {
      // Check if company has any paid subscription
      const { data: paidSub } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("company_id", company.id)
        .neq("plan_name", "تجربة مجانية")
        .limit(1);

      if (paidSub && paidSub.length > 0) continue; // Has paid subscription, skip

      // Delete all related data
      const tables = [
        "attendance", "employee_requests", "tasks", "stock_movements",
        "invoices", "orders", "products", "suppliers", "warehouses",
        "wallet_requests", "wallet_transactions", "subscriptions",
        "subscription_requests", "activity_log", "messages"
      ];

      for (const table of tables) {
        await supabaseAdmin.from(table).delete().eq("company_id", company.id);
      }

      // Delete employees
      const { data: emps } = await supabaseAdmin
        .from("employees")
        .select("user_id")
        .eq("company_id", company.id);

      if (emps) {
        for (const emp of emps) {
          if (emp.user_id) {
            await supabaseAdmin.from("user_roles").delete().eq("user_id", emp.user_id);
            await supabaseAdmin.from("profiles").delete().eq("user_id", emp.user_id);
            await supabaseAdmin.from("notifications").delete().eq("user_id", emp.user_id);
            try { await supabaseAdmin.auth.admin.deleteUser(emp.user_id); } catch (_) {}
          }
        }
      }
      await supabaseAdmin.from("employees").delete().eq("company_id", company.id);

      // Delete owner data
      await supabaseAdmin.from("notifications").delete().eq("user_id", company.owner_id);
      await supabaseAdmin.from("user_roles").delete().eq("user_id", company.owner_id);
      await supabaseAdmin.from("profiles").delete().eq("user_id", company.owner_id);

      // Delete company
      await supabaseAdmin.from("companies").delete().eq("id", company.id);

      // Delete owner auth user
      try { await supabaseAdmin.auth.admin.deleteUser(company.owner_id); } catch (_) {}

      cleaned++;
      console.log(`Cleaned up company: ${company.company_name} (${company.id})`);
    }

    return new Response(JSON.stringify({ message: `Cleaned up ${cleaned} expired trial companies`, cleaned }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
