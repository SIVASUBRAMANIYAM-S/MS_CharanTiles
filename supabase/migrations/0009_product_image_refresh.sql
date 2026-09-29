-- ============================================
-- CHARAN TILES — replace plain/generic photos for 7 products that customers
-- flagged as not looking attractive or not matching the tile's own name
-- (client feedback): Charcoal Slate Textured, Golden Terrazzo, Blush Sand
-- Satin, Ivory Linen Weave, Industrial Grey Heavy Duty, Warm White
-- Commercial (all replaced), and Cloud Grey Soft Touch (its first image
-- only — the second image was already good, kept as-is).
--
-- Every URL below is unique across the whole app (no two products, and no
-- category/collection banner, share the same source photo).
-- ============================================

-- KT-001 Charcoal Slate Textured — bold dark charcoal tile floor
update public.product_images
  set url = 'https://images.unsplash.com/photo-1595424073665-bf04f38d9c0b?w=1200&q=80&fm=jpg&fit=crop&auto=format'
  where product_id = '30000000-0000-4000-8000-000000000004' and sort_order = 0;

-- KT-002 Golden Terrazzo — warm-toned polished terrazzo pattern
update public.product_images
  set url = 'https://images.unsplash.com/photo-1771575521341-415ec739be67?w=1200&q=80&fm=jpg&fit=crop&auto=format'
  where product_id = '30000000-0000-4000-8000-000000000005' and sort_order = 0;

-- BR-001 Blush Sand Satin — warm sand-pink satin tile floor
update public.product_images
  set url = 'https://images.unsplash.com/photo-1547414857-c9f61632b250?w=1200&q=80&fm=jpg&fit=crop&auto=format'
  where product_id = '30000000-0000-4000-8000-000000000010' and sort_order = 0;

-- BR-002 Cloud Grey Soft Touch — first image only; second image kept
update public.product_images
  set url = 'https://images.unsplash.com/photo-1590884056072-0248bac7797e?w=1200&q=80&fm=jpg&fit=crop&auto=format'
  where product_id = '30000000-0000-4000-8000-000000000011' and sort_order = 0;

-- BR-003 Ivory Linen Weave — warm ivory woven-texture surface
update public.product_images
  set url = 'https://images.unsplash.com/photo-1783791995752-a25c91982e6f?w=1200&q=80&fm=jpg&fit=crop&auto=format'
  where product_id = '30000000-0000-4000-8000-000000000012' and sort_order = 0;

-- CM-001 Industrial Grey Heavy Duty — clean matte grey commercial floor
update public.product_images
  set url = 'https://images.unsplash.com/photo-1786933638319-10ebbb5b8661?w=1200&q=80&fm=jpg&fit=crop&crop=focalpoint&fp-y=0&fp-x=0.5&fp-z=1.8&auto=format'
  where product_id = '30000000-0000-4000-8000-000000000016' and sort_order = 0;

-- CM-003 Warm White Commercial — bright warm-white marble-look surface
update public.product_images
  set url = 'https://images.unsplash.com/photo-1694378060976-66ee61c4f427?w=1200&q=80&fm=jpg&fit=crop&auto=format'
  where product_id = '30000000-0000-4000-8000-000000000018' and sort_order = 0;
