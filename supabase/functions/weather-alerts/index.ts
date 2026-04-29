// Daily cron: kollar prognos för alla användare med aktiva väderaviseringar.
// Skapar in-app-notis och köar mejl när tröskel överskrids inom 48h.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface Pref {
  user_id: string;
  enabled: boolean;
  latitude: number | null;
  longitude: number | null;
  city_name: string | null;
  heat_threshold_c: number;
  cold_threshold_c: number;
  rain_threshold_mm: number;
  wind_threshold_ms: number;
  notify_email: boolean;
  notify_in_app: boolean;
}

interface AlertCandidate {
  type: "heat" | "cold" | "rain" | "wind";
  forecast_date: string;
  value: number;
  threshold: number;
}

function buildAlertContent(c: AlertCandidate, city: string | null) {
  const dateLabel = new Date(c.forecast_date).toLocaleDateString("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const place = city ? ` (${city})` : "";

  switch (c.type) {
    case "heat":
      return {
        title: `Värmevarning för dina höns – ${dateLabel}`,
        body: `Prognos visar ${Math.round(c.value)}°C${place}. Säkerställ skugga, friskt vatten och möjlighet till sandbad.`,
        subject: `Värmevarning ${dateLabel}: ${Math.round(c.value)}°C väntas`,
      };
    case "cold":
      return {
        title: `Köldvarning för dina höns – ${dateLabel}`,
        body: `Prognos visar ${Math.round(c.value)}°C${place}. Kontrollera att vattnet inte fryser och att hönshuset är dragfritt.`,
        subject: `Köldvarning ${dateLabel}: ${Math.round(c.value)}°C väntas`,
      };
    case "rain":
      return {
        title: `Kraftigt regn väntas – ${dateLabel}`,
        body: `${c.value.toFixed(0)} mm nederbörd förväntas${place}. Se över rastgården, dräneringen och se till att hönsen kan komma in i torrt.`,
        subject: `Regnvarning ${dateLabel}: ${c.value.toFixed(0)} mm`,
      };
    case "wind":
      return {
        title: `Hård vind väntas – ${dateLabel}`,
        body: `Vindbyar upp till ${Math.round(c.value)} m/s${place}. Säkra lösa föremål och kontrollera att hönshuset är stadigt.`,
        subject: `Vindvarning ${dateLabel}: ${Math.round(c.value)} m/s`,
      };
  }
}

function emailHtml(title: string, body: string, displayName: string) {
  return `<div style="font-family: Inter, Arial, sans-serif; max-width: 540px; padding: 30px 25px;">
    <img src="https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png" width="140" alt="Hönsgården" style="margin: 0 0 24px;" />
    <h1 style="font-family: Young Serif, Georgia, serif; font-size: 22px; color: hsl(22,18%,12%); margin: 0 0 16px;">Hej ${displayName}!</h1>
    <p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6; margin: 0 0 18px;"><strong>${title}</strong></p>
    <p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6; margin: 0 0 22px;">${body}</p>
    <a href="https://honsgarden.lovable.app/app/weather" style="background-color: hsl(142,32%,34%); color: hsl(35,32%,97%); font-size: 14px; border-radius: 14px; padding: 12px 24px; text-decoration: none; display: inline-block;">Öppna vädersidan →</a>
    <p style="font-size: 12px; color: #999; margin: 30px 0 0;">Du får detta mejl för att du aktiverat väderaviseringar i Hönsgården. Du kan när som helst justera trösklarna eller stänga av notiserna under Väder-sidan.</p>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const today = new Date().toISOString().split("T")[0];
  const horizonDays = 2; // kolla prognos 0-2 dagar framåt

  const { data: prefs, error: prefErr } = await admin
    .from("weather_alert_preferences")
    .select("*")
    .eq("enabled", true);

  if (prefErr) {
    console.error("pref load failed", prefErr);
    return new Response(JSON.stringify({ error: prefErr.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let processed = 0;
  let alertsCreated = 0;

  for (const p of (prefs ?? []) as Pref[]) {
    if (p.latitude == null || p.longitude == null) continue;
    processed++;

    try {
      const wRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=${horizonDays + 1}`,
      );
      if (!wRes.ok) continue;
      const w = await wRes.json();
      const daily = w.daily;
      if (!daily?.time) continue;

      const candidates: AlertCandidate[] = [];
      for (let i = 0; i <= horizonDays; i++) {
        const date = daily.time[i];
        if (!date) continue;
        const tmax = daily.temperature_2m_max[i];
        const tmin = daily.temperature_2m_min[i];
        const rain = daily.precipitation_sum[i] ?? 0;
        const wind = daily.wind_speed_10m_max[i] ?? 0;

        if (tmax >= p.heat_threshold_c) {
          candidates.push({ type: "heat", forecast_date: date, value: tmax, threshold: p.heat_threshold_c });
        }
        if (tmin <= p.cold_threshold_c) {
          candidates.push({ type: "cold", forecast_date: date, value: tmin, threshold: p.cold_threshold_c });
        }
        if (rain >= p.rain_threshold_mm) {
          candidates.push({ type: "rain", forecast_date: date, value: rain, threshold: p.rain_threshold_mm });
        }
        if (wind >= p.wind_threshold_ms) {
          candidates.push({ type: "wind", forecast_date: date, value: wind, threshold: p.wind_threshold_ms });
        }
      }

      if (!candidates.length) continue;

      // Hämta profile för mejl
      const { data: profile } = await admin
        .from("profiles")
        .select("email, display_name")
        .eq("user_id", p.user_id)
        .maybeSingle();

      for (const c of candidates) {
        // Dedup: redan skickad för denna prognosdag?
        const { data: existing } = await admin
          .from("weather_alerts_sent")
          .select("id")
          .eq("user_id", p.user_id)
          .eq("alert_type", c.type)
          .eq("forecast_date", c.forecast_date)
          .maybeSingle();
        if (existing) continue;

        const content = buildAlertContent(c, p.city_name);
        if (!content) continue;

        // Logga först (UNIQUE-constraint säkrar mot dubbletter)
        const { error: logErr } = await admin
          .from("weather_alerts_sent")
          .insert({
            user_id: p.user_id,
            alert_type: c.type,
            alert_date: today,
            forecast_date: c.forecast_date,
            details: { value: c.value, threshold: c.threshold, city: p.city_name },
          });
        if (logErr) {
          // Förmodligen race-dubblett, hoppa
          continue;
        }

        // In-app notis
        if (p.notify_in_app) {
          await admin.from("user_notifications").insert({
            user_id: p.user_id,
            type: "weather_alert",
            title: content.title,
            body: content.body,
            link: "/app/weather",
            metadata: { alert_type: c.type, forecast_date: c.forecast_date, value: c.value },
          });
        }

        // Mejl
        if (p.notify_email && profile?.email) {
          const display = profile.display_name ?? profile.email.split("@")[0];
          const messageId = `weather-${c.type}-${c.forecast_date}-${p.user_id}`;
          await admin.rpc("enqueue_email", {
            queue_name: "transactional_emails",
            payload: {
              run_id: crypto.randomUUID(),
              to: profile.email,
              from: "Hönsgården <noreply@notify.honsgarden.se>",
              sender_domain: "notify.honsgarden.se",
              subject: content.subject,
              html: emailHtml(content.title, content.body, display),
              text: `${content.title}\n\n${content.body}\n\nÖppna vädersidan: https://honsgarden.lovable.app/app/weather`,
              purpose: "transactional",
              label: "weather-alert",
              message_id: messageId,
              queued_at: new Date().toISOString(),
            },
          });
        }

        alertsCreated++;
      }
    } catch (e) {
      console.error("user processing failed", p.user_id, e);
    }
  }

  return new Response(JSON.stringify({ processed, alertsCreated }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
