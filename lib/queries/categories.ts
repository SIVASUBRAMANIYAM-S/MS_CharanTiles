import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type Category = Tables<'categories'>;

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name');
  if (error) throw error;
  return data;
}

// Home page "Shop by room" display order — highest-appeal rooms lead, with
// Bathroom moved out of the top spot per client feedback. Any category not
// listed here (new rooms added later) falls back to alphabetical order and
// is appended after these.
const HOME_ROOM_ORDER = [
  
  'kitchen-tiles',
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
  return data;
}
