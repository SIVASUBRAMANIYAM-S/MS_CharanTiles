import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type Product = Tables<'products'>;
export type ProductImage = Tables<'product_images'>;
export type ProductVariant = Tables<'product_variants'>;

// Client-side image overrides, applied on top of whatever the database
// returns. This environment can only reach Supabase over HTTPS (its REST
// API), which has no write access to this table — the "real" fix lives in
// supabase/migrations/0009_product_image_refresh.sql, but until that's run
// against the database directly, this ships the same photos immediately.
// Safe to leave in place afterwards too: it's a no-op once the DB matches.
// Keyed by product id, then by the sort_order slot to replace (0 = the
// image ProductCard shows; 1 = the second gallery photo). Only listed slots
// are overridden — e.g. Cloud Grey Soft Touch's slot 1 is left untouched.
const PRODUCT_IMAGE_OVERRIDES: Record<string, Record<number, string>> = {
  // KT-001 Charcoal Slate Textured — bold dark charcoal tile floor
  '30000000-0000-4000-8000-000000000004': {
    0: 'https://images.unsplash.com/photo-1595424073665-bf04f38d9c0b?w=1200&q=80&fm=jpg&fit=crop&auto=format',
  },
  // KT-002 Golden Terrazzo — warm-toned polished terrazzo pattern
  '30000000-0000-4000-8000-000000000005': {
    0: 'https://images.unsplash.com/photo-1771575521341-415ec739be67?w=1200&q=80&fm=jpg&fit=crop&auto=format',
  },
  // BR-001 Blush Sand Satin — warm sand-pink satin tile floor
  '30000000-0000-4000-8000-000000000010': {
    0: 'https://images.unsplash.com/photo-1547414857-c9f61632b250?w=1200&q=80&fm=jpg&fit=crop&auto=format',
  },
  // BR-002 Cloud Grey Soft Touch — first image only; second image kept
  '30000000-0000-4000-8000-000000000011': {
    0: 'https://images.unsplash.com/photo-1590884056072-0248bac7797e?w=1200&q=80&fm=jpg&fit=crop&auto=format',
  },
  // BR-003 Ivory Linen Weave — warm ivory woven-texture surface
  '30000000-0000-4000-8000-000000000012': {
    0: 'https://images.unsplash.com/photo-1783791995752-a25c91982e6f?w=1200&q=80&fm=jpg&fit=crop&auto=format',
  },
  // CM-001 Industrial Grey Heavy Duty — clean matte grey commercial floor
  '30000000-0000-4000-8000-000000000016': {
    0: 'https://images.unsplash.com/photo-1786933638319-10ebbb5b8661?w=1200&q=80&fm=jpg&fit=crop&crop=focalpoint&fp-y=0&fp-x=0.5&fp-z=1.8&auto=format',
  },
  // CM-003 Warm White Commercial — bright warm-white marble-look surface
  '30000000-0000-4000-8000-000000000018': {
    0: 'https://images.unsplash.com/photo-1694378060976-66ee61c4f427?w=1200&q=80&fm=jpg&fit=crop&auto=format',
  },
};

function withProductImageOverrides<
  Img extends { url: string; sort_order: number },
  P extends { id: string; product_images: Img[] },
>(products: P[]): P[] {
  return products.map((product) => {
    const overrides = PRODUCT_IMAGE_OVERRIDES[product.id];
    if (!overrides) return product;
    return {
      ...product,
      product_images: product.product_images.map((image) =>
        overrides[image.sort_order] !== undefined
          ? { ...image, url: overrides[image.sort_order] }
          : image,
      ),
    };
  });
}

export type ProductWithDetails = Product & {
  product_images: ProductImage[];
  product_variants: ProductVariant[];
};

/** The minimal fields ProductCard/ProductGrid actually render. Any wider result
 * (a full ProductCardData row, or find-tile's narrower color-match row) satisfies
 * this structurally, so callers don't need to reshape their data to fit. */
export type ProductCardFields = {
  id: string;
  name: string;
  price: number;
  mrp: number | null;
  stock_status: string;
  is_featured: boolean;
  product_images: Pick<ProductImage, 'url' | 'sort_order'>[];
  /** Optional: shown as a spec line on the card when the query selected them. */
  size?: string | null;
  finish?: string | null;
};

/** Shape returned by the list/search queries below — a product plus just enough
 * image data for ProductCard, matching the CARD_SELECT projection. */
export type ProductCardData = Product & {
  product_images: Pick<ProductImage, 'url' | 'sort_order'>[];
};

export type SortOrder = 'featured' | 'price_asc' | 'price_desc';

export type ProductFilters = {
  finish?: string[];
  size?: string[];
  color?: string[];
  minPrice?: number;
  maxPrice?: number;
  sort?: SortOrder;
};

