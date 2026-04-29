
-- Auto-publicering / sold-out på listan när lagret ändras
DROP TRIGGER IF EXISTS trg_auto_toggle_listing ON public.public_egg_sale_listings;
CREATE TRIGGER trg_auto_toggle_listing
BEFORE UPDATE OF stock_packs ON public.public_egg_sale_listings
FOR EACH ROW EXECUTE FUNCTION public.auto_toggle_listing_on_stock();

-- Hålla updated_at fräsch
DROP TRIGGER IF EXISTS trg_listings_updated_at ON public.public_egg_sale_listings;
CREATE TRIGGER trg_listings_updated_at
BEFORE UPDATE ON public.public_egg_sale_listings
FOR EACH ROW EXECUTE FUNCTION public.set_public_egg_sale_listing_updated_at();

-- Lager minskar vid ny bokning (om manual)
DROP TRIGGER IF EXISTS trg_decrement_stock ON public.public_egg_sale_bookings;
CREATE TRIGGER trg_decrement_stock
AFTER INSERT ON public.public_egg_sale_bookings
FOR EACH ROW EXECUTE FUNCTION public.decrement_stock_on_booking();

-- Lager återställs vid avbokning
DROP TRIGGER IF EXISTS trg_restore_stock ON public.public_egg_sale_bookings;
CREATE TRIGGER trg_restore_stock
AFTER UPDATE OF status ON public.public_egg_sale_bookings
FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_cancel();

-- Skapa recensions-token automatiskt när status -> picked_up
DROP TRIGGER IF EXISTS trg_create_review_token ON public.public_egg_sale_bookings;
CREATE TRIGGER trg_create_review_token
AFTER UPDATE OF status ON public.public_egg_sale_bookings
FOR EACH ROW EXECUTE FUNCTION public.create_review_token_on_pickup();

-- Hålla bokningens updated_at fräsch
DROP TRIGGER IF EXISTS trg_bookings_updated_at ON public.public_egg_sale_bookings;
CREATE TRIGGER trg_bookings_updated_at
BEFORE UPDATE ON public.public_egg_sale_bookings
FOR EACH ROW EXECUTE FUNCTION public.set_public_egg_sale_booking_updated_at();
