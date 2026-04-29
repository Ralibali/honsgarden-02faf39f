import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function getSeason(month: number): string {
  if (month >= 3 && month <= 5) return 'vår';
  if (month >= 6 && month <= 8) return 'sommar';
  if (month >= 9 && month <= 11) return 'höst';
  return 'vinter';
}

function getStockholmDate(): { dateStr: string; season: string; displayDate: string } {
  const now = new Date();
  const stockholm = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Stockholm' }));
  const year = stockholm.getFullYear();
  const month = stockholm.getMonth() + 1;
  const day = stockholm.getDate();
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const season = getSeason(month);
  const displayDate = stockholm.toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return { dateStr, season, displayDate };
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceKey) {
      console.error("[getDailyTip] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return jsonResponse({ error: "Server misconfigured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const { dateStr, season, displayDate } = getStockholmDate();

    // 1. Cache lookup – maybeSingle() returnerar null istället för att kasta vid 0 rader
    const { data: cached, error: cacheErr } = await supabase
      .from('daily_ai_tip')
      .select('date, season, tip_text')
      .eq('date', dateStr)
      .maybeSingle();

    if (cacheErr) {
      console.error("[getDailyTip] Cache lookup error:", cacheErr.message);
    }

    if (cached) {
      console.log(`[getDailyTip] Cache hit for ${dateStr}`);
      return jsonResponse({ ...cached, cached: true });
    }

    // 2. Generera via AI
    console.log(`[getDailyTip] Cache miss for ${dateStr}, generating...`);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return jsonResponse({ error: "LOVABLE_API_KEY is not configured" }, 500);
    }

    const prompt = `Du är en hjälpsam expert på hönsskötsel. Skriv ETT kort dagligt tips för hobbyhöns i Sverige. Anpassa efter säsong: ${season} och datum: ${displayDate}.

Krav:
- 70–120 ord.
- Svenskt språk.
- Praktiskt, konkret och tryggt.
- Inga emojis.
- Ingen fluff, inga långa utläggningar.
- Ingen medicinsk rådgivning; hänvisa till veterinär vid sjukdomstecken.

Returnera bara själva tipstexten.`;

    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [{ role: "user", content: prompt }],
        }),
      });
    } catch (fetchErr) {
      console.error("[getDailyTip] AI fetch failed:", fetchErr);
      return jsonResponse({ error: "AI gateway unreachable" }, 502);
    }

    if (!aiResponse.ok) {
      const t = await aiResponse.text().catch(() => "");
      console.error("[getDailyTip] AI error:", aiResponse.status, t);
      if (aiResponse.status === 429) return jsonResponse({ error: "Rate limit, försök igen senare." }, 429);
      if (aiResponse.status === 402) return jsonResponse({ error: "Krediter slut." }, 402);
      return jsonResponse({ error: "AI generation failed" }, 502);
    }

    const aiData = await aiResponse.json().catch(() => null);
    const tipText: string = aiData?.choices?.[0]?.message?.content?.trim() || '';
    if (!tipText) {
      return jsonResponse({ error: "Empty AI response" }, 502);
    }

    // 3. Spara
    const { data: inserted, error: insertError } = await supabase
      .from('daily_ai_tip')
      .insert({ date: dateStr, season, tip_text: tipText })
      .select('date, season, tip_text')
      .maybeSingle();

    if (insertError) {
      // Race condition – någon annan hann före, läs befintlig
      if (insertError.code === '23505') {
        const { data: existing } = await supabase
          .from('daily_ai_tip')
          .select('date, season, tip_text')
          .eq('date', dateStr)
          .maybeSingle();
        if (existing) return jsonResponse({ ...existing, cached: true });
      }
      console.error("[getDailyTip] Insert error:", insertError.message);
      // Returnera ändå tipset till användaren även om cachning misslyckades
      return jsonResponse({ date: dateStr, season, tip_text: tipText, cached: false });
    }

    console.log(`[getDailyTip] Generated and cached for ${dateStr}`);
    return jsonResponse({ ...(inserted ?? { date: dateStr, season, tip_text: tipText }), cached: false });

  } catch (e) {
    console.error("[getDailyTip] Unhandled error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
