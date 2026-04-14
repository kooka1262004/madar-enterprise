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

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists by email using admin API
    let userId: string;
    
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });
    
    // Try to find existing user by querying profiles table
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.user_id;
      // Update password if user exists
      await supabaseAdmin.auth.admin.updateUser(userId, { password });
    } else {
      // Create new auth user
      const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      });
      if (createErr) throw createErr;
      userId = newUser.user.id;
    }

    // Upsert employee role
    const { data: existingRole } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (!existingRole) {
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "employee" });
    }

    // Upsert employee record
    const { data: existingEmployee } = await supabaseAdmin
      .from("employees")
      .select("id")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .maybeSingle();

    const employeeData = {
      company_id: companyId,
      user_id: userId,
      full_name: fullName,
      email: normalizedEmail,
      position: position || "",
      department: department || "",
      permissions: permissions || ["dashboard", "my-info"],
      status: "active",
      salary: salary || 0,
      phone: phone || "",
      contract_type: contractType || "دائم",
    };

    if (existingEmployee) {
      await supabaseAdmin.from("employees").update(employeeData).eq("id", existingEmployee.id);
    } else {
      await supabaseAdmin.from("employees").insert(employeeData);
    }

    // Upsert profile
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProfile) {
      await supabaseAdmin.from("profiles").update({
        email: normalizedEmail,
        full_name: fullName,
        phone: phone || "",
      }).eq("user_id", userId);
    } else {
      await supabaseAdmin.from("profiles").insert({
        user_id: userId,
        email: normalizedEmail,
        full_name: fullName,
        phone: phone || "",
      });
    }

    return new Response(JSON.stringify({ success: true, userId, email: normalizedEmail }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
