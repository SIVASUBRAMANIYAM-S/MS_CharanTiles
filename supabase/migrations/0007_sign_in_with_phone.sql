-- ============================================
-- CHARAN TILES — "sign in with phone" restores the account that owns it.
--
-- Every device starts on its own anonymous account, and profiles.phone is
-- unique. Before this, verifying a number could only *attach* it to the
-- current account, so a number already held by another account (a signed-out
-- or lost session, another device) failed with "already in use" and that
-- account's orders were unreachable.
--
-- sign_in_with_phone() moves the owning account's orders, enquiries, cart,
-- wishlist, name and saved address onto the caller's current account, then
-- transfers the number to it. To the user this behaves like signing back in.
--
-- SECURITY: the OTP step is still a client-side mock (lib/validation.ts), so
-- anyone who enters a number can claim that account's data. Replace it with
-- real SMS verification (Supabase phone auth) before launch, and only allow
-- this function after a server-verified OTP.
-- ============================================

create or replace function public.sign_in_with_phone(p_phone text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_owner uuid;
begin
  if v_me is null then
    raise exception 'Not signed in' using errcode = '28000';
  end if;
  if p_phone is null or p_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'Invalid phone number' using errcode = '22023';
  end if;

  -- Lock the owning row so two devices claiming the same number can't interleave.
  select id into v_owner from profiles where phone = p_phone and id <> v_me for update;

  if v_owner is not null then
    update orders set user_id = v_me where user_id = v_owner;
    update inquiries set user_id = v_me where user_id = v_owner;

    insert into wishlists (user_id, product_id, created_at)
      select v_me, product_id, created_at from wishlists where user_id = v_owner
      on conflict (user_id, product_id) do nothing;
    delete from wishlists where user_id = v_owner;

    -- The app keeps one cart line per product+variant, so fold matching lines together.
    update cart_items mine
      set quantity = mine.quantity + theirs.quantity
      from cart_items theirs
      where mine.user_id = v_me
        and theirs.user_id = v_owner
        and theirs.product_id = mine.product_id
        and theirs.variant_id is not distinct from mine.variant_id;
    delete from cart_items theirs
      where theirs.user_id = v_owner
        and exists (
          select 1 from cart_items mine
          where mine.user_id = v_me
            and mine.product_id = theirs.product_id
            and mine.variant_id is not distinct from theirs.variant_id
        );
    update cart_items set user_id = v_me where user_id = v_owner;

    -- Keep anything the current session already filled in; otherwise inherit it.
    update profiles me
      set full_name = coalesce(me.full_name, owner.full_name),
          default_address = coalesce(me.default_address, owner.default_address)
      from profiles owner
      where me.id = v_me and owner.id = v_owner;

    -- Release before claiming: profiles.phone is unique.
    update profiles set phone = null where id = v_owner;
  end if;

  update profiles set phone = p_phone where id = v_me;
  if not found then
    insert into profiles (id, phone) values (v_me, p_phone);
  end if;
end;
$$;

revoke all on function public.sign_in_with_phone(text) from public, anon;
grant execute on function public.sign_in_with_phone(text) to authenticated;
