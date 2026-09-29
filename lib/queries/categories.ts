import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type Category = Tables<'categories'>;

// Client-side image overrides, applied on top of whatever the database
// returns. This environment can only reach Supabase over HTTPS (its REST
// API), which has no write access to this table — the "real" fix lives in
// supabase/migrations/0008_kitchen_category_image.sql, but until that's run
// against the database directly, this ships the same photo immediately.
// Safe to leave in place afterwards too: it's a no-op once the DB matches.
const CATEGORY_IMAGE_OVERRIDES: Record<string, string> = {
  'kitchen-tiles':
    'https://images.unsplash.com/photo-1653427603096-54342daac941?w=800&q=80&fm=jpg&fit=crop&auto=format',
};

function withImageOverrides(categories: Category[]): Category[] {
  return categories.map((category) =>
    CATEGORY_IMAGE_OVERRIDES[category.slug]
      ? { ...category, image_url: CATEGORY_IMAGE_OVERRIDES[category.slug] }
      : category,
  );
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return withImageOverrides(data);
}

// Home page "Shop by room" display order — highest-appeal rooms lead, with
// Bathroom moved out of the top spot per client feedback. Any category not
// listed here (new rooms added later) falls back to alphabetical order and
// is appended after these.
const HOME_ROOM_ORDER = [
  'kitchen-tiles',
  'commercial-tiles',
  'bedroom-tiles',
  'outdoor-tiles',
  'living-room-tiles',
  'bathroom-tiles',
];

export function sortCategoriesForHome(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const indexA = HOME_ROOM_ORDER.indexOf(a.slug);
    const indexB = HOME_ROOM_ORDER.indexOf(b.slug);
    const rankA = indexA === -1 ? HOME_ROOM_ORDER.length : indexA;
    const rankB = indexB === -1 ? HOME_ROOM_ORDER.length : indexB;
    if (rankA !== rankB) return rankA - rankB;
    return a.name.localeCompare(b.name);
  });
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data ? withImageOverrides([data])[0] : null;
}
