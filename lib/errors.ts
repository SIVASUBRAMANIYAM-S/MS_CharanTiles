/** Postgres foreign-key-violation code (e.g. a cart_items/wishlists row whose
 * user_id no longer exists in auth.users — the session outlived its user). */
export function isMissingUserError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === '23503'
  );
}
