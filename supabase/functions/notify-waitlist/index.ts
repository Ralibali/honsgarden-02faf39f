import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Body { listing_id: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { listing_id } = (await req.json()) as Body;
    if (!listing_id) return new Response(JSON.stringify({ error: 'listing_id krävs' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: listing } = await supabase.from('public_egg_sale_listings').select('id, title, slug, stock_packs, user_id').eq('id', listing_id).maybeSingle();
    if (!listing) return new Response(JSON.stringify({ error: 'Säljlistan finns inte' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (Number(listing.stock_packs ?? 0) <= 0) return new Response(JSON.stringify({ notified: 0, reason: 'Inget lager' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: waitlist = [] } = await supabase.from('egg_sale_waitlist').select('id, customer_name, customer_email, packs_wanted').eq('listing_id', listing_id).is('notified_at', null);
    const recipients = (waitlist ?? []).filter((w: any) => w.customer_email);
    if (recipients.length === 0) return new Response(JSON.stringify({ notified: 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const url = `https://honsgarden.se/s/${listing.slug}`;
    let sent = 0;
    for (const r of recipients) {
      const messageId = `waitlist-${r.id}-${Date.now()}`;
      const html = `<div style="font-family: Inter, Arial, sans-serif; max-width: 500px; padding: 30px 25px;">
        <img src="https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png" width="140" alt="Hönsgården" style="margin: 0 0 24px;" />
        <h1 style="font-family: Young Serif, Georgia, serif; font-size: 22px; color: hsl(22,18%,12%); margin: 0 0 20px;">Hej ${r.customer_name}! 🥚</h1>
        <p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6;">Goda nyheter! <strong>${listing.title}</strong> har fått påfyllning och finns nu i lager igen.</p>
        <p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6; margin: 0 0 25px;">Var snabb, först till kvarn gäller!</p>
        <a href="${url}" style="background-color: hsl(142,32%,34%); color: hsl(35,32%,97%); font-size: 14px; border-radius: 14px; padding: 12px 24px; text-decoration: none; display: inline-block;">Boka nu →</a>
        <p style="font-size: 12px; color: #999; margin: 30px 0 0;">Du får detta mejl för att du anmälde intresse för säljlistan.</p>
      </div>`;
      await supabase.rpc('enqueue_email', {
        queue_name: 'transactional_emails',
        payload: {
          run_id: crypto.randomUUID(),
          to: r.customer_email,
          from: 'Hönsgården <noreply@notify.honsgarden.se>',
          sender_domain: 'notify.honsgarden.se',
          subject: `Tillbaka i lager: ${listing.title} 🥚`,
          html,
          text: `Hej ${r.customer_name}! ${listing.title} finns i lager igen. Boka: ${url}`,
          purpose: 'transactional',
          label: 'waitlist-notify',
          message_id: messageId,
          queued_at: new Date().toISOString(),
        },
      });
      await supabase.from('egg_sale_waitlist').update({ notified_at: new Date().toISOString() }).eq('id', r.id);
      sent++;
    }

    return new Response(JSON.stringify({ notified: sent }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
