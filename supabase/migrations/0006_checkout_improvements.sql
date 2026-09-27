-- ============================================
-- MS CHARAN TILES — checkout improvements:
--  1. Remember the customer's last delivery address so it pre-fills next time.
--  2. Snapshot the estimated delivery window onto each order (like
--     shipping_fee and price_at_purchase), so a later change to the lead
--     time never rewrites the estimate shown for a past order.
-- ============================================

alter table public.profiles
  add column default_address jsonb;

alter table public.orders
  add column estimated_delivery_from date,
  add column estimated_delivery_to date;
