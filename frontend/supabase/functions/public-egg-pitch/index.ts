import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Du är Hönsgårdens säljcoach för svenska hobbyhönsägare.

Skapa en kort, varm och säljande Facebook-/anslagstext för att sälja ägg lokalt med Swish.

Regler:
- Skriv på svenska, varmt och förtroendeingivande.
- Max 90 ord.
- Inkludera pris, antal, plats och Swish-betalning.
- 1-2 emojis max.
- Säg INTE att äggen är ekologiska om det inte är angivet.
- Avsluta med en mjuk CTA (t.ex. "Skriv en rad om du är intresserad").
- Returnera ren text utan markdown.`;

function fallback(i: any) {
  const pris = Number(i.price || 50);
  const antal = Number(i.packs || 5);
  const plats = i.location || "vår gård";
  return `🥚 Färska ägg från våra höns finns till salu!\n\nJust nu har vi cirka ${antal} kartor tillgängliga för ${pris} kr/st.\nHämtas hos ${plats}. Betalning enkelt med Swish vid hämtning.\n\nSkriv en rad om du är intresserad så lägger jag undan en karta åt dig 🌿`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const input = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ pitch: fallback(input), source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `Pris per karta: ${input.price || 50} kr`,
      `Antal kartor till salu: ${input.packs || 5}`,
      `Ägg per karta: ${input.packSize || 12}`,
      `Plats / hämtning: ${input.location || "lokalt i området"}`,
      `Ton: ${input.tone || "mysig och personlig"}`,
      input.extra ? `Extra info: ${input.extra}` : "",
    ].filter(Boolean).join("\n");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "För många förfrågningar – försök igen om en stund." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ pitch: fallback(input), source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      console.error("AI gateway error", resp.status, await resp.text());
      return new Response(JSON.stringify({ pitch: fallback(input), source: "fallback" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const pitch = data?.choices?.[0]?.message?.content?.trim() || fallback(input);

    return new Response(JSON.stringify({ pitch, source: "ai" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("public-egg-pitch error", e);
    return new Response(JSON.stringify({ error: "Något gick fel" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
