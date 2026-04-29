import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

interface Body {
  latitude: number;
  longitude: number;
  city_name?: string | null;
  force?: boolean;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await userClient.auth.getUser();
    const user = userData?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Premium check
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: profile } = await admin
      .from("profiles")
      .select("subscription_status, premium_expires_at, is_lifetime_premium")
      .eq("user_id", user.id)
      .maybeSingle();

    const isPremium =
      profile?.is_lifetime_premium ||
      (profile?.subscription_status === "premium" &&
        (!profile.premium_expires_at ||
          new Date(profile.premium_expires_at) > new Date()));

    if (!isPremium) {
      return new Response(JSON.stringify({ error: "Plus required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const { latitude, longitude, city_name, force } = body;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return new Response(JSON.stringify({ error: "Invalid coords" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // Cache check
    if (!force) {
      const { data: cached } = await admin
        .from("weather_advice_cache")
        .select("*")
        .eq("user_id", user.id)
        .eq("cache_date", today)
        .maybeSingle();
      if (cached?.today_advice) {
        return new Response(JSON.stringify({ cached: true, ...cached }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Rate limit (max 5 forced calls/hour)
    if (force) {
      const { data: ok } = await admin.rpc("check_rate_limit", {
        _user_id: user.id,
        _function_name: "weather-advice",
        _max_requests: 5,
        _window_minutes: 60,
      });
      if (ok === false) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // Fetch weather (10-day)
    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weathercode,relative_humidity_2m,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=10`,
    );
    if (!wRes.ok) throw new Error("Weather fetch failed");
    const weather = await wRes.json();

    // Fetch egg history (last 30 days) for trend insight
    const since = new Date(Date.now() - 30 * 24 * 3600_000).toISOString().split("T")[0];
    const { data: farmIds } = await admin.rpc("get_user_farm_ids", { _uid: user.id });
    const farmIdList = (farmIds ?? []).map((r: any) => r.get_user_farm_ids ?? r);
    const { data: eggs } = await admin
      .from("eggs")
      .select("date, count")
      .in("farm_id", farmIdList.length ? farmIdList : ["00000000-0000-0000-0000-000000000000"])
      .gte("date", since)
      .order("date", { ascending: true });

    const eggsByDay: Record<string, number> = {};
    for (const e of eggs ?? []) {
      eggsByDay[e.date] = (eggsByDay[e.date] ?? 0) + (e.count ?? 0);
    }

    // Build AI prompt
    const month = new Date().toLocaleString("sv-SE", { month: "long" });
    const current = weather.current;
    const daily = weather.daily;
    const dailySummary = daily.time
      .slice(0, 10)
      .map((d: string, i: number) =>
        `${d}: ${Math.round(daily.temperature_2m_min[i])}–${Math.round(daily.temperature_2m_max[i])}°C, kod ${daily.weathercode[i]}, nederbörd ${daily.precipitation_sum[i]}mm, vind ${daily.wind_speed_10m_max[i]} m/s`,
      )
      .join("\n");

    const eggSummary = Object.entries(eggsByDay)
      .slice(-14)
      .map(([d, c]) => `${d}: ${c} ägg`)
      .join("\n");

    const systemPrompt = `Du är Agda, en varm och kunnig svensk hönsexpert. Skriv på naturlig svenska, kortfattat och konkret. Inga emojis. Ge inga medicinska råd – hänvisa till veterinär vid hälsoproblem. Format: ren text utan rubriker, max 3-4 meningar per fält.`;

    const userPrompt = `Plats: ${city_name ?? "okänd"} (${latitude.toFixed(2)}, ${longitude.toFixed(2)})
Månad: ${month}
Nu: ${Math.round(current.temperature_2m)}°C, väderkod ${current.weathercode}, luftfuktighet ${current.relative_humidity_2m}%, vind ${current.wind_speed_10m} m/s

10-dagars prognos:
${dailySummary}

Äggproduktion senaste 14 dagarna:
${eggSummary || "Inga loggade ägg"}

Generera tre korta råd som JSON via verktyget weather_advice.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "weather_advice",
              description: "Returnera tre korta väderråd",
              parameters: {
                type: "object",
                properties: {
                  today_advice: {
                    type: "string",
                    description:
                      "Konkreta råd för hönsen IDAG baserat på aktuellt väder (vatten, skugga, isolering, ströbad, etc).",
                  },
                  week_advice: {
                    type: "string",
                    description:
                      "Vad ägaren bör förbereda inför kommande 7 dagar (regn, värmebölja, frost, vind).",
                  },
                  history_insight: {
                    type: "string",
                    description:
                      "En observation om hur vädret kan ha påverkat äggproduktionen senaste tiden, eller säsongsmönster för månaden.",
                  },
                },
                required: ["today_advice", "week_advice", "history_insight"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "weather_advice" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "AI rate limit, försök igen om en stund." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "AI-krediter slut. Lägg till krediter i Lovable AI." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiRes.text();
      console.error("AI error:", aiRes.status, t);
      throw new Error("AI gateway error");
    }

    const aiJson = await aiRes.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    const args = toolCall ? JSON.parse(toolCall.function.arguments) : {};

    const record = {
      user_id: user.id,
      cache_date: today,
      latitude,
      longitude,
      city_name: city_name ?? null,
      weather_snapshot: weather,
      today_advice: args.today_advice ?? "",
      week_advice: args.week_advice ?? "",
      history_insight: args.history_insight ?? "",
      model: "google/gemini-3-flash-preview",
    };

    await admin
      .from("weather_advice_cache")
      .upsert(record, { onConflict: "user_id,cache_date" });

    return new Response(JSON.stringify({ cached: false, ...record }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weather-advice error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
