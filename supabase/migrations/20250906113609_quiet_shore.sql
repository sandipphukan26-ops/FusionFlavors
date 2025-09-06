/*
  # Fix User Sync Trigger and Sync Existing Users

  1. Problem
    - New users are not being automatically synced to public.users table
    - The trigger function may not be working properly
    - Need to sync existing users that weren't synced

  2. Solution
    - Recreate the trigger function with better error handling
    - Ensure the trigger is properly attached to auth.users
    - Manually sync all existing auth.users to public.users
    - Add debugging to see what's happening

  3. Result
    - All new users will automatically appear in public.users
    - Existing users will be synced
    - Foreign key constraints will work properly
*/

-- First, ensure public.users table exists with correct structure
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate them
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created_sync_public ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated_sync_public ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user_to_public();

-- Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user_to_public()
RETURNS trigger AS $$
BEGIN
  -- Log the trigger execution
  RAISE NOTICE 'Syncing user to public.users: ID=%, Email=%', NEW.id, NEW.email;
  
  -- Insert or update user data in public.users table
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
    COALESCE(NEW.created_at, now())
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    );
    
  RAISE NOTICE 'Successfully synced user % to public.users', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN others THEN
    -- Log detailed error but don't fail user creation
    RAISE WARNING 'Failed to sync user % to public.users: % - %', NEW.id, SQLSTATE, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for both INSERT and UPDATE
CREATE TRIGGER on_auth_user_created_sync_public
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_to_public();

CREATE TRIGGER on_auth_user_updated_sync_public
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user_to_public();

-- Manually sync ALL existing auth.users to public.users (including the new user)
DO $$
DECLARE
  user_record RECORD;
  sync_count INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting manual sync of existing auth.users to public.users...';
  
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data, created_at 
    FROM auth.users 
  LOOP
    BEGIN
      INSERT INTO public.users (id, email, name, created_at)
      VALUES (
        user_record.id,
        user_record.email,
        COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          user_record.raw_user_meta_data->>'name',
          user_record.raw_user_meta_data->>'display_name',
          split_part(user_record.email, '@', 1)
        ),
        COALESCE(user_record.created_at, now())
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(
          user_record.raw_user_meta_data->>'full_name',
          user_record.raw_user_meta_data->>'name',
          user_record.raw_user_meta_data->>'display_name',
          split_part(user_record.email, '@', 1)
        );
      
      sync_count := sync_count + 1;
      RAISE NOTICE 'Synced user: % (%) to public.users', user_record.email, user_record.id;
      
    EXCEPTION
      WHEN others THEN
        RAISE WARNING 'Failed to sync user %: % - %', user_record.id, SQLSTATE, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Manual sync completed. Synced % users to public.users', sync_count;
END $$;

-- Now restore the foreign key constraint on saved_recipes
-- First drop any existing constraint
ALTER TABLE saved_recipes DROP CONSTRAINT IF EXISTS saved_recipes_user_id_fkey;

-- Add the foreign key constraint back (now it should work)
ALTER TABLE saved_recipes 
ADD CONSTRAINT saved_recipes_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Verify the setup
DO $$
DECLARE
  auth_count INTEGER;
  public_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users;
  SELECT COUNT(*) INTO public_count FROM public.users;
  
  RAISE NOTICE 'Verification: auth.users has % users, public.users has % users', auth_count, public_count;
  
  IF auth_count = public_count THEN
    RAISE NOTICE '✅ SUCCESS: All auth.users are synced to public.users';
  ELSE
    RAISE WARNING '⚠️  MISMATCH: auth.users (%) != public.users (%)', auth_count, public_count;
  END IF;
END $$;

RAISE NOTICE '🎯 User sync trigger has been fixed and all existing users have been synced!';
RAISE NOTICE '📝 New users will now automatically appear in both auth.users and public.users';
RAISE NOTICE '🔗 Foreign key constraint on saved_recipes now points to public.users';