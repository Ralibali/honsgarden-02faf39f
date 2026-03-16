import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  // Get user from auth header
  const authHeader = req.headers.get("Authorization");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader || "" } },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "invite") {
      // Owner invites someone by email
      if (!user) throw new Error("Ej inloggad");
      const { email } = body;
      if (!email) throw new Error("E-postadress saknas");

      // Get user's farm (coop_settings where they are owner)
      const { data: membership } = await supabaseAdmin
        .from("farm_members")
        .select("farm_id, role")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .single();

      if (!membership) throw new Error("Du har ingen gård att bjuda in till");

      // Check if already a member
      const { data: existingProfile } = await supabaseAdmin
        .from("profiles")
        .select("user_id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (existingProfile) {
        const { data: existingMember } = await supabaseAdmin
          .from("farm_members")
          .select("id")
          .eq("farm_id", membership.farm_id)
          .eq("user_id", existingProfile.user_id)
          .maybeSingle();
        if (existingMember)
          throw new Error("Denna person är redan medlem i din gård");
      }

      // Check for pending invite
      const { data: existingInvite } = await supabaseAdmin
        .from("farm_invitations")
        .select("id")
        .eq("farm_id", membership.farm_id)
        .eq("email", email.toLowerCase())
        .eq("status", "pending")
        .maybeSingle();
      if (existingInvite)
        throw new Error("En inbjudan har redan skickats till denna e-post");

      // Create invitation
      const { data: invitation, error: invErr } = await supabaseAdmin
        .from("farm_invitations")
        .insert({
          farm_id: membership.farm_id,
          email: email.toLowerCase(),
          invited_by: user.id,
        })
        .select("token")
        .single();
      if (invErr) throw new Error(invErr.message);

      // Get farm name
      const { data: coop } = await supabaseAdmin
        .from("coop_settings")
        .select("coop_name")
        .eq("id", membership.farm_id)
        .single();

      // Get inviter name
      const { data: inviterProfile } = await supabaseAdmin
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .single();

      const farmName = coop?.coop_name || "Hönsgården";
      const inviterName =
        inviterProfile?.display_name || user.email || "Någon";
      const inviteUrl = `https://honsgarden.lovable.app/inbjudan/${invitation.token}`;

      // Send invitation email via queue
      await supabaseAdmin.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload: {
          to: email.toLowerCase(),
          from: "Hönsgården <noreply@notify.honsgarden.se>",
          sender_domain: "notify.honsgarden.se",
          subject: `${inviterName} bjuder in dig till ${farmName} 🐔`,
          html: `<div style="font-family: Inter, Arial, sans-serif; max-width: 500px; padding: 30px 25px;">
            <img src="https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png" width="140" alt="Hönsgården" style="margin: 0 0 24px;" />
            <h1 style="font-family: 'Young Serif', Georgia, serif; font-size: 22px; color: hsl(22,18%,12%); margin: 0 0 20px;">Du har blivit inbjuden! 🎉</h1>
            <p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6; margin: 0 0 16px;"><strong>${inviterName}</strong> vill att du går med i gården <strong>${farmName}</strong> på Hönsgården.</p>
            <p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6; margin: 0 0 25px;">Tillsammans kan ni logga ägg, hantera höns och hålla koll på gården – allt på ett ställe.</p>
            <a href="${inviteUrl}" style="background-color: hsl(142,32%,34%); color: hsl(35,32%,97%); font-size: 14px; border-radius: 14px; padding: 12px 24px; text-decoration: none; display: inline-block;">Acceptera inbjudan →</a>
            <p style="font-size: 12px; color: #999; margin: 30px 0 0;">Inbjudan gäller i 7 dagar. Om du inte förväntade dig detta mejl kan du ignorera det.</p>
          </div>`,
          text: `${inviterName} bjuder in dig till ${farmName} på Hönsgården. Acceptera här: ${inviteUrl}`,
          purpose: "transactional",
          label: "farm-invitation",
          message_id: `farm-invite-${invitation.token}`,
          queued_at: new Date().toISOString(),
        },
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get-invite") {
      // Public: get invite details by token (no auth needed)
      const { token } = body;
      if (!token) throw new Error("Token saknas");

      const { data: invite, error } = await supabaseAdmin
        .from("farm_invitations")
        .select("id, email, status, expires_at, farm_id")
        .eq("token", token)
        .single();
      if (error || !invite) throw new Error("Inbjudan hittades inte");

      if (invite.status !== "pending")
        throw new Error("Inbjudan har redan använts");
      if (new Date(invite.expires_at) < new Date())
        throw new Error("Inbjudan har gått ut");

      // Get farm info
      const { data: coop } = await supabaseAdmin
        .from("coop_settings")
        .select("coop_name")
        .eq("id", invite.farm_id)
        .single();

      return new Response(
        JSON.stringify({
          email: invite.email,
          farm_name: coop?.coop_name || "Hönsgården",
          status: invite.status,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "accept-invite") {
      if (!user) throw new Error("Du måste vara inloggad för att acceptera");
      const { token } = body;
      if (!token) throw new Error("Token saknas");

      const { data: invite } = await supabaseAdmin
        .from("farm_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .single();

      if (!invite) throw new Error("Inbjudan hittades inte eller har redan använts");
      if (new Date(invite.expires_at) < new Date())
        throw new Error("Inbjudan har gått ut");

      // Verify email matches (case-insensitive)
      if (user.email?.toLowerCase() !== invite.email.toLowerCase()) {
        throw new Error(
          `Inbjudan skickades till ${invite.email}. Du är inloggad som ${user.email}.`
        );
      }

      // Add as farm member
      const { error: memberErr } = await supabaseAdmin
        .from("farm_members")
        .insert({
          farm_id: invite.farm_id,
          user_id: user.id,
          role: "member",
        });
      if (memberErr) {
        if (memberErr.code === "23505")
          throw new Error("Du är redan medlem i denna gård");
        throw new Error(memberErr.message);
      }

      // Mark invitation as accepted
      await supabaseAdmin
        .from("farm_invitations")
        .update({ status: "accepted" })
        .eq("id", invite.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "remove-member") {
      if (!user) throw new Error("Ej inloggad");
      const { member_id } = body;

      // Verify caller is owner
      const { data: callerMembership } = await supabaseAdmin
        .from("farm_members")
        .select("farm_id, role")
        .eq("user_id", user.id)
        .eq("role", "owner")
        .single();
      if (!callerMembership) throw new Error("Du är inte ägare");

      // Don't allow removing yourself as owner
      const { data: target } = await supabaseAdmin
        .from("farm_members")
        .select("user_id, role")
        .eq("id", member_id)
        .eq("farm_id", callerMembership.farm_id)
        .single();
      if (!target) throw new Error("Medlem hittades inte");
      if (target.role === "owner")
        throw new Error("Du kan inte ta bort ägaren");

      await supabaseAdmin.from("farm_members").delete().eq("id", member_id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "leave-farm") {
      if (!user) throw new Error("Ej inloggad");
      const { farm_id } = body;

      const { data: membership } = await supabaseAdmin
        .from("farm_members")
        .select("id, role")
        .eq("farm_id", farm_id)
        .eq("user_id", user.id)
        .single();
      if (!membership) throw new Error("Du är inte medlem");
      if (membership.role === "owner")
        throw new Error("Ägaren kan inte lämna gården");

      await supabaseAdmin.from("farm_members").delete().eq("id", membership.id);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Okänd åtgärd");
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
