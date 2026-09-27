-- ============================================
-- MS CHARAN TILES — full spec sheet per tile + 8 new featured tiles.
-- Photos for the new tiles are Pexels (free to use, hotlinked via their CDN),
-- each checked by eye to match the tile's name, colour and finish.
-- ============================================

-- SPEC COLUMNS
alter table public.products
  add column thickness_mm numeric(4,1),
  add column tiles_per_box int check (tiles_per_box > 0),
  add column coverage_sqft numeric(6,2),
  add column water_absorption text,
  add column pei_rating smallint check (pei_rating between 1 and 5),
  add column slip_rating text check (slip_rating in ('R9','R10','R11','R12')),
  add column suitable_for text[] not null default '{}'
    check (suitable_for <@ array['floor','wall','wet_areas','outdoor','high_traffic']::text[]),
  add column highlights text[] not null default '{}';

comment on column public.products.coverage_sqft is 'Area one box covers, derived from size x tiles_per_box.';
comment on column public.products.pei_rating is 'Surface wear rating 1-5; null for wall-only tiles.';
comment on column public.products.slip_rating is 'DIN 51130 ramp rating; null for wall-only tiles.';

-- NEW FEATURED TILES
insert into public.products (id, sku, name, slug, category_id, collection_id, description, material, finish, size, color, dominant_color_hex, price, mrp, stock_status, is_featured) values
('30000000-0000-4000-8000-000000000019','BT-004','Statuario Bianco Luxe','statuario-bianco-luxe','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','A bright white polished tile with bold grey veining modelled on Italian Statuario marble. Large 600x1200 slabs mean fewer grout lines, so a feature wall reads as one continuous stone surface.','vitrified','polished','600x1200mm','White-Grey','E9E8E4',128.00,148.00,'in_stock',true),
('30000000-0000-4000-8000-000000000020','KT-004','Emerald Zellige Gloss','emerald-zellige-gloss','10000000-0000-4000-8000-000000000002',null,'A small square wall tile in deep emerald with the uneven glaze and soft edges of handmade Moroccan zellige. Every tile catches the light slightly differently, which gives a backsplash real depth.','ceramic','glossy','100x100mm','Emerald','2F5E4E',96.00,110.00,'in_stock',true),
('30000000-0000-4000-8000-000000000021','LR-004','Travertine Classico','travertine-classico','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','A warm beige porcelain tile that reproduces the pitted, layered surface of Roman travertine. It has the calm, sunlit look of natural stone without the sealing and upkeep.','porcelain','matte','600x1200mm','Beige','D6C7AE',118.00,135.00,'in_stock',true),
('30000000-0000-4000-8000-000000000022','LR-005','Oak Herringbone Plank','oak-herringbone-plank','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','Slim honey-oak planks sized for herringbone and chevron layouts. You get the warmth of a parquet floor with a surface that shrugs off water, scratches and termites.','gvt','matte','150x900mm','Honey-Oak','A86B3A',84.00,96.00,'in_stock',true),
('30000000-0000-4000-8000-000000000023','BR-004','Venetian Terrazzo','venetian-terrazzo','10000000-0000-4000-8000-000000000004',null,'A soft grey-white tile scattered with marble chips in the classic Venetian terrazzo style. The busy pattern hides everyday dust and footprints, which suits a bedroom you want to feel calm.','vitrified','matte','600x600mm','Grey-White','CFCBC4',74.00,86.00,'in_stock',true),
('30000000-0000-4000-8000-000000000024','OD-004','Bluestone Herringbone Paver','bluestone-herringbone-paver','10000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000001','A 20mm blue-grey porcelain paver for patios, driveways and garden paths. Lay it in herringbone for a classic courtyard look; the structured surface stays grippy in the rain.','porcelain','structured','150x300mm','Blue-Grey','8C99A6',79.00,92.00,'in_stock',true),
('30000000-0000-4000-8000-000000000025','CM-004','Nero Marquina Grande','nero-marquina-grande','10000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000002','A deep black polished slab with fine white veins in the style of Spanish Nero Marquina marble. Made for hotel lobbies, showrooms and statement walls where the floor should be the first thing people notice.','porcelain','polished','800x1600mm','Black','1E1D21',162.00,185.00,'in_stock',true),
('30000000-0000-4000-8000-000000000026','BT-005','Azul Moroccan Pattern','azul-moroccan-pattern','10000000-0000-4000-8000-000000000001',null,'A blue and white encaustic-style pattern tile inspired by Moroccan and Portuguese cement tiles. Use it across a bathroom floor or as a single patterned wall behind the basin.','ceramic','matte','200x200mm','Blue-White','2E4C86',64.00,76.00,'in_stock',true);

