import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type Product = Tables<'products'>;
export type ProductImage = Tables<'product_images'>;
export type ProductVariant = Tables<'product_variants'>;
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

export async function getFeaturedProducts(limit = 10): Promise<ProductCardData[]> {
  const { data, error } = await productsQuery().eq('is_featured', true).limit(limit);
  if (error) throw error;
  return data;
}

export async function getProductsByIds(ids: string[]): Promise<ProductCardData[]> {
  if (ids.length === 0) return [];
  const { data, error } = await productsQuery().in('id', ids);
  if (error) throw error;
  return data;
}

export async function getProductsByCategory(
  categoryId: string,
  filters?: ProductFilters,
): Promise<ProductCardData[]> {
  const { data, error } = await withFilters(productsQuery().eq('category_id', categoryId), filters);
  if (error) throw error;
  return data;
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
  return data;
}

export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*, product_images(*), product_variants(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    product_images: [...data.product_images].sort((a, b) => a.sort_order - b.sort_order),
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
  return data;
}

export async function searchProducts(query: string): Promise<ProductCardData[]> {
  const term = query.trim();
  if (!term) return [];
  const { data, error } = await productsQuery()
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .limit(40);
  if (error) throw error;
  return data;
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
  return data;
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
