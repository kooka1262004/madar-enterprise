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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !user) throw new Error("Unauthorized");

    const { action, companyId, employeeId, data: reqData } = await req.json();

    // Verify user owns company or is admin
    const { data: company } = await supabaseAdmin
      .from("companies")
      .select("id, owner_id, company_name")
      .eq("id", companyId)
      .single();

    if (!company || (company.owner_id !== user.id)) {
      const { data: role } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id).maybeSingle();
      if (!role || role.role !== "admin") throw new Error("Unauthorized");
    }

    // Fetch company HR data
    const [{ data: employees }, { data: attendance }, { data: requests }, { data: tasks }] = await Promise.all([
      supabaseAdmin.from("employees").select("*").eq("company_id", companyId),
      supabaseAdmin.from("attendance").select("*").eq("company_id", companyId).order("date", { ascending: false }).limit(200),
      supabaseAdmin.from("employee_requests").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(100),
      supabaseAdmin.from("tasks").select("*").eq("company_id", companyId).order("created_at", { ascending: false }).limit(100),
    ]);

    const emps = employees || [];
    const att = attendance || [];
    const reqs = requests || [];
    const tks = tasks || [];

    let result: any = {};

    if (action === "performance-analysis") {
      // Analyze each employee performance
      const analysis = emps.map(emp => {
        const empAtt = att.filter(a => a.employee_id === emp.id);
        const totalDays = empAtt.length;
        const lateDays = empAtt.filter(a => a.status === "متأخر" || a.status === "late").length;
        const absentDays = empAtt.filter(a => a.status === "غائب" || a.status === "absent").length;
        const onTimeDays = empAtt.filter(a => a.status === "في الوقت" || a.status === "on_time" || a.status === "حاضر").length;
        const totalDeductions = empAtt.reduce((sum, a) => sum + (a.deduction || 0), 0);
        const empTasks = tks.filter(t => t.employee_id === emp.id);
        const completedTasks = empTasks.filter(t => t.status === "completed" || t.status === "done").length;
        const empReqs = reqs.filter(r => r.employee_id === emp.id);
        
        const attendanceRate = totalDays > 0 ? Math.round((onTimeDays / totalDays) * 100) : 100;
        const taskCompletionRate = empTasks.length > 0 ? Math.round((completedTasks / empTasks.length) * 100) : 0;
        const overallScore = Math.round((attendanceRate * 0.4) + (taskCompletionRate * 0.3) + (lateDays === 0 ? 30 : Math.max(0, 30 - lateDays * 5)));

        let recommendation = "";
        if (overallScore >= 85) recommendation = "أداء ممتاز - يستحق مكافأة أو ترقية";
        else if (overallScore >= 70) recommendation = "أداء جيد - يحتاج تشجيع بسيط";
        else if (overallScore >= 50) recommendation = "أداء متوسط - يحتاج متابعة ودعم";
        else recommendation = "أداء ضعيف - يحتاج تنبيه رسمي وخطة تحسين";

        return {
          id: emp.id,
          name: emp.full_name,
          position: emp.position,
          department: emp.department,
          attendanceRate,
          taskCompletionRate,
          overallScore,
          totalDeductions,
          lateDays,
          absentDays,
          totalTasks: empTasks.length,
          completedTasks,
          pendingRequests: empReqs.filter(r => r.status === "pending").length,
          recommendation,
        };
      });

      result = { analysis, summary: {
        totalEmployees: emps.length,
        avgScore: analysis.length > 0 ? Math.round(analysis.reduce((s, a) => s + a.overallScore, 0) / analysis.length) : 0,
        topPerformer: analysis.sort((a, b) => b.overallScore - a.overallScore)[0]?.name || "-",
        needsAttention: analysis.filter(a => a.overallScore < 50).map(a => a.name),
      }};
    }

    else if (action === "salary-optimization") {
      const salaryAnalysis = emps.map(emp => {
        const empAtt = att.filter(a => a.employee_id === emp.id);
        const totalDeductions = empAtt.reduce((sum, a) => sum + (a.deduction || 0), 0);
        const empTasks = tks.filter(t => t.employee_id === emp.id);
        const completedTasks = empTasks.filter(t => t.status === "completed" || t.status === "done").length;
        const netSalary = (emp.salary || 0) - totalDeductions;
        
        let suggestion = "";
        if (completedTasks > 5 && totalDeductions === 0) suggestion = "يستحق زيادة 5-10%";
        else if (totalDeductions > (emp.salary || 0) * 0.1) suggestion = "خصومات مرتفعة - مراجعة الانضباط";
        else suggestion = "الراتب مناسب حالياً";

        return {
          name: emp.full_name,
          baseSalary: emp.salary || 0,
          deductions: totalDeductions,
          netSalary,
          completedTasks,
          suggestion,
        };
      });

      result = { salaryAnalysis, totalPayroll: salaryAnalysis.reduce((s, e) => s + e.netSalary, 0) };
    }

    else if (action === "attendance-insights") {
      const today = new Date().toISOString().split("T")[0];
      const thisMonth = att.filter(a => a.date?.startsWith(today.slice(0, 7)));
      
      const insights = {
        totalRecords: thisMonth.length,
        onTime: thisMonth.filter(a => a.status === "في الوقت" || a.status === "on_time" || a.status === "حاضر").length,
        late: thisMonth.filter(a => a.status === "متأخر" || a.status === "late").length,
        absent: thisMonth.filter(a => a.status === "غائب" || a.status === "absent").length,
        totalDeductions: thisMonth.reduce((s, a) => s + (a.deduction || 0), 0),
        mostLate: (() => {
          const lateCounts: Record<string, number> = {};
          thisMonth.filter(a => a.status === "متأخر" || a.status === "late").forEach(a => {
            lateCounts[a.employee_id] = (lateCounts[a.employee_id] || 0) + 1;
          });
          const topId = Object.entries(lateCounts).sort((a, b) => b[1] - a[1])[0];
          return topId ? { name: emps.find(e => e.id === topId[0])?.full_name || "-", count: topId[1] } : null;
        })(),
        bestAttendance: (() => {
          const onTimeCounts: Record<string, number> = {};
          thisMonth.filter(a => a.status === "في الوقت" || a.status === "on_time" || a.status === "حاضر").forEach(a => {
            onTimeCounts[a.employee_id] = (onTimeCounts[a.employee_id] || 0) + 1;
          });
          const topId = Object.entries(onTimeCounts).sort((a, b) => b[1] - a[1])[0];
          return topId ? { name: emps.find(e => e.id === topId[0])?.full_name || "-", count: topId[1] } : null;
        })(),
      };

      result = { insights };
    }

    else if (action === "team-recommendations") {
      const recommendations: string[] = [];
      
      if (emps.length === 0) recommendations.push("لم يتم إضافة موظفين بعد. أضف موظفين لبدء إدارة فريقك.");
      
      const pendingReqs = reqs.filter(r => r.status === "pending");
      if (pendingReqs.length > 3) recommendations.push(`لديك ${pendingReqs.length} طلبات معلقة. يُنصح بمعالجتها لتحسين رضا الموظفين.`);
      
      const overdueTasks = tks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== "completed" && t.status !== "done");
      if (overdueTasks.length > 0) recommendations.push(`يوجد ${overdueTasks.length} مهام متأخرة عن موعدها. تابع مع الموظفين المسؤولين.`);
      
      const highSalary = emps.filter(e => (e.salary || 0) > 3000);
      if (highSalary.length > 0) recommendations.push(`${highSalary.length} موظفين برواتب عالية. تأكد من مطابقة الأداء للتعويضات.`);
      
      const noTasks = emps.filter(e => !tks.some(t => t.employee_id === e.id));
      if (noTasks.length > 0) recommendations.push(`${noTasks.length} موظفين بدون مهام مُسندة. وزّع المهام بشكل أفضل.`);

      const tempContracts = emps.filter(e => e.contract_type === "مؤقت" || e.contract_type === "تجريبي");
      if (tempContracts.length > 0) recommendations.push(`${tempContracts.length} موظفين بعقود مؤقتة/تجريبية. راجع وضعهم وقرر التثبيت أو التجديد.`);

      if (recommendations.length === 0) recommendations.push("فريقك يعمل بشكل جيد! استمر في المتابعة.");

      result = { recommendations };
    }

    else {
      throw new Error("Unknown action: " + action);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
