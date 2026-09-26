-- ============================================
-- MS CHARAN TILES — POC SCHEMA
-- ============================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  full_name text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  application text not null check (application in ('bathroom','kitchen','living_room','bedroom','outdoor','commercial')),
  image_url text,
  parent_id uuid references public.categories(id),
  created_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  hero_image_url text,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id),
  collection_id uuid references public.collections(id),
  description text,
  material text check (material in ('ceramic','vitrified','gvt','porcelain')),
  finish text,
  size text,
  color text,
  dominant_color_hex text,
  price numeric(10,2) not null,
  mrp numeric(10,2),
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock','low_stock','out_of_stock')),
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

create index products_category_idx on public.products(category_id);
create index products_collection_idx on public.products(collection_id);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text,
  finish text,
  color text,
  price numeric(10,2),
  stock_qty int not null default 0
);

create table public.wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status text not null default 'placed' check (status in ('placed','confirmed','shipped','delivered','cancelled')),
  total_amount numeric(10,2) not null,
  payment_status text not null default 'pending' check (payment_status in ('pending','paid','failed')),
  payment_id text,
  shipping_address jsonb not null,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  variant_id uuid references public.product_variants(id),
  quantity int not null,
  price_at_purchase numeric(10,2) not null
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null,
  phone text not null,
  email text,
  profession text check (profession in ('individual','architect','builder','other')),
  purpose text check (purpose in ('product_enquiry','catalogue','dealership','other')),
  product_id uuid references public.products(id),
  message text,
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.inquiries enable row level security;

create policy "public read categories" on public.categories for select using (true);
create policy "public read collections" on public.collections for select using (true);
create policy "public read products" on public.products for select using (true);
create policy "public read product_images" on public.product_images for select using (true);
create policy "public read product_variants" on public.product_variants for select using (true);

create policy "own profile read" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);
create policy "own profile insert" on public.profiles for insert with check (auth.uid() = id);

create policy "own wishlist" on public.wishlists for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cart" on public.cart_items for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own orders read" on public.orders for select using (auth.uid() = user_id);
create policy "own orders insert" on public.orders for insert with check (auth.uid() = user_id);

create policy "own order_items read" on public.order_items for select
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "own order_items insert" on public.order_items for insert
  with check (exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));

create policy "insert inquiry" on public.inquiries for insert with check (true);
create policy "own inquiries read" on public.inquiries for select using (auth.uid() = user_id);

insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false)
  on conflict (id) do nothing;

create policy "public read product images" on storage.objects for select
  using (bucket_id = 'product-images');

create policy "own avatar access" on storage.objects for all
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1])
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