insert into public.product_images (product_id, url, sort_order) values
-- BT-004 Statuario Bianco Luxe
('30000000-0000-4000-8000-000000000019','https://images.pexels.com/photos/4709423/pexels-photo-4709423.jpeg?auto=compress&cs=tinysrgb&w=1200',0),
('30000000-0000-4000-8000-000000000019','https://images.pexels.com/photos/8082223/pexels-photo-8082223.jpeg?auto=compress&cs=tinysrgb&w=1200',1),
('30000000-0000-4000-8000-000000000019','https://images.pexels.com/photos/7166637/pexels-photo-7166637.jpeg?auto=compress&cs=tinysrgb&w=1200',2),
-- KT-004 Emerald Zellige Gloss
('30000000-0000-4000-8000-000000000020','https://images.pexels.com/photos/37360085/pexels-photo-37360085.jpeg?auto=compress&cs=tinysrgb&w=1200',0),
('30000000-0000-4000-8000-000000000020','https://images.pexels.com/photos/33166884/pexels-photo-33166884.jpeg?auto=compress&cs=tinysrgb&w=1200',1),
('30000000-0000-4000-8000-000000000020','https://images.pexels.com/photos/37360083/pexels-photo-37360083.jpeg?auto=compress&cs=tinysrgb&w=1200',2),
-- LR-004 Travertine Classico
('30000000-0000-4000-8000-000000000021','https://images.pexels.com/photos/12106848/pexels-photo-12106848.jpeg?auto=compress&cs=tinysrgb&w=1200',0),
('30000000-0000-4000-8000-000000000021','https://images.pexels.com/photos/11540258/pexels-photo-11540258.jpeg?auto=compress&cs=tinysrgb&w=1200',1),
('30000000-0000-4000-8000-000000000021','https://images.pexels.com/photos/7422193/pexels-photo-7422193.jpeg?auto=compress&cs=tinysrgb&w=1200',2),
-- LR-005 Oak Herringbone Plank
('30000000-0000-4000-8000-000000000022','https://images.pexels.com/photos/37341468/pexels-photo-37341468.jpeg?auto=compress&cs=tinysrgb&w=1200',0),
('30000000-0000-4000-8000-000000000022','https://images.pexels.com/photos/7587872/pexels-photo-7587872.jpeg?auto=compress&cs=tinysrgb&w=1200',1),
('30000000-0000-4000-8000-000000000022','https://images.pexels.com/photos/16101859/pexels-photo-16101859.jpeg?auto=compress&cs=tinysrgb&w=1200',2),
-- BR-004 Venetian Terrazzo
('30000000-0000-4000-8000-000000000023','https://images.pexels.com/photos/4977440/pexels-photo-4977440.jpeg?auto=compress&cs=tinysrgb&w=1200',0),
('30000000-0000-4000-8000-000000000023','https://images.pexels.com/photos/6008071/pexels-photo-6008071.jpeg?auto=compress&cs=tinysrgb&w=1200',1),
('30000000-0000-4000-8000-000000000023','https://images.pexels.com/photos/1088158/pexels-photo-1088158.jpeg?auto=compress&cs=tinysrgb&w=1200',2),
-- OD-004 Bluestone Herringbone Paver
('30000000-0000-4000-8000-000000000024','https://images.pexels.com/photos/17366768/pexels-photo-17366768.jpeg?auto=compress&cs=tinysrgb&w=1200',0),
('30000000-0000-4000-8000-000000000024','https://images.pexels.com/photos/39009170/pexels-photo-39009170.jpeg?auto=compress&cs=tinysrgb&w=1200',1),
('30000000-0000-4000-8000-000000000024','https://images.pexels.com/photos/17366774/pexels-photo-17366774.jpeg?auto=compress&cs=tinysrgb&w=1200',2),
-- CM-004 Nero Marquina Grande
('30000000-0000-4000-8000-000000000025','https://images.pexels.com/photos/6788338/pexels-photo-6788338.jpeg?auto=compress&cs=tinysrgb&w=1200',0),
('30000000-0000-4000-8000-000000000025','https://images.pexels.com/photos/13722861/pexels-photo-13722861.jpeg?auto=compress&cs=tinysrgb&w=1200',1),
('30000000-0000-4000-8000-000000000025','https://images.pexels.com/photos/6538943/pexels-photo-6538943.jpeg?auto=compress&cs=tinysrgb&w=1200',2),
-- BT-005 Azul Moroccan Pattern
('30000000-0000-4000-8000-000000000026','https://images.pexels.com/photos/13246812/pexels-photo-13246812.jpeg?auto=compress&cs=tinysrgb&w=1200',0),
('30000000-0000-4000-8000-000000000026','https://images.pexels.com/photos/8135117/pexels-photo-8135117.jpeg?auto=compress&cs=tinysrgb&w=1200',1),
('30000000-0000-4000-8000-000000000026','https://images.pexels.com/photos/11161642/pexels-photo-11161642.jpeg?auto=compress&cs=tinysrgb&w=1200',2);

