-- CATEGORIES
insert into public.categories (id, name, slug, application, image_url) values
('10000000-0000-4000-8000-000000000001','Bathroom Tiles','bathroom-tiles','bathroom','https://placehold.co/400x300/8FA8B8/FFFFFF?text=Bathroom'),
('10000000-0000-4000-8000-000000000002','Kitchen Tiles','kitchen-tiles','kitchen','https://placehold.co/400x300/D4B896/1A1A1A?text=Kitchen'),
('10000000-0000-4000-8000-000000000003','Living Room Tiles','living-room-tiles','living_room','https://placehold.co/400x300/E5E3DF/1A1A1A?text=Living+Room'),
('10000000-0000-4000-8000-000000000004','Bedroom Tiles','bedroom-tiles','bedroom','https://placehold.co/400x300/D9C2B0/1A1A1A?text=Bedroom'),
('10000000-0000-4000-8000-000000000005','Outdoor Tiles','outdoor-tiles','outdoor','https://placehold.co/400x300/5C6670/FFFFFF?text=Outdoor'),
('10000000-0000-4000-8000-000000000006','Commercial Space Tiles','commercial-tiles','commercial','https://placehold.co/400x300/5A5A5C/FFFFFF?text=Commercial');

-- COLLECTIONS
insert into public.collections (id, name, slug, description, hero_image_url) values
('20000000-0000-4000-8000-000000000001','UrbanStone','urbanstone','Concrete-inspired tiles for a raw, contemporary look.','https://placehold.co/800x400/6B6B6B/FFFFFF?text=UrbanStone'),
('20000000-0000-4000-8000-000000000002','Marbello','marbello','Premium marble-effect tiles for a timeless, elegant finish.','https://placehold.co/800x400/E5E3DF/1A1A1A?text=Marbello'),
('20000000-0000-4000-8000-000000000003','TerraCraft','terracraft','Earthy, textured tiles inspired by natural stone and wood.','https://placehold.co/800x400/C9A876/1A1A1A?text=TerraCraft'),
('20000000-0000-4000-8000-000000000004','PureMatt','purematt','Minimalist matte-finish tiles for clean, modern spaces.','https://placehold.co/800x400/D3D3D0/1A1A1A?text=PureMatt');

