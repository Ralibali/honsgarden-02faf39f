import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Body { booking_id: string; customer_email?: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  try {
    const { booking_id, customer_email } = (await req.json()) as Body;
    if (!booking_id) return new Response(JSON.stringify({ error: 'booking_id krävs' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: token } = await supabase.from('egg_sale_review_tokens').select('token, listing_id').eq('booking_id', booking_id).is('used_at', null).maybeSingle();
    if (!token) return new Response(JSON.stringify({ error: 'Ingen giltig recensions-länk hittades' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { data: booking } = await supabase.from('public_egg_sale_bookings').select('customer_name').eq('id', booking_id).maybeSingle();
    const { data: listing } = await supabase.from('public_egg_sale_listings').select('title, slug').eq('id', token.listing_id).maybeSingle();

    const reviewUrl = `https://honsgarden.se/r/${token.token}`;

    if (!customer_email) {
      // Returnera bara länken så säljaren kan kopiera/SMS:a själv
      return new Response(JSON.stringify({ review_url: reviewUrl, sent: false }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const messageId = `review-req-${booking_id}-${Date.now()}`;
    const html = `<div style="font-family: Inter, Arial, sans-serif; max-width: 500px; padding: 30px 25px;">
      <img src="https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png" width="140" alt="Hönsgården" style="margin: 0 0 24px;" />
      <h1 style="font-family: Young Serif, Georgia, serif; font-size: 22px; color: hsl(22,18%,12%); margin: 0 0 20px;">Hej ${booking?.customer_name || 'där'}! ⭐</h1>
      <p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6;">Tack för att du hämtade ägg från <strong>${listing?.title || 'oss'}</strong>!</p>
      <p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6; margin: 0 0 25px;">Skulle du vilja lämna ett kort betyg? Det tar 30 sekunder och hjälper andra som letar efter lokala ägg.</p>
      <a href="${reviewUrl}" style="background-color: hsl(142,32%,34%); color: hsl(35,32%,97%); font-size: 14px; border-radius: 14px; padding: 12px 24px; text-decoration: none; display: inline-block;">Lämna betyg →</a>
      <p style="font-size: 12px; color: #999; margin: 30px 0 0;">Du får detta mejl för att du nyligen hämtat ägg.</p>
    </div>`;

    await supabase.rpc('enqueue_email', {
      queue_name: 'transactional_emails',
      payload: {
        run_id: crypto.randomUUID(),
        to: customer_email,
        from: 'Hönsgården <noreply@notify.honsgarden.se>',
        sender_domain: 'notify.honsgarden.se',
        subject: `Vad tyckte du om äggen från ${listing?.title || 'din säljare'}?`,
        html,
        text: `Hej ${booking?.customer_name || ''}! Lämna gärna ett kort betyg: ${reviewUrl}`,
        purpose: 'transactional',
        label: 'review-request',
        message_id: messageId,
        queued_at: new Date().toISOString(),
      },
    });

    return new Response(JSON.stringify({ review_url: reviewUrl, sent: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