-- Size options for the large-format new tiles.
insert into public.product_variants (product_id, size, finish, color, price, stock_qty) values
('30000000-0000-4000-8000-000000000019','600x1200mm','polished','White-Grey',128.00,240),
('30000000-0000-4000-8000-000000000019','800x1600mm','polished','White-Grey',158.00,90),
('30000000-0000-4000-8000-000000000021','600x1200mm','matte','Beige',118.00,180),
('30000000-0000-4000-8000-000000000021','600x600mm','matte','Beige',104.00,320),
('30000000-0000-4000-8000-000000000025','800x1600mm','polished','Black',162.00,70),
('30000000-0000-4000-8000-000000000025','600x1200mm','polished','Black',148.00,150);

-- SPEC SHEET, ALL TILES
-- (sku, thickness_mm, tiles_per_box, water_absorption, pei, slip, suitable_for, highlights)
update public.products p set
  thickness_mm = s.thickness_mm,
  tiles_per_box = s.tiles_per_box,
  water_absorption = s.water_absorption,
  pei_rating = s.pei,
  slip_rating = s.slip,
  suitable_for = s.suitable_for,
  highlights = s.highlights
from (values
  ('BT-001', 8.0, 8,  '3-6%',      3, 'R10', array['floor','wall','wet_areas'],               array['Soft matte surface that hides water spots','Rectified edges for 2mm grout lines','Works on walls and floors']),
  ('BT-002', 9.0, 4,  'Below 0.5%',4, 'R9',  array['wall','wet_areas'],                       array['High-gloss glaze that reflects light','Stain resistant, wipes clean','Best on shower and feature walls']),
  ('BT-003', 8.0, 11, '3-6%',      3, 'R10', array['floor','wet_areas'],                      array['Warm satin finish, easy on bare feet','Small format suits sloped shower floors','Budget friendly']),
  ('KT-001', 9.0, 2,  'Below 0.5%',4, 'R11', array['floor','high_traffic'],                   array['Textured slate face with good grip','Hides crumbs and spills between cleans','Full-body GVT for long wear']),
  ('KT-002', 9.0, 4,  'Below 0.5%',4, 'R9',  array['floor','wall'],                           array['Terrazzo look without resin upkeep','Polished surface, easy to mop','Warm gold-beige chips']),
  ('KT-003', 7.0, 33, 'Over 10%',  null, null, array['wall'],                                 array['Classic 100x300 subway format','Glossy glaze wipes clean of oil splashes','Lay in brick, stack or herringbone']),
  ('LR-001', 9.0, 2,  'Below 0.5%',4, 'R9',  array['floor','wall'],                           array['Large 800x1600 slab, minimal grout','Book-matched Carrara veining','Mirror-polished finish']),
  ('LR-002', 9.0, 6,  'Below 0.5%',4, 'R10', array['floor'],                                  array['Real walnut grain print','Waterproof and termite proof','Plank format for a natural wood layout']),
  ('LR-003', 9.0, 2,  'Below 0.5%',4, 'R10', array['floor','wall','high_traffic'],            array['Industrial concrete look','Matte surface, no glare','Suits open-plan spaces']),
  ('BR-001', 8.0, 4,  '3-6%',      3, 'R10', array['floor'],                                  array['Blush sand tone warms a room','Satin finish, soft underfoot','Pairs well with light wood furniture']),
  ('BR-002', 9.0, 4,  'Below 0.5%',4, 'R10', array['floor'],                                  array['Soft-touch matte surface','Neutral grey goes with any decor','Low glare for restful rooms']),
  ('BR-003', 8.0, 8,  '3-6%',      3, 'R10', array['floor','wall'],                           array['Woven linen texture you can feel','Hides dust between cleans','Warm ivory tone']),
  ('OD-001', 12.0, 3, 'Below 0.5%',5, 'R12', array['floor','outdoor','wet_areas','high_traffic'], array['R12 anti-skid, safe when wet','12mm heavy-duty body','Frost and UV resistant']),
  ('OD-002', 20.0, 2, 'Below 0.5%',5, 'R11', array['floor','outdoor'],                        array['20mm paver, lays on gravel or sand','Sandstone texture with natural grip','Colour will not fade in sun']),
  ('OD-003', 12.0, 6, 'Below 0.5%',4, 'R11', array['floor','outdoor'],                        array['Slate look for decks and walkways','Grippy matte surface','Easy to hose clean']),
  ('CM-001', 10.0, 2, 'Below 0.5%',5, 'R10', array['floor','high_traffic'],                   array['PEI 5, built for heavy footfall','Scratch and chemical resistant','Large format, fewer joints to clean']),
  ('CM-002', 9.0, 3,  'Below 0.5%',4, 'R9',  array['floor','wall'],                           array['Deep black high-gloss glaze','Makes a lobby look premium','Pair with gold or brass fittings']),
  ('CM-003', 8.0, 4,  '3-6%',      4, 'R10', array['floor','high_traffic'],                   array['Bright warm white for shops and clinics','Satin finish hides scuffs','Economical for large areas']),
  ('BT-004', 9.0, 2,  'Below 0.5%',4, 'R9',  array['wall','floor'],                           array['Bold Statuario veining','600x1200 slab, fewer grout lines','Also available in 800x1600']),
  ('KT-004', 8.0, 100,'Over 10%',  null, null, array['wall','wet_areas'],                     array['Handmade zellige look','Each tile varies slightly in shade','Ideal kitchen or bar backsplash']),
  ('LR-004', 9.0, 2,  'Below 0.5%',4, 'R10', array['floor','wall'],                           array['Natural travertine texture, no sealing','Warm beige that suits Indian light','Also available in 600x600']),
  ('LR-005', 9.0, 8,  'Below 0.5%',4, 'R10', array['floor'],                                  array['Sized for herringbone and chevron','Honey-oak grain with no two planks alike','Waterproof, unlike real parquet']),
  ('BR-004', 9.0, 4,  'Below 0.5%',4, 'R10', array['floor','high_traffic'],                   array['Classic Venetian marble-chip pattern','Busy pattern hides dust','Matte, no glare']),
  ('OD-004', 20.0, 22,'Below 0.5%',5, 'R11', array['floor','outdoor','high_traffic'],         array['20mm porcelain, takes car traffic','Lay in herringbone or stretcher bond','Stays grippy in monsoon rain']),
  ('CM-004', 9.0, 2,  'Below 0.5%',4, 'R9',  array['wall','floor'],                           array['Nero Marquina black with white veins','Huge 800x1600 slab','Also available in 600x1200']),
  ('BT-005', 9.0, 25, '3-6%',      3, 'R10', array['floor','wall','wet_areas'],               array['Moroccan encaustic-style pattern','Tiles connect into a continuous design','Matte, safe on bathroom floors'])
) as s(sku, thickness_mm, tiles_per_box, water_absorption, pei, slip, suitable_for, highlights)
where p.sku = s.sku;