-- PRODUCTS
insert into public.products (id, sku, name, slug, category_id, collection_id, description, material, finish, size, color, dominant_color_hex, price, mrp, stock_status, is_featured) values
('30000000-0000-4000-8000-000000000001','BT-001','Arctic Frost Matte','arctic-frost-matte','10000000-0000-4000-8000-000000000001',null,'A soft matte white tile suited to serene, spa-like bathrooms.','ceramic','matte','300x600mm','White','F5F5F0',45.00,55.00,'in_stock',true),
('30000000-0000-4000-8000-000000000002','BT-002','Ocean Mist Glossy','ocean-mist-glossy','10000000-0000-4000-8000-000000000001',null,'A glossy blue-grey tile that brings a calm, coastal feel.','vitrified','glossy','600x600mm','Blue-Grey','8FA8B8',68.00,78.00,'in_stock',false),
('30000000-0000-4000-8000-000000000003','BT-003','Pearl Beige Soft','pearl-beige-soft','10000000-0000-4000-8000-000000000001',null,'A warm beige satin-finish tile for a cosy bathroom feel.','ceramic','satin','300x300mm','Beige','E8DCC8',38.00,45.00,'in_stock',false),
('30000000-0000-4000-8000-000000000004','KT-001','Charcoal Slate Textured','charcoal-slate-textured','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','A bold textured charcoal tile for statement kitchen floors.','gvt','textured','600x1200mm','Charcoal','3A3A3C',92.00,105.00,'in_stock',true),
('30000000-0000-4000-8000-000000000005','KT-002','Golden Terrazzo','golden-terrazzo','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003','A polished terrazzo-effect tile in warm gold-beige tones.','vitrified','polished','600x600mm','Gold-Beige','D4B896',78.00,88.00,'in_stock',false),
('30000000-0000-4000-8000-000000000006','KT-003','Ivory Subway Gloss','ivory-subway-gloss','10000000-0000-4000-8000-000000000002',null,'A classic glossy ivory subway tile for kitchen backsplashes.','ceramic','glossy','100x300mm','Ivory','F0EAD6',42.00,50.00,'in_stock',false),
('30000000-0000-4000-8000-000000000007','LR-001','Carrara Marble Polish','carrara-marble-polish','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','A large-format polished tile replicating classic Carrara marble.','vitrified','polished','800x1600mm','White-Grey','E5E3DF',145.00,165.00,'in_stock',true),
('30000000-0000-4000-8000-000000000008','LR-002','Walnut Wood Grain','walnut-wood-grain','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000003','A wood-look plank tile in rich walnut brown.','gvt','matte','200x1200mm','Brown','8B5A3C',88.00,98.00,'in_stock',false),
('30000000-0000-4000-8000-000000000009','LR-003','Graphite Concrete','graphite-concrete','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','A large matte grey tile with an industrial concrete finish.','vitrified','matte','600x1200mm','Grey','6B6B6B',95.00,108.00,'in_stock',false),
('30000000-0000-4000-8000-000000000010','BR-001','Blush Sand Satin','blush-sand-satin','10000000-0000-4000-8000-000000000004',null,'A gentle sand-pink satin tile for a warm bedroom floor.','ceramic','satin','600x600mm','Sand-Pink','D9C2B0',55.00,65.00,'in_stock',false),
('30000000-0000-4000-8000-000000000011','BR-002','Cloud Grey Soft Touch','cloud-grey-soft-touch','10000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000004','A soft-touch light grey matte tile for quiet, calm rooms.','vitrified','matte','600x600mm','Light-Grey','D3D3D0',62.00,72.00,'in_stock',true),
('30000000-0000-4000-8000-000000000012','BR-003','Ivory Linen Weave','ivory-linen-weave','10000000-0000-4000-8000-000000000004',null,'A textured ivory tile with a subtle woven-linen surface pattern.','ceramic','textured','300x600mm','Ivory','EFE8DA',48.00,56.00,'in_stock',false),
('30000000-0000-4000-8000-000000000013','OD-001','Granite Grip Anti-Skid','granite-grip-anti-skid','10000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000001','A dark grey anti-skid tile engineered for safe outdoor use.','vitrified','anti-skid matte','600x600mm','Dark-Grey','4A4A4A',72.00,82.00,'in_stock',true),
('30000000-0000-4000-8000-000000000014','OD-002','Sandstone Terrace','sandstone-terrace','10000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000003','A textured sandstone-look tile suited to terraces and patios.','gvt','textured','600x900mm','Sandstone','C9A876',85.00,95.00,'in_stock',false),
('30000000-0000-4000-8000-000000000015','OD-003','Slate Grey Deck','slate-grey-deck','10000000-0000-4000-8000-000000000005',null,'A durable slate-grey matte tile for decks and walkways.','vitrified','matte','300x600mm','Slate','5C6670',68.00,78.00,'in_stock',false),
('30000000-0000-4000-8000-000000000016','CM-001','Industrial Grey Heavy Duty','industrial-grey-heavy-duty','10000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000001','A heavy-duty matte tile built for high-footfall commercial floors.','vitrified','matte','600x1200mm','Industrial-Grey','5A5A5C',98.00,112.00,'in_stock',true),
('30000000-0000-4000-8000-000000000017','CM-002','Polished Black Onyx','polished-black-onyx','10000000-0000-4000-8000-000000000006',null,'A high-gloss black tile for premium commercial lobbies.','vitrified','high-gloss','800x800mm','Black','1C1C1E',135.00,150.00,'in_stock',false),
('30000000-0000-4000-8000-000000000018','CM-003','Warm White Commercial','warm-white-commercial','10000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000004','A satin warm-white tile for bright, welcoming commercial spaces.','ceramic','satin','600x600mm','Warm-White','EDEAE2',58.00,68.00,'in_stock',false);

