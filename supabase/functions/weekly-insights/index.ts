import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const SYSTEM_PROMPT = `Du är "Hönsgården" – en varm, kunnig och praktisk hobbyhönsägare som skriver veckorapport till en svensk användare.

Ton:
- Svenska, varm, snäll, lite peppande – som en erfaren vän, inte en techbot.
- Kort, lättläst, konkret. Inga emojis i texten. Inga tekniska ord.
- Inga medicinska diagnoser. Vid hälsosignaler: uppmana till observation och veterinär vid försämring.
- Ingen skrämsel.

Uppgift: Skapa en personlig veckorapport baserat på användarens data via funktionen weekly_report.
- summary: 2–3 meningar som sammanfattar veckan varmt.
- insights: 3–5 korta, konkreta insikter (max ~25 ord per insikt).
- next_steps: 1–3 rekommenderade nästa steg. Varje steg har title, text och valfri cta { label, path }.
- closing: 1 mening som peppar användaren inför nästa vecka.

Tillåtna paths för cta: /app/eggs, /app/statistics, /app/feed, /app/tasks, /app/hens, /app/weekly-report, /app/hatching.`;

const TOOL = {
  type: "function" as const,
  function: {
    name: "weekly_report",
    description: "Returnera en strukturerad veckorapport för användarens hönsgård.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string" },
        insights: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: { type: "string" },
        },
        next_steps: {
          type: "array",
          minItems: 1,
          maxItems: 3,
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              text: { type: "string" },
              cta: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  path: { type: "string" },
                },
                required: ["label", "path"],
                additionalProperties: false,
              },
            },
            required: ["title", "text"],
            additionalProperties: false,
          },
        },
        closing: { type: "string" },
      },
      required: ["summary", "insights", "next_steps", "closing"],
      additionalProperties: false,
    },
  },
};

function buildUserPrompt(w: any): string {
  const lines = [
    "Veckodata för användarens hönsgård:",
    `- Vecka: ${w?.weekLabel ?? "denna vecka"}`,
    `- Säsong: ${w?.season ?? "okänd"}`,
    `- Aktiva hönor: ${w?.henCount ?? 0}`,
    `- Ägg den här veckan: ${w?.weekEggs ?? 0}`,
    `- Ägg förra veckan: ${w?.prevWeekEggs ?? 0}`,
    `- Skillnad: ${(w?.weekEggs ?? 0) - (w?.prevWeekEggs ?? 0)}`,
    `- Snitt per dag: ${typeof w?.avgPerDay === "number" ? w.avgPerDay.toFixed(1) : "0"}`,
    `- Bästa värpdag: ${w?.bestDay ?? "—"}`,
    `- Loggnings-streak: ${w?.streak ?? 0} dagar`,
  ];
  if (typeof w?.feedCost === "number") lines.push(`- Foderkostnad veckan: ${w.feedCost} kr`);
  if (typeof w?.costPerEgg === "number") lines.push(`- Kostnad per ägg: ${w.costPerEgg.toFixed(2)} kr`);
  if (typeof w?.completedChores === "number") lines.push(`- Avbockade rutiner: ${w.completedChores}`);
  if (typeof w?.missedChores === "number") lines.push(`- Missade/försenade rutiner: ${w.missedChores}`);
  if (typeof w?.activeHatchings === "number") lines.push(`- Aktiva kläckningar: ${w.activeHatchings}`);
  if (typeof w?.healthNotes === "number") lines.push(`- Hälsonoteringar denna vecka: ${w.healthNotes}`);
  if (w?.weatherTip) lines.push(`- Väder/säsongstips: ${w.weatherTip}`);
  lines.push("");
  lines.push("Skapa en varm, lättläst veckorapport via funktionen weekly_report. Anpassa råden exakt till datan.");
  return lines.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Missing authorization" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return jsonResponse({ error: "Not authenticated" }, 401);

    const body = await req.json().catch(() => ({}));
    const weekData = body?.weekData ?? {};

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return jsonResponse({ error: "LOVABLE_API_KEY not configured" }, 500);

    let aiResponse: Response;
    try {
      aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: buildUserPrompt(weekData) },
          ],
          tools: [TOOL],
          tool_choice: { type: "function", function: { name: "weekly_report" } },
        }),
      });
    } catch (fetchErr) {
      console.error("[weekly-insights] AI fetch failed:", fetchErr);
      return jsonResponse({ error: "AI gateway unreachable" }, 502);
    }

    if (!aiResponse.ok) {
      const t = await aiResponse.text().catch(() => "");
      console.error("[weekly-insights] AI error:", aiResponse.status, t);
      if (aiResponse.status === 429) return jsonResponse({ error: "Rate limit, försök igen senare." }, 429);
      if (aiResponse.status === 402) return jsonResponse({ error: "Krediter slut." }, 402);
      return jsonResponse({ error: "AI generation failed" }, 502);
    }

    const data = await aiResponse.json().catch(() => null);
    const toolCall = data?.choices?.[0]?.message?.tool_calls?.[0];
    const argsRaw = toolCall?.function?.arguments;

    let report: any = null;
    if (argsRaw) {
      try {
        report = typeof argsRaw === "string" ? JSON.parse(argsRaw) : argsRaw;
      } catch (e) {
        console.error("[weekly-insights] Failed to parse tool args:", e);
      }
    }

    // Backward compat fallback: also return flat insights array
    if (!report || !Array.isArray(report.insights) || report.insights.length === 0) {
      // Try legacy text parse if no tool call (older models)
      const content = data?.choices?.[0]?.message?.content || "";
      try {
        const m = content.match(/\{[\s\S]*\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          if (Array.isArray(parsed.insights)) {
            return jsonResponse({ insights: parsed.insights });
          }
        }
      } catch {}
      return jsonResponse({ error: "Empty AI response" }, 502);
    }

    return jsonResponse({
      summary: report.summary,
      insights: report.insights,
      next_steps: Array.isArray(report.next_steps) ? report.next_steps.slice(0, 3) : [],
      closing: report.closing ?? null,
    });
  } catch (e) {
    console.error("[weekly-insights] Unhandled error:", e);
    return jsonResponse({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});