// list-view rows only need the card's own image, not the whole gallery.
const CARD_SELECT = '*, product_images(url, sort_order)';

function productsQuery() {
  return supabase.from('products').select(CARD_SELECT);
}

/** Applies FilterSheet's finish/size/color/price filters plus the chosen sort order. */
function withFilters(query: ReturnType<typeof productsQuery>, filters?: ProductFilters) {
  let next = query;
  if (filters?.finish?.length) next = next.in('finish', filters.finish);
  if (filters?.size?.length) next = next.in('size', filters.size);
  if (filters?.color?.length) next = next.in('color', filters.color);
  if (filters?.minPrice !== undefined) next = next.gte('price', filters.minPrice);
  if (filters?.maxPrice !== undefined) next = next.lte('price', filters.maxPrice);

  if (filters?.sort === 'price_asc') {
    return next.order('price', { ascending: true });
  }
  if (filters?.sort === 'price_desc') {
    return next.order('price', { ascending: false });
  }
  return next.order('is_featured', { ascending: false }).order('created_at', { ascending: false });
}

/** Newest featured tiles first; within a batch, the premium (pricier) ones lead. */
export async function getFeaturedProducts(limit = 40): Promise<ProductCardData[]> {
  const { data, error } = await productsQuery()
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .order('price', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return withProductImageOverrides(data);
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (ids.length === 0) return [];
  const { data, error } = await productsQuery().in('id', ids);
  if (error) throw error;
  return withProductImageOverrides(data);
}

export async function getProductsByCategory(
  categoryId: string,
  filters?: ProductFilters,
): Promise<ProductCardData[]> {
  const { data, error } = await withFilters(productsQuery().eq('category_id', categoryId), filters);
  if (error) throw error;
  return withProductImageOverrides(data);
}

export async function getProductsByCollection(
  collectionId: string,
  filters?: ProductFilters,
): Promise<ProductCardData[]> {
  const { data, error } = await withFilters(
    productsQuery().eq('collection_id', collectionId),
    filters,
  );
  if (error) throw error;
  return withProductImageOverrides(data);
}

export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const [withOverrides] = withProductImageOverrides([data]);
  return {
    ...withOverrides,
    product_images: [...withOverrides.product_images].sort((a, b) => a.sort_order - b.sort_order),
  };
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  limit = 6,
): Promise<ProductCardData[]> {
  const { data, error } = await productsQuery()
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .limit(limit);
  if (error) throw error;
  return withProductImageOverrides(data);
}

export async function searchProducts(query: string): Promise<ProductCardData[]> {
  const term = query.trim();
  if (!term) return [];
  const { data, error } = await productsQuery()
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .limit(40);
  if (error) throw error;
  return withProductImageOverrides(data);
}

/** Slim shape used by find-tile's client-side color matching — still wide enough
 * to satisfy ProductCardFields so matches can render through the same ProductCard. */
export type ColorMatchCandidate = Pick<
  Product,
  'id' | 'name' | 'price' | 'mrp' | 'stock_status' | 'is_featured' | 'dominant_color_hex'
> & {
  product_images: Pick<ProductImage, 'url' | 'sort_order'>[];
};

export async function getAllProductsForColorMatch(): Promise<ColorMatchCandidate[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      'id, name, price, mrp, stock_status, is_featured, dominant_color_hex, product_images(url, sort_order)',
    )
    .not('dominant_color_hex', 'is', null);
  if (error) throw error;
  return withProductImageOverrides(data);
}

export type FilterOptions = { finishes: string[]; sizes: string[]; colors: string[] };

function collectFilterOptions(
  rows: { finish: string | null; size: string | null; color: string | null }[],
): FilterOptions {
  const finishes = new Set<string>();
  const sizes = new Set<string>();
  const colors = new Set<string>();
  for (const row of rows) {
    if (row.finish) finishes.add(row.finish);
    if (row.size) sizes.add(row.size);
    if (row.color) colors.add(row.color);
  }
  return {
    finishes: [...finishes].sort(),
    sizes: [...sizes].sort(),
    colors: [...colors].sort(),
  };
}

/** Distinct filter values available for a category's products, for FilterSheet. */
export async function getCategoryFilterOptions(categoryId: string): Promise<FilterOptions> {
  const { data, error } = await supabase
    .from('products')
    .select('finish, size, color')
    .eq('category_id', categoryId);
  if (error) throw error;
  return collectFilterOptions(data);
}

/** Distinct filter values available for a collection's products, for FilterSheet. */
export async function getCollectionFilterOptions(collectionId: string): Promise<FilterOptions> {
  const { data, error } = await supabase
    .from('products')
    .select('finish, size, color')
    .eq('collection_id', collectionId);
  if (error) throw error;
  return collectFilterOptions(data);
}
