
DROP TRIGGER IF EXISTS trg_auto_toggle_listing ON public.public_egg_sale_listings;
DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.public_egg_sale_listings;
DROP TRIGGER IF EXISTS trg_decrement_stock ON public.public_egg_sale_bookings;
DROP TRIGGER IF EXISTS trg_restore_stock ON public.public_egg_sale_bookings;
DROP TRIGGER IF EXISTS trg_create_review_token ON public.public_egg_sale_bookings;
DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.public_egg_sale_bookings;
