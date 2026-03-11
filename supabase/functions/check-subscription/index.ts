import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
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
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('subscription_status, premium_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    const now = new Date();
    const hasUnexpiredPremium =
      profile?.subscription_status === 'premium' &&
      (!profile.premium_expires_at || new Date(profile.premium_expires_at) > now);

    if (customers.data.length === 0) {
      // Keep manual/trial/admin premium intact; only auto-downgrade if premium has expired.
      if (profile?.subscription_status === 'premium' && profile.premium_expires_at && new Date(profile.premium_expires_at) <= now) {
        await supabaseClient
          .from('profiles')
          .update({ subscription_status: 'free', premium_expires_at: null })
          .eq('user_id', user.id);
      }

      return new Response(JSON.stringify({
        subscribed: hasUnexpiredPremium,
        subscription_end: profile?.premium_expires_at ?? null,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    const hasActiveSub = subscriptions.data.length > 0;
    let subscriptionEnd = profile?.premium_expires_at ?? null;
    let productId = null;

    if (hasActiveSub) {
      const subscription = subscriptions.data[0];
      try {
        const endTimestamp = subscription.current_period_end;
        if (endTimestamp && typeof endTimestamp === 'number') {
          subscriptionEnd = new Date(endTimestamp * 1000).toISOString();
        }
      } catch {
        // Skip if date parsing fails
      }
      productId = subscription.items.data[0].price.product;

      const wasNotPremium = profile?.subscription_status !== 'premium';

      // Active Stripe subscription should always set premium and its period end
      await supabaseClient
        .from('profiles')
        .update({ subscription_status: 'premium', premium_expires_at: subscriptionEnd })
        .eq('user_id', user.id);

      // Send admin notification on new premium upgrade
      if (wasNotPremium) {
        const ts = Date.now();

        // 1. Admin notification
        await supabaseClient.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            to: 'info@auroramedia.se',
            from: 'Hönsgården <noreply@notify.honsgarden.se>',
            sender_domain: 'notify.honsgarden.se',
            subject: 'Ny premiumbetalning på Hönsgården!',
            html: `<h2>Ny premiummedlem! 🎉</h2><p><strong>E-post:</strong> ${user.email}</p><p><strong>Prenumeration:</strong> aktiv</p><p><strong>Slutdatum:</strong> ${subscriptionEnd || 'okänt'}</p>`,
            text: `Ny premiumbetalning: ${user.email} (slutdatum: ${subscriptionEnd || 'okänt'})`,
            purpose: 'transactional',
            label: 'admin-premium-upgrade',
            message_id: `premium-admin-${user.id}-${ts}`,
            queued_at: new Date().toISOString(),
          },
        });

        // 2. User welcome-to-premium email 🎉
        const endFormatted = subscriptionEnd
          ? new Date(subscriptionEnd).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })
          : '';
        const logoUrl = 'https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png';
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

  ${endFormatted ? `<p style="font-size: 13px; color: hsl(22,12%,55%); margin: 0 0 20px;">Din Premium gäller till <strong>${endFormatted}</strong>.</p>` : ''}

  <a href="https://honsgarden.lovable.app/app" style="background-color: hsl(142,32%,34%); color: hsl(35,32%,97%); font-size: 15px; font-weight: 600; border-radius: 14px; padding: 14px 28px; text-decoration: none; display: inline-block;">
    Utforska Premium →
  </a>

  <p style="font-size: 12px; color: #999; margin: 32px 0 0; line-height: 1.5;">
    Tack igen för att du är en del av Hönsgården-familjen. Har du frågor? Svara bara på detta mejl! 🐣
  </p>
</div>`;

        await supabaseClient.rpc('enqueue_email', {
          queue_name: 'transactional_emails',
          payload: {
            to: user.email,
            from: 'Hönsgården <noreply@notify.honsgarden.se>',
            sender_domain: 'notify.honsgarden.se',
            subject: 'Tack för att du blev Premium! 🌟',
            html: premiumHtml,
            text: `Tack för att du uppgraderade till Premium! Dina nya fördelar: avancerad statistik, obegränsade höns, veckorapporter, achievements och AI-tips.${endFormatted ? ` Gäller till ${endFormatted}.` : ''} Utforska: https://honsgarden.lovable.app/app`,
            purpose: 'transactional',
            label: 'user-premium-welcome',
            message_id: `premium-user-${user.id}-${ts}`,
            queued_at: new Date().toISOString(),
          },
        });
      }
    } else {
      // If Stripe has no active subscription, preserve manual/trial premium while valid.
      if (profile?.subscription_status === 'premium' && profile.premium_expires_at && new Date(profile.premium_expires_at) <= now) {
        await supabaseClient
          .from('profiles')
          .update({ subscription_status: 'free', premium_expires_at: null })
          .eq('user_id', user.id);
        subscriptionEnd = null;
      }
    }

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
