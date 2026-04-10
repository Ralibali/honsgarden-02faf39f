import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  try {
    // Auth check — admin only
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) throw new Error(`Auth: ${userError.message}`);
    const uid = userData.user?.id;
    if (!uid) throw new Error("Not authenticated");

    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: uid, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not set");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // 1. Fetch ALL subscriptions (active + trialing + past_due + canceled)
    const allSubs: Stripe.Subscription[] = [];
    for (const status of ["active", "trialing", "past_due", "canceled"] as const) {
      let hasMore = true;
      let startingAfter: string | undefined;
      while (hasMore) {
        const batch = await stripe.subscriptions.list({
          status,
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        allSubs.push(...batch.data);
        hasMore = batch.has_more;
        if (batch.data.length > 0) {
          startingAfter = batch.data[batch.data.length - 1].id;
        }
      }
    }

    // 2. Compute metrics
    const now = new Date();
    const activeSubs = allSubs.filter((s) => s.status === "active" || s.status === "trialing");
    const canceledSubs = allSubs.filter((s) => s.status === "canceled");

    let mrr = 0;
    let monthlyCount = 0;
    let yearlyCount = 0;
    const recentPayments: Array<{
      email: string;
      amount: number;
      currency: string;
      date: string;
      plan: string;
      status: string;
    }> = [];

    for (const sub of activeSubs) {
      const item = sub.items.data[0];
      if (!item) continue;
      const price = item.price;
      const amount = price.unit_amount ?? 0;
      const interval = price.recurring?.interval;

      if (interval === "month") {
        mrr += amount;
        monthlyCount++;
      } else if (interval === "year") {
        mrr += Math.round(amount / 12);
        yearlyCount++;
      }
    }

    // 3. Recent charges (last 30 days)
    const thirtyDaysAgo = Math.floor((now.getTime() - 30 * 86400000) / 1000);
    const charges = await stripe.charges.list({
      limit: 50,
      created: { gte: thirtyDaysAgo },
    });

    for (const charge of charges.data) {
      if (charge.status !== "succeeded") continue;
      recentPayments.push({
        email: charge.billing_details?.email ?? charge.receipt_email ?? "okänd",
        amount: charge.amount / 100,
        currency: charge.currency.toUpperCase(),
        date: new Date(charge.created * 1000).toISOString(),
        plan: charge.description ?? "Premium",
        status: charge.status,
      });
    }

    // 4. Monthly revenue trend (last 6 months from charges)
    const sixMonthsAgo = Math.floor((now.getTime() - 180 * 86400000) / 1000);
    const allCharges = await stripe.charges.list({
      limit: 100,
      created: { gte: sixMonthsAgo },
    });

    const monthlyRevenue: Record<string, number> = {};
    for (const ch of allCharges.data) {
      if (ch.status !== "succeeded") continue;
      const d = new Date(ch.created * 1000);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + ch.amount / 100;
    }

    const revenueTrend = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total: Math.round(total) }));

    // 5. Churn (canceled in last 30 days)
    const recentCanceled = canceledSubs.filter((s) => {
      const canceledAt = s.canceled_at;
      return canceledAt && canceledAt > thirtyDaysAgo;
    });

    const totalRevenue30d = recentPayments.reduce((sum, p) => sum + p.amount, 0);

    const result = {
      mrr: Math.round(mrr / 100), // Convert from öre to kr
      arr: Math.round((mrr / 100) * 12),
      active_subscribers: activeSubs.length,
      monthly_subscribers: monthlyCount,
      yearly_subscribers: yearlyCount,
      churn_30d: recentCanceled.length,
      revenue_30d: Math.round(totalRevenue30d),
      recent_payments: recentPayments.slice(0, 20),
      revenue_trend: revenueTrend,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[admin-revenue]", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});