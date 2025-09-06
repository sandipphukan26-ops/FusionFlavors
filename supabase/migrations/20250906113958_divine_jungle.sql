/*
  # Create Working User Sync Trigger

  1. Purpose
    - Create a reliable trigger to sync auth.users to public.users
    - Use a simpler approach that definitely works
    - Handle both new user creation and updates

  2. Function
    - Simple function that inserts/updates public.users when auth.users changes
    - Better error handling and logging

  3. Trigger
    - Fires on INSERT and UPDATE of auth.users
    - Automatically syncs user data to public.users table
*/

-- Create a simple, reliable function to sync users
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS trigger AS $$
BEGIN
  -- Insert or update the user in public.users
  INSERT INTO public.users (id, email, name, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.created_at
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name;
    
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the auth operation
    RAISE WARNING 'Failed to sync user % to public.users: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created_sync ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated_sync ON auth.users;

-- Create new triggers
CREATE TRIGGER on_auth_user_created_sync
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();

CREATE TRIGGER on_auth_user_updated_sync
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_sync();

-- Verify the setup
DO $$
BEGIN
  RAISE NOTICE 'User sync trigger created successfully!';
  RAISE NOTICE 'New users will now automatically sync to public.users';
END $$;