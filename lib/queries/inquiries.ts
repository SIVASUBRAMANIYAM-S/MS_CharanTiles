import { supabase } from '@/lib/supabase';

// Values allowed by the inquiries.profession / inquiries.purpose check constraints (Phase 2 schema).
export const PROFESSIONS = [
  { value: 'individual', label: 'Individual' },
  { value: 'architect', label: 'Architect' },
  { value: 'builder', label: 'Builder' },
  { value: 'other', label: 'Other' },
] as const;

export const PURPOSES = [
  { value: 'product_enquiry', label: 'Product enquiry' },
  { value: 'catalogue', label: 'Catalogue' },
  { value: 'dealership', label: 'Dealership' },
  { value: 'other', label: 'Other' },
] as const;

export type Profession = (typeof PROFESSIONS)[number]['value'];
export type Purpose = (typeof PURPOSES)[number]['value'];

export type NewInquiry = {
  userId: string | null;
  productId: string | null;
  name: string;
  phone: string;
  email: string;
  profession: Profession;
  purpose: Purpose;
  message: string;
};

/**
 * Insert-only: the "insert inquiry" RLS policy allows any insert, but reads are
 * limited to the owner, so this deliberately doesn't `.select()` the row back.
 */
export async function createInquiry(inquiry: NewInquiry): Promise<void> {
  const { error } = await supabase.from('inquiries').insert({
    user_id: inquiry.userId,
    product_id: inquiry.productId,
    name: inquiry.name.trim(),
    phone: inquiry.phone,
    email: inquiry.email.trim() || null,
    profession: inquiry.profession,
    purpose: inquiry.purpose,
    message: inquiry.message.trim() || null,
  });
  if (error) throw error;
}
