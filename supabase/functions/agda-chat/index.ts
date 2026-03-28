import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Ej autentiserad");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Ej autentiserad");

    const { message, history = [] } = await req.json();
    if (!message) throw new Error("Meddelande saknas");

    // Fetch user context: hens, recent eggs, health logs
    const [hensRes, eggsRes, healthRes, feedRes] = await Promise.all([
      supabase.from("hens").select("name, breed, birth_date, is_active, notes, hen_type").limit(30),
      supabase.from("egg_logs").select("date, count, notes, hen_id").order("date", { ascending: false }).limit(60),
      supabase.from("health_logs").select("date, type, description, hen_id").order("date", { ascending: false }).limit(20),
      supabase.from("feed_records").select("date, feed_type, amount_kg, cost").order("date", { ascending: false }).limit(20),
    ]);

    const hens = hensRes.data ?? [];
    const eggs = eggsRes.data ?? [];
    const health = healthRes.data ?? [];
    const feed = feedRes.data ?? [];

    // Build hen name map
    const henNames: Record<string, string> = {};
    hens.forEach((h: any) => { if (h.name) henNames[h.name] = h.name; });

    const totalEggs = eggs.reduce((s: number, e: any) => s + (e.count || 0), 0);
    const activeHens = hens.filter((h: any) => h.is_active).length;

    const systemPrompt = `Du är Agda 🐔 – en vänlig, kunnig AI-hönskonsult som hjälper svenska hönsägare.

PERSONLIGHET:
- Varm, kunnig och lite humoristisk
- Svarar alltid på svenska
- Refererar till användarens egna data när det är relevant
- Ger konkreta, praktiska råd
- Håller svaren kortfattade (max 3–4 stycken) om inte användaren ber om detalj

ANVÄNDARENS DATA:
- ${activeHens} aktiva hönor av ${hens.length} totalt
- Hönor: ${hens.map((h: any) => `${h.name} (${h.breed || 'okänd ras'}${h.is_active ? '' : ', inaktiv'})`).join(', ') || 'Inga registrerade'}
- Senaste 60 äggloggar: totalt ${totalEggs} ägg
- Senaste hälsonoteringar: ${health.length > 0 ? health.slice(0, 5).map((h: any) => `${h.date}: ${h.type} – ${h.description}`).join('; ') : 'Inga'}
- Foderdata: ${feed.length > 0 ? feed.slice(0, 5).map((f: any) => `${f.date}: ${f.feed_type || 'okänt'} ${f.amount_kg || '?'}kg`).join('; ') : 'Ingen foderdata'}

REGLER:
- Om användaren frågar om något du inte vet – var ärlig och föreslå att de kollar med veterinär
- Ge aldrig medicinsk rådgivning som ersätter veterinärvård
- Referera gärna till deras hönor vid namn
- Avsluta gärna med en uppmuntrande kommentar eller en rolig hönsrelaterad emoji`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.slice(-10).map((m: any) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("AI-nyckel saknas");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI gateway error:", errText);
      throw new Error("AI-tjänsten svarade inte");
    }

    const aiData = await aiRes.json();
    const reply = aiData.choices?.[0]?.message?.content ?? "Hmm, jag kunde inte formulera ett svar just nu. Försök igen! 🐔";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Agda error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
