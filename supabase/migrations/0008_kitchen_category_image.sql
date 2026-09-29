-- ============================================
-- CHARAN TILES — brighter Kitchen image for "Shop by room".
-- The previous photo (dark cabinets, dark mosaic) read as gloomy on the home
-- screen. Same bright green-herringbone kitchen as the home hero slide.
-- ============================================

update public.categories
  set image_url = 'https://images.unsplash.com/photo-1653427603096-54342daac941?w=800&q=80&fm=jpg&fit=crop&auto=format'
  where slug = 'kitchen-tiles';
