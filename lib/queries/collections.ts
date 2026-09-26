import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type Collection = Tables<'collections'>;

export async function getCollections(): Promise<Collection[]> {
  const { data, error } = await supabase.from('collections').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
