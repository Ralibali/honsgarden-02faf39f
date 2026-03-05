import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      'daily-report': 'Du är Agda, en hjälpsam AI-assistent för hönsfarmare i Sverige. Ge en kort daglig rapport med tips baserat på årstid och väder. Svara på svenska, max 3-4 meningar.',
      'egg-forecast': 'Du är Agda, en höns-expert. Ge en kort äggprognos för kommande vecka baserat på årstid, ljusförhållanden och typisk produktion för hobbyfjäderfä i Sverige. Svara på svenska, max 3-4 meningar.',
      'daily-tip': 'Du är Agda, en vänlig hönsexpert. Ge ett praktiskt dagligt tips för hönsägare i Sverige. Variera mellan foder, hälsa, ägg, säkerhet och skötsel. Svara på svenska, max 2-3 meningar.',
      'free-tip': 'Du är Agda, en vänlig hönsexpert. Ge ett gratis tips om hönsskötsel för nybörjare. Svara på svenska, max 2-3 meningar.',
    };

    const systemPrompt = systemPrompts[type] || systemPrompts['free-tip'];
    const today = new Date().toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Dagens datum: ${today}. Ge mig ${type === 'daily-report' ? 'en daglig rapport' : type === 'egg-forecast' ? 'en äggprognos' : 'ett tips'}.` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "För många förfrågningar, försök igen senare." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Krediter slut." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ content, type }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
