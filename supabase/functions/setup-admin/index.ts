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

    // Delete ALL existing users first
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    if (existingUsers?.users) {
      for (const u of existingUsers.users) {
        // Clean up related data
        await supabaseAdmin.from("user_roles").delete().eq("user_id", u.id);
        await supabaseAdmin.from("profiles").delete().eq("user_id", u.id);
        await supabaseAdmin.from("employees").delete().eq("user_id", u.id);
        // Delete companies owned by this user
        const { data: userCompanies } = await supabaseAdmin.from("companies").select("id").eq("owner_id", u.id);
        if (userCompanies) {
          for (const c of userCompanies) {
            await supabaseAdmin.from("employees").delete().eq("company_id", c.id);
            await supabaseAdmin.from("products").delete().eq("company_id", c.id);
            await supabaseAdmin.from("orders").delete().eq("company_id", c.id);
            await supabaseAdmin.from("invoices").delete().eq("company_id", c.id);
            await supabaseAdmin.from("attendance").delete().eq("company_id", c.id);
            await supabaseAdmin.from("tasks").delete().eq("company_id", c.id);
            await supabaseAdmin.from("employee_requests").delete().eq("company_id", c.id);
            await supabaseAdmin.from("stock_movements").delete().eq("company_id", c.id);
            await supabaseAdmin.from("suppliers").delete().eq("company_id", c.id);
            await supabaseAdmin.from("wallet_requests").delete().eq("company_id", c.id);
            await supabaseAdmin.from("wallet_transactions").delete().eq("company_id", c.id);
            await supabaseAdmin.from("subscription_requests").delete().eq("company_id", c.id);
            await supabaseAdmin.from("subscriptions").delete().eq("company_id", c.id);
          }
          await supabaseAdmin.from("companies").delete().eq("owner_id", u.id);
        }
        await supabaseAdmin.from("notifications").delete().eq("user_id", u.id);
        await supabaseAdmin.from("messages").delete().or(`sender_id.eq.${u.id},receiver_id.eq.${u.id}`);
        await supabaseAdmin.auth.admin.deleteUser(u.id);
      }
    }

    // Create admin accounts
    const admins = [
      { email: "kookakooka6589@gmail.com", password: "Madar@Admin2024", name: "مسؤول النظام" },
      { email: "kookakooka6588@gmail.com", password: "Madar@Admin2024", name: "مسؤول النظام 2" },
    ];

    const results = [];

    for (const admin of admins) {
      const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
        user_metadata: { full_name: admin.name },
      });
      if (error) {
        results.push({ email: admin.email, error: error.message });
        continue;
      }
      const userId = newUser.user.id;

      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "admin" });
      await supabaseAdmin.from("profiles").insert({ user_id: userId, email: admin.email, full_name: admin.name });

      results.push({ email: admin.email, userId, status: "created" });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
