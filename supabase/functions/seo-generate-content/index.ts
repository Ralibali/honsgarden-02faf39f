import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SeoType = "breeds" | "problems" | "care" | "months";

const configs: Record<SeoType, { table: string; select: string; fields: string[]; prompt: (row: Record<string, unknown>) => string }> = {
  breeds: {
    table: "seo_breeds",
    select: "id,name,slug,breed_group,is_swedish_landrace,conservation_status",
    fields: ["summary", "content", "medical_disclaimer", "meta_title", "meta_description", "key_facts", "faq", "authoritative_sources"],
    prompt: (row) => `Skapa granskningsbart SEO-underlag på svenska för hönsrasen "${row.name}". Rasgrupp: ${row.breed_group ?? "okänd"}. Svensk lantras: ${row.is_swedish_landrace ? "ja" : "nej"}. Bevarandestatus: ${row.conservation_status ?? "okänd"}.`,
  },
  problems: {
    table: "seo_problems",
    select: "id,name,slug,category,severity,is_notifiable,is_zoonotic",
    fields: ["summary", "treatment_overview", "when_to_call_vet", "content", "medical_disclaimer", "meta_title", "meta_description", "symptoms", "causes", "diagnosis_steps", "prevention_steps", "key_facts", "faq", "authoritative_sources"],
    prompt: (row) => `Skapa varsamt SEO-underlag på svenska om hönshälsoproblemet "${row.name}". Kategori: ${row.category}. Svårighetsgrad: ${row.severity ?? "okänd"}. Anmälningspliktig: ${row.is_notifiable ? "ja" : "okänt/nej"}. Zoonos: ${row.is_zoonotic ? "ja" : "okänt/nej"}.`,
  },
  care: {
    table: "seo_care_topics",
    select: "id,name,slug,category,intent,difficulty_level,time_required,cost_estimate_sek",
    fields: ["summary", "content", "meta_title", "meta_description", "key_facts", "howto_steps", "required_materials", "faq", "authoritative_sources"],
    prompt: (row) => `Skapa praktiskt SEO-underlag på svenska för skötselämnet "${row.name}". Kategori: ${row.category}. Intent: ${row.intent ?? "informational"}. Svårighet: ${row.difficulty_level ?? "okänd"}.`,
  },
  months: {
    table: "seo_months",
    select: "id,name,slug,month_number",
    fields: ["summary", "temperature_considerations", "daylight_considerations", "egg_production_expectation", "content", "meta_title", "meta_description", "typical_tasks", "common_problems_this_month", "key_facts", "faq"],
    prompt: (row) => `Skapa säsongsanpassat SEO-underlag på svenska för hönshållning i ${row.name} (månad ${row.month_number}).`,
  },
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

function parseJsonObject(text: string): Record<string, unknown> {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY") ?? "";
    if (!lovableApiKey) return jsonResponse({ error: "AI not configured" }, 500);

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return jsonResponse({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return jsonResponse({ error: "Forbidden" }, 403);

    const body = await req.json().catch(() => null) as { type?: SeoType; id?: string } | null;
    if (!body?.type || !body?.id || !configs[body.type]) return jsonResponse({ error: "Invalid request" }, 400);

    const config = configs[body.type];
    const adminClient = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
    const { data: row, error: rowError } = await adminClient.from(config.table).select(config.select).eq("id", body.id).single();
    if (rowError || !row) return jsonResponse({ error: rowError?.message ?? "Not found" }, 404);

    await adminClient.from(config.table).update({ generation_status: "generating" }).eq("id", body.id);

    const prompt = `${config.prompt(row)}

Krav:
- Returnera ENDAST giltig JSON, ingen markdown.
- Fyll bara dessa fält: ${config.fields.join(", ")}.
- content ska vara 900–1400 ord med tydliga H2-rubriker i markdown.
- meta_title max 60 tecken, meta_description max 155 tecken.
- authoritative_sources ska innehålla trovärdiga svenska myndigheter/organisationer när relevant.
- Vid djurhälsa: ingen diagnosgaranti, hänvisa till veterinär, Jordbruksverket eller SVA vid allvarliga symtom.
- medical_disclaimer ska vara ifyllt för raser och problem.
- JSON-listor ska vara arrays av objekt med befintliga nycklar, inte strängar.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Du är en svensk SEO-redaktör med fokus på hönshållning, faktakontroll och säkra råd." },
          { role: "user", content: prompt },
        ],
        max_tokens: 6000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      await adminClient.from(config.table).update({ generation_status: "failed" }).eq("id", body.id);
      console.error("AI error", aiResponse.status, errorText);
      return jsonResponse({ error: "AI generation failed" }, 500);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content ?? "";
    const generated = parseJsonObject(content);
    const patch = Object.fromEntries(config.fields.map((field) => [field, generated[field] ?? null]));

    const { error: updateError } = await adminClient
      .from(config.table)
      .update({ ...patch, generation_status: "completed", last_generated_at: new Date().toISOString(), ai_model_used: "google/gemini-2.5-flash" })
      .eq("id", body.id);

    if (updateError) return jsonResponse({ error: updateError.message }, 500);
    return jsonResponse({ success: true });
  } catch (error) {
    console.error("seo-generate-content error", error);
    return jsonResponse({ error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});
