-- 1. Lager-fält på listings
ALTER TABLE public.public_egg_sale_listings
  ADD COLUMN IF NOT EXISTS stock_packs INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_source TEXT NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS regular_customer_threshold INTEGER NOT NULL DEFAULT 4;

ALTER TABLE public.public_egg_sale_listings
  ADD CONSTRAINT public_egg_sale_listings_stock_source_chk
  CHECK (stock_source IN ('manual', 'egg_log'));

ALTER TABLE public.public_egg_sale_listings
  ADD CONSTRAINT public_egg_sale_listings_stock_nonneg_chk
  CHECK (stock_packs >= 0);

-- 2. Trigger: auto-pausa/återaktivera när stock ändras
CREATE OR REPLACE FUNCTION public.auto_toggle_listing_on_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.auto_publish = true THEN
    IF NEW.stock_packs <= 0 AND NEW.sold_out_manually = false THEN
      NEW.sold_out_manually := true;
    ELSIF NEW.stock_packs > 0 AND OLD.stock_packs <= 0 AND NEW.sold_out_manually = true THEN
      NEW.sold_out_manually := false;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_toggle_listing_on_stock ON public.public_egg_sale_listings;
CREATE TRIGGER trg_auto_toggle_listing_on_stock
BEFORE UPDATE OF stock_packs ON public.public_egg_sale_listings
FOR EACH ROW
EXECUTE FUNCTION public.auto_toggle_listing_on_stock();

-- 3. Trigger: dra från lagret när bokning skapas (manuellt lager)
CREATE OR REPLACE FUNCTION public.decrement_stock_on_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _source TEXT;
BEGIN
  SELECT stock_source INTO _source FROM public.public_egg_sale_listings WHERE id = NEW.listing_id;
  IF _source = 'manual' AND NEW.status <> 'cancelled' THEN
    UPDATE public.public_egg_sale_listings
    SET stock_packs = GREATEST(0, stock_packs - NEW.packs)
    WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_decrement_stock_on_booking ON public.public_egg_sale_bookings;
CREATE TRIGGER trg_decrement_stock_on_booking
AFTER INSERT ON public.public_egg_sale_bookings
FOR EACH ROW
EXECUTE FUNCTION public.decrement_stock_on_booking();

-- Återställ lagret om bokning avbryts
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _source TEXT;
BEGIN
  SELECT stock_source INTO _source FROM public.public_egg_sale_listings WHERE id = NEW.listing_id;
  IF _source = 'manual' AND OLD.status <> 'cancelled' AND NEW.status = 'cancelled' THEN
    UPDATE public.public_egg_sale_listings
    SET stock_packs = stock_packs + OLD.packs
    WHERE id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restore_stock_on_cancel ON public.public_egg_sale_bookings;
CREATE TRIGGER trg_restore_stock_on_cancel
AFTER UPDATE OF status ON public.public_egg_sale_bookings
FOR EACH ROW
EXECUTE FUNCTION public.restore_stock_on_cancel();

-- 4. Väntelista
CREATE TABLE IF NOT EXISTS public.egg_sale_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.public_egg_sale_listings(id) ON DELETE CASCADE,
  seller_user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  packs_wanted INTEGER NOT NULL DEFAULT 1,
  notified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CHECK (packs_wanted > 0 AND packs_wanted <= 100),
  CHECK (customer_email IS NOT NULL OR customer_phone IS NOT NULL)
);

ALTER TABLE public.egg_sale_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON public.egg_sale_waitlist FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.public_egg_sale_listings l
      WHERE l.id = listing_id
        AND l.user_id = seller_user_id
        AND l.is_active = true
    )
    AND length(customer_name) BETWEEN 1 AND 100
    AND (customer_email IS NULL OR length(customer_email) <= 254)
    AND (customer_phone IS NULL OR length(customer_phone) <= 30)
  );

CREATE POLICY "Sellers can read own waitlist"
  ON public.egg_sale_waitlist FOR SELECT
  USING (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can delete own waitlist entries"
  ON public.egg_sale_waitlist FOR DELETE
  USING (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can update own waitlist entries"
  ON public.egg_sale_waitlist FOR UPDATE
  USING (auth.uid() = seller_user_id)
  WITH CHECK (auth.uid() = seller_user_id);

CREATE INDEX IF NOT EXISTS idx_waitlist_listing ON public.egg_sale_waitlist(listing_id) WHERE notified_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_seller ON public.egg_sale_waitlist(seller_user_id);

-- 5. Recensioner
CREATE TABLE IF NOT EXISTS public.egg_sale_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.public_egg_sale_bookings(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.public_egg_sale_listings(id) ON DELETE CASCADE,
  seller_user_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (booking_id),
  CHECK (length(customer_name) BETWEEN 1 AND 100),
  CHECK (comment IS NULL OR length(comment) <= 2000)
);

ALTER TABLE public.egg_sale_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published reviews"
  ON public.egg_sale_reviews FOR SELECT
  USING (is_published = true);

CREATE POLICY "Sellers can read own reviews"
  ON public.egg_sale_reviews FOR SELECT
  USING (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can hide own reviews"
  ON public.egg_sale_reviews FOR UPDATE
  USING (auth.uid() = seller_user_id)
  WITH CHECK (auth.uid() = seller_user_id);

CREATE POLICY "Sellers can delete own reviews"
  ON public.egg_sale_reviews FOR DELETE
  USING (auth.uid() = seller_user_id);

-- 6. Recensions-tokens (en token per bokning, mejlas till kunden)
CREATE TABLE IF NOT EXISTS public.egg_sale_review_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES public.public_egg_sale_bookings(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.public_egg_sale_listings(id) ON DELETE CASCADE,
  seller_user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.egg_sale_review_tokens ENABLE ROW LEVEL SECURITY;

-- Public kan slå upp token för att kunna lämna recension
CREATE POLICY "Anyone can read token by value"
  ON public.egg_sale_review_tokens FOR SELECT
  USING (true);

CREATE POLICY "Service role manages tokens"
  ON public.egg_sale_review_tokens FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Sellers can read own tokens"
  ON public.egg_sale_review_tokens FOR SELECT
  USING (auth.uid() = seller_user_id);

-- Public kan lämna recension via giltig token (skickas via edge function)
CREATE POLICY "Anyone can submit review via token"
  ON public.egg_sale_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.egg_sale_review_tokens t
      WHERE t.booking_id = egg_sale_reviews.booking_id
        AND t.listing_id = egg_sale_reviews.listing_id
        AND t.seller_user_id = egg_sale_reviews.seller_user_id
        AND t.used_at IS NULL
    )
  );

-- Trigger: skapa review-token när bokning markeras som hämtad
CREATE OR REPLACE FUNCTION public.create_review_token_on_pickup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM 'picked_up') AND NEW.status = 'picked_up' THEN
    INSERT INTO public.egg_sale_review_tokens (booking_id, listing_id, seller_user_id)
    VALUES (NEW.id, NEW.listing_id, NEW.seller_user_id)
    ON CONFLICT (booking_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_review_token_on_pickup ON public.public_egg_sale_bookings;
CREATE TRIGGER trg_create_review_token_on_pickup
AFTER UPDATE OF status ON public.public_egg_sale_bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_review_token_on_pickup();

CREATE INDEX IF NOT EXISTS idx_reviews_listing ON public.egg_sale_reviews(listing_id) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_reviews_seller ON public.egg_sale_reviews(seller_user_id);