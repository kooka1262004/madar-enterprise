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

    // Verify calling user is a company owner
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: callingUser }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !callingUser) throw new Error("Unauthorized");

    // Check caller has company role
    const { data: callerRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .maybeSingle();
    
    if (!callerRole || (callerRole.role !== "company" && callerRole.role !== "admin")) {
      throw new Error("Only company owners can create employees");
    }

    const body = await req.json();
    const { email, password, fullName, position, department, permissions, companyId, salary, phone, contractType } = body;

    if (!email || !password || !fullName || !companyId) {
      throw new Error("Missing required fields: email, password, fullName, companyId");
    }

    // Verify calling user owns the company
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("id, owner_id")
      .eq("id", companyId)
      .eq("owner_id", callingUser.id)
      .maybeSingle();

    if (!company && callerRole.role !== "admin") {
      throw new Error("Company not found or you don't own it");
    }

    // Create auth user with admin API (won't affect caller's session)
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (createErr) throw createErr;

    const userId = newUser.user.id;

    // Assign employee role
    await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "employee" });

    // Create employee record
    await supabaseAdmin.from("employees").insert({
      company_id: companyId,
      user_id: userId,
      full_name: fullName,
      email: email.trim().toLowerCase(),
      position: position || "",
      department: department || "",
      permissions: permissions || ["dashboard", "my-info"],
      status: "active",
      salary: salary || 0,
      phone: phone || "",
      contract_type: contractType || "دائم",
    });

    // Create profile
    await supabaseAdmin.from("profiles").insert({
      user_id: userId,
      email: email.trim().toLowerCase(),
      full_name: fullName,
      phone: phone || "",
    });

    return new Response(JSON.stringify({ success: true, userId, email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
