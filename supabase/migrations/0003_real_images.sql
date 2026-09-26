-- ============================================
-- MS CHARAN TILES — replace placehold.co placeholder images with real,
-- name-matched photography (Unsplash, hotlinked via their CDN — free to use).
-- ============================================

-- CATEGORIES
update public.categories set image_url = 'https://images.unsplash.com/photo-1521783593447-5702b9bfd267?w=800&q=80&fm=jpg&fit=crop&auto=format' where slug = 'bathroom-tiles';
update public.categories set image_url = 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=800&q=80&fm=jpg&fit=crop&auto=format' where slug = 'kitchen-tiles';
update public.categories set image_url = 'https://images.unsplash.com/photo-1556597256-339e623f2ccb?w=800&q=80&fm=jpg&fit=crop&auto=format' where slug = 'living-room-tiles';
update public.categories set image_url = 'https://images.unsplash.com/photo-1625579002297-aeebbf69de89?w=800&q=80&fm=jpg&fit=crop&auto=format' where slug = 'bedroom-tiles';
update public.categories set image_url = 'https://images.unsplash.com/photo-1719324923413-ba0a066465c9?w=800&q=80&fm=jpg&fit=crop&auto=format' where slug = 'outdoor-tiles';
update public.categories set image_url = 'https://images.unsplash.com/photo-1758448511533-e1502259fff6?w=800&q=80&fm=jpg&fit=crop&auto=format' where slug = 'commercial-tiles';

-- COLLECTIONS
update public.collections set hero_image_url = 'https://images.unsplash.com/photo-1573345173719-5fbd4783d3c8?w=1200&q=80&fm=jpg&fit=crop&auto=format' where slug = 'urbanstone';
update public.collections set hero_image_url = 'https://images.unsplash.com/photo-1600328604921-300918f36018?w=1200&q=80&fm=jpg&fit=crop&auto=format' where slug = 'marbello';
update public.collections set hero_image_url = 'https://images.unsplash.com/photo-1712635192103-283a087e2c69?w=1200&q=80&fm=jpg&fit=crop&auto=format' where slug = 'terracraft';
update public.collections set hero_image_url = 'https://images.unsplash.com/photo-1653972233229-1b8c042d6d8e?w=1200&q=80&fm=jpg&fit=crop&auto=format' where slug = 'purematt';

-- PRODUCT IMAGES — drop the placehold.co placeholders, insert real photos.
-- sort_order 0 = a close-up matching the product's own name/finish/color,
-- sort_order 1 = a "room view" reusing that product's category photo.
delete from public.product_images;

insert into public.product_images (product_id, url, sort_order) values
-- BT-001 Arctic Frost Matte (white matte)
('30000000-0000-4000-8000-000000000001','https://images.unsplash.com/photo-1614598632980-35ee54daa5b9?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000001','https://images.unsplash.com/photo-1521783593447-5702b9bfd267?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- BT-002 Ocean Mist Glossy (blue-grey glossy)
('30000000-0000-4000-8000-000000000002','https://images.unsplash.com/photo-1701251786408-d0320ecaad8d?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000002','https://images.unsplash.com/photo-1521783593447-5702b9bfd267?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- BT-003 Pearl Beige Soft (beige satin herringbone)
('30000000-0000-4000-8000-000000000003','https://images.unsplash.com/photo-1676191099600-144cd9ee67d9?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000003','https://images.unsplash.com/photo-1521783593447-5702b9bfd267?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- KT-001 Charcoal Slate Textured
('30000000-0000-4000-8000-000000000004','https://images.unsplash.com/photo-1635789146064-ffa7966c32e3?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000004','https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- KT-002 Golden Terrazzo
('30000000-0000-4000-8000-000000000005','https://images.unsplash.com/photo-1535805882538-e71ecb030e48?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000005','https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- KT-003 Ivory Subway Gloss
('30000000-0000-4000-8000-000000000006','https://images.unsplash.com/photo-1648475235031-ea9569c6ac40?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000006','https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- LR-001 Carrara Marble Polish
('30000000-0000-4000-8000-000000000007','https://images.unsplash.com/photo-1584354273341-3eb96574e5be?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000007','https://images.unsplash.com/photo-1556597256-339e623f2ccb?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- LR-002 Walnut Wood Grain
('30000000-0000-4000-8000-000000000008','https://images.unsplash.com/photo-1712635192103-283a087e2c69?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000008','https://images.unsplash.com/photo-1556597256-339e623f2ccb?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- LR-003 Graphite Concrete
('30000000-0000-4000-8000-000000000009','https://images.unsplash.com/photo-1515895309288-a3815ab7cf81?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000009','https://images.unsplash.com/photo-1556597256-339e623f2ccb?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- BR-001 Blush Sand Satin
('30000000-0000-4000-8000-000000000010','https://images.unsplash.com/photo-1695131022363-ce6de4d6eaa5?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000010','https://images.unsplash.com/photo-1625579002297-aeebbf69de89?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- BR-002 Cloud Grey Soft Touch
('30000000-0000-4000-8000-000000000011','https://images.unsplash.com/photo-1600456899121-68eda5705257?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000011','https://images.unsplash.com/photo-1625579002297-aeebbf69de89?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- BR-003 Ivory Linen Weave
('30000000-0000-4000-8000-000000000012','https://images.unsplash.com/photo-1615799998603-7c6270a45196?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000012','https://images.unsplash.com/photo-1625579002297-aeebbf69de89?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- OD-001 Granite Grip Anti-Skid
('30000000-0000-4000-8000-000000000013','https://images.unsplash.com/photo-1520699514109-b478c7b48d3b?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000013','https://images.unsplash.com/photo-1719324923413-ba0a066465c9?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- OD-002 Sandstone Terrace
('30000000-0000-4000-8000-000000000014','https://images.unsplash.com/photo-1767022062386-36d4af393776?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000014','https://images.unsplash.com/photo-1719324923413-ba0a066465c9?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- OD-003 Slate Grey Deck
('30000000-0000-4000-8000-000000000015','https://images.unsplash.com/photo-1601971988253-cdb59d718f9d?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000015','https://images.unsplash.com/photo-1719324923413-ba0a066465c9?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- CM-001 Industrial Grey Heavy Duty
('30000000-0000-4000-8000-000000000016','https://images.unsplash.com/photo-1696360085467-032bbc0275e3?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000016','https://images.unsplash.com/photo-1758448511533-e1502259fff6?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- CM-002 Polished Black Onyx
('30000000-0000-4000-8000-000000000017','https://images.unsplash.com/photo-1780572160856-fa59bd2fbf46?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000017','https://images.unsplash.com/photo-1758448511533-e1502259fff6?w=1200&q=80&fm=jpg&fit=crop&auto=format',1),
-- CM-003 Warm White Commercial
('30000000-0000-4000-8000-000000000018','https://images.unsplash.com/photo-1520246666401-ce41aa495861?w=1200&q=80&fm=jpg&fit=crop&auto=format',0),
('30000000-0000-4000-8000-000000000018','https://images.unsplash.com/photo-1758448511533-e1502259fff6?w=1200&q=80&fm=jpg&fit=crop&auto=format',1);