-- Coverage per box from the tile size (e.g. '600x1200mm') and box count.
update public.products set coverage_sqft = round(
  split_part(replace(size, 'mm', ''), 'x', 1)::numeric
  * split_part(replace(size, 'mm', ''), 'x', 2)::numeric
  * tiles_per_box / 92903.04, 2)
where tiles_per_box is not null and size ~ '^\d+x\d+mm$';

-- Longer descriptions for the original 18 tiles.
update public.products p set description = d.description
from (values
  ('BT-001','A soft matte white tile suited to serene, spa-like bathrooms. The low-sheen surface hides water spots and soap marks, so the room looks clean between wipes.'),
  ('BT-002','A glossy blue-grey tile that brings a calm, coastal feel. The reflective glaze bounces light around small bathrooms and makes them feel larger.'),
  ('BT-003','A warm beige satin-finish tile for a cosy bathroom feel. The compact 300x300 size follows the slope of a shower floor neatly.'),
  ('KT-001','A bold textured charcoal tile for statement kitchen floors. The slate-like face gives grip underfoot and keeps spills from showing.'),
  ('KT-002','A polished terrazzo-effect tile in warm gold-beige tones. You get the speckled terrazzo look without the grinding and resealing real terrazzo needs.'),
  ('KT-003','A classic glossy ivory subway tile for kitchen backsplashes. Oil and turmeric splashes wipe straight off the glaze.'),
  ('LR-001','A large-format polished tile replicating classic Carrara marble. At 800x1600 it covers a living room with very few grout lines, for a near seamless stone floor.'),
  ('LR-002','A wood-look plank tile in rich walnut brown. It gives the warmth of timber with none of the swelling, scratching or termite worries.'),
  ('LR-003','A large matte grey tile with an industrial concrete finish. It suits open-plan homes and pairs well with wood, black metal and plants.'),
  ('BR-001','A gentle sand-pink satin tile for a warm bedroom floor. The satin finish feels soft underfoot and does not glare in morning light.'),
  ('BR-002','A soft-touch light grey matte tile for quiet, calm rooms. A neutral base that works with almost any furniture or wall colour.'),
  ('BR-003','A textured ivory tile with a subtle woven-linen surface pattern. The texture adds interest up close while the room still reads as calm and light.'),
  ('OD-001','A dark grey anti-skid tile engineered for safe outdoor use. Its R12 surface keeps grip on wet balconies, ramps and pool surrounds.'),
  ('OD-002','A textured sandstone-look tile suited to terraces and patios. The 20mm body can be laid dry on gravel or sand as well as on mortar.'),
  ('OD-003','A durable slate-grey matte tile for decks and walkways. It takes daily foot traffic and hoses clean after rain.'),
  ('CM-001','A heavy-duty matte tile built for high-footfall commercial floors. With a PEI 5 rating it resists scratching from trolleys, chairs and grit.'),
  ('CM-002','A high-gloss black tile for premium commercial lobbies. Pair it with brass or gold fittings for a hotel-style entrance.'),
  ('CM-003','A satin warm-white tile for bright, welcoming commercial spaces. An economical choice for shops, clinics and offices that need a clean, light floor.')
) as d(sku, description)
where p.sku = d.sku;
