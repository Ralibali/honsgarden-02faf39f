-- ============================================
-- USER NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('booking', 'community_reply', 'community_reaction', 'system')),
  title text NOT NULL,
  body text,
  link text,
  metadata jsonb DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_notifications_user_id_created_idx
  ON public.user_notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS user_notifications_unread_idx
  ON public.user_notifications (user_id) WHERE read_at IS NULL;

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.user_notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark own notifications as read"
  ON public.user_notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.user_notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role and triggers can insert notifications"
  ON public.user_notifications FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- ============================================
-- TRIGGER: Notify seller on new booking
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_seller_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _seller_email text;
  _seller_name text;
  _listing_title text;
  _message_id text;
  _link text;
BEGIN
  -- Hämta säljarens uppgifter
  SELECT email, display_name INTO _seller_email, _seller_name
  FROM public.profiles
  WHERE user_id = NEW.seller_user_id;

  SELECT COALESCE(title, 'Din äggförsäljning') INTO _listing_title
  FROM public.public_egg_sale_listings
  WHERE id = NEW.listing_id;

  _link := '/app/egg-sales';

  -- 1. In-app-notis
  INSERT INTO public.user_notifications (user_id, type, title, body, link, metadata)
  VALUES (
    NEW.seller_user_id,
    'booking',
    'Ny bokning! 🥚',
    NEW.customer_name || ' har bokat ' || NEW.packs || ' förpackning' ||
      CASE WHEN NEW.packs > 1 THEN 'ar' ELSE '' END || ' av "' || _listing_title || '".',
    _link,
    jsonb_build_object(
      'booking_id', NEW.id,
      'listing_id', NEW.listing_id,
      'customer_name', NEW.customer_name,
      'packs', NEW.packs
    )
  );

  -- 2. Mejl till säljaren
  IF _seller_email IS NOT NULL THEN
    _message_id := 'booking-' || NEW.id::text || '-' || extract(epoch from now())::bigint::text;
    PERFORM public.enqueue_email(
      'transactional_emails',
      jsonb_build_object(
        'run_id', gen_random_uuid()::text,
        'to', _seller_email,
        'from', 'Hönsgården <noreply@notify.honsgarden.se>',
        'sender_domain', 'notify.honsgarden.se',
        'subject', 'Ny bokning på din äggförsäljning 🥚',
        'html', '<div style="font-family: Inter, Arial, sans-serif; max-width: 540px; padding: 30px 25px;">'
          || '<img src="https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png" width="140" alt="Hönsgården" style="margin: 0 0 24px;" />'
          || '<h1 style="font-family: Young Serif, Georgia, serif; font-size: 22px; color: hsl(22,18%,12%); margin: 0 0 16px;">Hej ' || COALESCE(_seller_name, 'där') || '!</h1>'
          || '<p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6; margin: 0 0 18px;">Du har en ny bokning på <strong>' || _listing_title || '</strong>.</p>'
          || '<div style="background: hsl(35,32%,97%); border: 1px solid hsl(22,15%,90%); border-radius: 14px; padding: 18px 20px; margin: 0 0 20px;">'
          || '<p style="margin:0 0 8px;font-size:13px;color:hsl(22,12%,44%);">Kund</p>'
          || '<p style="margin:0 0 14px;font-size:15px;color:hsl(22,18%,12%);font-weight:600;">' || NEW.customer_name || '</p>'
          || CASE WHEN NEW.customer_phone IS NOT NULL THEN '<p style="margin:0 0 8px;font-size:13px;color:hsl(22,12%,44%);">Telefon</p><p style="margin:0 0 14px;font-size:15px;color:hsl(22,18%,12%);">' || NEW.customer_phone || '</p>' ELSE '' END
          || '<p style="margin:0 0 8px;font-size:13px;color:hsl(22,12%,44%);">Antal förpackningar</p>'
          || '<p style="margin:0;font-size:15px;color:hsl(22,18%,12%);font-weight:600;">' || NEW.packs::text || ' st</p>'
          || CASE WHEN NEW.customer_message IS NOT NULL AND length(NEW.customer_message) > 0 THEN '<p style="margin:14px 0 8px;font-size:13px;color:hsl(22,12%,44%);">Meddelande</p><p style="margin:0;font-size:14px;color:hsl(22,18%,12%);font-style:italic;">"' || NEW.customer_message || '"</p>' ELSE '' END
          || '</div>'
          || '<a href="https://honsgarden.lovable.app/app/egg-sales" style="background-color: hsl(142,32%,34%); color: hsl(35,32%,97%); font-size: 14px; border-radius: 14px; padding: 12px 24px; text-decoration: none; display: inline-block;">Öppna Agdas Bod →</a>'
          || '<p style="font-size: 12px; color: #999; margin: 30px 0 0;">Du får detta mejl för att du har en aktiv äggförsäljning på Hönsgården.</p>'
          || '</div>',
        'text', 'Ny bokning på "' || _listing_title || '" från ' || NEW.customer_name || ' (' || NEW.packs || ' förpackningar). Logga in: https://honsgarden.lovable.app/app/egg-sales',
        'purpose', 'transactional',
        'label', 'seller-new-booking',
        'message_id', _message_id,
        'queued_at', now()::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_seller_on_booking_trigger ON public.public_egg_sale_bookings;
CREATE TRIGGER notify_seller_on_booking_trigger
AFTER INSERT ON public.public_egg_sale_bookings
FOR EACH ROW
EXECUTE FUNCTION public.notify_seller_on_booking();

-- ============================================
-- TRIGGER: Notify post owner on new community comment
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_post_owner_on_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner_id uuid;
  _owner_email text;
  _owner_name text;
  _commenter_name text;
  _post_title text;
  _post_excerpt text;
  _message_id text;
BEGIN
  -- Hämta postägare
  SELECT user_id, COALESCE(title, ''),
         CASE WHEN length(content) > 80 THEN substring(content, 1, 80) || '...' ELSE content END
  INTO _owner_id, _post_title, _post_excerpt
  FROM public.community_posts
  WHERE id = NEW.post_id;

  -- Hoppa över notis om man kommenterar sitt eget inlägg
  IF _owner_id IS NULL OR _owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Hämta kommentatorns namn
  SELECT COALESCE(display_name, split_part(email, '@', 1), 'Någon')
  INTO _commenter_name
  FROM public.profiles
  WHERE user_id = NEW.user_id;

  -- Hämta ägarens kontaktuppgifter
  SELECT email, COALESCE(display_name, split_part(email, '@', 1), 'där')
  INTO _owner_email, _owner_name
  FROM public.profiles
  WHERE user_id = _owner_id;

  -- 1. In-app-notis
  INSERT INTO public.user_notifications (user_id, type, title, body, link, metadata)
  VALUES (
    _owner_id,
    'community_reply',
    _commenter_name || ' svarade på ditt inlägg',
    '"' || _post_title || '"',
    '/app/community',
    jsonb_build_object(
      'post_id', NEW.post_id,
      'comment_id', NEW.id,
      'commenter_id', NEW.user_id,
      'commenter_name', _commenter_name
    )
  );

  -- 2. Mejl
  IF _owner_email IS NOT NULL THEN
    _message_id := 'comment-' || NEW.id::text || '-' || extract(epoch from now())::bigint::text;
    PERFORM public.enqueue_email(
      'transactional_emails',
      jsonb_build_object(
        'run_id', gen_random_uuid()::text,
        'to', _owner_email,
        'from', 'Hönsgården <noreply@notify.honsgarden.se>',
        'sender_domain', 'notify.honsgarden.se',
        'subject', _commenter_name || ' svarade på ditt inlägg i Community',
        'html', '<div style="font-family: Inter, Arial, sans-serif; max-width: 540px; padding: 30px 25px;">'
          || '<img src="https://sikbymtrbhrofysgkqsj.supabase.co/storage/v1/object/public/email-assets/logo-honsgarden.png" width="140" alt="Hönsgården" style="margin: 0 0 24px;" />'
          || '<h1 style="font-family: Young Serif, Georgia, serif; font-size: 22px; color: hsl(22,18%,12%); margin: 0 0 16px;">Hej ' || _owner_name || '!</h1>'
          || '<p style="font-size: 14px; color: hsl(22,12%,44%); line-height: 1.6; margin: 0 0 18px;"><strong>' || _commenter_name || '</strong> har svarat på ditt inlägg <em>"' || _post_title || '"</em>.</p>'
          || '<div style="background: hsl(35,32%,97%); border-left: 3px solid hsl(142,32%,34%); padding: 14px 18px; margin: 0 0 22px; border-radius: 8px;">'
          || '<p style="margin:0;font-size:14px;color:hsl(22,18%,12%);line-height:1.6;font-style:italic;">' || substring(NEW.content from 1 for 240) || CASE WHEN length(NEW.content) > 240 THEN '...' ELSE '' END || '</p>'
          || '</div>'
          || '<a href="https://honsgarden.lovable.app/app/community" style="background-color: hsl(142,32%,34%); color: hsl(35,32%,97%); font-size: 14px; border-radius: 14px; padding: 12px 24px; text-decoration: none; display: inline-block;">Öppna i Community →</a>'
          || '<p style="font-size: 12px; color: #999; margin: 30px 0 0;">Du får detta mejl för att någon svarat på ditt inlägg på Hönsgården.</p>'
          || '</div>',
        'text', _commenter_name || ' svarade på ditt inlägg "' || _post_title || '" i Community: ' || substring(NEW.content from 1 for 200) || ' — Öppna: https://honsgarden.lovable.app/app/community',
        'purpose', 'transactional',
        'label', 'community-comment-notify',
        'message_id', _message_id,
        'queued_at', now()::text
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_post_owner_on_comment_trigger ON public.community_comments;
CREATE TRIGGER notify_post_owner_on_comment_trigger
AFTER INSERT ON public.community_comments
FOR EACH ROW
EXECUTE FUNCTION public.notify_post_owner_on_comment();