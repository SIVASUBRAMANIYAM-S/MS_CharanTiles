-- ============================================
-- MS CHARAN TILES — shipping is no longer always free. orders.shipping_fee
-- snapshots what was actually charged at checkout (mirrors price_at_purchase
-- on order_items), so changing the rule later never rewrites past orders.
-- Existing orders backfill to 0, which is accurate: no shipping fee existed
-- when they were placed.
-- ============================================

alter table public.orders
  add column shipping_fee numeric(10,2) not null default 0;
