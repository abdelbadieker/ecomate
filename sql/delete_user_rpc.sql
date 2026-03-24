-- ═══════════════════════════════════════════════════════════
-- USER SELF-DELETION RPC
-- ═══════════════════════════════════════════════════════════

-- This function allows a user to delete their own account safely.
-- It is set as SECURITY DEFINER so it can access the auth schema.

CREATE OR REPLACE FUNCTION public.delete_user_self()
RETURNS void AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- 1. Get current user ID from auth.uid()
  current_user_id := auth.uid();

  -- 2. Verify we have a user
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- 3. Delete from public schema first (cascades usually handle this, but let's be safe)
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- 4. Delete from auth.users (This is the critical part)
  -- Note: This requires the function to be SECURITY DEFINER
  -- and for the 'service_role' to have permission, 
  -- or for us to use a trigger/secondary method if auth deletion is restricted.
  -- In Supabase, the best way for self-deletion is often a trigger on a 'deleted' flag 
  -- or a direct call if the role allows.
  
  -- For a simple startup implementation, we will use the 'delete user' approach.
  -- WARNING: Directly deleting from auth.users requires elevated permissions.
  -- An alternative is to just flag the profile and handle it via admin or trigger.
  
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
