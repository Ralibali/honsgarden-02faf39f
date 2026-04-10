import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ELIGIBLE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid"]);
const STATUS_PRIORITY: Record<string, number> = {
  active: 4,
  trialing: 3,
  past_due: 2,
  unpaid: 1,
};

function getStripeEnd(subscription: Stripe.Subscription): string | null {
  const endTimestamp = subscription.current_period_end;
  return typeof endTimestamp === "number"
    ? new Date(endTimestamp * 1000).toISOString()
    : null;
}

function getStripeProductId(subscription: Stripe.Subscription): string | null {
  const product = subscription.items.data[0]?.price?.product;
  return typeof product === "string" ? product : product?.id ?? null;
}

function isEligibleStripeSubscription(subscription: Stripe.Subscription, now: Date): boolean {
  if (!ELIGIBLE_STATUSES.has(subscription.status)) return false;

  if (subscription.status === "active" || subscription.status === "trialing") {
    return true;
  }

  const stripeEnd = getStripeEnd(subscription);
  return !!stripeEnd && new Date(stripeEnd) > now;
}

async function safeEnqueueEmail(
  supabaseClient: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
) {
  const { error } = await supabaseClient.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload,
  });

  if (error) {
    console.error("[check-subscription] enqueue_email failed", error.message);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);

    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("subscription_status, premium_expires_at")
      .eq("user_id", user.id)
      .maybeSingle();

    const now = new Date();
    const premiumExpiry = profile?.premium_expires_at ? new Date(profile.premium_expires_at) : null;
    const hasLifetimePremium = profile?.subscription_status === "premium" && !profile.premium_expires_at;
    const hasDatePremium = !!premiumExpiry && premiumExpiry > now;
    const hasUnexpiredPremium = hasLifetimePremium || hasDatePremium;

    if (hasDatePremium && profile?.subscription_status !== "premium") {
      const { error } = await supabaseClient
        .from("profiles")
        .update({ subscription_status: "premium" })
        .eq("user_id", user.id);

      if (error) {
        console.error("[check-subscription] failed to heal premium drift", error.message);
      }
    }

    const customers = await stripe.customers.list({ email: user.email, limit: 100 });
    const customerIds = [...new Set(customers.data.map((customer) => customer.id))];

    if (customerIds.length === 0) {
      if (profile?.subscription_status === "premium" && profile.premium_expires_at && new Date(profile.premium_expires_at) <= now) {
        const { error } = await supabaseClient
          .from("profiles")
          .update({ subscription_status: "free", premium_expires_at: null })
          .eq("user_id", user.id);

        if (error) {
          console.error("[check-subscription] failed to downgrade expired premium without Stripe customer", error.message);
        }
      }

      return new Response(JSON.stringify({
        subscribed: hasUnexpiredPremium,
        subscription_end: profile?.premium_expires_at ?? null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subscriptionResponses = await Promise.all(
      customerIds.map((customerId) => stripe.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 100,
      })),
    );

    const eligibleSubscriptions = subscriptionResponses
      .flatMap((response) => response.data)
      .filter((subscription) => isEligibleStripeSubscription(subscription, now))
      .sort((a, b) => {
        const statusDiff = (STATUS_PRIORITY[b.status] ?? 0) - (STATUS_PRIORITY[a.status] ?? 0);
        if (statusDiff !== 0) return statusDiff;
        return (b.current_period_end ?? 0) - (a.current_period_end ?? 0);
      });

    const stripeSubscription = eligibleSubscriptions[0] ?? null;
    const hasStripeSubscription = !!stripeSubscription;

    let subscriptionEnd = profile?.premium_expires_at ?? null;
    let productId: string | null = null;

    if (stripeSubscription) {
      const stripeEnd = getStripeEnd(stripeSubscription);
      const existingExpiry = profile?.premium_expires_at ? new Date(profile.premium_expires_at) : null;
      const stripeExpiry = stripeEnd ? new Date(stripeEnd) : null;

      if (existingExpiry && stripeExpiry && existingExpiry > stripeExpiry) {
        subscriptionEnd = profile.premium_expires_at;
      } else if (stripeEnd) {
        subscriptionEnd = stripeEnd;
      }

      productId = getStripeProductId(stripeSubscription);
      const wasNotPremium = profile?.subscription_status !== "premium";

      const { error: updateError } = await supabaseClient
        .from("profiles")
        .update({ subscription_status: "premium", premium_expires_at: subscriptionEnd })
        .eq("user_id", user.id);

      if (updateError) {
        throw new Error(`Profile update error: ${updateError.message}`);
      }

      if (wasNotPremium) {
        const ts = Date.now();
        const endFormatted = subscriptionEnd
          ? new Date(subscriptionEnd).toLocaleDateString("sv-SE", { year: "numeric", month: "long", day: "numeric" })
          : "";
        const logoUrl = "https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png";
        const premiumHtml = `
<div style="font-family: 'Inter', Arial, sans-serif; max-width: 520px; padding: 36px 28px; background: #ffffff;">
  <img src="${logoUrl}" width="140" alt="Hönsgården" style="margin: 0 0 28px;" />
  <h1 style="font-family: 'Young Serif', Georgia, serif; font-size: 24px; color: hsl(22,18%,12%); margin: 0 0 8px;">
    Du är nu Premium! 🌟
  </h1>
  <p style="font-size: 15px; color: hsl(22,12%,44%); line-height: 1.7; margin: 0 0 20px;">
    Ett <strong>stort, varmt tack</strong> för att du stöttar Hönsgården! Din uppgradering betyder otroligt mycket för oss och hjälper oss att fortsätta bygga den bästa appen för alla hönsägare. 💚
  </p>

  <div style="background: linear-gradient(135deg, hsl(142,32%,96%), hsl(35,32%,95%)); border-radius: 16px; padding: 24px; margin: 0 0 24px;">
    <h2 style="font-family: 'Young Serif', Georgia, serif; font-size: 18px; color: hsl(142,32%,28%); margin: 0 0 16px;">
      Dina premiumfördelar ✨
    </h2>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 6px 0; font-size: 14px; color: hsl(22,12%,35%);">🥚 <strong>Avancerad äggstatistik</strong> – trender, prognoser & jämförelser</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: hsl(22,12%,35%);">📊 <strong>Detaljerad ekonomiöversikt</strong> – se exakt vad dina höns kostar & ger</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: hsl(22,12%,35%);">🐔 <strong>Obegränsade höns</strong> – registrera hela din flock utan begränsning</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: hsl(22,12%,35%);">📋 <strong>Veckorapporter</strong> – automatiska sammanfattningar direkt i appen</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: hsl(22,12%,35%);">🏆 <strong>Alla achievements</strong> – lås upp alla utmärkelser och belöningar</td></tr>
      <tr><td style="padding: 6px 0; font-size: 14px; color: hsl(22,12%,35%);">💡 <strong>AI-drivna tips</strong> – personliga råd baserade på din flock</td></tr>
    </table>
  </div>

  ${endFormatted ? `<p style="font-size: 13px; color: hsl(22,12%,55%); margin: 0 0 20px;">Din Premium gäller till <strong>${endFormatted}</strong>.</p>` : ""}

  <a href="https://honsgarden.lovable.app/app" style="background-color: hsl(142,32%,34%); color: hsl(35,32%,97%); font-size: 15px; font-weight: 600; border-radius: 14px; padding: 14px 28px; text-decoration: none; display: inline-block;">
    Utforska Premium →
  </a>

  <p style="font-size: 12px; color: #999; margin: 32px 0 0; line-height: 1.5;">
    Tack igen för att du är en del av Hönsgården-familjen. Har du frågor? Svara bara på detta mejl! 🐣
  </p>
</div>`;

        await Promise.allSettled([
          safeEnqueueEmail(supabaseClient, {
            to: "info@auroramedia.se",
            from: "Hönsgården <noreply@notify.honsgarden.se>",
            sender_domain: "notify.honsgarden.se",
            subject: "Ny premiumbetalning på Hönsgården!",
            html: `<h2>Ny premiummedlem! 🎉</h2><p><strong>E-post:</strong> ${user.email}</p><p><strong>Prenumeration:</strong> ${stripeSubscription.status}</p><p><strong>Slutdatum:</strong> ${subscriptionEnd || "okänt"}</p>`,
            text: `Ny premiumbetalning: ${user.email} (${stripeSubscription.status}, slutdatum: ${subscriptionEnd || "okänt"})`,
            purpose: "transactional",
            label: "admin-premium-upgrade",
            message_id: `premium-admin-${user.id}-${ts}`,
            queued_at: new Date().toISOString(),
          }),
          safeEnqueueEmail(supabaseClient, {
            to: user.email,
            from: "Hönsgården <noreply@notify.honsgarden.se>",
            sender_domain: "notify.honsgarden.se",
            subject: "Tack för att du blev Premium! 🌟",
            html: premiumHtml,
            text: `Tack för att du uppgraderade till Premium! Dina nya fördelar: avancerad statistik, obegränsade höns, veckorapporter, achievements och AI-tips.${endFormatted ? ` Gäller till ${endFormatted}.` : ""} Utforska: https://honsgarden.lovable.app/app`,
            purpose: "transactional",
            label: "user-premium-welcome",
            message_id: `premium-user-${user.id}-${ts}`,
            queued_at: new Date().toISOString(),
          }),
        ]);
      }
    } else if (profile?.subscription_status === "premium" && profile.premium_expires_at && new Date(profile.premium_expires_at) <= now) {
      const { error } = await supabaseClient
        .from("profiles")
        .update({ subscription_status: "free", premium_expires_at: null })
        .eq("user_id", user.id);

      if (error) {
        console.error("[check-subscription] failed to downgrade expired premium without eligible Stripe subscription", error.message);
      }

      subscriptionEnd = null;
    }

    return new Response(JSON.stringify({
      subscribed: hasStripeSubscription || hasUnexpiredPremium,
      product_id: productId,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[check-subscription] fatal error", message);

    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