-- PRODUCT IMAGES (2 per product: full tile view + room view)
insert into public.product_images (product_id, url, sort_order) values
('30000000-0000-4000-8000-000000000001','https://placehold.co/800x600/F5F5F0/1A1A1A?text=Arctic+Frost+Matte',0),
('30000000-0000-4000-8000-000000000001','https://placehold.co/800x600/F5F5F0/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000002','https://placehold.co/800x600/8FA8B8/FFFFFF?text=Ocean+Mist+Glossy',0),
('30000000-0000-4000-8000-000000000002','https://placehold.co/800x600/8FA8B8/FFFFFF?text=Room+View',1),
('30000000-0000-4000-8000-000000000003','https://placehold.co/800x600/E8DCC8/1A1A1A?text=Pearl+Beige+Soft',0),
('30000000-0000-4000-8000-000000000003','https://placehold.co/800x600/E8DCC8/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000004','https://placehold.co/800x600/3A3A3C/FFFFFF?text=Charcoal+Slate+Textured',0),
('30000000-0000-4000-8000-000000000004','https://placehold.co/800x600/3A3A3C/FFFFFF?text=Room+View',1),
('30000000-0000-4000-8000-000000000005','https://placehold.co/800x600/D4B896/1A1A1A?text=Golden+Terrazzo',0),
('30000000-0000-4000-8000-000000000005','https://placehold.co/800x600/D4B896/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000006','https://placehold.co/800x600/F0EAD6/1A1A1A?text=Ivory+Subway+Gloss',0),
('30000000-0000-4000-8000-000000000006','https://placehold.co/800x600/F0EAD6/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000007','https://placehold.co/800x600/E5E3DF/1A1A1A?text=Carrara+Marble+Polish',0),
('30000000-0000-4000-8000-000000000007','https://placehold.co/800x600/E5E3DF/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000008','https://placehold.co/800x600/8B5A3C/FFFFFF?text=Walnut+Wood+Grain',0),
('30000000-0000-4000-8000-000000000008','https://placehold.co/800x600/8B5A3C/FFFFFF?text=Room+View',1),
('30000000-0000-4000-8000-000000000009','https://placehold.co/800x600/6B6B6B/FFFFFF?text=Graphite+Concrete',0),
('30000000-0000-4000-8000-000000000009','https://placehold.co/800x600/6B6B6B/FFFFFF?text=Room+View',1),
('30000000-0000-4000-8000-000000000010','https://placehold.co/800x600/D9C2B0/1A1A1A?text=Blush+Sand+Satin',0),
('30000000-0000-4000-8000-000000000010','https://placehold.co/800x600/D9C2B0/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000011','https://placehold.co/800x600/D3D3D0/1A1A1A?text=Cloud+Grey+Soft+Touch',0),
('30000000-0000-4000-8000-000000000011','https://placehold.co/800x600/D3D3D0/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000012','https://placehold.co/800x600/EFE8DA/1A1A1A?text=Ivory+Linen+Weave',0),
('30000000-0000-4000-8000-000000000012','https://placehold.co/800x600/EFE8DA/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000013','https://placehold.co/800x600/4A4A4A/FFFFFF?text=Granite+Grip+Anti-Skid',0),
('30000000-0000-4000-8000-000000000013','https://placehold.co/800x600/4A4A4A/FFFFFF?text=Room+View',1),
('30000000-0000-4000-8000-000000000014','https://placehold.co/800x600/C9A876/1A1A1A?text=Sandstone+Terrace',0),
('30000000-0000-4000-8000-000000000014','https://placehold.co/800x600/C9A876/1A1A1A?text=Room+View',1),
('30000000-0000-4000-8000-000000000015','https://placehold.co/800x600/5C6670/FFFFFF?text=Slate+Grey+Deck',0),
('30000000-0000-4000-8000-000000000015','https://placehold.co/800x600/5C6670/FFFFFF?text=Room+View',1),
('30000000-0000-4000-8000-000000000016','https://placehold.co/800x600/5A5A5C/FFFFFF?text=Industrial+Grey+Heavy+Duty',0),
('30000000-0000-4000-8000-000000000016','https://placehold.co/800x600/5A5A5C/FFFFFF?text=Room+View',1),
('30000000-0000-4000-8000-000000000017','https://placehold.co/800x600/1C1C1E/FFFFFF?text=Polished+Black+Onyx',0),
('30000000-0000-4000-8000-000000000017','https://placehold.co/800x600/1C1C1E/FFFFFF?text=Room+View',1),
('30000000-0000-4000-8000-000000000018','https://placehold.co/800x600/EDEAE2/1A1A1A?text=Warm+White+Commercial',0),
('30000000-0000-4000-8000-000000000018','https://placehold.co/800x600/EDEAE2/1A1A1A?text=Room+View',1);

-- PRODUCT VARIANTS (demonstrates size/finish variation on two products)
insert into public.product_variants (product_id, size, finish, color, price, stock_qty) values
('30000000-0000-4000-8000-000000000001','600x600mm','matte','White',52.00,40),
('30000000-0000-4000-8000-000000000007','600x1200mm','polished','White-Grey',128.00,25);
